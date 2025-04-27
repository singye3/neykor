// server/auth.ts

import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express, Request, Response, NextFunction } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./database-storage";
import { User as SelectUser } from "@shared/schema";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

export async function comparePassword(supplied: string, stored: string): Promise<boolean> {
  try {
    const [hashed, salt] = stored.split(".");
    if (!hashed || !salt) {
      console.error("Invalid stored password format (missing salt).");
      return false; // Cannot compare if format is wrong
    }
    const hashedBuf = Buffer.from(hashed, "hex");
    const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;

    if (hashedBuf.length !== suppliedBuf.length) {
        console.warn("Password buffer length mismatch during comparison.");
        return false;
    }
    return timingSafeEqual(hashedBuf, suppliedBuf);
  } catch (error) {
    console.error("Error comparing passwords:", error);
    return false; // Return false on any error during comparison
  }
}


export function setupAuth(app: Express): void {
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "bhutan-travel-secret-key-change-me", // Change this in production!
    resave: false, // Don't save session if unmodified
    saveUninitialized: false, // Don't create session until something stored
    store: storage.sessionStore, // Use the database-backed session store
    cookie: {
      maxAge: 1 * 24 * 60 * 60 * 1000, // Example: Session lasts 1 day
      secure: process.env.NODE_ENV === "production", // Use secure cookies in production
      httpOnly: true, // Prevent client-side JS access to cookie
      sameSite: 'lax' // Helps mitigate CSRF attacks
    }
  };

  if (process.env.NODE_ENV === "production") {
    app.set("trust proxy", 1); // Adjust number based on proxy count if needed
  }

  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user) {
           return done(null, false, { message: 'Incorrect username or password.' });
        }
        const passwordsMatch = await comparePassword(password, user.password);
        if (!passwordsMatch) {
            return done(null, false, { message: 'Incorrect username or password.' });
        }
        return done(null, user);
      } catch (err) {
        console.error("[Auth] Error during LocalStrategy verification:", err);
        return done(err); // Pass the error to Passport
      }
    }),
  );

  // --- Serialize User ---
  passport.serializeUser((user, done) => {
    // Assume user object has an 'id' property
    done(null, (user as SelectUser).id);
  });

  // --- Deserialize User ---
  passport.deserializeUser(async (id: number, done) => {
    try {
      // Fetch the user from storage using the ID from the session
      const user = await storage.getUser(id);
      // If user is found, pass it to done. If not found (e.g., deleted), pass false.
      done(null, user || false);
    } catch (err) {
      console.error("[Auth] Error during deserializeUser:", err);
      done(err); // Pass error to Passport
    }
  });

} // End of setupAuth function

// --- Middleware Functions ---
export const verifyAuthenticated = (req: Request, res: Response, next: NextFunction): void => {
  if (req.isAuthenticated()) {
    return next(); // User has an active session, proceed
  }
  // User is not authenticated
  res.status(401).json({ message: "Unauthorized: Authentication required." });
};

export const verifyAdmin = (req: Request, res: Response, next: NextFunction): void => {
  if (req.isAuthenticated()) {
     return next();
  }
  res.status(401).json({ message: "Unauthorized: Admin access required." });
};