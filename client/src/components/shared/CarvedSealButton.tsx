// client/src/components/shared/CarvedSealButton.tsx
import { Button, ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function CarvedSealButton({ className, children, ...props }: ButtonProps) {
  return (
    <Button 
      variant="carved" 
      className={cn(
        "transition-all bg-monastic-red border border-faded-gold text-parchment uppercase tracking-wider font-garamond",
        className
      )} 
      {...props}
    >
      {children}
    </Button>
  );
}
