// client/src/pages/GalleryPage.tsx
import GalleryGrid from "@/components/gallery/GalleryGrid";
import BhutaneseBorder from "@/components/shared/BhutaneseBorder";

export default function GalleryPage() {
  return (
    <main className="py-16 lokta-paper-bg">
      <div className="container mx-auto px-4">
        <BhutaneseBorder className="max-w-4xl mx-auto p-8 bg-parchment/80 mb-12">
          <h1 className="font-trajan text-4xl text-monastic-red text-center mb-6">Sacred Visions</h1>
          <p className="font-garamond text-lg text-center">
            Explore our visual chronicle of Bhutan's sacred landscapes, ancient temples, vibrant ceremonies, and the timeless beauty of the Dragon Kingdom. Each image captures a moment of reverence and wonder along the pilgrim's path.
          </p>
        </BhutaneseBorder>
        
        <GalleryGrid />
      </div>
    </main>
  );
}
