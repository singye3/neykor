import 'dotenv/config';
// Add the .ts extension to the import path
import { db } from "../server/db.ts"; // <-- ADDED .ts
import { eq, sql } from "drizzle-orm";
import {
  tours, type ItineraryDay,
  testimonials,
  galleryImages,
  aboutPageContent
} from "../shared/schema.ts"; // <-- Also add .ts here for consistency

// ... rest of the script remains the same ...

async function createSampleData() {
  console.log("Starting sample data creation...");
  try {
    // ==========================================
    // Seed Tours
    // ==========================================
    const tourData = [
      {
        title: "Tiger's Nest Pilgrimage",
        description: "Follow the sacred path to Paro Taktsang...",
        longDescription: "The journey to Paro Taktsang (Tiger's Nest) follows...",
        duration: "7 Days / 6 Nights",
        difficulty: "Moderate",
        accommodation: "Heritage hotels and traditional farmhouses",
        groupSize: "Maximum 12 pilgrims",
        price: 2850,
        imageType: "tigerNest",
        itinerary: [
          { day: 1, title: "Arrival in Paro", description: "Traditional welcome ceremony..." },
          { day: 2, title: "Drukgyel Dzong & Preparation", description: "Visit the ruins..." },
          { day: 3, title: "Tiger's Nest Pilgrimage", description: "Pre-dawn blessing ceremony..." }
        ] as ItineraryDay[],
        featured: true
      },
      {
        title: "Bumthang Sacred Circuit",
        description: "Journey through Bhutan's spiritual heartland...",
        longDescription: "Bumthang Valley is considered the spiritual heart...",
        duration: "10 Days / 9 Nights",
        difficulty: "Moderate",
        accommodation: "Heritage lodges and monastery guesthouses",
        groupSize: "Maximum 10 pilgrims",
        price: 3200,
        imageType: "bumthang",
        itinerary: [
          { day: 1, title: "Arrival in Paro and Transfer to Thimphu", description: "Welcome ceremony..." },
          { day: 2, title: "Journey to Punakha", description: "Cross the Dochula Pass..." },
          { day: 3, title: "Trongsa and Arrival in Bumthang", description: "Visit the impressive Trongsa Dzong..." }
        ] as ItineraryDay[],
        featured: true
      },
      {
        title: "Druk Path Trek",
        description: "Walk the ancient mountain route connecting Paro and Thimphu...",
        longDescription: "The Druk Path is one of Bhutan's classic treks...",
        duration: "5 Days / 4 Nights",
        difficulty: "Challenging",
        accommodation: "Traditional camping and mountain huts",
        groupSize: "Maximum 8 pilgrims",
        price: 1950,
        imageType: "drukPath",
        itinerary: [
          { day: 1, title: "Paro to Jele Dzong", description: "Begin your pilgrimage..." },
          { day: 2, title: "Jele Dzong to Jangchulakha", description: "Trek along ridge lines..." },
          { day: 3, title: "Jangchulakha to Jimilang Tsho", description: "Hike to the sacred Jimilang Tsho..." }
        ] as ItineraryDay[],
        featured: true
      },
      {
        title: "Haa Valley Heritage",
        description: "Explore the pristine Haa Valley, known for its unique traditions and sacred sites like Lhakhang Karpo and Nagpo.",
        longDescription: "Discover the lesser-visited Haa Valley, offering a glimpse into traditional Bhutanese life and spirituality away from the main tourist trails. Visit ancient temples and enjoy the serene mountain scenery.",
        duration: "6 Days / 5 Nights",
        difficulty: "Easy",
        accommodation: "Farmhouses and local guesthouses",
        groupSize: "Maximum 10 pilgrims",
        price: 2500,
        imageType: "mountains",
        itinerary: [
            { day: 1, title: "Arrival in Paro, drive to Haa", description: "Scenic drive over the Chele La pass to Haa Valley." },
            { day: 2, title: "Lhakhang Karpo & Nagpo", description: "Visit the White and Black Temples, central to Haa's identity." },
            { day: 3, title: "Explore Local Villages", description: "Hike through villages, interact with locals, enjoy a traditional meal." },
        ] as ItineraryDay[],
        featured: false
      },
    ];

    const existingToursCount = await db.select({ count: sql<number>`cast(count(*) as int)` }).from(tours);
    if (existingToursCount[0].count === 0) {
      console.log("Adding sample tours...");
      await db.insert(tours).values(tourData as any); // Use 'as any' here or ensure tourData matches InsertTour[]
      console.log(` -> ${tourData.length} Sample tours added successfully!`);
    } else {
      console.log("Tours already exist in the database, skipping tour seeding.");
    }

    // ==========================================
    // Seed Testimonials
    // ==========================================
    const testimonialData = [
      { name: "Sarah M.", location: "United States", content: "The journey to Tiger's Nest wasn't just a trek..." },
      { name: "David L.", location: "United Kingdom", content: "Sacred Bhutan Travels provided an experience beyond..." },
      { name: "Aisha K.", location: "Canada", content: "The Bumthang circuit was magical. Our guide's knowledge was incredible." },
    ];

    const existingTestimonialsCount = await db.select({ count: sql<number>`cast(count(*) as int)` }).from(testimonials);
    if (existingTestimonialsCount[0].count === 0) {
      console.log("Adding sample testimonials...");
      await db.insert(testimonials).values(testimonialData);
      console.log(` -> ${testimonialData.length} Sample testimonials added successfully!`);
    } else {
      console.log("Testimonials already exist in the database, skipping testimonial seeding.");
    }

    // ==========================================
    // Seed Gallery Images
    // ==========================================
    const galleryData = [
      { caption: "Punakha Dzong at confluence", type: "dzong" },
      { caption: "Prayer Flags on Chele La Pass", type: "prayerFlags" },
      { caption: "Young Monks studying", type: "monks" },
      { caption: "Intricate Temple Altar", type: "temple" },
      { caption: "Himalayan Peaks near Jomolhari", type: "mountains" },
      { caption: "Mahakala Mask from Paro Tshechu", type: "mask" },
      { caption: "Taktsang Monastery Viewpoint", type: "tigerNest" },
      { caption: "Jakar Dzong in Bumthang", type: "bumthang" },
    ];

    const existingGalleryCount = await db.select({ count: sql<number>`cast(count(*) as int)` }).from(galleryImages);
    if (existingGalleryCount[0].count === 0) {
      console.log("Adding sample gallery images...");
      await db.insert(galleryImages).values(galleryData);
      console.log(` -> ${galleryData.length} Sample gallery images added successfully!`);
    } else {
      console.log("Gallery images already exist in the database, skipping gallery seeding.");
    }

    // ==========================================
    // Seed About Page Content (UPSERT Logic)
    // ==========================================
    const aboutContentData = {
        id: 1,
        mainHeading: 'Our Sacred Journey',
        imageUrl: 'https://ik.imagekit.io/neykor/guide_placeholder.jpg?updatedAt=1700000000000', // REPLACE
        imageAlt: 'Bhutanese Guide in Traditional Gho',
        historyText: 'Sacred Bhutan Travels was founded by descendants...',
        missionText: 'Today, we combine this ancestral knowledge...',
        philosophyHeading: 'Our Philosophy',
        philosophyQuote: 'We do not merely visit sacred places...',
        value1Title: 'Authenticity',
        value1Text: 'We present Bhutanese spirituality...',
        value2Title: 'Respect',
        value2Text: 'We approach sacred sites...',
        value3Title: 'Knowledge',
        value3Text: 'We share the deep historical context...',
        updatedAt: new Date()
    };

    console.log("Checking/Seeding About Page Content (ID: 1)...");
    await db.insert(aboutPageContent)
      .values(aboutContentData)
      .onConflictDoUpdate({
        target: aboutPageContent.id,
        set: { // Explicitly list fields to update on conflict
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
          updatedAt: new Date()
        }
      });
    console.log(" -> About Page Content seeded/updated successfully!");


    console.log("\nAll sample data seeding checks complete!");

  } catch (error) {
    console.error("\nError creating sample data:", error);
    process.exit(1);
  }
}

createSampleData().then(() => {
  console.log("Sample data script finished.");
  process.exit(0);
});