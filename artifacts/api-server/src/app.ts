import express, { type Express } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import pinoHttp from "pino-http";
import path from "path";
import { fileURLToPath } from "url";
import router from "./routes";
import { logger } from "./lib/logger";

// Security Middlewares
import { securityHeaders } from "./middlewares/securityHeaders";
import { corsConfig } from "./config/security";
import { globalRateLimiter } from "./middlewares/rateLimiter";
import { csrfProtection, generateCsrfToken } from "./middlewares/csrf";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
// 1. Security Headers
app.use(securityHeaders);

// 2. Rate Limiting
app.use(globalRateLimiter);

// 3. CORS configuration
app.use(cors(corsConfig));

// 4. Body parsers and Cookie parser
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 5. CSRF Protection
// Note: We bypass CSRF for /api/auth/login if needed, but doubleCsrf typically ignores GET/HEAD/OPTIONS.
// If you have specific webhooks or API routes from third parties, exclude them before this middleware.
app.use("/api", csrfProtection);

// CSRF Token generation endpoint
app.get("/api/csrf-token", (req, res) => {
  const token = generateCsrfToken(req, res);
  res.json({ csrfToken: token });
});

// Log every request for debugging
app.use((req, res, next) => {
  console.log(`[API] ${req.method} ${req.url}`);
  next();
});

// Serve uploaded files statically
const uploadDir = path.resolve(process.cwd(), "../uploads");
app.use("/uploads", express.static(uploadDir));

// Friendly root handler to direct developers/users to the correct frontend ports
app.get("/", (req, res) => {
  res.json({
    status: "healthy",
    message: "Phlov Meas Secondary School API Server is running!",
    applications: {
      "School Website": "http://localhost:3000",
      "Admin Portal": "http://localhost:3001"
    }
  });
});

app.use("/api", router);

export default app;
