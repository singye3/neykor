// client/src/components/tours/TourCard.tsx

import { Link } from "wouter";
import { useState, useEffect } from "react";
import { truncateText } from "@/lib/utils"; // Utility to shorten text
import type { Tour } from "@shared/schema"; // Ensure Tour type includes imageUrl

interface TourCardProps {
  tour: Tour;
}

// Default image to use if tour.imageUrl is missing
const DEFAULT_CARD_IMAGE = "/placeholder-card-image.jpg"; // Replace with your actual placeholder path

export default function TourCard({ tour }: TourCardProps) {
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  // Determine the image URL to use, falling back to the default
  const imageUrl = tour.imageUrl || DEFAULT_CARD_IMAGE;

  // Effect to handle image loading state
  useEffect(() => {
    // Reset loaded state if the imageUrl changes
    setIsImageLoaded(false);

    const img = new Image();
    img.src = imageUrl;
    img.onload = () => setIsImageLoaded(true);
    img.onerror = () => {
      console.warn(`Failed to load card image: ${imageUrl}`);
      setIsImageLoaded(true); // Mark as loaded even on error to prevent infinite spinner
    }
    // Previous logic using getImageUrl(tour.id, tour.imageType) is removed
  }, [imageUrl]); // Dependency array now uses the derived imageUrl

  return (
    <div className="manuscript-card flex flex-col overflow-hidden transform transition-transform duration-300 hover:-translate-y-1 hover:shadow-xl bg-parchment border border-faded-gold rounded-sm h-full">
      {/* Image container */}
      <div className="h-56 overflow-hidden relative bg-parchment-dark">
        {/* Link wrapping the image */}
        <Link href={`/pilgrimages/${tour.id}`}>
          <a className="block w-full h-full" aria-label={`View details for ${tour.title}`}>
            {/* Conditional rendering for image or loader */}
            {!isImageLoaded ? (
              <div className="w-full h-full flex items-center justify-center">
                {/* Simple Loader Placeholder */}
                <div className="animate-pulse w-16 h-16 rounded-full bg-parchment-light"></div>
              </div>
            ) : (
              <img
                src={imageUrl} // Use the direct imageUrl or default
                alt={`Image representing ${tour.title}`}
                className="w-full h-full object-cover filter-aged transition-opacity duration-500 ease-in-out"
                style={{ opacity: isImageLoaded ? 1 : 0 }} // Fade-in effect
                loading="lazy" // Lazy load images further down the page
              />
            )}
          </a>
        </Link>
      </div>

      {/* Card Content */}
      <div className="p-5 flex flex-col flex-grow">
        {/* Title - linked */}
        <h3 className="font-trajan text-lg text-monastic-red mb-2">
           <Link href={`/pilgrimages/${tour.id}`}>
                <a className="hover:text-terracotta transition-colors duration-200">{tour.title}</a>
           </Link>
        </h3>

        {/* Location */}
        <p className="font-garamond text-sm text-terracotta mb-3">{tour.location}</p>

        {/* Short Description */}
        <p className="font-garamond text-base text-charcoal mb-4 flex-grow">
          {truncateText(tour.description, 100)} {/* Slightly shorter truncate */}
        </p>

        {/* Footer with details and link */}
        <div className="mt-auto pt-3 border-t border-faded-gold/50 flex justify-between items-center">
          <span className="font-garamond text-sm text-ochre">
            {tour.duration} • {tour.difficulty}
          </span>
          <Link href={`/pilgrimages/${tour.id}`}>
            <a className="endless-knot relative pl-4 font-garamond text-sm text-monastic-red hover:text-terracotta transition-colors duration-200">
              View Details
            </a>
          </Link>
        </div>
      </div>
    </div>
  );
}