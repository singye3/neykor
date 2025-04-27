// client/src/components/gallery/GalleryGrid.tsx

import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient"; // Use corrected apiRequest
import BhutaneseBorder from "@/components/shared/BhutaneseBorder";
import Loader from "@/components/shared/Loader";
import { AlertCircle, ImageIcon } from "lucide-react";

// Interface for data from /api/gallery/images endpoint
interface ImageKitGalleryItem {
    id: string;
    url: string;
    thumbnailUrl?: string;
    name: string;
    filePath: string;
    height?: number;
    width?: number;
    size?: number;
}

// Props for the component
interface GalleryGridProps {
  limit?: number;
}

// The GalleryGrid component using aspect-square layout with background images
export default function GalleryGrid({ limit }: GalleryGridProps) {
  // Fetch data using useQuery and apiRequest directly
  const { data: images, isLoading, isError, error } = useQuery<ImageKitGalleryItem[], Error>({
    queryKey: ['imageKitGallery', '/uploads/gallery'], // Query key
    // --- UPDATED queryFn ---
    // Directly use apiRequest, specifying the expected return type array.
    queryFn: () => apiRequest<ImageKitGalleryItem[]>("GET", "/api/gallery/images"),
    // --- End Update ---
    staleTime: 1000 * 60 * 5, // 5 minutes cache freshness
    refetchOnWindowFocus: false,
  });

  // State to track loading status for each image URL
  type LoadStatus = 'loading' | 'loaded' | 'error';
  const [imageLoadStatus, setImageLoadStatus] = useState<Record<string, LoadStatus>>({});

  // --- Image Preloading Effect ---
  useEffect(() => {
    if (!images) return; // Don't run if images haven't loaded yet

    const currentUrls = new Set(images.map(img => img.thumbnailUrl || img.url));
    const statusUpdates: Record<string, LoadStatus> = {};
    let needsInitialStatusUpdate = false;

    images.forEach((image) => {
      const urlToLoad = image.thumbnailUrl || image.url;
      // Only initiate loading if we haven't recorded a final status ('loaded' or 'error') yet
      if (!imageLoadStatus[urlToLoad] || imageLoadStatus[urlToLoad] === 'loading') {
          if (!imageLoadStatus[urlToLoad]) {
              statusUpdates[urlToLoad] = 'loading';
              needsInitialStatusUpdate = true;
          }

          const img = new Image();
          img.src = urlToLoad;
          img.onload = () => {
              setImageLoadStatus(prev => ({ ...prev, [urlToLoad]: 'loaded' }));
          };
          img.onerror = () => {
              console.error("Failed to load image:", urlToLoad);
              setImageLoadStatus(prev => ({ ...prev, [urlToLoad]: 'error' }));
          };
      }
    });

    // Apply initial 'loading' statuses if needed
    if (needsInitialStatusUpdate) {
        setImageLoadStatus(prev => ({ ...prev, ...statusUpdates }));
    }

    // Optional cleanup: Remove statuses for images no longer present
    setImageLoadStatus(prev => {
        const nextState = { ...prev };
        let stateChanged = false;
        Object.keys(nextState).forEach(url => {
            if (!currentUrls.has(url)) {
                delete nextState[url];
                stateChanged = true;
            }
        });
        return stateChanged ? nextState : prev;
    });

  }, [images]); // Dependency: Rerun effect if the images array changes

  // Apply limit if provided
  const displayedImages = limit && images ? images.slice(0, limit) : images;

  // === Render Loading State ===
  if (isLoading) {
    return <div className="flex justify-center py-16 min-h-[300px]"><Loader /></div>;
  }

  // === Render Error State ===
  if (isError) {
     return (
        <div className="max-w-4xl mx-auto text-center text-destructive bg-red-100 border border-destructive p-6 rounded-md">
            <h3 className="font-semibold mb-2">Error Loading Gallery Data</h3>
            <p className="text-sm">{error?.message || "Unknown error"}</p>
        </div>
     );
  }

  // === Render No Images State ===
   if (!displayedImages || displayedImages.length === 0) {
     return (
        <div className="max-w-4xl mx-auto text-center text-charcoal/80 p-8">
            <ImageIcon className="mx-auto h-12 w-12 text-charcoal/50 mb-2"/>
            <p>No images available in the gallery at this time.</p>
        </div>
     );
   }

  // === Success State: Render the grid ===
  return (
    <div className="max-w-6xl mx-auto">
      {/* Parent container with border and page-like background */}
      <BhutaneseBorder className="p-4 md:p-6 bg-parchment/70 mb-8 shadow-sm rounded">
        {/* Image Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-4">
          {displayedImages.map((image) => {
             const displayUrl = image.thumbnailUrl || image.url;
             // Ensure a default status of 'loading' if the effect hasn't set it yet
             const loadStatus = imageLoadStatus[displayUrl] ?? 'loading';

             return (
                // Container div: Square, holds background, centers content, applies effects
                <div
                    key={image.id}
                    className={`
                        aspect-square overflow-hidden group relative
                        border border-faded-gold/50 rounded
                        flex items-center justify-center
                        transition-all duration-300 ease-in-out
                        bg-parchment-dark/50 
                        ${loadStatus === 'loaded' ? 'filter-aged group-hover:filter-none group-hover:scale-105' : ''}
                    `}
                    style={{
                        ...(loadStatus === 'loaded' && { // Apply background only when loaded
                            backgroundImage: `url(${displayUrl})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center center',
                            backgroundRepeat: 'no-repeat',
                            backgroundColor: 'transparent', // Override bg-parchment-dark
                        })
                    }}
                >
                    {/* Show loader only when loading */}
                    {loadStatus === 'loading' && (
                        <Loader />
                    )}
                    {/* Show error icon only on error */}
                    {loadStatus === 'error' && (
                        <div className="w-full h-full flex items-center justify-center text-destructive opacity-70 p-2" title={`Error loading ${image.name}`}>
                            <AlertCircle className="w-1/2 h-1/2"/>
                        </div>
                    )}
                </div>
              )
          })}
        </div>
      </BhutaneseBorder>
    </div>
  );
}