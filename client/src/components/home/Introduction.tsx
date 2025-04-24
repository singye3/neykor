// client/src/components/home/Introduction.tsx
import BhutaneseBorder from "@/components/shared/BhutaneseBorder";

export default function Introduction() {
  return (
    <section className="py-16 lokta-paper-bg">
      <div className="container mx-auto px-4">
        <BhutaneseBorder className="max-w-4xl mx-auto p-8 bg-parchment/80">
          <h2 className="font-trajan text-3xl text-monastic-red text-center mb-6">Ancient Tradition, Timeless Journey</h2>
          <p className="font-garamond text-xl leading-relaxed mb-4">
            Sacred Bhutan Travels invites you to walk paths worn smooth by centuries of pilgrims. Our journeys are not mere tours, but profound experiences that connect you with Bhutan's living spiritual heritage.
          </p>
          <p className="font-garamond text-xl leading-relaxed">
            Each pilgrimage follows routes established by revered masters and saints, revealing monasteries tucked into mist-shrouded mountains, sacred lakes that mirror the heavens, and temples that have witnessed the unfolding of Bhutanese spirituality. Here, time slows and the boundary between past and present dissolves.
          </p>
          
          <div className="flex justify-center mt-8">
            <div className="h-px w-32 bg-faded-gold"></div>
          </div>
        </BhutaneseBorder>
      </div>
    </section>
  );
}
