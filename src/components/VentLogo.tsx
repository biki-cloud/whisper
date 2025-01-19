import React from "react";

interface VentLogoProps {
  width?: number;
  height?: number;
}

const VentLogo: React.FC<VentLogoProps> = ({ width = 200, height = 100 }) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 200 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#A2D9FF" />
          <stop offset="100%" stopColor="#FFFFFF" />
        </linearGradient>
      </defs>

      {/* 背景の波形 */}
      <path
        d="M0 50C40 30 60 70 100 50C140 30 160 70 200 50"
        stroke="url(#gradient)"
        strokeWidth="30"
        strokeLinecap="round"
        fill="none"
      >
        <animate
          attributeName="d"
          values="
            M0 50C40 30 60 70 100 50C140 30 160 70 200 50;
            M0 50C40 70 60 30 100 50C140 70 160 30 200 50;
            M0 50C40 30 60 70 100 50C140 30 160 70 200 50
          "
          dur="10s"
          repeatCount="indefinite"
        />
      </path>

      {/* Vの文字 */}
      <path
        d="M70 20L100 80L130 20"
        stroke="#87CEEB"
        strokeWidth="12"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      {/* entの文字 */}
      <text
        x="105"
        y="70"
        fontFamily="Arial, sans-serif"
        fontSize="36"
        fontWeight="bold"
        fill="#87CEEB"
      >
        ent
      </text>
    </svg>
  );
};

export default VentLogo;
