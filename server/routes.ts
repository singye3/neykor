// server/routes.ts

import express, { Router, Request, Response, NextFunction } from "express";
import { storage } from "./database-storage";
// Import hashPassword and middleware from auth.ts
import { verifyAdmin, verifyAuthenticated, hashPassword } from "./auth";
import { z } from "zod";
import {
  insertInquirySchema,
  insertNewsletterSchema,
  insertContactSchema,
  upsertAboutPageContentSchema,
  insertTourSchema,
  insertTestimonialSchema
} from "@shared/schema";

// ImageKit Imports
import dotenv from 'dotenv';
import ImageKit from 'imagekit';
import type { FileObject as IKFileObject } from 'imagekit/dist/libs/interfaces';
import passport from "passport"; // Needed for authenticate

dotenv.config();

// Initialize ImageKit SDK
let imagekit: ImageKit | null = null;
if (process.env.IMAGEKIT_PUBLIC_KEY && process.env.IMAGEKIT_PRIVATE_KEY && process.env.IMAGEKIT_URL_ENDPOINT) {
    imagekit = new ImageKit({
        publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
        privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
        urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT
    });
    console.log("[ImageKit] SDK Initialized successfully.");
} else {
    console.warn("[ImageKit] SDK NOT initialized. Required environment variables missing!");
}


