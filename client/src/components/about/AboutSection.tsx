import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import BhutaneseBorder from "@/components/shared/BhutaneseBorder";
import Loader from "@/components/shared/Loader";
import type { AboutPageContent } from "@shared/schema"; // Import the type
import { apiRequest } from "@/lib/queryClient"; // Use apiRequest for consistency

// Helper to fetch about content
async function fetchAboutContent(): Promise<AboutPageContent> {
    // Use apiRequest which handles errors and JSON parsing
    const res = await apiRequest("GET", "/api/content/about");
    return res.json();
}


export default function AboutSection() {
  const [imgLoaded, setImgLoaded] = useState(false);

  const { data: content, isLoading, error, isError } = useQuery<AboutPageContent>({
    queryKey: ['aboutContent'], // Unique query key for public facing data
    queryFn: fetchAboutContent,
    staleTime: 1000 * 60 * 10, // Cache for 10 minutes
    refetchOnWindowFocus: false, // Less aggressive refetching for static-ish content
  });

  // Preload the dynamic image
  useEffect(() => {
    // Reset loading state if content changes (e.g., after admin update)
    setImgLoaded(false);
    if (content?.imageUrl) {
      const img = new Image();
      img.src = content.imageUrl;
      img.onload = () => setImgLoaded(true);
      img.onerror = () => {
        console.error("Failed to load about section image:", content.imageUrl);
        setImgLoaded(true); // Mark as loaded to avoid infinite loader, even on error
      };
    } else if (!isLoading) {
        // If loading is done and there's no image URL, mark as loaded
        setImgLoaded(true);
    }
  }, [content?.imageUrl, isLoading]); // Depend on imageUrl and isLoading

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto flex justify-center py-16">
        <Loader />
      </div>
    );
  }

  if (isError) {
    console.error("Error fetching about content:", error);
    return (
      <div className="max-w-4xl mx-auto text-center text-red-600 py-16">
        Error loading content. Please try again later.
      </div>
    );
  }

  // Use fetched content; provide default empty strings as fallbacks
  // The API route ensures a default structure is returned even if DB is empty
  const displayContent = content || {
        mainHeading: "", imageUrl: "", imageAlt: "", historyText: "",
        missionText: "", philosophyHeading: "", philosophyQuote: "",
        value1Title: "", value1Text: "", value2Title: "", value2Text: "",
        value3Title: "", value3Text: "",
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="font-trajan text-3xl text-monastic-red text-center mb-8">
        {displayContent.mainHeading}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <div>
          {imgLoaded && displayContent.imageUrl ? (
            <img
              src={displayContent.imageUrl}
              alt={displayContent.imageAlt}
              className="w-full h-auto filter-aged"
            />
          ) : (
            // Show loader only if image URL exists but hasn't loaded yet
            displayContent.imageUrl ? (
                 <div className="w-full min-h-[200px] md:h-64 bg-parchment-dark flex items-center justify-center">
                    <Loader />
                 </div>
            ) : (
                 <div className="w-full min-h-[200px] md:h-64 bg-parchment-dark flex items-center justify-center text-charcoal/50">
                    (No image provided)
                 </div>
            )

          )}
        </div>
        <div className="flex flex-col justify-center">
          {/* Use whitespace-pre-line to preserve line breaks if entered in textarea */}
          <p className="font-garamond text-lg mb-4 whitespace-pre-line">
            {displayContent.historyText}
          </p>
          <p className="font-garamond text-lg whitespace-pre-line">
            {displayContent.missionText}
          </p>
        </div>
      </div>

      <BhutaneseBorder className="p-6 bg-parchment/70 mb-8">
        <h3 className="font-trajan text-2xl text-monastic-red text-center mb-4">
          {displayContent.philosophyHeading}
        </h3>
        <p className="font-garamond text-lg italic text-center">
          "{displayContent.philosophyQuote}"
        </p>
      </BhutaneseBorder>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-parchment/90 p-4 border border-faded-gold">
          <h4 className="font-trajan text-lg text-monastic-red text-center mb-2">
            {displayContent.value1Title}
          </h4>
          <p className="font-garamond text-center whitespace-pre-line">
            {displayContent.value1Text}
          </p>
        </div>

        <div className="bg-parchment/90 p-4 border border-faded-gold">
          <h4 className="font-trajan text-lg text-monastic-red text-center mb-2">
            {displayContent.value2Title}
          </h4>
          <p className="font-garamond text-center whitespace-pre-line">
            {displayContent.value2Text}
          </p>
        </div>

        <div className="bg-parchment/90 p-4 border border-faded-gold">
          <h4 className="font-trajan text-lg text-monastic-red text-center mb-2">
            {displayContent.value3Title}
          </h4>
          <p className="font-garamond text-center whitespace-pre-line">
            {displayContent.value3Text}
          </p>
        </div>
      </div>
    </div>
  );
}