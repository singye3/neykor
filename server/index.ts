// server/index.ts
import express, { type Request, Response, NextFunction, urlencoded } from "express";
import { createServer } from "http"; // Import createServer
import { configureApiRouter } from "./routes";
import { setupAuth } from "./auth";
import { setupVite, serveStatic, log } from "./vite"; // Assuming these exist

const app = express();

app.use(express.json());
app.use(urlencoded({ extended: false }));

// --- Logging Middleware ---
app.use((req, res, next) => {
  const start = Date.now();
  // ... (logging implementation as before) ...
    res.on("finish", () => {
        const duration = Date.now() - start;
        if (req.path.startsWith("/api")) { // Log only API
            log(`${req.method} ${req.originalUrl} ${res.statusCode} in ${duration}ms`);
        }
    });
  next();
});

// --- Main Application Setup IIFE ---
(async () => {
  try {
    setupAuth(app);

    const apiRouter = configureApiRouter(); // Get the configured API router
    app.use('/api', apiRouter); // Mount all API routes under the /api base path

    app.use((err: any, req: Request, res: Response, next: NextFunction) => {
      console.error("Global Error Handler Caught:", err);
      const status = err.status || err.statusCode || 500;
      // Provide a generic message in production
      const message = app.get('env') === 'development' ? (err.message || "Unknown error") : "An unexpected error occurred.";
      // Ensure response is JSON
      if (!res.headersSent) {
          res.status(status).json({ message });
      } else {
         // If headers already sent, delegate to default Express handler
         next(err);
      }
    });

    // 4. Create HTTP Server (Needed for Vite HMR)
    const httpServer = createServer(app);

    // 5. Setup Vite Dev Server or Static File Serving (AFTER API routes and error handler)
    if (process.env.NODE_ENV === "development") {
      log("Setting up Vite Dev Server...");
      // Pass the httpServer instance for HMR
      await setupVite(app, httpServer);
    } else {
      log("Setting up static file serving...");
      serveStatic(app);
    }

    // --- Start Listening ---
    const port = process.env.PORT || 5000; // Use PORT from environment or default
    httpServer.listen(port, () => {
      log(`Server listening on http://localhost:${port}`);
    });

  } catch (error) {
      console.error("Failed to start server:", error);
      process.exit(1);
  }
})();