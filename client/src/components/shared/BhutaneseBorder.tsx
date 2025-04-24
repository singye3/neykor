import { cn } from "@/lib/utils";
import { bhutaneseSymbols } from "@/lib/utils";

interface BhutaneseBorderProps {
  className?: string;
  children: React.ReactNode;
}

export default function BhutaneseBorder({ className, children }: BhutaneseBorderProps) {
  return (
    <div className={cn("bhutanese-border relative border border-faded-gold", className)}>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-parchment px-2">
        <span className="text-faded-gold text-2xl">{bhutaneseSymbols.dharmaWheel}</span>
      </div>
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 bg-parchment px-2">
        <span className="text-faded-gold text-2xl">{bhutaneseSymbols.dharmaWheel}</span>
      </div>
      {children}
    </div>
  );
}
