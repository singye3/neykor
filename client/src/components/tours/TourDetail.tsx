// client/src/components/tours/TourDetail.tsx
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient"; // Use the corrected apiRequest
import { bhutaneseSymbols } from "@/lib/utils";
import { getImageUrl } from "@/lib/utils";
import BhutaneseBorder from "@/components/shared/BhutaneseBorder";
import TourInquiryForm from "@/components/tours/TourInquiryForm";
import Loader from "@/components/shared/Loader";
import type { Tour } from "@shared/schema";

interface TourDetailProps {
  tourId: string;
}

// Removed the separate fetchTour function as apiRequest handles the logic

export default function TourDetail({ tourId }: TourDetailProps) {
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  // Use React Query to fetch the specific tour data
  const { data: tour, isLoading, isError, error } = useQuery<Tour, Error>({
    queryKey: ['tour', tourId], // Query key including the specific tour ID
    // --- UPDATED queryFn ---
    // Directly use apiRequest, specifying the expected Tour type.
    // apiRequest handles fetch, error checks, and JSON parsing.
    queryFn: () => {
        if (!tourId || isNaN(parseInt(tourId))) {
            // Prevent fetch if ID is invalid, throw error for React Query
             console.error("QueryFn: Invalid Tour ID provided:", tourId);
             throw new Error("Invalid Tour ID provided.");
        }
        return apiRequest<Tour>("GET", `/api/tours/${tourId}`);
    },
    // --- End Update ---
    enabled: !!tourId && !isNaN(parseInt(tourId)), // Only run if tourId looks valid
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    refetchOnWindowFocus: false, // Optional: prevent refetch on focus
  });

  // Effect for image preloading
  useEffect(() => {
    setIsImageLoaded(false);
    if (tour?.imageType) {
      const img = new Image();
      img.src = getImageUrl(tour.id, tour.imageType || "genericLandscape");
      img.onload = () => setIsImageLoaded(true);
      img.onerror = () => {
          console.warn(`Failed to preload image: ${img.src}`);
          setIsImageLoaded(true); // Avoid infinite loader on image error
      }
    } else if (tour) { // If tour exists but no imageType, mark as loaded
      setIsImageLoaded(true);
    }
  }, [tour]); // Depend on tour data

  // --- Conditional Rendering ---

  if (isLoading) {
    return (
      <div className="py-24 lokta-paper-bg min-h-[60vh] flex items-center justify-center">
        <div className="container mx-auto px-4 text-center">
          <Loader />
          <p className="mt-4 font-garamond text-terracotta">Loading pilgrimage details...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="py-16 lokta-paper-bg">
        <div className="container mx-auto px-4">
          <BhutaneseBorder className="max-w-4xl mx-auto p-8 bg-parchment/80 shadow-lg">
            <h2 className="font-trajan text-2xl text-destructive text-center">Error Loading Pilgrimage</h2>
            <p className="font-garamond text-center mt-4 text-destructive">
              {error?.message || "An unexpected error occurred."}
            </p>
          </BhutaneseBorder>
        </div>
      </div>
    );
  }

  if (!tour) {
    // This state could be reached if enabled=false or fetch returns null/undefined unexpectedly
    return (
      <div className="py-16 lokta-paper-bg">
        <div className="container mx-auto px-4">
          <BhutaneseBorder className="max-w-4xl mx-auto p-8 bg-parchment/80 shadow-lg">
            <h2 className="font-trajan text-2xl text-monastic-red text-center">Pilgrimage Not Found</h2>
            <p className="font-garamond text-center mt-4">
              The requested pilgrimage could not be found or the ID is invalid.
            </p>
          </BhutaneseBorder>
        </div>
      </div>
    );
  }

  // --- Success Render ---
  const heroImageUrl = getImageUrl(tour.id, tour.imageType || "genericLandscape");

  return (
    <section id="tour-detail" className="py-16 lokta-paper-bg">
      <div className="container mx-auto px-4">
        <BhutaneseBorder className="max-w-4xl mx-auto p-6 md:p-8 bg-parchment/80 shadow-lg rounded">
          {/* Title */}
          <div className="flex items-center justify-center mb-4 text-center">
            <span className="text-faded-gold text-xl md:text-2xl mr-3 opacity-80">{bhutaneseSymbols.dharmaWheel}</span>
            <h1 className="font-trajan text-2xl md:text-3xl lg:text-4xl text-monastic-red">{tour.title}</h1>
            <span className="text-faded-gold text-xl md:text-2xl ml-3 opacity-80">{bhutaneseSymbols.dharmaWheel}</span>
          </div>

          {/* Location */}
          <p className="font-garamond text-center text-lg text-terracotta mb-6">
            {tour.location}
          </p>

          {/* Image */}
          <div className="mb-8 aspect-w-16 aspect-h-9 rounded overflow-hidden shadow-md bg-parchment-dark">
            {!isImageLoaded ? (
              <div className="w-full h-full flex items-center justify-center"><Loader /></div>
            ) : (
              <img
                src={heroImageUrl}
                alt={`Scenic view for ${tour.title}`}
                className="w-full h-full object-cover filter-aged transition-opacity duration-500 ease-in-out"
                style={{ opacity: isImageLoaded ? 1 : 0 }}
              />
            )}
          </div>

          {/* Overview */}
          <div className="mb-10">
            <h2 className="font-trajan text-xl md:text-2xl text-terracotta mb-4 border-b border-faded-gold pb-2">Overview</h2>
            <p className="font-garamond text-lg leading-relaxed whitespace-pre-wrap">
              {tour.longDescription}
            </p>
          </div>

          {/* Itinerary */}
          <div className="mb-10">
            <h2 className="font-trajan text-xl md:text-2xl text-terracotta mb-6 border-b border-faded-gold pb-2">Daily Itinerary</h2>
            <div className="space-y-6">
              {tour.itinerary.map((day) => (
                <div key={day.day} className="pl-2">
                  <div className="flex items-baseline mb-1">
                    <span className="text-monastic-red text-lg mr-2 mt-1 opacity-90">{bhutaneseSymbols.dharmaWheel}</span>
                    <h3 className="font-semibold text-lg md:text-xl font-garamond">
                      Day {day.day}: <span className="font-semibold">{day.title}</span>
                    </h3>
                  </div>
                  <p className="font-garamond text-base md:text-lg pl-8 leading-relaxed whitespace-pre-wrap">
                    {day.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Details */}
          <div className="mb-12">
            <h2 className="font-trajan text-xl md:text-2xl text-terracotta mb-4 border-b border-faded-gold pb-2">Tour Details</h2>
            <ul className="font-garamond text-base md:text-lg space-y-2 list-none pl-0">
              <li className="flex items-start"><span className="text-faded-gold mr-3 mt-1 opacity-90">{bhutaneseSymbols.diamondBullet}</span><span><strong>Duration:</strong> {tour.duration}</span></li>
              <li className="flex items-start"><span className="text-faded-gold mr-3 mt-1 opacity-90">{bhutaneseSymbols.diamondBullet}</span><span><strong>Location:</strong> {tour.location}</span></li>
              <li className="flex items-start"><span className="text-faded-gold mr-3 mt-1 opacity-90">{bhutaneseSymbols.diamondBullet}</span><span><strong>Difficulty:</strong> {tour.difficulty}</span></li>
              <li className="flex items-start"><span className="text-faded-gold mr-3 mt-1 opacity-90">{bhutaneseSymbols.diamondBullet}</span><span><strong>Accommodation:</strong> {tour.accommodation}</span></li>
              <li className="flex items-start"><span className="text-faded-gold mr-3 mt-1 opacity-90">{bhutaneseSymbols.diamondBullet}</span><span><strong>Group Size:</strong> {tour.groupSize}</span></li>
              <li className="flex items-start"><span className="text-faded-gold mr-3 mt-1 opacity-90">{bhutaneseSymbols.diamondBullet}</span><span><strong>Price:</strong> From ${tour.price.toLocaleString()} per person</span></li>
            </ul>
          </div>

          {/* Inquiry Form */}
          <TourInquiryForm tourId={tour.id.toString()} tourName={tour.title} />

        </BhutaneseBorder>
      </div>
    </section>
  );
}