import React from "react";

interface ZkEngageLogoProps {
  className?: string;
  alt?: string;
}

export default function ZkEngageLogo({ className = "w-8 h-8", alt = "zkEngage logo" }: ZkEngageLogoProps) {
  // Load the file from the same folder reliably in both dev and build
  const src = new URL("./zkEngagelogo.png", import.meta.url).href;

  // Render the provided image with a unique container (rounded, shadow, subtle transform)
  return (
    <div
      className={`inline-block rounded-full overflow-hidden shadow-lg transform transition-transform duration-150 hover:scale-105 ${className}`}
      aria-hidden={alt ? undefined : true}
      title={alt}
    >
      <img src={src} alt={alt} className="w-full h-full object-cover block" />
    </div>
  );
}
