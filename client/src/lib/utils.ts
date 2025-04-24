import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatDate = (date: Date): string => {
  const options: Intl.DateTimeFormatOptions = { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  };
  return new Date(date).toLocaleDateString('en-US', options);
};

// Bhutanese patterns and symbols for use in components
export const bhutaneseSymbols = {
  dharmaWheel: "☸",
  endlessKnot: "&#10169;",
  lotus: "✿",
  conchShell: "🐚",
  diamondBullet: "◆",
  cloudPattern: "☁",
};

// Mock image URLs that represent high-quality Bhutanese imagery
export const getImageUrl = (id: number | string, type: string): string => {

  const images = {
    hero: "https://ik.imagekit.io/neykor/Tiger%20Nest/tiger_nest.jpeg?updatedAt=1745393528209",
    tigerNest: "https://ik.imagekit.io/neykor/Tiger%20Nest/tiger_nest.jpeg?updatedAt=1745393528209", // Replaced
    bumthang: "https://ik.imagekit.io/neykor/Tiger%20Nest/tiger_nest.jpeg?updatedAt=1745393528209", // Replaced
    drukPath: "https://ik.imagekit.io/neykor/Tiger%20Nest/tiger_nest.jpeg?updatedAt=1745393528209", // Replaced
    map: "https://ik.imagekit.io/neykor/Tiger%20Nest/tiger_nest.jpeg?updatedAt=1745393528209",      // Replaced
    guide: "https://ik.imagekit.io/neykor/Tiger%20Nest/tiger_nest.jpeg?updatedAt=1745393528209",    // Replaced
    dzong: "https://ik.imagekit.io/neykor/Tiger%20Nest/tiger_nest.jpeg?updatedAt=1745393528209",    // Replaced
    prayerFlags: "https://ik.imagekit.io/neykor/Tiger%20Nest/tiger_nest.jpeg?updatedAt=1745393528209", // Replaced
    monks: "https://ik.imagekit.io/neykor/Tiger%20Nest/tiger_nest.jpeg?updatedAt=1745393528209",     // Replaced
    temple: "https://ik.imagekit.io/neykor/Tiger%20Nest/tiger_nest.jpeg?updatedAt=1745393528209",    // Replaced
    mountains: "https://ik.imagekit.io/neykor/Tiger%20Nest/tiger_nest.jpeg?updatedAt=1745393528209", // Replaced
    mask: "https://ik.imagekit.io/neykor/Tiger%20Nest/tiger_nest.jpeg?updatedAt=1745393528209",      // Replaced
    taktsang: "https://ik.imagekit.io/neykor/Tiger%20Nest/tiger_nest.jpeg?updatedAt=1745393528209"   // Replaced
};
  
  return images[type as keyof typeof images] || images.hero;
};

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}
