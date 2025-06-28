import { BookingProvider } from "@/context/BookingContext";
import { Suspense } from "react";
import SearchResultsClient from "./SearchResultsClient";
import Loader from "@/components/Loader";
// 👇 This is the actual default export wrapped in context
export default function SearchResultsPage() {
  return (
    <BookingProvider>
      <Suspense fallback={<Loader />}>
        <SearchResultsClient />
      </Suspense>
    </BookingProvider>
  );
}
