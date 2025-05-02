// client/src/pages/Home.tsx
import { useQuery } from "@tanstack/react-query";
import HeroSection from "@/components/home/HeroSection";
import Introduction from "@/components/home/Introduction";
import FeaturedPilgrimages from "@/components/home/FeaturedPilgrimages";
import WhyChooseUs from "@/components/home/WhyChooseUs";
import Testimonials from "@/components/home/Testimonials";
import ImageCarousel from "@/components/home/ImageCarousel";
import Loader from "@/components/shared/Loader";
import { apiRequest } from "@/lib/queryClient"; // Import apiRequest
import type { HomePageContent } from "@shared/schema"; // Import type

export default function Home() {
  // Use React Query to fetch data
  const { data: content, isLoading, isError, error } = useQuery<HomePageContent, Error>({
    queryKey: ['homeContent'], // Unique query key
    queryFn: () => apiRequest<HomePageContent>("GET", "/api/content/home"),
    staleTime: 1000 * 60 * 10, // Cache data for 10 minutes
    refetchOnWindowFocus: false,
  });

  // --- Loading State ---
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-parchment">
        <Loader />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-parchment text-destructive p-8 text-center">
        <div>
            <h2 className="text-xl font-semibold mb-2">Error Loading Home Page</h2>
            <p>{error?.message || "An unexpected error occurred."}</p>
        </div>
      </div>
    );
  }

  if (!content) {
     return (
       <div className="flex items-center justify-center min-h-screen bg-parchment text-destructive p-8">
         Home page content is missing even after successful load. Please contact support.
       </div>
     );
  }

  // Now 'content' should be the valid HomePageContent object
  return (
    <main>
      <HeroSection
        imageUrl={content.heroImageURL}
        imageAlt={content.heroImageAlt}
        headingLine1={content.heroHeadingLine1}
        headingLine2={content.heroHeadingLine2}
        paragraph={content.heroParagraph}
        buttonText={content.heroButtonText}
      />
      <Introduction
        heading={content.introHeading}
        paragraph1={content.introParagraph1}
        paragraph2={content.introParagraph2}
      />
      <FeaturedPilgrimages
         heading={content.featuredHeading}
         mapURL={content.featuredMapURL}
         mapAlt={content.featuredMapAlt}
         mapCaption={content.featuredMapCaption}
         buttonText={content.featuredButtonText}
      />
      <ImageCarousel
        heading={content.carouselHeading}
      />
      <WhyChooseUs
        heading={content.whyHeading}
        why1={{ icon: content.why1Icon, title: content.why1Title, text: content.why1Text }}
        why2={{ icon: content.why2Icon, title: content.why2Title, text: content.why2Text }}
        why3={{ icon: content.why3Icon, title: content.why3Title, text: content.why3Text }}
      />
      <Testimonials
        heading={content.testimonialsHeading}
      />
    </main>
  );
}