import React from "react";
import Image from "next/image";
import { Star } from "lucide-react";
import Link from "next/link";

export default function AboutUsSection() {
  return (
    <section className="py-8 lg:py-10 px-[8%] max-sm:px-[5%]">
      {/* ————— Section title ————— */}
      <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-neutral-900 text-center mb-[6%]">
        About Us
      </h2>

      <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-16 lg:gap-24">
        {/* ————— Left column (text) ————— */}
        <div className="flex flex-col justify-center space-y-6">
          <h3 className="text-lg text-center lg:text-left sm:text-2xl font-semibold text-neutral-900">
            The Most Preferred Short let in Abuja
          </h3>

          <p className="text-gray-500 leading-relaxed max-w-md">
            Lorem ipsum dolor sit amet consectetur. Ornare auctor auctor
            dictumst luctus dictumst eget pulvinar sit sed. Proin urna vitae
            etiam cras amet tincidunt pretium. Urna facilisis duis semper orci
            bibendum aliquam. Nisl blandit fermentum proin neque at integer sit
            tempus.
          </p>
          <Link href="/about">
            <button className="mt-4 inline-flex items-center gap-2 self-start rounded-lg bg-neutral-900 text-white text-sm font-medium px-6 py-3 hover:bg-neutral-700 transition">
              More About us{" "}
              <Image
                width={6}
                height={12}
                src="/images/right-caret.png"
                alt=">"
              />
            </button>
          </Link>
        </div>

        {/* ————— Right column (hero image + overlays) ————— */}
        <div className="relative w-full">
          {/* Main hero image */}
          <Image
            src="/images/aboutimg.jpg" // 👉 replace with your main image
            alt="About us building interior"
            width={900}
            height={900}
            priority
            className="rounded-xl object-cover w-full h-[360px] sm:h-[420px] lg:h-[460px]"
          />

          {/* ⭐ Rating card */}
          <div className="absolute -top-6 sm:-top-8 right-1/2 shadow-gray-300 shadow-sm translate-x-1/2 sm:right-8 sm:translate-x-0 bg-white rounded-xl px-6 py-4 flex items-center gap-2">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={18}
                className="text-amber-500 fill-amber-500"
              />
            ))}
            <span className="ml-2 font-medium text-neutral-700">5/5</span>
          </div>

          {/* 📊 Stats card */}
          <div className="absolute max-sm:w-[105%] bottom-8 left-1/2 max-lg:-translate-x-1/2 max-lg:w-[80%]  -translate-x-[90%] bg-white rounded-xl shadow-xl px-8 py-6 flex flex-row items-center justify-between gap-6 w-full">
            {/* Single stat */}
            <StatItem value="4+" label="Years Experience" />
            <Divider />
            <StatItem value="110+" label="Happy Clients" />
            <Divider />
            <StatItem value="99%" label="Customer Satisfaction" />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ————— Helper components ————— */
function StatItem({ value, label }) {
  return (
    <div className="text-center">
      <p className="text-2xl font-bold text-neutral-900">{value}</p>
      <p className="text-xs text-gray-500 mt-1">{label}</p>
    </div>
  );
}

function Divider() {
  return <div className="hidden sm:block w-px h-10 bg-gray-200" />;
}
