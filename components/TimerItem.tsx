
import React, { useEffect, useState, useRef } from 'react';
import { CookingItem, Ingredient } from '../types';

interface TimerItemProps {
  item: CookingItem;
  ingredient: Ingredient;
  onDone: (uid: string) => void;
  className?: string;
}

const TimerItem: React.FC<TimerItemProps> = ({ item, ingredient, onDone, className = '' }) => {
  const [progress, setProgress] = useState(0);
  const [isAlerting, setIsAlerting] = useState(false);
  const requestRef = useRef<number | undefined>(undefined);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const hasPlayedSound = useRef(false);

  const initAudioContext = () => {
    if (!audioCtxRef.current) {
      try {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      } catch (e) {
        console.error('Failed to create AudioContext:', e);
      }
    }
    if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume().catch(e => console.error('Failed to resume AudioContext:', e));
    }
  };

  const playDing = () => {
    try {
      initAudioContext();
      if (!audioCtxRef.current) return;
      
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume().catch(e => console.error('Failed to resume AudioContext:', e));
      }

      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(500, ctx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(1000, ctx.currentTime + 0.1);
      
      gainNode.gain.setValueAtTime(0.5, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1.5);

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.start();
      oscillator.stop(ctx.currentTime + 1.5);
      
      hasPlayedSound.current = true;
    } catch (e) {
      console.error("Audio play failed", e);
    }
  };

  useEffect(() => {
    // 在组件挂载时初始化音频上下文
    initAudioContext();
  }, []);

  useEffect(() => {
    hasPlayedSound.current = false;
    
    const animate = () => {
      const now = Date.now();
      const elapsed = (now - item.startTime) / 1000;
      const p = Math.min(elapsed / item.duration, 1);
      
      setProgress(p);

      if (p >= 1 && !item.isDone) {
        onDone(item.uid);
        setIsAlerting(true);
        if (!hasPlayedSound.current) {
          playDing();
        }
      } else if (p < 1) {
        requestRef.current = requestAnimationFrame(animate);
      }
    };

    if (!item.isDone) {
      requestRef.current = requestAnimationFrame(animate);
    } else {
      setProgress(1);
      setIsAlerting(true);
    }

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [item, onDone]);

  const percentage = Math.floor(progress * 100);
  const remainingTime = Math.ceil(item.duration - (progress * item.duration));
  
  // 使用SVG viewBox实现响应式设计
  const viewBoxSize = 100;
  const strokeWidth = 6;
  const radius = (viewBoxSize / 2) - strokeWidth;
  const circumference = 2 * Math.PI * radius;
  // 修改动画方向：从空圆圈(progress=0)逐渐增加到完整圆圈(progress=1)
  const strokeDashoffset = circumference - (progress * circumference);

  return (
    <div className={`relative flex flex-col items-center justify-center select-none transition-all duration-300 ${isAlerting ? 'scale-110 cursor-pointer z-50' : 'hover:scale-105'} ${className}`}>
      
      {/* Container Bubble */}
      <div 
        className={`relative w-24 h-24 md:w-32 md:h-32 rounded-full flex items-center justify-center 
          shadow-[0_8px_20px_rgba(0,0,0,0.3)] backdrop-blur-md transition-colors duration-500
          ${isAlerting ? 'bg-white text-red-600' : 'bg-black/30 text-white'}`}
      >
        
        {/* Progress Circle SVG - 使用viewBox实现响应式 */}
        <svg 
          className="absolute inset-0 w-full h-full transform -rotate-90 drop-shadow-md overflow-visible"
          viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
        >
           {/* Background Track */}
           <circle
            cx={viewBoxSize / 2}
            cy={viewBoxSize / 2}
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.2)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
           />
           {/* Progress Path - 移除CSS过渡，由requestAnimationFrame直接控制 */}
           <circle
            cx={viewBoxSize / 2}
            cy={viewBoxSize / 2}
            r={radius}
            fill="none"
            stroke={isAlerting ? "#fbbf24" : "white"}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
           />
        </svg>

        {/* Content */}
        <div className="z-10 flex flex-col items-center">
          <span 
            className={`text-4xl md:text-5xl filter drop-shadow-md mb-0.5 transform ${
              isAlerting ? 'animate-done-alert' : 'transition-transform duration-500'
            }`}
          >
              {ingredient.emoji}
          </span>
          {isAlerting ? (
            <span className="absolute -bottom-2 bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-lg border-2 border-white animate-bounce">
                熟啦!
            </span>
          ) : (
             <span className="text-xs font-bold bg-black/40 px-2 py-0.5 rounded-full backdrop-blur-sm">
                {remainingTime}s
             </span>
          )}
        </div>

        {/* Steam Animation if cooking */}
        {!isAlerting && (
             <div className="absolute -top-4 w-full flex justify-center space-x-2 opacity-50">
                <div className="w-1.5 h-3 bg-white/60 rounded-full animate-pulse-fast" style={{animationDelay: '0s'}}></div>
                <div className="w-1.5 h-4 bg-white/60 rounded-full animate-pulse-fast" style={{animationDelay: '0.2s'}}></div>
                <div className="w-1.5 h-2 bg-white/60 rounded-full animate-pulse-fast" style={{animationDelay: '0.4s'}}></div>
             </div>
        )}
      </div>

      <div className={`mt-2 px-2 py-0.5 rounded-lg shadow-md font-bold text-xs tracking-wide border transition-colors max-w-full truncate
        ${isAlerting ? 'bg-white text-red-600 border-red-100' : 'bg-stone-900/80 text-white border-white/10'}`}>
        {ingredient.name}
      </div>

    </div>
  );
};

export default TimerItem;