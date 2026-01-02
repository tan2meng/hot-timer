
import React, { useState, useRef, useMemo, useEffect } from 'react';
import { useData } from './context/DataContext';
import { ActionType, Ingredient, PrepItem, CookingItem } from './types';
import TimerItem from './components/TimerItem';
import LibraryModal from './components/LibraryModal';
import AdminPanel from './components/AdminPanel';
import ScannerModal from './components/ScannerModal';
import { Plus, Info, X, QrCode, CheckCircle2 } from 'lucide-react';

const GuideModal: React.FC<{ onClose: () => void, onOpenScanner: () => void }> = ({ onClose, onOpenScanner }) => (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-fade-in">
        <div className="bg-[#fffbeb] text-stone-800 p-6 rounded-[2rem] w-full max-w-sm shadow-2xl relative border-4 border-stone-200 animate-scale-up" style={{backgroundImage: 'radial-gradient(#e5e7eb 1px, transparent 1px)', backgroundSize: '20px 20px'}}>
            <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-stone-100 rounded-full text-stone-500 hover:bg-stone-200">
                <X size={20} />
            </button>
            <h3 className="text-2xl font-black mb-4 text-center text-orange-700 tracking-wider">🥘 开锅秘籍</h3>
            <ul className="space-y-4 text-sm font-medium">
                <li className="flex gap-3 items-center group">
                    <span className="text-2xl">📸</span>
                    <div className="flex-1">
                        <p className="font-bold text-base">第一步：扫码点菜</p>
                        <p className="opacity-60 text-xs">扫描二维码，获取店家专属食材库。</p>
                    </div>
                    <button
                        onClick={onOpenScanner}
                        className="p-3 bg-orange-600 text-white rounded-xl shadow-lg active:scale-90 transition-all hover:bg-orange-700"
                    >
                        <QrCode size={18} />
                    </button>
                </li>
                <li className="flex gap-3 items-start">
                    <span className="text-2xl">🍽️</span>
                    <div>
                        <p className="font-bold text-base">第二步：备菜</p>
                        <p className="opacity-60 text-xs">点击“加菜”，把想吃的放入下方餐盘。</p>
                    </div>
                </li>
                <li className="flex gap-3 items-start">
                    <span className="text-2xl">🍲</span>
                    <div>
                        <p className="font-bold text-base">第三步：下锅</p>
                        <p className="opacity-60 text-xs">单击餐盘食材，丢进锅里开始计时。</p>
                    </div>
                </li>
                <li className="flex gap-3 items-start">
                    <span className="text-2xl">🥢</span>
                    <div>
                        <p className="font-bold text-base">第四步：开吃</p>
                        <p className="opacity-60 text-xs">熟了会提醒，单击吃掉！未熟双击捞回。</p>
                    </div>
                </li>
            </ul>
            <button
                onClick={onClose}
                className="w-full mt-6 py-3 bg-orange-600 text-white rounded-xl font-black shadow-lg shadow-orange-200/50 active:scale-95 transition-transform text-lg tracking-widest"
            >
                开 动 ！
            </button>
        </div>
    </div>
);

