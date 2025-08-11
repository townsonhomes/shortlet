// components/TawkToWidget.jsx
"use client";
import { useEffect } from "react";

export default function TawkToWidget() {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://embed.tawk.to/6891e17cceb331192366e0ed/1j1sthk5s";
    script.async = true;
    script.charset = "UTF-8";
    script.setAttribute("crossorigin", "*");

    document.body.appendChild(script);

    return () => {
      // optional cleanup
      document.body.removeChild(script);
    };
  }, []);

  return null;
}
