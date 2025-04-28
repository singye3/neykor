// scripts/create-sample-data.ts
import 'dotenv/config';
import { db } from "../server/db.ts"; // Using .ts extension for ESM compatibility
import { eq, sql } from "drizzle-orm";
import {
  tours, type ItineraryDay,
  testimonials,
  galleryImages, // Schema definition, even if not seeding
  aboutPageContent,
  homePageContent,
  siteSettings,
  galleryPageSettings,
  contactPageSettings
} from "../shared/schema.ts"; // Using .ts extension

// Default Image URLs (Replace with your actual placeholder URLs from ImageKit or other CDN)
const DEFAULT_TOUR_IMAGE_URL = "https://ik.imagekit.io/neykor/placeholder_tour_card.jpg?tr=w-400";
const DEFAULT_ABOUT_IMAGE_URL = "https://ik.imagekit.io/neykor/placeholder_about.jpg?tr=w-600";
const DEFAULT_HOME_HERO_URL = "https://ik.imagekit.io/neykor/placeholder_home_hero.jpg?tr=w-1920";
const DEFAULT_HOME_MAP_URL = "https://ik.imagekit.io/neykor/placeholder_home_map.png?tr=w-800";
const DEFAULT_CONTACT_IMAGE_URL = "https://ik.imagekit.io/neykor/placeholder_contact.jpg?tr=w-800";

