import Image from "next/image";
import { useEffect, useState, useRef } from "react";
import { FaStar, FaQuoteLeft } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

const testimonials = [
  {
    text: "The hospitality was incredible. From check-in to check-out, the service was seamless and welcoming.",
    name: "James Harrison",
    rating: 5,
    image: "/images/reviewer1.png",
  },
  {
    text: "I loved the atmosphere and cleanliness. The staff were attentive and the location was perfect.",
    name: "Felicia Godwin",
    rating: 4,
    image: "/images/reviewer1.png",
  },
  {
    text: "Honestly the best stay I’ve had in years. Comfortable rooms and top-notch service.",
    name: "James Harrison",
    rating: 5,
    image: "/images/reviewer1.png",
  },
  {
    text: "Great experience and excellent service. I highly recommend them to anyone.",
    name: "Grace Oluchi",
    rating: 5,
    image: "/images/reviewer1.png",
  },
  {
    text: "Wonderful atmosphere and friendly staff. Will definitely come back again.",
    name: "Michael Lee",
    rating: 4,
    image: "/images/reviewer1.png",
  },
  {
    text: "Clean rooms and amazing hospitality. My stay was top-notch.",
    name: "Amina Yusuf",
    rating: 5,
    image: "/images/reviewer1.png",
  },
];

export default function TestimonialsSection() {
  const [index, setIndex] = useState(0);
  const [cardsPerSlide, setCardsPerSlide] = useState(3);
  const autoSlideRef = useRef(null);

  useEffect(() => {
    const updateCardsPerSlide = () => {
      if (window.innerWidth < 640) setCardsPerSlide(1);
      else if (window.innerWidth < 1024) setCardsPerSlide(2);
      else setCardsPerSlide(3);
    };
    updateCardsPerSlide();
    window.addEventListener("resize", updateCardsPerSlide);
    return () => window.removeEventListener("resize", updateCardsPerSlide);
  }, []);

  const slides = [];
  for (let i = 0; i < testimonials.length; i += cardsPerSlide) {
    slides.push(testimonials.slice(i, i + cardsPerSlide));
  }

  const handleSlide = (direction) => {
    clearInterval(autoSlideRef.current);
    if (direction === "left") {
      setIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
    } else {
      setIndex((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }
    startAutoSlide();
  };

  const startAutoSlide = () => {
    autoSlideRef.current = setInterval(() => {
      setIndex((prev) => (prev + 1) % slides.length);
    }, 5000);
  };

  useEffect(() => {
    startAutoSlide();
    return () => clearInterval(autoSlideRef.current);
  }, [cardsPerSlide]);

  return (
    <section className="bg-[#F7F7F7] py-20 pb-24 px-6 md:px-20 relative overflow-hidden">
      <div className="text-center mb-16">
        <h1 className="text-xl text-gray-500 font-semibold">Guest Reviews</h1>
        <h2 className="text-3xl md:text-4xl font-semibold">
          Real Stories for our{" "}
          <span className="text-yellow-400">Satisfied Guests</span>
        </h2>
      </div>

      <div className="relative w-full max-w-7xl mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.5 }}
            className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8`}
          >
            {slides[index].map((item, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl shadow-xl px-8 py-10"
              >
                <FaQuoteLeft className="text-4xl text-gray-300 mb-6" />
                <p className="text-base md:text-lg text-gray-600 leading-relaxed mb-8">
                  {item.text}
                </p>
                <div className="flex items-center gap-4">
                  <Image
                    src={item.image}
                    alt={item.name}
                    width={72}
                    height={72}
                    className="rounded-full"
                  />
                  <div>
                    <p className="font-semibold text-black text-lg">
                      {item.name}
                    </p>
                    <div className="flex items-center gap-1 text-yellow-400 text-sm">
                      {Array.from({ length: item.rating }).map((_, i) => (
                        <FaStar key={i} />
                      ))}
                      <span className="text-gray-500 ml-1">
                        {item.rating}/5
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
