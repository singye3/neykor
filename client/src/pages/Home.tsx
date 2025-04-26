// client/src/pages/Home.tsx
import { useQuery } from "@tanstack/react-query";
import HeroSection from "@/components/home/HeroSection";
import Introduction from "@/components/home/Introduction";
import FeaturedPilgrimages from "@/components/home/FeaturedPilgrimages";
import WhyChooseUs from "@/components/home/WhyChooseUs";
import Testimonials from "@/components/home/Testimonials";
import ImageCarousel from "@/components/home/ImageCarousel";
import Loader from "@/components/shared/Loader"; // Import Loader
import { apiRequest } from "@/lib/queryClient"; // Import apiRequest
import type { HomePageContent } from "@shared/schema"; // Import type

// Fetch function for home page content
async function fetchHomePageContent(): Promise<HomePageContent> {
    const res = await apiRequest("GET", "/api/content/home");
    if (!res.ok) throw new Error("Failed to fetch home page content");
    return res.json();
}

export default function Home() {
  const { data: content, isLoading, isError, error } = useQuery<HomePageContent, Error>({
    queryKey: ['homeContent'], // Unique key for home page data
    queryFn: fetchHomePageContent,
    staleTime: 1000 * 60 * 10, // Cache for 10 minutes
    refetchOnWindowFocus: false,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-parchment">
        <Loader />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-parchment text-destructive p-8">
        Error loading home page content: {error?.message || "Unknown error"}
      </div>
    );
  }

  // Provide default empty object if content is somehow null/undefined after loading
  const pageContent = content || {} as HomePageContent;

  return (
    <main>
      {/* Pass relevant content pieces as props */}
      <HeroSection
        imageUrl={pageContent.heroImageURL}
        imageAlt={pageContent.heroImageAlt}
        headingLine1={pageContent.heroHeadingLine1}
        headingLine2={pageContent.heroHeadingLine2}
        paragraph={pageContent.heroParagraph}
        buttonText={pageContent.heroButtonText}
      />
      <Introduction
        heading={pageContent.introHeading}
        paragraph1={pageContent.introParagraph1}
        paragraph2={pageContent.introParagraph2}
      />
      <FeaturedPilgrimages
         heading={pageContent.featuredHeading}
         mapURL={pageContent.featuredMapURL}
         mapAlt={pageContent.featuredMapAlt}
         mapCaption={pageContent.featuredMapCaption}
         buttonText={pageContent.featuredButtonText}
         // featuredTours are fetched separately within FeaturedPilgrimages
      />
      <ImageCarousel
        heading={pageContent.carouselHeading}
        // Carousel images are fetched separately within ImageCarousel
      />
      <WhyChooseUs
        heading={pageContent.whyHeading}
        why1={{ icon: pageContent.why1Icon, title: pageContent.why1Title, text: pageContent.why1Text }}
        why2={{ icon: pageContent.why2Icon, title: pageContent.why2Title, text: pageContent.why2Text }}
        why3={{ icon: pageContent.why3Icon, title: pageContent.why3Title, text: pageContent.why3Text }}
      />
      <Testimonials
        heading={pageContent.testimonialsHeading}
        // Testimonials are fetched separately within Testimonials component
      />
    </main>
  );
}