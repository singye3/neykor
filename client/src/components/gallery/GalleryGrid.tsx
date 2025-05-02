import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
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

// The GalleryGrid component with improved image handling
export default function GalleryGrid({ limit }: GalleryGridProps) {
  const { data: images, isLoading, isError, error } = useQuery<ImageKitGalleryItem[], Error>({
    queryKey: ['imageKitGallery', '/uploads/gallery'],
    queryFn: () => apiRequest<ImageKitGalleryItem[]>("GET", "/api/gallery/images"),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });

  type LoadStatus = 'loading' | 'loaded' | 'error';
  const [imageLoadStatus, setImageLoadStatus] = useState<Record<string, LoadStatus>>({});

  // Image Preloading and State Tracking Effect
  useEffect(() => {
    if (!images) return;

    const currentUrls = new Set(images.map(img => img.thumbnailUrl || img.url));
    const statusUpdates: Record<string, LoadStatus> = {};
    let needsInitialStatusUpdate = false;

    images.forEach((image) => {
      const urlToLoad = image.thumbnailUrl || image.url;
      if (!imageLoadStatus[urlToLoad] || imageLoadStatus[urlToLoad] === 'loading') {
          if (!imageLoadStatus[urlToLoad]) {
              statusUpdates[urlToLoad] = 'loading';
              needsInitialStatusUpdate = true;
          }

          const img = new Image();
          img.src = urlToLoad;
          img.onload = () => {
              setImageLoadStatus(prev => {
                  if (prev[urlToLoad] === 'loading') {
                     return { ...prev, [urlToLoad]: 'loaded' };
                  }
                  return prev;
              });
          };
          img.onerror = () => {
              console.error("Failed to load image during preload:", urlToLoad);
               setImageLoadStatus(prev => {
                  if (prev[urlToLoad] === 'loading') {
                     return { ...prev, [urlToLoad]: 'error' };
                  }
                  return prev;
              });
          };
      }
    });

    if (needsInitialStatusUpdate) {
        setImageLoadStatus(prev => ({ ...prev, ...statusUpdates }));
    }

     setImageLoadStatus(prev => {
        const nextState = { ...prev };
        let stateChanged = false;
        Object.keys(nextState).forEach(url => {
            if (!currentUrls.has(url) && nextState[url] !== undefined) {
                delete nextState[url];
                stateChanged = true;
            }
        });
        return stateChanged ? nextState : prev;
    });

  }, [images]);

  const displayedImages = limit && images ? images.slice(0, limit) : images;

  if (isLoading) {
    return <div className="flex justify-center py-16 min-h-[300px]"><Loader /></div>;
  }

  if (isError) {
     return (
        <div className="max-w-4xl mx-auto text-center text-destructive bg-red-100 border border-destructive p-6 rounded-md">
            <h3 className="font-semibold mb-2">Error Loading Gallery Data</h3>
            <p className="text-sm">{error?.message || "Unknown error"}</p>
        </div>
     );
  }

   if (!displayedImages || displayedImages.length === 0) {
     return (
        <div className="max-w-4xl mx-auto text-center text-charcoal/80 p-8">
            <ImageIcon className="mx-auto h-12 w-12 text-charcoal/50 mb-2"/>
            <p>No images available in the gallery at this time.</p>
        </div>
     );
   }

  return (
    <div className="max-w-6xl mx-auto">
      <BhutaneseBorder className="p-4 md:p-6 bg-parchment/70 mb-8 shadow-sm rounded">
        {/* Image Grid Container */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-4">
          {displayedImages.map((image) => {
             const displayUrl = image.thumbnailUrl || image.url;
             const loadStatus = imageLoadStatus[displayUrl] ?? 'loading';

             return (
                <div
                    key={image.id}
                    className={`
                        aspect-[4/3]
                        overflow-hidden relative
                        border border-faded-gold/50 rounded
                        transition-all duration-300 ease-in-out
                        bg-parchment-dark/50
                        ${loadStatus === 'loaded' ? 'filter-aged hover:filter-none hover:scale-105' : ''}
                        group
                    `}
                >
                    {/* Image container - will completely fill the parent div */}
                    {loadStatus === 'loaded' && (
                        <img
                            src={displayUrl}
                            alt={image.name}
                            className="absolute inset-0 w-full h-full object-cover"
                            loading="lazy"
                            onError={() => {
                                setImageLoadStatus(prev => ({
                                    ...prev,
                                    [displayUrl]: 'error'
                                }));
                            }}
                        />
                    )}

                    {/* Loader Overlay - Positioned absolutely */}
                    {loadStatus === 'loading' && (
                        <div className="absolute inset-0 flex items-center justify-center bg-parchment-dark/80 z-10">
                            <Loader />
                        </div>
                    )}

                    {/* Error Overlay - Positioned absolutely */}
                    {loadStatus === 'error' && (
                        <div className="absolute inset-0 flex items-center justify-center bg-red-100/80 text-destructive z-10 p-2" title={`Error loading ${image.name}`}>
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