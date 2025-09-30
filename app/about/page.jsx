import React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  FaRegBookmark,
  FaRegFileAlt,
  FaHotel,
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaLinkedinIn,
  FaYoutube,
} from "react-icons/fa";

const list1 = [
  "Provide a comfortable stay",
  "Offer convenience to our guests",
  "Ensure affordability",
  "Make our guests feel at home",
  "Deliver a hassle-free experience in the heart of Abuja.",
];

const list2 = [
  "Flexibility: Our Short-term rentals provide flexibility for travelers, business professionals, or individuals with temporary work assignments.",
  "Convenience: Furnished apartments with amenities like Wi-Fi, laundry, and kitchen facilities offer a convenient living solution.",
  "Comfort: Our Short-let apartments provide a home away from home, allowing guests to relax and feel comfortable during their stay.",
  "Cost-effectiveness: Our Short-term rentals can be more cost-effective than hotels, especially for longer stays or group bookings",
  "Local experience: At Towson Homes Short-let apartments often provide a more authentic local experience, allowing guests to immerse themselves in the community.",
  "Space: Our Apartments typically offer more space than hotel rooms, making it  ideal for families, groups, or individuals needing room to work or relax.",
  "Amenities: Our short-let apartments come with amenities like gym access, Tour guide, or parking, enhancing the overall stay experience.",
];

const steps = [
  {
    icon: <FaRegBookmark size={20} className="text-gray-700" />,
    title: "Shorlet reservation",
    description:
      "Choose your preferred room and make a reservation. Enjoy a smooth and simple booking experience tailored to your needs.",
  },
  {
    icon: <FaRegFileAlt size={20} className="text-gray-700" />,
    title: "Filling in documents and payment",
    description:
      "Complete the necessary paperwork and proceed with payment. We ensure a secure and efficient process to confirm your stay.",
  },
  {
    icon: <FaHotel size={20} className="text-gray-700" />,
    title: "Check in apartment",
    description:
      "Exceptional service and warm hospitality—because your satisfaction is our priority.",
  },
];

