import 'dotenv/config';
import { db } from "../server/db";
import {
  tours,
  testimonials,
  galleryImages
} from "../shared/schema";

async function createSampleData() {
  try {
    // Add sample tours
    const tourData = [
      {
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
      },
      {
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
      },
      {
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
      }
    ];

    // Insert tours
    const existingTours = await db.select().from(tours);
    if (existingTours.length === 0) {
      console.log("Adding sample tours...");
      for (const tour of tourData) {
        // Ensure itinerary is properly formatted as JSON
        const processedTour = {
          ...tour,
          itinerary: JSON.stringify(tour.itinerary)
        };
        await db.insert(tours).values(processedTour as any);
      }
      console.log("Sample tours added successfully!");
    } else {
      console.log("Tours already exist in the database, skipping...");
    }

    // Add sample testimonials
    const testimonialData = [
      {
        name: "Sarah M.",
        location: "United States",
        content: "The journey to Tiger's Nest wasn't just a trek, but a transformation. Our guide shared stories and rituals that connected us to centuries of pilgrims before us."
      },
      {
        name: "David L.",
        location: "United Kingdom",
        content: "Sacred Bhutan Travels provided an experience beyond a typical tour. The attention to historical detail and spiritual significance made each moment deeply meaningful."
      }
    ];

    // Insert testimonials
    const existingTestimonials = await db.select().from(testimonials);
    if (existingTestimonials.length === 0) {
      console.log("Adding sample testimonials...");
      for (const testimonial of testimonialData) {
        await db.insert(testimonials).values(testimonial);
      }
      console.log("Sample testimonials added successfully!");
    } else {
      console.log("Testimonials already exist in the database, skipping...");
    }

    // Add sample gallery images
    const galleryData = [
      {
        caption: "Punakha Dzong",
        type: "dzong"
      },
      {
        caption: "Prayer Flags in the Mountains",
        type: "prayerFlags"
      },
      {
        caption: "Bhutanese Monks",
        type: "monks"
      },
      {
        caption: "Temple Interior",
        type: "temple"
      },
      {
        caption: "Mountain Landscape",
        type: "mountains"
      },
      {
        caption: "Traditional Bhutanese Mask",
        type: "mask"
      }
    ];

    // Insert gallery images
    const existingGallery = await db.select().from(galleryImages);
    if (existingGallery.length === 0) {
      console.log("Adding sample gallery images...");
      for (const image of galleryData) {
        await db.insert(galleryImages).values(image);
      }
      console.log("Sample gallery images added successfully!");
    } else {
      console.log("Gallery images already exist in the database, skipping...");
    }

    console.log("All sample data created successfully!");
  } catch (error) {
    console.error("Error creating sample data:", error);
  }
}

createSampleData().then(() => process.exit());