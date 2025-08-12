import { Hono } from "hono";
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { env } from "hono/adapter";
import isUser from "../middlewares/isUser";

export const profileRouter = new Hono();

profileRouter.get("/get", isUser, async (c) => {
  const { DATABASE_URL } = env<{ DATABASE_URL: string }>(c);
  const prisma = new PrismaClient({
    datasourceUrl: DATABASE_URL,
  }).$extends(withAccelerate());

  try {
    const userId = c.get("user").id;
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        name: true,
        createdAt: true,
        profile: {
          select: {
            bio: true,
            longBio: true,
            imageUrl: true,
          },
        },
      },
    });
    const followers = await prisma.follow.count({
      where: {
        followingId: userId,
      },
    });
    const following = await prisma.follow.count({
      where: {
        followerId: userId,
      },
    });
    const posts = await prisma.post.findMany({
      orderBy: { createdAt: "desc" },
      where: {
        published: true,
        authorId: userId,
      },
      select: {
        id: true,
        title: true,
        content: true,
        createdAt: true,
        imgUrl: true,
        tags: {
          select: { name: true },
        },
      },
    });
    if (posts.length === 0) {
      return c.json(
        {
          msg: "No blogs available",
          user: {
            ...user,
            followers,
            following,
          },
          blogs: [],
        },
        200
      );
    }

    const postIds = posts.map((post) => post.id);
    const [likeCounts, commentCounts] = await Promise.all([
      prisma.like.groupBy({
        by: ["postId"],
        where: { postId: { in: postIds } },
        _count: true,
      }) as unknown as { postId: string; _count: number }[],
      prisma.comment.groupBy({
        by: ["postId"],
        where: { postId: { in: postIds } },
        _count: true,
      }) as unknown as { postId: string; _count: number }[],
    ]);
    const likesMap = new Map(
      likeCounts.map((item) => [item.postId, item._count])
    );
    const commentMap = new Map(
      commentCounts.map((item) => [item.postId, item._count])
    );
    const [likedPosts, savedPosts] = await Promise.all([
      prisma.like.findMany({
        where: {
          userId,
          postId: { in: postIds },
        },
        select: {
          postId: true,
        },
      }),
      prisma.savedPost.findMany({
        where: {
          userId,
          postId: { in: postIds },
        },
        select: {
          postId: true,
        },
      }),
    ]);
    const likedSet = new Set(likedPosts.map((l) => l.postId));
    const savedPostSet = new Set(savedPosts.map((s) => s.postId));

    const completePost = posts.map((post) => ({
      ...post,
      likeCount: likesMap.get(post.id) || 0,
      commentCount: commentMap.get(post.id) || 0,
      hasLiked: likedSet.has(post.id),
      hasSaved: savedPostSet.has(post.id),
    }));

    return c.json(
      {
        msg: "All blogs and user details found",
        user: {
          ...user,
          followers,
          following,
        },
        blogs: completePost,
      },
      200
    );
  } catch (e) {
    console.error("Error:", e instanceof Error ? e.message : e);
    return c.json(
      {
        msg: "Error encountered while fetching your details",
      },
      500
    );
  }
});

profileRouter.get("/get/details", isUser, async (c) => {
  const { DATABASE_URL } = env<{ DATABASE_URL: string }>(c);
  const prisma = new PrismaClient({
    datasourceUrl: DATABASE_URL,
  }).$extends(withAccelerate());

  try {
    const userId = c.get("user").id;
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        name: true,
        profile: {
          select: {
            bio: true,
            longBio: true,
            imageUrl: true,
          },
        },
      },
    });
    return c.json(
      {
        msg: "User details found successfully",
        user,
      },
      200
    );
  } catch (e) {
    console.error("Error:", e instanceof Error ? e.message : e);
    return c.json(
      {
        msg: "Error encountered while fetching your details",
      },
      500
    );
  }
});