// Decorative Background Component
const PotBackground = () => (
    <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Split Pot Background */}
        <div
            className="absolute inset-0"
            style={{
                background: 'linear-gradient(135deg, #7f1d1d 0%, #991b1b 30%, #ef4444 50%, #4b5563 50%, #4b5563 51%, #fef3c7 51%, #fffbeb 70%, #fde047 100%)'
            }}
        />
        
        {/* Texture Overlay */}
        <div className="absolute inset-0 opacity-20 mix-blend-overlay" 
             style={{backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23000000' fill-opacity='1' fill-rule='evenodd'%3E%3Ccircle cx='3' cy='3' r='1'/%3E%3Ccircle cx='13' cy='13' r='1'/%3E%3C/g%3E%3C/svg%3E")`}} 
        />

        {/* Floating Garnishes - Spicy Side */}
        <div className="absolute top-[10%] left-[10%] text-red-900/40 transform -rotate-45 text-4xl animate-float" style={{animationDelay: '0s'}}>🌶️</div>
        <div className="absolute top-[30%] left-[5%] text-red-900/30 transform rotate-12 text-2xl animate-float" style={{animationDelay: '1s'}}>🌶️</div>
        <div className="absolute top-[20%] left-[40%] text-yellow-600/30 transform rotate-90 text-3xl animate-float" style={{animationDelay: '2s'}}>🌭</div>

        {/* Floating Garnishes - Mild Side */}
        <div className="absolute bottom-[20%] right-[10%] text-green-700/30 transform rotate-45 text-3xl animate-float" style={{animationDelay: '1.5s'}}>🥬</div>
        <div className="absolute bottom-[40%] right-[20%] text-yellow-700/20 transform -rotate-12 text-2xl animate-float" style={{animationDelay: '0.5s'}}>🍄</div>
        <div className="absolute bottom-[10%] right-[40%] text-red-700/20 transform rotate-90 text-xl animate-float" style={{animationDelay: '2.5s'}}>🥔</div>

        {/* Steam Effect */}
        <div className="absolute inset-0">
             {Array.from({length: 6}).map((_, i) => (
                 <div 
                    key={i}
                    className="absolute bg-white/20 rounded-full blur-xl animate-steam"
                    style={{
                        width: Math.random() * 60 + 40 + 'px',
                        height: Math.random() * 60 + 40 + 'px',
                        left: Math.random() * 100 + '%',
                        top: Math.random() * 100 + '%',
                        animationDelay: `-${Math.random() * 5}s`,
                        animationDuration: `${Math.random() * 3 + 3}s`
                    }}
                 />
             ))}
        </div>
    </div>
);

const App: React.FC = () => {
  const { state, dispatch } = useData();
  const [isLibraryOpen, setLibraryOpen] = useState(false);
  const [isAdminOpen, setAdminOpen] = useState(false);
  const [isScannerOpen, setScannerOpen] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  
  const titleClickCount = useRef(0);
  const titleClickTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prepClickTimer = useRef<{[key: string]: ReturnType<typeof setTimeout>}>({});
  const cookingClickTimer = useRef<{[key: string]: ReturnType<typeof setTimeout>}>({});
  const audioCtxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
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

  const playSuccessSound = () => {
    const ctx = getAudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.setValueAtTime(440, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.3);
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
      dispatch({ type: ActionType.REMOVE_COOKING, payload: uid });
    } else {
      playCancelSound();
      dispatch({ type: ActionType.MOVE_COOKING_BACK_TO_PREP, payload: uid });
    }
  };

  const handleCookingInteraction = (uid: string, isDone: boolean) => {
    if (isDone) {
      handleRemoveCooked(uid, true);
      return;
    }

    if (cookingClickTimer.current[uid]) {
      clearTimeout(cookingClickTimer.current[uid]);
      delete cookingClickTimer.current[uid];
      handleRemoveCooked(uid, false);
      if (navigator.vibrate) navigator.vibrate([50]);
    } else {
      cookingClickTimer.current[uid] = setTimeout(() => {
        delete cookingClickTimer.current[uid];
      }, 300);
    }
  };

  const closeGuide = () => {
    setShowGuide(false);
    dispatch({ type: ActionType.SET_HAS_SEEN_GUIDE });
  };

  const handleScanSuccess = async (data: string) => {
    try {
      let jsonString = data;
      if (data.startsWith('http://') || data.startsWith('https://')) {
          setToast('正在获取云端食材库...');
          try {
            const response = await fetch(data);
            if (!response.ok) throw new Error('网络请求失败');
            jsonString = await response.text();
          } catch (err) {
            console.error('Fetch error:', err);
            alert('获取在线食材库失败，请检查链接是否正确或网络状况。');
            setToast(null);
            return;
          }
      }
      
      const json = JSON.parse(jsonString);
      if (Array.isArray(json)) {
        dispatch({ type: ActionType.IMPORT_DATA, payload: json });
        playSuccessSound();
        setToast('食材库导入成功！');
        setScannerOpen(false);
        setTimeout(() => setToast(null), 3000);
      } else {
        alert('解析失败：扫描内容不是有效的食材列表。');
        setToast(null);
      }
    } catch (e) {
      console.error('Parsing error:', e);
      alert('解析失败：请确保扫描的是有效的食材库JSON或链接。');
      setToast(null);
    }
  };

  const sortedCookingItems = useMemo(() => {
    return [...state.cookingItems].sort((a: CookingItem, b: CookingItem) => {
      // Done items first
      if (a.isDone && !b.isDone) return -1;
      if (!a.isDone && b.isDone) return 1;
      
      // If both done, sort by finish time
      if (a.isDone && b.isDone) {
        const finishA = a.startTime + (a.duration * 1000);
        const finishB = b.startTime + (b.duration * 1000);
        return finishA - finishB;
      }
      // If both cooking, shorter duration first (approximate for now)
      return a.duration - b.duration;
    });
  }, [state.cookingItems]);

  const isGridMode = sortedCookingItems.length >= 3;

  return (
    <div className="h-screen w-full flex flex-col relative text-stone-900 bg-stone-900 overflow-hidden">
      
      {/* Dynamic Pot Background */}
      <PotBackground />

      {toast && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center pointer-events-none">
          <div 
            className="px-8 py-4 bg-stone-900/90 text-white rounded-full font-bold shadow-2xl flex items-center gap-3 border border-white/20 backdrop-blur-xl animate-scale-up pointer-events-auto"
          >
             <CheckCircle2 size={24} className="text-green-500 animate-pulse" /> 
             <span className="text-lg tracking-wide">{toast}</span>
          </div>
        </div>
      )}

      {/* Main App Content */}
      <div className="flex-1 flex flex-col min-h-0 relative">
        {/* Header - Logo Only */}
        <header className="px-6 pt-safe pb-2 flex justify-between items-center z-10 select-none shrink-0 mix-blend-hard-light text-white">
          <h1 
              onClick={handleTitleClick}
              className="font-black drop-shadow-lg cursor-pointer flex items-center transform active:scale-90 transition-transform"
              style={{ textShadow: '0 4px 12px rgba(0,0,0,0.5)' }}
          >
            <span className="text-5xl filter drop-shadow-2xl">🥘</span>
          </h1>
          <div 
              onClick={() => setShowGuide(true)}
              className="text-xs bg-black/30 backdrop-blur-md px-3 py-1.5 rounded-full cursor-pointer flex items-center gap-1 hover:bg-black/50 active:scale-95 transition-all border border-white/10"
          >
              指南 <Info size={12} />
          </div>
        </header>

        {/* Main Cooking Area - The "Pot" */}
        {/* Using justify-evenly in grid mode to ensure equal spacing between items and edges */}
        <main className={`flex-1 relative overflow-y-auto z-10 hide-scrollbar min-h-0
             ${isGridMode ? 'grid grid-cols-[repeat(3,auto)] justify-evenly content-start gap-y-4 py-4' : 'flex flex-wrap content-start justify-center gap-4 p-4'}`}>
          
          {sortedCookingItems.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none col-span-full">
              <div className="text-center">
                <span className="text-8xl block mb-4 animate-float opacity-80 filter drop-shadow-xl">🥢</span>
                <p className="text-2xl font-bold tracking-widest text-white drop-shadow-md opacity-90">快下菜，水开啦！</p>
              </div>
            </div>
          )}

          {sortedCookingItems.map((item: CookingItem) => {
            const ingredient = state.ingredients.find((i: Ingredient) => i.id === item.ingredientId);
            if (!ingredient) return null;
            return (
              <div 
                key={item.uid} 
                onClick={() => handleCookingInteraction(item.uid, item.isDone)}
                className="z-10"
              >
                 <TimerItem 
                   item={item} 
                   ingredient={ingredient} 
                   onDone={handleTimerDone}
                   className={isGridMode ? 'scale-90 m-0' : 'm-2 md:m-4'}
                 />
              </div>
            );
          })}
        </main>

        {/* Bottom Sheet - The "Plate" (Prep Area) */}
        {/* 使用 flex-1 确保待煮区始终延伸到屏幕底部，实现底边完全重叠 */}
        <section className="flex flex-col z-20 flex-1 min-h-0">
          <div className="flex flex-col w-full h-full bg-[#fdfaf6] rounded-t-[2.5rem] shadow-[0_-10px_40px_rgba(0,0,0,0.3)] border-t-4 border-white relative overflow-hidden">
              
              {/* Plate Texture */}
              <div className="absolute inset-0 opacity-40 pointer-events-none rounded-t-[2.5rem]" 
                   style={{backgroundImage: 'radial-gradient(#d6d3d1 1px, transparent 1px)', backgroundSize: '16px 16px'}}></div>

              {/* Prep Items Area - Grid Layout with Vertical Scroll */}
              {/* 使用 flex-1 和 min-h-0 确保内容区可以滚动，加菜按钮始终在底部 */}
              <div className="overflow-y-auto hide-scrollbar p-6 pb-2 flex-1 min-h-0 relative z-10">
                  {state.prepItems.length === 0 ? (
                      <div className="w-full h-24 flex flex-col items-center justify-center text-stone-400 space-y-2">
                          <span className="text-4xl opacity-50">🍽️</span>
                          <span className="text-sm font-medium">盘子空空的，去点菜吧</span>
                      </div>
                  ) : (
                      <div className="grid grid-cols-4 sm:grid-cols-5 gap-3 pb-2">
                          {state.prepItems.map((item: PrepItem) => {
                              const ing = state.ingredients.find((i: Ingredient) => i.id === item.ingredientId);
                              if (!ing) return null;
                              return (
                                  <div 
                                      key={item.uid}
                                      onClick={() => handlePrepInteraction(item.uid)}
                                      className="aspect-square bg-white rounded-2xl flex flex-col items-center justify-center shadow-md active:scale-95 transition-transform group cursor-pointer border-2 border-stone-100 relative"
                                  >
                                      <div className="text-3xl mb-0.5">{ing.emoji}</div>
                                      <span className="text-[10px] text-stone-600 font-bold truncate w-full text-center px-1">
                                          {ing.name}
                                      </span>
                                      <div className="absolute -top-1 -right-1 bg-orange-500 text-[9px] px-1.5 py-0.5 rounded-full text-white font-bold shadow-sm border border-white">
                                          {ing.seconds}s
                                      </div>
                                      <button 
                                          onClick={(e) => handleRemovePrep(item.uid, e)}
                                          className="absolute -top-1 -left-1 bg-stone-200 text-stone-500 rounded-full p-1 z-20 shadow-sm transition-all active:scale-90 hover:bg-red-100 hover:text-red-500"
                                      >
                                          <XIcon size={10} />
                                      </button>
                                  </div>
                              );
                          })}
                      </div>
                  )}
              </div>

              {/* Add Button Area - Fixed at bottom with consistent spacing from prep area bottom */}
              <div className="px-6 pb-safe pt-2 relative z-10 shrink-0">
                   <button 
                      onClick={() => setLibraryOpen(true)}
                      className="w-full py-4 bg-stone-900 hover:bg-stone-800 active:bg-stone-700 text-white rounded-2xl flex items-center justify-center gap-2 font-bold tracking-widest text-lg transition-all shadow-xl active:scale-[0.98]"
                  >
                      <Plus size={24} strokeWidth={3} />
                      <span>加 菜</span>
                  </button>
              </div>
          </div>
        </section>
      </div>

      <LibraryModal isOpen={isLibraryOpen} onClose={() => setLibraryOpen(false)} />
      {isAdminOpen && <AdminPanel onClose={() => setAdminOpen(false)} />}
      {isScannerOpen && <ScannerModal onScan={handleScanSuccess} onClose={() => setScannerOpen(false)} />}
      {showGuide && <GuideModal onClose={closeGuide} onOpenScanner={() => { setShowGuide(false); setScannerOpen(true); }} />}
      
    </div>
  );
};

const XIcon = ({size}: {size: number}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
);

export default App;