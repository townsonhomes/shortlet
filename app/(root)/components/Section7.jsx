import React from "react";
import Link from "next/link";
const Section7 = () => {
  return (
    <section className="py-8 lg:py-22 bg-white">
      {/* headline */}
      <div className="text-center mb-16 px-4">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-neutral-900">
          Get more Bookings for your{" "}
          <span className="text-amber-400">Apartment</span>
        </h2>
        <p className="mt-4 mb-[3%] max-w-xl mx-auto text-gray-500 text-sm sm:text-base">
          List your property with us and enjoy higher occupancy, competitive
          pricing, and hassle-free management—all while earning top returns.
        </p>
        <Link href="/contact-us">
          <button className="w-max rounded-md bg-neutral-900 text-white text-sm font-medium px-8 py-3 hover:bg-neutral-700 transition">
            List your Property
          </button>
        </Link>
      </div>
    </section>
  );
};

export default Section7;
