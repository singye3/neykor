import { 
  users, type User, type InsertUser,
  tours, type Tour, type InsertTour,
  inquiries, type Inquiry, type InsertInquiry,
  testimonials, type Testimonial, type InsertTestimonial,
  galleryImages, type GalleryImage, type InsertGalleryImage,
  newsletterSubscribers, type NewsletterSubscriber, type InsertNewsletter,
  contactMessages, type ContactMessage, type InsertContact
} from "@shared/schema";
import { eq, sql } from "drizzle-orm";
import { db, pool } from "./db";
import type { IStorage } from "./storage";
import connectPgSimple from "connect-pg-simple";
import session from "express-session";

const PostgresSessionStore = connectPgSimple(session);

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }
  
  // Tour methods
  async getTours(): Promise<Tour[]> {
    const allTours = await db.select().from(tours);
    
    // Parse itineraries for all tours
    return allTours.map(tour => {
      if (typeof tour.itinerary === 'string') {
        try {
          tour.itinerary = JSON.parse(tour.itinerary);
        } catch (e) {
          console.error("Error parsing tour itinerary:", e);
          tour.itinerary = [];
        }
      }
      return tour;
    });
  }
  
  async getTour(id: number): Promise<Tour | undefined> {
    const [tour] = await db.select().from(tours).where(eq(tours.id, id));
    
    if (!tour) return undefined;
    
    // Parse itinerary JSON if it exists
    if (typeof tour.itinerary === 'string') {
      try {
        tour.itinerary = JSON.parse(tour.itinerary);
      } catch (e) {
        console.error("Error parsing tour itinerary:", e);
        tour.itinerary = [];
      }
    }
    
    return tour;
  }
  
  async getFeaturedTours(): Promise<Tour[]> {
    const featuredTours = await db.select().from(tours).where(eq(tours.featured, true));
    
    // Parse itineraries for all featured tours
    return featuredTours.map(tour => {
      if (typeof tour.itinerary === 'string') {
        try {
          tour.itinerary = JSON.parse(tour.itinerary);
        } catch (e) {
          console.error("Error parsing tour itinerary:", e);
          tour.itinerary = [];
        }
      }
      return tour;
    });
  }
  
  async createTour(tour: InsertTour): Promise<Tour> {
    // Convert itinerary to JSON string for storage
    const processedTour = { 
      ...tour,
      itinerary: Array.isArray(tour.itinerary) 
        ? JSON.stringify(tour.itinerary) 
        : JSON.stringify([])
    };
    
    const [newTour] = await db
      .insert(tours)
      .values(processedTour as any)
      .returning();
      
    // Parse it back for the return value
    if (typeof newTour.itinerary === 'string') {
      try {
        newTour.itinerary = JSON.parse(newTour.itinerary);
      } catch (e) {
        console.error("Error parsing tour itinerary:", e);
        newTour.itinerary = [];
      }
    }
    
    return newTour;
  }
  
  async updateTour(id: number, tourUpdate: Partial<InsertTour>): Promise<Tour | undefined> {
    // Process itinerary if present
    const processedUpdate = { ...tourUpdate };
    if (tourUpdate.itinerary) {
      processedUpdate.itinerary = Array.isArray(tourUpdate.itinerary) ? tourUpdate.itinerary : [];
    }
    
    const [updatedTour] = await db
      .update(tours)
      .set(processedUpdate as any)
      .where(eq(tours.id, id))
      .returning();
    return updatedTour || undefined;
  }
  
  async deleteTour(id: number): Promise<boolean> {
    const result = await db
      .delete(tours)
      .where(eq(tours.id, id))
      .returning();
    return result.length > 0;
  }
  
  // Inquiry methods
  async getInquiries(): Promise<Inquiry[]> {
    return await db.select().from(inquiries);
  }
  
  async getInquiry(id: number): Promise<Inquiry | undefined> {
    const [inquiry] = await db.select().from(inquiries).where(eq(inquiries.id, id));
    return inquiry || undefined;
  }
  
  async createInquiry(inquiry: InsertInquiry): Promise<Inquiry> {
    const [newInquiry] = await db
      .insert(inquiries)
      .values({
        ...inquiry,
        createdAt: new Date(),
        handled: false
      })
      .returning();
    return newInquiry;
  }
  
  async updateInquiry(id: number, inquiryUpdate: Partial<Inquiry>): Promise<Inquiry | undefined> {
    const [updatedInquiry] = await db
      .update(inquiries)
      .set(inquiryUpdate)
      .where(eq(inquiries.id, id))
      .returning();
    return updatedInquiry || undefined;
  }
  
  async deleteInquiry(id: number): Promise<boolean> {
    const result = await db
      .delete(inquiries)
      .where(eq(inquiries.id, id))
      .returning();
    return result.length > 0;
  }
  
  // Testimonial methods
  async getTestimonials(): Promise<Testimonial[]> {
    return await db.select().from(testimonials);
  }
  
  async getTestimonial(id: number): Promise<Testimonial | undefined> {
    const [testimonial] = await db.select().from(testimonials).where(eq(testimonials.id, id));
    return testimonial || undefined;
  }
  
  async createTestimonial(testimonial: InsertTestimonial): Promise<Testimonial> {
    const [newTestimonial] = await db
      .insert(testimonials)
      .values(testimonial)
      .returning();
    return newTestimonial;
  }
  
  // Gallery methods
  async getGalleryImages(): Promise<GalleryImage[]> {
    return await db.select().from(galleryImages);
  }
  
  async getGalleryImage(id: number): Promise<GalleryImage | undefined> {
    const [image] = await db.select().from(galleryImages).where(eq(galleryImages.id, id));
    return image || undefined;
  }
  
  async createGalleryImage(image: InsertGalleryImage): Promise<GalleryImage> {
    const [newImage] = await db
      .insert(galleryImages)
      .values(image)
      .returning();
    return newImage;
  }
  
  // Newsletter methods
  async addNewsletterSubscriber(subscriber: InsertNewsletter): Promise<NewsletterSubscriber> {
    const [newSubscriber] = await db
      .insert(newsletterSubscribers)
      .values({
        ...subscriber,
        createdAt: new Date()
      })
      .returning();
    return newSubscriber;
  }
  
  // Contact methods
  async getContactMessages(): Promise<ContactMessage[]> {
    return await db.select().from(contactMessages);
  }
  
  async createContactMessage(message: InsertContact): Promise<ContactMessage> {
    const [newMessage] = await db
      .insert(contactMessages)
      .values({
        ...message,
        createdAt: new Date(),
        handled: false
      })
      .returning();
    return newMessage;
  }
  
  async updateContactMessage(id: number, messageUpdate: Partial<ContactMessage>): Promise<ContactMessage | undefined> {
    const [updatedMessage] = await db
      .update(contactMessages)
      .set(messageUpdate)
      .where(eq(contactMessages.id, id))
      .returning();
    return updatedMessage || undefined;
  }
  
  async deleteContactMessage(id: number): Promise<boolean> {
    const result = await db
      .delete(contactMessages)
      .where(eq(contactMessages.id, id))
      .returning();
    return result.length > 0;
  }
  
  // Admin dashboard stats
  async getStats(): Promise<{ tours: number, inquiries: number, messages: number }> {
    const tourCount = await db.select({ count: sql<number>`count(*)` }).from(tours);
    const inquiryCount = await db.select({ count: sql<number>`count(*)` }).from(inquiries);
    const messageCount = await db.select({ count: sql<number>`count(*)` }).from(contactMessages);
    
    return {
      tours: tourCount[0]?.count || 0,
      inquiries: inquiryCount[0]?.count || 0,
      messages: messageCount[0]?.count || 0
    };
  }
}