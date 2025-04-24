import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
// Import storage instance from database-storage.ts
import { storage } from "./database-storage"; // <-- CORRECTED IMPORT
import { verifyAdmin, setupAuth } from "./auth";
import { z } from "zod";
import {
  insertInquirySchema,
  insertNewsletterSchema,
  insertContactSchema,
  upsertAboutPageContentSchema
} from "@shared/schema";
import dotenv from 'dotenv';
import ImageKit from 'imagekit';
import type { FileObject as IKFileObject } from 'imagekit/dist/libs/interfaces';
import cors from 'cors';

dotenv.config();

// --- Initialize ImageKit SDK --- (Keep as before)
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


export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  const corsOptions = {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    optionsSuccessStatus: 200,
    credentials: true
  };
  app.use('/api', cors(corsOptions));

  // --- IMAGEKIT CAROUSEL ROUTE --- (Keep as before)
   app.get("/api/carousel-images", async (req: Request, res: Response, next: NextFunction) => {
      if (!imagekit) {
          return next(new Error('ImageKit service is not configured or available on the server.'));
      }
      const folderPath = '/Tiger Nest/'; // <<<--- UPDATE THIS PATH!!!
      try {
          const listResult = await imagekit.listFiles({ path: folderPath });
          const fileObjects = listResult.filter((item): item is IKFileObject => item.type === 'file');
          const images = fileObjects.map(file => ({ id: file.fileId, src: file.url, alt: file.name }));
          res.json(images);
      } catch (error: any) {
          console.error('[API /api/carousel-images] Error listing files from ImageKit:', error);
          next(error);
      }
  });

  // --- ABOUT PAGE CONTENT ROUTES --- (Keep as before)
  app.get("/api/content/about", async (req: Request, res: Response, next: NextFunction) => {
    try {
      let content = await storage.getAboutPageContent();
      if (!content) {
        console.warn("[API /api/content/about GET] No content found in DB, returning default structure.");
        // Return a default structure matching AboutPageContent type
        content = {
          id: 1, // Use 1 as the default ID
          mainHeading: "Our Sacred Journey (Default)",
          imageUrl: "https://via.placeholder.com/600x400.png?text=Default+Image", // Placeholder URL
          imageAlt: "Default placeholder image",
          historyText: "Default history text. Please update in admin.",
          missionText: "Default mission text. Please update in admin.",
          philosophyHeading: "Our Philosophy (Default)",
          philosophyQuote: "Default philosophy quote. Please update in admin.",
          value1Title: "Value 1 (Default)",
          value1Text: "Default value 1 text.",
          value2Title: "Value 2 (Default)",
          value2Text: "Default value 2 text.",
          value3Title: "Value 3 (Default)",
          value3Text: "Default value 3 text.",
          updatedAt: new Date() // Current date for the default object
        };
      }
      res.json(content);
    } catch (error) {
      console.error("[API /api/content/about GET] Error:", error);
      next(error);
    }
  });

  app.patch("/api/content/about", verifyAdmin, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedData = upsertAboutPageContentSchema.parse(req.body);
      const updatedContent = await storage.updateAboutPageContent(validatedData);
      if (!updatedContent) {
         console.error("[API /api/content/about PATCH] Update operation failed to return content.");
         // Use 500 Internal Server Error as it's unexpected if UPSERT works
         return res.status(500).json({ message: "Failed to save about page content due to an internal error." });
      }
      res.json(updatedContent);
    } catch (error) {
      console.error("[API /api/content/about PATCH] Error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data provided", errors: error.flatten().fieldErrors });
      }
      next(error);
    }
  });

  // --- Existing Tours, Testimonials, Gallery, Inquiry, Newsletter, Contact, Admin Stats routes ---
  // (Keep these routes as they were in the previous correct response)
  // Ensure they also use next(error) for error handling instead of just res.status(500)

  // Example: /api/tours GET
  app.get("/api/tours", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const tours = await storage.getTours();
        res.json(tours);
    } catch (error) {
        console.error("[API /api/tours GET] Error:", error);
        next(error); // Pass error to global handler
    }
  });

  // Example: /api/inquiries POST
  app.post("/api/inquiries", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedData = insertInquirySchema.parse(req.body);
      // Note: createInquiry now fetches the tourName internally in the fixed DatabaseStorage
      const inquiry = await storage.createInquiry(validatedData);
      res.status(201).json(inquiry);
    } catch (error) {
        console.error("[API /api/inquiries POST] Error:", error);
        if (error instanceof z.ZodError) {
            return res.status(400).json({ message: "Invalid inquiry data", errors: error.flatten().fieldErrors });
        }
         // Handle specific error from createInquiry if tour not found
        if (error instanceof Error && error.message.includes("Tour with ID")) {
             return res.status(400).json({ message: error.message });
        }
        next(error);
    }
  });

  // ... (Apply similar next(error) handling to ALL other API routes) ...

   // --- Admin Stats Route ---
   app.get("/api/admin/stats", verifyAdmin, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const stats = await storage.getStats();
        const formattedStats = [
          // Use more relevant icons if possible
          { label: "Active Tours", value: stats.tours, icon: "✈️", link: "/admin/tours" },
          { label: "Total Inquiries", value: stats.inquiries, icon: "✉️", link: "/admin/inquiries" },
          { label: "Total Messages", value: stats.messages, icon: "💬", link: "/admin/messages" } // Link should exist
        ];
        res.json(formattedStats);
    } catch (error) {
        console.error("[API /api/admin/stats GET] Error:", error);
        next(error);
    }
  });


  // Create the HTTP server using the configured Express app
  const httpServer = createServer(app);
  return httpServer;
}