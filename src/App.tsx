
import React, { useState, useRef, useMemo, useEffect } from 'react';
import { useData } from './context/DataContext';
import { ActionType } from '../types';
import TimerItem from '../components/TimerItem';
import LibraryModal from './components/LibraryModal';
import AdminPanel from './components/AdminPanel';
import { Plus, Info, X } from 'lucide-react';

const GuideModal: React.FC<{ onClose: () => void }> = ({ onClose }) => (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-fade-in">
        <div className="bg-orange-50 text-orange-950 p-6 rounded-[2.5rem] w-full max-w-sm shadow-2xl relative border-4 border-white">
            <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-orange-100 rounded-full text-orange-600">
                <X size={20} />
            </button>
            <h3 className="text-2xl font-black mb-6 text-center text-orange-600">📖 开锅说明书</h3>
            <ul className="space-y-4 text-sm">
                <li className="flex gap-4 items-start">
                    <span className="text-2xl">➕</span>
                    <div>
                        <p className="font-bold">第一步：点菜</p>
                        <p className="opacity-70">点击下方按钮，将食材加到“待煮盘子”里。</p>
                    </div>
                </li>
                <li className="flex gap-4 items-start">
                    <span className="text-2xl">👇</span>
                    <div>
                        <p className="font-bold">第二步：下锅 (单击)</p>
                        <p className="opacity-70">点击盘里的食材移动到锅中开始计时。</p>
                    </div>
                </li>
                <li className="flex gap-4 items-start">
                    <span className="text-2xl">👯</span>
                    <div>
                        <p className="font-bold">第三步：加菜 (双击)</p>
                        <p className="opacity-70">双击盘里的食材，盘子保留原件并下锅一份。</p>
                    </div>
                </li>
                <li className="flex gap-4 items-start">
                    <span className="text-2xl">😋</span>
                    <div>
                        <p className="font-bold">第四步：开吃</p>
                        <p className="opacity-70">煮熟后单击圆圈吃掉。没煮熟双击可以捞出。</p>
                    </div>
                </li>
            </ul>
            <button 
                onClick={onClose}
                className="w-full mt-8 py-3 bg-orange-500 text-white rounded-2xl font-black shadow-lg shadow-orange-200 active:scale-95 transition-transform"
            >
                知道啦，开吃！
            </button>
        </div>
    </div>
);

