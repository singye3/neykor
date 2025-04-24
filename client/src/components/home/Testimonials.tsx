import { useQuery } from "@tanstack/react-query";
import { Testimonial } from "@shared/schema";
import Loader from "@/components/shared/Loader";

export default function Testimonials() {
  const { data: testimonials, isLoading } = useQuery<Testimonial[]>({
    queryKey: ['/api/testimonials'],
  });

  return (
    <section className="py-16 lokta-paper-bg">
      <div className="container mx-auto px-4">
        <h2 className="font-trajan text-3xl text-monastic-red text-center mb-12">Pilgrim Chronicles</h2>
        
        {isLoading ? (
          <div className="flex justify-center">
            <Loader />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {testimonials?.map((testimonial) => (
              <div key={testimonial.id} className="bg-parchment/70 p-6 border border-faded-gold relative">
                <p className="font-lora italic text-lg mb-4">
                  "{testimonial.content}"
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full bg-parchment-dark flex items-center justify-center">
                    <span className="text-monastic-red text-xl">
                      {testimonial.name.charAt(0)}
                    </span>
                  </div>
                  <div className="ml-4">
                    <p className="font-garamond font-semibold">{testimonial.name}</p>
                    <p className="font-garamond text-sm text-charcoal/80">{testimonial.location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
