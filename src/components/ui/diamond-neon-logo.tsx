'use client'

import React from 'react'

export function DiamondNeonLogo({ className = "" }: { className?: string }) {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <svg
        width="40"
        height="40"
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="neon-diamond-glow"
      >
        {/* Diamond Shape */}
        <path
          d="M50 5L90 40L50 95L10 40L50 5Z"
          fill="url(#diamond-gradient)"
          stroke="var(--neon-turquoise)"
          strokeWidth="2"
        />
        {/* Inner Details */}
        <path
          d="M50 5L50 95M10 40L90 40M10 40L50 20L90 40M50 5L30 40L50 95L70 40L50 5Z"
          stroke="rgba(255, 255, 255, 0.4)"
          strokeWidth="1"
        />
        {/* Sparkle effects */}
        <circle cx="50" cy="5" r="2" fill="white">
          <animate attributeName="opacity" values="0;1;0" dur="2s" repeatCount="indefinite" />
        </circle>
        <circle cx="90" cy="40" r="2" fill="white">
          <animate attributeName="opacity" values="0;1;0" dur="2.5s" repeatCount="indefinite" />
        </circle>
        <circle cx="10" cy="40" r="2" fill="white">
          <animate attributeName="opacity" values="0;1;0" dur="1.8s" repeatCount="indefinite" />
        </circle>
        
        <defs>
          <linearGradient id="diamond-gradient" x1="50" y1="5" x2="50" y2="95" gradientUnits="userSpaceOnUse">
            <stop stopColor="#00f5ff" stopOpacity="0.8" />
            <stop offset="0.5" stopColor="#22d3ee" stopOpacity="0.4" />
            <stop offset="1" stopColor="#0ea5e9" stopOpacity="0.2" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  )
}