async function createSampleData() {
  console.log("Starting sample data creation checks...");
  try {

    // ==========================================
    // Seed Site Settings (UPSERT Logic)
    // ==========================================
    const siteSettingsData = {
      id: 1, // Force ID 1
      siteName: "Sacred Bhutan Travels",
      updatedAt: new Date()
    };
    console.log("Checking/Seeding Site Settings (ID: 1)...");
    await db.insert(siteSettings)
      .values(siteSettingsData)
      .onConflictDoUpdate({
        target: siteSettings.id,
        set: {
          siteName: siteSettingsData.siteName,
          updatedAt: new Date()
        }
      });
    console.log(" -> Site Settings seeded/updated.");

    // ==========================================
    // Seed Tours
    // ==========================================
    const tourData = [
      // Tour 1: Tiger's Nest
      {
        title: "Tiger's Nest Pilgrimage",
        description: "Follow the sacred path to Paro Taktsang, where Guru Rinpoche meditated.",
        longDescription: "The journey to Paro Taktsang (Tiger's Nest) follows in the footsteps of Guru Rinpoche. This pilgrimage offers breathtaking views and a profound connection to Bhutan's core spiritual narrative.",
        location: "Paro Valley",
        duration: "7 Days / 6 Nights",
        difficulty: "Moderate",
        accommodation: "Heritage hotels and traditional farmhouses",
        groupSize: "Maximum 12 pilgrims",
        price: 2850,
        imageUrl: "https://ik.imagekit.io/neykor/tour_tigers_nest.jpg", // Replace with actual URL
        itinerary: [
          { day: 1, title: "Arrival in Paro & Kyichu Lhakhang", description: "Welcome, settle in. Evening visit to ancient Kyichu Lhakhang." },
          { day: 2, title: "Paro Valley Exploration", description: "Visit National Museum (Ta Dzong) and Rinpung Dzong. Prepare for hike." },
          { day: 3, title: "Pilgrimage to Taktsang", description: "Early morning hike to Tiger's Nest Monastery. Meditate, absorb atmosphere. Descend." },
          { day: 4, title: "Journey to Thimphu", description: "Scenic drive to capital. Visit Memorial Chorten & Buddha Dordenma." },
          { day: 5, title: "Thimphu Cultural Immersion", description: "Explore Arts & Crafts School, Folk Heritage Museum, Tashichho Dzong (exterior)." },
          { day: 6, title: "Return to Paro & Leisure", description: "Drive back to Paro. Afternoon free for reflection or exploring town." },
          { day: 7, title: "Departure", description: "Transfer to Paro Airport for onward journey." }
        ] as ItineraryDay[],
        featured: true
      },
      // Tour 2: Bumthang
      {
        title: "Bumthang Sacred Circuit",
        description: "Journey through Bhutan's spiritual heartland, visiting ancient temples.",
        longDescription: "Bumthang Valley is Bhutan's spiritual heart, home to ancient temples. This journey through its four valleys unveils history, legend, and profound spirituality.",
        location: "Bumthang Region",
        duration: "10 Days / 9 Nights",
        difficulty: "Moderate",
        accommodation: "Comfortable local hotels and guesthouses",
        groupSize: "Maximum 10 pilgrims",
        price: 3200,
        imageUrl: "https://ik.imagekit.io/neykor/tour_bumthang.jpg", // Replace with actual URL
        itinerary: [
            { day: 1, title: "Paro Arrival, Fly to Bumthang", description: "Domestic flight Paro -> Bumthang. Transfer to Jakar." },
            { day: 2, title: "Jakar Dzong & Chokhor Valley Temples", description: "Visit Jakar Dzong, Jambay Lhakhang, Kurjey Lhakhang." },
            { day: 3, title: "Tamshing & Kenchosum Lhakhang", description: "Explore Tamshing (ancient murals) & Kenchosum." },
            { day: 4, title: "Excursion to Tang Valley", description: "Drive to Tang Valley. Visit Ogyen Choling Museum & Mebar Tsho (Burning Lake)." },
            { day: 5, title: "Ura Valley Exploration", description: "Scenic drive to Ura Valley. Explore village & Ura Lhakhang." },
            { day: 6, title: "Trongsa Dzong Visit", description: "Drive to Trongsa, visit the magnificent Trongsa Dzong, ancestral home of Bhutan's monarchy." },
            { day: 7, title: "Return Drive to Punakha", description: "Scenic drive back towards Punakha over Pele La pass." },
            { day: 8, title: "Punakha Dzong & Chimi Lhakhang", description: "Visit the stunning Punakha Dzong and hike to Chimi Lhakhang (Fertility Temple)." },
            { day: 9, title: "Drive to Paro via Dochula Pass", description: "Return drive to Paro, stopping at Dochula Pass for panoramic Himalayan views." },
            { day: 10, title: "Departure", description: "Transfer to Paro Airport for departure." }
        ] as ItineraryDay[],
        featured: true
      },
       // Tour 3: Druk Path Trek
      {
        title: "Druk Path Trek Pilgrimage",
        description: "Walk the ancient mountain route connecting Paro and Thimphu.",
        longDescription: "Combine spiritual reflection with moderate trekking on the Druk Path. Traverse high passes, witness stunning vistas, and camp beside sacred lakes on this historic route.",
        location: "Paro to Thimphu (Trek)",
        duration: "6 Days / 5 Nights",
        difficulty: "Challenging",
        accommodation: "Organized camping with support crew",
        groupSize: "Maximum 8 pilgrims",
        price: 2150,
        imageUrl: "https://ik.imagekit.io/neykor/tour_drukpath.jpg", // Replace with actual URL
        itinerary: [
          { day: 1, title: "Acclimatization in Paro", description: "Arrive in Paro, check in. Visit Kyichu Lhakhang, prepare." },
          { day: 2, title: "Trek Paro to Jele Dzong (3,480m)", description: "Ascend from Ta Dzong to campsite near Jele Dzong ruins (4-5 hrs)." },
          { day: 3, title: "Trek Jele Dzong to Jangchulakha (3,770m)", description: "Trek ridges, rhododendron forests (4 hrs)." },
          { day: 4, title: "Trek Jangchulakha to Jimilang Tsho (3,870m)", description: "Camp by sacred Jimilang Tsho lake (4 hrs)." },
          { day: 5, title: "Trek Jimilang Tsho to Phajoding (3,610m)", description: "Via Simkotra Tsho, possible yak herders. Camp near Phajoding monastery (4 hrs)." },
          { day: 6, title: "Trek Phajoding to Thimphu", description: "Descend to Motithang, Thimphu. Transfer to hotel. End trek." }
        ] as ItineraryDay[],
        featured: true
      },
      // Tour 4: Haa Valley
      {
        title: "Haa Valley Heritage & Spirituality",
        description: "Explore the pristine Haa Valley, known for its unique traditions.",
        longDescription: "Discover serene Haa Valley, offering an intimate glimpse into traditional life and ancient traditions interwoven with Buddhism. Visit foundational temples and enjoy tranquility.",
        location: "Haa Valley & Paro",
        duration: "6 Days / 5 Nights",
        difficulty: "Easy",
        accommodation: "Homestays and local guesthouses",
        groupSize: "Maximum 10 pilgrims",
        price: 2500,
        imageUrl: "https://ik.imagekit.io/neykor/tour_haa_valley.jpg", // Replace with actual URL
        itinerary: [
            { day: 1, title: "Arrival Paro, Drive to Haa", description: "Scenic drive over Chele La pass to Haa Valley. Check into homestay." },
            { day: 2, title: "Lhakhang Karpo & Nagpo", description: "Visit ancient White and Black Temples." },
            { day: 3, title: "Villages & Nature Walk", description: "Gentle walk/hike through villages, interact with locals." },
            { day: 4, title: "Return to Paro", description: "Drive back via Chele La. Afternoon explore Paro town." },
            { day: 5, title: "Optional Paro Sightseeing", description: "Revisit Kyichu Lhakhang or explore markets." },
            { day: 6, title: "Departure", description: "Transfer to Paro airport." },
        ] as ItineraryDay[],
        featured: false
      },
    ];

    const existingToursCountResult = await db.select({ count: sql<number>`cast(count(*) as int)` }).from(tours);
    const existingToursCount = existingToursCountResult[0]?.count ?? 0;

    if (existingToursCount === 0) {
      console.log("Adding sample tours...");
      await db.insert(tours).values(tourData);
      console.log(` -> ${tourData.length} Sample tours added.`);
    } else {
      console.log(`Tours already exist (${existingToursCount}), skipping tour seeding.`);
    }

    // ==========================================
    // Seed Testimonials
    // ==========================================
    const testimonialData = [
      { name: "Sarah M.", location: "United States", content: "The journey to Tiger's Nest wasn't just a trek, but a transformation. Our guide shared stories and rituals that connected us to centuries of pilgrims before us." },
      { name: "David L.", location: "United Kingdom", content: "Sacred Bhutan Travels provided an experience beyond a typical tour. The attention to historical detail and spiritual significance made each moment deeply meaningful." },
      { name: "Aisha K.", location: "Canada", content: "The Bumthang circuit was magical. Our guide's knowledge was incredible, bringing the ancient sites to life with authenticity and respect." },
    ];

    const existingTestimonialsCountResult = await db.select({ count: sql<number>`cast(count(*) as int)` }).from(testimonials);
    const existingTestimonialsCount = existingTestimonialsCountResult[0]?.count ?? 0;

    if (existingTestimonialsCount === 0) {
      console.log("Adding sample testimonials...");
      await db.insert(testimonials).values(testimonialData);
      console.log(` -> ${testimonialData.length} Sample testimonials added.`);
    } else {
      console.log(`Testimonials exist (${existingTestimonialsCount}), skipping testimonial seeding.`);
    }
    
    // ==========================================
    // Seed About Page Content (UPSERT Logic)
    // ==========================================
    const aboutContentData = {
        id: 1,
        mainHeading: 'Our Sacred Journey',
        imageUrl: DEFAULT_ABOUT_IMAGE_URL,
        imageAlt: 'Bhutanese Guide in Traditional Gho near ancient temple',
        historyText: 'Sacred Bhutan Travels descends from traditional guides serving royalty for generations, tracing roots back centuries guiding figures to sacred sites.',
        missionText: 'We blend ancestral knowledge with modern expertise to craft journeys honoring Bhutan\'s spiritual heritage, offering comfort and insight.',
        philosophyHeading: 'Our Philosophy',
        philosophyQuote: 'We don\'t merely visit sacred places; we encounter them with reverence, letting ancient wisdom speak to our present.',
        value1Title: 'Authenticity', value1Text: 'Presenting Bhutanese spirituality in its true context.',
        value2Title: 'Respect', value2Text: 'Approaching sites with proper protocol and local customs.',
        value3Title: 'Knowledge', value3Text: 'Sharing deep historical and spiritual context.',
        updatedAt: new Date()
    };

    console.log("Checking/Seeding About Page Content (ID: 1)...");
    await db.insert(aboutPageContent).values(aboutContentData).onConflictDoUpdate({
        target: aboutPageContent.id,
        set: { ...aboutContentData, updatedAt: new Date() } // Simple update all fields + timestamp
      });
    console.log(" -> About Page Content seeded/updated.");

    // ==========================================
    // Seed Home Page Content (UPSERT Logic)
    // ==========================================
    const homeContentData = {
        id: 1,
        heroImageURL: DEFAULT_HOME_HERO_URL,
        heroImageAlt: "Panoramic view of Paro Taktsang (Tiger's Nest) monastery",
        heroHeadingLine1: "Walk the Ancient Paths:", heroHeadingLine2: "Bhutan Pilgrimage Through the Ages",
        heroParagraph: "Discover pilgrimages steeped in history, connecting you to centuries of spiritual tradition in the Land of the Thunder Dragon.",
        heroButtonText: "Explore Our Sacred Routes",
        introHeading: "Ancient Tradition, Timeless Journey",
        introParagraph1: "Sacred Bhutan Travels invites you to walk paths worn smooth by centuries of pilgrims. Our journeys are not mere tours, but profound experiences connecting you with Bhutan's living spiritual heritage.",
        introParagraph2: "Follow routes established by revered masters, revealing monasteries tucked into mist-shrouded mountains and temples that have witnessed the unfolding of Bhutanese spirituality.",
        featuredHeading: "Featured Sacred Journeys",
        featuredMapURL: DEFAULT_HOME_MAP_URL,
        featuredMapAlt: "Vintage-style illustrated map of Bhutan showing key pilgrimage sites",
        featuredMapCaption: "Ancient cartography revealing the sacred geography of the Dragon Kingdom.",
        featuredButtonText: "View All Pilgrimages",
        carouselHeading: "Moments from Our Journeys",
        whyHeading: "Why Journey With Us",
        why1Icon: "☸️", why1Title: "Guardians of Tradition", why1Text: "Our guides carry centuries of oral history and sacred knowledge passed through generations.",
        why2Icon: "📜", why2Title: "Deep Historical Knowledge", why2Text: "Each journey is enriched by scholarly insights into the religious and cultural significance of every site.",
        why3Icon: "🤝", why3Title: "Authentic Encounters", why3Text: "We create meaningful connections with monastics, artisans, and villagers maintaining Bhutan's living heritage.",
        testimonialsHeading: "Pilgrim Chronicles",
        updatedAt: new Date()
    };

    console.log("Checking/Seeding Home Page Content (ID: 1)...");
    await db.insert(homePageContent).values(homeContentData).onConflictDoUpdate({
        target: homePageContent.id,
        set: { ...homeContentData, updatedAt: new Date() } // Simple update all fields + timestamp
      });
    console.log(" -> Home Page Content seeded/updated.");

    // ==========================================
    // Seed Contact Page Settings (UPSERT Logic)
    // ==========================================
    const contactSettingsData = {
      id: 1,
      pageHeading: "Begin Your Sacred Journey",
      locationHeading: "Connect With Us",
      locationImageURL: DEFAULT_CONTACT_IMAGE_URL,
      locationImageAlt: "View of Himalayan peaks in Bhutan",
      locationImageCaption: "Our main coordination office nestled near the Memorial Chorten, Thimphu.",
      address: "Norzin Lam III, Near Memorial Chorten, Thimphu, Kingdom of Bhutan",
      email: "connect@sacredbhutantravels.bt",
      phone: "+975 17 11 22 33",
      officeHoursHeading: "Correspondence Hours",
      officeHoursText: "Monday to Friday: 9:00 AM - 5:00 PM (Bhutan Standard Time, GMT+6)",
      updatedAt: new Date()
    };
    console.log("Checking/Seeding Contact Page Settings (ID: 1)...");
    await db.insert(contactPageSettings).values(contactSettingsData).onConflictDoUpdate({
      target: contactPageSettings.id,
      set: { ...contactSettingsData, updatedAt: new Date() } // Simple update all fields + timestamp
    });
    console.log(" -> Contact Page Settings seeded/updated.");

    // ==========================================
    // Seed Gallery Page Settings (UPSERT Logic)
    // ==========================================
    const gallerySettingsData = {
      id: 1,
      pageHeading: "Sacred Visions of Bhutan",
      pageParagraph: "Explore our visual chronicle of Bhutan's sacred landscapes, ancient temples, vibrant ceremonies, and the timeless beauty of the Dragon Kingdom. Each image captures a moment of reverence and wonder along the pilgrim's path.",
      updatedAt: new Date()
    };
    console.log("Checking/Seeding Gallery Page Settings (ID: 1)...");
    await db.insert(galleryPageSettings).values(gallerySettingsData).onConflictDoUpdate({
      target: galleryPageSettings.id,
      set: { ...gallerySettingsData, updatedAt: new Date() } // Simple update all fields + timestamp
    });
    console.log(" -> Gallery Page Settings seeded/updated.");

    console.log("\nSample data seeding checks complete!");

  } catch (error) {
    console.error("\nError during sample data seeding:", error);
    process.exit(1);
  }
}

// Execute the seeding function
createSampleData().then(() => {
  console.log(" -> Sample data script finished successfully.");
  process.exit(0);
}).catch((err) => {
    // Catch unhandled errors during execution
    console.error(" -> Unhandled error during script execution:", err);
    process.exit(1);
});