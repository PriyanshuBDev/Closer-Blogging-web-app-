import { Hono } from "hono";
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { env } from "hono/adapter";
import bcrypt from "bcryptjs";
import { idSchema, userSchema } from "pbdev-medium-common";
import { sign } from "hono/jwt";
import isUser from "../middlewares/isUser";
export const userRouter = new Hono();

userRouter.post("/signup", async (c) => {
  const { DATABASE_URL, JWT_SECRET } = env<{
    JWT_SECRET: string;
    DATABASE_URL: string;
  }>(c);
  const prisma = new PrismaClient({
    datasourceUrl: DATABASE_URL,
  }).$extends(withAccelerate());
  try {
    const body = await c.req.json();
    const response = userSchema.safeParse(body);
    if (!response.success) {
      console.error("Input validation failed");
      return c.json(
        {
          msg: "Input validation failed",
        },
        400
      );
    }
    const userExist = await prisma.user.findUnique({
      where: { email: body.email },
    });
    if (userExist) {
      return c.json({ msg: "Username already exist" }, 409);
    }
    const hashedPassword = await bcrypt.hash(body.password, 10);
    const user = await prisma.user.create({
      data: {
        email: body.email,
        password: hashedPassword,
        name: body.name,
        profile: {
          create: {
            bio: "",
            imageUrl:
              "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y",
          },
        },
      },
      select: {
        id: true,
      },
    });
    const token = await sign({ id: user.id }, JWT_SECRET);
    return c.json({
      msg: "User created successfully",
      token,
    });
  } catch (e) {
    console.error("Error:", e instanceof Error ? e.message : e);
    return c.json(
      {
        msg: "Error encountered",
      },
      500
    );
  }
});

userRouter.post("/signin", async (c) => {
  const { DATABASE_URL, JWT_SECRET } = env<{
    JWT_SECRET: string;
    DATABASE_URL: string;
  }>(c);
  const prisma = new PrismaClient({
    datasourceUrl: DATABASE_URL,
  }).$extends(withAccelerate());
  try {
    const { email, password } = await c.req.json();
    const response = userSchema.safeParse({ email, password });
    if (!response.success) {
      console.log("Input validation failed");
      return c.json({ msg: "Input validation failed" }, 400);
    }
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      console.log("User not found");
      return c.json({ msg: "Invalid email and password" }, 403);
    }
    const token = await sign({ id: user.id }, JWT_SECRET);
    return c.json({ msg: "User succefully signed in", token }, 200);
  } catch (e) {
    console.error("Error:", e instanceof Error ? e.message : e);
    return c.json({ msg: "Error encountered" }, 500);
  }
});

userRouter.get("/avatar", isUser, async (c) => {
  const { DATABASE_URL } = env<{
    JWT_SECRET: string;
    DATABASE_URL: string;
  }>(c);
  const prisma = new PrismaClient({
    datasourceUrl: DATABASE_URL,
  }).$extends(withAccelerate());
  const user = c.get("user");
  try {
    const userAvatar = await prisma.user.findUnique({
      where: {
        id: user.id,
      },
      select: {
        profile: {
          select: {
            imageUrl: true,
          },
        },
      },
    });
    if (!userAvatar) {
      return c.json(
        {
          msg: "User not found",
        },
        404
      );
    }
    return c.json(
      {
        msg: "User detail found",
        userAvatar,
      },
      200
    );
  } catch (e) {
    console.error("Error:", e instanceof Error ? e.message : e);
    return c.json(
      {
        msg: "Error encountered while fetching user details",
      },
      400
    );
  }
});

type UserWithProfile = {
  id: string;
  name: string;
  profile: {
    bio: string;
    imageUrl: string | null;
  } | null;
};

