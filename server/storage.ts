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
import connectPg from "connect-pg-simple";
import session from "express-session";

// modify the interface with any CRUD methods
// you might need
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
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
  getStats(): Promise<{ tours: number, inquiries: number, messages: number }>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private tours: Map<number, Tour>;
  private inquiries: Map<number, Inquiry>;
  private testimonials: Map<number, Testimonial>;
  private galleryImages: Map<number, GalleryImage>;
  private newsletterSubscribers: Map<number, NewsletterSubscriber>;
  private contactMessages: Map<number, ContactMessage>;
  
  private currentUserId: number;
  private currentTourId: number;
  private currentInquiryId: number;
  private currentTestimonialId: number;
  private currentGalleryImageId: number;
  private currentNewsletterSubscriberId: number;
  private currentContactMessageId: number;

  constructor() {
    this.users = new Map();
    this.tours = new Map();
    this.inquiries = new Map();
    this.testimonials = new Map();
    this.galleryImages = new Map();
    this.newsletterSubscribers = new Map();
    this.contactMessages = new Map();
    
    this.currentUserId = 1;
    this.currentTourId = 1;
    this.currentInquiryId = 1;
    this.currentTestimonialId = 1;
    this.currentGalleryImageId = 1;
    this.currentNewsletterSubscriberId = 1;
    this.currentContactMessageId = 1;
    
    // Initialize with sample data
    this.initializeData();
  }

  private initializeData() {
    // Add admin user
    this.createUser({
      username: "admin",
      password: "bhutan123", // In a real app, this would be properly hashed
    });
    
    // Add tours
    this.createTour({
      title: "Tiger's Nest Pilgrimage",
      description: "Follow the sacred path to Paro Taktsang, where Guru Rinpoche meditated for three years, three months, three weeks, three days and three hours in the 8th century.",
      longDescription: "The journey to Paro Taktsang (Tiger's Nest) follows in the footsteps of Guru Rinpoche, who brought Buddhism to Bhutan in the 8th century. Legend tells that he flew to this precipitous cliff on the back of a tigress, his consort Yeshe Tsogyal in transformed form, to subdue local demons.",
      duration: "7 Days / 6 Nights",
      difficulty: "Moderate",
      accommodation: "Heritage hotels and traditional farmhouses",
      groupSize: "Maximum 12 pilgrims",
      price: 2850,
      imageType: "tigerNest",
      itinerary: [
        {
          day: 1,
          title: "Arrival in Paro",
          description: "Traditional welcome ceremony at your heritage accommodation. Evening prayers at Kyichu Lhakhang, one of Bhutan's oldest temples dating to the 7th century."
        },
        {
          day: 2,
          title: "Drukgyel Dzong & Preparation",
          description: "Visit the ruins of Drukgyel Dzong, built in 1649 to commemorate Bhutan's victory over Tibetan invaders. Afternoon meeting with a Buddhist scholar to prepare for tomorrow's pilgrimage."
        },
        {
          day: 3,
          title: "Tiger's Nest Pilgrimage",
          description: "Pre-dawn blessing ceremony, followed by the ascent to Taktsang. Meditation and prayers within the monastery's sacred chambers. Return descent with time for reflection at the prayer wheel pavilion."
        }
      ],
      featured: true
    });
    
    this.createTour({
      title: "Bumthang Sacred Circuit",
      description: "Journey through Bhutan's spiritual heartland, visiting ancient temples including Jambay Lhakhang, built in 659 CE, and Kurjey Lhakhang, where Guru Rinpoche left his body imprint.",
      longDescription: "Bumthang Valley is considered the spiritual heart of Bhutan, home to some of the oldest Buddhist temples and monasteries in the kingdom. This journey takes you through four valleys filled with sacred sites, each with its own mystical history and significance.",
      duration: "10 Days / 9 Nights",
      difficulty: "Moderate",
      accommodation: "Heritage lodges and monastery guesthouses",
      groupSize: "Maximum 10 pilgrims",
      price: 3200,
      imageType: "bumthang",
      itinerary: [
        {
          day: 1,
          title: "Arrival in Paro and Transfer to Thimphu",
          description: "Welcome ceremony and transfer to Bhutan's capital. Evening visit to the Great Buddha Dordenma statue for sunset prayers."
        },
        {
          day: 2,
          title: "Journey to Punakha",
          description: "Cross the Dochula Pass with its 108 chortens. Visit Chimi Lhakhang, temple of the Divine Madman."
        },
        {
          day: 3,
          title: "Trongsa and Arrival in Bumthang",
          description: "Visit the impressive Trongsa Dzong, ancestral home of Bhutan's royal family. Continue to the sacred valleys of Bumthang."
        }
      ],
      featured: true
    });
    
    this.createTour({
      title: "Druk Path Trek",
      description: "Walk the ancient mountain route connecting Paro and Thimphu, passing through forests, alpine lakes, and yak herder settlements unchanged for centuries.",
      longDescription: "The Druk Path is one of Bhutan's classic treks, following an ancient trading route over the mountains between Paro and Thimphu. This journey takes you through stunning landscapes while connecting you with the spiritual essence of Bhutan's natural world.",
      duration: "5 Days / 4 Nights",
      difficulty: "Challenging",
      accommodation: "Traditional camping and mountain huts",
      groupSize: "Maximum 8 pilgrims",
      price: 1950,
      imageType: "drukPath",
      itinerary: [
        {
          day: 1,
          title: "Paro to Jele Dzong",
          description: "Begin your pilgrimage with a blessing at Paro Dzong, then ascend through pine forests to the ancient Jele Dzong, perched at 3,570m."
        },
        {
          day: 2,
          title: "Jele Dzong to Jangchulakha",
          description: "Trek along ridge lines with views of Mount Chomolhari. Pass through rhododendron forests to yak herding grounds."
        },
        {
          day: 3,
          title: "Jangchulakha to Jimilang Tsho",
          description: "Hike to the sacred Jimilang Tsho (Sand Ox Lake), known for its giant trout and spiritual significance."
        }
      ],
      featured: true
    });
    
    // Add testimonials
    this.createTestimonial({
      name: "Sarah M.",
      location: "United States",
      content: "The journey to Tiger's Nest wasn't just a trek, but a transformation. Our guide shared stories and rituals that connected us to centuries of pilgrims before us."
    });
    
    this.createTestimonial({
      name: "David L.",
      location: "United Kingdom",
      content: "Sacred Bhutan Travels provided an experience beyond a typical tour. The attention to historical detail and spiritual significance made each moment deeply meaningful."
    });
    
    // Add gallery images
    this.createGalleryImage({
      caption: "Punakha Dzong",
      type: "dzong"
    });
    
    this.createGalleryImage({
      caption: "Prayer Flags in the Mountains",
      type: "prayerFlags"
    });
    
    this.createGalleryImage({
      caption: "Bhutanese Monks",
      type: "monks"
    });
    
    this.createGalleryImage({
      caption: "Temple Interior",
      type: "temple"
    });
    
    this.createGalleryImage({
      caption: "Mountain Landscape",
      type: "mountains"
    });
    
    this.createGalleryImage({
      caption: "Traditional Bhutanese Mask",
      type: "mask"
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(user: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const newUser: User = { ...user, id };
    this.users.set(id, newUser);
    return newUser;
  }
  
  // Tour methods
  async getTours(): Promise<Tour[]> {
    return Array.from(this.tours.values());
  }
  
  async getTour(id: number): Promise<Tour | undefined> {
    return this.tours.get(id);
  }
  
  async getFeaturedTours(): Promise<Tour[]> {
    return Array.from(this.tours.values()).filter(tour => tour.featured);
  }
  
  async createTour(tour: InsertTour): Promise<Tour> {
    const id = this.currentTourId++;
    const newTour: Tour = { ...tour, id };
    this.tours.set(id, newTour);
    return newTour;
  }
  
  async updateTour(id: number, tourUpdate: Partial<InsertTour>): Promise<Tour | undefined> {
    const existingTour = this.tours.get(id);
    if (!existingTour) return undefined;
    
    const updatedTour = { ...existingTour, ...tourUpdate };
    this.tours.set(id, updatedTour);
    return updatedTour;
  }
  
  async deleteTour(id: number): Promise<boolean> {
    return this.tours.delete(id);
  }
  
  // Inquiry methods
  async getInquiries(): Promise<Inquiry[]> {
    return Array.from(this.inquiries.values());
  }
  
  async getInquiry(id: number): Promise<Inquiry | undefined> {
    return this.inquiries.get(id);
  }
  
  async createInquiry(inquiry: InsertInquiry): Promise<Inquiry> {
    const id = this.currentInquiryId++;
    const createdAt = new Date();
    const handled = false;
    
    const newInquiry: Inquiry = { ...inquiry, id, createdAt, handled };
    this.inquiries.set(id, newInquiry);
    return newInquiry;
  }
  
  async updateInquiry(id: number, inquiryUpdate: Partial<Inquiry>): Promise<Inquiry | undefined> {
    const existingInquiry = this.inquiries.get(id);
    if (!existingInquiry) return undefined;
    
    const updatedInquiry = { ...existingInquiry, ...inquiryUpdate };
    this.inquiries.set(id, updatedInquiry);
    return updatedInquiry;
  }
  
  async deleteInquiry(id: number): Promise<boolean> {
    return this.inquiries.delete(id);
  }
  
  // Testimonial methods
  async getTestimonials(): Promise<Testimonial[]> {
    return Array.from(this.testimonials.values());
  }
  
  async getTestimonial(id: number): Promise<Testimonial | undefined> {
    return this.testimonials.get(id);
  }
  
  async createTestimonial(testimonial: InsertTestimonial): Promise<Testimonial> {
    const id = this.currentTestimonialId++;
    const newTestimonial: Testimonial = { ...testimonial, id };
    this.testimonials.set(id, newTestimonial);
    return newTestimonial;
  }
  
  // Gallery methods
  async getGalleryImages(): Promise<GalleryImage[]> {
    return Array.from(this.galleryImages.values());
  }
  
  async getGalleryImage(id: number): Promise<GalleryImage | undefined> {
    return this.galleryImages.get(id);
  }
  
  async createGalleryImage(image: InsertGalleryImage): Promise<GalleryImage> {
    const id = this.currentGalleryImageId++;
    const newImage: GalleryImage = { ...image, id };
    this.galleryImages.set(id, newImage);
    return newImage;
  }
  
  // Newsletter methods
  async addNewsletterSubscriber(subscriber: InsertNewsletter): Promise<NewsletterSubscriber> {
    // Check if email already exists
    const existingSubscriber = Array.from(this.newsletterSubscribers.values()).find(
      (sub) => sub.email === subscriber.email
    );
    
    if (existingSubscriber) {
      return existingSubscriber;
    }
    
    const id = this.currentNewsletterSubscriberId++;
    const createdAt = new Date();
    const newSubscriber: NewsletterSubscriber = { ...subscriber, id, createdAt };
    this.newsletterSubscribers.set(id, newSubscriber);
    return newSubscriber;
  }
  
  // Contact methods
  async getContactMessages(): Promise<ContactMessage[]> {
    return Array.from(this.contactMessages.values());
  }
  
  async createContactMessage(message: InsertContact): Promise<ContactMessage> {
    const id = this.currentContactMessageId++;
    const createdAt = new Date();
    const handled = false;
    
    const newMessage: ContactMessage = { ...message, id, createdAt, handled };
    this.contactMessages.set(id, newMessage);
    return newMessage;
  }
  
  async updateContactMessage(id: number, messageUpdate: Partial<ContactMessage>): Promise<ContactMessage | undefined> {
    const existingMessage = this.contactMessages.get(id);
    if (!existingMessage) return undefined;
    
    const updatedMessage = { ...existingMessage, ...messageUpdate };
    this.contactMessages.set(id, updatedMessage);
    return updatedMessage;
  }
  
  async deleteContactMessage(id: number): Promise<boolean> {
    return this.contactMessages.delete(id);
  }
  
  // Admin dashboard stats
  async getStats(): Promise<{ tours: number, inquiries: number, messages: number }> {
    return {
      tours: this.tours.size,
      inquiries: this.inquiries.size,
      messages: this.contactMessages.size
    };
  }
}

// Database storage implementation
import { eq, sql } from "drizzle-orm";
import { db, pool } from "./db";
import connectPg from "connect-pg-simple";
import session from "express-session";

const PostgresSessionStore = connectPg(session);

export class DatabaseStorage implements IStorage {
  sessionStore: session.SessionStore;

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
    return await db.select().from(tours);
  }
  
  async getTour(id: number): Promise<Tour | undefined> {
    const [tour] = await db.select().from(tours).where(eq(tours.id, id));
    return tour || undefined;
  }
  
  async getFeaturedTours(): Promise<Tour[]> {
    return await db.select().from(tours).where(eq(tours.featured, true));
  }
  
  async createTour(tour: InsertTour): Promise<Tour> {
    const [newTour] = await db
      .insert(tours)
      .values(tour)
      .returning();
    return newTour;
  }
  
  async updateTour(id: number, tourUpdate: Partial<InsertTour>): Promise<Tour | undefined> {
    const [updatedTour] = await db
      .update(tours)
      .set(tourUpdate)
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

export const storage = new DatabaseStorage();
