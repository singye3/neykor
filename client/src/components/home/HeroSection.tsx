import { useEffect, useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { getImageUrl } from "@/lib/utils";

export default function HeroSection() {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const img = new Image();
    img.src = getImageUrl(1, "hero");
    img.onload = () => setLoaded(true);
  }, []);

  return (
    <section className="relative h-screen flex items-center justify-center">
      <div className="absolute inset-0 z-0">
        {loaded && (
          <img 
            src={getImageUrl(1, "hero")}
            alt="Ancient Bhutanese Temple" 
            className="w-full h-full object-cover filter-aged"
          />
        )}
        {!loaded && <div className="w-full h-full bg-charcoal/20"></div>}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-black/20"></div>
      </div>
      <div className="container mx-auto px-4 z-10 text-center">
        <h2 className="font-trajan text-4xl md:text-5xl lg:text-6xl text-parchment mb-4 tracking-wide">
          Walk the Ancient Paths: <br />
          <span className="text-faded-gold">Bhutan Pilgrimage Through the Ages</span>
        </h2>
        <p className="font-garamond text-xl md:text-2xl text-parchment mb-8 max-w-3xl mx-auto">
          Discover pilgrimages steeped in history, connecting you to centuries of spiritual tradition.
        </p>
        <Link href="/pilgrimages">
          <Button variant="carved" size="lg">
            Explore Our Sacred Routes
          </Button>
        </Link>
      </div>
    </section>
  );
}
