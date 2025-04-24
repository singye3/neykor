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

// EXPORT this function
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

// Keep this function internal or export if needed elsewhere
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
    secret: process.env.SESSION_SECRET || "bhutan-travel-secret-key-change-me",
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      maxAge: 7 * 24 * 60 * 60 * 1000,
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

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user) {
           return done(null, false, { message: 'Incorrect username or password.' });
        }
        const passwordsMatch = await comparePasswords(password, user.password);
        if (!passwordsMatch) {
            return done(null, false, { message: 'Incorrect username or password.' });
        }
        // Pass full user object from DB to done
        return done(null, user);
      } catch (err) {
        console.error("[Auth] Error during LocalStrategy:", err);
        return done(err);
      }
    }),
  );

  passport.serializeUser((user, done) => {
    done(null, (user as SelectUser).id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      // Pass full user object from DB to done (will be attached to req.user)
      done(null, user || false); // Pass false if user not found
    } catch (err) {
      console.error("[Auth] Error during deserializeUser:", err);
      done(err);
    }
  });

} // End of setupAuth function

// Middleware to verify if user is authenticated
export const verifyAuthenticated = (req: Request, res: Response, next: NextFunction): void => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized: Authentication required." });
};

// Middleware specifically for Admin routes
export const verifyAdmin = (req: Request, res: Response, next: NextFunction): void => {
  if (req.isAuthenticated()) {
     return next();
  }
  res.status(401).json({ message: "Unauthorized: Authentication required." });
};
