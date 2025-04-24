// server/routes.ts

import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { verifyAdmin, setupAuth } from "./auth";
import { z } from "zod";
import {
  insertInquirySchema,
  insertNewsletterSchema,
  insertContactSchema
} from "@shared/schema";

// --- Use Default Import for ImageKit ---
import dotenv from 'dotenv';
import ImageKit from 'imagekit'; // <-- USE DEFAULT IMPORT
import type { FileObject as IKFileObject } from 'imagekit/dist/libs/interfaces'; // Keep specific type import if needed
import cors from 'cors';

dotenv.config();

// --- Initialize ImageKit SDK ---
let imagekit: ImageKit | null = null;
if (process.env.IMAGEKIT_PUBLIC_KEY && process.env.IMAGEKIT_PRIVATE_KEY && process.env.IMAGEKIT_URL_ENDPOINT) {
    // Instantiate using the default import
    imagekit = new ImageKit({ // <-- Use new ImageKit(...)
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

  // --- IMAGEKIT CAROUSEL ROUTE ---
  app.get("/api/carousel-images", async (req: Request, res: Response) => {
      if (!imagekit) {
          console.error("[API /api/carousel-images] ImageKit SDK not available.");
          return res.status(503).json({ message: 'ImageKit service is not configured or available on the server.' });
      }

      // ** IMPORTANT: CHANGE THIS TO YOUR ACTUAL FOLDER PATH IN IMAGEKIT **
      const folderPath = '/Tiger Nest/'; // <<<--- UPDATE THIS PATH!!!

      try {
          console.log(`[API /api/carousel-images] Fetching files from ImageKit folder: ${folderPath}`);
          const listResult = await imagekit.listFiles({
              path: folderPath,
          });

          console.log(`[API /api/carousel-images] Found ${listResult.length} items (files/folders) in ImageKit.`);

          // Filter for files ONLY using Type Predicate
          const fileObjects = listResult.filter(
              // Use the specific type alias if needed for clarity, or use the imported type directly
              (item): item is IKFileObject => item.type === 'file'
          );

          console.log(`[API /api/carousel-images] Filtered down to ${fileObjects.length} files.`);

          const images = fileObjects.map(file => ({
              id: file.fileId,
              src: file.url,
              alt: file.name
          }));

          res.json(images);

      } catch (error: any) {
          console.error('[API /api/carousel-images] Error listing files from ImageKit:', error);
          res.status(500).json({ message: 'Failed to fetch images from ImageKit', error: error.message || 'Unknown error' });
      }
  });
  // --- END IMAGEKIT ROUTE ---


  // --- Existing Tours routes ---
  app.get("/api/tours", async (req: Request, res: Response) => {
    try {
        const tours = await storage.getTours();
        res.json(tours);
    } catch (error) {
        console.error("[API /api/tours GET] Error:", error);
        res.status(500).json({ message: "Failed to fetch tours" });
    }
  });

  app.get("/api/tours/featured", async (req: Request, res: Response) => {
    try {
        const featuredTours = await storage.getFeaturedTours();
        res.json(featuredTours);
    } catch (error) {
        console.error("[API /api/tours/featured GET] Error:", error);
        res.status(500).json({ message: "Failed to fetch featured tours" });
    }
  });

   app.get("/api/tours/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid tour ID" });
    }
    try {
        const tour = await storage.getTour(id);
        if (!tour) {
          return res.status(404).json({ message: "Tour not found" });
        }
        res.json(tour);
    } catch (error) {
        console.error(`[API /api/tours/${id} GET] Error:`, error);
        res.status(500).json({ message: "Failed to fetch tour details" });
    }
  });

  app.post("/api/tours", verifyAdmin, async (req: Request, res: Response) => {
    try {
      const tour = await storage.createTour(req.body);
      res.status(201).json(tour);
    } catch (error) {
      console.error("[API /api/tours POST] Error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid tour data", errors: error.flatten().fieldErrors });
      }
      res.status(500).json({ message: "Failed to create tour" });
    }
  });

  app.patch("/api/tours/:id", verifyAdmin, async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid tour ID" });
    }
    try {
      const updatedTour = await storage.updateTour(id, req.body);
      if (!updatedTour) {
        return res.status(404).json({ message: "Tour not found" });
      }
      res.json(updatedTour);
    } catch (error) {
        console.error(`[API /api/tours/${id} PATCH] Error:`, error);
        res.status(500).json({ message: "Failed to update tour" });
    }
  });

  app.delete("/api/tours/:id", verifyAdmin, async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid tour ID" });
    }
    try {
        const success = await storage.deleteTour(id);
        if (!success) {
          return res.status(404).json({ message: "Tour not found or could not be deleted" });
        }
        res.status(200).json({ message: "Tour deleted successfully" });
    } catch (error) {
        console.error(`[API /api/tours/${id} DELETE] Error:`, error);
        res.status(500).json({ message: "Failed to delete tour" });
    }
  });

  // --- Existing Testimonials routes ---
  app.get("/api/testimonials", async (req: Request, res: Response) => {
     try {
        const testimonials = await storage.getTestimonials();
        res.json(testimonials);
     } catch (error) {
        console.error("[API /api/testimonials GET] Error:", error);
        res.status(500).json({ message: "Failed to fetch testimonials" });
     }
  });

  // --- Existing Gallery routes ---
  app.get("/api/gallery", async (req: Request, res: Response) => {
    try {
        const images = await storage.getGalleryImages();
        res.json(images);
    } catch (error) {
        console.error("[API /api/gallery GET] Error:", error);
        res.status(500).json({ message: "Failed to fetch gallery images" });
    }
  });

  // --- Existing Inquiry routes ---
  app.post("/api/inquiries", async (req: Request, res: Response) => {
    try {
      const validatedData = insertInquirySchema.parse(req.body);
      const tour = await storage.getTour(validatedData.tourId);
      if (!tour) {
        return res.status(400).json({ message: "Invalid tour selected for inquiry." });
      }
      const inquiry = await storage.createInquiry({ ...validatedData, tourName: tour.title });
      res.status(201).json(inquiry);
    } catch (error) {
        console.error("[API /api/inquiries POST] Error:", error);
        if (error instanceof z.ZodError) {
            return res.status(400).json({ message: "Invalid inquiry data", errors: error.flatten().fieldErrors });
        }
        res.status(500).json({ message: "Failed to submit inquiry" });
    }
  });

  app.get("/api/inquiries", verifyAdmin, async (req: Request, res: Response) => {
    try {
        const inquiries = await storage.getInquiries();
        res.json(inquiries);
    } catch (error) {
        console.error("[API /api/inquiries GET] Error:", error);
        res.status(500).json({ message: "Failed to fetch inquiries" });
    }
  });

  app.patch("/api/inquiries/:id", verifyAdmin, async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid inquiry ID" });
    }
     try {
        const updatedInquiry = await storage.updateInquiry(id, req.body);
        if (!updatedInquiry) {
            return res.status(404).json({ message: "Inquiry not found" });
        }
        res.json(updatedInquiry);
     } catch (error) {
        console.error(`[API /api/inquiries/${id} PATCH] Error:`, error);
        res.status(500).json({ message: "Failed to update inquiry status" });
     }
  });

  app.delete("/api/inquiries/:id", verifyAdmin, async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid inquiry ID" });
    }
     try {
        const success = await storage.deleteInquiry(id);
        if (!success) {
          return res.status(404).json({ message: "Inquiry not found or could not be deleted" });
        }
        res.status(200).json({ message: "Inquiry deleted successfully" });
     } catch (error) {
        console.error(`[API /api/inquiries/${id} DELETE] Error:`, error);
        res.status(500).json({ message: "Failed to delete inquiry" });
     }
  });

  // --- Existing Newsletter subscription route ---
  app.post("/api/newsletter", async (req: Request, res: Response) => {
    try {
      const validatedData = insertNewsletterSchema.parse(req.body);
      const subscriber = await storage.addNewsletterSubscriber(validatedData);
      res.status(201).json(subscriber);
    } catch (error: any) {
        console.error("[API /api/newsletter POST] Error:", error);
        if (error instanceof z.ZodError) {
            return res.status(400).json({ message: "Invalid email format", errors: error.flatten().fieldErrors });
        }
        if (error.code === '23505') {
             return res.status(409).json({ message: "This email is already subscribed." });
        }
        res.status(500).json({ message: "Failed to subscribe to newsletter" });
    }
  });

  // --- Existing Contact routes ---
  app.post("/api/contact", async (req: Request, res: Response) => {
    try {
      const validatedData = insertContactSchema.parse(req.body);
      const message = await storage.createContactMessage(validatedData);
      res.status(201).json(message);
    } catch (error) {
      console.error("[API /api/contact POST] Error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid contact form data", errors: error.flatten().fieldErrors });
      }
      res.status(500).json({ message: "Failed to send contact message" });
    }
  });

  // --- Existing Admin routes ---
  app.get("/api/admin/stats", verifyAdmin, async (req: Request, res: Response) => {
    try {
        const stats = await storage.getStats();
        const formattedStats = [
          { label: "Active Tours", value: stats.tours, icon: "📍", link: "/admin/tours" },
          { label: "Tour Inquiries", value: stats.inquiries, icon: "📨", link: "/admin/inquiries" },
          { label: "Contact Messages", value: stats.messages, icon: "💬", link: "/admin/messages" }
        ];
        res.json(formattedStats);
    } catch (error) {
        console.error("[API /api/admin/stats GET] Error:", error);
        res.status(500).json({ message: "Failed to fetch admin statistics" });
    }
  });


  // Create the HTTP server using the configured Express app
  const httpServer = createServer(app);
  // Return the server instance as required by index.ts
  return httpServer;
}