const page = () => {
  return (
    <main>
      <section
        className="relative h-[35vh] lg:h-[50vh] pt-20 bg-cover bg-center"
        style={{ backgroundImage: `url('/images/recent/TOW12.jpg')` }}
      >
        <div className="absolute inset-0 bg-black/40 flex flex-col justify-center items-center max-sm:justify-start max-sm:pt-[25%] px-6 md:px-20">
          <h1 className="text-white text-4xl -mt-8 lg:-mt-16 text-center md:text-6xl font-bold max-w-xl leading-tight">
            About <span className="text-amber-400">Us</span>
          </h1>
        </div>
      </section>
      <section className="w-[85%] max-sm:w-[90%] -mt-30 relative z-30 bg-white mx-auto rounded-[15px] px-[4%] py-15 shadow-lg max-sm:py-8">
        <Image
          src="/images/house2.jpg"
          alt="icon"
          width={500}
          height={500}
          className="object-cover rounded-[12px] w-full h-[300px] max-sm:hidden"
        />
        <p className="mt-8 text-sm text-[#303030] max-sm:mt-0">
          Our short-let apartment in Abuja is a serene escape for both business
          and leisure travelers. The apartment features a spacious living area,
          fully-equipped kitchen, and cozy bedroom with en-suite bathroom.
          Amenities include Starlinks, secure parking, 24/7 electricity and
          water supply, and regular cleaning services. It's an ideal choice for
          business travelers, couples, and solo travelers looking for a peaceful
          retreat. We offer flexible stay options, competitive rates, and a
          prime location in Abuja. Whether you're here for work or play, Our
          apartment provides a comfortable and convenient base for your stay.
          Book now and enjoy a hassle-free experience in the heart of Abuja.
        </p>
      </section>
      <section className="flex max-md:flex-col items-center px-[5%] gap-[5%] pt-[8%] lg:pt-[3%] justify-center">
        <Image
          src="/images/frame1.png"
          alt="icon"
          width={350}
          height={350}
          className="object-contain rounded-lg max-sm:object-cover  h-[350px] w-[290px] max-sm:w-full max-sm:h-[250px] max-sm:my-8"
        />
        <div className="text-[#131927] flex flex-col gap-2">
          <h2 className="text-3xl font-bold mb-4">Our Vision & Mission</h2>
          {list1.map((text, index) => (
            <List key={index} text={text} />
          ))}
        </div>
      </section>
      <section className="flex flex-row-reverse items-center max-md:flex-col px-[5%] gap-14 mt-[1%] md:mt-[5%] lg:mt-[2%] max-sm:mt-[15%] justify-center pb-[3%]">
        <Image
          src="/images/frame2.png"
          alt="icon"
          width={350}
          height={450}
          className="object-cover rounded-lg max-sm:object-cover !h-[450px] w-[350px] max-sm:!h-[250px] max-sm:w-full"
        />
        <div className="text-[#131927] flex flex-col gap-2">
          <h2 className="text-3xl font-bold mb-4">Our Values</h2>
          {list2.map((text, index) => (
            <List key={index} text={text} />
          ))}
        </div>
      </section>
      <section className="max-w-7xl mx-auto px-[5%] pb-10 pt-15 flex justify-between items-center gap-12 bg-white max-sm:flex-col-reverse">
        {/* Left content */}
        <div className="max-w-[500px] space-y-10">
          <h2 className="text-[32px] leading-[42px] font-bold text-gray-900">
            Stages of Booking a <br /> shortlet
          </h2>

          <div className="space-y-10 relative">
            {steps.map((step, index) => (
              <div key={index} className="flex items-start gap-4 relative">
                {/* Dotted connector */}
                {index < steps.length - 1 && (
                  <div className="absolute left-[20px] top-8 bottom-[-36px] w-px border-l-2 border-dotted border-gray-300 z-0" />
                )}

                <div className="relative z-10 shrink-0 w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                  {step.icon}
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">
                    {step.title}
                  </h4>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <Link
            href="/search"
            className="inline-flex items-center gap-2 text-sm font-medium text-white bg-gray-900 px-4 py-2 rounded-md hover:bg-gray-800 transition"
          >
            <FaRegBookmark size={14} />
            Book Now
          </Link>
        </div>

        {/* Right image */}
        <div className="rounded-xl overflow-hidden shadow-lg max-w-[500px] w-full">
          <Image
            src="/images/recent/house-4.jpg"
            alt="Hotel Room"
            width={800}
            height={600}
            className="w-full h-auto object-cover md:h-[500px]"
          />
        </div>
      </section>
      <section className="pt-[5%] pb-[10%] lg:pb-[6%] px-[5%]">
        <h2 className="font-bold text-3xl text-center mb-4">
          Lets Keep You Posted
        </h2>
        <p className="text-center">
          We will like to keep you in the loop via your favourite social media
          channels. Follow us or like us on...
        </p>
        <div className="flex justify-center gap-8 mt-6">
          {/* <Link href="#">
            <FaFacebookF className="text-black" />
          </Link> */}
          <Link href="https://x.com/towson_homes?s=21">
            <FaTwitter className="text-black" />
          </Link>
          <Link href="https://www.instagram.com/towsonhomes?igsh=ZnZobm15aXJjbDJs&utm_source=qr">
            <FaInstagram className="text-black" />
          </Link>
          {/* <Link href="#">
            <FaLinkedinIn className="text-black" />
          </Link>
          <Link href="#">
            <FaYoutube className="text-black" />
          </Link> */}
        </div>
      </section>
    </main>
  );
};

function List({ text }) {
  return (
    <div className="flex text-md items-center">
      <div className="w-3 h-3 min-w-3 min-h-3 bg-[#131927] rounded-full mr-3 inline-block"></div>
      {text}
    </div>
  );
}

export default page;
