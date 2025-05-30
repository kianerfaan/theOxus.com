/**
 * theOxus - Main Server Entry Point
 * 
 * This file initializes the Express server, configures middleware, 
 * registers routes, and starts the HTTP server.
 * 
 * @license Apache-2.0
 */

import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./api/routes";
import { setupVite, serveStatic, log } from "./vite";
import { startBackgroundJobs } from "./services/backgroundJobs";

// Initialize Express application
const app = express();

// Configure middleware for JSON and URL-encoded data parsing
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

/**
 * Middleware for logging API requests and responses
 * Captures and logs:
 * - HTTP method
 * - Request path
 * - Status code
 * - Response time
 * - Response data (truncated if too long)
 */
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  // Intercept the res.json method to capture the response body
  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  // After the response is sent, log details of API requests
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      // Truncate long log lines for readability
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

/**
 * Self-executing async function to initialize the server
 * This pattern allows the use of await at the top level
 */
(async () => {
  // Register API routes and get the HTTP server instance
  const server = await registerRoutes(app);

  /**
   * Global error handling middleware
   * Catches any errors thrown in route handlers and returns a JSON response
   * with an appropriate status code and error message
   */
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err; // Re-throw for logging
  });

  // Configure environment-specific middleware
  if (app.get("env") === "development") {
    // In development mode, set up Vite for hot module replacement
    // This must happen after API routes to prevent route conflicts
    await setupVite(app, server);
  } else {
    // In production mode, serve static files from the build directory
    serveStatic(app);
  }

  // Start the HTTP server
  // Port 5000 is used for both API and client in this environment
  const port = 5000;
  server.listen({
    port,
    host: "0.0.0.0", // Listen on all network interfaces
    reusePort: true, // Allow port reuse for better load distribution
  }, () => {
    log(`serving on port ${port}`);
    
    // Start background jobs after server is running
    startBackgroundJobs();
  });
})();
