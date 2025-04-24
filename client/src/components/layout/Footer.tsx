// client/src/components/layout/Footer.tsx
import { Link } from "wouter"; // Use wouter
import { useState } from "react";
// Make sure these imports point to the correct locations
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
// import { bhutaneseSymbols } from "@/lib/utils"; // Not used here, can be removed

export default function Footer() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);
    try {
      // Ensure this API route exists and is handled correctly
      await apiRequest('POST', '/api/newsletter', { email });
      toast({
        title: "Subscription Successful",
        description: "Thank you for joining our ancient correspondence.",
      });
      setEmail("");
    } catch (error) {
       console.error("Newsletter subscription error:", error); // Log the actual error
       toast({
        title: "Subscription Failed",
        description: "An error occurred. Please try again later.", // More generic error
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <footer className="py-8 bg-charcoal text-parchment border-t border-faded-gold">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h4 className="font-trajan text-lg mb-4 text-faded-gold">Sacred Bhutan Travels</h4>
            <p className="font-garamond">
              Guardians of ancient pilgrimage traditions, guiding seekers through the sacred landscape of Bhutan.
            </p>
          </div>

          <div>
            <h4 className="font-trajan text-lg mb-4 text-faded-gold">Quick Links</h4>
            <ul className="font-garamond space-y-2">
              {/* Apply className directly to Link */}
              <li><Link href="/" className="hover:text-faded-gold transition-colors">Home</Link></li>
              <li><Link href="/pilgrimages" className="hover:text-faded-gold transition-colors">Pilgrimages</Link></li>
              <li><Link href="/about" className="hover:text-faded-gold transition-colors">About Us</Link></li>
              <li><Link href="/gallery" className="hover:text-faded-gold transition-colors">Gallery</Link></li>
              <li><Link href="/contact" className="hover:text-faded-gold transition-colors">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-trajan text-lg mb-4 text-faded-gold">Popular Pilgrimages</h4>
            <ul className="font-garamond space-y-2">
              {/* Apply className directly to Link */}
              <li><Link href="/pilgrimages/1" className="hover:text-faded-gold transition-colors">Tiger's Nest Pilgrimage</Link></li>
              <li><Link href="/pilgrimages/2" className="hover:text-faded-gold transition-colors">Bumthang Sacred Circuit</Link></li>
              <li><Link href="/pilgrimages/3" className="hover:text-faded-gold transition-colors">Druk Path Trek</Link></li>
              <li><Link href="/pilgrimages/4" className="hover:text-faded-gold transition-colors">Haa Valley Heritage</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-trajan text-lg mb-4 text-faded-gold">Newsletter</h4>
            <p className="font-garamond mb-4">
              Receive ancient wisdom and pilgrimage updates in your correspondence box.
            </p>
            <form className="flex" onSubmit={handleNewsletterSubmit}>
              <Input
                type="email"
                placeholder="Your email address"
                className="rounded-none bg-charcoal/50 border border-faded-gold text-parchment focus:border-monastic-red focus:bg-charcoal/70" // Added focus styles example
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                aria-label="Newsletter email input" // Added aria-label for accessibility
              />
              <Button
                type="submit"
                className="bg-faded-gold hover:bg-ochre text-charcoal rounded-none disabled:opacity-50" // Added disabled style
                disabled={isSubmitting}
              >
                {isSubmitting ? "Joining..." : "Join"}
              </Button>
            </form>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-faded-gold/30 text-center font-garamond text-parchment/70">
          <p>© {new Date().getFullYear()} Sacred Bhutan Travels. All rights reserved. Guardians of the Ancient Paths.</p>
        </div>
      </div>
    </footer>
  );
}