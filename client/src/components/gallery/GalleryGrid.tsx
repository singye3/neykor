import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getImageUrl } from "@/lib/utils";
import BhutaneseBorder from "@/components/shared/BhutaneseBorder";
import { Button } from "@/components/ui/button";
import Loader from "@/components/shared/Loader";
import type { GalleryImage } from "@shared/schema";

interface GalleryGridProps {
  limit?: number;
  showViewMore?: boolean;
}

export default function GalleryGrid({ limit, showViewMore = false }: GalleryGridProps) {
  const { data: images, isLoading } = useQuery<GalleryImage[]>({
    queryKey: ['/api/gallery'],
  });
  
  const [loadedImages, setLoadedImages] = useState<Record<number, boolean>>({});
  
  useEffect(() => {
    if (images) {
      images.forEach((image) => {
        const img = new Image();
        img.src = getImageUrl(image.id, image.type);
        img.onload = () => {
          setLoadedImages(prev => ({
            ...prev,
            [image.id]: true
          }));
        };
      });
    }
  }, [images]);

  const displayedImages = limit ? images?.slice(0, limit) : images;
  
  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <BhutaneseBorder className="p-6 bg-parchment/70 mb-8">
        <h3 className="font-trajan text-2xl text-charcoal text-center mb-6">Glimpses of the Ancient Kingdom</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayedImages?.map((image) => (
            <div key={image.id} className="overflow-hidden cursor-pointer">
              {loadedImages[image.id] ? (
                <img 
                  src={getImageUrl(image.id, image.type)}
                  alt={image.caption} 
                  className="w-full h-64 object-cover filter-aged transition-transform duration-500 hover:scale-105" 
                />
              ) : (
                <div className="w-full h-64 bg-parchment-dark flex items-center justify-center">
                  <Loader />
                </div>
              )}
            </div>
          ))}
        </div>
      </BhutaneseBorder>
      
      {showViewMore && (
        <div className="text-center">
          <Button variant="carved">
            View Complete Archive
          </Button>
        </div>
      )}
    </div>
  );
}
