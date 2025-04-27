// client/src/pages/GalleryPage.tsx
import { useQuery } from "@tanstack/react-query";
import GalleryGrid from "@/components/gallery/GalleryGrid";
import BhutaneseBorder from "@/components/shared/BhutaneseBorder";
import Loader from "@/components/shared/Loader";
import { apiRequest } from "@/lib/queryClient"; // Use the corrected apiRequest
import type { GalleryPageSettings } from "@shared/schema";


export default function GalleryPage() {
  const { data: settings, isLoading, isError, error } = useQuery<GalleryPageSettings, Error>({
      queryKey: ['galleryPageSettings'], // Unique key for this query
      queryFn: () => apiRequest<GalleryPageSettings>("GET", "/api/content/gallery"),
      staleTime: 1000 * 60 * 10, // Cache for 10 mins
      refetchOnWindowFocus: false, // Optional: Less aggressive refetching
  });

   // --- Loading State ---
   if (isLoading) {
     return (
        <div className="py-16 lokta-paper-bg min-h-[60vh] flex items-center justify-center">
            <div className="container mx-auto px-4 text-center">
                 <Loader />
                 <p className="mt-4 font-garamond text-terracotta">Loading gallery...</p>
            </div>
        </div>
     );
   }

    // --- Error State ---
    if (isError) {
     return (
        <main className="py-16 lokta-paper-bg min-h-screen">
            <div className="container mx-auto px-4">
                <BhutaneseBorder className="max-w-4xl mx-auto p-8 bg-parchment/80 shadow-lg">
                    <h1 className="font-trajan text-3xl md:text-4xl text-destructive text-center mb-6">Error Loading Gallery</h1>
                    <p className="font-garamond text-lg text-center text-destructive">
                        {error?.message || "Could not load gallery information at this time. Please try again later."}
                    </p>
                 </BhutaneseBorder>
            </div>
        </main>
     );
   }

  const displaySettings = settings || { pageHeading: "Gallery", pageParagraph: "Explore images from the Dragon Kingdom." };

  return (
    <main className="py-16 lokta-paper-bg min-h-screen">
      <div className="container mx-auto px-4">
        {/* Page Header Section */}
        <BhutaneseBorder className="max-w-4xl mx-auto p-8 bg-parchment/80 mb-12 shadow-md">
          <h1 className="font-trajan text-3xl md:text-4xl text-monastic-red text-center mb-6">
             {displaySettings.pageHeading}
          </h1>
          <p className="font-garamond text-lg text-center leading-relaxed">
            {displaySettings.pageParagraph}
          </p>
        </BhutaneseBorder>
        <GalleryGrid />
      </div>
    </main>
  );
}