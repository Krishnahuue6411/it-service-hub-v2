'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Camera, X, Zap, Flashlight, Volume2, Search, Check, AlertCircle, Barcode, Plus } from 'lucide-react';
import { PRODUCTS_DATABASE } from '../../data/mockData';
import { Product } from '../../types';

interface BarcodeScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (product: Product) => void;
}

export const BarcodeScanner: React.FC<BarcodeScannerProps> = ({
  isOpen,
  onClose,
  onScanSuccess,
}) => {
  const [manualSku, setManualSku] = useState('');
  const [torchOn, setTorchOn] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [scannedFeedback, setScannedFeedback] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Web Audio API Beep Sound Synthesizer (Zero External Audio File Dependency)
  const playBeep = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(1800, ctx.currentTime); // 1.8kHz high pitch POS beep
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.15);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch (e) {
      console.log('Audio context playback suppressed', e);
    }
  };

  // Camera stream lifecycle
  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen]);

  const startCamera = async () => {
    setCameraError(null);
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          setCameraActive(true);
        }
      } else {
        setCameraError('Camera access not supported on this browser/device.');
      }
    } catch (err: any) {
      console.warn('Camera stream error:', err);
      setCameraError('Camera permission denied or camera not detected. Use manual SKU barcode entry below.');
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
    setTorchOn(false);
  };

  const toggleTorch = async () => {
    if (!streamRef.current) return;
    const track = streamRef.current.getVideoTracks()[0];
    if (track && 'applyConstraints' in track) {
      try {
        const nextState = !torchOn;
        await (track as any).applyConstraints({
          advanced: [{ torch: nextState }],
        });
        setTorchOn(nextState);
      } catch (e) {
        alert('Torch/Flashlight is not supported on this camera device.');
      }
    }
  };

  const handleManualSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualSku.trim()) return;

    const term = manualSku.trim().toLowerCase();
    const matched = PRODUCTS_DATABASE.find(
      (p) =>
        p.id.toLowerCase() === term ||
        p.name.toLowerCase().includes(term) ||
        p.brand.toLowerCase().includes(term) ||
        p.category.toLowerCase().includes(term)
    );

    if (matched) {
      playBeep();
      setScannedFeedback(`MATCHED: ${matched.name}`);
      onScanSuccess(matched);
      setManualSku('');
      setTimeout(() => setScannedFeedback(null), 2000);
    } else {
      alert(`No hardware found matching Barcode / SKU: "${manualSku}"`);
    }
  };

  // Simulated instant scan trigger for quick testing
  const handleSimulateScan = (product: Product) => {
    playBeep();
    setScannedFeedback(`SCANNED: ${product.name}`);
    onScanSuccess(product);
    setTimeout(() => setScannedFeedback(null), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 text-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-800 relative overflow-hidden flex flex-col space-y-5">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-400/10 text-amber-400 rounded-2xl border border-amber-400/30">
              <Barcode className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-black text-white text-base flex items-center gap-2">
                <span>Retail POS Barcode Scanner</span>
                <span className="text-[10px] font-extrabold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                  LIVE 60FPS
                </span>
              </h3>
              <p className="text-xs text-slate-400 font-medium">
                Aim mobile camera at item barcode / QR tag
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-full p-2 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewfinder Window */}
        <div className="relative w-full aspect-video bg-slate-950 rounded-2xl overflow-hidden border-2 border-slate-800 shadow-inner flex items-center justify-center">
          
          <video
            ref={videoRef}
            playsInline
            muted
            className={`w-full h-full object-cover ${cameraActive ? 'block' : 'hidden'}`}
          />

          {!cameraActive && (
            <div className="text-center p-6 space-y-3">
              <Camera className="w-12 h-12 text-slate-600 mx-auto animate-pulse" />
              <p className="text-xs text-slate-400 font-medium max-w-xs mx-auto">
                {cameraError || 'Initializing MediaDevices Camera Stream...'}
              </p>
              <button
                type="button"
                onClick={startCamera}
                className="bg-slate-800 hover:bg-slate-700 text-amber-400 font-extrabold text-xs px-4 py-2 rounded-xl border border-slate-700 transition"
              >
                Retry Camera Stream
              </button>
            </div>
          )}

          {/* Laser Scanner Guideline Overlay */}
          {cameraActive && (
            <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-6">
              {/* Corner Reticles */}
              <div className="flex justify-between">
                <div className="w-8 h-8 border-t-4 border-l-4 border-amber-400 rounded-tl-lg" />
                <div className="w-8 h-8 border-t-4 border-r-4 border-amber-400 rounded-tr-lg" />
              </div>

              {/* Animated Scan Laser Line */}
              <div className="w-full h-0.5 bg-rose-500 shadow-[0_0_12px_#f43f5e] animate-bounce" />

              <div className="flex justify-between">
                <div className="w-8 h-8 border-b-4 border-l-4 border-amber-400 rounded-bl-lg" />
                <div className="w-8 h-8 border-b-4 border-r-4 border-amber-400 rounded-br-lg" />
              </div>
            </div>
          )}

          {/* Flashlight Torch Toggle */}
          {cameraActive && (
            <button
              type="button"
              onClick={toggleTorch}
              className={`absolute top-3 right-3 p-2.5 rounded-xl border font-bold text-xs transition flex items-center gap-1.5 shadow-lg ${
                torchOn
                  ? 'bg-amber-400 text-slate-950 border-amber-300'
                  : 'bg-slate-900/80 text-white border-slate-700 hover:bg-slate-800'
              }`}
            >
              <Zap className="w-4 h-4" />
              <span>{torchOn ? 'Torch ON' : 'Torch OFF'}</span>
            </button>
          )}

          {/* Scanned Toast Feedback */}
          {scannedFeedback && (
            <div className="absolute bottom-3 inset-x-3 bg-emerald-500 text-slate-950 font-black text-xs p-3 rounded-xl shadow-2xl flex items-center justify-center gap-2 animate-bounce">
              <Check className="w-4 h-4 stroke-[3]" />
              <span>{scannedFeedback}</span>
            </div>
          )}

        </div>

        {/* Fallback Manual Numeric SKU Search */}
        <form onSubmit={handleManualSearch} className="space-y-2">
          <label className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Search className="w-3.5 h-3.5 text-amber-400" />
            <span>Manual Barcode / SKU / Serial Search</span>
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={manualSku}
              onChange={(e) => setManualSku(e.target.value)}
              placeholder="Enter SKU e.g. CT1000P3PSSSD8, Kingston, Crucial..."
              className="flex-1 text-xs p-3 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono font-bold outline-none focus:border-amber-400"
            />
            <button
              type="submit"
              className="bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs px-5 py-3 rounded-xl transition shadow flex items-center gap-1.5 shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Add</span>
            </button>
          </div>
        </form>

        {/* Quick Test Barcode Buttons */}
        <div className="space-y-2 border-t border-slate-800 pt-3">
          <span className="text-[10px] font-extrabold uppercase text-slate-400 block">
            ⚡ Quick Scan Simulation Shortcuts:
          </span>
          <div className="flex flex-wrap gap-2">
            {PRODUCTS_DATABASE.slice(0, 3).map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => handleSimulateScan(p)}
                className="text-[11px] font-bold bg-slate-800 hover:bg-slate-700 text-amber-300 px-3 py-1.5 rounded-xl border border-slate-700 transition"
              >
                Scan #{p.name.split(' ')[0]} (₹{p.price.toLocaleString()})
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
