// components/TawkToWidget.jsx
"use client";
import { useEffect } from "react";

export default function TawkToWidget() {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://embed.tawk.to/685c91fa0e4ea3190e0d8579/1iukpkfgu";
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
