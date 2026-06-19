import React from "react";
import { CharacterState } from "../types";

interface AeivoCharacterProps {
  state: CharacterState;
  width?: number | string;
  height?: number | string;
  className?: string;
}

export const AeivoCharacter: React.FC<AeivoCharacterProps> = ({
  state,
  width = "100%",
  height = "100%",
  className = "",
}) => {
  const {
    expression,
    eyeLook,
    floatingAsset,
    showLaptop,
    holdingPen,
    scale = 1,
  } = state;

  return (
    <div
      className={`relative select-none flex flex-col items-center justify-center ${className}`}
      style={{
        width,
        height,
        transform: `scale(${scale})`,
        transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
      }}
    >
      {/* Dynamic Floating Asset above Head */}
      <div 
        className="absolute -top-12 z-20 flex justify-center items-center pointer-events-none"
        style={{
          animation: "aeivo-float 3s ease-in-out infinite",
        }}
      >
        {floatingAsset === "rust-orb" && (
          <svg width="64" height="64" viewBox="0 0 100 100" className="drop-shadow-lg">
            <defs>
              <radialGradient id="rustOrbGrad" cx="30%" cy="30%" r="70%">
                <stop offset="0%" stopColor="#FFA07A" />
                <stop offset="40%" stopColor="#D45D3B" />
                <stop offset="100%" stopColor="#7F2F18" />
              </radialGradient>
              <filter id="orbGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="5" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>
            {/* Ambient Back Glow */}
            <circle cx="50" cy="50" r="32" fill="#D45D3B" opacity="0.4" filter="url(#orbGlow)" />
            {/* The Main 3D Sphere */}
            <circle cx="50" cy="50" r="28" fill="url(#rustOrbGrad)" />
            {/* Glossy highlight */}
            <ellipse cx="40" cy="38" rx="10" ry="6" fill="#FFFFFF" opacity="0.6" transform="rotate(-30, 40, 38)" />
            {/* Subtler secondary soft bounce highlight */}
            <ellipse cx="60" cy="62" rx="8" ry="4" fill="#FFA07A" opacity="0.3" />
          </svg>
        )}

        {floatingAsset === "lightbulb" && (
          <svg width="56" height="56" viewBox="0 0 100 100" className="drop-shadow-lg filter drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]">
            <defs>
              <linearGradient id="bulbGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FBBF24" />
                <stop offset="100%" stopColor="#D97706" />
              </linearGradient>
            </defs>
            {/* Electric Rays */}
            <line x1="50" y1="12" x2="50" y2="2" stroke="#FBBF24" strokeWidth="4" strokeLinecap="round" />
            <line x1="20" y1="30" x2="10" y2="24" stroke="#FBBF24" strokeWidth="4" strokeLinecap="round" />
            <line x1="80" y1="30" x2="90" y2="24" stroke="#FBBF24" strokeWidth="4" strokeLinecap="round" />
            <line x1="25" y1="65" x2="15" y2="70" stroke="#FBBF24" strokeWidth="4" strokeLinecap="round" />
            <line x1="75" y1="65" x2="85" y2="70" stroke="#FBBF24" strokeWidth="4" strokeLinecap="round" />
            
            {/* Bulb Base */}
            <path d="M40 72 h20 v6 H40 z" fill="#94A3B8" />
            <path d="M44 78 h12 v4 H44 z" fill="#64748B" />
            <path d="M48 82 h4 v3 H48 z" fill="#475569" />
            
            {/* Glass Body */}
            <path 
              d="M32 45 C32 30, 68 30, 68 45 C68 56, 58 62, 58 72 H42 C42 62, 32 56, 32 45 Z" 
              fill="url(#bulbGrad)" 
              stroke="#FFF" 
              strokeWidth="1.5"
            />
            {/* Inside filament glowing */}
            <path d="M 45 60 L 48 48 L 52 48 L 55 60" fill="none" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />
          </svg>
        )}

        {floatingAsset === "opened-book" && (
          <svg width="56" height="56" viewBox="0 0 100 100" className="drop-shadow-lg">
            {/* Cover */}
            <path d="M15 65 L48 75 L52 75 L85 65 L80 18 L50 28 L20 18 Z" fill="#D45D3B" />
            {/* Pages Right */}
            <path d="M50 28 C55 25, 75 16, 78 20 L78 63 L50 72 Z" fill="#FAFAF9" />
            {/* Pages Left */}
            <path d="M50 28 C45 25, 25 16, 22 20 L22 63 L50 72 Z" fill="#F5F5F4" />
            {/* Binding Center spine */}
            <line x1="50" y1="28" x2="50" y2="72" stroke="#7F2F18" strokeWidth="3" />
            {/* Page lines list */}
            <path d="M28 32 h12 M28 42 h14 M28 52 h12" stroke="#CCCCCC" strokeWidth="2" strokeLinecap="round" />
            <path d="M58 32 h12 M58 42 h14 M58 52 h10" stroke="#CCCCCC" strokeWidth="2" strokeLinecap="round" />
          </svg>
        )}

        {floatingAsset === "code-brackets" && (
          <div className="bg-slate-900 border border-emerald-500 rounded-md px-2 py-1 text-emerald-400 font-mono text-[10px] whitespace-nowrap shadow-md tracking-wider flex items-center space-x-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>{"</>"} AEI.init()</span>
          </div>
        )}

        {floatingAsset === "gear" && (
          <svg 
            width="52" 
            height="52" 
            viewBox="0 0 100 100" 
            className="drop-shadow-lg"
            style={{ animation: "aeivo-spin 8s linear infinite" }}
          >
            <circle cx="50" cy="50" r="16" fill="none" stroke="#D45D3B" strokeWidth="8" />
            {/* Gear teeth */}
            {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
              <rect
                key={angle}
                x="45"
                y="14"
                width="10"
                height="15"
                rx="2"
                fill="#D45D3B"
                transform={`rotate(${angle}, 50, 50)`}
              />
            ))}
            <circle cx="50" cy="50" r="8" fill="#F8F6F0" />
          </svg>
        )}
      </div>

      {/* Main mascot character container */}
      <svg
        width="180"
        height="180"
        viewBox="0 0 200 200"
        className="overflow-visible"
        id="character-svg"
      >
        <defs>
          {/* Body Radial 3D-Like Metallic Shading */}
          <radialGradient id="mascotBody" cx="45%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#4A4F5C" />
            <stop offset="60%" stopColor="#282C35" />
            <stop offset="100%" stopColor="#15171C" />
          </radialGradient>

          {/* Glowing Eye Iris Gradient */}
          <radialGradient id="mascotIris" cx="45%" cy="45%" r="55%">
            <stop offset="0%" stopColor="#38BDF8" />
            <stop offset="50%" stopColor="#0EA5E9" />
            <stop offset="85%" stopColor="#0284C7" />
            <stop offset="100%" stopColor="#0369A1" />
          </radialGradient>

          {/* Shadow Filter for eyeball pop */}
          <filter id="softShadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="4" stdDeviation="3" floodOpacity="0.45" />
          </filter>
        </defs>

        {/* --- LEGS --- */}
        <g id="legs">
          {/* Left Leg */}
          <path
            d="M 75 162 C 75 185, 65 185, 65 188 C 65 192, 78 192, 85 188 C 85 183, 87 165, 87 162 Z"
            fill="#1E2026"
          />
          {/* Right Leg */}
          <path
            d="M 125 162 C 125 185, 135 185, 135 188 C 135 192, 122 192, 115 188 C 115 183, 113 165, 113 162 Z"
            fill="#1E2026"
          />
        </g>

        {/* --- ARMS & WEAPONS/UTILITIES --- */}
        <g id="arms">
          {/* Left Arm waving (Welcome posture) */}
          {expression === "excited" ? (
            <path
              d="M 62 135 C 45 130, 25 105, 23 90 C 20 83, 30 75, 33 82 C 37 92, 50 115, 61 122 Z"
              fill="#1E2026"
            />
          ) : (
            /* Left Arm Standard relaxed */
            <path
              d="M 64 125 C 45 135, 42 145, 40 152 C 38 158, 48 162, 53 155 C 57 148, 60 138, 64 130 Z"
              fill="#1E2026"
            />
          )}

          {/* Right Arm (Dynamic posture: holding pen/laptop) */}
          {showLaptop ? (
            /* Typing on laptop posture */
            <path
              d="M 136 125 C 150 130, 155 138, 142 146 C 136 150, 130 142, 128 135 Z"
              fill="#1E2026"
            />
          ) : holdingPen ? (
            /* Holding modern orange stylus pen */
            <g>
              {/* Pen Line */}
              <line x1="145" y1="110" x2="165" y2="135" stroke="#D45D3B" strokeWidth="5" strokeLinecap="round" />
              <circle cx="165" cy="135" r="3.5" fill="#CCCCCC" />
              {/* Arm extending to Pen */}
              <path
                d="M 136 125 C 150 120, 153 123, 148 132 C 143 140, 136 135, 136 125 Z"
                fill="#1E2026"
              />
            </g>
          ) : (
            /* Right Arm lecturing gesture (Pointing up) */
            expression === "lecturing" ? (
              <path
                d="M 136 125 C 150 120, 160 102, 165 92 C 170 85, 178 92, 171 100 C 163 112, 150 130, 136 135 Z"
                fill="#1E2026"
              />
            ) : (
              /* Right Arm Standard relaxed */
              <path
                d="M 136 125 C 155 135, 158 145, 160 152 C 162 158, 152 162, 147 155 C 143 148, 140 138, 136 130 Z"
                fill="#1E2026"
              />
            )
          )}
        </g>

        {/* --- MAIN CORE BODY (Sleek Rounded Triangle Mascot) --- */}
        <g id="body">
          <path
            d="M 100 24 
               C 108 24, 164 125, 172 138 
               C 180 151, 168 162, 145 162 
               L 55 162 
               C 32 162, 20 151, 28 138 
               C 36 125, 92 24, 100 24 Z"
            fill="url(#mascotBody)"
            stroke="#1C1E21"
            strokeWidth="3.5"
            className="transition-all duration-300"
          />
        </g>

        {/* --- THE SIGNATURE SINGLE BIG EYE --- */}
        <g id="the-pupil-eye" filter="url(#softShadow)">
          {/* Eyeball white circular boundary */}
          <circle cx="100" cy="85" r="32" fill="#FFFFFF" />

          {/* --- EYE LOOK VARIATION ENGINE --- */}
          {eyeLook === "standard" && (
            <>
              {/* Glowing blue Iris */}
              <circle cx="100" cy="85" r="21" fill="url(#mascotIris)" />
              {/* Inner deep black Pupil */}
              <circle cx="100" cy="85" r="10.5" fill="#1C1E21" />
              {/* Glossy Reflection dot */}
              <circle cx="95" cy="80" r="4.5" fill="#FFFFFF" />
              <circle cx="106" cy="90" r="2" fill="#FFFFFF" opacity="0.7" />
            </>
          )}

          {eyeLook === "wink" && (
            <>
              {/* Star-like wink sparkle */}
              <path
                d="M 100 68 L 100 102 M 83 85 L 117 85 M 88 73 L 112 97 M 88 97 L 112 73"
                stroke="#0EA5E9"
                strokeWidth="4"
                strokeLinecap="round"
              />
              <path
                d="M 100 75 L 100 95 M 90 85 L 110 85"
                stroke="#FFFFFF"
                strokeWidth="3.5"
                strokeLinecap="round"
              />
              <circle cx="100" cy="85" r="5" fill="#E05D3D" />
            </>
          )}

          {eyeLook === "reading" && (
            <>
              {/* Focused/Partially covered look */}
              <clipPath id="readingClip">
                <rect x="68" y="70" width="64" height="32" />
              </clipPath>
              <g clipPath="url(#readingClip)">
                <circle cx="100" cy="88" r="16" fill="url(#mascotIris)" />
                <circle cx="100" cy="88" r="8" fill="#1C1E21" />
                <circle cx="96" cy="84" r="3" fill="#FFFFFF" />
              </g>
              {/* Reading smart round glasses line */}
              <circle cx="85" cy="85" r="11" fill="none" stroke="#D45D3B" strokeWidth="2.5" />
              <circle cx="115" cy="85" r="11" fill="none" stroke="#D45D3B" strokeWidth="2.5" />
              <line x1="96" y1="85" x2="104" y2="85" stroke="#D45D3B" strokeWidth="2.5" />
            </>
          )}

          {eyeLook === "star" && (
            <>
              {/* High precision star iris and pupil */}
              <circle cx="100" cy="85" r="22" fill="url(#mascotIris)" />
              {/* Exploding star inner path */}
              <path
                d="M 100 68 L 104 81 L 117 81 L 107 89 L 110 102 L 100 93 L 90 102 L 93 89 L 83 81 L 96 81 Z"
                fill="#FFFFFF"
              />
              <circle cx="100" cy="85" r="6" fill="#1C1E21" />
            </>
          )}

          {eyeLook === "pixel" && (
            <>
              {/* Pixel block custom iris */}
              <rect x="84" y="69" width="32" height="32" rx="4" fill="#0EA5E9" />
              <rect x="91" y="76" width="18" height="18" fill="#0284C7" />
              {/* Glowing core square */}
              <rect x="95" y="80" width="10" height="10" fill="#FFFFFF" />
              {/* Small pixel sparkle */}
              <rect x="88" y="73" width="4" height="4" fill="#FFFFFF" />
            </>
          )}
        </g>

        {/* --- EYEBROWS (Gives high emotive leverage) --- */}
        <g id="eyebrows">
          {eyeLook !== "wink" && (
            expression === "thoughtful" || expression === "proud-smile" ? (
              /* Slanted modern smart eyebrows */
              <>
                <path
                  d="M 68 53 L 94 48"
                  stroke="#1C1E21"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
                <path
                  d="M 132 53 L 106 48"
                  stroke="#1C1E21"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
              </>
            ) : expression === "excited" ? (
              /* High arched, surprised curves */
              <>
                <path
                  d="M 70 48 Q 82 40 94 47"
                  fill="none"
                  stroke="#1C1E21"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
                <path
                  d="M 130 48 Q 118 40 106 47"
                  fill="none"
                  stroke="#1C1E21"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
              </>
            ) : (
              /* Standard flat level eyebrows */
              <>
                <line x1="72" y1="48" x2="94" y2="48" stroke="#1C1E21" strokeWidth="4" strokeLinecap="round" />
                <line x1="128" y1="48" x2="106" y2="48" stroke="#1C1E21" strokeWidth="4" strokeLinecap="round" />
              </>
            )
          )}
        </g>

        {/* --- MOUTHS (Slick curve renderer) --- */}
        <g id="mouth" className="transition-all duration-300">
          {expression === "knowing-smile" ? (
            /* Gentle satisfied curve showing simple confidence */
            <path
              d="M 88 128 Q 100 138 112 128"
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="4"
              strokeLinecap="round"
            />
          ) : expression === "proud-smile" ? (
            /* asymmetric side smile smirk */
            <path
              d="M 88 128 Q 103 138 115 125"
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="4"
              strokeLinecap="round"
            />
          ) : expression === "lecturing" ? (
            /* Speaking small circle of intelligence */
            <ellipse cx="100" cy="132" rx="7" ry="9" fill="#FFFFFF" stroke="#1C1E21" strokeWidth="1.5" />
          ) : expression === "excited" ? (
            /* Huge happy mouth crescent with teeth & tongue */
            <g>
              {/* Main open cavity */}
              <path
                d="M 84 126 L 116 126 C 116 142, 84 142, 84 126 Z"
                fill="#991B1B"
                stroke="#1C1E21"
                strokeWidth="1.5"
              />
              {/* Tongue */}
              <path
                d="M 92 135 Q 100 128 108 135 C 104 141, 96 141, 92 135 Z"
                fill="#FB7185"
              />
              {/* Top teeth line */}
              <line x1="86" y1="128" x2="114" y2="128" stroke="#FFFFFF" strokeWidth="2" />
            </g>
          ) : expression === "curious" ? (
            /* Medium circular questioning "O" shape */
            <circle cx="100" cy="132" r="7" fill="#FFFFFF" stroke="#1H1E21" strokeWidth="1" />
          ) : (
            /* pensive neutral line */
            <line x1="88" y1="130" x2="112" y2="130" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />
          )}
        </g>

        {/* --- LAPTOP ACCESORY (Overlaid if typing) --- */}
        {showLaptop && (
          <g id="accessory-laptop" transform="translate(118, 128)">
            {/* Screen */}
            <path d="M 12 5 L 44 5 L 44 26 L 12 26 Z" fill="#334155" stroke="#FFFFFF" strokeWidth="2" />
            {/* Coding block screen pixels */}
            <rect x="16" y="8" width="6" height="4" fill="#10B981" />
            <rect x="24" y="8" width="14" height="2" fill="#FBBF24" />
            <rect x="16" y="14" width="22" height="2" fill="#38BDF8" />
            <rect x="16" y="18" width="12" height="2" fill="#FFFFFF" />
            <rect x="30" y="18" width="8" height="2" fill="#10B981" />
            {/* Keyboard base */}
            <path d="M 5 26 L 51 26 L 56 34 L 0 34 Z" fill="#64748B" />
            <line x1="10" y1="31" x2="46" y2="31" stroke="#334155" strokeWidth="2" />
            {/* Intel Sparkle logo on keyboard base */}
            <line x1="4" y1="30" x2="6" y2="30" stroke="#10B981" />
          </g>
        )}
      </svg>
    </div>
  );
};
