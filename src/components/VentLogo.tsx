import React from "react";

interface VentLogoProps {
  width?: number;
  height?: number;
  className?: string;
}

const VentLogo: React.FC<VentLogoProps> = ({
  width = 32,
  height = 32,
  className,
}) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect width="32" height="32" rx="4" fill="url(#gradient)" />
      <path
        d="M24.192 8L16.736 24.448H15.264L7.808 8H10.304L16.064 21.248L21.824 8H24.192Z"
        fill="white"
      />
      <defs>
        <linearGradient
          id="gradient"
          x1="0"
          y1="0"
          x2="32"
          y2="32"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#4F46E5" />
          <stop offset="1" stopColor="#2563EB" />
        </linearGradient>
      </defs>
    </svg>
  );
};

export default VentLogo;