const App: React.FC = () => {
  const { state, dispatch } = useData();
  const [isLibraryOpen, setLibraryOpen] = useState(false);
  const [isAdminOpen, setAdminOpen] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  
  const titleClickCount = useRef(0);
  const titleClickTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prepClickTimer = useRef<{[key: string]: ReturnType<typeof setTimeout>}>({});
  const audioCtxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    // 如果还没看过指南，自动显示
    if (!state.hasSeenGuide) {
        setShowGuide(true);
    }
  }, [state.hasSeenGuide]);

  const getAudioCtx = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  };

  const playSplashSound = () => {
    const ctx = getAudioCtx();
    const duration = 0.2;
    const bufferSize = ctx.sampleRate * duration;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + duration);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    noise.start();
  };

  const playEatSound = () => {
    const ctx = getAudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.15);
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.15);
  };

  const playCancelSound = () => {
    const ctx = getAudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(400, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.1);
  };

  const handleTitleClick = () => {
    titleClickCount.current += 1;
    if (titleClickTimer.current) clearTimeout(titleClickTimer.current);
    titleClickTimer.current = setTimeout(() => {
      titleClickCount.current = 0;
    }, 1000);
    if (titleClickCount.current >= 3) {
      setAdminOpen(true);
      titleClickCount.current = 0;
    }
  };

  const handlePrepInteraction = (prepUid: string) => {
    playSplashSound();
    if (prepClickTimer.current[prepUid]) {
        clearTimeout(prepClickTimer.current[prepUid]);
        delete prepClickTimer.current[prepUid];
        dispatch({ type: ActionType.START_COOKING_COPY, payload: prepUid });
        if (navigator.vibrate) navigator.vibrate([30, 30, 30]);
    } else {
        prepClickTimer.current[prepUid] = setTimeout(() => {
            dispatch({ type: ActionType.START_COOKING, payload: prepUid });
            delete prepClickTimer.current[prepUid];
        }, 180); 
    }
  };

  const handleRemovePrep = (prepUid: string, e: React.MouseEvent) => {
    e.stopPropagation();
    playCancelSound();
    dispatch({ type: ActionType.REMOVE_PREP, payload: prepUid });
  };

  const handleTimerDone = (uid: string) => {
    dispatch({ type: ActionType.FINISH_COOKING, payload: uid });
  };

  const handleRemoveCooked = (uid: string, isDone: boolean) => {
    if (isDone) {
      playEatSound();
    } else {
      playCancelSound();
    }
    dispatch({ type: ActionType.REMOVE_COOKING, payload: uid });
  };

  const closeGuide = () => {
    setShowGuide(false);
    dispatch({ type: ActionType.SET_HAS_SEEN_GUIDE });
  };

  const sortedCookingItems = useMemo(() => {
    return [...state.cookingItems].sort((a, b) => {
      if (a.isDone && !b.isDone) return -1;
      if (!a.isDone && b.isDone) return 1;
      if (a.isDone && b.isDone) {
        const finishA = a.startTime + (a.duration * 1000);
        const finishB = b.startTime + (b.duration * 1000);
        return finishA - finishB;
      }
      return a.duration - b.duration;
    });
  }, [state.cookingItems]);

  return (
    <div className="h-screen w-full flex flex-col relative text-white pt-safe pb-safe overflow-hidden">
      
      <header className="px-6 py-4 flex justify-between items-center z-10 select-none shrink-0">
        <h1 
            onClick={handleTitleClick}
            className="text-3xl font-bold text-white drop-shadow-md cursor-pointer tracking-wider"
            style={{ textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}
        >
          🔥 火锅闹钟
        </h1>
        <div 
            onClick={() => setShowGuide(true)}
            className="text-xs text-orange-100/70 font-mono bg-black/20 px-2 py-1 rounded cursor-pointer flex items-center gap-1 hover:bg-black/40 active:scale-95 transition-all"
        >
            v2.3 <Info size={10} />
        </div>
      </header>

      <main className="flex-1 relative flex flex-wrap content-start items-start justify-center p-4 overflow-y-auto z-10 hide-scrollbar min-h-[40vh]">
        
        {sortedCookingItems.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center opacity-40 mix-blend-overlay">
              <span className="text-6xl block mb-2 animate-float">♨️</span>
              <p className="text-xl font-bold tracking-widest text-white">水开啦，下菜吧</p>
            </div>
          </div>
        )}

        {sortedCookingItems.map(item => {
          const ingredient = state.ingredients.find(i => i.id === item.ingredientId);
          if (!ingredient) return null;
          return (
            <div 
              key={item.uid} 
              onClick={() => {
                if (item.isDone) handleRemoveCooked(item.uid, true);
              }}
              onDoubleClick={() => {
                if (!item.isDone) handleRemoveCooked(item.uid, false);
              }}
            >
               <TimerItem 
                 item={item} 
                 ingredient={ingredient} 
                 onDone={handleTimerDone}
               />
            </div>
          );
        })}
      </main>

      <section className="flex flex-col shrink-0 z-20 pb-safe">
        <div className="flex flex-col w-full">
            <div className="overflow-y-auto hide-scrollbar p-6 pb-0 max-h-60">
                {state.prepItems.length === 0 ? (
                    <div className="w-full py-8 flex flex-col items-center justify-center text-white/50 space-y-2">
                        <span className="text-3xl">🍽️</span>
                        <span className="text-sm italic">盘子里空空如也</span>
                    </div>
                ) : (
                    <div className="grid grid-cols-4 sm:grid-cols-5 gap-3 pb-4">
                        {state.prepItems.map(item => {
                            const ing = state.ingredients.find(i => i.id === item.ingredientId);
                            if (!ing) return null;
                            return (
                                <div 
                                    key={item.uid}
                                    onClick={() => handlePrepInteraction(item.uid)}
                                    className="relative aspect-square bg-white/20 backdrop-blur-md rounded-[1.2rem] flex flex-col items-center justify-center shadow-lg active:scale-95 transition-transform group cursor-pointer border border-white/10"
                                >
                                    <div className="text-2xl sm:text-3xl mb-1 filter drop-shadow-sm">{ing.emoji}</div>
                                    <span className="text-[10px] text-white font-medium truncate w-full text-center px-1 drop-shadow-md">
                                        {ing.name}
                                    </span>
                                    <div className="absolute top-1 right-1 bg-orange-600 text-[9px] px-1 rounded text-white font-bold shadow-sm">
                                        {ing.seconds}
                                    </div>
                                    <button 
                                        onClick={(e) => handleRemovePrep(item.uid, e)}
                                        className="absolute top-1.5 left-1.5 bg-red-500/90 text-white rounded-full p-1 z-20 shadow-md backdrop-blur-sm transition-all active:scale-90"
                                    >
                                        <XIcon size={8} />
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            <div className="p-6 pt-2 pb-8">
                 <button 
                    onClick={() => setLibraryOpen(true)}
                    className="w-full py-3 bg-white/20 hover:bg-white/30 active:bg-white/40 backdrop-blur-md rounded-2xl flex items-center justify-center gap-2 text-white font-bold tracking-wide transition-all shadow-lg border border-white/10"
                >
                    <Plus size={18} strokeWidth={2.5} />
                    <span>添加待煮食材</span>
                </button>
            </div>
        </div>
      </section>

      <LibraryModal isOpen={isLibraryOpen} onClose={() => setLibraryOpen(false)} />
      {isAdminOpen && <AdminPanel onClose={() => setAdminOpen(false)} />}
      {showGuide && <GuideModal onClose={closeGuide} />}
      
    </div>
  );
};

const XIcon = ({size}: {size: number}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
);

export default App;
