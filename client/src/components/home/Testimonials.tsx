import { useQuery } from "@tanstack/react-query";
import type { Testimonial } from "@shared/schema"; // Ensure type import
import Loader from "@/components/shared/Loader";
import { apiRequest } from "@/lib/queryClient"; // Use apiRequest

// Define props interface
interface TestimonialsProps {
    heading?: string;
}

// Fetch function for testimonials (public endpoint)
async function fetchTestimonials(): Promise<Testimonial[]> {
    const res = await apiRequest("GET", "/api/testimonials"); // Use public endpoint
    if (!res.ok) throw new Error("Failed to fetch testimonials");
    return res.json();
}

export default function Testimonials({
    heading = "Pilgrim Chronicles" // Default heading
}: TestimonialsProps) { // Destructure props

  // Internal fetch for testimonials list remains
  const { data: testimonials, isLoading, isError, error } = useQuery<Testimonial[], Error>({
    queryKey: ['testimonials'], // Public query key
    queryFn: fetchTestimonials,
    staleTime: 1000 * 60 * 15, // Cache testimonials for 15 mins
  });

  return (
    <section className="py-16 lokta-paper-bg">
      <div className="container mx-auto px-4">
        {/* Use heading prop */}
        <h2 className="font-trajan text-3xl text-monastic-red text-center mb-12">
            {heading}
        </h2>

        {/* Display testimonials - fetch logic is internal */}
        {isLoading ? (
          <div className="flex justify-center"> <Loader /> </div>
        ) : isError ? (
           <div className="text-center text-destructive">Error loading testimonials: {error?.message}</div>
        ) : testimonials && testimonials.length > 0 ? (
            // Limit testimonials shown on homepage? e.g., .slice(0, 2)
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {testimonials.slice(0, 2).map((testimonial) => ( // Example: Show only first 2
              <div key={testimonial.id} className="bg-parchment/70 p-6 border border-faded-gold relative">
                {/* Quote Symbol */}
                 <span className="absolute top-2 left-3 text-5xl text-faded-gold/30 font-serif opacity-80 -z-0">“</span>
                <p className="font-lora italic text-lg mb-4 relative z-10">
                  {testimonial.content}
                </p>
                <div className="flex items-center pt-4 border-t border-faded-gold/30">
                  {/* Simple initial circle */}
                  <div className="w-10 h-10 rounded-full bg-monastic-red/10 flex items-center justify-center border border-monastic-red/30 mr-3">
                    <span className="text-monastic-red text-xl font-semibold">
                      {testimonial.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-garamond font-semibold text-monastic-red">{testimonial.name}</p>
                    <p className="font-garamond text-sm text-charcoal/80">{testimonial.location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
             <p className="text-center font-garamond text-charcoal">No testimonials available yet.</p>
        )}
      </div>
    </section>
  );
}