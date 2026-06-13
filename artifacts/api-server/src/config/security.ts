import { CorsOptions } from "cors";

// Environment variables to be used in security configurations
const isProduction = process.env.NODE_ENV === "production";

/**
 * Strict CORS Configuration
 * Restricts cross-origin requests to only allowed domains.
 */
export const corsConfig: CorsOptions = {
  origin: isProduction 
    ? [process.env.FRONTEND_URL || "https://yourdomain.com", process.env.ADMIN_URL || "https://admin.yourdomain.com"]
    : [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001"
      ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization", "x-csrf-token"],
  exposedHeaders: ["x-csrf-token"]
};

/**
 * Cookie configuration for sessions and CSRF
 */
export const cookieConfig = {
  httpOnly: true,
  secure: isProduction, // HTTPS only in production
  sameSite: (isProduction ? "strict" : "lax") as "strict" | "lax" | "none", // mitigate CSRF
  path: "/",
};

/**
 * Rate Limiter Configuration Parameters
 */
export const rateLimitConfig = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isProduction ? 100 : 5000, // Limit each IP to 100 requests per `window` in prod, 5000 in dev
  message: {
    status: 429,
    message: "Too many requests from this IP, please try again after 15 minutes.",
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
};
