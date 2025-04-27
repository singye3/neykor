// client/src/components/layout/Header.tsx
import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { bhutaneseSymbols } from "@/lib/utils";
import { Menu, X } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile"; // Ensure this hook works correctly

// Define props including the optional siteName
interface HeaderProps {
    siteName?: string;
}

export default function Header({ siteName = "Sacred Bhutan Travels" }: HeaderProps) {
  const [currentLocation] = useLocation(); // Only need location value here
  const isMobile = useIsMobile();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // --- Effects ---
  // Close the mobile menu when the location changes
  useEffect(() => {
    // Only trigger if the menu is actually open on mobile
    if (isMobile && isMenuOpen) {
      setIsMenuOpen(false);
    }
    // Intentionally excluding isMobile and isMenuOpen from deps
    // to only trigger on *location* change while menu is open.
  }, [currentLocation]);

  // Close mobile menu if window resizes to desktop width
  useEffect(() => {
    if (!isMobile && isMenuOpen) {
        setIsMenuOpen(false);
    }
  }, [isMobile, isMenuOpen]);

  // --- Event Handlers ---
  const toggleMenu = () => {
    setIsMenuOpen(prev => !prev); // Use functional update for reliability
  };

  // Closes menu (used by links)
  const closeMenu = () => {
      // Only close if it's currently open (avoids unnecessary state updates)
      if (isMenuOpen) {
         setIsMenuOpen(false);
      }
  };

  // --- Navigation Links ---
  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Pilgrimages", path: "/pilgrimages" },
    { name: "About Us", path: "/about" },
    { name: "Gallery", path: "/gallery" },
    { name: "Contact", path: "/contact" },
  ];

  return (
    // Sticky header with background and blur effect
    <header className="lokta-paper-bg border-b border-faded-gold sticky top-0 z-50 bg-parchment/80 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center h-12 md:h-16"> {/* Ensure consistent height */}

          {/* Logo and Site Name Section */}
          <Link href="/" className="flex items-center group shrink-0" onClick={closeMenu}> {/* Close menu if logo clicked on mobile */}
            <div className="text-monastic-red transition-transform group-hover:rotate-[30deg]">
              <span className="text-3xl md:text-4xl">{bhutaneseSymbols.dharmaWheel}</span>
            </div>
            <span className="font-trajan text-xl sm:text-2xl md:text-3xl ml-2 md:ml-3 text-monastic-red group-hover:text-terracotta transition-colors whitespace-nowrap">
              {siteName}
            </span>
          </Link>

          {/* Hamburger/Close Button (Visible only on smaller screens) */}
          <div className="md:hidden"> {/* Use md:hidden to hide on medium screens and up */}
            <button
              type="button"
              onClick={toggleMenu}
              className="p-2 text-monastic-red hover:text-monastic-red/80 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-monastic-red" // Added focus styles
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={isMenuOpen} // Indicate expanded state for accessibility
              aria-controls="mobile-menu" // Link button to the menu it controls
            >
              {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>

          {/* Desktop Navigation (Visible on medium screens and up) */}
          <nav className="hidden md:flex md:items-center"> {/* Use hidden and md:flex */}
            <ul className="flex flex-row space-x-4 md:space-x-6 font-garamond text-lg">
              {navLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    href={link.path}
                    className={cn(
                      "nav-link text-charcoal hover:text-monastic-red pb-1 transition-colors duration-200",
                      currentLocation === link.path && "text-monastic-red font-semibold border-b-2 border-monastic-red" // Active style
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

      {/* Mobile Navigation Menu (Conditionally rendered based on isMenuOpen and isMobile) */}
      {/* Using conditional rendering often simpler than complex cn() for show/hide */}
      {isMobile && isMenuOpen && (
        <nav
            id="mobile-menu"
            className="md:hidden absolute top-full left-0 w-full bg-parchment/95 backdrop-blur-md shadow-lg border-t border-faded-gold" // Position below header
        >
          <ul className="flex flex-col items-center space-y-4 p-5"> {/* Add padding */}
            {navLinks.map((link) => (
              <li key={`${link.path}-mobile`}>
                <Link
                  href={link.path}
                  className={cn(
                    "block w-full text-center font-garamond text-xl text-charcoal hover:text-monastic-red py-2", // Mobile link styles
                    currentLocation === link.path && "text-monastic-red font-semibold" // Mobile active style
                  )}
                  onClick={closeMenu} // Ensure menu closes on link click
                >
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}