userRouter.get("/bulk/filter", isUser, async (c) => {
  const { DATABASE_URL } = env<{ DATABASE_URL: string }>(c);
  const prisma = new PrismaClient({
    datasourceUrl: DATABASE_URL,
  }).$extends(withAccelerate());
  const filter = c.req.query("filter");
  if (!filter || typeof filter !== "string") {
    return c.json({ msg: "Missing or invalid filter query" }, 400);
  }
  const user = c.get("user").id;
  const page = Number(c.req.query("page") || 1);
  console.log("Filter:", filter, "Page:", page);

  const take = 10;
  const skip = (page - 1) * take;
  const where: any = {
    id: { not: user },
    name: {
      contains: filter,
      mode: "insensitive",
    },
  };
  try {
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        skip,
        take,
        orderBy: { name: "desc" },
        where,
        select: {
          id: true,
          name: true,
          profile: {
            select: {
              bio: true,
              imageUrl: true,
            },
          },
        },
      }) as unknown as UserWithProfile[],
      prisma.user.count({ where }),
    ]);

    if (!users || users.length === 0) {
      return c.json({ msg: "No users found", users: [], total: 0 }, 200);
    }

    const followerIds = users.map((u) => u.id);

    const followsBack = await prisma.follow.findMany({
      where: {
        followerId: user,
        followingId: { in: followerIds },
      },
      select: {
        followingId: true,
      },
    });
    const followedSet = new Set(followsBack.map((f) => f.followingId));
    const completeUsers = users.map((u) => ({
      id: u.id,
      name: u.name,
      bio: u.profile?.bio,
      imageUrl:
        u.profile?.imageUrl ??
        "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y",
      followedBack: followedSet.has(u.id),
      himself: u.id === user ? true : false,
    }));
    return c.json(
      {
        msg: "Users found successfully",
        users: completeUsers,
        page,
        pageSize: take,
        totalPages: Math.ceil(total / take),
        total,
      },
      200
    );
  } catch (e) {
    console.error("Error:", e instanceof Error ? e.message : e);
    return c.json({ msg: "Error encountered while finding users" }, 500);
  }
});

userRouter.post("/follow/:followingId", isUser, async (c) => {
  const { DATABASE_URL } = env<{ DATABASE_URL: string }>(c);
  const prisma = new PrismaClient({
    datasourceUrl: DATABASE_URL,
  }).$extends(withAccelerate());
  try {
    const result = idSchema.safeParse(c.req.param("followingId"));
    if (!result.success) {
      console.error("Invalid user id");
      return c.json({
        msg: "Invalid FollowingId",
      });
    }
    const followingId = result.data;
    const followerId = c.get("user").id;

    if (followerId === followingId) {
      return c.json({ msg: "You cannot follow yourself" }, 400);
    }
    const followExist = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId,
          followingId,
        },
      },
    });
    if (!followExist) {
      const follow = await prisma.follow.create({
        data: {
          followerId,
          followingId,
        },
        select: {
          follower: {
            select: {
              name: true,
            },
          },
        },
      });
      await prisma.notification.create({
        data: {
          type: "follow",
          message: `${follow.follower.name} started following you`,
          senderId: followerId,
          receiverId: followingId,
        },
      });
      return c.json({ msg: "Successfully followed the user" }, 201);
    }
    await prisma.follow.delete({
      where: {
        followerId_followingId: {
          followerId,
          followingId,
        },
      },
    });
    return c.json({ msg: "Successfully unfollowed the user" }, 200);
  } catch (e) {
    console.error("Error:", e instanceof Error ? e.message : e);
    return c.json(
      { msg: "Error encountered while following the another user" },
      500
    );
  }
});

userRouter.get("/follower/get/:userId", isUser, async (c) => {
  const { DATABASE_URL } = env<{ DATABASE_URL: string }>(c);
  const prisma = new PrismaClient({
    datasourceUrl: DATABASE_URL,
  }).$extends(withAccelerate());
  try {
    const currentUserId = c.get("user").id;
    const result = idSchema.safeParse(c.req.param("userId"));
    if (!result.success) {
      console.error("Invalid userId");
      return c.json({
        msg: "Invalid userId",
      });
    }
    const userId = result.data;
    const followers = await prisma.follow.findMany({
      where: {
        followingId: userId,
      },
      select: {
        follower: {
          select: {
            id: true,
            name: true,
            profile: {
              select: {
                imageUrl: true,
                bio: true,
              },
            },
          },
        },
      },
    });
    const followerIds = followers.map((f) => f.follower.id);

    const followsBack = await prisma.follow.findMany({
      where: {
        followerId: currentUserId,
        followingId: { in: followerIds },
      },
      select: {
        followingId: true,
      },
    });
    const followedSet = new Set(followsBack.map((f) => f.followingId));
    const users = followers.map((f) => ({
      id: f.follower.id,
      name: f.follower.name,
      imageUrl:
        f.follower.profile?.imageUrl ??
        "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y",
      bio: f.follower.profile?.bio,
      followedBack: followedSet.has(f.follower.id),
      himself: f.follower.id === currentUserId ? true : false,
    }));
    const total = await prisma.follow.count({
      where: {
        followingId: userId,
      },
    });
    return c.json(
      {
        msg: "Successfully found all the followers",
        users,
        total,
      },
      200
    );
  } catch (e) {
    console.error("Error:", e instanceof Error ? e.message : e);
    return c.json({ msg: "Error enocountered while fetching followers" }, 500);
  }
});

