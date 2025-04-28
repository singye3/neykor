// client/src/components/home/Testimonials.tsx
import { useQuery } from "@tanstack/react-query";
import type { Testimonial } from "@shared/schema"; // Ensure type import
import Loader from "@/components/shared/Loader";
import { apiRequest } from "@/lib/queryClient"; // Use corrected apiRequest

// Define props interface
interface TestimonialsProps {
    heading?: string;
}

export default function Testimonials({
    heading = "Pilgrim Chronicles" // Default heading
}: TestimonialsProps) {

  // Fetch testimonials using useQuery and apiRequest directly
  const { data: testimonials, isLoading, isError, error } = useQuery<Testimonial[], Error>({
    queryKey: ['testimonials'], // Public query key
    // --- UPDATED queryFn ---
    // Directly use apiRequest, specifying the expected return type array.
    queryFn: () => apiRequest<Testimonial[]>("GET", "/api/testimonials"),
    // --- End Update ---
    staleTime: 1000 * 60 * 15, // Cache testimonials for 15 mins
    refetchOnWindowFocus: false, // Less aggressive refetching
  });

  return (
    <section className="py-16 textile-texture-bg">
      <div className="container mx-auto px-4">
        {/* Section Heading */}
        <h2 className="font-trajan text-3xl text-monastic-red text-center mb-12">
            {heading}
        </h2>

        {/* Display Testimonials or Loading/Error/Empty State */}
        <div className="max-w-4xl mx-auto">
            {isLoading ? (
            // Loading State
            <div className="flex justify-center py-8">
                <Loader />
            </div>
            ) : isError ? (
            // Error State
            <div className="text-center text-destructive bg-red-100 border border-destructive p-4 rounded">
                Error loading testimonials: {error?.message || "Could not fetch testimonials."}
            </div>
            ) : testimonials && testimonials.length > 0 ? (
            // Success State - Testimonials Found
            // Limit testimonials shown on homepage? e.g., .slice(0, 2)
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {testimonials.slice(0, 2).map((testimonial) => ( // Example: Show only first 2
                <div key={testimonial.id} className="bg-parchment/70 p-6 border border-faded-gold relative rounded shadow-sm">
                    {/* Decorative Quote Symbol */}
                    <span className="absolute top-2 left-3 text-6xl text-faded-gold/30 font-serif opacity-60 -z-0 select-none" aria-hidden="true">“</span>
                    {/* Testimonial Content */}
                    <blockquote className="relative z-10"> {/* Use blockquote for semantics */}
                        <p className="font-lora italic text-lg mb-4 leading-relaxed">
                            {testimonial.content}
                        </p>
                    </blockquote>
                    {/* Author Information */}
                    <div className="flex items-center mt-4 pt-4 border-t border-faded-gold/50">
                    {/* Simple initial circle as placeholder */}
                    <div className="w-10 h-10 rounded-full bg-monastic-red/10 flex items-center justify-center border border-monastic-red/30 mr-3 flex-shrink-0">
                        <span className="text-monastic-red text-xl font-semibold select-none">
                        {testimonial.name.charAt(0).toUpperCase()}
                        </span>
                    </div>
                    {/* Name and Location */}
                    <div>
                        <cite className="font-garamond font-semibold text-monastic-red not-italic">{testimonial.name}</cite> {/* Use cite for attribution */}
                        {testimonial.location && ( // Conditionally display location
                            <p className="font-garamond text-sm text-charcoal/80">{testimonial.location}</p>
                        )}
                    </div>
                    </div>
                </div>
                ))}
            </div>
            ) : (
            // Success State - No Testimonials Found
            <p className="text-center font-garamond text-charcoal/80 py-8">
                No testimonials available yet. Be the first to share your experience!
            </p>
            )}
        </div>
      </div>
    </section>
  );
}