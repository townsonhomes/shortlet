/* components/Footer.tsx */
import Image from "next/image";
import Link from "next/link";
import {
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaWhatsapp,
  FaEnvelope,
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaLinkedinIn,
  FaYoutube,
} from "react-icons/fa";

const contactDetails = [
  {
    icon: <FaMapMarkerAlt className="text-[#C4C4C4]" />,
    text: "Abuja, Nigeria.",
  },
  {
    icon: <FaPhoneAlt className="text-[#C4C4C4]" />,
    text: "+243 7082813571",
  },
  {
    icon: <FaWhatsapp className="text-[#C4C4C4]" />,
    text: "+234 7082813571",
  },
  {
    icon: <FaEnvelope className="text-[#C4C4C4]" />,
    text: "towsonhomes92@gmail.com",
  },
];

const menuLinks = [
  { name: "Home", link: "/" },
  { name: "Short-Lets", link: "/search" },
  { name: "About Us", link: "/about" },
  { name: "Car Hire", link: "http://towsoncarhire.com" },
  { name: "Laundry", link: "http://towsonluxelaundry.com" },
  { name: "Spa", link: "http://towsonluxespa.com" },
  { name: "Kitchen", link: "http://towsonkitchen.com" },
  { name: "Blog", link: "https://towsonsgetaway.org/blog" },
  { name: "Partnership", link: "/contact-us" },
];

const socialContacts = [
  // { icon: <FaFacebookF className="text-[#C4C4C4]" />, text: "Facebook" , link: "https://facebook.com" },
  {
    icon: <FaTwitter className="text-[#C4C4C4]" />,
    text: "Twitter",
    link: "https://x.com/towson_homes?s=21",
  },
  {
    icon: <FaInstagram className="text-[#C4C4C4]" />,
    text: "Instagram",
    link: "https://www.instagram.com/towsonhomes?igsh=ZnZobm15aXJjbDJs&utm_source=qr",
  },
  // { icon: <FaLinkedinIn className="text-[#C4C4C4]" />, text: "LinkedIn" , link: "https://linkedin.com" },
  // { icon: <FaYoutube className="text-[#C4C4C4]" />, text: "YouTube" , link: "https://youtube.com" },
];

export default function Footer() {
  return (
    <footer className="bg-[#0C0F14] text-[#E1E1E1] px-6 xl:px-20 pt-12 pb-6 max-sm:pl-[8%] mt-auto">
      {/* ── TOP GRID ─────────────────────────────────────────────── */}
      <div
        className="
           grid gap-6
    grid-cols-1
    md:grid-cols-[auto_1fr_1fr_1fr]
        "
      >
        {/* Logo / intro */}
        <div className="flex flex-col items-start mr-10 max-sm:mr-0">
          <Image
            src="/images/logo.png"
            alt="Towson Logo"
            width={90}
            height={45}
            className="mb-2"
          />
        </div>

        {/* Menu */}
        <div>
          <h4 className="text-[#f5c252] font-semibold mb-4">Menu</h4>
          <ul className="space-y-3 text-sm">
            {menuLinks.map(({ name, link }) => (
              <li key={name}>
                <Link href={link}>{name}</Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contacts */}
        <div>
          <h4 className="text-[#f5c252] font-semibold mb-4">Contacts us</h4>
          <ul className="space-y-3 text-sm">
            {contactDetails.map(({ icon, text }) => (
              <li key={text} className="flex items-center gap-2 cursor-default">
                {icon}
                {text}
              </li>
            ))}
          </ul>
        </div>

        {/* Social */}
        <div>
          <h4 className="text-[#f5c252] font-semibold mb-4">Stay up to date</h4>
          <ul className="space-y-3 text-sm">
            {socialContacts.map(({ icon, text, link }) => (
              <li key={text} className="flex items-center gap-2">
                <Link href={link} className="flex items-center gap-2">
                  {icon}
                  {text}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-[#20232A] mt-10 pt-4 text-center text-sm text-[#A1A1A1]">
        Copyright © 2025&nbsp;Towson&nbsp;Apartments&nbsp;&amp;&nbsp;Homes
      </div>
    </footer>
  );
}