userRouter.get("following/get/:userId", isUser, async (c) => {
  const { DATABASE_URL } = env<{ DATABASE_URL: string }>(c);
  const prisma = new PrismaClient({
    datasourceUrl: DATABASE_URL,
  }).$extends(withAccelerate());
  try {
    const currentUserId = c.get("user").id;
    const result = idSchema.safeParse(c.req.param("userId"));
    if (!result.success) {
      console.error("Invalid userId");
      return c.json({
        msg: "Invalid userId",
      });
    }
    const userId = result.data;
    const followings = await prisma.follow.findMany({
      where: {
        followerId: userId,
      },
      select: {
        following: {
          select: {
            id: true,
            name: true,
            profile: {
              select: {
                imageUrl: true,
                bio: true,
              },
            },
          },
        },
      },
    });
    const followingIds = followings.map((f) => f.following.id);

    const followsBack = await prisma.follow.findMany({
      where: {
        followerId: currentUserId,
        followingId: { in: followingIds },
      },
      select: {
        followingId: true,
      },
    });
    const followedSet = new Set(followsBack.map((f) => f.followingId));
    const users = followings.map((f) => ({
      id: f.following.id,
      name: f.following.name,
      imageUrl:
        f.following.profile?.imageUrl ??
        "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y",
      bio: f.following.profile?.bio,
      followedBack: followedSet.has(f.following.id),
      himself: f.following.id === currentUserId ? true : false,
    }));
    const total = await prisma.follow.count({
      where: {
        followerId: userId,
      },
    });
    return c.json(
      {
        msg: "Successfully found all the followings",
        users,
        total,
      },
      200
    );
  } catch (e) {
    console.error("Error:", e instanceof Error ? e.message : e);
    return c.json({ msg: "Error encountered while fetching followings" });
  }
});

userRouter.get("/bulk/new", isUser, async (c) => {
  const { DATABASE_URL } = env<{ DATABASE_URL: string }>(c);
  const prisma = new PrismaClient({
    datasourceUrl: DATABASE_URL,
  }).$extends(withAccelerate());
  const user = c.get("user").id;
  try {
    const users = (await prisma.user.findMany({
      take: 5,
      where: {
        id: { not: user },
      },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        profile: {
          select: {
            bio: true,
            imageUrl: true,
          },
        },
      },
    })) as unknown as UserWithProfile[];

    if (!users || users.length === 0) {
      return c.json({ msg: "No users found", users: [], total: 0 }, 200);
    }

    const followerIds = users.map((u) => u.id);

    const followsBack = await prisma.follow.findMany({
      where: {
        followerId: user,
        followingId: { in: followerIds },
      },
      select: {
        followingId: true,
      },
    });
    const newUsersFollowers = (await prisma.follow.groupBy({
      by: ["followingId"],
      where: {
        followingId: { in: followerIds },
      },
      _count: true,
    })) as { followingId: string; _count: number }[];
    const followersCountMap = new Map(
      newUsersFollowers.map((f) => [f.followingId, f._count])
    );
    const followedSet = new Set(followsBack.map((f) => f.followingId));
    const completeUsers = users.map((u) => ({
      id: u.id,
      name: u.name,
      bio: u.profile?.bio,
      imageUrl:
        u.profile?.imageUrl ??
        "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y",
      followedBack: followedSet.has(u.id),
      followersCount: followersCountMap.get(u.id) || 0,
      himself: user === u.id ? true : false,
    }));
    return c.json(
      {
        msg: "Users found successfully",
        users: completeUsers,
      },
      200
    );
  } catch (e) {
    console.error("Error:", e instanceof Error ? e.message : e);
    return c.json({ msg: "Error encountered while finding users" }, 500);
  }
});
