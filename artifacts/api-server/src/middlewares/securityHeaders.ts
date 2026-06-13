import helmet from "helmet";

/**
 * Helmet Security Headers Configuration
 * 
 * Configures HTTP headers to protect against common web vulnerabilities.
 */
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    useDefaults: true,
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "blob:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false, // May break cross-origin resources if not configured carefully
  crossOriginResourcePolicy: { policy: "cross-origin" }, // Allows APIs to be accessed across origins
  dnsPrefetchControl: { allow: false },
  frameguard: { action: "deny" }, // Mitigates clickjacking
  hidePoweredBy: true, // Removes X-Powered-By header
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true,
  },
  ieNoOpen: true,
  noSniff: true, // Mitigates MIME type sniffing
  referrerPolicy: { policy: "strict-origin-when-cross-origin" },
  xssFilter: true, // Adds X-XSS-Protection header
});
