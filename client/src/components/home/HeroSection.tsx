import { useEffect, useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import Loader from "@/components/shared/Loader"; // Add loader for image loading state

// Define props interface
interface HeroSectionProps {
    imageUrl?: string;
    imageAlt?: string;
    headingLine1?: string;
    headingLine2?: string;
    paragraph?: string;
    buttonText?: string;
}

export default function HeroSection({
    imageUrl = "", // Provide default values
    imageAlt = "Hero Background",
    headingLine1 = "Walk the Ancient Paths:",
    headingLine2 = "Bhutan Pilgrimage Through the Ages",
    paragraph = "Discover pilgrimages steeped in history, connecting you to centuries of spiritual tradition.",
    buttonText = "Explore Our Sacred Routes",
}: HeroSectionProps) { // Destructure props
  const [loaded, setLoaded] = useState(false);

  // Preload image when URL changes
  useEffect(() => {
    setLoaded(false); // Reset on URL change
    if (imageUrl) {
        const img = new Image();
        img.src = imageUrl;
        img.onload = () => setLoaded(true);
        img.onerror = () => {
            console.error("Failed to load hero image:", imageUrl);
            setLoaded(true); // Still mark loaded to show content, even on error
        }
    } else {
        setLoaded(true); // Mark loaded immediately if no image URL provided
    }
  }, [imageUrl]);

  return (
    <section className="relative h-screen flex items-center justify-center text-center">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        {imageUrl ? ( // Only try to show image if URL exists
            loaded ? (
              <img
                src={imageUrl}
                alt={imageAlt}
                className="w-full h-full object-cover filter-aged"
                loading="eager" // Load hero image eagerly
              />
            ) : (
              // Show loader *while* image is loading
              <div className="w-full h-full bg-gradient-to-b from-charcoal/80 to-charcoal/60 flex items-center justify-center text-parchment/50">
                  <Loader />
              </div>
            )
        ) : (
             // Show placeholder if no image URL is provided at all
            <div className="w-full h-full bg-gradient-to-b from-charcoal/80 to-charcoal/60 flex items-center justify-center text-parchment/50 italic">
               (Background image not set)
            </div>
        )}
         {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-black/20"></div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 z-10 text-center relative">
        {/* Use props for content */}
        <h1 className="font-trajan text-4xl md:text-5xl lg:text-6xl text-parchment mb-4 tracking-wide">
          {headingLine1} <br />
          <span className="text-faded-gold">{headingLine2}</span>
        </h1>
        <p className="font-garamond text-xl md:text-2xl text-parchment mb-8 max-w-3xl mx-auto">
          {paragraph}
        </p>
        <Link href="/pilgrimages">
          <Button variant="carved" size="lg">
            {buttonText}
          </Button>
        </Link>
      </div>
    </section>
  );
}