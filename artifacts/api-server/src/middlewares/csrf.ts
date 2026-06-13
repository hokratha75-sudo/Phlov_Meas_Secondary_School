import { doubleCsrf } from "csrf-csrf";
import { cookieConfig } from "../config/security.js";

// Ensure a secret is present in env, fallback only for development
const csrfSecret = process.env.CSRF_SECRET || "super-secret-csrf-key-change-me-in-production";

const {
  generateCsrfToken, // Use this in your routes to provide a CSRF hash cookie and token
  doubleCsrfProtection, // This is the default CSRF protection middleware
  invalidCsrfTokenError, // This is just for convenience if you plan on making your own middleware
} = doubleCsrf({
  getSecret: () => csrfSecret,
  getSessionIdentifier: (req) => req.cookies["session_id"] || "anonymous",
  cookieName: "x-csrf-token", // The name of the cookie to be used, recommend using Host prefix.
  cookieOptions: {
    ...cookieConfig,
    sameSite: cookieConfig.sameSite === "none" ? "none" : "lax", 
  },
  size: 64, // The size of the generated tokens in bits
  ignoredMethods: ["GET", "HEAD", "OPTIONS"], // A list of request methods that will not be protected.
  getCsrfTokenFromRequest: (req) => req.headers["x-csrf-token"] as string, // How the token is retrieved from the request
});

/**
 * Global CSRF Protection Middleware
 * Will check the x-csrf-token header against the x-csrf-token cookie for state-changing methods.
 */
export const csrfProtection = doubleCsrfProtection;

/**
 * Endpoint helper to attach the CSRF cookie and return the token to the client.
 */
export { generateCsrfToken };
