"use client"
import { useState, useEffect, useRef } from "react";

export default function Home() {
  const bingo = 100;
  const lh = 600;
  const rh = 700;
  const lineSpeed = 0.55;
  const [pixelsScrolled, setPixelsScrolled] = useState(bingo);
  const [angle,setAngle] = useState<number>(0);
  const timeRef = useRef<NodeJS.Timeout|null>(null);

//   useEffect(() => {
//   console.log("pixelsScrolled:", pixelsScrolled);
// }, [pixelsScrolled]);

  useEffect(()=>{
    timeRef.current = setTimeout(()=>{
      setAngle(prev=>(prev>=360?0:prev+1));
    },10)

    return ()=>{
      if(timeRef.current){
        clearTimeout(timeRef.current)
      }
    }
    
  },[angle])

  const stop = () => {
    if(timeRef.current){
      clearTimeout(timeRef.current)
    }
  }
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
    <div className="min-h-750 flex flex-col items-center gap-10 justify-center bg-zinc-50 dark:bg-black">
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
          <button onClick={()=>setAngle(0)} className="p-5 bg-zinc-800">start</button>
          <button onClick={stop} className="p-5 bg-zinc-800">stop</button>
      <svg width={500} height={1000} className="border">
        <g id="head" transform={`rotate(${angle} 250 250)`}>
          <circle cx={250} cy={250} fill="white" r={10}/>
          <path id="arm" d="
            M 240 220
            C 240 230 260 230 260 220
            L 252 30
            L 248 30
          " fill="white" transform={`rotate(${0} 250 250)`}/>
          {/* for C , M will be the line start and the last two of C are the line end coordinates , the middle two sets of two are for angle of rotate for start and end respectively */}
          <use href="#arm" transform={`rotate(${120} 250 250)`} />
          {/* rotate(angle x-coord y-coord) */}
          <use href="#arm" transform={`rotate(${240} 250 250)`} />
        </g>

        <path d="
          M 255 280
          L 245 280
          L 240 800
          L 260 800
        " fill="white"/>
      </svg>
    </div>
  );
}
