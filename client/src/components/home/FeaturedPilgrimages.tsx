import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import TourCard from "@/components/tours/TourCard";
import BhutaneseBorder from "@/components/shared/BhutaneseBorder";
import type { Tour } from "@shared/schema";
import Loader from "@/components/shared/Loader";
// Removed getImageUrl as mapURL comes from props

// Define props interface
interface FeaturedPilgrimagesProps {
    heading?: string;
    mapURL?: string;
    mapAlt?: string;
    mapCaption?: string;
    buttonText?: string;
}

export default function FeaturedPilgrimages({
    heading = "Our Sacred Journeys",
    mapURL = "",
    mapAlt = "Map of Bhutan",
    mapCaption = "Ancient cartography",
    buttonText = "View All Pilgrimages",
}: FeaturedPilgrimagesProps) { // Destructure props
  const [mapLoaded, setMapLoaded] = useState(false);

  // Fetch featured tours (this internal fetch remains)
  const { data: featuredTours, isLoading: isLoadingTours } = useQuery<Tour[]>({
    queryKey: ['/api/tours/featured'], // Query key remains the same
  });

  // Preload map image
  useEffect(() => {
    setMapLoaded(false);
    if (mapURL) {
      const img = new Image();
      img.src = mapURL;
      img.onload = () => setMapLoaded(true);
       img.onerror = () => {
            console.error("Failed to load map image:", mapURL);
            setMapLoaded(true); // Mark loaded to show content
        }
    } else {
        setMapLoaded(true); // Mark loaded if no URL
    }
  }, [mapURL]);

  return (
    <section id="pilgrimages" className="py-16 bg-parchment-dark textile-texture-bg">
      <div className="container mx-auto px-4">
        {/* Use heading prop */}
        <h2 className="font-trajan text-3xl text-monastic-red text-center mb-12">
            {heading}
        </h2>

        {/* Map of Bhutan with sacred sites - Use map props */}
        <div className="mb-16 max-w-4xl mx-auto">
          <BhutaneseBorder className="p-4 bg-parchment/70">
            <h3 className="font-trajan text-2xl text-center mb-4 text-charcoal">Sacred Lands of Bhutan</h3>
            <div className="aspect-w-16 aspect-h-9 relative min-h-[250px]"> {/* Added min-height */}
              {mapURL ? (
                  mapLoaded ? (
                    <img
                      src={mapURL}
                      alt={mapAlt}
                      className="w-full h-auto filter-aged object-contain" // Maintain object-contain maybe?
                    />
                  ) : (
                    <div className="w-full h-64 bg-parchment-dark flex items-center justify-center">
                      <Loader />
                    </div>
                  )
              ) : (
                   <div className="w-full h-64 bg-parchment-dark flex items-center justify-center text-charcoal/50 italic">
                      (Map image not set)
                   </div>
              )}
            </div>
            <p className="font-garamond text-center mt-4 text-charcoal italic">
              {mapCaption}
            </p>
          </BhutaneseBorder>
        </div>

        {/* Featured Tours Grid - internal fetch */}
        {isLoadingTours ? (
          <div className="flex justify-center">
            <Loader />
          </div>
        ) : featuredTours && featuredTours.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredTours.map((tour) => (
              <TourCard key={tour.id} tour={tour} />
            ))}
          </div>
        ) : (
            <p className="text-center font-garamond text-charcoal">No featured pilgrimages available at the moment.</p>
        )}

        {/* View All Button - Use buttonText prop */}
        <div className="text-center mt-12">
          <Link href="/pilgrimages">
            <Button variant="carved" size="lg">
              {buttonText}
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}