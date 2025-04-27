// client/src/pages/PilgrimagesPage.tsx
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient"; // Use updated apiRequest
import TourCard from "@/components/tours/TourCard";
import BhutaneseBorder from "@/components/shared/BhutaneseBorder";
import Loader from "@/components/shared/Loader";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Tour } from "@shared/schema";

// Updated fetch function to directly return the result of apiRequest
// apiRequest now handles JSON parsing and error throwing
async function fetchToursWithFilter(locationFilter: string): Promise<Tour[]> {
    let url = "/api/tours";
    if (locationFilter !== "all") {
        url += `?location=${encodeURIComponent(locationFilter)}`;
    }
    // Directly return the promise from apiRequest, specifying expected type
    return apiRequest<Tour[]>("GET", url);
}

export default function PilgrimagesPage() {
  const [locationFilter, setLocationFilter] = useState<string>("all");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("all");
  const [durationFilter, setDurationFilter] = useState<string>("all");

  // Use React Query to fetch tours based on the location filter
  const { data: tours, isLoading, isError, error } = useQuery<Tour[], Error>({
    queryKey: ['tours', locationFilter], // Query key includes filter
    queryFn: () => fetchToursWithFilter(locationFilter), // Use updated fetcher
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    refetchOnWindowFocus: false,
  });

  // Memoize unique locations based on the fetched tours
  const uniqueLocations = useMemo(() => {
    if (!tours) return [];
    // Use Array.from() for wider compatibility if spread syntax caused issues
    return Array.from(new Set(tours.map(tour => tour.location))).sort();
  }, [tours]);

  // Memoize client-side filtering for difficulty and duration
  const filteredTours = useMemo(() => {
      if (!tours) return []; // Return empty if no tours fetched yet

      // Filter the tours received from the query (already potentially filtered by location)
      return tours.filter(tour => {
          // Check difficulty
          const matchesDifficulty = difficultyFilter === "all" || tour.difficulty === difficultyFilter;

          // Check duration
          let matchesDuration = durationFilter === "all";
          if (durationFilter !== "all") {
              const durationString = tour.duration.toLowerCase();
              const daysMatch = durationString.match(/(\d+)\s*day/);
              if (daysMatch?.[1]) { // Safely access match group
                  const numDays = parseInt(daysMatch[1], 10);
                  if (!isNaN(numDays)) {
                           if (durationFilter === "short" && numDays <= 5) matchesDuration = true;
                      else if (durationFilter === "medium" && numDays >= 6 && numDays <= 8) matchesDuration = true;
                      else if (durationFilter === "long" && numDays >= 9) matchesDuration = true;
                  }
              }
              // Add fallback logic if needed, though parsing days is more robust
          }

          return matchesDifficulty && matchesDuration;
      });
  // Dependencies for re-running the client-side filter
  }, [tours, difficultyFilter, durationFilter]);


  return (
    <main className="py-16 lokta-paper-bg min-h-screen">
      <div className="container mx-auto px-4">
        {/* Page Header */}
        <BhutaneseBorder className="max-w-6xl mx-auto p-8 bg-parchment/80 mb-12 shadow-md">
          <h1 className="font-trajan text-3xl md:text-4xl text-monastic-red text-center mb-6">Our Catalogue of Sacred Journeys</h1>
          <p className="font-garamond text-lg text-center max-w-3xl mx-auto">
            Explore our carefully crafted pilgrimages that follow ancient routes through Bhutan's sacred landscape. Each journey connects you with centuries of spiritual tradition and authentic cultural heritage.
          </p>
        </BhutaneseBorder>

        {/* Filter Controls Section */}
        <div className="max-w-6xl mx-auto mb-10 p-4 bg-parchment/50 rounded shadow-sm border border-faded-gold">
          <div className="flex flex-col md:flex-row flex-wrap gap-4 md:gap-6 items-center">
             {/* Location Filter */}
             <div className="w-full md:w-auto flex-grow md:flex-grow-0">
               <label htmlFor="location-filter" className="block font-garamond text-lg mb-1 text-gray-700">Filter by Location</label>
               <Select
                 value={locationFilter}
                 onValueChange={setLocationFilter} // This state change triggers a React Query refetch due to the queryKey
               >
                 <SelectTrigger id="location-filter" className="w-full md:w-[220px] parchment-input">
                   <SelectValue placeholder="Select location" />
                 </SelectTrigger>
                 <SelectContent>
                   <SelectItem value="all">All Locations</SelectItem>
                   {uniqueLocations.map(location => (
                       <SelectItem key={location} value={location}>{location}</SelectItem>
                   ))}
                 </SelectContent>
               </Select>
             </div>

            {/* Difficulty Filter */}
            <div className="w-full md:w-auto flex-grow md:flex-grow-0">
              <label htmlFor="difficulty-filter" className="block font-garamond text-lg mb-1 text-gray-700">Filter by Difficulty</label>
              <Select
                value={difficultyFilter}
                onValueChange={setDifficultyFilter} // This only triggers client-side filtering
              >
                <SelectTrigger id="difficulty-filter" className="w-full md:w-[220px] parchment-input">
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

            {/* Duration Filter */}
            <div className="w-full md:w-auto flex-grow md:flex-grow-0">
              <label htmlFor="duration-filter" className="block font-garamond text-lg mb-1 text-gray-700">Filter by Duration</label>
              <Select
                value={durationFilter}
                onValueChange={setDurationFilter} // This only triggers client-side filtering
              >
                <SelectTrigger id="duration-filter" className="w-full md:w-[220px] parchment-input">
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Durations</SelectItem>
                  <SelectItem value="short">Short (Up to 5 days)</SelectItem>
                  <SelectItem value="medium">Medium (6-8 days)</SelectItem>
                  <SelectItem value="long">Long (9+ days)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Tour Display Area */}
        {isLoading ? (
          // Loading State
          <div className="flex justify-center py-12">
            <Loader />
          </div>
        ) : isError ? (
          // Error State
           <div className="text-center py-12 max-w-2xl mx-auto bg-red-100 border border-destructive p-6 rounded shadow">
             <h3 className="font-trajan text-2xl text-destructive mb-4">Error Loading Tours</h3>
             <p className="font-garamond text-lg text-destructive">
               {error?.message || "Could not fetch pilgrimage data. Please try again later."}
             </p>
           </div>
        ) : filteredTours && filteredTours.length > 0 ? (
          // Success State - Tours Found
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {filteredTours.map((tour) => (
              <TourCard key={tour.id} tour={tour} />
            ))}
          </div>
        ) : (
           // Success State - No Tours Match Filters
          <div className="text-center py-12 max-w-2xl mx-auto">
            <h3 className="font-trajan text-2xl text-monastic-red mb-4">No Pilgrimages Found</h3>
            <p className="font-garamond text-lg">
              No journeys match your current filter combination ({locationFilter !== 'all' ? `Location: ${locationFilter}` : ''}{difficultyFilter !== 'all' ? `, Difficulty: ${difficultyFilter}` : ''}{durationFilter !== 'all' ? `, Duration: ${durationFilter}` : ''}). Please adjust your selections.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}