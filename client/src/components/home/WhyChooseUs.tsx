interface WhyPoint {
  icon?: string;
  title?: string;
  text?: string;
}

// Define props interface
interface WhyChooseUsProps {
  heading?: string;
  why1?: WhyPoint;
  why2?: WhyPoint;
  why3?: WhyPoint;
}

export default function WhyChooseUs({
  heading = "Why Journey With Us",
  // Provide default objects for each point
  why1 = { icon: "☸", title: "Guardians of Tradition", text: "Default text 1..." },
  why2 = { icon: "📜", title: "Deep Historical Knowledge", text: "Default text 2..." },
  why3 = { icon: "🤝", title: "Authentic Encounters", text: "Default text 3..." },
}: WhyChooseUsProps) { // Destructure props
return (
  <section className="py-16 bg-parchment-dark textile-texture-bg">
    <div className="container mx-auto px-4">
      {/* Use heading prop */}
      <h2 className="font-trajan text-3xl text-monastic-red text-center mb-12">
          {heading}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        {/* Point 1 - Use props from why1 object */}
        <div className="bg-parchment/90 p-6 border border-faded-gold text-center">
          <div className="mb-4">
            <span className="text-5xl text-monastic-red">{why1.icon}</span>
          </div>
          <h3 className="font-trajan text-xl text-monastic-red mb-3">{why1.title}</h3>
          <p className="font-garamond whitespace-pre-line">{why1.text}</p>
        </div>

        {/* Point 2 - Use props from why2 object */}
        <div className="bg-parchment/90 p-6 border border-faded-gold text-center">
          <div className="mb-4">
            <span className="text-5xl text-monastic-red">{why2.icon}</span>
          </div>
          <h3 className="font-trajan text-xl text-monastic-red mb-3">{why2.title}</h3>
          <p className="font-garamond whitespace-pre-line">{why2.text}</p>
        </div>

        {/* Point 3 - Use props from why3 object */}
        <div className="bg-parchment/90 p-6 border border-faded-gold text-center">
          <div className="mb-4">
            <span className="text-5xl text-monastic-red">{why3.icon}</span>
          </div>
          <h3 className="font-trajan text-xl text-monastic-red mb-3">{why3.title}</h3>
          <p className="font-garamond whitespace-pre-line">{why3.text}</p>
        </div>
      </div>
    </div>
  </section>
);
}