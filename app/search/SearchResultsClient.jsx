"use client";

import RoomCardSkeleton from "@/components/RoomCardSkeleton";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import RoomCard from "@/components/RoomCard";
import SearchCard from "@/components/searchCard";
import { useBooking } from "@/context/BookingContext";
import Loader from "@/components/Loader";

export default function SearchResultsContent() {
  const [loading, setLoading] = useState(true);

  const searchParams = useSearchParams();
  const category = searchParams.get("category");
  const checkInDate = searchParams.get("checkInDate");
  const checkOutDate = searchParams.get("checkOutDate");
  const { setBookingDates } = useBooking();
  const [results, setResults] = useState([]);

  useEffect(() => {
    const checkIn = checkInDate || null;
    const checkOut = checkOutDate || null;

    setBookingDates({ checkInDate: checkIn, checkOutDate: checkOut });

    async function fetchResults() {
      setLoading(true);
      try {
        const params = new URLSearchParams();

        if (category) params.set("category", category);
        if (checkInDate) params.set("checkInDate", checkInDate);
        if (checkOutDate) params.set("checkOutDate", checkOutDate);

        const queryString = params.toString();
        const url = `/api/search${queryString ? `?${queryString}` : ""}`;

        const res = await fetch(url);
        const data = await res.json();
        setResults(data);
      } catch (error) {
        console.error("Failed to fetch search results", error);
      } finally {
        setLoading(false);
      }
    }

    fetchResults();
  }, [category, checkInDate, checkOutDate]);

  return (
    <main className="pb-10 mx-auto min-h-screen">
      {/* <div className="relative flex flex-col items-center justify-center h-55 w-full text-center mb-25 max-md:mb-8 bg-amber-500">
        <div className="text-2xl font-semibold mb-4">Search Results</div>
        <div className="mb-2">Home &gt; Search Results</div>
        <SearchCard className="max-md:hidden mt-8" />
      </div> */}

      <section
        className="relative h-[35vh] lg:h-[50vh] pt-20 bg-cover bg-center"
        style={{ backgroundImage: `url('/images/shortlet.png')` }}
      >
        <div className="absolute inset-0 bg-black/40 flex flex-col justify-center items-center max-sm:justify-start max-sm:pt-[25%] px-6 md:px-20">
          <h1 className="text-white text-4xl text-center md:text-6xl font-bold max-w-xl leading-tight">
            A World of <span className="text-amber-400">Choices</span>
          </h1>
        </div>

        {/* Search Card */}
        <SearchCard className="absolute max-sm:hidden mb-0 bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 w-11/12 md:w-4/5 rounded-3xl bg-gray-100 p-4 z-20" />
      </section>
      <SearchCard className="hidden max-md:block max-md:static max-md:mx-auto max-sm:mb-4 mb-8 max-md:mt-8" />
      <div className="px-4 md:px-16 pt-[8%] sm:pt-[14%] sm:min-h-[30vh] lg:pt-[8%] lg:min-h-[70vh]">
        <CardList results={results} loading={loading} />
      </div>
    </main>
  );
}

function CardList({ results, loading }) {
  const skeletonArray = Array(3).fill(0);
  return (
    <Suspense fallback={<Loader />}>
      <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
        {loading
          ? skeletonArray.map((_, index) => <RoomCardSkeleton key={index} />)
          : results.map((room, index) => <RoomCard key={index} room={room} />)}
      </div>
    </Suspense>
  );
}
