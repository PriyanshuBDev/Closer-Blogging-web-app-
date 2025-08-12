import { Hono } from "hono";
import { Prisma, PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { env } from "hono/adapter";
import isUser from "../middlewares/isUser";
import { blogSchema, idSchema } from "pbdev-medium-common";

type Variables = {
  user: {
    id: string;
  };
};

export const blogRouter = new Hono<{ Variables: Variables }>();

blogRouter.post("/create", isUser, async (c) => {
  const { DATABASE_URL } = env<{ DATABASE_URL: string }>(c);
  const prisma = new PrismaClient({
    datasourceUrl: DATABASE_URL,
  }).$extends(withAccelerate());

  try {
    const user = c.get("user");
    const { title, content, published, tagsNames, imgUrl } = await c.req.json();
    const tags = await Promise.all(
      tagsNames.map((name: string) =>
        prisma.tag.upsert({
          where: { name },
          update: {},
          create: { name },
        })
      )
    );
    const response = await prisma.post.create({
      data: {
        title: title ?? "Untitled",
        content: content ?? "No content",
        published: published ?? false,
        authorId: user.id,
        imgUrl,
        tags: {
          connect: tags.map((tag) => ({ id: tag.id })),
        },
      },
      select: {
        id: true,
      },
    });
    return c.json(
      { msg: "Blog successfully created", blogId: response.id },
      201
    );
  } catch (e) {
    console.error("Error: ", e instanceof Error ? e.message : e);
    return c.json({ msg: "Error encountered during blog creation" }, 500);
  }
});

blogRouter.put("/update", isUser, async (c) => {
  const { DATABASE_URL } = env<{ DATABASE_URL: string }>(c);
  const prisma = new PrismaClient({
    datasourceUrl: DATABASE_URL,
  }).$extends(withAccelerate());
  try {
    const { title, content, published, id, tagsNames, imgUrl } =
      await c.req.json();
    const parsed = blogSchema.safeParse({ title, content, published });

    if (!parsed.success) {
      console.error("Title and content not found", parsed.error.flatten());
      return c.json(
        { msg: "Title and content are required", error: parsed.error.format() },
        400
      );
    }
    const tags = await Promise.all(
      tagsNames.map((name: string) => {
        return prisma.tag.upsert({
          where: { name },
          update: {},
          create: { name },
        });
      })
    );
    const response = await prisma.post.update({
      where: {
        id,
      },
      data: {
        title: title ?? "Untitled",
        content: content ?? "No content",
        published: published ?? false,
        imgUrl: imgUrl ?? "",
        tags: {
          set: [],
          connect: tags.map((tag) => ({ id: tag.id })),
        },
      },
    });
    return c.json(
      { msg: "Blog successfully updated", blogId: response.id },
      200
    );
  } catch (e) {
    console.error("Error: ", e instanceof Error ? e.message : e);
    return c.json({ msg: "Error encountered during updation blog " }, 500);
  }
});

blogRouter.get("/get/:id", isUser, async (c) => {
  const { DATABASE_URL } = env<{ DATABASE_URL: string }>(c);
  const prisma = new PrismaClient({
    datasourceUrl: DATABASE_URL,
  }).$extends(withAccelerate());
  try {
    const response = idSchema.safeParse(c.req.param("id"));
    if (!response.success) {
      console.error("Invalid Blog Id format");
      return c.json({ msg: "Invalid blog Id format" }, 400);
    }
    const postId = response.data;
    const userId = c.get("user").id;
    const post = await prisma.post.findUnique({
      where: {
        id: postId,
      },
      select: {
        title: true,
        content: true,
        id: true,
        createdAt: true,
        authorId: true,
        author: {
          select: {
            id: true,
            name: true,
            profile: {
              select: {
                imageUrl: true,
              },
            },
          },
        },
        imgUrl: true,
        tags: {
          select: { name: true },
        },
      },
    });

    if (!post) {
      console.error("Blog not found");
      return c.json({ msg: "Blog not found with the given id" }, 404);
    }

    const likeCount = await prisma.like.count({
      where: {
        postId,
      },
    });
    const comments = await prisma.comment.findMany({
      where: {
        postId,
      },
      take: 4,
      select: {
        id: true,
        comment: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            name: true,
            profile: {
              select: {
                imageUrl: true,
              },
            },
          },
        },
      },
    });
    const commentCount = comments.length;
    let followedBack = false;
    const followingId = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: userId,
          followingId: post.author.id,
        },
      },
      select: {
        followingId: true,
      },
    });

    if (followingId) {
      followedBack = true;
    }

    let hasLiked = false;
    const like = await prisma.like.findUnique({
      where: {
        userId_postId: {
          userId,
          postId,
        },
      },
    });
    if (like) {
      hasLiked = true;
    }
    let hasSaved = false;
    const saved = await prisma.savedPost.findUnique({
      where: {
        userId_postId: {
          userId,
          postId,
        },
      },
    });
    if (saved) {
      hasSaved = true;
    }
    const completePost = {
      ...post,
      likeCount,
      commentCount,
      comments,
      followedBack,
      hasSaved,
      hasLiked,
      himself: post.authorId === userId ? true : false,
    };
    return c.json({ msg: "Blog found successfully", completePost }, 200);
  } catch (e) {
    console.error("Error: ", e instanceof Error ? e.message : e);
    return c.json({ msg: "Error encountered while fetching of blog" }, 500);
  }
});

