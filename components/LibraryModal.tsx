
import React, { useState, useMemo, useRef, useEffect, useRef as useRef2 } from 'react';
import { Ingredient, IngredientType, ActionType } from '../types';
import { useData } from '../context/DataContext';
import { CATEGORIES } from '../constants';
import { X, Search, Flame, Pin, CircleX, Plus, ChevronDown } from 'lucide-react';

interface LibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FloatingHint {
  id: string;
  text: string;
}

interface CategoryDropdownProps {
  selectedCategory: IngredientType | '全部';
  onSelectCategory: (category: IngredientType | '全部') => void;
}

const CategoryDropdown: React.FC<CategoryDropdownProps> = ({ selectedCategory, onSelectCategory }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef2<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const getCategoryDisplay = (cat: IngredientType | '全部') => {
    if (cat === '全部') return '全部';
    return cat;
  };

  const categoryEmoji = {
    '全部': '📋',
    [IngredientType.MEAT]: '🥩',
    [IngredientType.SEAFOOD]: '🦐',
    [IngredientType.VEGETABLE]: '🥬',
    [IngredientType.NOODLE]: '🍜',
    [IngredientType.OTHER]: '🫔'
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 bg-white rounded-xl border-2 border-stone-100 hover:border-orange-300 focus:border-orange-400 focus:outline-none transition-all shadow-sm font-medium text-stone-800"
      >
        <span className="flex items-center gap-2">
          <span className="text-lg">{categoryEmoji[selectedCategory]}</span>
          <span>{getCategoryDisplay(selectedCategory)}</span>
        </span>
        <ChevronDown 
          size={18} 
          className={`text-stone-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl border-2 border-stone-100 shadow-xl z-50 overflow-hidden animate-fade-in">
          <div className="p-2 space-y-1">
            {(['全部', ...CATEGORIES] as (IngredientType | '全部')[]).map((cat) => {
              const isSelected = selectedCategory === cat;
              
              return (
                <button
                  key={cat}
                  onClick={() => {
                    onSelectCategory(cat);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all font-medium ${
                    isSelected
                      ? 'bg-orange-50 text-orange-700 border-2 border-orange-200'
                      : 'text-stone-700 hover:bg-stone-50 border-2 border-transparent'
                  }`}
                >
                  <span className="text-xl">{categoryEmoji[cat]}</span>
                  <span>{getCategoryDisplay(cat)}</span>
                  {isSelected && (
                    <div className="ml-auto">
                      <div className="w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

const LibraryModal: React.FC<LibraryModalProps> = ({ isOpen, onClose }) => {
  const { state, dispatch } = useData();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<IngredientType | '全部'>('全部');
  const [clickedId, setClickedId] = useState<string | null>(null);
  
  const addedCountsRef = useRef<Record<string, number>>({});
  const [activeHint, setActiveHint] = useState<FloatingHint | null>(null);
  const hintTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
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

    if (hintTimeoutRef.current) clearTimeout(hintTimeoutRef.current);
    
    const newHint = {
      id: Math.random().toString(36).substr(2, 9),
      text: `${newCount}份 ${ingredient.name}`
    };
    
    setActiveHint(newHint);

    hintTimeoutRef.current = setTimeout(() => {
      setActiveHint(null);
    }, 533);

    dispatch({ type: ActionType.ADD_TO_PREP, payload: id });
    if (navigator.vibrate) navigator.vibrate(50);
    
    setTimeout(() => setClickedId(null), 150);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-stone-900/60 backdrop-blur-sm animate-fade-in">
      
      <div className="w-full sm:w-[500px] h-[90vh] sm:h-[85vh] rounded-t-[2rem] sm:rounded-[2rem] shadow-2xl flex flex-col 
                      bg-white/80 backdrop-blur-xl relative overflow-hidden text-stone-800 border-4 border-b-0 border-white/30">
        
        {/* Menu Header */}
        <div className="p-5 flex items-center justify-between shrink-0 bg-white/50 backdrop-blur-md border-b border-white/30">
          <div className="flex items-center gap-2">
            <span className="text-2xl">📜</span>
            <h2 className="text-xl font-black text-stone-800 tracking-wider">
              全选菜单
            </h2>
          </div>
          <button 
            onClick={() => {
              addedCountsRef.current = {};
              onClose();
            }} 
            className="p-2 bg-stone-200/80 backdrop-blur-sm rounded-full hover:bg-stone-300/80 text-stone-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Search & Categories */}
        <div className="p-4 shrink-0 bg-white/50 backdrop-blur-md relative z-10 border-b border-white/30">
          <div className="grid grid-cols-2 gap-3 items-center">
            <div className="relative">
              <Search className="absolute left-3 top-3.5 text-stone-400" size={18} />
              <input 
                type="text" 
                placeholder="想吃点什么..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-white text-stone-800 pl-10 pr-10 py-3 rounded-xl border-2 border-stone-100 focus:border-orange-400 focus:outline-none placeholder-stone-400 transition-all shadow-sm font-medium"
              />
              {search && (
                <button 
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-3.5 text-stone-400 hover:text-stone-600 transition-colors"
                >
                  <CircleX size={20} />
                </button>
              )}
            </div>

            <div className="relative">
              <CategoryDropdown 
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
              />
            </div>
          </div>
          
          <div className="absolute inset-0 flex items-center justify-center z-[70] pointer-events-none">
              {activeHint && (
              <div 
                  key={activeHint.id} 
                  className="bg-orange-600 text-white px-6 py-[18px] rounded-full font-bold shadow-2xl animate-hint-float whitespace-nowrap text-xl flex items-center gap-2 border-2 border-orange-400"
              >
                  <CheckCircleIcon /> {activeHint.text}
              </div>
              )}
          </div>
        </div>

        {/* List Content - Vertical 2 columns with horizontal item layout */}
        <div className="flex-1 overflow-y-auto hide-scrollbar p-4 pt-0 pb-safe bg-[#f9fafb]">
          <div className="grid grid-cols-2 gap-3">
            {filteredIngredients.map(ing => (
              <div 
                key={ing.id} 
                onClick={() => handleAdd(ing)}
                className={`flex items-center p-3 bg-white rounded-xl border-2 transition-all cursor-pointer group shadow-sm relative overflow-hidden h-20
                  ${clickedId === ing.id 
                    ? 'border-orange-500 bg-orange-50 scale-[0.98]' 
                    : 'border-stone-100 hover:border-orange-200'
                  }`}
              >
                {ing.isPinned && (
                  <Pin size={12} className="absolute top-2 right-2 text-orange-400 fill-orange-400 rotate-45" />
                )}
                
                <div className="w-14 h-14 bg-stone-50 rounded-lg flex items-center justify-center text-3xl shadow-inner border border-stone-100 shrink-0 mr-3">
                  {ing.emoji}
                </div>
                
                <div className="flex flex-col flex-1 min-w-0 justify-center h-full">
                  <h3 className="text-stone-900 font-black text-lg truncate leading-tight">{ing.name}</h3>
                  <div className="flex items-center mt-1">
                      <span className="bg-orange-100 text-orange-700 text-xs font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5">
                        <Flame size={10} className="fill-orange-500 text-orange-500" /> {ing.seconds}s
                      </span>
                  </div>
                </div>

                <div className="absolute right-0 bottom-0 p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="bg-orange-500 text-white rounded-tl-lg rounded-br-lg p-1">
                        <Plus size={12} strokeWidth={4} />
                    </div>
                </div>
              </div>
            ))}
          </div>
          <div className="h-12"></div>
        </div>
      </div>
    </div>
  );
};

const CheckCircleIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
        <polyline points="22 4 12 14.01 9 11.01"></polyline>
    </svg>
)

export default LibraryModal;








