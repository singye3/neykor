import BhutaneseBorder from "@/components/shared/BhutaneseBorder";

// Define props interface
interface IntroductionProps {
    heading?: string;
    paragraph1?: string;
    paragraph2?: string;
}

export default function Introduction({
    heading = "Ancient Tradition, Timeless Journey",
    paragraph1 = "Default introduction paragraph 1...",
    paragraph2 = "Default introduction paragraph 2...",
}: IntroductionProps) { // Destructure props
  return (
    <section className="py-16 lokta-paper-bg">
      <div className="container mx-auto px-4">
        <BhutaneseBorder className="max-w-4xl mx-auto p-8 bg-parchment/80">
          {/* Use props */}
          <h2 className="font-trajan text-3xl text-monastic-red text-center mb-6">
            {heading}
          </h2>
          <p className="font-garamond text-xl leading-relaxed mb-4 whitespace-pre-line">
            {paragraph1}
          </p>
          <p className="font-garamond text-xl leading-relaxed whitespace-pre-line">
            {paragraph2}
          </p>

          <div className="flex justify-center mt-8">
            <div className="h-px w-32 bg-faded-gold"></div>
          </div>
        </BhutaneseBorder>
      </div>
    </section>
  );
}