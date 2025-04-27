import type session from "express-session";
import type {
  User, InsertUser,
  SiteSettings, InsertSiteSettings,
  HomePageContent, InsertHomePageContent,
  Tour, InsertTour,
  Inquiry, InsertInquiry,
  Testimonial, InsertTestimonial,
  ContactMessage, InsertContact,
  AboutPageContent, InsertAboutPageContent,
  ContactPageSettings, InsertContactPageSettings,
  GalleryPageSettings, InsertGalleryPageSettings
} from "@shared/schema";

// Define the filter structure for getTours
export interface TourFilters {
  location?: string;
}

// Define the IStorage interface ONLY in this file
export interface IStorage {
  sessionStore: session.Store; // Session store implementation

  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserPassword(userId: number, newHashedPassword: string): Promise<boolean>;
  updateUserUsername(userId: number, newUsername: string): Promise<boolean>;

  //Site Settings methods
  getSiteSettings(): Promise<SiteSettings | undefined>;
  updateSiteSettings(settings: InsertSiteSettings): Promise<SiteSettings | undefined>;

  // Home Page Content methods
  getHomePageContent(): Promise<HomePageContent | undefined>;
  updateHomePageContent(content: InsertHomePageContent): Promise<HomePageContent | undefined>;

  // Tour methods
  // UPDATED: getTours now accepts an optional filters object
  getTours(filters?: TourFilters): Promise<Tour[]>;
  getTour(id: number): Promise<Tour | undefined>;
  getFeaturedTours(): Promise<Tour[]>;
  createTour(tour: InsertTour): Promise<Tour>; // Should include location
  updateTour(id: number, tour: Partial<InsertTour>): Promise<Tour | undefined>; // Should allow updating location
  deleteTour(id: number): Promise<boolean>;

  // Inquiry methods
  getInquiries(): Promise<Inquiry[]>;
  getInquiry(id: number): Promise<Inquiry | undefined>;
  createInquiry(inquiry: InsertInquiry): Promise<Inquiry>;
  updateInquiry(id: number, inquiryUpdate: Partial<Pick<Inquiry, 'handled'>>): Promise<Inquiry | undefined>; // Typically only update 'handled' status
  deleteInquiry(id: number): Promise<boolean>;

  // Testimonial methods
  getTestimonials(): Promise<Testimonial[]>;
  getTestimonial(id: number): Promise<Testimonial | undefined>;
  createTestimonial(testimonial: InsertTestimonial): Promise<Testimonial>;
  updateTestimonial(id: number, testimonialUpdate: Partial<InsertTestimonial>): Promise<Testimonial | undefined>;
  deleteTestimonial(id: number): Promise<boolean>;


  // Contact Message methods
  getContactMessages(): Promise<ContactMessage[]>;
  createContactMessage(message: InsertContact): Promise<ContactMessage>;
  updateContactMessage(id: number, messageUpdate: Partial<Pick<ContactMessage, 'handled'>>): Promise<ContactMessage | undefined>; // Typically only update 'handled' status
  deleteContactMessage(id: number): Promise<boolean>;

  // Admin dashboard stats
  getStats(): Promise<{ tours: number; inquiries: number; messages: number }>;

  // About Page Content methods
  getAboutPageContent(): Promise<AboutPageContent | undefined>;
  updateAboutPageContent(content: InsertAboutPageContent): Promise<AboutPageContent | undefined>;

  // Contact Page Settings methods
  getContactPageSettings(): Promise<ContactPageSettings | undefined>;
  updateContactPageSettings(settings: InsertContactPageSettings): Promise<ContactPageSettings | undefined>;

  // Gallery Page Settings methods
  getGalleryPageSettings(): Promise<GalleryPageSettings | undefined>;
  updateGalleryPageSettings(settings: InsertGalleryPageSettings): Promise<GalleryPageSettings | undefined>;
}