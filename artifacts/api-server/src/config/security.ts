import { CorsOptions } from "cors";

// Environment variables to be used in security configurations
const isProduction = process.env.NODE_ENV === "production";

/**
 * Strict CORS Configuration
 * Restricts cross-origin requests to only allowed domains.
 */
// Build allowed origins list dynamically
const productionOrigins: string[] = [];
if (process.env.FRONTEND_URL) productionOrigins.push(process.env.FRONTEND_URL);
if (process.env.ADMIN_URL) productionOrigins.push(process.env.ADMIN_URL);
// Fallback if no env vars set
if (productionOrigins.length === 0) {
  productionOrigins.push("https://yourdomain.com", "https://admin.yourdomain.com");
}

export const corsConfig: CorsOptions = {
  origin: isProduction 
    ? productionOrigins
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
 * In production with cross-origin (Vercel frontend + Railway backend),
 * sameSite must be "none" + secure:true for cookies to be sent cross-origin.
 */
export const cookieConfig = {
  httpOnly: true,
  secure: isProduction, // HTTPS only in production
  sameSite: (isProduction ? "none" : "lax") as "strict" | "lax" | "none",
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
