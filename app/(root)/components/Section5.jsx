import Image from "next/image";

const features = [
  { icon: "/images/icon-light.png", label: "24-7 Electricity" },
  { icon: "/images/icon-ac.png", label: "Air conditioning" },
  { icon: "/images/icon-wifi.png", label: "Wifi" },
  { icon: "/images/icon-tv.png", label: "Smart TV" },
  { icon: "/images/icon-bed.png", label: "Clean Sheets" },
  { icon: "/images/icon-clean.png", label: "Daily Cleaning" },
  { icon: "/images/icon-security.png", label: "24-7 Security" },
  { icon: "/images/icon-water.png", label: "24-7 Water" },
  { icon: "/images/icon-bath.png", label: "Bath tubs" },
  { icon: "/images/icon-door.png", label: "Security Doors" },
  { icon: "/images/laundry.png", label: "Laundry" },
  { icon: "/images/kitchen.png", label: "Kitchen" },
];

export default function FeaturesSection() {
  return (
    <section className="bg-[#0C0E13] text-white py-20 px-6 md:px-20">
      <div className="text-center mb-10">
        <h2 className="text-3xl md:text-4xl font-semibold">
          All Standard <span className="text-yellow-400">Features</span>
        </h2>
        {/* <p className="text-sm text-gray-400 mt-2 max-w-xl mx-auto">
          Lorem ipsum dolor sit amet consectetur. Semper gravida a volutpat
          egestas risus scelerisque amet.
        </p> */}
      </div>
      <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 lg:w-[60%] gap-15 justify-items-center mx-auto text-sm text-gray-300">
        {features.map((feature, index) => (
          <div key={index} className="flex flex-col items-center text-center">
            <Image
              src={feature.icon}
              alt={feature.label}
              width={38}
              height={38}
              className="mb-2"
            />
            <span className="leading-tight w-24">{feature.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
