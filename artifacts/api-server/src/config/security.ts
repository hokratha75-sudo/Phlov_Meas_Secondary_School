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
    ? (origin, callback) => {
        // Allow requests with no origin (mobile apps, curl, etc.)
        if (!origin) return callback(null, true);
        // Allow if origin is in the explicit list
        if (productionOrigins.includes(origin)) return callback(null, true);
        // Allow any *.vercel.app subdomain
        if (origin.endsWith('.vercel.app')) return callback(null, true);
        // Allow any *.up.railway.app subdomain
        if (origin.endsWith('.up.railway.app')) return callback(null, true);
        console.warn(`[CORS] Blocked origin: ${origin}`);
        callback(new Error('Not allowed by CORS'));
      }
    : [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001"
      ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization", "x-csrf-token", "X-Requested-With", "Accept", "Origin"],
  preflightContinue: false,
  optionsSuccessStatus: 204,
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
