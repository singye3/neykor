// client/src/pages/Home.tsx
import HeroSection from "@/components/home/HeroSection";
import Introduction from "@/components/home/Introduction";
import FeaturedPilgrimages from "@/components/home/FeaturedPilgrimages";
import WhyChooseUs from "@/components/home/WhyChooseUs";
import Testimonials from "@/components/home/Testimonials";
import ImageCarousel from "@/components/home/ImageCarousel";

export default function Home() {
  return (
    <main>
      <HeroSection />
      <Introduction />
      <FeaturedPilgrimages />
      <ImageCarousel />
      <WhyChooseUs />
      <Testimonials />
    </main>
  );
}
