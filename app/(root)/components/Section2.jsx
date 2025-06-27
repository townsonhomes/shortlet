import React from "react";
import Image from "next/image";

const devices = [
  {
    icon: "/images/icon1.png",
    title: "Instant Confirmation",
    subtitle: "Real-time booking",
  },
  {
    icon: "/images/icon2.png",
    title: "Best Price Guarantee",
    subtitle: "No hidden fees",
  },
  {
    icon: "/images/icon3.png",
    title: "24/7 Support",
    subtitle: "Chat with us anytime",
  },
];

function DeviceCard({ icon, title, subtitle }) {
  return (
    <div className="flex items-center gap-4 bg-yellow-50 border border-white/10 rounded-xl p-6 max-sm:w-full md:w-[44%] lg:w-[26%] h-[148px] shadow-sm backdrop-blur-sm">
      <div className="flex-shrink-0">
        <Image
          src={icon}
          alt="icon"
          width={48}
          height={48}
          className="w-12 h-12 sm:w-14 sm:h-14 object-contain"
        />
      </div>
      <div className="flex flex-col text-left">
        <h3 className="font-semibold text-base sm:text-lg text-neutral-800">
          {title}
        </h3>
        <p className="text-gray-600 text-sm sm:text-base mt-1">{subtitle}</p>
      </div>
    </div>
  );
}

const Section2 = () => {
  return (
    <section className="w-full pt-[45%] sm:pt-[30%] md:pt-[14%] lg:pt-[12%] xl:pt-[8%] pb-[8%] lg:pb-[4%]">
      <div className="flex flex-wrap justify-center gap-6 px-4 w-full mx-auto">
        {devices.map((device, idx) => (
          <DeviceCard
            key={idx}
            icon={device.icon}
            title={device.title}
            subtitle={device.subtitle}
          />
        ))}
      </div>
    </section>
  );
};

export default Section2;
