import React from "react";
import ParnershipForm from "@/components/PartnershipForm";
const page = () => {
  return (
    <main>
      <section
        className="relative h-[35vh] lg:h-[50vh] pt-20 bg-cover bg-center"
        style={{ backgroundImage: `url('/images/contact.png')` }}
      >
        <div className="absolute inset-0 bg-black/40 flex flex-col justify-center items-center max-sm:justify-start max-sm:pt-[25%] px-6 md:px-20">
          <h1 className="text-white text-4xl -mt-6 lg:-mt-16 text-center md:text-6xl font-bold max-w-xl leading-tight">
            List your Shortlet{" "}
            <span className="text-amber-400"> Apartments With Us </span>
          </h1>
        </div>
      </section>
      <section className="px-[5%]">
        <ParnershipForm />
      </section>
    </main>
  );
};

export default page;
