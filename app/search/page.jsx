import { BookingProvider } from "@/context/BookingContext";
import { Suspense } from "react";
import SearchResultsClient from "./SearchResultsClient";
// 👇 This is the actual default export wrapped in context
export default function SearchResultsPage() {
  return (
    <BookingProvider>
      <Suspense
        fallback={
          <div className="p-6 text-center">Loading search results...</div>
        }
      >
        <SearchResultsClient />
      </Suspense>
    </BookingProvider>
  );
}
