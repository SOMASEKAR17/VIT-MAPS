"use client"
import { useState, useEffect } from "react";

export default function Home() {
  const bingo = 100;
  const lh = 600;
  const rh = 700;
  const lineSpeed = 0.55;
  const [pixelsScrolled, setPixelsScrolled] = useState(bingo);

  useEffect(() => {
  console.log("pixelsScrolled:", pixelsScrolled);
}, [pixelsScrolled]);


  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      const s = window.scrollY;

      if (!ticking) {
        window.requestAnimationFrame(() => {
          setPixelsScrolled(  s + bingo);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div className="min-h-750 flex items-start justify-center bg-zinc-50 dark:bg-black">
      <svg width={1000} height={2000} viewBox="0 0 1000 2000" className="border mt-10">
        <line
          x1={500}
          y1={0}
          x2={500}
          y2={pixelsScrolled+(pixelsScrolled-bingo)*(lineSpeed)<=1890?pixelsScrolled+ (pixelsScrolled-bingo)*(lineSpeed):1890}
          stroke="red"
        />
        {/* line left */}
        <line 
          x1={500}
          y1={lh + lh*lineSpeed}
          x2={pixelsScrolled + ((pixelsScrolled-lh)*lineSpeed)<=lh?500:500-(pixelsScrolled-lh) - ((pixelsScrolled-lh)*lineSpeed)}
          y2={lh + lh*lineSpeed}
          stroke="red"
          />
          {/* line right */}
          <line 
          x1={500}
          y1={rh + rh*lineSpeed}
          x2={pixelsScrolled + ((pixelsScrolled-rh)*lineSpeed)<=rh?500:500+(pixelsScrolled-rh) + ((pixelsScrolled-rh)*lineSpeed)}
          y2={rh + rh*lineSpeed}
          stroke="red"
          />
        <circle
          cx={500}
          cy={pixelsScrolled+(pixelsScrolled-bingo)*(lineSpeed)<=1890?pixelsScrolled+(pixelsScrolled-bingo)*(lineSpeed):1890 }
          r={10}
          fill="white"
        />
      </svg>
    </div>
  );
}