blogRouter.get("/bulk", isUser, async (c) => {
  const { DATABASE_URL } = env<{ DATABASE_URL: string }>(c);
  const prisma = new PrismaClient({
    datasourceUrl: DATABASE_URL,
  }).$extends(withAccelerate());
  const userId = c.get("user").id;
  const rawPage = Number(c.req.query("page") || 1);
  const page = !isNaN(rawPage) && rawPage > 0 ? rawPage : 1;
  const take = 10;
  const skip = (page - 1) * take;
  try {
    const posts = await prisma.post.findMany({
      orderBy: { createdAt: "desc" },
      where: {
        published: true,
      },
      skip,
      take,
      select: {
        id: true,
        title: true,
        content: true,
        createdAt: true,
        authorId: true,
        author: {
          select: {
            name: true,
            profile: {
              select: {
                imageUrl: true,
              },
            },
          },
        },
        imgUrl: true,
        tags: {
          select: { name: true },
        },
      },
    });
    if (posts.length === 0) {
      return c.json({ msg: "No blogs available", blogs: [] }, 404);
    }
    const total = await prisma.post.count({
      where: {
        published: true,
      },
    });

    const postIds = posts.map((post) => post.id);
    const authorIds = posts.map((post) => post.authorId);
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
    const [likedPosts, savedPosts, followed] = await Promise.all([
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
      prisma.follow.findMany({
        where: {
          followerId: userId,
          followingId: { in: authorIds },
        },
        select: {
          followingId: true,
        },
      }),
    ]);
    const likedSet = new Set(likedPosts.map((l) => l.postId));
    const savedPostSet = new Set(savedPosts.map((s) => s.postId));
    const followedSet = new Set(followed.map((f) => f.followingId));
    const completePost = posts.map((post) => ({
      ...post,
      likeCount: likesMap.get(post.id) || 0,
      commentCount: commentMap.get(post.id) || 0,
      hasLiked: likedSet.has(post.id),
      hasSaved: savedPostSet.has(post.id),
      followedBack: followedSet.has(post.authorId),
      himself: post.authorId === userId ? true : false,
    }));

    return c.json(
      {
        msg: "All blogs found",
        blogs: completePost,
        page,
        pageSize: take,
        total,
      },
      200
    );
  } catch (e) {
    console.error("Error:", e instanceof Error ? e.message : e);
    return c.json({ msg: "Error encountered while fetching all blogs" }, 500);
  }
});

