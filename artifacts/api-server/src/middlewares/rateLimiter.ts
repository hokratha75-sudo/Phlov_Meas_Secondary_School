import rateLimit from "express-rate-limit";
import { rateLimitConfig } from "../config/security.js";

/**
 * General application rate limiter
 * Protects against basic DDoS and brute-force attacks on general endpoints.
 */
export const globalRateLimiter = rateLimit(rateLimitConfig);

/**
 * Stricter rate limiter for authentication endpoints (login, register, forgot password)
 */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 requests per window
  message: {
    status: 429,
    message: "Too many authentication attempts, please try again later."
  },
  standardHeaders: true,
  legacyHeaders: false,
});
