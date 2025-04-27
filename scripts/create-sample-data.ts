// scripts/create-sample-data.ts
import 'dotenv/config';
import { db } from "../server/db.ts"; // Using .ts extension for ESM compatibility
import { eq, sql } from "drizzle-orm";
import {
  tours, type ItineraryDay,
  testimonials,
  galleryImages,
  aboutPageContent,
  homePageContent, // Import the homePageContent table schema
  siteSettings,
  galleryPageSettings,
  contactPageSettings
} from "../shared/schema.ts"; // Using .ts extension

async function createSampleData() {
  console.log("Starting sample data creation...");
  try {

    // ==========================================
    // Seed Site Settings (UPSERT Logic)
    // ==========================================
    const siteSettingsData = {
      id: 1, // Force ID 1
      siteName: "Sacred Bhutan Travels",
      updatedAt: new Date()
    };
    await db.insert(siteSettings)
      .values(siteSettingsData)
      .onConflictDoUpdate({
        target: siteSettings.id,
        set: { 
          siteName: siteSettingsData.siteName,
          updatedAt: new Date()
        }
      });
      
    // ==========================================
    // Seed Tours
    // ==========================================
    const tourData = [
      {
        title: "Singye Valley Heritage",
        description: "Explore the pristine Haa Valley, known for its unique traditions.",
        longDescription: "Discover the lesser-visited Haa Valley, offering a glimpse into traditional Bhutanese life and spirituality away from the main tourist trails.",
        location: "Paro",
        duration: "6 Days / 5 Nights",
        difficulty: "Easy",
        accommodation: "Farmhouses and local guesthouses",
        groupSize: "Maximum 10 pilgrims",
        price: 2500,
        imageType: "mountains",
        itinerary: [
            { day: 1, title: "Arrival in Paro, drive to Haa", description: "Scenic drive over the Chele La pass (approx 3,988m) to Haa Valley." },
            { day: 2, title: "Lhakhang Karpo & Nagpo", description: "Visit the ancient White and Black Temples, central to Haa's identity and history." },
            { day: 3, title: "Explore Local Villages & Hike", description: "Gentle hike through traditional villages, interact with locals, enjoy a traditional meal." },
        ] as ItineraryDay[],
        featured: false // Example of a non-featured tour
      },
    ];

    // Check if tours exist before inserting
    const existingToursCount = await db.select({ count: sql<number>`cast(count(*) as int)` }).from(tours);
    if (existingToursCount[0].count === 0) {
      console.log("Adding sample tours...");
      // Drizzle handles JSON conversion for itinerary when defined with $type
      await db.insert(tours).values(tourData);
      console.log(` -> ${tourData.length} Sample tours added successfully!`);
    } else {
      console.log("Tours already exist, skipping tour seeding.");
    }

    // ==========================================
    // Seed Testimonials
    // ==========================================
    const testimonialData = [
      { name: "Sarah M.", location: "United States", content: "The journey to Tiger's Nest wasn't just a trek, but a transformation. Our guide shared stories and rituals that connected us to centuries of pilgrims before us." },
      { name: "David L.", location: "United Kingdom", content: "Sacred Bhutan Travels provided an experience beyond a typical tour. The attention to historical detail and spiritual significance made each moment deeply meaningful." },
      { name: "Aisha K.", location: "Canada", content: "The Bumthang circuit was magical. Our guide's knowledge was incredible, bringing the ancient sites to life." },
    ];

    const existingTestimonialsCount = await db.select({ count: sql<number>`cast(count(*) as int)` }).from(testimonials);
    if (existingTestimonialsCount[0].count === 0) {
      console.log("Adding sample testimonials...");
      await db.insert(testimonials).values(testimonialData);
      console.log(` -> ${testimonialData.length} Sample testimonials added successfully!`);
    } else {
      console.log("Testimonials already exist, skipping testimonial seeding.");
    }

    // ==========================================
    // Seed Gallery Images
    // ==========================================
    const galleryData = [
      { caption: "Punakha Dzong at confluence", type: "dzong" },
      { caption: "Prayer Flags on Chele La Pass", type: "prayerFlags" },
      { caption: "Young Monks studying scriptures", type: "monks" },
      { caption: "Intricate Altar Detail, Kurjey Lhakhang", type: "temple" },
      { caption: "Himalayan Peaks near Jomolhari Base Camp", type: "mountains" },
      { caption: "Mahakala Dance Mask from Paro Tshechu", type: "mask" },
      { caption: "Taktsang Monastery Clinging to Cliff", type: "tigerNest" },
      { caption: "Jakar Dzong overlooking Bumthang Valley", type: "bumthang" },
    ];

    const existingGalleryCount = await db.select({ count: sql<number>`cast(count(*) as int)` }).from(galleryImages);
    if (existingGalleryCount[0].count === 0) {
      console.log("Adding sample gallery images...");
      await db.insert(galleryImages).values(galleryData);
      console.log(` -> ${galleryData.length} Sample gallery images added successfully!`);
    } else {
      console.log("Gallery images already exist, skipping gallery seeding.");
    }

    // ==========================================
    // Seed About Page Content (UPSERT Logic)
    // ==========================================
    const aboutContentData = {
        id: 1, // Force ID 1
        mainHeading: 'Our Sacred Journey',
        // IMPORTANT: Replace with your actual default guide image URL
        imageUrl: 'https://ik.imagekit.io/neykor/guide_default.jpg?tr=w-600', // Example with transformation
        imageAlt: 'Bhutanese Guide in Traditional Gho near ancient temple',
        historyText: 'Sacred Bhutan Travels was founded by descendants of traditional pilgrimage guides who served the royal court of Bhutan for generations. Our heritage dates back to the 17th century, when our ancestors guided important religious figures to sacred sites throughout the kingdom.',
        missionText: 'Today, we combine this ancestral knowledge with modern expertise to create journeys that honor Bhutan\'s spiritual heritage while providing comfort and insight to international pilgrims.',
        philosophyHeading: 'Our Philosophy',
        philosophyQuote: 'We do not merely visit sacred places; we encounter them with reverence, allowing their ancient wisdom to speak to our present moment.',
        value1Title: 'Authenticity',
        value1Text: 'We present Bhutanese spirituality in its true context, avoiding commercial simplification.',
        value2Title: 'Respect',
        value2Text: 'We approach sacred sites with proper protocol, respecting local customs and traditions.',
        value3Title: 'Knowledge',
        value3Text: 'We share the deep historical and spiritual context that makes each site meaningful.',
        updatedAt: new Date() // Set current time for seeding/update
    };

    console.log("Checking/Seeding About Page Content (ID: 1)...");
    await db.insert(aboutPageContent)
      .values(aboutContentData)
      .onConflictDoUpdate({
        target: aboutPageContent.id, // Conflict on the ID column
        // Explicitly list fields to update on conflict
        set: {
          mainHeading: aboutContentData.mainHeading,
          imageUrl: aboutContentData.imageUrl,
          imageAlt: aboutContentData.imageAlt,
          historyText: aboutContentData.historyText,
          missionText: aboutContentData.missionText,
          philosophyHeading: aboutContentData.philosophyHeading,
          philosophyQuote: aboutContentData.philosophyQuote,
          value1Title: aboutContentData.value1Title,
          value1Text: aboutContentData.value1Text,
          value2Title: aboutContentData.value2Title,
          value2Text: aboutContentData.value2Text,
          value3Title: aboutContentData.value3Title,
          value3Text: aboutContentData.value3Text,
          updatedAt: new Date() // Update timestamp on conflict as well
        }
      });
    console.log(" -> About Page Content seeded/updated successfully!");


    // ==========================================
    // Seed Home Page Content (UPSERT Logic)
    // ==========================================
    const homeContentData = {
        id: 1, // Use ID 1
        // Hero Section Defaults
        heroImageURL: "https://ik.imagekit.io/neykor/hero_default.jpg?tr=w-1920", // REPLACE with actual URL!
        heroImageAlt: "Panoramic view of Paro Taktsang (Tiger's Nest) monastery",
        heroHeadingLine1: "Walk the Ancient Paths:",
        heroHeadingLine2: "Bhutan Pilgrimage Through the Ages",
        heroParagraph: "Discover pilgrimages steeped in history, connecting you to centuries of spiritual tradition in the Land of the Thunder Dragon.",
        heroButtonText: "Explore Our Sacred Routes",
        // Introduction Section Defaults
        introHeading: "Ancient Tradition, Timeless Journey",
        introParagraph1: "Sacred Bhutan Travels invites you to walk paths worn smooth by centuries of pilgrims. Our journeys are not mere tours, but profound experiences that connect you with Bhutan's living spiritual heritage.",
        introParagraph2: "Each pilgrimage follows routes established by revered masters and saints, revealing monasteries tucked into mist-shrouded mountains, sacred lakes that mirror the heavens, and temples that have witnessed the unfolding of Bhutanese spirituality. Here, time slows and the boundary between past and present dissolves.",
        // Featured Pilgrimages Section Defaults
        featuredHeading: "Our Sacred Journeys",
        featuredMapURL: "https://ik.imagekit.io/neykor/map_default.png?tr=w-800", // REPLACE with actual URL!
        featuredMapAlt: "Vintage-style illustrated map of Bhutan showing key pilgrimage sites",
        featuredMapCaption: "Ancient cartography revealing the sacred geography of the Dragon Kingdom's major spiritual centers.",
        featuredButtonText: "View All Pilgrimages",
        // Image Carousel Section Defaults
        carouselHeading: "Moments from Our Journeys",
        // Why Choose Us Section Defaults
        whyHeading: "Why Journey With Us",
        why1Icon: "☸️", why1Title: "Guardians of Tradition", why1Text: "Our guides are descendants of pilgrim families, carrying centuries of oral history and sacred knowledge passed through generations.",
        why2Icon: "📜", why2Title: "Deep Historical Knowledge", why2Text: "Each journey is enriched by scholarly insights into the religious and cultural significance of every site we visit.",
        why3Icon: "🤝", why3Title: "Authentic Encounters", why3Text: "We create meaningful connections with monastics, artisans, and villagers who maintain Bhutan's living heritage.",
        // Testimonials Section Defaults
        testimonialsHeading: "Pilgrim Chronicles",
        // Timestamp
        updatedAt: new Date()
    };

    console.log("Checking/Seeding Home Page Content (ID: 1)...");
    await db.insert(homePageContent)
      .values(homeContentData)
      .onConflictDoUpdate({
        target: homePageContent.id,
        // Explicitly list all fields to update on conflict
        set: {
          heroImageURL: homeContentData.heroImageURL, heroImageAlt: homeContentData.heroImageAlt,
          heroHeadingLine1: homeContentData.heroHeadingLine1, heroHeadingLine2: homeContentData.heroHeadingLine2,
          heroParagraph: homeContentData.heroParagraph, heroButtonText: homeContentData.heroButtonText,
          introHeading: homeContentData.introHeading, introParagraph1: homeContentData.introParagraph1, introParagraph2: homeContentData.introParagraph2,
          featuredHeading: homeContentData.featuredHeading, featuredMapURL: homeContentData.featuredMapURL,
          featuredMapAlt: homeContentData.featuredMapAlt, featuredMapCaption: homeContentData.featuredMapCaption, featuredButtonText: homeContentData.featuredButtonText,
          carouselHeading: homeContentData.carouselHeading, whyHeading: homeContentData.whyHeading,
          why1Icon: homeContentData.why1Icon, why1Title: homeContentData.why1Title, why1Text: homeContentData.why1Text,
          why2Icon: homeContentData.why2Icon, why2Title: homeContentData.why2Title, why2Text: homeContentData.why2Text,
          why3Icon: homeContentData.why3Icon, why3Title: homeContentData.why3Title, why3Text: homeContentData.why3Text,
          testimonialsHeading: homeContentData.testimonialsHeading,
          updatedAt: new Date() // Ensure timestamp is updated
        }
      });
    // ==========================================
    // Seed Contact Page Settings (UPSERT Logic) <-- NEW
    // ==========================================
    const contactSettingsData = {
      id: 1, // Force ID 1
      pageHeading: "Begin Your Journey",
      locationHeading: "Our Location",
      locationImageURL: "https://ik.imagekit.io/neykor/bhutan_mountains_contact.jpg", // REPLACE with your actual default image URL
      locationImageAlt: "View of Himalayan peaks in Bhutan",
      locationImageCaption: "Our main coordination office nestled near the Memorial Chorten, Thimphu.",
      address: "Norzin Lam III, Near Memorial Chorten, Thimphu, Kingdom of Bhutan",
      email: "connect@sacredbhutantravels.bt", // Example email
      phone: "+975 17 11 22 33", // Example phone
      officeHoursHeading: "Correspondence Hours",
      officeHoursText: "Monday to Friday: 9:00 AM - 5:00 PM (Bhutan Standard Time, GMT+6)",
      updatedAt: new Date()
    };

    await db.insert(contactPageSettings).values(contactSettingsData).onConflictDoUpdate({
      target: contactPageSettings.id, // Conflict on ID
      set: { // Explicitly list fields to update
        pageHeading: contactSettingsData.pageHeading,
        locationHeading: contactSettingsData.locationHeading,
        address: contactSettingsData.address,
        email: contactSettingsData.email,
        phone: contactSettingsData.phone,
        officeHoursHeading: contactSettingsData.officeHoursHeading,
        officeHoursText: contactSettingsData.officeHoursText,
        updatedAt: new Date() // Update timestamp
      }
    });

    // ==========================================
    // Seed Gallery Page Settings (UPSERT Logic) <-- NEW
    // ==========================================
    const gallerySettingsData = {
      id: 1, // Force ID 1
      pageHeading: "Sacred Visions",
      pageParagraph: "Explore our visual chronicle of Bhutan's sacred landscapes, ancient temples, vibrant ceremonies, and the timeless beauty of the Dragon Kingdom. Each image captures a moment of reverence and wonder along the pilgrim's path.",
      // gridHeading: "Glimpses of the Ancient Kingdom", // Uncomment and set if added to schema
      updatedAt: new Date()
    };

    await db.insert(galleryPageSettings).values(gallerySettingsData).onConflictDoUpdate({
      target: galleryPageSettings.id, // Conflict on ID
      set: { // Explicitly list fields to update
        pageHeading: gallerySettingsData.pageHeading,
        pageParagraph: gallerySettingsData.pageParagraph,
        updatedAt: new Date() // Update timestamp
      }
    });
    console.log("\nAll sample data seeding checks complete!");

  } catch (error) {
    console.error("\nError creating sample data:", error);
    process.exit(1); // Exit with error code if seeding fails
  }
}

// Execute the seeding function
createSampleData().then(() => {
  console.log("Sample data script finished successfully.");
  process.exit(0); // Exit successfully
});

