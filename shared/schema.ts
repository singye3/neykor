import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Tours table
export const tours = pgTable("tours", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  longDescription: text("longDescription").notNull(),
  duration: text("duration").notNull(), // e.g. "7 Days / 6 Nights"
  difficulty: text("difficulty").notNull(), // Easy, Moderate, Challenging
  accommodation: text("accommodation").notNull(),
  groupSize: text("groupSize").notNull(),
  price: integer("price").notNull(), // in USD
  imageType: text("imageType"), // For frontend reference
  itinerary: json("itinerary").notNull().$type<ItineraryDay[]>(),
  featured: boolean("featured").default(false),
});

export interface ItineraryDay {
  day: number;
  title: string;
  description: string;
}

export const insertTourSchema = createInsertSchema(tours).omit({
  id: true,
});

export type InsertTour = z.infer<typeof insertTourSchema>;
export type Tour = typeof tours.$inferSelect;

// Inquiries table
export const inquiries = pgTable("inquiries", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  message: text("message").notNull(),
  tourId: integer("tourId").notNull(),
  tourName: text("tourName").notNull(),
  handled: boolean("handled").default(false),
  createdAt: timestamp("createdAt").defaultNow(),
});

export const insertInquirySchema = createInsertSchema(inquiries).omit({
  id: true,
  handled: true,
  createdAt: true,
});

export type InsertInquiry = z.infer<typeof insertInquirySchema>;
export type Inquiry = typeof inquiries.$inferSelect;

// Testimonials table
export const testimonials = pgTable("testimonials", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  location: text("location").notNull(),
  content: text("content").notNull(),
});

export const insertTestimonialSchema = createInsertSchema(testimonials).omit({
  id: true,
});

export type InsertTestimonial = z.infer<typeof insertTestimonialSchema>;
export type Testimonial = typeof testimonials.$inferSelect;

// Gallery images table
export const galleryImages = pgTable("galleryImages", {
  id: serial("id").primaryKey(),
  caption: text("caption").notNull(),
  type: text("type").notNull(), // corresponds to image type keys in getImageUrl
});

export const insertGalleryImageSchema = createInsertSchema(galleryImages).omit({
  id: true,
});

export type InsertGalleryImage = z.infer<typeof insertGalleryImageSchema>;
export type GalleryImage = typeof galleryImages.$inferSelect;

// Newsletter subscribers
export const newsletterSubscribers = pgTable("newsletterSubscribers", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  createdAt: timestamp("createdAt").defaultNow(),
});

export const insertNewsletterSchema = createInsertSchema(newsletterSubscribers).pick({
  email: true,
});

export type InsertNewsletter = z.infer<typeof insertNewsletterSchema>;
export type NewsletterSubscriber = typeof newsletterSubscribers.$inferSelect;

// Contact messages
export const contactMessages = pgTable("contactMessages", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  handled: boolean("handled").default(false),
  createdAt: timestamp("createdAt").defaultNow(),
});

export const insertContactSchema = createInsertSchema(contactMessages).omit({
  id: true,
  handled: true,
  createdAt: true,
});

export type InsertContact = z.infer<typeof insertContactSchema>;
export type ContactMessage = typeof contactMessages.$inferSelect;


// ==========================================
// NEW: About Page Content table
// ==========================================
export const aboutPageContent = pgTable("aboutPageContent", {
  id: serial("id").primaryKey(), // Use ID 1 for the single content entry
  mainHeading: text("mainHeading").notNull().default("Our Sacred Journey"),
  imageUrl: text("imageUrl").notNull().default(""), // Store the full image URL
  imageAlt: text("imageAlt").notNull().default("Bhutanese Guide"),
  historyText: text("historyText").notNull().default(""),
  missionText: text("missionText").notNull().default(""),
  philosophyHeading: text("philosophyHeading").notNull().default("Our Philosophy"),
  philosophyQuote: text("philosophyQuote").notNull().default(""),
  value1Title: text("value1Title").notNull().default("Authenticity"),
  value1Text: text("value1Text").notNull().default(""),
  value2Title: text("value2Title").notNull().default("Respect"),
  value2Text: text("value2Text").notNull().default(""),
  value3Title: text("value3Title").notNull().default("Knowledge"),
  value3Text: text("value3Text").notNull().default(""),
  updatedAt: timestamp("updatedAt").defaultNow(), // .onUpdateNow() might need explicit handling in UPSERT
});

// Zod schema for validation (omit id and updatedAt for inserts/updates)
export const upsertAboutPageContentSchema = createInsertSchema(aboutPageContent).omit({
  id: true,
  updatedAt: true,
});

export type InsertAboutPageContent = z.infer<typeof upsertAboutPageContentSchema>;
export type AboutPageContent = typeof aboutPageContent.$inferSelect;