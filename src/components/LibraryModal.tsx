
import React, { useState, useMemo, useRef } from 'react';
import { Ingredient, IngredientType, ActionType } from '../../types';
import { useData } from '../context/DataContext';
import { CATEGORIES } from '../../constants';
import { X, Search, Flame, Pin } from 'lucide-react';

interface LibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FloatingHint {
  id: string;
  text: string;
}

const LibraryModal: React.FC<LibraryModalProps> = ({ isOpen, onClose }) => {
  const { state, dispatch } = useData();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<IngredientType | '全部'>('全部');
  const [clickedId, setClickedId] = useState<string | null>(null);
  
  const addedCountsRef = useRef<Record<string, number>>({});
  const [hints, setHints] = useState<FloatingHint[]>([]);
  
  const audioCtxRef = useRef<AudioContext | null>(null);

  const playSelectSound = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    const ctx = audioCtxRef.current;
    if (ctx.state === 'suspended') ctx.resume();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.05);

    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.05);
  };

  const filteredIngredients = useMemo(() => {
    return state.ingredients
      .filter(i => {
        const matchesSearch = i.name.toLowerCase().includes(search.toLowerCase());
        const matchesCat = selectedCategory === '全部' || i.type === selectedCategory;
        return matchesSearch && matchesCat;
      })
      .sort((a, b) => {
        // 核心变更：置顶排序逻辑
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return (b.usageCount || 0) - (a.usageCount || 0);
      });
  }, [state.ingredients, search, selectedCategory]);

  const handleAdd = (ingredient: Ingredient) => {
    const id = ingredient.id;
    setClickedId(id);
    playSelectSound();
    
    const newCount = (addedCountsRef.current[id] || 0) + 1;
    addedCountsRef.current[id] = newCount;

    const hintId = Math.random().toString(36).substr(2, 9);
    const newHint = {
      id: hintId,
      text: `${newCount}份 ${ingredient.name}`
    };
    
    setHints(prev => [...prev, newHint]);

    setTimeout(() => {
      setHints(prev => prev.filter(h => h.id !== hintId));
    }, 1600);

    dispatch({ type: ActionType.ADD_TO_PREP, payload: id });
    if (navigator.vibrate) navigator.vibrate(50);
    
    setTimeout(() => setClickedId(null), 150);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-[4px] animate-fade-in">
      
      <div className="w-full sm:w-[500px] h-[85vh] sm:h-[80vh] rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl flex flex-col border border-white/30 border-b-0
                      bg-white/10 backdrop-blur-2xl overflow-hidden relative">
        
        <div className="p-5 border-b border-white/10 flex items-center justify-between shrink-0">
          <h2 className="text-xl text-white font-bold flex items-center gap-2 drop-shadow-md">
            菜单
          </h2>
          <button 
            onClick={() => {
              addedCountsRef.current = {};
              onClose();
            }} 
            className="p-2 bg-black/20 rounded-full hover:bg-white/20 text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-5 space-y-4 shrink-0 relative">
          <div className="relative">
            <Search className="absolute left-3 top-3 text-white/60" size={18} />
            <input 
              type="text" 
              placeholder="搜索食材..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-black/30 text-white pl-10 pr-4 py-3 rounded-2xl border border-white/10 focus:border-white/40 focus:bg-black/50 focus:outline-none placeholder-white/30 transition-all shadow-inner"
            />
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center justify-center z-[70] pointer-events-none">
                {hints.map(hint => (
                <div 
                    key={hint.id} 
                    className="bg-white/95 text-orange-600 px-6 py-3 rounded-full font-bold shadow-2xl border-2 border-orange-400/50 animate-hint-float backdrop-blur-xl whitespace-nowrap text-xl"
                    style={{ filter: 'drop-shadow(0 10px 15px rgba(234, 88, 12, 0.4))' }}
                >
                    {hint.text}
                </div>
                ))}
            </div>

            <div className="flex gap-2 overflow-x-auto hide-scrollbar">
                <button 
                onClick={() => setSelectedCategory('全部')}
                className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-all border ${selectedCategory === '全部' ? 'bg-white text-orange-700 font-bold shadow-md border-transparent' : 'bg-black/20 text-white/80 border-white/5'}`}
                >
                全部
                </button>
                {CATEGORIES.map(cat => (
                <button 
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-all border ${selectedCategory === cat ? 'bg-white text-orange-700 font-bold shadow-md border-transparent' : 'bg-black/20 text-white/80 border-white/5'}`}
                >
                    {cat}
                </button>
                ))}
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto hide-scrollbar p-5 pt-0 pb-safe">
          <div className="grid grid-cols-2 gap-3">
            {filteredIngredients.map(ing => (
              <div 
                key={ing.id} 
                onClick={() => handleAdd(ing)}
                className={`flex flex-col p-3 border rounded-2xl transition-all cursor-pointer group shadow-sm relative overflow-hidden
                  ${clickedId === ing.id 
                    ? 'bg-orange-500/70 border-white/40 scale-90 rotate-1' 
                    : 'bg-white/10 border-white/10 hover:bg-white/20 active:scale-95'
                  }`}
              >
                {ing.isPinned && (
                  <Pin size={10} className="absolute top-2 right-2 text-orange-300 rotate-45" />
                )}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-black/20 rounded-full flex items-center justify-center text-xl group-hover:scale-110 transition-transform shadow-sm shrink-0">
                    {ing.emoji}
                  </div>
                  <div className="overflow-hidden">
                    <h3 className="text-white font-bold text-sm truncate drop-shadow-sm">{ing.name}</h3>
                    <p className="text-white/60 text-xs flex items-center gap-1 font-medium">
                      <Flame size={10} className="text-orange-300" /> {ing.seconds}s
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="h-8"></div>
        </div>
      </div>
    </div>
  );
};

export default LibraryModal;