blogRouter.get("/filter", isUser, async (c) => {
  const { DATABASE_URL } = env<{ DATABASE_URL: string }>(c);
  const prisma = new PrismaClient({
    datasourceUrl: DATABASE_URL,
  }).$extends(withAccelerate());
  const userId = c.get("user").id;
  const filter = c.req.query("filter");
  if (!filter || typeof filter !== "string") {
    return c.json({ msg: "Missing or invalid filter query" }, 400);
  }
  const rawPage = Number(c.req.query("page") || 1);
  const page = !isNaN(rawPage) && rawPage > 0 ? rawPage : 1;
  const take = 10;
  const skip = (page - 1) * take;
  const where: any = {
    published: true,
    title: {
      contains: filter,
      mode: "insensitive",
    },
  };
  try {
    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        skip,
        take,
        orderBy: { createdAt: "desc" },
        where,
        select: {
          id: true,
          title: true,
          content: true,
          createdAt: true,
          authorId: true,
          author: {
            select: {
              name: true,
              profile: {
                select: {
                  imageUrl: true,
                },
              },
            },
          },
          imgUrl: true,
          tags: {
            select: { name: true },
          },
        },
      }),
      prisma.post.count({
        where,
      }),
    ]);
    const postIds = posts.map((post) => post.id);
    const authorIds = posts.map((post) => post.authorId);
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
    const [likedPosts, savedPosts, followed] = await Promise.all([
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
      prisma.follow.findMany({
        where: {
          followerId: userId,
          followingId: { in: authorIds },
        },
        select: {
          followingId: true,
        },
      }),
    ]);
    const likedSet = new Set(likedPosts.map((l) => l.postId));
    const savedPostSet = new Set(savedPosts.map((s) => s.postId));
    const followedSet = new Set(followed.map((f) => f.followingId));
    const completePost = posts.map((post) => ({
      ...post,
      likeCount: likesMap.get(post.id) || 0,
      commentCount: commentMap.get(post.id) || 0,
      hasLiked: likedSet.has(post.id),
      hasSaved: savedPostSet.has(post.id),
      hasFollowed: followedSet.has(post.authorId),
      himself: post.authorId === userId ? true : false,
    }));
    if (posts.length === 0) {
      return c.json({ msg: "No blogs available", blogs: [], total: 0 }, 200);
    }
    return c.json(
      {
        msg: "All blogs found",
        blogs: completePost,
        page,
        pageSize: take,
        totalPage: Math.ceil(total / take),
        total,
      },
      200
    );
  } catch (e) {
    console.error("Error:", e instanceof Error ? e.message : e);
    return c.json(
      { msg: "Error encountered while fetching filtered blogs", total: 0 },
      500
    );
  }
});

blogRouter.get("/tags/trend", isUser, async (c) => {
  const { DATABASE_URL } = env<{ DATABASE_URL: string }>(c);
  const prisma = new PrismaClient({
    datasourceUrl: DATABASE_URL,
  }).$extends(withAccelerate());
  try {
    const allTags = await prisma.tag.findMany({
      include: {
        _count: {
          select: { posts: true },
        },
      },
    });
    const trendingTags = allTags
      .sort((a, b) => b._count.posts - a._count.posts)
      .slice(0, 15);
    return c.json(
      {
        msg: "Successfully found trending tags",
        trendingTags,
      },
      200
    );
  } catch (e) {
    console.error("Error:", e instanceof Error ? e.message : e);
    return c.json(
      {
        msg: "Error encountered while fetching trending tags",
      },
      500
    );
  }
});

