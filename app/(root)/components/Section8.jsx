import Image from "next/image";
import { FaClock } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

const newsItems = [
  {
    image: "/images/news1.png",
    title: "New Airport Terminal Opens Near Hotel Mangroove",
    desc: "Lorem ipsum dolor sit amet consectetur. Semper gravida a volutpat egestas risus scelerisque amet.",
    time: "2 hours ago",
  },
  {
    image: "/images/news2.png",
    title: "Upcoming Cultural Festival in Lagos",
    desc: "Lorem ipsum dolor sit amet consectetur. Semper gravida a volutpat egestas risus scelerisque amet.",
    time: "May 19, 2025",
  },
  {
    image: "/images/news3.png",
    title: "Lagos Bans Singles in Tourist Zones",
    desc: "Lorem ipsum dolor sit amet consectetur. Semper gravida a volutpat egestas risus scelerisque amet.",
    time: "2 hours ago",
  },
  {
    image: "/images/news1.png",
    title: "Luxury Spa Services Launch in City Center Hotels",
    desc: "Indulge in premium wellness services at our newly opened spa facilities.",
    time: "3 days ago",
  },
  {
    image: "/images/news2.png",
    title: "Beachfront Resorts Now Open for the Summer Season",
    desc: "Enjoy sunny views, beach parties, and more all season long.",
    time: "June 1, 2025",
  },
  {
    image: "/images/news3.png",
    title: "Eco-Friendly Lodging Takes Spotlight in 2025",
    desc: "Green architecture and energy-saving tech are transforming hospitality.",
    time: "1 day ago",
  },
];

export default function NewsSection() {
  const [index, setIndex] = useState(0);
  const [cardsPerSlide, setCardsPerSlide] = useState(3);

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
  for (let i = 0; i < newsItems.length; i += cardsPerSlide) {
    slides.push(newsItems.slice(i, i + cardsPerSlide));
  }

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [slides.length]);

  return (
    <section className="bg-[#FAFAFA] py-20 px-6 md:px-20 overflow-hidden">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-semibold">
          Hospitality <span className="text-yellow-400">News</span>
        </h2>
        <p className="mt-4 max-w-xl mx-auto text-gray-500">
          Lorem ipsum dolor sit amet consectetur. Semper gravida a volutpat
          egestas risus scelerisque amet.
        </p>
      </div>

      <div className="relative max-w-7xl mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.6 }}
            className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-${cardsPerSlide} gap-8`}
          >
            {slides[index].map((item, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl overflow-hidden shadow hover:shadow-md transition"
              >
                <Image
                  src={item.image}
                  alt={item.title}
                  width={400}
                  height={240}
                  className="w-full h-60 object-cover"
                />
                <div className="p-6">
                  <h3 className="font-semibold text-lg text-gray-900 mb-2 leading-snug">
                    {item.title}
                  </h3>
                  <p className="text-gray-500 text-sm mb-4">{item.desc}</p>
                  <div className="flex items-center text-gray-400 text-sm mb-4">
                    <FaClock className="mr-2" /> {item.time}
                  </div>
                  <a
                    href="#"
                    className="text-sm font-semibold text-black flex items-center gap-1 group"
                  >
                    Learn More{" "}
                    <span className="transition-transform group-hover:translate-x-1">
                      →
                    </span>
                  </a>
                </div>
              </div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
