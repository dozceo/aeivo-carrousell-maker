import React from "react";
import { Slide } from "../types";
import { AeivoCharacter } from "./AeivoCharacter";

interface SlidePreviewProps {
  slide: Slide;
  zoom?: number; // 0.1 to 1.0 (defaults to fits viewport)
  idPrefix?: string;
}

export const SlidePreview: React.FC<SlidePreviewProps> = ({
  slide,
  zoom = 0.5,
  idPrefix = "preview",
}) => {
  const { title, body, layout, theme, characterState, badgeText } = slide;

  // Resolve colors based on current slide theme
  let bgStyles = "bg-[#F8F6F0]"; // cream
  let titleColor = "text-[#1C1E21] font-sans";
  let bodyColor = "text-[#475569]/90 font-sans";
  let badgeStyles = "bg-[#EAE6DB] text-[#D45D3B]";
  let labelColor = "text-[#8E8B82]";
  let orbAccentColor = "#D45D3B";

  if (theme === "charcoal") {
    bgStyles = "bg-[#1C1E21]";
    titleColor = "text-[#F8F6F0] font-sans";
    bodyColor = "text-[#D1D5DB]/95 font-sans";
    badgeStyles = "bg-[#2D3035] text-[#FFA07A]";
    labelColor = "text-[#6B7280]";
    orbAccentColor = "#FFA07A";
  } else if (theme === "rust") {
    bgStyles = "bg-[#D45D3B]";
    titleColor = "text-[#FFFFFF] font-sans";
    bodyColor = "text-[#FFEBE6]/90 font-sans";
    badgeStyles = "bg-[#A73D21] text-[#FFFFFF]";
    labelColor = "text-[#FCD34D]";
    orbAccentColor = "#1C1E21";
  }

  return (
    <div
      className="relative overflow-hidden select-none flex-shrink-0 transition-transform shadow-2xl rounded-2xl bg-[#F8F6F0]"
      id={`${idPrefix}-${slide.id}`}
      style={{
        width: "1080px",
        height: "1080px",
        transform: `scale(${zoom})`,
        transformOrigin: "top left",
        transition: "background 0.4s ease",
      }}
    >
      {/* 1. Brand Background Orbs Pattern (Classic Glassmorphism) */}
      <div className={`absolute inset-0 ${bgStyles} transition-colors duration-300`}>
        {/* Soft Grid overlay for professional brand aesthetics */}
        <div 
          className="absolute inset-0 opacity-[0.03]" 
          style={{
            backgroundImage: "radial-gradient(#1c1e21 1.5px, transparent 1.5px)",
            backgroundSize: "24px 24px",
          }}
        />

        {/* Ambient Decorative Rust Glowing Orbs in the workspace */}
        <div 
          className="absolute rounded-full pointer-events-none filter blur-[120px]"
          style={{
            width: "360px",
            height: "360px",
            background: orbAccentColor,
            opacity: theme === "cream" ? 0.08 : 0.15,
            top: "10%",
            left: "5%",
          }}
        />
        <div 
          className="absolute rounded-full pointer-events-none filter blur-[140px]"
          style={{
            width: "420px",
            height: "420px",
            background: theme === "rust" ? "#FF8C00" : "#D45D3B",
            opacity: theme === "cream" ? 0.06 : 0.12,
            bottom: "8%",
            right: "10%",
          }}
        />
      </div>

      {/* 2. Top Navigation Bar (Watermark & Slide Number) */}
      <div className="absolute top-[64px] left-[64px] right-[64px] flex justify-between items-center z-10">
        {/* Brand Logo Watermark */}
        <div className="flex items-center space-x-2.5">
          {/* Logo vector icon */}
          <div className="w-9 h-9 rounded-lg bg-[#D45D3B] flex items-center justify-center font-bold text-white text-lg tracking-tighter">
            A
          </div>
          <span className={`text-[20px] font-semibold tracking-wider ${theme === "charcoal" ? "text-white" : theme === "rust" ? "text-white" : "text-[#1C1E21]"}`}>
            ae <span className="text-[#D45D3B] logo-accent-dot">i</span> vo
          </span>
        </div>

        {/* Dynamic Section Indicator Badge */}
        {badgeText && (
          <div className={`px-4 py-1.5 rounded-full text-[14px] font-mono tracking-widest uppercase font-medium shadow-sm transition-colors ${badgeStyles}`}>
            {badgeText}
          </div>
        )}
      </div>

      {/* 3. Core Layout Structure (1080x1080 canvas coordinates) */}
      <div className="absolute top-[160px] left-[64px] right-[64px] bottom-[100px] flex flex-col justify-between">
        
        {/* --- INTRO PLAYBOOK LAYOUT --- */}
        {layout === "intro" && (
          <div className="flex-1 flex flex-col justify-center pr-[120px] pb-10">
            {/* Visual Header Accented Border Bar */}
            <div className="w-20 h-2 bg-[#D45D3B] rounded-full mb-6" />
            <h1 className={`text-[68px] font-extrabold leading-[1.12] tracking-tight mb-8 ${titleColor} max-w-[850px] whitespace-pre-wrap`}>
              {title}
            </h1>
            <p className={`text-[28px] leading-[1.6] max-w-[700px] ${bodyColor} whitespace-pre-wrap`}>
              {body}
            </p>
          </div>
        )}

        {/* --- SIDE BY SIDE PRODUCT PREVIEW --- */}
        {layout === "side-by-side" && (
          <div className="flex-1 flex flex-col justify-center max-w-[620px] pb-12">
            <h2 className={`text-[46px] font-bold leading-[1.2] tracking-tight mb-6 ${titleColor} whitespace-pre-wrap`}>
              {title}
            </h2>
            <p className={`text-[26px] leading-[1.65] ${bodyColor} whitespace-pre-wrap`}>
              {body}
            </p>
          </div>
        )}

        {/* --- BULLET POINT HIGHLIGHTS --- */}
        {layout === "bullets" && (
          <div className="flex-1 flex flex-col justify-start pt-10 max-w-[640px]">
            <h2 className={`text-[44px] font-bold tracking-tight mb-8 ${titleColor} whitespace-pre-wrap`}>
              {title}
            </h2>
            <div className="space-y-6">
              {body.split("\n").filter(b => b.trim()).map((bullet, idx) => (
                <div key={idx} className="flex items-start space-x-4">
                  {/* Styled List Dot Indicator */}
                  <div className="mt-2.5 w-4 h-4 rounded-full flex-shrink-0 bg-[#D45D3B]" />
                  <p className={`text-[24px] leading-relaxed font-medium ${bodyColor}`}>
                    {bullet.replace(/^-\s*/, "")}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- CHARACTER SPOTLIGHT MEME / QUOTE --- */}
        {layout === "spotlight" && (
          <div className="flex-1 flex flex-col items-center justify-center pt-8 pb-10 select-text">
            {/* Elegant speech pill */}
            <div className={`relative px-8 py-6 rounded-2xl max-w-[750px] text-center border shadow-lg ${theme === "charcoal" ? "bg-[#272B30] border-slate-700" : theme === "rust" ? "bg-[#B44B2E] border-[#A23719]" : "bg-white border-[#E9E4DC]"} mb-12`}>
              <p className={`text-[28px] font-semibold leading-relaxed ${titleColor}`}>
                "{title}"
              </p>
              {/* Triangular arrow anchor */}
              <div 
                className="absolute left-1/2 -bottom-4 w-6 h-6 transform -translate-x-1/2 rotate-45 border-r border-b"
                style={{
                  backgroundColor: theme === "charcoal" ? "#272B30" : theme === "rust" ? "#B44B2E" : "#FFFFFF",
                  borderColor: theme === "charcoal" ? "#334155" : theme === "rust" ? "#A23719" : "#E9E4DC"
                }}
              />
            </div>
            {/* Explanatory subtitle */}
            <p className={`text-[24px] max-w-[620px] text-center leading-relaxed ${bodyColor}`}>
              {body}
            </p>
          </div>
        )}

        {/* --- CTA CONCLUSION ENDSLIDE --- */}
        {layout === "cta" && (
          <div className="flex-1 flex flex-col justify-center items-center text-center px-10 pb-8">
            <span className="text-[#D45D3B] text-[16px] font-mono tracking-widest uppercase font-bold mb-4">
              Join Sankalp AEI
            </span>
            <h1 className={`text-[62px] font-extrabold leading-[1.15] tracking-tight mb-8 ${titleColor} max-w-[850px] whitespace-pre-wrap`}>
              {title}
            </h1>
            <p className={`text-[26px] leading-[1.6] max-w-[650px] mb-12 ${bodyColor} whitespace-pre-wrap`}>
              {body}
            </p>
            
            {/* CTA High Fidelity Button */}
            <div className="px-8 py-4 bg-[#D45D3B] hover:bg-[#C24E2E] text-white rounded-full font-sans text-[20px] font-bold shadow-lg flex items-center space-x-3 cursor-pointer">
              <span>Explore aeivo.ai</span>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </div>
          </div>
        )}

        {/* --- BRAND FOOTER SLIDE ACCENTS --- */}
        <div className="flex justify-between items-center pt-8 border-t border-[#1C1E21]/10 opacity-70">
          <div className="flex items-center space-x-3">
            <span className={`text-[12px] font-mono tracking-widest ${labelColor}`}>
              SANKALP AEI © 2026
            </span>
            <div className={`w-1.5 h-1.5 rounded-full ${theme === "rust" ? "bg-white" : "bg-[#D45D3B]"}`} />
            <span className={`text-[12px] font-mono tracking-wider ${labelColor}`}>
              EDUCATIONAL INTELLIGENCE
            </span>
          </div>
          
          {/* Progress dots at base representing page number */}
          <div className="flex items-center space-x-2">
            {[1, 2, 3, 4, 5, 6].map((idx) => (
              <div 
                key={idx} 
                className={`w-2.5 h-2.5 rounded-full ${idx === slide.slideNumber ? "bg-[#D45D3B] scale-125" : "bg-[#1c1e21]/20"}`} 
              />
            ))}
          </div>
        </div>
      </div>

      {/* 4. Brand Character Vector Render Engine Placement */}
      {/* Positioned dynamically on the slide coordinate stage area */}
      {layout !== "spotlight" && layout !== "cta" && (
        <div
          className="absolute z-10 transition-all duration-500"
          style={{
            left: `${characterState.positionX}%`,
            top: `${characterState.positionY}%`,
            width: "360px",
            height: "360px",
            transform: "translate(-50%, -50%)",
          }}
        >
          <AeivoCharacter state={characterState} width={360} height={360} />
        </div>
      )}

      {/* CTA Layout places mascot on bottom center */}
      {layout === "cta" && (
        <div
          className="absolute z-10"
          style={{
            left: "82%",
            top: "70%",
            width: "280px",
            height: "280px",
            transform: "translate(-50%, -50%)",
          }}
        >
          <AeivoCharacter state={{ ...characterState, expression: "excited", floatingAsset: "rust-orb" }} width={280} height={280} />
        </div>
      )}
    </div>
  );
};
