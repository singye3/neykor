import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { bhutaneseSymbols } from "@/lib/utils";
import { getImageUrl } from "@/lib/utils";
import BhutaneseBorder from "@/components/shared/BhutaneseBorder";
import TourInquiryForm from "@/components/tours/TourInquiryForm";
import Loader from "@/components/shared/Loader";
import type { Tour } from "@shared/schema";

interface TourDetailProps {
  tourId: string;
}

export default function TourDetail({ tourId }: TourDetailProps) {
  const [loaded, setLoaded] = useState(false);
  
  const { data: tour, isLoading } = useQuery<Tour>({
    queryKey: [`/api/tours/${tourId}`],
  });

  useEffect(() => {
    if (tour) {
      const img = new Image();
      img.src = getImageUrl(tour.id, "taktsang");
      img.onload = () => setLoaded(true);
    }
  }, [tour]);

  if (isLoading) {
    return (
      <div className="py-16 lokta-paper-bg">
        <div className="container mx-auto px-4 flex justify-center">
          <Loader />
        </div>
      </div>
    );
  }

  if (!tour) {
    return (
      <div className="py-16 lokta-paper-bg">
        <div className="container mx-auto px-4">
          <BhutaneseBorder className="max-w-4xl mx-auto p-8 bg-parchment/80">
            <h2 className="font-trajan text-2xl text-monastic-red text-center">Pilgrimage not found</h2>
            <p className="font-garamond text-center mt-4">
              We apologize, but the pilgrimage you seek has vanished like mist on the mountains.
            </p>
          </BhutaneseBorder>
        </div>
      </div>
    );
  }

  return (
    <section id="tour-detail" className="py-16 lokta-paper-bg">
      <div className="container mx-auto px-4">
        <BhutaneseBorder className="max-w-4xl mx-auto p-8 bg-parchment/80">
          <div className="flex items-center justify-center mb-6">
            <span className="text-faded-gold text-2xl mr-3">{bhutaneseSymbols.dharmaWheel}</span>
            <h2 className="font-trajan text-3xl text-monastic-red">{tour.title}</h2>
            <span className="text-faded-gold text-2xl ml-3">{bhutaneseSymbols.dharmaWheel}</span>
          </div>
          
          <div className="mb-8">
            {loaded ? (
              <img 
                src={getImageUrl(tour.id, "taktsang")}
                alt={tour.title} 
                className="w-full h-auto filter-aged"
              />
            ) : (
              <div className="w-full h-64 bg-parchment-dark flex items-center justify-center">
                <Loader />
              </div>
            )}
          </div>
          
          <div className="mb-8">
            <h3 className="font-trajan text-2xl text-terracotta mb-4">Overview</h3>
            <p className="font-garamond text-lg mb-4">
              {tour.description}
            </p>
            <p className="font-garamond text-lg">
              {tour.longDescription}
            </p>
          </div>
          
          <div className="mb-8">
            <h3 className="font-trajan text-2xl text-terracotta mb-4">Itinerary Highlights</h3>
            
            {tour.itinerary.map((day, index) => (
              <div key={index} className="mb-6">
                <div className="flex items-center mb-2">
                  <span className="text-monastic-red text-xl mr-2">{bhutaneseSymbols.dharmaWheel}</span>
                  <h4 className="font-trajan text-xl">Day {day.day}: {day.title}</h4>
                </div>
                <p className="font-garamond text-lg pl-8">
                  {day.description}
                </p>
              </div>
            ))}
            
            <div>
              <a href="#" className="endless-knot relative pl-4 font-garamond text-monastic-red hover:text-terracotta transition-colors">
                View Full Itinerary
              </a>
            </div>
          </div>
          
          <div className="mb-8">
            <h3 className="font-trajan text-2xl text-terracotta mb-4">Tour Details</h3>
            <ul className="font-garamond text-lg space-y-2">
              <li className="flex items-start">
                <span className="text-faded-gold mr-2">{bhutaneseSymbols.diamondBullet}</span>
                <span><strong>Duration:</strong> {tour.duration}</span>
              </li>
              <li className="flex items-start">
                <span className="text-faded-gold mr-2">{bhutaneseSymbols.diamondBullet}</span>
                <span><strong>Difficulty:</strong> {tour.difficulty}</span>
              </li>
              <li className="flex items-start">
                <span className="text-faded-gold mr-2">{bhutaneseSymbols.diamondBullet}</span>
                <span><strong>Accommodation:</strong> {tour.accommodation}</span>
              </li>
              <li className="flex items-start">
                <span className="text-faded-gold mr-2">{bhutaneseSymbols.diamondBullet}</span>
                <span><strong>Group Size:</strong> {tour.groupSize}</span>
              </li>
              <li className="flex items-start">
                <span className="text-faded-gold mr-2">{bhutaneseSymbols.diamondBullet}</span>
                <span><strong>Price:</strong> From ${tour.price} per person</span>
              </li>
            </ul>
          </div>
          
          <TourInquiryForm tourId={tour.id.toString()} tourName={tour.title} />
        </BhutaneseBorder>
      </div>
    </section>
  );
}