blogRouter.get("/tags/filter", isUser, async (c) => {
  const { DATABASE_URL } = env<{ DATABASE_URL: string }>(c);
  const prisma = new PrismaClient({
    datasourceUrl: DATABASE_URL,
  }).$extends(withAccelerate());
  const userId = c.get("user").id;
  const filter = c.req.query("filter");
  if (!filter || typeof filter !== "string") {
    return c.json({ msg: "Missing or invalid filter query" }, 400);
  }
  const rawPage = Number(c.req.query("page") || 1);
  const page = !isNaN(rawPage) && rawPage > 0 ? rawPage : 1;
  const take = 10;
  const skip = (page - 1) * take;
  try {
    const posts = await prisma.post.findMany({
      where: {
        published: true,
        tags: {
          some: {
            name: filter,
          },
        },
      },
      skip,
      take,
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        title: true,
        content: true,
        createdAt: true,
        authorId: true,
        author: {
          select: {
            name: true,
            profile: {
              select: {
                imageUrl: true,
              },
            },
          },
        },
        imgUrl: true,
        tags: {
          select: { name: true },
        },
      },
    });
    const postIds = posts.map((post) => post.id);
    const authorIds = posts.map((post) => post.authorId);
    const [total, likeCounts, commentCounts] = await Promise.all([
      prisma.post.count({
        where: {
          published: true,
          tags: {
            some: {
              name: filter,
            },
          },
        },
      }),
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
    const [likedPosts, savedPosts, followed] = await Promise.all([
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
      prisma.follow.findMany({
        where: {
          followerId: userId,
          followingId: { in: authorIds },
        },
        select: {
          followingId: true,
        },
      }),
    ]);
    const likedSet = new Set(likedPosts.map((l) => l.postId));
    const savedPostSet = new Set(savedPosts.map((s) => s.postId));
    const followedSet = new Set(followed.map((f) => f.followingId));
    const completePost = posts.map((post) => ({
      ...post,
      likeCount: likesMap.get(post.id) || 0,
      commentCount: commentMap.get(post.id) || 0,
      hasLiked: likedSet.has(post.id),
      hasSaved: savedPostSet.has(post.id),
      hasFollowed: followedSet.has(post.authorId),
      himself: post.authorId === userId ? true : false,
    }));
    return c.json(
      {
        msg: "All blogs found",
        blogs: completePost,
        page,
        pageSize: take,
        totalPage: Math.ceil(total / take),
        total,
      },
      200
    );
  } catch (e) {
    console.error("Error:", e instanceof Error ? e.message : e);
    return c.json(
      {
        msg: "Error encountered while fetching filtered blogs by tag",
        total: 0,
      },
      500
    );
  }
});

blogRouter.get("/comments", isUser, async (c) => {
  const { DATABASE_URL } = env<{ DATABASE_URL: string }>(c);
  const prisma = new PrismaClient({
    datasourceUrl: DATABASE_URL,
  }).$extends(withAccelerate());
  try {
    const result = idSchema.safeParse(c.req.query("postId"));
    if (!result.success) {
      return c.json({ msg: "Invalid postId" }, 400);
    }
    const postId = result.data;
    const rawPage = Number(c.req.query("page") || 1);
    const page = !isNaN(rawPage) && rawPage > 0 ? rawPage : 1;
    const take = 10;
    const skip = (page - 1) * take;
    const comments = await prisma.comment.findMany({
      where: {
        postId,
      },
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take,
      select: {
        comment: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            name: true,
            profile: {
              select: {
                imageUrl: true,
              },
            },
          },
        },
      },
    });
    const total = await prisma.comment.count({ where: { postId } });
    return c.json(
      {
        msg: "All comments found successfully",
        comments,
        page,
        pageSize: take,
        totalPage: Math.ceil(total / take),
        total,
      },
      200
    );
  } catch (e) {
    console.error("Error:", e instanceof Error ? e.message : e);
    return c.json(
      {
        msg: "Error encountered while fetching comment",
        comments: [],
      },
      500
    );
  }
});

blogRouter.post("/comment/create/:postId", isUser, async (c) => {
  const { DATABASE_URL } = env<{ DATABASE_URL: string }>(c);
  const prisma = new PrismaClient({
    datasourceUrl: DATABASE_URL,
  }).$extends(withAccelerate());
  try {
    const { comment } = await c.req.json();
    const result = idSchema.safeParse(c.req.param("postId"));
    if (!result.success) {
      return c.json({ msg: "Invalid postId" }, 400);
    }
    const postId = result.data;
    const userId = c.get("user").id;

    const userComment = await prisma.comment.create({
      data: {
        comment,
        postId,
        userId,
      },
      select: {
        post: {
          select: {
            title: true,
            authorId: true,
          },
        },
        user: {
          select: {
            name: true,
          },
        },
      },
    });
    await prisma.notification.create({
      data: {
        type: "comment",
        message: `${userComment.user.name} commented on your post "${userComment.post.title}"`,
        postId,
        senderId: userId,
        receiverId: userComment.post.authorId,
      },
    });
    return c.json(
      {
        msg: "Successfully created comment",
      },
      201
    );
  } catch (e) {
    console.error("Error:", e instanceof Error ? e.message : e);
    return c.json({ msg: "Error encountered while creating comment" }, 500);
  }
});

