import { verify } from "hono/jwt";
import { env } from "hono/adapter";
import { Context, Next } from "hono";

type Variables = {
  user: {
    id: string;
  };
};
export default async function isUser(
  c: Context<{ Variables: Variables }>,
  next: Next
) {
  const { JWT_SECRET } = env<{ JWT_SECRET: string }>(c);
  const token = c.req.header("Authorization")?.split(" ")[1];
  if (!token) {
    return c.json({ msg: "Token not found, Kindly log in" }, 401);
  }

  try {
    const verified = (await verify(token, JWT_SECRET)) as Variables["user"];
    if (!verified) {
      console.error("Error : Invalid token");
      return c.json({ msg: "Invalid token" }, 401);
    }
    c.set("user", verified);
    await next();
  } catch (e) {
    console.error("Error", e instanceof Error ? e.message : e);
    return c.json({ msg: "Error encountered" }, 500);
  }
}
