import xss from "xss";
import jwt from "jsonwebtoken";
import { logger } from "../lib/logger.js";

/**
 * Context-aware input sanitization using xss.
 * Strips out malicious scripts from HTML or text input.
 */
export const sanitizeInput = (input: string | undefined | null): string => {
  if (!input) return "";
  return xss(input, {
    whiteList: {}, // Empty whitelist removes all HTML tags. Adjust if rich text is needed.
    stripIgnoreTag: true,
    stripIgnoreTagBody: ["script", "style"], // Remove script and style tags and their contents
  });
};

/**
 * Validates password strength.
 * Requires: >= 8 characters, at least 1 uppercase, 1 lowercase, 1 number, and 1 special character.
 */
export const validatePasswordStrength = (password: string): { isValid: boolean; message?: string } => {
  if (password.length < 8) {
    return { isValid: false, message: "Password must be at least 8 characters long." };
  }
  if (!/[A-Z]/.test(password)) {
    return { isValid: false, message: "Password must contain at least one uppercase letter." };
  }
  if (!/[a-z]/.test(password)) {
    return { isValid: false, message: "Password must contain at least one lowercase letter." };
  }
  if (!/[0-9]/.test(password)) {
    return { isValid: false, message: "Password must contain at least one number." };
  }
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return { isValid: false, message: "Password must contain at least one special character." };
  }
  return { isValid: true };
};

/**
 * JWT Configuration and Helper Functions
 */
const JWT_SECRET = process.env.JWT_SECRET || "fallback_super_secret_jwt_key_development_only";
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "fallback_refresh_secret_key_development_only";

export const generateTokens = (payload: object) => {
  const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: "15m" });
  const refreshToken = jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: "7d" });
  return { accessToken, refreshToken };
};

export const verifyAccessToken = (token: string) => {
  return jwt.verify(token, JWT_SECRET);
};

export const verifyRefreshToken = (token: string) => {
  return jwt.verify(token, JWT_REFRESH_SECRET);
};

/**
 * Audit Logging Helper
 * Use this to log security-relevant actions (logins, privilege escalations, etc.)
 */
export const auditLog = (userId: string | number, action: string, details: Record<string, any> = {}) => {
  logger.info({
    type: "AUDIT_LOG",
    userId,
    action,
    timestamp: new Date().toISOString(),
    ...details,
  }, `Audit: User ${userId} performed ${action}`);
};
