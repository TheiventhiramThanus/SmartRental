import { playCarHorn } from "../ui/sound";

export function MovingCarAnimation() {
  return (
    <div className="w-full h-48 relative overflow-hidden z-10">
      {/* Dark Night Sky Background for the road strip */}
      <div className="absolute inset-0 bg-[#0f172a]/80 pointer-events-none" />
      
      <svg 
        className="w-full h-full relative z-10 pointer-events-none"
        viewBox="0 0 1200 200" 
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Soft Car Shadow */}
          <filter id="carShadow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="4" />
            <feOffset dx="0" dy="8" result="offsetblur" />
            <feComponentTransfer>
              <feFuncA type="linear" slope="0.5" />
            </feComponentTransfer>
            <feMerge>
              <feMergeNode />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Headlight Beam Gradient - Soft White to Transparent */}
          <radialGradient id="headlightBeam" cx="0%" cy="50%" r="100%" fx="0%" fy="50%">
            <stop offset="0%" stopColor="white" stopOpacity="0.4" />
            <stop offset="60%" stopColor="white" stopOpacity="0.1" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Road Path - Curve */}
        <path
          id="roadPath"
          d="M -200,100 C 200,150 400,50 600,100 S 1000,150 1400,100"
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="60"
          strokeLinecap="round"
        />
        
        {/* Road Markings (Dashed Line) */}
        <path
          d="M -200,100 C 200,150 400,50 600,100 S 1000,150 1400,100"
          fill="none"
          stroke="rgba(255,255,255,0.3)"
          strokeWidth="2"
          strokeDasharray="30 40"
          strokeLinecap="round"
        />

        {/* Moving Car Group */}
        <g>
          {/* Apply rotation and movement along path */}
          <animateMotion 
            dur="12s" 
            repeatCount="indefinite" 
            rotate="auto"
            calcMode="spline"
            keySplines="0.4 0 0.2 1" 
            keyTimes="0;1"
          >
            <mpath href="#roadPath" />
          </animateMotion>

          {/* Wrapper for Scale and visual elements */}
          <g transform="scale(2.5)"> {/* Increased size */}
            
            {/* Headlight Beams (Cone Shape) */}
            {/* Right Headlight Beam */}
            <path d="M 20,4 L 120,-10 L 120,20 Z" fill="url(#headlightBeam)" />
            {/* Left Headlight Beam */}
            <path d="M 20,-4 L 120,-20 L 120,10 Z" fill="url(#headlightBeam)" />

            {/* Car Shadow */}
            <g 
              filter="url(#carShadow)" 
              className="cursor-pointer pointer-events-auto hover:opacity-90 transition-opacity"
              onClick={playCarHorn}
            >
              {/* Car Body */}
              <rect x="-20" y="-12" width="46" height="24" rx="6" fill="#FACC15" /> 
              {/* Roof/Windshield Area */}
              <rect x="-8" y="-10" width="22" height="20" rx="3" fill="#1F2937" />
              <rect x="-6" y="-8" width="18" height="16" rx="2" fill="#111827" /> {/* Darker glass */}
              
              {/* Headlights (Yellow/White dots on car) */}
              <circle cx="22" cy="-6" r="2.5" fill="#FEF08A" />
              <circle cx="22" cy="6" r="2.5" fill="#FEF08A" />
              
              {/* Taillights (Red dots) */}
              <circle cx="-18" cy="-6" r="2.5" fill="#EF4444" />
              <circle cx="-18" cy="6" r="2.5" fill="#EF4444" />
            </g>
          </g>
        </g>
      </svg>
    </div>
  );
}
