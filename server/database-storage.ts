// server/database-storage.ts

import {
  users, type User, type InsertUser,
  homePageContent, type HomePageContent, type InsertHomePageContent,
  tours, type Tour, type InsertTour, type ItineraryDay, // Ensure ItineraryDay is imported
  inquiries, type Inquiry, type InsertInquiry,
  testimonials, type Testimonial, type InsertTestimonial, insertTestimonialSchema,
  galleryImages, type GalleryImage, type InsertGalleryImage,
  newsletterSubscribers, type NewsletterSubscriber, type InsertNewsletter,
  contactMessages, type ContactMessage, type InsertContact,
  aboutPageContent, type AboutPageContent, type InsertAboutPageContent,
} from "@shared/schema";
import { eq, sql, desc } from "drizzle-orm";
import { db, pool } from "./db";
import type { IStorage } from "./storage"; // Import the Interface
import connectPgSimple from "connect-pg-simple";
import session from "express-session";

const PostgresSessionStore = connectPgSimple(session);

// Implementation Class
export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true
    });
  }

  // --- User methods ---
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

    // ==========================================
  // NEW: Home Page Content methods
  // ==========================================
  async getHomePageContent(): Promise<HomePageContent | undefined> {
    // Fetch the row with ID 1
    const [content] = await db.select().from(homePageContent).where(eq(homePageContent.id, 1));
    return content || undefined;
  }

  async updateHomePageContent(contentUpdate: InsertHomePageContent): Promise<HomePageContent | undefined> {
    // Prepare the SET part for the UPSERT, referencing the incoming values
    // Exclude id and updatedAt as they are handled separately or by the DB
    const { id, updatedAt, ...updateData } = contentUpdate as any;
    const setClause: Record<string, any> = {};
    for (const key in updateData) {
        setClause[key] = sql.raw(`excluded."${key}"`); // Use excluded.columnName syntax
    }
    setClause.updatedAt = new Date(); // Ensure updatedAt is set on update

    const [updatedContent] = await db
      .insert(homePageContent)
      .values({ id: 1, ...contentUpdate }) // Insert with ID 1
      .onConflictDoUpdate({
        target: homePageContent.id, // Conflict on ID
        set: setClause // Set fields to update
      })
      .returning();

    return updatedContent || undefined;
  }
  // ==========================================
  // Tour methods - CORRECTED with Type Assertion
  // ==========================================
  async getTours(): Promise<Tour[]> {
    const allTours = await db.select().from(tours);
    // Drizzle automatically parses JSON. Add fallback for safety.
    return allTours.map(tour => ({
        ...tour,
        itinerary: Array.isArray(tour.itinerary) ? tour.itinerary : []
    }));
  }

  async getTour(id: number): Promise<Tour | undefined> {
    const [tour] = await db.select().from(tours).where(eq(tours.id, id));
    if (!tour) return undefined;
    // Drizzle automatically parses JSON. Add fallback for safety.
    return {
        ...tour,
        itinerary: Array.isArray(tour.itinerary) ? tour.itinerary : []
    };
  }

  async getFeaturedTours(): Promise<Tour[]> {
    const featuredTours = await db.select().from(tours).where(eq(tours.featured, true));
    // Drizzle automatically parses JSON. Add fallback for safety.
     return featuredTours.map(tour => ({
        ...tour,
        itinerary: Array.isArray(tour.itinerary) ? tour.itinerary : []
    }));
  }

  async createTour(tour: InsertTour): Promise<Tour> {
    // Prepare data, ensuring itinerary is an array or default to []
    const tourDataToInsert = {
        ...tour,
        itinerary: tour.itinerary || [] // Pass the array directly
    };

    const [newTour] = await db
      .insert(tours)
      // Use explicit type assertion to satisfy TS check for insert
      .values(tourDataToInsert as typeof tours.$inferInsert)
      .returning();

    // Drizzle returns the parsed array. Add fallback for safety.
    return {
        ...newTour,
        itinerary: Array.isArray(newTour.itinerary) ? newTour.itinerary : []
    };
  }

  async updateTour(id: number, tourUpdate: Partial<InsertTour>): Promise<Tour | undefined> {
     // Prepare data directly from the partial update
     const updateData = { ...tourUpdate };
     // If itinerary is present, ensure it's an array (though InsertTour should handle this)
     if (updateData.itinerary && !Array.isArray(updateData.itinerary)) {
        console.warn(`Invalid itinerary type during update for tour ${id}, defaulting to empty array.`);
        updateData.itinerary = [];
     }

    const [updatedTour] = await db
      .update(tours)
      // Use explicit type assertion for the partial update object for set
      .set(updateData as Partial<typeof tours.$inferInsert>)
      .where(eq(tours.id, id))
      .returning();

    if (!updatedTour) return undefined;

    // Drizzle returns the parsed array. Add fallback for safety.
    return {
        ...updatedTour,
        itinerary: Array.isArray(updatedTour.itinerary) ? updatedTour.itinerary : []
    };
  }

  async deleteTour(id: number): Promise<boolean> {
    const result = await db
      .delete(tours)
      .where(eq(tours.id, id))
      .returning();
    return result.length > 0;
  }

  // --- Inquiry methods ---
  async getInquiries(): Promise<Inquiry[]> {
    return await db.select().from(inquiries).orderBy(sql`${inquiries.createdAt} DESC`);
  }

  async getInquiry(id: number): Promise<Inquiry | undefined> {
    const [inquiry] = await db.select().from(inquiries).where(eq(inquiries.id, id));
    return inquiry || undefined;
  }

  async createInquiry(inquiry: InsertInquiry): Promise<Inquiry> {
     // Fetch tour name before inserting
     const tour = await this.getTour(inquiry.tourId);
     if (!tour) {
         // It's better to throw an error here so the route can catch it and return 400/500
         throw new Error(`Tour with ID ${inquiry.tourId} not found.`);
     }

    const [newInquiry] = await db
      .insert(inquiries)
      .values({
        ...inquiry,
        tourName: tour.title, // Use the fetched tour name
        createdAt: new Date(),
        handled: false
      })
      .returning();
    return newInquiry;
  }

  async updateInquiry(id: number, inquiryUpdate: Partial<Inquiry>): Promise<Inquiry | undefined> {
    // Prevent accidentally updating createdAt or tourName/tourId via PATCH
    const { createdAt, tourId, tourName, ...updateData } = inquiryUpdate;
    const [updatedInquiry] = await db
      .update(inquiries)
      .set(updateData)
      .where(eq(inquiries.id, id))
      .returning();
    return updatedInquiry || undefined;
  }

  async deleteInquiry(id: number): Promise<boolean> {
    const result = await db.delete(inquiries).where(eq(inquiries.id, id)).returning();
    return result.length > 0;
  }

  // --- Testimonial methods ---
  async getTestimonials(): Promise<Testimonial[]> {
    return await db.select().from(testimonials);
  }

  async getTestimonial(id: number): Promise<Testimonial | undefined> {
    const [testimonial] = await db.select().from(testimonials).where(eq(testimonials.id, id));
    return testimonial || undefined;
  }

  async createTestimonial(testimonial: InsertTestimonial): Promise<Testimonial> {
    const [newTestimonial] = await db.insert(testimonials).values(testimonial).returning();
    return newTestimonial;
  }

  async updateTestimonial(id: number, testimonialUpdate: Partial<InsertTestimonial>): Promise<Testimonial | undefined> {
    // Optionally validate partial data if needed using .partial()
    // const validatedUpdate = insertTestimonialSchema.partial().parse(testimonialUpdate);
    const [updatedTestimonial] = await db
      .update(testimonials)
      .set(testimonialUpdate) // Use the partial update directly
      .where(eq(testimonials.id, id))
      .returning();
    return updatedTestimonial || undefined;
 }

 async deleteTestimonial(id: number): Promise<boolean> {
    const result = await db
      .delete(testimonials)
      .where(eq(testimonials.id, id))
      .returning(); // Check if any row was returned (meaning deletion happened)
    return result.length > 0;
 }

  // --- Gallery methods ---
  async getGalleryImages(): Promise<GalleryImage[]> {
      return await db.select().from(galleryImages);
  }

  async getGalleryImage(id: number): Promise<GalleryImage | undefined> {
    const [image] = await db.select().from(galleryImages).where(eq(galleryImages.id, id));
    return image || undefined;
  }

  async createGalleryImage(image: InsertGalleryImage): Promise<GalleryImage> {
    const [newImage] = await db.insert(galleryImages).values(image).returning();
    return newImage;
  }

  // --- Newsletter methods ---
  async addNewsletterSubscriber(subscriber: InsertNewsletter): Promise<NewsletterSubscriber> {
    const [newSubscriber] = await db
      .insert(newsletterSubscribers)
      .values({
        ...subscriber,
        createdAt: new Date()
      })
      .onConflictDoNothing({ target: newsletterSubscribers.email }) // Specify target for conflict
      .returning();

    // If conflict occurred (insertion didn't happen), fetch the existing record
    if (!newSubscriber) {
        const [existing] = await db.select().from(newsletterSubscribers).where(eq(newsletterSubscribers.email, subscriber.email));
        if (!existing) {
            // This case should be rare/impossible if the conflict was due to the email
            throw new Error("Database error: Failed to insert or find newsletter subscriber after conflict.");
        }
        return existing;
    }
    return newSubscriber;
  }

  // --- Contact methods ---
  async getContactMessages(): Promise<ContactMessage[]> {
      return await db.select().from(contactMessages).orderBy(sql`${contactMessages.createdAt} DESC`);
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
     // Prevent accidentally updating createdAt
     const { createdAt, ...updateData } = messageUpdate;
    const [updatedMessage] = await db
      .update(contactMessages)
      .set(updateData)
      .where(eq(contactMessages.id, id))
      .returning();
    return updatedMessage || undefined;
  }

  async deleteContactMessage(id: number): Promise<boolean> {
    const result = await db.delete(contactMessages).where(eq(contactMessages.id, id)).returning();
    return result.length > 0;
  }

  // --- Admin dashboard stats ---
  async getStats(): Promise<{ tours: number; inquiries: number; messages: number }> {
    // Use sql<number> and cast for potentially large counts
    const tourCountResult = await db.select({ count: sql<number>`cast(count(*) as int)` }).from(tours);
    // Example: Count only *unhandled* inquiries/messages for the stats if desired
    const inquiryCountResult = await db.select({ count: sql<number>`cast(count(*) as int)` }).from(inquiries).where(eq(inquiries.handled, false));
    const messageCountResult = await db.select({ count: sql<number>`cast(count(*) as int)` }).from(contactMessages).where(eq(contactMessages.handled, false));

    // Or count all:
    // const inquiryCountResult = await db.select({ count: sql<number>`cast(count(*) as int)` }).from(inquiries);
    // const messageCountResult = await db.select({ count: sql<number>`cast(count(*) as int)` }).from(contactMessages);


    return {
      tours: tourCountResult[0]?.count ?? 0,
      inquiries: inquiryCountResult[0]?.count ?? 0,
      messages: messageCountResult[0]?.count ?? 0,
    };
  }

  // --- About Page Content methods ---
  async getAboutPageContent(): Promise<AboutPageContent | undefined> {
    const [content] = await db.select().from(aboutPageContent).where(eq(aboutPageContent.id, 1));
    return content || undefined;
  }

  async updateAboutPageContent(contentUpdate: InsertAboutPageContent): Promise<AboutPageContent | undefined> {
     // Drizzle needs the actual column names from the schema for the 'set' object keys
     // when using sql`excluded."columnName"` syntax.
     const updateValues = {
        mainHeading: sql`excluded."mainHeading"`,
        imageUrl: sql`excluded."imageUrl"`,
        imageAlt: sql`excluded."imageAlt"`,
        historyText: sql`excluded."historyText"`,
        missionText: sql`excluded."missionText"`,
        philosophyHeading: sql`excluded."philosophyHeading"`,
        philosophyQuote: sql`excluded."philosophyQuote"`,
        value1Title: sql`excluded."value1Title"`,
        value1Text: sql`excluded."value1Text"`,
        value2Title: sql`excluded."value2Title"`,
        value2Text: sql`excluded."value2Text"`,
        value3Title: sql`excluded."value3Title"`,
        value3Text: sql`excluded."value3Text"`,
        updatedAt: new Date(), // Explicitly set updatedAt on UPDATE
     };

    const [updatedContent] = await db
      .insert(aboutPageContent)
      .values({ id: 1, ...contentUpdate }) // Pass the validated data, ensuring id is 1
      .onConflictDoUpdate({
        target: aboutPageContent.id, // Conflict target: the primary key column
        set: updateValues
      })
      .returning(); // Return the inserted or updated row

    return updatedContent || undefined;
  }
}

// Instantiate and export the storage singleton HERE
export const storage: IStorage = new DatabaseStorage();