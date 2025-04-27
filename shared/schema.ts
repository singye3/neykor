import { pgTable, text, serial, integer, boolean, timestamp, json, index, varchar } from "drizzle-orm/pg-core";
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

// ---Schema for Password Change ---
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, { message: "Current password is required" }),
  newPassword: z.string().min(6, { message: "New password must be at least 6 characters long" }),
});

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

// --- Schema for Username Change ---
export const changeUsernameSchema = z.object({
  newUsername: z.string().min(3, { message: "New username must be at least 3 characters long"}),
  currentPassword: z.string().min(1, { message: "Current password is required to change username" }),
});
export type ChangeUsernameInput = z.infer<typeof changeUsernameSchema>;

// ==========================================
// NEW: Site Settings table
// ==========================================
export const siteSettings = pgTable("siteSettings", {
  id: serial("id").primaryKey(), // Use ID 1 for the single entry
  siteName: text("siteName").notNull().default("Sacred Bhutan Travels"),
  updatedAt: timestamp("updatedAt").defaultNow(),
});

// Zod schema for validation (omit id and updatedAt for updates)
export const upsertSiteSettingsSchema = createInsertSchema(siteSettings).omit({
  id: true,
  updatedAt: true,
});

export type InsertSiteSettings = z.infer<typeof upsertSiteSettingsSchema>;
export type SiteSettings = typeof siteSettings.$inferSelect

// ==========================================
// NEW: Home Page Content table
// ==========================================
export const homePageContent = pgTable("homePageContent", {
  id: serial("id").primaryKey(), // Use ID 1 for the single entry

  // Hero Section
  heroImageURL: text("heroImageURL").notNull().default(""),
  heroImageAlt: text("heroImageAlt").notNull().default("Ancient Bhutanese Temple"),
  heroHeadingLine1: text("heroHeadingLine1").notNull().default("Walk the Ancient Paths:"),
  heroHeadingLine2: text("heroHeadingLine2").notNull().default("Bhutan Pilgrimage Through the Ages"),
  heroParagraph: text("heroParagraph").notNull().default("Discover pilgrimages steeped in history..."),
  heroButtonText: text("heroButtonText").notNull().default("Explore Our Sacred Routes"),

  // Introduction Section
  introHeading: text("introHeading").notNull().default("Ancient Tradition, Timeless Journey"),
  introParagraph1: text("introParagraph1").notNull().default("Sacred Bhutan Travels invites you..."),
  introParagraph2: text("introParagraph2").notNull().default("Each pilgrimage follows routes..."),

  // Featured Pilgrimages Section
  featuredHeading: text("featuredHeading").notNull().default("Our Sacred Journeys"),
  featuredMapURL: text("featuredMapURL").notNull().default(""),
  featuredMapAlt: text("featuredMapAlt").notNull().default("Vintage-style map of Bhutan"),
  featuredMapCaption: text("featuredMapCaption").notNull().default("Ancient cartography revealing..."),
  featuredButtonText: text("featuredButtonText").notNull().default("View All Pilgrimages"),

  // Image Carousel Section (Only heading is static here)
  carouselHeading: text("carouselHeading").notNull().default("Moments from Our Journeys"),

  // Why Choose Us Section
  whyHeading: text("whyHeading").notNull().default("Why Journey With Us"),
  why1Icon: text("why1Icon").notNull().default("☸"), // Store symbol/character
  why1Title: text("why1Title").notNull().default("Guardians of Tradition"),
  why1Text: text("why1Text").notNull().default("Our guides are descendants..."),
  why2Icon: text("why2Icon").notNull().default("📜"), // Using scroll emoji as example
  why2Title: text("why2Title").notNull().default("Deep Historical Knowledge"),
  why2Text: text("why2Text").notNull().default("Each journey is enriched..."),
  why3Icon: text("why3Icon").notNull().default("🤝"), // Using handshake emoji as example
  why3Title: text("why3Title").notNull().default("Authentic Encounters"),
  why3Text: text("why3Text").notNull().default("We create meaningful connections..."),

   // Testimonials Section (Only heading is static here)
   testimonialsHeading: text("testimonialsHeading").notNull().default("Pilgrim Chronicles"),

  // Timestamps
  updatedAt: timestamp("updatedAt").defaultNow(),
});

