// client/src/pages/ContactPage.tsx
import { useEffect } from "react"; // Keep useEffect if needed elsewhere, removed imgLoaded state logic
import { useQuery } from "@tanstack/react-query";
import ContactForm from "@/components/contact/ContactForm";
import Loader from "@/components/shared/Loader";
import { apiRequest } from "@/lib/queryClient";
import type { ContactPageSettings } from "@shared/schema";

// Removed the separate fetchContactPageSettings function

export default function ContactPage() {
  // Removed imgLoaded state as iframe handles its loading

  // Fetch settings data using useQuery and apiRequest directly
  const { data: settings, isLoading, isError, error } = useQuery<ContactPageSettings, Error>({
      queryKey: ['contactPageSettings'],
      queryFn: () => apiRequest<ContactPageSettings>("GET", "/api/content/contact"),
      staleTime: 1000 * 60 * 10, // Cache for 10 mins
      refetchOnWindowFocus: false,
  });

  // No longer need the image preloading useEffect

  // --- Loading State ---
  if (isLoading) {
     return (
        <div className="py-16 wood-texture-bg min-h-screen flex items-center justify-center">
            <Loader />
        </div>
     );
  }

  // --- Error State ---
  if (isError) {
       return (
         <main className="py-16 wood-texture-bg min-h-screen">
           <div className="container mx-auto px-4">
             <h1 className="font-trajan text-3xl text-parchment text-center mb-12">Contact Us</h1>
             <div className="max-w-4xl mx-auto p-8 bg-red-100 border border-destructive text-center rounded shadow">
                <h2 className="text-xl font-semibold text-destructive mb-2">Error Loading Contact Information</h2>
                <p className="text-destructive">{error?.message || "Could not load contact details. Please try again later."}</p>
             </div>
           </div>
         </main>
       );
  }

  // --- Success State ---
  const displaySettings = settings || {} as ContactPageSettings;

  // --- Construct Google Maps Embed URL ---
  // Use encodeURIComponent to handle special characters in the address
  const mapQuery = displaySettings.address ? encodeURIComponent(displaySettings.address) : "";
  // Basic Google Maps embed URL using the address query 'q'. Add API key if needed.
  // Example WITH API Key (replace YOUR_API_KEY):
  // const mapSrc = mapQuery ? `https://www.google.com/maps/embed/v1/place?key=YOUR_API_KEY&q=${mapQuery}` : "";
  // Example WITHOUT specific API key (relies on general Maps functionality):
  const mapSrc = mapQuery ? `https://maps.google.com/maps?q=${mapQuery}&t=&z=15&ie=UTF8&iwloc=&output=embed` : "";
  // --- End Map URL Construction ---


  return (
    <main className="py-16 wood-texture-bg">
      <div className="container mx-auto px-4">
        <h1 className="font-trajan text-3xl md:text-4xl text-parchment text-center mb-12">
            {displaySettings.pageHeading || "Contact Us"}
        </h1>

        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {/* Contact Form Section */}
          <div className="bg-parchment/90 p-6 md:p-8 border border-faded-gold rounded shadow-md">
            <h2 className="font-trajan text-2xl text-monastic-red mb-6 text-center md:text-left">Send Us a Message</h2>
            <ContactForm />
          </div>

          {/* Location & Info Section */}
          <div className="bg-parchment/90 p-6 md:p-8 border border-faded-gold rounded shadow-md flex flex-col justify-between">
            <div>
              <h2 className="font-trajan text-2xl text-monastic-red mb-6 text-center md:text-left">
                  {displaySettings.locationHeading || "Our Information"}
              </h2>

              {/* --- UPDATED Map Section --- */}
              <div className="mb-6">
                {/* Container maintains aspect ratio and visual styling */}
                <div className="mb-2 border border-faded-gold/50 rounded overflow-hidden shadow-sm aspect-[4/3] bg-gray-300"> {/* Background color for loading state */}
                  {mapSrc ? (
                      <iframe
                        src={mapSrc}
                        width="100%"
                        height="100%" // Fill the container
                        style={{ border: 0 }} // Remove default iframe border
                        allowFullScreen={false} // Typically false for embeds
                        loading="lazy" // Defer loading until needed
                        referrerPolicy="no-referrer-when-downgrade" // Standard policy
                        title={`Map showing location for ${displaySettings.locationHeading || 'Contact Location'}`} // Accessibility title
                      ></iframe>
                   ) : (
                       // Show if no address is provided in settings
                       <div className="w-full h-full flex items-center justify-center text-charcoal/60 italic p-4 text-center">
                         Map location requires an address in the settings.
                       </div>
                   )}
                </div>
              </div>
              {/* --- End Map Section --- */}


               {/* Dynamic Contact Details */}
              <div className="space-y-3 font-garamond text-base md:text-lg">
                {displaySettings.address && <p><strong>Address:</strong> {displaySettings.address}</p>}
                {displaySettings.email && <p><strong>Email:</strong> <a href={`mailto:${displaySettings.email}`} className="text-monastic-red hover:underline hover:text-terracotta">{displaySettings.email}</a></p>}
                {displaySettings.phone && <p><strong>Phone:</strong> <a href={`tel:${displaySettings.phone.replace(/\s+/g, '')}`} className="text-monastic-red hover:underline hover:text-terracotta">{displaySettings.phone}</a></p>}
              </div>
            </div>

            {/* Dynamic Office Hours */}
            <div className="mt-6 pt-6 border-t border-faded-gold">
              <h3 className="font-trajan text-lg text-monastic-red mb-2">{displaySettings.officeHoursHeading || "Office Hours"}</h3>
              <p className="font-garamond text-base md:text-lg">{displaySettings.officeHoursText || "Please contact us via email for inquiries."}</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}