// blogRouter.post("/saved/create", isUser, async (c) => {
//   const { DATABASE_URL } = env<{ DATABASE_URL: string }>(c);
//   const prisma = new PrismaClient({
//     datasourceUrl: DATABASE_URL,
//   }).$extends(withAccelerate());
//   try {
//     const userId = c.get("user").id;
//     const result = idSchema.safeParse(c.req.query("postId"));
//     if (!result.success) {
//       return c.json({ msg: "Invalid postId" }, 400);
//     }
//     const postId = result.data;
//     const savedPost = await prisma.savedPost.upsert({
//       where: {
//         userId_postId: {
//           userId,
//           postId,
//         },
//       },
//       update: {},
//       create: {
//         userId,
//         postId,
//       },
//       select: {
//         id: true,
//       },
//     });
//     return c.json({
//       msg: "Successfully post was saved",
//       savedPostId: savedPost,
//     });
//   } catch (e) {
//     if (
//       e instanceof Prisma.PrismaClientKnownRequestError &&
//       e.code === "P2002"
//     ) {
//       return c.json({ msg: "Post already liked" }, 400);
//     }
//     console.error("Error:", e instanceof Error ? e.message : e);
//     return c.json(
//       {
//         msg: "Error encountered while saving post",
//       },
//       500
//     );
//   }
// });

// blogRouter.delete("/saved/delete", isUser, async (c) => {
//   const { DATABASE_URL } = env<{ DATABASE_URL: string }>(c);
//   const prisma = new PrismaClient({
//     datasourceUrl: DATABASE_URL,
//   }).$extends(withAccelerate());
//   try {
//     const userId = c.get("user").id;
//     const result = idSchema.safeParse(c.req.query("postId"));
//     if (!result.success) {
//       return c.json({ msg: "Invalid postId" }, 400);
//     }
//     const postId = result.data;
//     await prisma.savedPost.delete({
//       where: {
//         userId_postId: {
//           userId,
//           postId,
//         },
//       },
//     });
//     return c.json({ msg: "Successfully unsaved the post" }, 200);
//   } catch (e) {
//     console.error("Error:", e instanceof Error ? e.message : e);
//     return c.json(
//       {
//         msg: "Error encountered while unsaving the post",
//       },
//       500
//     );
//   }
// });

blogRouter.post("/saved/toggle/:postId", isUser, async (c) => {
  const { DATABASE_URL } = env<{ DATABASE_URL: string }>(c);
  const prisma = new PrismaClient({
    datasourceUrl: DATABASE_URL,
  }).$extends(withAccelerate());
  try {
    const userId = c.get("user").id;
    const result = idSchema.safeParse(c.req.param("postId"));
    if (!result.success) {
      return c.json({ msg: "Invalid postId" }, 400);
    }
    const postId = result.data;
    const saveExist = await prisma.savedPost.findUnique({
      where: {
        userId_postId: {
          userId,
          postId,
        },
      },
    });
    if (!saveExist) {
      await prisma.savedPost.create({
        data: {
          userId,
          postId,
        },
      });
      return c.json(
        {
          msg: "Successfully post was saved",
        },
        201
      );
    }
    await prisma.savedPost.delete({
      where: {
        userId_postId: {
          userId,
          postId,
        },
      },
    });
    return c.json({ msg: "Successfully unsaved the post" }, 200);
  } catch (e) {
    console.error("Error:", e instanceof Error ? e.message : e);
    return c.json(
      {
        msg: "Error encountered while saving post",
      },
      500
    );
  }
});

blogRouter.get("/saved/get", isUser, async (c) => {
  const { DATABASE_URL } = env<{ DATABASE_URL: string }>(c);
  const prisma = new PrismaClient({
    datasourceUrl: DATABASE_URL,
  }).$extends(withAccelerate());
  const userId = c.get("user").id;
  try {
    const savedPosts = await prisma.savedPost.findMany({
      orderBy: {
        createdAt: "desc",
      },
      where: {
        userId,
      },
      select: {
        post: {
          select: {
            id: true,
            title: true,
            content: true,
            createdAt: true,
            authorId: true,
            author: {
              select: {
                name: true,
                profile: {
                  select: {
                    imageUrl: true,
                  },
                },
              },
            },
            imgUrl: true,
            tags: {
              select: { name: true },
            },
          },
        },
      },
    } as const);

    const postIds = savedPosts.map((saved) => saved.post.id);
    const authorIds = savedPosts.map((savedPost) => savedPost.post.authorId);
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
    const likedPosts = await prisma.like.findMany({
      where: {
        userId,
        postId: { in: postIds },
      },
      select: {
        postId: true,
      },
    });
    const followed = await prisma.follow.findMany({
      where: {
        followerId: userId,
        followingId: { in: authorIds },
      },
      select: {
        followingId: true,
      },
    });
    const likedSet = new Set(likedPosts.map((l) => l.postId));
    const posts = savedPosts.map((savedPost) => savedPost.post);
    const followedSet = new Set(followed.map((f) => f.followingId));
    const completePost = posts.map((post) => ({
      ...post,
      likeCount: likesMap.get(post.id) || 0,
      commentCount: commentMap.get(post.id) || 0,
      hasLiked: likedSet.has(post.id),
      hasFollowed: followedSet.has(post.authorId),
      himself: post.authorId === userId ? true : false,
      userId,
    }));
    const total = await prisma.savedPost.count({
      where: {
        userId,
      },
    });
    return c.json(
      {
        msg: "All blogs found",
        blogs: completePost,
        total,
      },
      200
    );
  } catch (e) {
    console.error("Error:", e instanceof Error ? e.message : e);
    return c.json({
      msg: "Error encountered while fetching saved posts",
    });
  }
});

