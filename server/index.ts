// server/index.ts
import express, { type Request, Response, NextFunction, urlencoded } from "express"; // Added urlencoded import
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite"; // Assuming these helper functions exist

const app = express();

// --- Base Middleware ---
app.use(express.json()); // For parsing application/json
app.use(urlencoded({ extended: false })); // For parsing application/x-www-form-urlencoded

// --- Logging Middleware ---
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  // Capture JSON response for logging (optional)
  const originalResJson = res.json;
  res.json = function (bodyJson: Record<string, any>) { // Explicitly type bodyJson
    capturedJsonResponse = bodyJson;
    // @ts-ignore // Ignore potential type mismatch for apply arguments
    return originalResJson.apply(res, [bodyJson]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    // Log only API routes or as needed
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        // Limit logged response size if necessary
        let responseString = JSON.stringify(capturedJsonResponse);
        if (responseString.length > 500) { // Example limit
            responseString = responseString.substring(0, 500) + "...}";
        }
        logLine += ` :: ${responseString}`;
      }

      // Limit overall log line length
      if (logLine.length > 1000) { // Example limit
        logLine = logLine.slice(0, 999) + "…";
      }
      log(logLine); // Use your custom log function
    }
  });

  next(); // Proceed to next middleware/route
});


// --- Main Application Setup IIFE ---
(async () => {
  try {
    // Register all routes (API + ImageKit) and get the server instance
    const server = await registerRoutes(app);

    // --- Global Error Handling Middleware (Register AFTER routes) ---
    app.use((err: any, req: Request, res: Response, next: NextFunction) => { // Added req, next params
      console.error("Global Error Handler Caught:", err); // Log the full error
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";

      // Avoid sending detailed error messages in production
      const responseMessage = app.get('env') === 'development' ? message : "An unexpected error occurred.";

      res.status(status).json({ message: responseMessage });
      // No need to call next(err) here as this is the final error handler
    });

    // --- Vite Dev Server or Static File Serving ---
    // Setup Vite in development AFTER all API routes and error handlers are registered
    if (process.env.NODE_ENV === "development") { // Explicitly check NODE_ENV
      log("Setting up Vite Dev Server...");
      await setupVite(app, server); // Pass server instance if needed by setupVite
    } else {
      log("Setting up static file serving...");
      serveStatic(app); // Assuming this serves built frontend files
    }

    // --- Start Listening ---
    const port = 5000; // Use designated port
    server.listen({
      port,
      host: "0.0.0.0", // Listen on all available network interfaces
      reusePort: true, // Useful in some environments
    }, () => {
      log(`[express] server listening on http://localhost:${port} and http://<your-network-ip>:${port}`);
    });

  } catch (error) {
      console.error("Failed to start server:", error);
      process.exit(1); // Exit if server setup fails critically
  }
})();