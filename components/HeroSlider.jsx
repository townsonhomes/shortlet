"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SearchCard from "./searchCard";

export default function HeroSlider({ slides }) {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000); // 5 seconds per slide
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <div className="relative h-[50vh] sm:h-[60vh] lg:h-[50vh] w-full">
      <AnimatePresence mode="wait">
        <motion.div
          key={slides[currentSlide].imageUrl}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url('${slides[currentSlide].imageUrl}')` }}
        >
          <div className="absolute inset-0 bg-black/40 flex flex-col justify-center items-center max-sm:justify-start max-sm:pt-[25%] px-6 md:px-20">
            <h1 className="text-white text-4xl text-center md:text-6xl font-bold max-w-xl leading-tight">
              {slides[currentSlide].headline}{" "}
              <span className="text-amber-400">
                {slides[currentSlide].highlight}
              </span>
            </h1>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Dots Navigation */}
      <div className="absolute bottom-[20%] max-sm:bottom-[40%] left-1/2 transform -translate-x-1/2 flex gap-2 z-30">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-3 h-3 rounded-full transition-all ${
              index === currentSlide ? "bg-white" : "bg-white/50"
            }`}
          ></button>
        ))}
      </div>
      <SearchCard className="absolute mb-0 bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 w-11/12 md:w-4/5 rounded-3xl bg-gray-100 p-4 z-20" />
    </div>
  );
}
