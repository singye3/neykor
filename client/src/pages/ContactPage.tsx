// client/src/pages/ContactPage.tsx
import { useState, useEffect } from "react";
import ContactForm from "@/components/contact/ContactForm";
import { getImageUrl } from "@/lib/utils";
import Loader from "@/components/shared/Loader";

export default function ContactPage() {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const img = new Image();
    img.src = getImageUrl(1, "mountains");
    img.onload = () => setLoaded(true);
  }, []);

  return (
    <main className="py-16 wood-texture-bg">
      <div className="container mx-auto px-4">
        <h1 className="font-trajan text-3xl text-parchment text-center mb-12">Begin Your Journey</h1>
        
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-parchment/90 p-6 border border-faded-gold">
            <h2 className="font-trajan text-2xl text-monastic-red mb-6">Contact Sacred Bhutan Travels</h2>
            <ContactForm />
          </div>
          
          <div className="bg-parchment/90 p-6 border border-faded-gold flex flex-col justify-between">
            <div>
              <h2 className="font-trajan text-2xl text-monastic-red mb-6">Our Location</h2>
              
              <div className="mb-6">
                <div className="aspect-w-16 aspect-h-9 mb-4">
                  {loaded ? (
                    <img 
                      src={getImageUrl(1, "mountains")}
                      alt="Mountains of Bhutan" 
                      className="w-full h-64 object-cover filter-aged"
                    />
                  ) : (
                    <div className="w-full h-64 bg-parchment-dark flex items-center justify-center">
                      <Loader />
                    </div>
                  )}
                </div>
                <p className="font-garamond text-center italic">
                  Our sanctuary in the heart of Thimphu, Kingdom of Bhutan
                </p>
              </div>
              
              <div className="space-y-3 font-garamond">
                <p><strong>Address:</strong> Near Memorial Chorten, Thimphu, Kingdom of Bhutan</p>
                <p><strong>Email:</strong> pilgrimages@sacredbhutantravels.bt</p>
                <p><strong>Phone:</strong> +975 2 333 444</p>
              </div>
            </div>
            
            <div className="mt-6 pt-6 border-t border-faded-gold">
              <h3 className="font-trajan text-lg text-monastic-red mb-2">Office Hours</h3>
              <p className="font-garamond">Monday to Friday: 9:00 AM - 5:00 PM (Bhutan Standard Time)</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
