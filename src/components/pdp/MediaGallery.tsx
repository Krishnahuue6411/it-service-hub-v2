'use client';

import React, { useState } from 'react';
import { Play, Sparkles, Zap, ShieldCheck } from 'lucide-react';

interface MediaGalleryProps {
  images: string[];
  productName: string;
  videoThumbnail: string;
  onOpenVideoModal: () => void;
  badge?: string;
  isBestSeller?: boolean;
}

export const MediaGallery: React.FC<MediaGalleryProps> = ({
  images,
  productName,
  videoThumbnail,
  onOpenVideoModal,
  badge,
  isBestSeller,
}) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [zoomStyle, setZoomStyle] = useState<React.CSSProperties>({ display: 'none' });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;

    setZoomStyle({
      backgroundImage: `url(${images[selectedIndex]})`,
      backgroundPosition: `${x}% ${y}%`,
      backgroundSize: '250%',
      display: 'block',
    });
  };

  const handleMouseLeave = () => {
    setZoomStyle({ display: 'none' });
  };

  return (
    <div className="flex flex-col-reverse md:flex-row gap-4 items-start">
      
      {/* Vertical Thumbnail Strip */}
      <div className="flex md:flex-col gap-2.5 overflow-x-auto md:overflow-y-auto scrollbar-none shrink-0 w-full md:w-20 max-h-[460px] pb-1">
        {images.map((img, idx) => (
          <button
            key={idx}
            onClick={() => setSelectedIndex(idx)}
            className={`w-16 h-16 rounded-xl border-2 overflow-hidden bg-slate-50 transition-all duration-200 shrink-0 ${
              selectedIndex === idx
                ? 'border-amber-400 ring-2 ring-amber-400/30 scale-105'
                : 'border-slate-200 hover:border-slate-300 opacity-70 hover:opacity-100'
            }`}
          >
            <img src={img} alt={`${productName} thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
          </button>
        ))}

        {/* Video Thumbnail Button Trigger */}
        <button
          onClick={onOpenVideoModal}
          className="w-16 h-16 rounded-xl border-2 border-slate-300 hover:border-amber-400 bg-slate-900 text-white flex flex-col items-center justify-center gap-0.5 shrink-0 relative overflow-hidden group shadow-md"
          title="Watch Installation & Speed Test"
        >
          <img src={videoThumbnail} alt="Video preview" className="w-full h-full object-cover opacity-50 group-hover:scale-110 transition" />
          <div className="absolute inset-0 bg-slate-950/60 flex flex-col items-center justify-center">
            <Play className="w-5 h-5 text-amber-400 fill-amber-400 group-hover:scale-125 transition-transform" />
            <span className="text-[8px] font-black text-amber-300 uppercase tracking-tighter mt-0.5">Video</span>
          </div>
        </button>
      </div>

      {/* Main Image Stage with Hover Zoom Lens */}
      <div
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative flex-1 w-full h-[360px] sm:h-[440px] md:h-[480px] bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex items-center justify-center cursor-crosshair group"
      >
        {/* Main Base Image */}
        <img
          src={images[selectedIndex]}
          alt={productName}
          className="w-full h-full object-contain p-4 transition-transform duration-300"
        />

        {/* Zoom Lens Overlay (Desktop) */}
        <div
          className="absolute inset-0 pointer-events-none rounded-2xl transition-opacity duration-200 hidden md:block"
          style={zoomStyle}
        />

        {/* Badges Overlay */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          <span className="bg-emerald-600 text-white font-black text-[10px] px-2.5 py-1 rounded-lg uppercase tracking-wider shadow-md">
            {badge || '43% OFF'}
          </span>
          {isBestSeller && (
            <span className="bg-amber-400 text-slate-950 font-black text-[10px] px-2.5 py-1 rounded-lg uppercase shadow-md flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> #1 Best Seller
            </span>
          )}
          <span className="bg-slate-900/90 backdrop-blur-md text-emerald-400 font-bold text-[10px] px-2.5 py-1 rounded-lg shadow-md flex items-center gap-1">
            <Zap className="w-3 h-3 fill-emerald-400" /> ⚡ 2-Hour Dispatch
          </span>
        </div>

        {/* Warranty Badge Bottom */}
        <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-md border border-slate-200 text-slate-800 text-[10px] font-bold px-2.5 py-1 rounded-lg shadow-sm flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>3 Years Brand Warranty</span>
        </div>

      </div>

    </div>
  );
};
