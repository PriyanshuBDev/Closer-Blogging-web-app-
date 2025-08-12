import { Hono } from "hono";
import { userRouter } from "./routes/user";
import { blogRouter } from "./routes/blog";
import { cors } from "hono/cors";
import { profileRouter } from "./routes/profile";
import { notificationRouter } from "./routes/notification";
const app = new Hono();

app.use("/*", cors());
app.route("/api/v1/user", userRouter);
app.route("/api/v1/blog", blogRouter);
app.route("/api/v1/profile", profileRouter);
app.route("/api/v1/notification", notificationRouter);
export default app;
