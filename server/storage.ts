import type session from "express-session";
import type {
  User, InsertUser,
  SiteSettings, InsertSiteSettings,
  HomePageContent, InsertHomePageContent,
  Tour, InsertTour,
  Inquiry, InsertInquiry,
  Testimonial, InsertTestimonial,
  GalleryImage, InsertGalleryImage,
  NewsletterSubscriber, InsertNewsletter,
  ContactMessage, InsertContact,
  AboutPageContent, InsertAboutPageContent,
} from "@shared/schema";

// Define the interface ONLY in this file
export interface IStorage {
  sessionStore: session.Store; // Add sessionStore to the interface

  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  //Site Settings methods
  getSiteSettings(): Promise<SiteSettings | undefined>;
  updateSiteSettings(settings: InsertSiteSettings): Promise<SiteSettings | undefined>;

  // Home Page Content methods
  getHomePageContent(): Promise<HomePageContent | undefined>;
  updateHomePageContent(content: InsertHomePageContent): Promise<HomePageContent | undefined>;

  // Tour methods
  getTours(): Promise<Tour[]>;
  getTour(id: number): Promise<Tour | undefined>;
  getFeaturedTours(): Promise<Tour[]>;
  createTour(tour: InsertTour): Promise<Tour>;
  updateTour(id: number, tour: Partial<InsertTour>): Promise<Tour | undefined>;
  deleteTour(id: number): Promise<boolean>;

  // Inquiry methods
  getInquiries(): Promise<Inquiry[]>;
  getInquiry(id: number): Promise<Inquiry | undefined>;
  createInquiry(inquiry: InsertInquiry): Promise<Inquiry>;
  updateInquiry(id: number, inquiry: Partial<Inquiry>): Promise<Inquiry | undefined>;
  deleteInquiry(id: number): Promise<boolean>;

  // Testimonial methods
  getTestimonials(): Promise<Testimonial[]>;
  getTestimonial(id: number): Promise<Testimonial | undefined>;
  createTestimonial(testimonial: InsertTestimonial): Promise<Testimonial>;
  updateTestimonial(id: number, testimonialUpdate: Partial<InsertTestimonial>): Promise<Testimonial | undefined>; 
  deleteTestimonial(id: number): Promise<boolean>; 


  // Gallery methods
  getGalleryImages(): Promise<GalleryImage[]>;
  getGalleryImage(id: number): Promise<GalleryImage | undefined>;
  createGalleryImage(image: InsertGalleryImage): Promise<GalleryImage>;

  // Newsletter methods
  addNewsletterSubscriber(subscriber: InsertNewsletter): Promise<NewsletterSubscriber>;

  // Contact methods
  getContactMessages(): Promise<ContactMessage[]>;
  createContactMessage(message: InsertContact): Promise<ContactMessage>;
  updateContactMessage(id: number, message: Partial<ContactMessage>): Promise<ContactMessage | undefined>;
  deleteContactMessage(id: number): Promise<boolean>;

  // Admin dashboard stats
  getStats(): Promise<{ tours: number; inquiries: number; messages: number }>;

  // About Page Content methods
  getAboutPageContent(): Promise<AboutPageContent | undefined>;
  updateAboutPageContent(content: InsertAboutPageContent): Promise<AboutPageContent | undefined>;
}
