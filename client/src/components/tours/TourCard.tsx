import { Link } from "wouter";
import { useState, useEffect } from "react";
import { getImageUrl } from "@/lib/utils";
import { truncateText } from "@/lib/utils";
import type { Tour } from "@shared/schema";

interface TourCardProps {
  tour: Tour;
}

export default function TourCard({ tour }: TourCardProps) {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const img = new Image();
    img.src = getImageUrl(tour.id, tour.imageType || "tigerNest");
    img.onload = () => setLoaded(true);
  }, [tour.id, tour.imageType]);

  return (
    <div className="manuscript-card overflow-hidden transform transition-transform hover:-translate-y-1 hover:shadow-lg">
      <div className="h-64 overflow-hidden">
        {loaded ? (
          <img 
            src={getImageUrl(tour.id, tour.imageType || "tigerNest")}
            alt={tour.title} 
            className="w-full h-full object-cover filter-aged transition-transform duration-500 hover:scale-105" 
          />
        ) : (
          <div className="w-full h-full bg-parchment-dark flex items-center justify-center">
            <span className="text-monastic-red">Loading...</span>
          </div>
        )}
      </div>
      <div className="p-6">
        <h3 className="font-trajan text-xl text-monastic-red mb-3">{tour.title}</h3>
        <p className="font-garamond text-charcoal mb-4">
          {truncateText(tour.description, 120)}
        </p>
        <div className="flex justify-between items-center">
          <span className="font-garamond text-ochre">{tour.duration} • {tour.difficulty}</span>
          <Link href={`/pilgrimages/${tour.id}`}>
            <a className="endless-knot relative pl-4 font-garamond text-monastic-red hover:text-terracotta transition-colors">
              View Details
            </a>
          </Link>
        </div>
      </div>
    </div>
  );
}
