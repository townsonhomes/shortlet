"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import SearchCard from "@/components/searchCard";
import { useRouter } from "next/navigation";
import Section2 from "./components/Section2";
import Section3 from "./components/Section3";
import Section4 from "./components/Section4";
import Section5 from "./components/Section5";
import Section6 from "./components/Section6";
import Section7 from "./components/Section7";
import Section8 from "./components/Section8";

export default function HomeSection() {
  const { data: session } = useSession();
  const router = useRouter();
  useEffect(() => {
    const bookingData = localStorage.getItem("bookingData");
    if (session?.user && bookingData) {
      const { roomId, checkInDate, checkOutDate } = JSON.parse(bookingData);
      router.push(
        `/booking/${roomId}?checkInDate=${checkInDate}&checkOutDate=${checkOutDate}`
      );
    }
  }, [session]);
  return (
    <div className="w-full">
      {/* Hero Section */}
      <section
        className="relative h-[50vh] sm:h-[60vh] lg:h-[50vh] pt-20 bg-cover bg-center"
        style={{ backgroundImage: `url('/images/hero-img.jpg')` }}
      >
        <div className="absolute inset-0 bg-black/40 flex flex-col justify-center items-center max-sm:justify-start max-sm:pt-[25%] px-6 md:px-20">
          <h1 className="text-white text-4xl text-center md:text-6xl font-bold max-w-xl leading-tight">
            Your home <span className="text-amber-400">away from home</span>
          </h1>
        </div>

        {/* Search Card */}
        <SearchCard className="absolute mb-0 bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 w-11/12 md:w-4/5 rounded-3xl bg-gray-100 p-4 z-20" />
      </section>
      <Section2 />
      <Section3 />
      <Section4 />
      <Section5 />
      <Section6 />
      <Section7 />
      <Section8 />
    </div>
  );
}