// Zod schema for validation (omit id and updatedAt for updates)
export const upsertHomePageContentSchema = createInsertSchema(homePageContent).omit({
  id: true,
  updatedAt: true,
});

export type InsertHomePageContent = z.infer<typeof upsertHomePageContentSchema>;
export type HomePageContent = typeof homePageContent.$inferSelect;

// Tours table
export const tours = pgTable("tours", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  longDescription: text("longDescription").notNull(),
  location: text("location").notNull(),
  duration: text("duration").notNull(),
  difficulty: text("difficulty").notNull(),
  accommodation: text("accommodation").notNull(),
  groupSize: text("groupSize").notNull(),
  price: integer("price").notNull(),
  imageType: text("imageType"),
  itinerary: json("itinerary").notNull().$type<ItineraryDay[]>(),
  featured: boolean("featured").default(false),
},
(table) => {
  return [
    index("location_idx").on(table.location),
  ];
}); // End of pgTable definition

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

export const sessions = pgTable("session", {
  sid: varchar("sid", { length: 255 }).primaryKey(), // Session ID
  sess: text("sess").notNull(),                   // Session data (often JSON as text)
  expire: timestamp("expire", { mode: 'date', withTimezone: true }).notNull() // Expiry timestamp
});

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

// Contact Form
export const contactMessages = pgTable("contactMessages", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  handled: boolean("handled").default(false),
  createdAt: timestamp("createdAt", { mode: 'date', withTimezone: true }).defaultNow(), // Added mode and timezone for clarity
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

// ==========================================
// Contact Page Settings table
// ==========================================
export const contactPageSettings = pgTable("contactPageSettings", {
  id: serial("id").primaryKey(), // ID 1
  pageHeading: text("pageHeading").notNull().default("Begin Your Journey"),
  locationHeading: text("locationHeading").notNull().default("Our Location"),
  address: text("address").notNull().default("Near Memorial Chorten, Thimphu, Kingdom of Bhutan"),
  email: text("email").notNull().default("pilgrimages@sacredbhutantravels.bt"),
  phone: text("phone").notNull().default("+975 2 333 444"),
  officeHoursHeading: text("officeHoursHeading").notNull().default("Office Hours"),
  officeHoursText: text("officeHoursText").notNull().default("Monday to Friday: 9:00 AM - 5:00 PM (Bhutan Standard Time)"),
  updatedAt: timestamp("updatedAt").defaultNow(),
});

export const upsertContactPageSettingsSchema = createInsertSchema(contactPageSettings).omit({ id: true, updatedAt: true });
export type InsertContactPageSettings = z.infer<typeof upsertContactPageSettingsSchema>;
export type ContactPageSettings = typeof contactPageSettings.$inferSelect;

// ==========================================
// Gallery Page Settings table
// ==========================================
export const galleryPageSettings = pgTable("galleryPageSettings", {
  id: serial("id").primaryKey(), // ID 1
  pageHeading: text("pageHeading").notNull().default("Sacred Visions"),
  pageParagraph: text("pageParagraph").notNull().default("Explore our visual chronicle..."),
  updatedAt: timestamp("updatedAt").defaultNow(),
});

export const upsertGalleryPageSettingsSchema = createInsertSchema(galleryPageSettings).omit({ id: true, updatedAt: true });
export type InsertGalleryPageSettings = z.infer<typeof upsertGalleryPageSettingsSchema>;
export type GalleryPageSettings = typeof galleryPageSettings.$inferSelect;