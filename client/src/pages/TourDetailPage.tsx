// client/src/pages/TourDetailPage.tsx
import { useParams } from "wouter";
import TourDetail from "@/components/tours/TourDetail";

export default function TourDetailPage() {
  const { id } = useParams();
  
  return (
    <main>
      <TourDetail tourId={id || ""} />
    </main>
  );
}