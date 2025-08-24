"use client";

import { useState, useEffect, useRef } from "react";
import {
  FaBars,
  FaTimes,
  FaHome,
  FaBed,
  FaInfoCircle,
  FaBlog,
  FaEnvelope,
  FaUser,
  FaSignOutAlt,
  FaClipboardList,
} from "react-icons/fa";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useProfileDrawer } from "@/context/ProfileDrawerContext";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { data: session } = useSession();
  const pathname = usePathname();
  const isProfilePage = pathname === "/profile";
  const { openDrawer } = useProfileDrawer();

  const navItems = [
    { label: "Home", href: "/", icon: <FaHome className="md:hidden mr-3" /> },
    {
      label: "Short-Lets",
      href: "/search",
      icon: <FaBed className="md:hidden mr-3" />,
    },
    {
      label: "About Us",
      href: "/about",
      icon: <FaInfoCircle className="md:hidden mr-3" />,
    },
    {
      label: "Blog",
      href: "https://towsonsgetaway.org/blog",
      icon: <FaBlog className="md:hidden mr-3" />,
    },
    {
      label: "Partnership",
      href: "/contact-us",
      icon: <FaEnvelope className="md:hidden mr-3" />,
    },
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="w-full px-4 md:px-16 py-4 max-sm:py-2 flex items-center justify-between bg-white relative z-50 shadow">
      {/* Logo */}
      <Link href="/" className="text-xl font-bold flex items-center z-50">
        <Image
          src="/images/logo.png"
          alt="Avatar"
          width={52}
          height={52}
          className=" object-cover"
        />
      </Link>
      <div className="max-xl:hidden mr-auto font-bold text-lg ml-5 text-[#131927]">
        Towson Apartments & Homes
      </div>
      {/* Centered Desktop Navigation */}
      <nav className="hidden md:flex items-center w-full max-w-2xl absolute lg:left-1/2 md:left-[45%] transform -translate-x-1/2">
        <div className="flex justify-center w-full gap-8">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={`py-1 text-gray-700 hover:text-yellow-700 ${
                pathname === item.href && "text-yellow-700"
              } font-medium relative group transition-colors duration-200`}
            >
              {item.label}
              <span
                className={`absolute bottom-0 left-0 w-0 h-0.5 bg-yellow-600 ${
                  pathname === item.href && " w-full"
                } transition-all duration-300 group-hover:w-full`}
              ></span>
            </Link>
          ))}
        </div>
      </nav>

      {/* Right-side actions */}
      <div className="flex items-center gap-4 relative z-50">
        {/* Show user info if logged in */}
        {session?.user ? (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => {
                if (isProfilePage && window.innerWidth < 1024) {
                  openDrawer();
                } else {
                  setDropdownOpen(!dropdownOpen);
                }
              }}
              onMouseEnter={() => !isProfilePage && setDropdownOpen(true)}
              className="flex items-center gap-2 bg-gray-200  px-2 lg:pr-4 py-1 rounded-full transition"
            >
              <div className="relative w-9 h-9 rounded-full border-2 border-yellow-600 overflow-hidden">
                <Image
                  src={session.user.image || "/images/user.png"}
                  alt="Avatar"
                  width={36}
                  height={36}
                  className="rounded-full object-cover"
                />
              </div>
              <div className="hidden lg:flex flex-col items-start text-sm text-gray-700">
                <span className="font-semibold">{session.user.name}</span>
                <span className="text-xs text-gray-500">
                  {session.user.email}
                </span>
              </div>
            </button>

            {dropdownOpen && !isProfilePage && (
              <div
                onMouseLeave={() => setDropdownOpen(false)}
                className="absolute right-0 mt-2 w-50 bg-white rounded-lg shadow-lg border border-amber-600 overflow-hidden"
              >
                <Link
                  href={
                    session.user.role === "admin" ||
                    session.user.role === "sub-admin"
                      ? "/admin/dashboard"
                      : "/profile"
                  }
                  className="flex items-center px-4 py-2 hover:bg-gray-100 text-gray-700"
                  onClick={() => setDropdownOpen(false)}
                >
                  <FaUser className="mr-2" />
                  {session.user.role === "admin" ||
                  session.user.role === "sub-admin"
                    ? "Dashboard"
                    : "My Profile"}
                </Link>

                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-700 flex items-center"
                >
                  <FaSignOutAlt className="mr-2 text-[#d08700]" /> Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="hidden md:flex gap-3">
            <Link href="/register">
              <button
                onClick={() => setMenuOpen(false)}
                className="px-4 py-1.5 border border-gray-300 rounded-full text-sm hover:bg-black hover:text-white font-medium transition"
              >
                Sign Up
              </button>
            </Link>
            <Link href="/login">
              <button
                onClick={() => setMenuOpen(false)}
                className="px-4 py-1.5 bg-black text-white rounded-full text-sm hover:bg-yellow-600 hover:text-black font-medium transition"
              >
                Log in
              </button>
            </Link>
          </div>
        )}

        {/* Mobile Hamburger + Avatar */}
        <div className="md:hidden flex items-center gap-2">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2 rounded-md hover:bg-gray-100 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-yellow-600"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
          >
            {menuOpen ? (
              <FaTimes className="text-2xl text-gray-700" />
            ) : (
              <FaBars className="text-2xl text-gray-700" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden fixed top-16 bottom-0 left-0 w-full h-[calc(100vh - 4rem)] bg-white z-40 transition-all duration-300 ease-in-out transform ${
          menuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col p-6">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              onClick={() => setMenuOpen(false)}
              className="py-4 px-4 flex items-center text-gray-700 hover:bg-yellow-50 hover:text-yellow-700 rounded-lg transition-colors duration-200 border-b border-gray-100"
            >
              {item.icon}
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}

          <div className="flex gap-3 mt-8">
            {!session?.user ? (
              <>
                <Link href="/register" className="flex-1">
                  <button
                    onClick={() => setMenuOpen(false)}
                    className="w-full py-3 border border-black rounded-full text-sm hover:bg-black hover:text-white font-medium transition"
                  >
                    Sign Up
                  </button>
                </Link>
                <Link href="/login" className="flex-1">
                  <button
                    onClick={() => setMenuOpen(false)}
                    className="w-full py-3 bg-black text-white rounded-full text-sm hover:bg-yellow-600 hover:text-black font-medium transition"
                  >
                    Log in
                  </button>
                </Link>
              </>
            ) : (
              <button
                onClick={() => signOut()}
                className="w-full py-3 border border-red-500 text-red-500 rounded-full hover:bg-red-50 font-medium"
              >
                Logout
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
