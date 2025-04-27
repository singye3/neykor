// server/routes.ts

import { Router, Request, Response, NextFunction } from "express";
import { storage } from "./database-storage";
import { verifyAdmin, hashPassword, comparePassword } from "./auth";
import { z } from "zod";
import {
  changePasswordSchema,
  insertInquirySchema,
  insertContactSchema,
  upsertAboutPageContentSchema,
  insertTestimonialSchema,
  upsertHomePageContentSchema,
  upsertSiteSettingsSchema,
  upsertContactPageSettingsSchema,
  upsertGalleryPageSettingsSchema,
  changeUsernameSchema
} from "@shared/schema";

// ImageKit Imports
import dotenv from 'dotenv';
import ImageKit from 'imagekit';
import type { FileObject as IKFileObject } from 'imagekit/dist/libs/interfaces';
import { uploadImageToFolder } from "./imagekit-helper.ts";
import multer from 'multer';
import passport from "passport"; // Needed for authenticate

dotenv.config();

// Configure multer for memory storage (process file buffer in memory)
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 } // Limit file size (e.g., 5MB)
});

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
      const folderPath = '/uploads/carousel/';
      try {
          const listResult = await imagekit.listFiles({ path: folderPath });
          const fileObjects = listResult.filter((item): item is IKFileObject => item.type === 'file');
          const images = fileObjects.map(file => ({ id: file.fileId, src: file.url, alt: file.name }));
          res.json(images);
      } catch (error) { console.error('[API /carousel-images] Error:', error); next(error); }
  });

  // --- Site Settings (Public GET) ---
  apiRouter.get("/settings/site", async (req: Request, res: Response, next: NextFunction) => {
    try {
      let settings = await storage.getSiteSettings();
      if (!settings) {
        // Minimal default settings if not found
        settings = { id: 1, siteName: "Sacred Bhutan Travels (Default)", updatedAt: new Date() };
      }
      res.json({ siteName: settings.siteName }); // Only public info
    } catch (error) {
      console.error("[API /settings/site GET] Error:", error);
      next(error);
    }
  });

  // --- Home Page Content (Public GET) ---
  apiRouter.get("/content/home", async (req: Request, res: Response, next: NextFunction) => {
    try {
      let content = await storage.getHomePageContent();
      if (!content) {
         // Provide a minimal default structure if needed
        content = {
           id: 1, heroImageURL: "", heroImageAlt: "", heroHeadingLine1: "Welcome", heroHeadingLine2: "",
           heroParagraph: "", heroButtonText: "", introHeading: "", introParagraph1: "", introParagraph2: "",
           featuredHeading: "", featuredMapURL: "", featuredMapAlt: "", featuredMapCaption: "", featuredButtonText: "",
           carouselHeading: "", whyHeading: "", why1Icon: "", why1Title: "", why1Text: "", why2Icon: "", why2Title: "",
           why2Text: "", why3Icon: "", why3Title: "", why3Text: "", testimonialsHeading: "", updatedAt: new Date(),
        };
      }
      res.json(content);
    } catch (error) {
      console.error("[API /content/home GET] Error:", error);
      next(error);
    }
  });

  // --- About Page Content ---
  apiRouter.get("/content/about", async (req: Request, res: Response, next: NextFunction) => {
    try {
      let content = await storage.getAboutPageContent();
      if (!content) {
         // Minimal default structure
        content = {
          id: 1, mainHeading: "About Us", imageUrl: "", imageAlt: "", historyText: "", missionText: "",
          philosophyHeading: "", philosophyQuote: "", value1Title: "", value1Text: "", value2Title: "",
          value2Text: "", value3Title: "", value3Text: "", updatedAt: new Date()
        };
      }
      res.json(content);
    } catch (error) {
      console.error("[API /content/about GET] Error:", error);
      next(error);
    }
  });

  // --- Tours ---
  // GET /tours endpoint supporting optional location filtering
  apiRouter.get("/tours", async (req: Request, res: Response, next: NextFunction) => {
    const location = req.query.location as string | undefined;
    try {
      // **IMPORTANT:** Assumes `storage.getTours` accepts an optional filter object
      const filters: { location?: string } = {};
      if (location && typeof location === 'string' && location.trim() !== '') {
        filters.location = location.trim();
      }
      const tours = await storage.getTours(filters);
      res.json(tours);
    } catch (error) {
      console.error(`[API /tours GET] Error fetching tours (Location: ${location || 'None'}):`, error);
      next(error);
    }
  });

  apiRouter.get("/tours/featured", async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.json(await storage.getFeaturedTours());
    } catch (error) {
      console.error("[API /tours/featured GET] Error:", error);
      next(error);
    }
  });

  apiRouter.get("/tours/:id", async (req: Request, res: Response, next: NextFunction) => {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid tour ID format" });
    try {
        const tour = await storage.getTour(id);
        if (!tour) return res.status(404).json({ message: "Tour not found" });
        res.json(tour);
    } catch (error) {
      console.error(`[API /tours/${id} GET] Error:`, error);
      next(error);
    }
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
  apiRouter.get("/gallery/images", async (req: Request, res: Response, next: NextFunction) => {
    const targetFolder = "/uploads/gallery/";
    if (!imagekit) return next(new Error('ImageKit service is not available.'));
    try {
      const listResult = await imagekit.listFiles({ path: targetFolder });
      const imageFiles = listResult.filter((item): item is IKFileObject => item.type === 'file');
      const galleryData = imageFiles.map(file => ({
        id: file.fileId, url: file.url, thumbnailUrl: file.thumbnail, name: file.name,
        filePath: file.filePath, height: file.height, width: file.width, size: file.size,
      }));
      res.json(galleryData);
    } catch (error) {
      console.error(`[API /gallery/images] Error listing files from ${targetFolder}:`, error);
      next(error);
    }
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

  // --- Contact Form Submission ---
  apiRouter.post("/contact", async (req: Request, res: Response, next: NextFunction) => {
       try {
          const validatedData = insertContactSchema.parse(req.body);
          await storage.createContactMessage(validatedData);
          res.status(201).json({ message: "Message received successfully." });
      } catch (error) {
          console.error("[API /contact POST] Error:", error);
          if (error instanceof z.ZodError) return res.status(400).json({ message: "Invalid contact form data", errors: error.flatten().fieldErrors });
          next(error);
      }
  });

  // --- Contact Page Content (Public GET) ---
  apiRouter.get("/content/contact", async (req: Request, res: Response, next: NextFunction) => {
    try {
      let settings = await storage.getContactPageSettings();
      if (!settings) {
         // Minimal default
        settings = {
          id: 1, pageHeading: "Contact Us", locationHeading: "", address: "", email: "",
          phone: "", officeHoursHeading: "", officeHoursText: "", updatedAt: new Date()
        };
      }
      res.json(settings);
    } catch (error) {
      console.error("[API /content/contact GET] Error:", error);
      next(error);
     }
  });

  // --- Gallery Page Content (Public GET) ---
  apiRouter.get("/content/gallery", async (req: Request, res: Response, next: NextFunction) => {
    try {
      let settings = await storage.getGalleryPageSettings();
      if (!settings) {
         // Minimal default
        settings = { id: 1, pageHeading: "Gallery", pageParagraph: "", updatedAt: new Date() };
      }
      res.json(settings);
    } catch (error) {
      console.error("[API /content/gallery GET] Error:", error);
      next(error);
    }
  });

  // --- User Auth Routes (Session Check, Login, Register, Logout) ---
  apiRouter.get("/user", (req: Request, res: Response) => {
    if (!req.isAuthenticated() || !req.user) {
        return res.status(200).json(null);
    }
    // Ensure password is not sent
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
       // Basic input checks
       if (!username || typeof username !== 'string' || username.length < 3) return res.status(400).json({ message: "Username must be at least 3 characters." });
       if (!password || typeof password !== 'string' || password.length < 6) return res.status(400).json({ message: "Password must be at least 6 characters." });
       try {
          const existingUser = await storage.getUserByUsername(username);
          if (existingUser) return res.status(409).json({ message: "Username already exists" });

          const hashedPassword = await hashPassword(password);
          const newUser = await storage.createUser({ username, password: hashedPassword });

          // Log user in automatically after successful registration
          req.login(newUser, (err) => {
            if (err) {
                console.error("[API /register] Login after register failed:", err);
                // Still successful registration, just inform user to login manually
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
            res.clearCookie('connect.sid'); // Use the default session cookie name
            res.status(200).json({ message: "Logout successful" });
        });
      });
  });


  // ==========================================
  // ADMIN API ROUTES (Apply verifyAdmin middleware)
  // ==========================================

  // Admin Change Own Password ---
  apiRouter.patch("/admin/user/password", verifyAdmin, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { currentPassword, newPassword } = changePasswordSchema.parse(req.body);
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ message: "Authentication error: User ID not found." });
        }

        const currentUser = await storage.getUser(userId);
        if (!currentUser || !currentUser.password) {
            return res.status(404).json({ message: "Admin user not found or password data missing." });
        }
        const isMatch = await comparePassword(currentPassword, currentUser.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Incorrect current password." });
        }
        const newHashedPassword = await hashPassword(newPassword);
        const updateSuccess = await storage.updateUserPassword(userId, newHashedPassword);

        if (!updateSuccess) {
            return res.status(500).json({ message: "Failed to update password in database." });
        }
        res.status(200).json({ message: "Password updated successfully." });

    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ message: "Invalid data provided.", errors: error.flatten().fieldErrors });
        }
        next(error);
    }
  });

  // --- Admin Change Own Username ---
  apiRouter.patch("/admin/user/username", verifyAdmin, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { newUsername, currentPassword } = changeUsernameSchema.parse(req.body);
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ message: "Authentication error: User ID not found." });
        }
        const currentUser = await storage.getUser(userId);
        if (!currentUser || !currentUser.password) {
            return res.status(404).json({ message: "Admin user not found or password data missing." });
        }
        const isPasswordMatch = await comparePassword(currentPassword, currentUser.password);
        if (!isPasswordMatch) {
            return res.status(400).json({ message: "Incorrect current password." });
        }
        if (newUsername === currentUser.username) {
            return res.status(400).json({ message: "New username cannot be the same as the current username." });
        }
        const updateSuccess = await storage.updateUserUsername(userId, newUsername);

        if (!updateSuccess) {
             return res.status(500).json({ message: "Failed to update username. It might already be taken or another error occurred." });
        }

        res.status(200).json({ message: "Username updated successfully." });

    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ message: "Invalid data provided.", errors: error.flatten().fieldErrors });
        }
        next(error);
    }
  });

  // --- Admin Stats ---
  apiRouter.get("/admin/stats", verifyAdmin, async (req: Request, res: Response, next: NextFunction) => {
      try {
          const stats = await storage.getStats();
          // Format stats for potential dashboard display
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

  // --- Admin Manage Site Settings ---
  apiRouter.get("/admin/settings/site", verifyAdmin, async (req: Request, res: Response, next: NextFunction) => {
    try {
      let settings = await storage.getSiteSettings();
       if (!settings) {
          settings = { id: 1, siteName: "Sacred Bhutan Travels (Default)", updatedAt: new Date() };
       }
      res.json(settings); // Admin gets all settings
    } catch (error) {
      console.error("[API /admin/settings/site GET] Error:", error);
      next(error);
    }
  });

  apiRouter.patch("/admin/settings/site", verifyAdmin, async (req: Request, res: Response, next: NextFunction) => {
     try {
        const validatedData = upsertSiteSettingsSchema.parse(req.body);
        const updatedSettings = await storage.updateSiteSettings(validatedData);
        if (!updatedSettings) return res.status(500).json({ message: "Failed to save site settings." });
        res.json(updatedSettings);
    } catch (error) {
        console.error("[API /admin/settings/site PATCH] Error:", error);
        if (error instanceof z.ZodError) return res.status(400).json({ message: "Invalid data", errors: error.flatten().fieldErrors });
        next(error);
    }
  });

  // --- Admin Manage Home Page Content ---
  apiRouter.patch("/content/home", verifyAdmin, async (req: Request, res: Response, next: NextFunction) => {
    try {
       const validatedData = upsertHomePageContentSchema.parse(req.body);
       const updatedContent = await storage.updateHomePageContent(validatedData);
       if (!updatedContent) return res.status(500).json({ message: "Failed to save home page content." });
       res.json(updatedContent);
    } catch (error) {
       console.error("[API /content/home PATCH] Error:", error);
       if (error instanceof z.ZodError) return res.status(400).json({ message: "Invalid data", errors: error.flatten().fieldErrors });
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
           // TODO: Add Zod validation (e.g., const validatedData = insertTourSchema.parse(req.body);)
           // Ensure validatedData includes the 'location' field
           const validatedData = req.body; // Placeholder - Replace with actual validation
           const newTour = await storage.createTour(validatedData);
           res.status(201).json(newTour);
       } catch (error) {
           console.error("[API /tours POST (Admin)] Error:", error);
           // Add Zod error handling here if validation is added
           // if (error instanceof z.ZodError) return res.status(400).json(...)
           next(error);
       }
  });
  apiRouter.patch("/tours/:id", verifyAdmin, async (req: Request, res: Response, next: NextFunction) => {
       const id = parseInt(req.params.id, 10);
       if (isNaN(id)) return res.status(400).json({ message: "Invalid tour ID format" });
       try {
           // TODO: Add Zod validation (e.g., const validatedData = updateTourSchema.partial().parse(req.body);)
           // Ensure validatedData includes the 'location' field if provided
           const validatedData = req.body; // Placeholder - Replace with actual validation
           const updatedTour = await storage.updateTour(id, validatedData);
           if (!updatedTour) return res.status(404).json({ message: "Tour not found" });
           res.json(updatedTour);
       } catch (error) {
           console.error(`[API /tours/${id} PATCH (Admin)] Error:`, error);
            // Add Zod error handling here if validation is added
           // if (error instanceof z.ZodError) return res.status(400).json(...)
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
      // Simple validation for the expected field
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
      // Simple validation for the expected field
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

  // --- Admin Image Upload ---
  apiRouter.post(
    "/admin/upload",
    verifyAdmin,
    upload.single('imageFile'), // Uses multer middleware for single file upload
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            if (!req.file) return res.status(400).json({ message: "No image file provided." });
            if (!req.body.folderName) return res.status(400).json({ message: "Target folder name is required." });

            const result = await uploadImageToFolder(
                req.file.buffer,
                req.file.originalname,
                req.body.folderName,
                true // Use original filename in ImageKit
            );
            // Send the full ImageKit result object back
            res.status(201).json(result);

        } catch (error) {
            console.error("[API /admin/upload] Error:", error);
            next(error);
        }
    }
  );

    // --- Admin Manage Testimonials ---
    apiRouter.get("/admin/testimonials", verifyAdmin, async (req: Request, res: Response, next: NextFunction) => {
        try {
            const testimonials = await storage.getTestimonials();
            res.json(testimonials);
        } catch (error) {
            console.error("[API /admin/testimonials GET] Error:", error);
            next(error);
        }
    });

    apiRouter.post("/admin/testimonials", verifyAdmin, async (req: Request, res: Response, next: NextFunction) => {
        try {
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
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) return res.status(400).json({ message: "Invalid testimonial ID format" });

        try {
            // Allow partial updates
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

    // --- Admin Manage Contact Page Content ---
    apiRouter.patch("/content/contact", verifyAdmin, async (req: Request, res: Response, next: NextFunction) => {
      try {
         const validatedData = upsertContactPageSettingsSchema.parse(req.body);
         const updatedSettings = await storage.updateContactPageSettings(validatedData);
         if (!updatedSettings) return res.status(500).json({ message: "Failed to save contact page settings." });
         res.json(updatedSettings);
     } catch (error) {
         console.error("[API /content/contact PATCH] Error:", error);
         if (error instanceof z.ZodError) return res.status(400).json({ message: "Invalid data", errors: error.flatten().fieldErrors });
         next(error);
     }
    });

    // --- Admin Manage Gallery Page Content ---
    apiRouter.patch("/content/gallery", verifyAdmin, async (req: Request, res: Response, next: NextFunction) => {
       try {
          const validatedData = upsertGalleryPageSettingsSchema.parse(req.body);
          const updatedSettings = await storage.updateGalleryPageSettings(validatedData);
          if (!updatedSettings) return res.status(500).json({ message: "Failed to save gallery page settings." });
          res.json(updatedSettings);
      } catch (error) {
          console.error("[API /content/gallery PATCH] Error:", error);
          if (error instanceof z.ZodError) return res.status(400).json({ message: "Invalid data", errors: error.flatten().fieldErrors });
          next(error);
      }
    });

  // Return the configured router instance
  return apiRouter;
}