profileRouter.get("/specific/:userId", isUser, async (c) => {
  const { DATABASE_URL } = env<{ DATABASE_URL: string }>(c);
  const prisma = new PrismaClient({
    datasourceUrl: DATABASE_URL,
  }).$extends(withAccelerate());

  try {
    const CurrentUserId = c.get("user").id;
    const userId = c.req.param("userId");
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        name: true,
        createdAt: true,
        profile: {
          select: {
            bio: true,
            longBio: true,
            imageUrl: true,
          },
        },
      },
    });
    const followersCount = await prisma.follow.count({
      where: {
        followingId: userId,
      },
    });
    const followingCount = await prisma.follow.count({
      where: {
        followerId: userId,
      },
    });
    const posts = await prisma.post.findMany({
      orderBy: { createdAt: "desc" },
      where: {
        published: true,
        authorId: userId,
      },
      select: {
        id: true,
        title: true,
        content: true,
        createdAt: true,
        imgUrl: true,
        tags: {
          select: { name: true },
        },
      },
    });

    const postIds = posts.map((post) => post.id);
    const [likeCounts, commentCounts] = await Promise.all([
      prisma.like.groupBy({
        by: ["postId"],
        where: { postId: { in: postIds } },
        _count: true,
      }) as unknown as { postId: string; _count: number }[],
      prisma.comment.groupBy({
        by: ["postId"],
        where: { postId: { in: postIds } },
        _count: true,
      }) as unknown as { postId: string; _count: number }[],
    ]);
    const likesMap = new Map(
      likeCounts.map((item) => [item.postId, item._count])
    );
    const commentMap = new Map(
      commentCounts.map((item) => [item.postId, item._count])
    );
    const [likedPosts, savedPosts, followed, followers] = await Promise.all([
      prisma.like.findMany({
        where: {
          userId,
          postId: { in: postIds },
        },
        select: {
          postId: true,
        },
      }),
      prisma.savedPost.findMany({
        where: {
          userId,
          postId: { in: postIds },
        },
        select: {
          postId: true,
        },
      }),
      prisma.follow.findUnique({
        where: {
          followerId_followingId: {
            followerId: CurrentUserId,
            followingId: userId,
          },
        },
        select: {
          followingId: true,
        },
      }),
      prisma.follow.findMany({
        where: {
          followingId: userId,
        },
        take: 5,
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
      }),
    ]);
    const followerIds = followers.map((f) => f.follower.id);

    const hasFollowedTheFollowersIds = await prisma.follow.findMany({
      where: { followerId: CurrentUserId, followingId: { in: followerIds } },
      select: {
        followingId: true,
      },
    });

    const hasFollowedTheFollowersSet = new Set(
      hasFollowedTheFollowersIds.map((f) => f.followingId)
    );
    const followersFollowers = (await prisma.follow.groupBy({
      by: ["followingId"],
      where: {
        followingId: { in: followerIds },
      },
      _count: true,
    })) as { followingId: string; _count: number }[];
    const followersCountMap = new Map(
      followersFollowers.map((f) => [f.followingId, f._count])
    );
    const completeFollowers = followers.map((follower) => ({
      ...follower.follower,
      hasFollowed: hasFollowedTheFollowersSet.has(follower.follower.id),
      himself: follower.follower.id === CurrentUserId,
      followersCount: followersCountMap.get(follower.follower.id) || 0,
    }));
    const likedSet = new Set(likedPosts.map((l) => l.postId));
    const savedPostSet = new Set(savedPosts.map((s) => s.postId));

    const completePost = posts.map((post) => ({
      ...post,
      likeCount: likesMap.get(post.id) || 0,
      commentCount: commentMap.get(post.id) || 0,
      hasLiked: likedSet.has(post.id),
      hasSaved: savedPostSet.has(post.id),
    }));
    if (posts.length === 0) {
      return c.json(
        {
          msg: "No blogs available for the given user",
          user: {
            ...user,
            followersCount,
            followingCount,
            hasFollowed: userId === followed?.followingId ? true : false,
          },
          blogs: [],

          completeFollowers,
        },
        200
      );
    }

    return c.json(
      {
        msg: "All blogs and user details found",
        user: {
          ...user,
          followersCount,
          followingCount,
          hasFollowed: userId === followed?.followingId ? true : false,
        },
        blogs: completePost,

        completeFollowers,
      },
      200
    );
  } catch (e) {
    console.error("Error:", e instanceof Error ? e.message : e);
    return c.json(
      {
        msg: "Error encountered while fetching your details",
      },
      500
    );
  }
});

profileRouter.put("/update", isUser, async (c) => {
  const { DATABASE_URL } = env<{ DATABASE_URL: string }>(c);
  const prisma = new PrismaClient({
    datasourceUrl: DATABASE_URL,
  }).$extends(withAccelerate());
  try {
    const userId = c.get("user").id;
    const { bio, longBio, imageUrl, name } = await c.req.json();
    await prisma.profile.update({
      data: {
        bio,
        longBio,
        imageUrl,
      },
      where: {
        userId,
      },
    });
    await prisma.user.update({
      data: {
        name,
      },
      where: {
        id: userId,
      },
    });
    console.log("Successfully updates the profile");
    return c.json({ msg: "Successfully updated the profile" }, 200);
  } catch (e) {
    console.error("Error:", e instanceof Error ? e.message : e);
    return c.json(
      {
        msg: "Error encountered while creating the profile",
      },
      500
    );
  }
});

// profileRouter.post("/create", isUser, async (c) => {
//   const { DATABASE_URL } = env<{ DATABASE_URL: string }>(c);
//   const prisma = new PrismaClient({
//     datasourceUrl: DATABASE_URL,
//   }).$extends(withAccelerate());
//   try {
//     const userId = c.get("user").id;
//     const { bio, longBio, imageUrl } = await c.req.json();
//     await prisma.profile.create({
//       data: {
//         bio,
//         longBio,
//         imageUrl,
//         userId,
//       },
//     });
//     console.log("Successfully updates the profile");
//     return c.json({ msg: "Successfully updated the profile" }, 200);
//   } catch (e) {
//     console.error("Error:", e instanceof Error ? e.message : e);
//     return c.json(
//       {
//         msg: "Error encountered while creating the profile",
//       },
//       500
//     );
//   }
// });
