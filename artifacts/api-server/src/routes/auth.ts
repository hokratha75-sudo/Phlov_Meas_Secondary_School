import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db, adminUsers, teachers } from "@workspace/db";
import { eq } from "drizzle-orm";
import { generateTokens, verifyRefreshToken, verifyAccessToken } from "../utils/securityFunctions.js";

const router = Router();
const JWT_SECRET = process.env["SESSION_SECRET"] || "school-admin-secret-2024";

export function requireAuth(req: any, res: any, next: any) {
  let token = req.cookies?.admin_token || null;
  if (!token) {
    const authHeader = req.headers["authorization"] as string | undefined;
    token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  }

  if (!token) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  try {
    const payload = verifyAccessToken(token) as { id: number; username: string; role: "admin" | "teacher" };
    req.adminUser = payload;
    next();
  } catch (err: any) {
    if (err.name === 'TokenExpiredError') {
      res.status(401).json({ error: "Token expired", code: "TOKEN_EXPIRED" });
    } else {
      res.status(401).json({ error: "Invalid token" });
    }
  }
}

/** Middleware: allow only admin role (backward compat: no role = admin) */
export function requireAdmin(req: any, res: any, next: any) {
  requireAuth(req, res, () => {
    const role = req.adminUser?.role;
    // If role is missing (old token) treat as admin for backward compat
    if (role && role !== "admin") {
      res.status(403).json({ error: "Admin access required" });
      return;
    }
    next();
  });
}

import { authRateLimiter } from "../middlewares/rateLimiter.js";

router.post("/auth/login", authRateLimiter, async (req, res) => {
  const { username, password } = req.body as { username: string; password: string };
  if (!username || !password) {
    res.status(400).json({ error: "Username and password required" });
    return;
  }

  // 1. Try admin table first
  const [adminUser] = await db.select().from(adminUsers).where(eq(adminUsers.username, username));
  if (adminUser) {
    const valid = await bcrypt.compare(password, adminUser.passwordHash);
    if (!valid) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }
    const { accessToken, refreshToken } = generateTokens({
      id: adminUser.id,
      username: adminUser.username,
      role: "admin",
    });

    res.cookie("admin_token", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 15 * 60 * 1000 // 15 mins
    });
    res.cookie("refresh_token", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/api/auth/refresh-token",
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.json({
      accessToken,
      user: {
        id: adminUser.id,
        username: adminUser.username,
        role: "admin",
        createdAt: adminUser.createdAt.toISOString(),
      },
    });
    return;
  }

  // 2. Try teacher table
  const [teacherUser] = await db
    .select()
    .from(teachers)
    .where(eq(teachers.username, username));

  if (!teacherUser || !teacherUser.username || !teacherUser.passwordHash) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }
  const valid = await bcrypt.compare(password, teacherUser.passwordHash);
  if (!valid) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }
  const { accessToken, refreshToken } = generateTokens({
    id: teacherUser.id,
    username: teacherUser.username,
    role: "teacher",
  });

  res.cookie("admin_token", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 15 * 60 * 1000 // 15 mins
  });
  res.cookie("refresh_token", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/api/auth/refresh-token",
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });

  res.json({
    accessToken,
    user: {
      id: teacherUser.id,
      username: teacherUser.username,
      role: "teacher",
      nameKh: teacherUser.nameKh,
      nameEn: teacherUser.nameEn,
      createdAt: teacherUser.createdAt.toISOString(),
    },
  });
});

router.post("/auth/logout", (_req, res) => {
  res.clearCookie("admin_token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax"
  });
  res.clearCookie("refresh_token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/api/auth/refresh-token"
  });
  res.json({ message: "Logged out" });
});

router.post("/auth/refresh-token", (req, res) => {
  const refreshToken = req.cookies?.refresh_token;
  if (!refreshToken) {
    res.status(401).json({ error: "Refresh token required" });
    return;
  }

  try {
    const payload = verifyRefreshToken(refreshToken) as { id: number; username: string; role: string };
    const { accessToken, refreshToken: newRefreshToken } = generateTokens({
      id: payload.id,
      username: payload.username,
      role: payload.role,
    });

    res.cookie("admin_token", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 15 * 60 * 1000
    });
    res.cookie("refresh_token", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/api/auth/refresh-token",
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.json({ accessToken });
  } catch (err) {
    res.status(401).json({ error: "Invalid refresh token" });
  }
});

router.get("/auth/me", requireAuth, async (req: any, res) => {
  const role = req.adminUser.role as "admin" | "teacher";
  if (role === "teacher") {
    const [t] = await db.select().from(teachers).where(eq(teachers.id, req.adminUser.id));
    if (!t) { res.status(401).json({ error: "User not found" }); return; }
    res.json({ id: t.id, username: t.username, role: "teacher", nameKh: t.nameKh, nameEn: t.nameEn, createdAt: t.createdAt.toISOString() });
  } else {
    const [u] = await db.select().from(adminUsers).where(eq(adminUsers.id, req.adminUser.id));
    if (!u) { res.status(401).json({ error: "User not found" }); return; }
    res.json({ id: u.id, username: u.username, role: "admin", createdAt: u.createdAt.toISOString() });
  }
});

export default router;
