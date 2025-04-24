import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { bhutaneseSymbols } from "@/lib/utils"; // Assuming bhutaneseSymbols is defined correctly

export default function Header() {
  const [location] = useLocation();

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Pilgrimages", path: "/pilgrimages" },
    { name: "About Us", path: "/about" },
    { name: "Gallery", path: "/gallery" },
    { name: "Contact", path: "/contact" },
  ];

  return (
    <header className="lokta-paper-bg border-b border-faded-gold">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center">
            <div className="text-monastic-red">
              {/* Ensure bhutaneseSymbols.dharmaWheel provides valid content */}
              <span className="text-4xl">{bhutaneseSymbols.dharmaWheel}</span>
            </div>
            {/* Apply className directly to Link */}
            <Link
              href="/"
              className="font-trajan text-2xl md:text-3xl ml-3 text-monastic-red hover:text-terracotta transition-colors"
            >
              Sacred Bhutan Travels
            </Link>
          </div>
          <nav className="mt-4 md:mt-0">
            <ul className="flex space-x-6 md:space-x-8 font-garamond text-lg">
              {navLinks.map((link) => (
                <li key={link.path}>
                  {/* Apply className directly to Link */}
                  <Link
                    href={link.path}
                    className={cn(
                      "nav-link text-charcoal hover:text-monastic-red",
                      location === link.path && "text-monastic-red font-semibold" // Added font-semibold for active link example
                    )}
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
}