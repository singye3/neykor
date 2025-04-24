import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import TourCard from "@/components/tours/TourCard";
import BhutaneseBorder from "@/components/shared/BhutaneseBorder";
import Loader from "@/components/shared/Loader";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Tour } from "@shared/schema";

export default function PilgrimagesPage() {
  const [difficultyFilter, setDifficultyFilter] = useState<string>("all");
  const [durationFilter, setDurationFilter] = useState<string>("all");
  
  const { data: tours, isLoading } = useQuery<Tour[]>({
    queryKey: ['/api/tours'],
  });
  
  const filteredTours = tours?.filter(tour => {
    let matchesDifficulty = difficultyFilter === "all" || tour.difficulty === difficultyFilter;
    let matchesDuration = durationFilter === "all";
    
    if (durationFilter === "short") {
      matchesDuration = tour.duration.includes("5") || tour.duration.includes("4") || tour.duration.includes("3");
    } else if (durationFilter === "medium") {
      matchesDuration = tour.duration.includes("6") || tour.duration.includes("7") || tour.duration.includes("8");
    } else if (durationFilter === "long") {
      matchesDuration = tour.duration.includes("9") || tour.duration.includes("10") || parseInt(tour.duration) > 10;
    }
    
    return matchesDifficulty && matchesDuration;
  });

  return (
    <main className="py-16 lokta-paper-bg min-h-screen">
      <div className="container mx-auto px-4">
        <BhutaneseBorder className="max-w-6xl mx-auto p-8 bg-parchment/80 mb-12">
          <h1 className="font-trajan text-4xl text-monastic-red text-center mb-6">Our Catalogue of Sacred Journeys</h1>
          <p className="font-garamond text-lg text-center max-w-3xl mx-auto">
            Explore our carefully crafted pilgrimages that follow ancient routes through Bhutan's sacred landscape. Each journey connects you with centuries of spiritual tradition and authentic cultural heritage.
          </p>
        </BhutaneseBorder>
        
        <div className="max-w-6xl mx-auto mb-8">
          <div className="flex flex-wrap gap-4">
            <div className="w-full md:w-auto">
              <label className="block font-garamond text-lg mb-2">Filter by Difficulty</label>
              <Select
                value={difficultyFilter}
                onValueChange={setDifficultyFilter}
              >
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Difficulties</SelectItem>
                  <SelectItem value="Easy">Easy</SelectItem>
                  <SelectItem value="Moderate">Moderate</SelectItem>
                  <SelectItem value="Challenging">Challenging</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="w-full md:w-auto">
              <label className="block font-garamond text-lg mb-2">Filter by Duration</label>
              <Select
                value={durationFilter}
                onValueChange={setDurationFilter}
              >
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Durations</SelectItem>
                  <SelectItem value="short">Short (3-5 days)</SelectItem>
                  <SelectItem value="medium">Medium (6-8 days)</SelectItem>
                  <SelectItem value="long">Long (9+ days)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader />
          </div>
        ) : filteredTours && filteredTours.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {filteredTours.map((tour) => (
              <TourCard key={tour.id} tour={tour} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 max-w-2xl mx-auto">
            <h3 className="font-trajan text-2xl text-monastic-red mb-4">No Pilgrimages Found</h3>
            <p className="font-garamond text-lg">
              No pilgrimages match your current filters. Please adjust your selections to see more journeys.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