// --- Configure and Export API Router ---
export function configureApiRouter(): Router {
  const apiRouter = Router();

  // ==========================================
  // PUBLIC API ROUTES (Mounted on '/api' in index.ts)
  // ==========================================

  // --- ImageKit Carousel Images ---
  apiRouter.get("/carousel-images", async (req: Request, res: Response, next: NextFunction) => {
      if (!imagekit) return next(new Error('ImageKit service not configured...'));
      const folderPath = '/Tiger Nest/';
      try {
          const listResult = await imagekit.listFiles({ path: folderPath });
          const fileObjects = listResult.filter((item): item is IKFileObject => item.type === 'file');
          const images = fileObjects.map(file => ({ id: file.fileId, src: file.url, alt: file.name }));
          res.json(images);
      } catch (error) { console.error('[API /carousel-images] Error:', error); next(error); }
  });

  // --- About Page Content ---
 apiRouter.get("/content/about", async (req: Request, res: Response, next: NextFunction) => {
  try {
    let content = await storage.getAboutPageContent();
    if (!content) {
      console.warn("[API /content/about GET] No content found in DB, returning default structure.");
      content = { // Ensure this matches the AboutPageContent type structure
        id: 1,
        mainHeading: "Our Sacred Journey (Default)",
        imageUrl: "https://via.placeholder.com/600x400.png?text=Default+Image", // Placeholder
        imageAlt: "Default placeholder image",
        historyText: "Default history text. Please update in admin panel.",
        missionText: "Default mission text. Please update in admin panel.",
        philosophyHeading: "Our Philosophy (Default)",
        philosophyQuote: "Default philosophy quote. Please update in admin panel.",
        value1Title: "Value 1 (Default)", value1Text: "Default value 1 text.",
        value2Title: "Value 2 (Default)", value2Text: "Default value 2 text.",
        value3Title: "Value 3 (Default)", value3Text: "Default value 3 text.",
        updatedAt: new Date()
      };
    }
    res.json(content);
  } catch (error) {
    console.error("[API /content/about GET] Error:", error);
    next(error);
  }
});

  // --- Tours ---
  apiRouter.get("/tours", async (req: Request, res: Response, next: NextFunction) => {
      try { res.json(await storage.getTours()); } catch (error) { console.error("[API /tours GET] Error:", error); next(error); }
  });
  apiRouter.get("/tours/featured", async (req: Request, res: Response, next: NextFunction) => {
      try { res.json(await storage.getFeaturedTours()); } catch (error) { console.error("[API /tours/featured GET] Error:", error); next(error); }
  });
  apiRouter.get("/tours/:id", async (req: Request, res: Response, next: NextFunction) => {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) return res.status(400).json({ message: "Invalid tour ID format" });
      try {
          const tour = await storage.getTour(id);
          if (!tour) return res.status(404).json({ message: "Tour not found" });
          res.json(tour);
      } catch (error) { console.error(`[API /tours/${id} GET] Error:`, error); next(error); }
  });

  // --- Testimonials ---
  apiRouter.get("/testimonials", async (req: Request, res: Response, next: NextFunction) => {
    try {
       res.json(await storage.getTestimonials());
    } catch (error) {
       console.error("[API /testimonials GET] Error:", error);
       next(error);
    }
});

  // --- Gallery Images ---
  apiRouter.get("/gallery", async (req: Request, res: Response, next: NextFunction) => {
      try { res.json(await storage.getGalleryImages()); } catch (error) { console.error("[API /gallery GET] Error:", error); next(error); }
  });

  // --- Tour Inquiries ---
  apiRouter.post("/inquiries", async (req: Request, res: Response, next: NextFunction) => {
      try {
          const validatedData = insertInquirySchema.parse(req.body);
          const inquiry = await storage.createInquiry(validatedData);
          res.status(201).json(inquiry);
      } catch (error) {
          console.error("[API /inquiries POST] Error:", error);
          if (error instanceof z.ZodError) return res.status(400).json({ message: "Invalid inquiry data", errors: error.flatten().fieldErrors });
          if (error instanceof Error && error.message.includes("Tour with ID")) return res.status(400).json({ message: error.message });
          next(error);
      }
  });

  // --- Newsletter Subscription ---
  apiRouter.post("/newsletter", async (req: Request, res: Response, next: NextFunction) => {
       try {
          const validatedData = insertNewsletterSchema.parse(req.body);
          const subscriber = await storage.addNewsletterSubscriber(validatedData);
          res.status(201).json({ message: "Subscription successful.", email: subscriber.email });
      } catch (error: any) {
          console.error("[API /newsletter POST] Error:", error);
          if (error instanceof z.ZodError) return res.status(400).json({ message: "Invalid email format", errors: error.flatten().fieldErrors });
          if (error.code === '23505') return res.status(409).json({ message: "This email is already subscribed." });
          next(error);
      }
  });

  // --- Contact Form Submission ---
  apiRouter.post("/contact", async (req: Request, res: Response, next: NextFunction) => {
       try {
          const validatedData = insertContactSchema.parse(req.body);
          await storage.createContactMessage(validatedData); // Don't need to return the message content
          res.status(201).json({ message: "Message received successfully." });
      } catch (error) {
          console.error("[API /contact POST] Error:", error);
          if (error instanceof z.ZodError) return res.status(400).json({ message: "Invalid contact form data", errors: error.flatten().fieldErrors });
          next(error);
      }
  });

  // --- User Auth Routes (Session Check, Login, Register, Logout) ---
  apiRouter.get("/user", (req: Request, res: Response) => {
    if (!req.isAuthenticated() || !req.user) {
        return res.status(200).json(null);
    }
    const { password: _, ...userWithoutPassword } = req.user;
    res.status(200).json(userWithoutPassword);
  });

  apiRouter.post("/login", (req: Request, res: Response, next: NextFunction) => {
      passport.authenticate("local", { session: true }, (err: Error | null, user: Express.User | false | undefined, info: { message: string } | undefined) => {
          if (err) return next(err);
          if (!user) return res.status(401).json({ message: info?.message || "Login failed." });
          req.logIn(user, (loginErr) => {
              if (loginErr) return next(loginErr);
              const { password: _, ...userWithoutPassword } = user;
              return res.status(200).json(userWithoutPassword);
          });
      })(req, res, next);
  });

  apiRouter.post("/register", async (req: Request, res: Response, next: NextFunction) => {
       const { username, password } = req.body;
       if (!username || typeof username !== 'string' || username.length < 3) return res.status(400).json({ message: "Username must be at least 3 characters." });
       if (!password || typeof password !== 'string' || password.length < 6) return res.status(400).json({ message: "Password must be at least 6 characters." });
       try {
          const existingUser = await storage.getUserByUsername(username);
          if (existingUser) return res.status(409).json({ message: "Username already exists" });

          // Use the imported hashPassword function
          const hashedPassword = await hashPassword(password);

          const newUser = await storage.createUser({ username, password: hashedPassword });

          req.login(newUser, (err) => {
            if (err) {
                console.error("[API /register] Login after register failed:", err);
                return res.status(201).json({ message: "Registration successful, please log in." });
            }
            const { password: _, ...userWithoutPassword } = newUser;
            return res.status(201).json(userWithoutPassword);
          });
       } catch (err) {
           console.error("[API /register] Error:", err);
           next(err);
       }
  });

  apiRouter.post("/logout", (req: Request, res: Response, next: NextFunction) => {
      req.logout((err) => {
        if (err) return next(err);
        req.session.destroy((destroyErr) => {
            if (destroyErr) console.error("[API /logout] Error destroying session:", destroyErr);
            res.clearCookie('connect.sid');
            res.status(200).json({ message: "Logout successful" });
        });
      });
  });


  // ==========================================
  // ADMIN API ROUTES (Apply verifyAdmin middleware)
  // ==========================================

  // --- Admin Stats ---
  apiRouter.get("/admin/stats", verifyAdmin, async (req: Request, res: Response, next: NextFunction) => {
      try {
          const stats = await storage.getStats();
          const formattedStats = [
            { label: "Active Tours", value: stats.tours, icon: "✈️", link: "/admin/tours" },
            { label: "Unhandled Inquiries", value: stats.inquiries, icon: "✉️", link: "/admin/inquiries" },
            { label: "Unhandled Messages", value: stats.messages, icon: "💬", link: "/admin/messages" }
          ];
          res.json(formattedStats);
      } catch (error) {
          console.error("[API /admin/stats GET] Error:", error);
          next(error);
      }
  });

  // --- Admin Manage About Content ---
  apiRouter.patch("/content/about", verifyAdmin, async (req: Request, res: Response, next: NextFunction) => {
     try {
        const validatedData = upsertAboutPageContentSchema.parse(req.body);
        const updatedContent = await storage.updateAboutPageContent(validatedData);
        if (!updatedContent) return res.status(500).json({ message: "Failed to save about page content." });
        res.json(updatedContent);
    } catch (error) {
        console.error("[API /content/about PATCH] Error:", error);
        if (error instanceof z.ZodError) return res.status(400).json({ message: "Invalid data", errors: error.flatten().fieldErrors });
        next(error);
    }
  });

  // --- Admin Manage Tours ---
  apiRouter.post("/tours", verifyAdmin, async (req: Request, res: Response, next: NextFunction) => {
       try {
           // TODO: Add Zod validation
           res.status(201).json(await storage.createTour(req.body));
       } catch (error) {
           console.error("[API /tours POST (Admin)] Error:", error);
           next(error);
       }
  });
  apiRouter.patch("/tours/:id", verifyAdmin, async (req: Request, res: Response, next: NextFunction) => {
       const id = parseInt(req.params.id, 10);
       if (isNaN(id)) return res.status(400).json({ message: "Invalid tour ID format" });
       try {
           // TODO: Add Zod validation
           const updatedTour = await storage.updateTour(id, req.body);
           if (!updatedTour) return res.status(404).json({ message: "Tour not found" });
           res.json(updatedTour);
       } catch (error) {
           console.error(`[API /tours/${id} PATCH (Admin)] Error:`, error);
           next(error);
       }
  });
  apiRouter.delete("/tours/:id", verifyAdmin, async (req: Request, res: Response, next: NextFunction) => {
       const id = parseInt(req.params.id, 10);
       if (isNaN(id)) return res.status(400).json({ message: "Invalid tour ID format" });
       try {
          const success = await storage.deleteTour(id);
          if (!success) return res.status(404).json({ message: "Tour not found or could not be deleted" });
          res.status(200).json({ message: "Tour deleted successfully" });
       } catch (error) {
           console.error(`[API /tours/${id} DELETE (Admin)] Error:`, error);
           next(error);
       }
  });

  // --- Admin Manage Inquiries ---
  apiRouter.get("/inquiries", verifyAdmin, async (req: Request, res: Response, next: NextFunction) => {
      try {
          res.json(await storage.getInquiries());
      } catch (error) {
          console.error("[API /inquiries GET (Admin)] Error:", error);
          next(error);
      }
  });
  apiRouter.patch("/inquiries/:id", verifyAdmin, async (req: Request, res: Response, next: NextFunction) => {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) return res.status(400).json({ message: "Invalid inquiry ID format" });
      if (typeof req.body.handled !== 'boolean') return res.status(400).json({ message: "Invalid body: 'handled' boolean expected." });
      try {
          const updatedInquiry = await storage.updateInquiry(id, { handled: req.body.handled });
          if (!updatedInquiry) return res.status(404).json({ message: "Inquiry not found" });
          res.json(updatedInquiry);
      } catch (error) {
          console.error(`[API /inquiries/${id} PATCH (Admin)] Error:`, error);
          next(error);
       }
  });
  apiRouter.delete("/inquiries/:id", verifyAdmin, async (req: Request, res: Response, next: NextFunction) => {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) return res.status(400).json({ message: "Invalid inquiry ID format" });
      try {
          const success = await storage.deleteInquiry(id);
          if (!success) return res.status(404).json({ message: "Inquiry not found or could not be deleted" });
          res.status(200).json({ message: "Inquiry deleted successfully" });
      } catch (error) {
          console.error(`[API /inquiries/${id} DELETE (Admin)] Error:`, error);
          next(error);
       }
  });

  // --- Admin Manage Contact Messages ---
  apiRouter.get("/admin/messages", verifyAdmin, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const messages = await storage.getContactMessages();
      res.json(messages);
    } catch (error) {
      console.error("[API /admin/messages GET] Error:", error);
      next(error);
    }
  });
  apiRouter.patch("/admin/messages/:id", verifyAdmin, async (req: Request, res: Response, next: NextFunction) => {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) return res.status(400).json({ message: "Invalid message ID format" });
      if (typeof req.body.handled !== 'boolean') return res.status(400).json({ message: "Invalid body: 'handled' boolean expected." });
      try {
          const updatedMessage = await storage.updateContactMessage(id, { handled: req.body.handled });
          if (!updatedMessage) return res.status(404).json({ message: "Message not found" });
          res.json(updatedMessage);
      } catch (error) {
          console.error(`[API /admin/messages/${id} PATCH] Error:`, error);
          next(error);
       }
  });
  apiRouter.delete("/admin/messages/:id", verifyAdmin, async (req: Request, res: Response, next: NextFunction) => {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) return res.status(400).json({ message: "Invalid message ID format" });
      try {
          const success = await storage.deleteContactMessage(id);
          if (!success) return res.status(404).json({ message: "Message not found or could not be deleted" });
          res.status(200).json({ message: "Message deleted successfully" });
      } catch (error) {
          console.error(`[API /admin/messages/${id} DELETE] Error:`, error);
          next(error);
       }
  });

    // --- Admin Manage Testimonials ---
    apiRouter.get("/admin/testimonials", verifyAdmin, async (req: Request, res: Response, next: NextFunction) => {
        try {
            const testimonials = await storage.getTestimonials();
            res.json(testimonials); // Attempt to send JSON
        } catch (error) {
            next(error); // Pass error to global handler
        }
    });
  
    apiRouter.post("/admin/testimonials", verifyAdmin, async (req: Request, res: Response, next: NextFunction) => {
        try {
            // Validate incoming data using the insert schema
            const validatedData = insertTestimonialSchema.parse(req.body);
            const newTestimonial = await storage.createTestimonial(validatedData);
            res.status(201).json(newTestimonial);
        } catch (error) {
            console.error("[API /admin/testimonials POST] Error:", error);
            if (error instanceof z.ZodError) {
                return res.status(400).json({ message: "Invalid testimonial data", errors: error.flatten().fieldErrors });
            }
            next(error);
        }
    });

    apiRouter.patch("/admin/testimonials/:id", verifyAdmin, async (req: Request, res: Response, next: NextFunction) => {
        const id = parseInt(req.params.id, 10); // Get ID from URL parameter
        if (isNaN(id)) return res.status(400).json({ message: "Invalid testimonial ID format" });
  
        try {
            const validatedUpdate = insertTestimonialSchema.partial().parse(req.body);
            const updatedTestimonial = await storage.updateTestimonial(id, validatedUpdate);
            if (!updatedTestimonial) {
                return res.status(404).json({ message: "Testimonial not found" });
            }
            res.json(updatedTestimonial);
        } catch (error) {
            console.error(`[API /admin/testimonials/${id} PATCH] Error:`, error);
            if (error instanceof z.ZodError) {
                return res.status(400).json({ message: "Invalid testimonial data", errors: error.flatten().fieldErrors });
            }
            next(error);
        }
    });
  
    apiRouter.delete("/admin/testimonials/:id", verifyAdmin, async (req: Request, res: Response, next: NextFunction) => {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) return res.status(400).json({ message: "Invalid testimonial ID format" });
        try {
            const success = await storage.deleteTestimonial(id);
            if (!success) {
                return res.status(404).json({ message: "Testimonial not found or could not be deleted" });
            }
            res.status(200).json({ message: "Testimonial deleted successfully" });
        } catch (error) {
            console.error(`[API /admin/testimonials/${id} DELETE] Error:`, error);
            next(error);
        }
    });

  // Return the configured router instance
  return apiRouter;
}