import React, { useState, useEffect } from "react";
import { Slide, SlideLayout, SlideTheme, CharacterState } from "./types";
import { DEFAULT_SLIDES } from "./presetData";
import { SlidePreview } from "./components/SlidePreview";
import { 
  Sparkles, 
  Plus, 
  Trash2, 
  Copy, 
  ArrowUp, 
  ArrowDown, 
  Download, 
  Upload, 
  Play, 
  HelpCircle, 
  RefreshCw, 
  Layout, 
  Sliders, 
  Monitor, 
  Briefcase,
  ExternalLink,
  Check,
  AlertCircle
} from "lucide-react";

export default function App() {
  // 1. Core State persistence
  const [slides, setSlides] = useState<Slide[]>(() => {
    const saved = localStorage.getItem("aeivo_carousel_slides");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return DEFAULT_SLIDES;
  });

  const [activeSlideId, setActiveSlideId] = useState<string>(slides[0]?.id || "aeivo-s1");
  const [zoomRatio, setZoomRatio] = useState<number>(0.55); // fits beautifully on standard screens
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [showHelp, setShowHelp] = useState<boolean>(false);
  const [exportNotification, setExportNotification] = useState<string | null>(null);

  // Auto-save to local storage
  useEffect(() => {
    localStorage.setItem("aeivo_carousel_slides", JSON.stringify(slides));
  }, [slides]);

  // Find active slide object
  const activeSlide = slides.find(s => s.id === activeSlideId) || slides[0];

  // 2. State Mutators
  const updateActiveSlide = (fields: Partial<Slide>) => {
    setSlides(prev => prev.map(s => s.id === activeSlideId ? { ...s, ...fields } : s));
  };

  const updateCharacterState = (fields: Partial<CharacterState>) => {
    if (!activeSlide) return;
    updateActiveSlide({
      characterState: {
        ...activeSlide.characterState,
        ...fields
      }
    });
  };

  const handleAddSlide = () => {
    const newId = `slide-${Date.now()}`;
    const newSlide: Slide = {
      id: newId,
      title: "New Insight Title",
      body: "Write high impact details about student cognitive inputs here.",
      slideNumber: slides.length + 1,
      layout: "side-by-side",
      theme: "cream",
      badgeText: `Aeivo Analytics • ${slides.length + 1}`,
      accentOrbColor: "#D45D3B",
      characterState: {
        expression: "curious",
        eyeLook: "standard",
        floatingAsset: "rust-orb",
        showLaptop: false,
        holdingPen: false,
        positionX: 75,
        positionY: 50,
        scale: 1.1
      }
    };
    const updated = [...slides, newSlide];
    reindexSlides(updated);
    setActiveSlideId(newId);
  };

  const handleDuplicateSlide = (slide: Slide) => {
    const newId = `duplicate-${Date.now()}`;
    const dupSlide: Slide = {
      ...slide,
      id: newId,
      title: `${slide.title} (Copy)`,
    };
    const idx = slides.findIndex(s => s.id === slide.id);
    const updated = [...slides];
    updated.splice(idx + 1, 0, dupSlide);
    reindexSlides(updated);
    setActiveSlideId(newId);
  };

  const handleDeleteSlide = (id: string) => {
    if (slides.length <= 1) {
      alert("AI Studio Carousel Builder requires at least 1 slide!");
      return;
    }
    const idx = slides.findIndex(s => s.id === id);
    let newActiveId = activeSlideId;
    if (id === activeSlideId) {
      newActiveId = slides[idx === 0 ? 1 : idx - 1].id;
    }
    const updated = slides.filter(s => s.id !== id);
    reindexSlides(updated);
    setSlides(updated);
    setActiveSlideId(newActiveId);
  };

  const handleMoveSlide = (idx: number, direction: "up" | "down") => {
    if (direction === "up" && idx === 0) return;
    if (direction === "down" && idx === slides.length - 1) return;
    
    const targetIdx = direction === "up" ? idx - 1 : idx + 1;
    const updated = [...slides];
    const temp = updated[idx];
    updated[idx] = updated[targetIdx];
    updated[targetIdx] = temp;
    
    reindexSlides(updated);
  };

  const reindexSlides = (list: Slide[]) => {
    const reindexed = list.map((item, index) => ({
      ...item,
      slideNumber: index + 1,
      badgeText: item.badgeText.includes("•") 
        ? `${item.badgeText.split("•")[0].trim()} • 0${index + 1}`
        : item.badgeText
    }));
    setSlides(reindexed);
  };

  const handleResetToPreset = () => {
    if (confirm("Are you sure you want to revert to the default Aeivo Brand Playbook slides? You will lose any unsaved content.")) {
      setSlides(DEFAULT_SLIDES);
      setActiveSlideId(DEFAULT_SLIDES[0].id);
    }
  };

  // 3. Gemini Educational Polisher Proxy
  const handleAiRefinement = async (mode: string) => {
    if (!activeSlide) return;
    setAiLoading(true);
    setAiError(null);

    try {
      const response = await fetch("/api/gemini/refine", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          title: activeSlide.title,
          body: activeSlide.body,
          mode,
          slideNumber: activeSlide.slideNumber,
          totalSlides: slides.length
        })
      });

      if (!response.ok) {
        throw new Error("Unable to connect with Aeivo AI engine right now. Please check your secrets configurations.");
      }

      const refined = await response.json();
      if (refined.title || refined.body) {
        updateActiveSlide({
          title: refined.title || activeSlide.title,
          body: refined.body || activeSlide.body
        });
        showNotification("Sparkled! Academic text optimized by Aeivo AI.");
      }
    } catch (err: any) {
      console.error(err);
      setAiError(err.message || "Something went wrong during refinement.");
    } finally {
      setAiLoading(false);
    }
  };

  // Helper flash notification feedback
  const showNotification = (msg: string) => {
    setExportNotification(msg);
    setTimeout(() => {
      setExportNotification(null);
    }, 4000);
  };

  // 4. Client Side Exporter
  const handleExportJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(slides, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "aeivo_carousel_config.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showNotification("Brand config exported successfully!");
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].id) {
          reindexSlides(parsed);
          setActiveSlideId(parsed[0].id);
          showNotification("Custom deck imported and live!");
        } else {
          alert("Invalid file structure. Make sure you load a valid Aeivo backup JSON file.");
        }
      } catch (err) {
        alert("Unable to parse config file.");
      }
    };
    reader.readAsText(file);
  };

  // Download slide as beautiful SVG
  const handleDownloadSvg = () => {
    if (!activeSlide) return;
    const element = document.getElementById(`preview-${activeSlide.id}`);
    if (!element) return;

    // We can extract SVG directly since everything except minor structures are SVG layouts!
    // Simply fetch the elements styling and serialize them cleanly.
    // SVG representation of the graphic makes it incredibly polished.
    // Let's serialize the DOM element directly as structured XML.
    const rawHtml = element.outerHTML;
    // Embed styling safely
    const svgWrapper = `
      <svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1080" viewBox="0 0 1080 1080">
        <foreignObject width="100%" height="100%">
          <div xmlns="http://www.w3.org/1999/xhtml">
            <style>
              @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&amp;display=swap');
              @import url('https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css');
              div { font-family: 'Inter', sans-serif !important; }
            </style>
            ${rawHtml}
          </div>
        </foreignObject>
      </svg>
    `;

    const blob = new Blob([svgWrapper], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const downloadAnchor = document.createElement("a");
    downloadAnchor.href = url;
    downloadAnchor.download = `aeivo_slide_0${activeSlide.slideNumber}.svg`;
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showNotification("Vector SVG Slide exported! Crisp at 1080x1080.");
  };

  const triggerWindowPrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-[#F0EFEA] text-[#1C1E21] flex flex-col font-sans transition-colors selection:bg-[#D45D3B]/20 selection:text-[#D45D3B]">
      
      {/* 1. BRAND GLOBAL TOPBAR */}
      <header className="bg-white border-b border-[#E3E0D8] px-6 py-4 flex items-center justify-between shadow-sm shrink-0 z-20">
        <div className="flex items-center space-x-4">
          <div className="relative w-10 h-10 rounded-xl bg-[#D45D3B] flex items-center justify-center font-bold text-white text-xl tracking-tighter shadow-md">
            A
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full flex items-center justify-center p-0.5">
              <div className="w-1.5 h-1.5 bg-[#0EA5E9] rounded-full" />
            </div>
          </div>
          <div>
            <h1 className="text-lg font-extrabold tracking-tight flex items-center space-x-1.5">
              <span>Aeivo Carousel Maker</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-[#F3ECE0] text-[#D45D3B] font-mono tracking-wider font-bold">PRO</span>
            </h1>
            <p className="text-xs text-[#8E8B82] font-mono">
              Educational Intelligence Brand Engine • Sankalp AEI 
            </p>
          </div>
        </div>

        {/* Global Toolbar */}
        <div className="flex items-center space-x-3">
          {/* Quick instructions toggle */}
          <button
            onClick={() => setShowHelp(!showHelp)}
            className="p-2 text-[#64748B] hover:text-[#1C1E20] hover:bg-[#F3ECE0]/50 rounded-lg transition-colors cursor-pointer"
            title="Help Manual"
          >
            <HelpCircle size={20} />
          </button>

          {/* Preset trigger */}
          <button
            onClick={handleResetToPreset}
            className="px-3.5 py-1.5 border border-[#D1CDCE] bg-white hover:bg-[#FAF8F5] text-[13px] font-medium rounded-lg flex items-center space-x-1.5 transition-colors cursor-pointer"
            title="Revert modifications to original Sankalp playbooks"
          >
            <RefreshCw size={14} className="text-[#8E8B82]" />
            <span>Reset Demo Playbook</span>
          </button>

          <div className="h-6 w-px bg-[#E3E0D8]" />

          {/* Backup Import File Trigger */}
          <label className="px-3 py-1.5 border border-[#D1CDCE] bg-white hover:bg-[#FAF8F5] text-[13px] font-medium rounded-lg flex items-center space-x-1.5 transition-colors cursor-pointer relative">
            <Upload size={14} className="text-[#8E8B82]" />
            <span>Load JSON Deck</span>
            <input 
              type="file" 
              accept=".json" 
              onChange={handleImportJson} 
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" 
            />
          </label>

          {/* Backup Export */}
          <button
            onClick={handleExportJson}
            className="px-3 py-1.5 border border-[#D1CDCE] bg-[#FFA07A]/10 hover:bg-[#FFA07A]/20 text-[#6F4E37] text-[13px] font-bold rounded-lg flex items-center space-x-1.5 transition-colors cursor-pointer"
          >
            <Download size={14} />
            <span>Backup Config JSON</span>
          </button>

          {/* Standard pdf export helper */}
          <button
            onClick={triggerWindowPrint}
            className="px-4 py-1.5 bg-[#1C1E21] text-[#F8F6F0] hover:bg-slate-800 text-[13px] font-bold rounded-lg flex items-center space-x-1.5 tracking-wide shadow-md cursor-pointer transition-transform duration-150 active:scale-95"
          >
            <Play size={14} className="fill-[#F8F6F0]" />
            <span>Present &amp; Print PDF</span>
          </button>
        </div>
      </header>

      {/* Main Workspace Body Wrapper */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* --- 2. LEFT SIDEBAR: TIMELINE DECK NAVIGATOR --- */}
        <aside className="w-80 border-r border-[#E3E0D8] bg-[#F7F5F0] flex flex-col justify-between shrink-0 select-none z-10">
          <div className="p-4 border-b border-[#E3E0D8] bg-white flex justify-between items-center shrink-0">
            <span className="text-xs font-mono font-bold tracking-widest text-[#8E8B82] uppercase">
              Deck Navigation ({slides.length} slides)
            </span>
            <button
              onClick={handleAddSlide}
              className="p-1.5 bg-[#D45D3B] hover:bg-[#B44C2F] text-white rounded-lg flex items-center space-x-1 transition-transform active:scale-95 text-xs font-bold font-sans cursor-pointer shadow-sm"
              title="Add clean slide page"
            >
              <Plus size={14} />
              <span>Add Slide</span>
            </button>
          </div>

          {/* Slide List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {slides.map((slide, index) => {
              const isActive = slide.id === activeSlideId;
              return (
                <div
                  key={slide.id}
                  onClick={() => setActiveSlideId(slide.id)}
                  className={`group relative p-3 rounded-xl border flex flex-col transition-all cursor-pointer ${
                    isActive 
                      ? "bg-white border-[#D45D3B] shadow-md ring-1 ring-[#D45D3B]" 
                      : "bg-[#FAFAF9]/80 border-[#E5E2DB] hover:bg-white hover:border-[#8E8B82]"
                  }`}
                >
                  {/* Handle bar with controls */}
                  <div className="flex justify-between items-center mb-2 font-mono">
                    <span className="text-[11px] font-extrabold text-[#D45D3B]">
                      PAGE 0{slide.slideNumber}
                    </span>
                    
                    {/* Action buttons on slide container */}
                    <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleMoveSlide(index, "up"); }}
                        disabled={index === 0}
                        className="p-0.5 text-gray-500 hover:text-black rounded bg-slate-100/60 disabled:opacity-30"
                      >
                        <ArrowUp size={12} />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleMoveSlide(index, "down"); }}
                        disabled={index === slides.length - 1}
                        className="p-0.5 text-gray-500 hover:text-black rounded bg-slate-100/60 disabled:opacity-30"
                      >
                        <ArrowDown size={12} />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDuplicateSlide(slide); }}
                        className="p-0.5 text-blue-600 hover:text-blue-800 rounded bg-blue-50"
                        title="Duplicate slide State"
                      >
                        <Copy size={12} />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDeleteSlide(slide.id); }}
                        className="p-0.5 text-red-600 hover:text-red-800 rounded bg-red-50"
                        title="Delete Slide"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>

                  {/* Thumbnail snippet */}
                  <div className="text-xs font-bold line-clamp-1 mb-1 text-slate-800">
                    {slide.title || "(Untitled Slide)"}
                  </div>
                  <div className="text-[10px] text-gray-500 line-clamp-2 leading-relaxed">
                    {slide.body || "No slide subtext added."}
                  </div>

                  {/* Icon representations of styles */}
                  <div className="mt-2.5 pt-2 border-t border-dashed border-[#E3E0D8] flex items-center justify-between text-[9px] font-mono text-[#8E8B82]">
                    <span className="uppercase text-[8px] bg-slate-200/50 px-1.5 py-0.5 rounded text-slate-700">
                      {slide.layout}
                    </span>
                    <span className="flex items-center space-x-1">
                      <span className="w-2 h-2 rounded-full border border-slate-300" style={{ backgroundColor: slide.theme === "cream" ? "#F8F6F0" : slide.theme === "charcoal" ? "#1C1E21" : "#D45D3B" }} />
                      <span className="capitalize">{slide.theme}</span>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Instruction manual hint footer */}
          <div className="p-4 bg-white border-t border-[#E3E0D8] text-[11px] leading-relaxed text-[#6E6C68] space-y-1">
            <div className="font-bold flex items-center space-x-1 text-[#D45D3B]">
              <Monitor size={12} />
              <span>Canvas Preset Viewport</span>
            </div>
            <p>Every page is maintained at exactly 1080x1080px for social platform delivery.</p>
          </div>
        </aside>

        {/* --- 3. CENTER VIEWPORT: THE LIVE GRAPHICS EDITOR STAGE --- */}
        <main className="flex-1 bg-[#ECEAE3] flex flex-col overflow-hidden relative p-8">
          
          {/* Zoom Adjust and slide indicator banner */}
          <div className="flex justify-between items-center mb-4 bg-white/70 backdrop-blur-md px-4 py-2.5 rounded-xl border border-[#E1DED5] select-none shadow-sm z-10 shrink-0">
            <div className="flex items-center space-x-3 text-xs font-bold">
              <span className="text-[#8E8B82] font-mono">ACTIVE SLIDE CONFIGURATION:</span>
              <span className="bg-[#D45D3B] text-white px-2.5 py-0.5 rounded-full font-mono">
                {activeSlide?.slideNumber} of {slides.length}
              </span>
              <span className="text-gray-500 capitalize">{activeSlide?.layout} model layout</span>
            </div>

            {/* Quick scale controls */}
            <div className="flex items-center space-x-2">
              <span className="text-[11px] font-mono text-gray-500 font-bold">Zoom Stage:</span>
              <input 
                type="range" 
                min="0.3" 
                max="0.85" 
                step="0.05"
                value={zoomRatio}
                onChange={(e) => setZoomRatio(parseFloat(e.target.value))}
                className="w-24 accent-[#D45D3B] cursor-pointer"
              />
              <span className="text-xs font-mono font-bold w-12 text-right">
                {Math.round(zoomRatio * 100)}%
              </span>
            </div>
          </div>

          {/* Interactive Slide Drawing board stage */}
          <div className="flex-1 overflow-auto flex items-start justify-center pt-4 pb-20 scrollbar-thin">
            <div 
              className="relative transition-shadow duration-300"
              style={{
                width: `${1080 * zoomRatio}px`,
                height: `${1080 * zoomRatio}px`,
              }}
            >
              {/* Dynamic live rendering of Slide Layout and SVG character state! */}
              <SlidePreview 
                slide={activeSlide} 
                zoom={zoomRatio} 
                idPrefix="preview" 
              />
            </div>
          </div>

          {/* Static hidden area for highDPI compilation or Printing output */}
          <div id="print-area" className="hidden">
            {slides.map(s => (
              <div key={`print-${s.id}`} className="slide-print-element mb-10 border shadow-md">
                <SlidePreview slide={s} zoom={1.0} idPrefix="print" />
              </div>
            ))}
          </div>

          {/* Notification banner */}
          {exportNotification && (
            <div className="absolute bottom-6 right-6 z-50 bg-[#1C1E21] text-white border border-slate-700 font-mono text-xs font-bold px-4 py-3 rounded-lg shadow-2xl flex items-center space-x-2.5 animate-bounce">
              <Check size={16} className="text-emerald-400 stroke-[3]" />
              <span>{exportNotification}</span>
            </div>
          )}
        </main>

        {/* --- 4. RIGHT SIDEBAR: BRAND INSPECTOR & STATE CONFIGURATION ENGINE --- */}
        <aside className="w-[430px] border-l border-[#E3E0D8] bg-white flex flex-col justify-between shrink-0 overflow-y-auto z-10 pb-8">
          
          {/* Section 1: Slide Copy Inspector */}
          <div className="p-6 border-b border-[#F0EFEA] space-y-4">
            <div className="flex items-center space-x-2 border-b border-gray-100 pb-2">
              <Layout size={16} className="text-[#D45D3B]" />
              <h3 className="text-sm font-extrabold tracking-wider font-mono text-gray-500 uppercase">
                Content &amp; Typographical Copy
              </h3>
            </div>

            <div>
              <label className="block text-[11px] font-bold font-mono text-gray-400 uppercase tracking-wider mb-1.5">
                Decorative Badge Text
              </label>
              <input 
                type="text" 
                value={activeSlide.badgeText}
                onChange={(e) => updateActiveSlide({ badgeText: e.target.value })}
                className="w-full px-3 py-2 bg-[#FAFAF9] border border-[#E3E0D8] rounded-lg text-xs font-medium focus:ring-1 focus:ring-[#D45D3B] focus:outline-none transition-all placeholder:text-gray-300"
                placeholder="e.g. Cognitive Load Limits"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold font-mono text-gray-400 uppercase tracking-wider mb-1.5">
                Slide Display Title
              </label>
              <textarea 
                rows={2}
                value={activeSlide.title}
                onChange={(e) => updateActiveSlide({ title: e.target.value })}
                className="w-full px-3 py-2 bg-[#FAFAF9] border border-[#E3E0D8] rounded-lg text-xs font-bold tracking-tight focus:ring-1 focus:ring-[#D45D3B] focus:outline-none transition-all leading-relaxed"
                placeholder="Make your slide hook..."
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold font-mono text-gray-400 uppercase tracking-wider mb-1.5">
                Slide Body / Bullets Copy
              </label>
              <textarea 
                rows={4}
                value={activeSlide.body}
                onChange={(e) => updateActiveSlide({ body: e.target.value })}
                className="w-full px-3 py-2 bg-[#FAFAF9] border border-[#E3E0D8] rounded-lg text-xs font-medium leading-relaxed focus:ring-1 focus:ring-[#D45D3B] focus:outline-none transition-all"
                placeholder="Insert informative brand content here..."
              />
              <span className="text-[10px] text-gray-400 font-mono mt-1.5 block">
                *For 'bullets' layout, separate statements onto lines.
              </span>
            </div>

            {/* AI Optimization section utilizing server proxy Gemini endpoint */}
            <div className="bg-[#FAF8F5] border border-[#EAE6DB] rounded-xl p-4.5 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[11px] font-bold font-mono tracking-wider text-amber-800 flex items-center space-x-1">
                  <Sparkles size={12} className="fill-amber-300 text-amber-600 animate-pulse" />
                  <span>Aeivo Copilot Engine</span>
                </span>
                <span className="text-[9px] bg-amber-100 text-amber-700 font-bold px-1.5 py-0.5 rounded uppercase font-mono">
                  Gemini API Powered
                </span>
              </div>
              <p className="text-[11px] text-[#6E6C68] leading-relaxed">
                Refine academic metrics dynamically. Choose an AI rewriting state style below to customize text to fit beautifully.
              </p>

              {aiError && (
                <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg p-2 text-[10px] flex items-start space-x-1">
                  <AlertCircle size={12} className="shrink-0 mt-0.5" />
                  <span>{aiError}</span>
                </div>
              )}

              {/* Action grid */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleAiRefinement("punchy")}
                  disabled={aiLoading}
                  className="px-2.5 py-1.5 bg-white border border-[#EAE6DB] hover:border-amber-400 hover:bg-amber-50/20 disabled:opacity-50 text-[11px] font-bold rounded-lg flex items-center justify-center space-x-1 transition-all cursor-pointer"
                >
                  <span>⚡ Make Concise</span>
                </button>
                <button
                  onClick={() => handleAiRefinement("academic")}
                  disabled={aiLoading}
                  className="px-2.5 py-1.5 bg-white border border-[#EAE6DB] hover:border-amber-400 hover:bg-amber-50/20 disabled:opacity-50 text-[11px] font-bold rounded-lg flex items-center justify-center space-x-1 transition-all cursor-pointer"
                >
                  <span>🎓 Intellectual-AI</span>
                </button>
                <button
                  onClick={() => handleAiRefinement("hook")}
                  disabled={aiLoading}
                  className="px-2.5 py-1.5 bg-white border border-[#EAE6DB] hover:border-amber-400 hover:bg-amber-50/20 disabled:opacity-50 text-[11px] font-bold rounded-lg flex items-center justify-center space-x-1 transition-all cursor-pointer"
                >
                  <span>🔥 Capture Hook</span>
                </button>
                <button
                  onClick={() => handleAiRefinement("bullets")}
                  disabled={aiLoading}
                  className="px-2.5 py-1.5 bg-white border border-[#EAE6DB] hover:border-amber-400 hover:bg-amber-50/20 disabled:opacity-50 text-[11px] font-bold rounded-lg flex items-center justify-center space-x-1 transition-all cursor-pointer"
                >
                  <span>📝 Render Bullets</span>
                </button>
              </div>

              {aiLoading && (
                <div className="pt-2 flex items-center justify-center space-x-2 text-xs font-semibold text-amber-700">
                  <div className="w-3.5 h-3.5 border-2 border-amber-600 border-t-transparent rounded-full animate-spin" />
                  <span>Optimizing educational prose...</span>
                </div>
              )}
            </div>
          </div>

          {/* Section 2: Slide Look / Layout controls */}
          <div className="p-6 border-b border-gray-100 space-y-4">
            <div className="flex items-center space-x-2 border-b border-gray-100 pb-2">
              <Layout size={16} className="text-gray-400" />
              <h3 className="text-sm font-extrabold tracking-wider font-mono text-gray-500 uppercase">
                Slide Layout &amp; Theme Accents
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold font-mono text-gray-400 uppercase tracking-wider mb-1.5">
                  Visual Layout Style
                </label>
                <select
                  value={activeSlide.layout}
                  onChange={(e) => updateActiveSlide({ layout: e.target.value as SlideLayout })}
                  className="w-full px-2.5 py-2 bg-[#FAFAF9] border border-[#E3E0D8] rounded-lg text-xs font-semibold focus:ring-1 focus:ring-[#D45D3B] focus:outline-none transition-all cursor-pointer"
                >
                  <option value="intro">Intro Title Splash</option>
                  <option value="side-by-side">Side-by-Side Detail</option>
                  <option value="spotlight">Character Spotlight</option>
                  <option value="bullets">Bullets Highlights</option>
                  <option value="cta">CTA Conclusion Slide</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold font-mono text-gray-400 uppercase tracking-wider mb-1.5">
                  Slide Palette Choice
                </label>
                <select
                  value={activeSlide.theme}
                  onChange={(e) => updateActiveSlide({ theme: e.target.value as SlideTheme })}
                  className="w-full px-2.5 py-2 bg-[#FAFAF9] border border-[#E3E0D8] rounded-lg text-xs font-semibold focus:ring-1 focus:ring-[#D45D3B] focus:outline-none transition-all cursor-pointer"
                >
                  <option value="cream">Cream Classic (#F8F6F0)</option>
                  <option value="charcoal">Midnight Slate (#1C1E21)</option>
                  <option value="rust">Warm Rust Orange (#D45D3B)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: Aeivo Character Asset Configurator (State Engine) */}
          <div className="p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-gray-100 pb-2">
              <div className="flex items-center space-x-2">
                <Sliders size={16} className="text-[#D45D3B]" />
                <h3 className="text-sm font-extrabold tracking-wider font-mono text-gray-500 uppercase">
                  Mascot State Engine
                </h3>
              </div>
              <span className="text-[10px] bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded font-mono uppercase">
                Interactive SVG
              </span>
            </div>

            {/* Expression presets mapped dynamically */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold font-mono text-gray-400 uppercase tracking-wider mb-1.5">
                  Facial Smile Expression
                </label>
                <select
                  value={activeSlide.characterState.expression}
                  onChange={(e) => updateCharacterState({ expression: e.target.value as any })}
                  className="w-full px-2.5 py-2 bg-[#FAFAF9] border border-[#E3E0D8] rounded-lg text-xs font-semibold focus:ring-1 focus:ring-[#D45D3B] focus:outline-none cursor-pointer"
                >
                  <option value="knowing-smile">Confident Smile</option>
                  <option value="proud-smile">Proud Smirk</option>
                  <option value="thoughtful">Pensive Line</option>
                  <option value="lecturing">Lecturing / Speaking</option>
                  <option value="excited">Excited Grin</option>
                  <option value="curious">Curious Questioning</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold font-mono text-gray-400 uppercase tracking-wider mb-1.5">
                  Eye Look Design
                </label>
                <select
                  value={activeSlide.characterState.eyeLook}
                  onChange={(e) => updateCharacterState({ eyeLook: e.target.value as any })}
                  className="w-full px-2.5 py-2 bg-[#FAFAF9] border border-[#E3E0D8] rounded-lg text-xs font-semibold focus:ring-1 focus:ring-[#D45D3B] focus:outline-none cursor-pointer"
                >
                  <option value="standard">Standard Blue Iris</option>
                  <option value="wink">Playful Wink Sparkle</option>
                  <option value="reading">Half Lidded Focus</option>
                  <option value="star">Glowing Star pupil</option>
                  <option value="pixel">Pixel Retro-coding</option>
                </select>
              </div>
            </div>

            {/* Floating Assets selector (Core brand asset sync!) */}
            <div>
              <label className="block text-[11px] font-bold font-mono text-gray-400 uppercase tracking-wider mb-1.5">
                Floating Brand Core Asset
              </label>
              <select
                value={activeSlide.characterState.floatingAsset}
                onChange={(e) => updateCharacterState({ floatingAsset: e.target.value as any })}
                className="w-full px-2.5 py-2 bg-[#FAFAF9] border border-[#E3E0D8] rounded-lg text-xs font-semibold focus:ring-1 focus:ring-[#D45D3B] focus:outline-none cursor-pointer"
              >
                <option value="rust-orb">Orange Coral Sphere (Orbs Icon)</option>
                <option value="lightbulb">Glowing Intel Lightbulb</option>
                <option value="opened-book">Floating Open Book</option>
                <option value="code-brackets">Fluorescent Code {"</>"}</option>
                <option value="gear">Spinning Mechanics Gear</option>
                <option value="none">No Hover Asset</option>
              </select>
            </div>

            {/* Accessory checkboxes */}
            <div className="flex items-center space-x-6 bg-[#FAFAF9] p-3 rounded-lg border border-[#E3E0D8] select-none">
              <label className="flex items-center space-x-2 text-xs font-bold font-mono text-gray-600 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={activeSlide.characterState.showLaptop}
                  onChange={(e) => updateCharacterState({ showLaptop: e.target.checked })}
                  className="rounded accent-[#D45D3B] w-4 h-4 cursor-pointer"
                />
                <span>Hold Coding Laptop</span>
              </label>

              <label className="flex items-center space-x-2 text-xs font-bold font-mono text-gray-600 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={activeSlide.characterState.holdingPen}
                  onChange={(e) => updateCharacterState({ holdingPen: e.target.checked })}
                  className="rounded accent-[#D45D3B] w-4 h-4 cursor-pointer"
                />
                <span>Hold Stylus Pen</span>
              </label>
            </div>

            {/* Stage positioning sliders */}
            <div className="space-y-3.5 pt-2 border-t border-gray-100">
              <span className="text-[11px] font-extrabold font-mono text-gray-400 uppercase tracking-widest block">
                Stage Scale &amp; Positioning offsets
              </span>

              {/* Horizontal Position X */}
              <div>
                <div className="flex justify-between text-[11px] font-medium font-mono text-gray-500 mb-1">
                  <span>Horizontal Axis (X)</span>
                  <span className="font-bold">{activeSlide.characterState.positionX}%</span>
                </div>
                <input 
                  type="range" 
                  min="20" 
                  max="90" 
                  step="1"
                  value={activeSlide.characterState.positionX}
                  onChange={(e) => updateCharacterState({ positionX: parseInt(e.target.value) })}
                  className="w-full accent-[#D45D3B] cursor-pointer"
                />
              </div>

              {/* Vertical Position Y */}
              <div>
                <div className="flex justify-between text-[11px] font-medium font-mono text-gray-500 mb-1">
                  <span>Vertical Axis (Y)</span>
                  <span className="font-bold">{activeSlide.characterState.positionY}%</span>
                </div>
                <input 
                  type="range" 
                  min="20" 
                  max="80" 
                  step="1"
                  value={activeSlide.characterState.positionY}
                  onChange={(e) => updateCharacterState({ positionY: parseInt(e.target.value) })}
                  className="w-full accent-[#D45D3B] cursor-pointer"
                />
              </div>

              {/* Character Scale multiplier */}
              <div>
                <div className="flex justify-between text-[11px] font-medium font-mono text-gray-500 mb-1">
                  <span>Character Portrait Zoom</span>
                  <span className="font-bold">{activeSlide.characterState.scale}x</span>
                </div>
                <input 
                  type="range" 
                  min="0.6" 
                  max="1.6" 
                  step="0.05"
                  value={activeSlide.characterState.scale}
                  onChange={(e) => updateCharacterState({ scale: parseFloat(e.target.value) })}
                  className="w-full accent-[#D45D3B] cursor-pointer"
                />
              </div>
            </div>

            {/* Quick Export Canvas Button */}
            <div className="pt-2">
              <button
                onClick={handleDownloadSvg}
                className="w-full py-2.5 bg-[#FAF7F0] border-2 border-dashed border-[#D45D3B] hover:bg-[#D45D3B]/5 text-[#D45D3B] text-xs font-extrabold rounded-xl transition-colors cursor-pointer flex items-center justify-center space-x-1.5"
              >
                <Download size={14} className="stroke-[2.5]" />
                <span>Download Crisp SVG Graphic</span>
              </button>
            </div>
          </div>
        </aside>
      </div>

      {/* 5. HELPFUL DIALOG MANUAL OVERLAY */}
      {showHelp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-lg font-bold mb-3 flex items-center space-x-2 text-[#D45D3B]">
              <Sparkles size={20} />
              <span>Sankalp AEI Design Center Manual</span>
            </h3>
            
            <div className="space-y-3.5 text-xs text-slate-600 leading-relaxed max-h-[380px] overflow-y-auto pr-2">
              <p>
                Welcome to the official <strong>Aeivo Carousel Maker</strong>. This branding workspace was custom designed to build professional multi-step slide graphics for LinkedIn, Instagram, and web playbooks.
              </p>
              
              <div className="p-3 bg-[#FAF8F5] border border-[#EAE6DB] rounded-lg space-y-1.5">
                <span className="font-bold text-[#1C1E21]">Core Features:</span>
                <ul className="list-disc pl-4 space-y-1">
                  <li><strong>Complete Mascot Engine:</strong> Switch expression poses, alter eyes (focused reading, retro pixel etc) and toggle floating tools natively of your mascot "AEivo".</li>
                  <li><strong>AI Writing Copilot:</strong> Optimize academic, concise, hook title, or formatted bullet structures using server-side Gemini 3.5 models.</li>
                  <li><strong>Perfect social delivery ratios:</strong> The graphics maintain pristine 1080px ratios with real zero-shifting boundaries.</li>
                  <li><strong>Print PDF Exporting:</strong> Tap "Present &amp; Print PDF" to compile full decks offline.</li>
                </ul>
              </div>

              <p>
                To save or backup your configurations, click on the **Backup Config JSON** button inside the top bar. You can restore this exact state anywhere, anytime.
              </p>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setShowHelp(false)}
                className="px-4 py-2 bg-[#D45D3B] text-white hover:bg-[#B44C2F] rounded-lg font-bold text-xs"
              >
                Got It, Thanks!
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. STYLE ANIMATION KEYFRAMES Injection */}
      <style>{`
        @keyframes aeivo-float {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-8px) scale(1.03); }
        }
        @keyframes aeivo-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        /* Custom scrollbar */
        .scrollbar-thin::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background-color: rgba(28,30,33,0.15);
          border-radius: 9px;
        }
        
        /* Direct page-break layout styles for high-fidelity window print layout compilation */
        @media print {
          html, body {
            background-color: white !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          header, aside, main > div:first-child, aside {
            display: none !important;
          }
          main {
            padding: 0 !important;
            background-color: white !important;
          }
          #print-area {
            display: block !important;
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 1080px !important;
          }
          .slide-print-element {
            width: 1080px !important;
            height: 1080px !important;
            page-break-after: always !important;
            break-after: page !important;
            transform: none !important;
            box-shadow: none !important;
            border-radius: 0 !important;
            margin: 0 0 10px 0 !important;
            border: none !important;
          }
        }
      `}</style>
    </div>
  );
}
