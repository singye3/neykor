// client/src/components/about/AboutSection.tsx
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import BhutaneseBorder from "@/components/shared/BhutaneseBorder";
import Loader from "@/components/shared/Loader";
import type { AboutPageContent } from "@shared/schema"; // Import the type
import { apiRequest } from "@/lib/queryClient"; // Use apiRequest for consistency

// Removed the separate fetchAboutContent function

export default function AboutSection() {
  const [imgLoaded, setImgLoaded] = useState(false);

  // Fetch data using useQuery
  const { data: content, isLoading, error, isError } = useQuery<AboutPageContent, Error>({ // Added Error type for query
    queryKey: ['aboutContent'], // Unique query key
    // --- UPDATED queryFn ---
    // Directly use apiRequest, specifying the expected return type.
    // apiRequest now handles fetch, error checks, and JSON parsing.
    queryFn: () => apiRequest<AboutPageContent>("GET", "/api/content/about"),
    // --- End Update ---
    staleTime: 1000 * 60 * 10, // Cache for 10 minutes
    refetchOnWindowFocus: false,
  });

  // Preload the dynamic image
  useEffect(() => {
    setImgLoaded(false);
    if (content?.imageUrl) {
      const img = new Image();
      img.src = content.imageUrl;
      img.onload = () => setImgLoaded(true);
      img.onerror = () => {
        console.error("Failed to load about section image:", content.imageUrl);
        setImgLoaded(true); // Mark loaded anyway to avoid infinite loader
      };
    } else if (!isLoading && content) { // If loading is done and content exists (even without URL)
        setImgLoaded(true);
    }
  }, [content, isLoading]); // Depend on content object and isLoading

  // --- Loading State ---
  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto flex justify-center py-16">
        <Loader />
      </div>
    );
  }

  // --- Error State ---
  if (isError) {
    console.error("Error fetching about content:", error);
    return (
      <div className="max-w-4xl mx-auto text-center text-destructive p-8 bg-red-100 border border-destructive rounded">
        <h3 className="font-semibold text-lg mb-2">Error Loading Content</h3>
        <p>{error?.message || "Could not load the About Us information. Please try again later."}</p>
      </div>
    );
  }

  // --- Content Missing State (after load/error check) ---
   if (!content) {
     return (
       <div className="max-w-4xl mx-auto text-center text-destructive p-8">
         About content is missing. Please contact support.
       </div>
     );
  }

  // --- Success State ---
  // Now 'content' is guaranteed to be the AboutPageContent object
  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="font-trajan text-3xl text-monastic-red text-center mb-8">
        {content.mainHeading}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12 items-center">
        {/* Image Column */}
        <div className="w-full aspect-[4/3] bg-parchment-dark rounded overflow-hidden shadow-md flex items-center justify-center">
           {content.imageUrl ? (
                imgLoaded ? (
                    <img
                    src={content.imageUrl}
                    alt={content.imageAlt || 'About Sacred Bhutan Travels'}
                    className="w-full h-full object-cover filter-aged transition-opacity duration-500 ease-in-out"
                    style={{ opacity: imgLoaded ? 1 : 0 }}
                    />
                ) : (
                    <Loader /> // Show loader while specific image loads
                )
           ) : (
                <span className="text-charcoal/50 italic">(No image provided)</span> // Placeholder if no URL
           )}
        </div>

        {/* Text Column */}
        <div className="flex flex-col justify-center">
          <p className="font-garamond text-lg mb-4 whitespace-pre-line leading-relaxed">
            {content.historyText}
          </p>
          <p className="font-garamond text-lg whitespace-pre-line leading-relaxed">
            {content.missionText}
          </p>
        </div>
      </div>

      {/* Philosophy Section */}
      <BhutaneseBorder className="p-6 bg-parchment/70 mb-12 shadow-inner">
        <h3 className="font-trajan text-2xl text-monastic-red text-center mb-4">
          {content.philosophyHeading}
        </h3>
        <p className="font-garamond text-xl italic text-center text-terracotta/90">
          "{content.philosophyQuote}"
        </p>
      </BhutaneseBorder>

      {/* Values Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-parchment/90 p-4 border border-faded-gold rounded shadow-sm text-center">
          <h4 className="font-trajan text-lg text-monastic-red mb-2">
            {content.value1Title}
          </h4>
          <p className="font-garamond whitespace-pre-line">
            {content.value1Text}
          </p>
        </div>

        <div className="bg-parchment/90 p-4 border border-faded-gold rounded shadow-sm text-center">
          <h4 className="font-trajan text-lg text-monastic-red mb-2">
            {content.value2Title}
          </h4>
          <p className="font-garamond whitespace-pre-line">
            {content.value2Text}
          </p>
        </div>

        <div className="bg-parchment/90 p-4 border border-faded-gold rounded shadow-sm text-center">
          <h4 className="font-trajan text-lg text-monastic-red mb-2">
            {content.value3Title}
          </h4>
          <p className="font-garamond whitespace-pre-line">
            {content.value3Text}
          </p>
        </div>
      </div>
    </div>
  );
}