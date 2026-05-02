import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db, adminUsers } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();
const JWT_SECRET = process.env["SESSION_SECRET"] || "school-admin-secret-2024";

export function requireAuth(req: any, res: any, next: any) {
  const authHeader = req.headers["authorization"] as string | undefined;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { id: number; username: string };
    req.adminUser = payload;
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
}

router.post("/auth/login", async (req, res) => {
  const { username, password } = req.body as { username: string; password: string };
  if (!username || !password) {
    res.status(400).json({ error: "Username and password required" });
    return;
  }
  const [user] = await db.select().from(adminUsers).where(eq(adminUsers.username, username));
  if (!user) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }
  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }
  const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: "7d" });
  res.json({ token, user: { id: user.id, username: user.username, createdAt: user.createdAt.toISOString() } });
});

router.post("/auth/logout", (_req, res) => {
  res.json({ message: "Logged out" });
});

router.get("/auth/me", requireAuth, async (req: any, res) => {
  const [user] = await db.select().from(adminUsers).where(eq(adminUsers.id, req.adminUser.id));
  if (!user) { res.status(401).json({ error: "User not found" }); return; }
  res.json({ id: user.id, username: user.username, createdAt: user.createdAt.toISOString() });
});

export default router;
