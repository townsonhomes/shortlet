"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Section2 from "./components/Section2";
import Section3 from "./components/Section3";
import Section4 from "./components/Section4";
import Section5 from "./components/Section5";
import Section6 from "./components/Section6";
import Section7 from "./components/Section7";
import Section8 from "./components/Section8";
import HeroSlider from "@/components/HeroSlider";

const heroSlides = [
  {
    imageUrl: "/images/hero-img.jpg",
    headline: "Your home",
    highlight: "away from home",
  },
  {
    imageUrl: "/images/house1.png",
    headline: "Luxury stays",
    highlight: "for every traveler",
  },
  {
    imageUrl: "/images/house2.jpg",
    headline: "Comfort meets",
    highlight: "convenience",
  },
];

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
      <HeroSlider slides={heroSlides} />
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
