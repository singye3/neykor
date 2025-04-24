// client/src/components/shared/Loader.tsx
import { bhutaneseSymbols } from "@/lib/utils";

export default function Loader() {
  return (
    <div className="flex flex-col items-center justify-center py-4">
      <div className="animate-spin text-monastic-red text-4xl mb-2">
        {bhutaneseSymbols.dharmaWheel}
      </div>
      <p className="font-garamond text-charcoal text-sm">Loading...</p>
    </div>
  );
}
