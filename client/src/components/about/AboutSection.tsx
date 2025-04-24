import { useState, useEffect } from "react";
import { getImageUrl } from "@/lib/utils";
import BhutaneseBorder from "@/components/shared/BhutaneseBorder";
import Loader from "@/components/shared/Loader";

export default function AboutSection() {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const img = new Image();
    img.src = getImageUrl(1, "guide");
    img.onload = () => setLoaded(true);
  }, []);

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="font-trajan text-3xl text-monastic-red text-center mb-8">Our Sacred Journey</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <div>
          {loaded ? (
            <img 
              src={getImageUrl(1, "guide")}
              alt="Bhutanese Guide in Traditional Gho" 
              className="w-full h-auto filter-aged"
            />
          ) : (
            <div className="w-full h-64 bg-parchment-dark flex items-center justify-center">
              <Loader />
            </div>
          )}
        </div>
        <div className="flex flex-col justify-center">
          <p className="font-garamond text-lg mb-4">
            Sacred Bhutan Travels was founded by descendants of traditional pilgrimage guides who served the royal court of Bhutan for generations. Our heritage dates back to the 17th century, when our ancestors guided important religious figures to sacred sites throughout the kingdom.
          </p>
          <p className="font-garamond text-lg">
            Today, we combine this ancestral knowledge with modern expertise to create journeys that honor Bhutan's spiritual heritage while providing comfort and insight to international pilgrims.
          </p>
        </div>
      </div>
      
      <BhutaneseBorder className="p-6 bg-parchment/70 mb-8">
        <h3 className="font-trajan text-2xl text-monastic-red text-center mb-4">Our Philosophy</h3>
        <p className="font-garamond text-lg italic text-center">
          "We do not merely visit sacred places; we encounter them with reverence, allowing their ancient wisdom to speak to our present moment."
        </p>
      </BhutaneseBorder>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-parchment/90 p-4 border border-faded-gold">
          <h4 className="font-trajan text-lg text-monastic-red text-center mb-2">Authenticity</h4>
          <p className="font-garamond text-center">
            We present Bhutanese spirituality in its true context, avoiding commercial simplification.
          </p>
        </div>
        
        <div className="bg-parchment/90 p-4 border border-faded-gold">
          <h4 className="font-trajan text-lg text-monastic-red text-center mb-2">Respect</h4>
          <p className="font-garamond text-center">
            We approach sacred sites with proper protocol, respecting local customs and traditions.
          </p>
        </div>
        
        <div className="bg-parchment/90 p-4 border border-faded-gold">
          <h4 className="font-trajan text-lg text-monastic-red text-center mb-2">Knowledge</h4>
          <p className="font-garamond text-center">
            We share the deep historical and spiritual context that makes each site meaningful.
          </p>
        </div>
      </div>
    </div>
  );
}
