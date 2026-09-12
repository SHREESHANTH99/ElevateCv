import { useState, useEffect, useRef, useCallback } from "react";
import { Sparkles } from "lucide-react";

interface CompareProps {
  firstImage?: string;
  secondImage?: string;
  className?: string;
  firstImageClassName?: string;
  secondImageClassname?: string;
  initialSliderPercentage?: number;
  slideMode?: "hover" | "drag";
  showHandlebar?: boolean;
}

export const Compare = ({
  firstImage = "",
  secondImage = "",
  className = "",
  firstImageClassName = "",
  secondImageClassname = "",
  initialSliderPercentage = 50,
  slideMode = "drag",
  showHandlebar = true,
}: CompareProps) => {
  const [sliderPosition, setSliderPosition] = useState(initialSliderPercentage);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.touches[0].clientX - rect.left;
      let percentage = (x / rect.width) * 100;
      if (percentage < 0) percentage = 0;
      if (percentage > 100) percentage = 100;
      setSliderPosition(percentage);
    },
    []
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!containerRef.current) return;
      if (slideMode === "drag" && !isDragging) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      let percentage = (x / rect.width) * 100;
      if (percentage < 0) percentage = 0;
      if (percentage > 100) percentage = 100;
      setSliderPosition(percentage);
    },
    [isDragging, slideMode]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      window.addEventListener("touchmove", handleTouchMove);
      window.addEventListener("touchend", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove]);

  const [img1Error, setImg1Error] = useState(false);
  const [img2Error, setImg2Error] = useState(false);

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden select-none rounded-xl border border-[#1f2725] bg-[#161c1a] ${className}`}
      onMouseDown={() => slideMode === "drag" && setIsDragging(true)}
      onTouchStart={() => slideMode === "drag" && setIsDragging(true)}
    >
      {/* Before Image (Left / Base) */}
      <div className="absolute inset-0 w-full h-full">
        {firstImage && !img1Error ? (
          <img
            src={firstImage}
            alt=""
            onError={() => setImg1Error(true)}
            className={`w-full h-full object-cover object-top ${firstImageClassName}`}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-[#0d1110] text-gray-500 p-8">
            <p className="text-sm font-semibold uppercase tracking-wider text-rose-400 mb-2">Before: Cluttered Layout</p>
            <p className="text-xs text-gray-400 max-w-md text-center">Dense, hard-to-read layout without visual hierarchy or ATS optimization.</p>
          </div>
        )}
        <span className="absolute top-4 left-4 z-10 px-3 py-1 bg-rose-500/20 text-rose-400 text-xs font-semibold rounded-full border border-rose-500/30 backdrop-blur-md">
          Before: Standard Resume
        </span>
      </div>

      {/* After Image (Right / Clipped Overlay) */}
      <div
        className="absolute inset-0 w-full h-full overflow-hidden"
        style={{
          clipPath: `polygon(${sliderPosition}% 0, 100% 0, 100% 100%, ${sliderPosition}% 100%)`,
        }}
      >
        {secondImage && !img2Error ? (
          <img
            src={secondImage}
            alt=""
            onError={() => setImg2Error(true)}
            className={`w-full h-full object-cover object-top ${secondImageClassname}`}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-[#161c1a] text-gray-200 p-8">
            <p className="text-sm font-semibold uppercase tracking-wider text-emerald-400 mb-2 flex items-center">
              <Sparkles className="w-4 h-4 mr-1.5" /> After: ElevateCV Intelligence
            </p>
            <p className="text-xs text-gray-300 max-w-md text-center">ATS-perfect typography, balanced spacing, and high-impact structural hierarchy.</p>
          </div>
        )}
        <span className="absolute top-4 right-4 z-10 px-3 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-semibold rounded-full border border-emerald-500/30 backdrop-blur-md">
          After: ElevateCV Modern
        </span>
      </div>

      {/* Static w-0.5 bg-emerald-500 Divider Line */}
      <div
        className="absolute top-0 bottom-0 w-0.5 bg-emerald-500 z-30 pointer-events-none"
        style={{ left: `${sliderPosition}%` }}
      />

      {/* Drag Handle: w-8 h-8 rounded-full bg-gray-50 */}
      {showHandlebar && (
        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-40 w-8 h-8 rounded-full bg-gray-50 shadow-lg flex items-center justify-center cursor-ew-resize border border-emerald-500/50"
          style={{ left: `${sliderPosition}%` }}
        >
          <div className="flex space-x-0.5">
            <div className="w-0.5 h-3 bg-gray-700 rounded-full" />
            <div className="w-0.5 h-3 bg-gray-700 rounded-full" />
          </div>
        </div>
      )}
    </div>
  );
};