// blogRouter.post("/like/create", isUser, async (c) => {
//   const { DATABASE_URL } = env<{ DATABASE_URL: string }>(c);
//   const prisma = new PrismaClient({
//     datasourceUrl: DATABASE_URL,
//   }).$extends(withAccelerate());
//   try {
//     const userId = c.get("user").id;
//     const result = idSchema.safeParse(c.req.query("postId"));
//     if (!result.success) {
//       return c.json({ msg: "Invalid postId" }, 400);
//     }
//     const postId = result.data;
//     await prisma.like.create({
//       data: {
//         postId,
//         userId,
//       },
//     });

//     return c.json(
//       {
//         msg: "Successfully liked the post",
//       },
//       200
//     );
//   } catch (e) {
//     if (
//       e instanceof Prisma.PrismaClientKnownRequestError &&
//       e.code === "P2002"
//     ) {
//       return c.json({ msg: "Post already liked" }, 400);
//     }
//     console.error("Error:", e instanceof Error ? e.message : e);
//     return c.json(
//       {
//         msg: "Error encountered while liking the post",
//       },
//       500
//     );
//   }
// });

// blogRouter.delete("/like/delete", isUser, async (c) => {
//   const { DATABASE_URL } = env<{ DATABASE_URL: string }>(c);
//   const prisma = new PrismaClient({
//     datasourceUrl: DATABASE_URL,
//   }).$extends(withAccelerate());
//   try {
//     const userId = c.get("user").id;
//     const result = idSchema.safeParse(c.req.query("postId"));
//     if (!result.success) {
//       return c.json({ msg: "Invalid postId" }, 400);
//     }
//     const postId = result.data;
//     await prisma.like.delete({
//       where: {
//         userId_postId: {
//           userId,
//           postId,
//         },
//       },
//     });
//     return c.json(
//       {
//         msg: "Successfully post was unliked",
//       },
//       200
//     );
//   } catch (e) {
//     if (
//       e instanceof Prisma.PrismaClientKnownRequestError &&
//       e.code === "P2025"
//     ) {
//       return c.json({ msg: "Post already unliked" }, 400);
//     }
//     console.error("Error:", e instanceof Error ? e.message : e);
//     return c.json(
//       {
//         msg: "Error encountered while unliking the post",
//       },
//       500
//     );
//   }
// });

blogRouter.post("/like/toggle/:postId", isUser, async (c) => {
  const { DATABASE_URL } = env<{ DATABASE_URL: string }>(c);
  const prisma = new PrismaClient({
    datasourceUrl: DATABASE_URL,
  }).$extends(withAccelerate());

  try {
    const userId = c.get("user").id;
    const result = idSchema.safeParse(c.req.param("postId"));
    if (!result.success) {
      return c.json({ msg: "Invalid postId" }, 400);
    }
    const postId = result.data;
    const likeExist = await prisma.like.findUnique({
      where: {
        userId_postId: {
          userId,
          postId,
        },
      },
    });
    if (!likeExist) {
      const user = await prisma.like.create({
        data: {
          postId,
          userId,
        },
        select: {
          user: {
            select: {
              name: true,
            },
          },
          post: {
            select: {
              authorId: true,
              title: true,
            },
          },
        },
      });
      await prisma.notification.create({
        data: {
          type: "like",
          message: `${user.user.name} liked your post "${user.post.title}"`,
          postId,
          senderId: userId,
          receiverId: user.post.authorId,
        },
      });

      return c.json(
        {
          msg: "Successfully liked the post",
        },
        200
      );
    }
    await prisma.like.delete({
      where: {
        userId_postId: {
          userId,
          postId,
        },
      },
    });
    return c.json(
      {
        msg: "Successfully post was unliked",
      },
      200
    );
  } catch (e) {
    console.error("Error:", e instanceof Error ? e.message : e);
    return c.json(
      {
        msg: "Error encountered while toggling like on post",
      },
      500
    );
  }
});

