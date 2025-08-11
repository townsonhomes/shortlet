import Image from "next/image";
import { FaClock } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

const newsItems = [
  {
    image: "/images/news_1.png",
    title: "Most expensive African countries to rent a home in 2025",
    desc: "Africa’s urban population is expanding rapidly, and with it, the demand for housing continues to intensify.",
    time: "2 hours ago",
    link: "https://nairametrics.com/2025/06/24/most-expensive-african-countries-to-rent-a-home-in-2025/",
  },
  {
    image: "/images/news_2.png",
    title: "Top 10 African countries leading hotel development in Q1 2025",
    desc: "As of early 2025, hotel chains across Africa had 577 projects in the pipeline,",
    time: "May 19, 2025",
    link: "https://nairametrics.com/2025/04/13/top-10-african-countries-leading-hotel-development-in-q1-2025/",
  },
  {
    image: "/images/news_3.png",
    title:
      "Cross River govt cancels CIBA’s 25-year Obudu Ranch concession over unmet obligations.",
    desc: "The Cross River State Government has revoked the 25-year concession agreement with CIBA Construction Company Limited for the management of Obudu Cattle Ranch",
    time: "2 hours ago",
    link: "https://nairametrics.com/2025/03/05/cross-river-govt-cancels-cibas-25-year-obudu-ranch-concession-over-unmet-obligations/",
  },
  {
    image: "/images/news4.png",
    title: "voco The Shelby – Myrtle Beach",
    desc: "voco The Shelby – Myrtle Beach Introduces a New Era of Coastal Hospitality Along the Grand Strand.",
    time: "3 days ago",
    link: "https://www.hospitalitynet.org/announcement/41012827/voco-the-shelby-myrtle-beach.html",
  },
  {
    image: "/images/news5.png",
    title: "BLamangata Luxury Surf Resort",
    desc: "Now Open: Lamangata Luxury Surf Resort, a Sustainable Costa Rican Retreat.",
    time: "June 1, 2025",
    link: "https://www.hospitalitynet.org/announcement/41012826/lamangata-luxury-surf-resort.html",
  },
  {
    image: "/images/news6.png",
    title: "Eco-Friendly Lodging Takes Spotlight in 2025",
    desc: "Green architecture and energy-saving tech are transforming hospitality.",
    time: "1 day ago",
    link: "https://www.hospitalitynet.org/announcement/41012825/rimrock-banff-emblems-collection.html",
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
          Stay updated on the latest travel trends, hosting tips, and exclusive
          deals curated just for you.
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
                    href={item.link}
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
