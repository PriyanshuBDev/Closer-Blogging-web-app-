import { Hono } from "hono";
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { env } from "hono/adapter";
import isUser from "../middlewares/isUser";
import { idSchema } from "pbdev-medium-common";

export const notificationRouter = new Hono();

notificationRouter.get("/get", isUser, async (c) => {
  const { DATABASE_URL } = env<{ DATABASE_URL: string }>(c);
  const prisma = new PrismaClient({
    datasourceUrl: DATABASE_URL,
  }).$extends(withAccelerate());
  try {
    const userId = c.get("user").id;
    const notifications = await prisma.notification.findMany({
      where: {
        receiverId: userId,
        isRead: false,
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        type: true,
        message: true,
        postId: true,
        sender: {
          select: {
            id: true,
            profile: {
              select: {
                imageUrl: true,
              },
            },
          },
        },
        isRead: true,
        createdAt: true,
      },
    });
    console.log("Successfully sent all the notifications");
    return c.json(
      {
        msg: "Successfully fetched all the notifications",
        notifications,
      },
      200
    );
  } catch (e) {
    console.error("Error:", e instanceof Error ? e.message : e);
    return c.json(
      {
        msg: "Error encountered while fetching notifications",
      },
      500
    );
  }
});

notificationRouter.put("/read/:id", isUser, async (c) => {
  const { DATABASE_URL } = env<{ DATABASE_URL: string }>(c);
  const prisma = new PrismaClient({
    datasourceUrl: DATABASE_URL,
  }).$extends(withAccelerate());
  try {
    const result = idSchema.safeParse(c.req.param("id"));
    if (!result.success) {
      return c.json(
        {
          msg: "Invalid notification id",
        },
        400
      );
    }
    const id = result.data;
    await prisma.notification.update({
      where: {
        id,
      },
      data: {
        isRead: true,
      },
    });
    console.log("Successfully marked the notification read");
    return c.json(
      {
        msg: "Successfully marked the notification read",
      },
      200
    );
  } catch (e) {
    console.error("Error:", e instanceof Error ? e.message : e);
    return c.json(
      {
        msg: "Error encountered while marking notification as read",
      },
      500
    );
  }
});

notificationRouter.put("/all", isUser, async (c) => {
  const { DATABASE_URL } = env<{ DATABASE_URL: string }>(c);
  const prisma = new PrismaClient({
    datasourceUrl: DATABASE_URL,
  }).$extends(withAccelerate());
  try {
    const receiverId = c.get("user").id;
    await prisma.notification.updateMany({
      where: {
        receiverId,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });
    console.log("Successfully marked all the notifications read");
    return c.json(
      {
        msg: "Successfully marked all the notifications read",
      },
      200
    );
  } catch (e) {
    console.error("Error:", e instanceof Error ? e.message : e);
    return c.json(
      {
        msg: "Error encountered while marking all notifications as read",
      },
      500
    );
  }
});

notificationRouter.get("/get/count", isUser, async (c) => {
  const { DATABASE_URL } = env<{ DATABASE_URL: string }>(c);
  const prisma = new PrismaClient({
    datasourceUrl: DATABASE_URL,
  }).$extends(withAccelerate());
  try {
    const receiverId = c.get("user").id;
    const count = await prisma.notification.count({
      where: {
        receiverId,
        isRead: false,
      },
    });
    return c.json(
      { msg: "Successfully counted the notifications", count },
      200
    );
  } catch (e) {
    console.error("Error:", e instanceof Error ? e.message : e);
    return c.json(
      { msg: "Error enocuntered while fetching notifications count" },
      500
    );
  }
});