blogRouter.delete("/delete/:postId", isUser, async (c) => {
  const { DATABASE_URL } = env<{ DATABASE_URL: string }>(c);
  const prisma = new PrismaClient({
    datasourceUrl: DATABASE_URL,
  }).$extends(withAccelerate());
  try {
    const postId = c.req.param("postId");
    const userId = c.get("user").id;

    await prisma.post.delete({
      where: {
        id: postId,
        authorId: userId,
      },
    });
    console.log("Post was successfully deleted");
    return c.json({ msg: "Post was successfully deleted" });
  } catch (e) {
    console.log("Error:", e instanceof Error ? e.message : e);
    return c.json({ msg: "Error encountered while deleting the blog" }, 500);
  }
});

blogRouter.get("/draft", isUser, async (c) => {
  const { DATABASE_URL } = env<{ DATABASE_URL: string }>(c);
  const prisma = new PrismaClient({
    datasourceUrl: DATABASE_URL,
  }).$extends(withAccelerate());
  try {
    const userId = c.get("user").id;
    const res = await prisma.post.findMany({
      orderBy: { updatedAt: "desc" },
      where: {
        authorId: userId,
        published: false,
      },
      select: {
        id: true,
        title: true,
        content: true,
        authorId: true,
        imgUrl: true,
        tags: {
          select: {
            name: true,
          },
        },
        updatedAt: true,
      },
    });
    if (res.length === 0) {
      console.log("No drafts found", 404);
      return c.json({ msg: "No drafts were found", drafts: [] }, 200);
    }
    console.log("Successfully found all the drafts");
    return c.json(
      { msg: "Successfully found all the drafts", drafts: res },
      200
    );
  } catch (e) {
    console.error("Error:", e instanceof Error ? e.message : e);
    return c.json({ msg: "Error encountered while fetching drafts" });
  }
});

blogRouter.get("/draft/get/:postId", isUser, async (c) => {
  const { DATABASE_URL } = env<{ DATABASE_URL: string }>(c);
  const prisma = new PrismaClient({
    datasourceUrl: DATABASE_URL,
  }).$extends(withAccelerate());
  try {
    const postId = c.req.param("postId");
    const userId = c.get("user").id;
    const draft = await prisma.post.findUnique({
      where: {
        id: postId,
        authorId: userId,
        published: false,
      },
      select: {
        id: true,
        title: true,
        content: true,
        imgUrl: true,
        tags: {
          select: {
            name: true,
          },
        },
        updatedAt: true,
      },
    });
    console.log("Successfully found the draft");
    return c.json({ msg: "Successfully found the draft", draft }, 200);
  } catch (e) {
    console.error("Error:", e instanceof Error ? e.message : e);
    return c.json(
      {
        msg: "Error encountered while fetching the draft",
      },
      500
    );
  }
});

