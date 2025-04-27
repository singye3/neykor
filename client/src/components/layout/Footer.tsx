// client/src/components/layout/Footer.tsx
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { Tour, ContactPageSettings } from "@shared/schema"; // Import ContactPageSettings type
import { Mail, MapPin, Phone } from "lucide-react"; // Icons for contact info
// Removed unused imports like useState, useToast, Input, Button, Loader2

export default function Footer() {

  // --- Fetch Featured Tours ---
  const { data: featuredTours, isLoading: isLoadingTours } = useQuery<Tour[], Error>({
    queryKey: ['featuredTours'],
    queryFn: () => apiRequest<Tour[]>("GET", "/api/tours/featured"),
    staleTime: 1000 * 60 * 15, // 15 minutes
    refetchOnWindowFocus: false,
  });

  // --- Fetch Contact Page Settings ---
  const { data: contactSettings, isLoading: isLoadingSettings } = useQuery<ContactPageSettings, Error>({
      // Use a query key consistent with where this data might be used elsewhere
      queryKey: ['contactPageSettings'],
      queryFn: () => apiRequest<ContactPageSettings>("GET", "/api/content/contact"),
      staleTime: 1000 * 60 * 60, // Cache contact settings longer (e.g., 1 hour)
      refetchOnWindowFocus: false,
  });
  // --- End Fetches ---

  return (
    <footer className="py-10 bg-charcoal text-parchment border-t-2 border-faded-gold">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">

          {/* Column 1: About Section */}
          <div>
            <h4 className="font-trajan text-lg mb-4 text-faded-gold">Sacred Bhutan Travels</h4>
            <p className="font-garamond text-sm leading-relaxed">
              Guardians of ancient pilgrimage traditions, guiding seekers through the sacred landscape of Bhutan since time immemorial.
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4 className="font-trajan text-lg mb-4 text-faded-gold">Navigate</h4>
            <ul className="font-garamond space-y-2 text-sm">
              <li><Link href="/" className="hover:text-faded-gold transition-colors">Home</Link></li>
              <li><Link href="/pilgrimages" className="hover:text-faded-gold transition-colors">Pilgrimages</Link></li>
              <li><Link href="/about" className="hover:text-faded-gold transition-colors">About Us</Link></li>
              <li><Link href="/gallery" className="hover:text-faded-gold transition-colors">Gallery</Link></li>
              <li><Link href="/contact" className="hover:text-faded-gold transition-colors">Contact</Link></li>
            </ul>
          </div>

          {/* Column 3: Featured Journeys (Dynamic) */}
          <div>
            <h4 className="font-trajan text-lg mb-4 text-faded-gold">Featured Journeys</h4>
            <ul className="font-garamond space-y-2 text-sm">
              {isLoadingTours ? (
                <> {/* Simple loading placeholders */}
                    <li className="h-4 bg-gray-600/30 rounded w-3/4 animate-pulse"></li>
                    <li className="h-4 bg-gray-600/30 rounded w-1/2 animate-pulse"></li>
                    <li className="h-4 bg-gray-600/30 rounded w-2/3 animate-pulse"></li>
                </>
              ) : featuredTours && featuredTours.length > 0 ? (
                    featuredTours.slice(0, 4).map(tour => (
                        <li key={tour.id}>
                            <Link href={`/pilgrimages/${tour.id}`} className="hover:text-faded-gold transition-colors">
                                {tour.title}
                            </Link>
                        </li>
                    ))
              ) : (
                    <li><span className="opacity-70">No featured journeys currently.</span></li>
              )}
            </ul>
          </div>

          {/* Column 4: Contact Info (Dynamic) */}
          <div>
             <h4 className="font-trajan text-lg mb-4 text-faded-gold">Contact Us</h4>
             <ul className="font-garamond space-y-3 text-sm">
                {/* Show placeholders while settings load */}
                {isLoadingSettings ? (
                    <>
                        <li className="h-4 bg-gray-600/30 rounded w-full animate-pulse"></li>
                        <li className="h-4 bg-gray-600/30 rounded w-2/3 animate-pulse"></li>
                        <li className="h-4 bg-gray-600/30 rounded w-3/4 animate-pulse"></li>
                    </>
                ) : contactSettings ? (
                    <>
                        {/* Address */}
                        {contactSettings.address && (
                            <li className="flex items-start gap-2">
                                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-faded-gold/80"/>
                                <span>{contactSettings.address}</span>
                            </li>
                        )}
                        {/* Phone */}
                        {contactSettings.phone && (
                            <li className="flex items-start gap-2">
                                <Phone className="w-4 h-4 mt-0.5 flex-shrink-0 text-faded-gold/80"/>
                                {/* Use tel: link */}
                                <a href={`tel:${contactSettings.phone.replace(/\s+/g, '')}`} className="hover:text-faded-gold transition-colors">{contactSettings.phone}</a>
                            </li>
                        )}
                        {/* Email */}
                        {contactSettings.email && (
                            <li className="flex items-start gap-2">
                                <Mail className="w-4 h-4 mt-0.5 flex-shrink-0 text-faded-gold/80"/>
                                {/* Use mailto: link */}
                                <a href={`mailto:${contactSettings.email}`} className="hover:text-faded-gold transition-colors">{contactSettings.email}</a>
                            </li>
                        )}
                        {/* Add fallback if specific fields are missing */}
                        {!contactSettings.address && !contactSettings.phone && !contactSettings.email && (
                             <li><span className="opacity-70">Contact details unavailable.</span></li>
                        )}
                    </>
                ) : (
                    // Handle case where loading is finished but data is null/error
                    <li><span className="opacity-70">Contact details unavailable.</span></li>
                )}
             </ul>
          </div>

        </div>

        {/* Copyright */}
        <div className="mt-10 pt-6 border-t border-faded-gold/30 text-center font-garamond text-xs text-parchment/70">
          <p>© {new Date().getFullYear()} Sacred Bhutan Travels. All rights reserved. Walking the Ancient Paths.</p>
        </div>
      </div>
    </footer>
  );
}