import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express, Request, Response, NextFunction } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
// Correct the import path for the storage instance
import { storage } from "./database-storage";
import { User as SelectUser } from "@shared/schema";

declare global {
  namespace Express {
    // Define Express.User based on your SelectUser type from Drizzle
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string): Promise<boolean> {
  try {
    const [hashed, salt] = stored.split(".");
    if (!hashed || !salt) {
      console.error("Invalid stored password format.");
      return false;
    }
    const hashedBuf = Buffer.from(hashed, "hex");
    const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
    if (hashedBuf.length !== suppliedBuf.length) {
        return false;
    }
    return timingSafeEqual(hashedBuf, suppliedBuf);
  } catch (error) {
    console.error("Error comparing passwords:", error);
    return false;
  }
}

export function setupAuth(app: Express): void {
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "bhutan-travel-secret-key-change-me", // Use a strong secret
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      maxAge: 7 * 24 * 60 * 60 * 1000, // 1 week
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: 'lax'
    }
  };

  if (process.env.NODE_ENV === "production") {
    app.set("trust proxy", 1);
  }

  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  // Configure Passport Local strategy
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        console.log(`[Auth] Attempting login for username: ${username}`);
        const user = await storage.getUserByUsername(username);
        if (!user) {
           console.log(`[Auth] User not found: ${username}`);
           // Provide generic message for security
           return done(null, false, { message: 'Incorrect username or password.' });
        }
        const passwordsMatch = await comparePasswords(password, user.password);
        if (!passwordsMatch) {
            console.log(`[Auth] Password mismatch for user: ${username}`);
             // Provide generic message for security
            return done(null, false, { message: 'Incorrect username or password.' });
        }
        console.log(`[Auth] Login successful for user: ${username}`);
        // Pass the full user object here; sanitization happens before sending responses
        return done(null, user);
      } catch (err) {
        console.error("[Auth] Error during LocalStrategy:", err);
        return done(err);
      }
    }),
  );

  // Serialize user ID into the session
  passport.serializeUser((user, done) => {
    // user here is the full user object from LocalStrategy's done callback
    done(null, (user as SelectUser).id);
  });

  // Deserialize user from the session using the ID
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      if (!user) {
        // User ID from session not found in DB (maybe deleted?)
        return done(null, false);
      }
       // Pass the *full* user object fetched from DB to done.
       // This object will be attached to req.user.
      done(null, user); // <--- CORRECTED: Pass the full user object
    } catch (err) {
      console.error("[Auth] Error during deserializeUser:", err);
      done(err);
    }
  });

  // --- API Routes ---

  app.post("/api/register", async (req: Request, res: Response, next: NextFunction) => {
    const { username, password } = req.body;
    // Basic validation (use Zod for robust validation)
    if (!username || typeof username !== 'string' || username.length < 3) {
      return res.status(400).json({ message: "Username must be at least 3 characters." });
    }
     if (!password || typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters." });
    }

    try {
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(409).json({ message: "Username already exists" }); // 409 Conflict
      }

      const hashedPassword = await hashPassword(password);
      // Create user in DB
      const newUser = await storage.createUser({
        username,
        password: hashedPassword,
      });

      // Log the user in after registration
      req.login(newUser, (err) => {
        if (err) {
            console.error("[Auth] Error logging in after registration:", err);
            // Don't expose internal errors, but signal failure
            return res.status(500).json({ message: "Registration successful, but login failed." });
            // return next(err); // Or pass to global handler
        }
        // Sanitize before sending response
        const { password: _, ...userWithoutPassword } = newUser;
        return res.status(201).json(userWithoutPassword);
      });
    } catch (err) {
      console.error("[Auth] Error during /api/register:", err);
      next(err); // Pass to global error handler
    }
  });

  // Login route using passport.authenticate middleware
  app.post("/api/login", (req: Request, res: Response, next: NextFunction) => {
      // Use custom callback to handle response
      passport.authenticate("local", (err: Error | null, user: Express.User | false | undefined, info: { message: string } | undefined) => {
          if (err) { return next(err); }
          if (!user) {
              // Use message from strategy if available
              return res.status(401).json({ message: info?.message || "Login failed." });
          }
          // Establish session
          req.logIn(user, (loginErr) => {
              if (loginErr) { return next(loginErr); }
              // Sanitize the user object *before* sending the response
              const { password: _, ...userWithoutPassword } = user;
              return res.status(200).json(userWithoutPassword);
          });
      })(req, res, next); // Call the middleware function
  });

  // Optional: Keep admin login separate if needed, otherwise remove
  app.post("/api/admin/login", (req: Request, res: Response, next: NextFunction) => {
      passport.authenticate("local", (err: Error | null, user: Express.User | false | undefined, info: { message: string } | undefined) => {
          if (err) { return next(err); }
          if (!user) { return res.status(401).json({ message: info?.message || "Login failed." }); }
          req.logIn(user, (loginErr) => {
              if (loginErr) { return next(loginErr); }
              // Sanitize before response
              const { password: _, ...userWithoutPassword } = user;
              return res.status(200).json(userWithoutPassword);
          });
      })(req, res, next);
  });


  app.post("/api/logout", (req: Request, res: Response, next: NextFunction) => {
    req.logout((err) => {
      if (err) {
        console.error("[Auth] Error during req.logout:", err);
        return next(err); // Pass error to allow potential handling
      }
      // Destroy the session
      req.session.destroy((destroyErr) => {
          if (destroyErr) {
              console.error("[Auth] Error destroying session:", destroyErr);
              // Even if session destroy fails, proceed with clearing cookie and sending success
              // because logout already happened conceptually.
          }
          // Important: Clear the cookie associated with the session
          res.clearCookie('connect.sid'); // Use the default session cookie name ('connect.sid') or your configured name
          res.status(200).json({ message: "Logout successful" });
      });
    });
  });

  // Endpoint to check current user session status
  app.get("/api/user", (req: Request, res: Response) => {
    // Check if user is authenticated and req.user exists
    if (!req.isAuthenticated() || !req.user) {
        // Return null for client-side checks, indicating no active session
        return res.status(200).json(null);
    }
    // Sanitize req.user (which came from deserializeUser and includes password)
    // before sending it to the client.
    const { password: _, ...userWithoutPassword } = req.user;
    res.status(200).json(userWithoutPassword); // <-- Send sanitized user
  });
}

// Middleware to verify if user is authenticated (can be used for any logged-in user)
export const verifyAuthenticated = (req: Request, res: Response, next: NextFunction): void => {
  if (req.isAuthenticated()) {
    return next();
  }
  // Return 401 for API routes if not authenticated
  res.status(401).json({ message: "Unauthorized: Authentication required." });
};

// Middleware specifically for Admin routes (add role check later if needed)
export const verifyAdmin = (req: Request, res: Response, next: NextFunction): void => {
  if (req.isAuthenticated()) {
     // --- TODO: Add role check if you implement roles ---
     // Example:
     // const user = req.user as SelectUser & { role?: string }; // Cast req.user
     // if (user && user.role === 'admin') {
         return next();
     // } else {
     //    // User is logged in but not an admin
     //    return res.status(403).json({ message: "Forbidden: Admin privileges required." });
     // }
  }
  // User is not even logged in
  res.status(401).json({ message: "Unauthorized: Authentication required." });
};