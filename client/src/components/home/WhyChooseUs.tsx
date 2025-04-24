// client/src/components/home/WhyChooseUs.tsx
import { bhutaneseSymbols } from "@/lib/utils";

export default function WhyChooseUs() {
  return (
    <section className="py-16 wood-texture-bg">
      <div className="container mx-auto px-4">
        <h2 className="font-trajan text-3xl text-parchment text-center mb-12">Why Journey With Us</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="bg-parchment/90 p-6 border border-faded-gold">
            <div className="text-center mb-4">
              <span className="text-5xl text-monastic-red">{bhutaneseSymbols.dharmaWheel}</span>
            </div>
            <h3 className="font-trajan text-xl text-monastic-red text-center mb-3">Guardians of Tradition</h3>
            <p className="font-garamond text-center">
              Our guides are descendants of pilgrim families, carrying centuries of oral history and sacred knowledge passed through generations.
            </p>
          </div>
          
          <div className="bg-parchment/90 p-6 border border-faded-gold">
            <div className="text-center mb-4">
              <span className="text-5xl text-monastic-red">&#10169;</span>
            </div>
            <h3 className="font-trajan text-xl text-monastic-red text-center mb-3">Deep Historical Knowledge</h3>
            <p className="font-garamond text-center">
              Each journey is enriched by scholarly insights into the religious and cultural significance of every site we visit.
            </p>
          </div>
          
          <div className="bg-parchment/90 p-6 border border-faded-gold">
            <div className="text-center mb-4">
              <span className="text-5xl text-monastic-red">✿</span>
            </div>
            <h3 className="font-trajan text-xl text-monastic-red text-center mb-3">Authentic Encounters</h3>
            <p className="font-garamond text-center">
              We create meaningful connections with monastics, artisans, and villagers who maintain Bhutan's living heritage.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