blogRouter.get("/followers/blogs", isUser, async (c) => {
  const { DATABASE_URL } = env<{ DATABASE_URL: string }>(c);
  const prisma = new PrismaClient({
    datasourceUrl: DATABASE_URL,
  }).$extends(withAccelerate());
  const userId = c.get("user").id;
  const rawPage = Number(c.req.query("page") || 1);
  const page = !isNaN(rawPage) && rawPage > 0 ? rawPage : 1;
  const take = 10;
  const skip = (page - 1) * take;
  try {
    const Followers = await prisma.follow.findMany({
      where: {
        followingId: userId,
      },
      select: {
        followerId: true,
      },
    });
    const followerIds = Followers.map((f) => f.followerId);
    if (followerIds.length === 0) {
      return c.json({ msg: "No blogs available", blogs: [], total: 0 }, 200);
    }

    const posts = await prisma.post.findMany({
      where: {
        authorId: { in: followerIds },
        published: true,
      },
      skip,
      take,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        content: true,
        createdAt: true,
        authorId: true,

        imgUrl: true,
        tags: {
          select: { name: true },
        },
        author: {
          select: {
            name: true,
            profile: {
              select: {
                imageUrl: true,
              },
            },
          },
        },
      },
    });
    const postIds = posts.map((post) => post.id);
    const total = await prisma.post.count({
      where: {
        authorId: {
          in: followerIds,
        },
      },
    });
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
    const [likedPosts, savedPosts, followed] = await Promise.all([
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
      prisma.follow.findMany({
        where: {
          followerId: userId,
          followingId: { in: followerIds },
        },
        select: {
          followingId: true,
        },
      }),
    ]);
    const likedSet = new Set(likedPosts.map((l) => l.postId));
    const savedPostSet = new Set(savedPosts.map((s) => s.postId));
    const followedSet = new Set(followed.map((f) => f.followingId));
    const completePost = posts.map((post) => ({
      ...post,
      likeCount: likesMap.get(post.id) || 0,
      commentCount: commentMap.get(post.id) || 0,
      hasLiked: likedSet.has(post.id),
      hasSaved: savedPostSet.has(post.id),
      followedBack: followedSet.has(post.authorId),
    }));

    if (completePost.length === 0) {
      return c.json({ msg: "No blogs available", blogs: [], total: 0 }, 200);
    }
    return c.json(
      {
        msg: "All followers blogs found",
        blogs: completePost,
        page,
        pageSize: take,
        totalPage: Math.ceil(total / take),
        total,
      },
      200
    );
  } catch (e) {
    console.error("Error:", e instanceof Error ? e.message : e);
    return c.json(
      { msg: "Error encountered while fetching followers blogs", total: 0 },
      500
    );
  }
});

blogRouter.get("/followings/blogs", isUser, async (c) => {
  const { DATABASE_URL } = env<{ DATABASE_URL: string }>(c);
  const prisma = new PrismaClient({
    datasourceUrl: DATABASE_URL,
  }).$extends(withAccelerate());
  const userId = c.get("user").id;
  const rawPage = Number(c.req.query("page") || 1);
  const page = !isNaN(rawPage) && rawPage > 0 ? rawPage : 1;
  const take = 10;
  const skip = (page - 1) * take;
  try {
    const Followings = await prisma.follow.findMany({
      where: {
        followerId: userId,
      },
      select: {
        followingId: true,
      },
    });
    const followingIds = Followings.map((f) => f.followingId);
    if (followingIds.length === 0) {
      return c.json({ msg: "No blogs available", blogs: [], total: 0 }, 200);
    }

    const posts = await prisma.post.findMany({
      where: {
        authorId: { in: followingIds },
        published: true,
      },
      skip,
      take,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        content: true,
        createdAt: true,
        authorId: true,

        imgUrl: true,
        tags: {
          select: { name: true },
        },
        author: {
          select: {
            name: true,
            profile: {
              select: {
                imageUrl: true,
              },
            },
          },
        },
      },
    });
    const postIds = posts.map((post) => post.id);
    const total = await prisma.post.count({
      where: {
        authorId: {
          in: followingIds,
        },
      },
    });
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
    const [likedPosts, savedPosts, followed] = await Promise.all([
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
      prisma.follow.findMany({
        where: {
          followerId: userId,
          followingId: { in: followingIds },
        },
        select: {
          followingId: true,
        },
      }),
    ]);
    const likedSet = new Set(likedPosts.map((l) => l.postId));
    const savedPostSet = new Set(savedPosts.map((s) => s.postId));
    const followedSet = new Set(followed.map((f) => f.followingId));
    const completePost = posts.map((post) => ({
      ...post,
      likeCount: likesMap.get(post.id) || 0,
      commentCount: commentMap.get(post.id) || 0,
      hasLiked: likedSet.has(post.id),
      hasSaved: savedPostSet.has(post.id),
      followedBack: followedSet.has(post.authorId),
    }));

    if (completePost.length === 0) {
      return c.json({ msg: "No blogs available", blogs: [], total: 0 }, 200);
    }
    return c.json(
      {
        msg: "All followings blogs found",
        blogs: completePost,
        page,
        pageSize: take,
        totalPage: Math.ceil(total / take),
        total,
      },
      200
    );
  } catch (e) {
    console.error("Error:", e instanceof Error ? e.message : e);
    return c.json(
      { msg: "Error encountered while fetching followings blogs", total: 0 },
      500
    );
  }
});
