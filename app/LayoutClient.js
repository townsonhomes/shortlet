// app/LayoutClient.js
"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/navbar";
import Footer from "@/components/Footer";
import { ProfileDrawerProvider } from "@/context/ProfileDrawerContext";
import TawkToWidget from "@/components/TawkToWidget";

export default function LayoutClient({ children }) {
  const pathname = usePathname();

  const hideFooter = pathname.startsWith("/admin/dashboard");
  const hideNavbar = pathname.startsWith("/admin/dashboard");

  return (
    <>
      <TawkToWidget />
      <ProfileDrawerProvider>
        <Navbar />
        {children}
        {!hideFooter && <Footer />}
      </ProfileDrawerProvider>
    </>
  );
}
