// client/src/components/layout/Header.tsx
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { bhutaneseSymbols } from "@/lib/utils";

// Define props including the optional siteName
interface HeaderProps {
    siteName?: string;
}

export default function Header({ siteName = "Sacred Bhutan Travels" }: HeaderProps) { // Default value
  const [location] = useLocation();

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Pilgrimages", path: "/pilgrimages" },
    { name: "About Us", path: "/about" },
    { name: "Gallery", path: "/gallery" },
    { name: "Contact", path: "/contact" },
  ];

  return (
    <header className="lokta-paper-bg border-b border-faded-gold sticky top-0 z-50 bg-parchment/80 backdrop-blur-sm"> {/* Added sticky header styles */}
      <div className="container mx-auto px-4 py-3"> {/* Adjusted padding */}
        <div className="flex flex-col md:flex-row justify-between items-center">
          {/* Logo and Site Name */}
          <Link href="/" className="flex items-center group mb-2 md:mb-0"> {/* Link wraps both */}
            <div className="text-monastic-red transition-transform group-hover:rotate-[30deg]">
              <span className="text-4xl">{bhutaneseSymbols.dharmaWheel}</span>
            </div>
            {/* Use the siteName prop */}
            <span className="font-trajan text-2xl md:text-3xl ml-3 text-monastic-red group-hover:text-terracotta transition-colors">
              {siteName}
            </span>
          </Link>
           {/* Navigation */}
          <nav className="mt-2 md:mt-0">
            <ul className="flex space-x-4 md:space-x-6 font-garamond text-lg">
              {navLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    href={link.path}
                    className={cn(
                      "nav-link text-charcoal hover:text-monastic-red pb-1", // Adjusted pb-1 for underline
                      location === link.path && "text-monastic-red font-semibold border-b-2 border-monastic-red" // Active style
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