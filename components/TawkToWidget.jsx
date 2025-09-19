"use client";
import Script from "next/script";

export default function TawkToWidget() {
  return (
    <Script
      id="tawk-to"
      strategy="afterInteractive"
      src="https://embed.tawk.to/6891e17cceb331192366e0ed/1j1sthk5s"
      onError={(e) => {
        console.error("Tawk.to script failed to load", e);
      }}
    />
  );
}
