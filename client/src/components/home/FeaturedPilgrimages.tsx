// client/src/components/home/FeaturedPilgrimages.tsx
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import TourCard from "@/components/tours/TourCard";
import BhutaneseBorder from "@/components/shared/BhutaneseBorder";
import { getImageUrl } from "@/lib/utils";
import type { Tour } from "@shared/schema";
import Loader from "@/components/shared/Loader";

export default function FeaturedPilgrimages() {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const img = new Image();
    img.src = getImageUrl(1, "map");
    img.onload = () => setLoaded(true);
  }, []);

  const { data: featuredTours, isLoading } = useQuery<Tour[]>({
    queryKey: ['/api/tours/featured'],
  });

  return (
    <section id="pilgrimages" className="py-16 textile-texture-bg">
      <div className="container mx-auto px-4">
        <h2 className="font-trajan text-3xl text-monastic-red text-center mb-12">Our Sacred Journeys</h2>
        
        {/* Map of Bhutan with sacred sites */}
        <div className="mb-16 max-w-4xl mx-auto">
          <BhutaneseBorder className="p-4 bg-parchment/70">
            <h3 className="font-trajan text-2xl text-center mb-4 text-charcoal">Sacred Lands of Bhutan</h3>
            <div className="aspect-w-16 aspect-h-9 relative">
              {loaded ? (
                <img 
                  src={getImageUrl(1, "map")}
                  alt="Vintage-style map of Bhutan showing pilgrimage routes" 
                  className="w-full h-auto filter-aged object-contain" 
                />
              ) : (
                <div className="w-full h-64 bg-parchment-dark flex items-center justify-center">
                  <Loader />
                </div>
              )}
            </div>
            <p className="font-garamond text-center mt-4 text-charcoal italic">
              Ancient cartography revealing the sacred geography of the Dragon Kingdom
            </p>
          </BhutaneseBorder>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center">
            <Loader />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredTours?.map((tour) => (
              <TourCard key={tour.id} tour={tour} />
            ))}
          </div>
        )}
        
        <div className="text-center mt-12">
          <Link href="/pilgrimages">
            <Button variant="carved" size="lg">
              View All Pilgrimages
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
