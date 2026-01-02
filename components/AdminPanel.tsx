import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useData } from '../context/DataContext';
import { ActionType, Ingredient, IngredientType } from '../types';
import { Save, Trash2, Upload, Download, LogOut, Plus, X, Pin, Search, CircleX, Edit3, AlertTriangle, ChevronDown } from 'lucide-react';
import { CATEGORIES } from '../constants';

const ADMIN_KEY_STORAGE = 'hotpot_admin_password';

interface DeleteConfirmDialogProps {
  isOpen: boolean;
  ingredientName: string;
  ingredientEmoji: string;
  onConfirm: () => void;
  onCancel: () => void;
}

interface ErrorToastProps {
  isOpen: boolean;
  message: string;
  onClose: () => void;
}

const ErrorToast: React.FC<ErrorToastProps> = ({ isOpen, message, onClose }) => {
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(onClose, 800);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center pointer-events-none">
      <div className="bg-red-500/90 backdrop-blur-md text-white px-8 py-4 rounded-2xl shadow-2xl border-2 border-red-400/30 flex items-center gap-3 pointer-events-auto animate-scale-up">
        <div className="w-7 h-7 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
          <CircleX size={16} className="text-white" />
        </div>
        <span className="font-bold text-base">{message}</span>
      </div>
    </div>
  );
};

interface CategoryDropdownProps {
  selectedCategory: IngredientType;
  onSelectCategory: (category: IngredientType) => void;
}

const CategoryDropdown: React.FC<CategoryDropdownProps> = ({ selectedCategory, onSelectCategory }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  const categoryEmoji = {
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
        className="w-full flex items-center justify-between px-3 py-2 bg-[#1c1917] rounded-lg border border-white/10 hover:border-orange-500/50 focus:border-orange-500 focus:outline-none transition-all text-white text-sm"
      >
        <span className="flex items-center gap-2">
          <span className="text-base">{categoryEmoji[selectedCategory]}</span>
          <span>{selectedCategory}</span>
        </span>
        <ChevronDown 
          size={16} 
          className={`text-stone-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-[#1c1917] rounded-lg border border-white/10 shadow-xl z-50 overflow-hidden animate-fade-in">
          <div className="p-1 space-y-0.5">
            {CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat;
              
              return (
                <button
                  key={cat}
                  onClick={() => {
                    onSelectCategory(cat as IngredientType);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-md transition-all text-sm font-medium ${
                    isSelected
                      ? 'bg-orange-600/20 text-orange-400 border border-orange-500/30'
                      : 'text-stone-300 hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <span className="text-base">{categoryEmoji[cat as IngredientType]}</span>
                  <span>{cat}</span>
                  {isSelected && (
                    <div className="ml-auto">
                      <div className="w-4 h-4 bg-orange-500 rounded-full flex items-center justify-center">
                        <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
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

const DeleteConfirmDialog: React.FC<DeleteConfirmDialogProps> = ({
  isOpen,
  ingredientName,
  ingredientEmoji,
  onConfirm,
  onCancel
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#292524] text-white p-6 rounded-[2rem] w-full max-w-sm shadow-2xl relative border border-white/5 animate-scale-up">
        <div className="flex flex-col items-center text-center">
          <div className="w-20 h-20 bg-red-900/20 rounded-3xl flex items-center justify-center mb-4 border border-red-500/20">
            <AlertTriangle size={40} className="text-red-500" />
          </div>
          
          <h3 className="text-xl font-black mb-2 text-white tracking-tight">确认删除</h3>
          
          <p className="text-stone-400 text-sm mb-4 leading-relaxed">
            确定要删除这个食材吗？
          </p>
          
          <div className="flex items-center gap-3 bg-[#1c1917] px-4 py-3 rounded-xl mb-6 border border-white/5">
            <span className="text-3xl">{ingredientEmoji}</span>
            <span className="text-white font-bold">{ingredientName}</span>
          </div>
          
          <p className="text-stone-500 text-xs mb-6">
            此操作无法撤销
          </p>
          
          <div className="flex gap-3 w-full">
            <button 
              onClick={onCancel}
              className="flex-1 py-3 bg-[#1c1917] hover:bg-[#44403c] text-white rounded-xl font-bold transition-all active:scale-95 border border-white/5"
            >
              取消
            </button>
            <button 
              onClick={onConfirm}
              className="flex-1 py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold transition-all active:scale-95 shadow-lg shadow-red-900/20"
            >
              确认删除
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const AdminPanel: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { state, dispatch } = useData();
  const [passwordInput, setPasswordInput] = useState('');
  const savedPass = localStorage.getItem(ADMIN_KEY_STORAGE);
  const initialView = !savedPass ? 'SETUP' : (state.admin.isAuthenticated ? 'DASHBOARD' : 'LOGIN');
  const [view, setView] = useState<'LOGIN' | 'SETUP' | 'DASHBOARD'>(initialView);
  const [formData, setFormData] = useState({name:'', emoji:'🍲', seconds:60, type:IngredientType.OTHER});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [adminSearch, setAdminSearch] = useState('');
  const [deleteDialog, setDeleteDialog] = useState({isOpen:false, ingredientId:null as string | null, ingredientName:'', ingredientEmoji:''});
  const [isReady, setIsReady] = useState(false);
  const [isContentReady, setIsContentReady] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [showErrorToast, setShowErrorToast] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [shouldHideMainApp, setShouldHideMainApp] = useState(false);
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
  // Initialize view on mount
  useEffect(() => {
    const savedPass = localStorage.getItem(ADMIN_KEY_STORAGE);
    if (!savedPass) {
      setView('SETUP');
    } else if (state.admin.isAuthenticated) {
      setView('DASHBOARD');
    }
    setIsReady(true);
  }, []);

  // Update view when authentication state changes
  useEffect(() => {
    const savedPass = localStorage.getItem(ADMIN_KEY_STORAGE);
    if (!savedPass) {
      setView('SETUP');
    } else if (state.admin.isAuthenticated) {
      setView('DASHBOARD');
    }
  }, [state.admin.isAuthenticated]);

  // Cache state when component unmounts
  useEffect(() => {
    return () => {
      if (view === 'DASHBOARD') {
        sessionStorage.setItem('adminPanel_scrollPosition', scrollPosition.toString());
        sessionStorage.setItem('adminPanel_search', adminSearch);
        sessionStorage.setItem('adminPanel_editingId', editingId || '');
        if (editingId) {
          sessionStorage.setItem('adminPanel_editingFormData', JSON.stringify(formData));
        }
      }
      setShouldHideMainApp(false);
    };
  }, [view, scrollPosition, adminSearch, editingId, formData]);

  // Restore cached state on mount
  useEffect(() => {
    const cachedScroll = sessionStorage.getItem('adminPanel_scrollPosition');
    const cachedSearch = sessionStorage.getItem('adminPanel_search');
    const cachedEditingId = sessionStorage.getItem('adminPanel_editingId');
    const cachedFormData = sessionStorage.getItem('adminPanel_editingFormData');

    if (cachedSearch !== null) {
      setAdminSearch(cachedSearch);
    }
    if (cachedEditingId) {
      setEditingId(cachedEditingId);
      if (cachedFormData) {
        try {
          setFormData(JSON.parse(cachedFormData));
        } catch (e) {
          console.error('Failed to restore form data:', e);
        }
      }
    }

    // Restore scroll position after content is ready
    if (cachedScroll) {
      const scrollPos = parseInt(cachedScroll, 10);
      setTimeout(() => {
        const scrollContainer = document.querySelector('.admin-panel-scroll-container');
        if (scrollContainer) {
          scrollContainer.scrollTop = scrollPos;
        }
      }, 350);
    }
  }, []);

  // Track scroll position
  useEffect(() => {
    const handleScroll = () => {
      const scrollContainer = document.querySelector('.admin-panel-scroll-container');
      if (scrollContainer) {
        setScrollPosition(scrollContainer.scrollTop);
      }
    };

    const scrollContainer = document.querySelector('.admin-panel-scroll-container');
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll);
      return () => scrollContainer.removeEventListener('scroll', handleScroll);
    }
  }, [view]);

  // Smooth transition effect when entering dashboard
  useEffect(() => {
    if (view === 'DASHBOARD') {
      setIsTransitioning(true);
      setIsContentReady(false);
      
      // Delay content rendering for smooth fade-in
      const timer = setTimeout(() => {
        setIsContentReady(true);
        setIsTransitioning(false);
      }, 50);
      
      return () => clearTimeout(timer);
    }
  }, [view]);

  const handleSetup = () => {
    if (passwordInput.length < 4) return alert('密码太短了');
    localStorage.setItem(ADMIN_KEY_STORAGE, passwordInput);
    dispatch({ type: ActionType.SET_ADMIN_SETUP, payload: true });
    dispatch({ type: ActionType.SET_ADMIN_AUTH, payload: true });
    setView('DASHBOARD');
  };

  const handleLogin = () => {
    const saved = localStorage.getItem(ADMIN_KEY_STORAGE);
    if (passwordInput === saved) {
      dispatch({ type: ActionType.SET_ADMIN_AUTH, payload: true });
      setShouldHideMainApp(true);
      setView('DASHBOARD');
    } else {
      setErrorMessage('密码错误');
      setShowErrorToast(true);
    }
  };

  const handleLogout = () => {
    dispatch({ type: ActionType.SET_ADMIN_AUTH, payload: false });
    onClose();
  };

  const handleSaveIngredient = () => {
    if (!formData.name || !formData.seconds) return;
    
    playSelectSound();
    
    if (editingId) {
      dispatch({ 
        type: ActionType.UPDATE_INGREDIENT, 
        payload: { ...formData, id: editingId } 
      });
    } else {
      dispatch({ 
        type: ActionType.ADD_INGREDIENT, 
        payload: { ...formData, id: Date.now().toString(), usageCount: 0, isPinned: false } 
      });
    }
    setEditingId(null);
    setFormData({ name: '', emoji: '🍲', seconds: 60, type: IngredientType.OTHER });
  };

  const handleEdit = (ing: Ingredient) => {
    setEditingId(ing.id);
    setFormData(ing);
  };

  const handleDelete = (id: string) => {
    const ingredient = state.ingredients.find(ing => ing.id === id);
    if (ingredient) {
      setDeleteDialog({
        isOpen: true,
        ingredientId: id,
        ingredientName: ingredient.name,
        ingredientEmoji: ingredient.emoji
      });
    }
  };

  const confirmDelete = () => {
    if (deleteDialog.ingredientId) {
      dispatch({ type: ActionType.DELETE_INGREDIENT, payload: deleteDialog.ingredientId });
    }
    setDeleteDialog({
      isOpen: false,
      ingredientId: null,
      ingredientName: '',
      ingredientEmoji: ''
    });
  };

  const cancelDelete = () => {
    setDeleteDialog({
      isOpen: false,
      ingredientId: null,
      ingredientName: '',
      ingredientEmoji: ''
    });
  };

  const togglePin = (id: string) => {
    dispatch({ type: ActionType.TOGGLE_PIN, payload: id });
  };

  const filteredIngredients = useMemo(() => {
    return state.ingredients.filter(ing => 
        ing.name.toLowerCase().includes(adminSearch.toLowerCase())
    ).sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return 0;
    });
  }, [state.ingredients, adminSearch]);

  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state.ingredients));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "hotpot_ingredients.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (Array.isArray(json)) {
            dispatch({ type: ActionType.IMPORT_DATA, payload: json });
            alert('导入成功!');
        } else {
            alert('JSON 格式错误');
        }
      } catch (err) {
        alert('JSON 解析失败');
      }
    };
    reader.readAsText(file);
  };

  if (view === 'LOGIN' || view === 'SETUP') {
    return (
      <div className="fixed inset-0 z-50 bg-[#1c1917] flex items-center justify-center p-4">
        <ErrorToast 
          isOpen={showErrorToast}
          message={errorMessage}
          onClose={() => setShowErrorToast(false)}
        />
        <div className="bg-[#292524] p-8 rounded-[2rem] w-full max-w-sm border border-white/5 shadow-2xl">
          <div className="w-16 h-16 bg-orange-900/30 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-orange-500/20">
            <LogOut className="text-orange-500 rotate-180" size={32} />
          </div>
          <h2 className="text-2xl text-white font-bold mb-2 text-center">
            {view === 'SETUP' ? '初始化管理员' : '身份验证'}
          </h2>
          <p className="text-stone-400 text-sm text-center mb-8">请设置或输入密码以管理食材库</p>
          
          <input
            type="password"
            className="w-full bg-[#1c1917] border border-white/10 rounded-xl px-5 py-4 text-white mb-6 focus:border-orange-500 outline-none transition-all placeholder-white/20"
            placeholder="输入密码..."
            autoFocus
            value={passwordInput}
            onChange={(e) => setPasswordInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (view === 'SETUP' ? handleSetup() : handleLogin())}
          />
          
          <div className="flex flex-col gap-3">
            <button 
              onClick={view === 'SETUP' ? handleSetup : handleLogin}
              className="w-full bg-orange-600 hover:bg-orange-500 text-white py-4 rounded-xl font-bold transition-all active:scale-95 shadow-lg shadow-orange-900/20"
            >
              {view === 'SETUP' ? '创建并进入' : '解锁管理权限'}
            </button>
            <button onClick={onClose} className="w-full py-4 text-stone-500 hover:text-white transition-colors font-medium">以后再说</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-[#1c1917] text-white flex flex-col overflow-hidden">
        <div className="flex-1 flex flex-col pt-safe pb-safe max-w-2xl mx-auto w-full h-full">
            
            {/* Unified Header */}
            <div className="px-6 py-4 flex justify-between items-center shrink-0">
                <div>
                  <h2 className="text-xl text-white font-bold tracking-tight">食材库管理</h2>
                </div>
                <div className="flex gap-2">
                    <button onClick={handleExport} title="导出配置" className="p-2.5 bg-[#292524] border border-white/5 hover:bg-[#44403c] rounded-xl text-white transition-all active:scale-90"><Download size={18} /></button>
                    <label className="p-2.5 bg-[#292524] border border-white/5 hover:bg-[#44403c] rounded-xl text-white cursor-pointer transition-all active:scale-90">
                        <Upload size={18} />
                        <input type="file" className="hidden" accept=".json" onChange={handleImport} />
                    </label>
                    <button onClick={handleLogout} title="退出登录" className="p-2.5 bg-red-900/20 border border-red-500/10 hover:bg-red-900/40 rounded-xl text-red-400 transition-all active:scale-90"><LogOut size={18} /></button>
                    <button onClick={onClose} className="p-2.5 hover:bg-[#292524] rounded-xl transition-colors"><X size={22} className="text-stone-400" /></button>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex flex-col flex-1 min-h-0 px-6 pb-4">
                
                {/* Form Section */}
                <section className="mb-4 p-4 bg-[#292524] border border-white/5 rounded-[1.5rem] space-y-3 shrink-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <div className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse"></div>
                      <h3 className="text-[11px] font-bold text-orange-500/80 uppercase tracking-widest">
                        {editingId ? '编辑中' : '新增食材'}
                      </h3>
                    </div>

                    <div className="grid grid-cols-12 gap-2">
                        <div className="col-span-8">
                            <label className="block text-[9px] text-stone-500 ml-1 mb-0.5 uppercase font-bold">食材名称</label>
                            <input 
                                placeholder="输入名称..." 
                                value={formData.name} 
                                onChange={e => setFormData({...formData, name: e.target.value})}
                                className="w-full bg-[#1c1917] border border-white/10 text-white px-3 py-2 text-sm rounded-lg focus:border-orange-500 outline-none transition-all"
                            />
                        </div>
                        <div className="col-span-4">
                            <label className="block text-[9px] text-stone-500 ml-1 mb-0.5 uppercase font-bold">Emoji</label>
                            <input 
                                placeholder="🥗" 
                                value={formData.emoji} 
                                onChange={e => setFormData({...formData, emoji: e.target.value})}
                                className="w-full bg-[#1c1917] border border-white/10 text-white px-3 py-2 text-sm rounded-lg text-center focus:border-orange-500 outline-none transition-all"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <label className="block text-[9px] text-stone-500 ml-1 mb-0.5 uppercase font-bold">推荐时长 (秒)</label>
                            <input 
                                type="number"
                                placeholder="秒数" 
                                value={formData.seconds === 0 ? '' : formData.seconds}
                                onChange={e => setFormData({...formData, seconds: e.target.value === '' ? 0 : parseInt(e.target.value) || 0})}
                                className="w-full bg-[#1c1917] border border-white/10 text-white px-3 py-2 text-sm rounded-lg focus:border-orange-500 outline-none transition-all [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                            />
                        </div>
                        <div>
                            <label className="block text-[9px] text-stone-500 ml-1 mb-0.5 uppercase font-bold">分类标签</label>
                            <CategoryDropdown 
                                selectedCategory={formData.type}
                                onSelectCategory={(cat) => setFormData({...formData, type: cat})}
                            />
                        </div>
                    </div>

                    <div className="flex gap-2 pt-1">
                        <button 
                            onClick={handleSaveIngredient}
                            className={`flex-1 ${editingId ? 'bg-blue-600 hover:bg-blue-500' : 'bg-orange-600 hover:bg-orange-500'} text-white py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all font-bold shadow-lg active:scale-[0.98] text-sm`}
                        >
                            {editingId ? <Save size={16} /> : <Plus size={16} />}
                            {editingId ? '保存修改' : '确认添加'}
                        </button>
                        {editingId && (
                            <button 
                              onClick={() => { setEditingId(null); setFormData({name:'', emoji:'🍲', seconds:60, type:IngredientType.OTHER}); }} 
                              className="px-4 bg-[#44403c] hover:bg-[#57534e] text-white rounded-xl transition-colors font-bold text-sm"
                            >
                              取消
                            </button>
                        )}
                    </div>
                </section>

                {/* Search Header for List */}
                <div className="flex items-center justify-between mb-2 px-2 shrink-0">
                  <h3 className="text-[11px] font-bold text-stone-500 uppercase tracking-widest">已存食材 ({filteredIngredients.length})</h3>
                  <div className="relative w-40">
                      <Search className="absolute left-2.5 top-2 text-stone-600" size={12} />
                      <input 
                          placeholder="快速查找..."
                          value={adminSearch}
                          onChange={e => setAdminSearch(e.target.value)}
                          className="w-full bg-transparent border-b border-white/10 text-white pl-7 pr-6 py-1.5 text-xs outline-none focus:border-orange-500/50 transition-all"
                      />
                      {adminSearch && (
                        <button 
                          onClick={() => setAdminSearch('')}
                          className="absolute right-0 top-2 text-stone-600 hover:text-white"
                        >
                          <CircleX size={12} />
                        </button>
                      )}
                  </div>
                </div>

                {/* List Container with Vertical Scroll */}
                <div className="flex-1 overflow-y-auto hide-scrollbar space-y-0.5 rounded-xl border border-white/5 bg-[#292524]/20 admin-panel-scroll-container">
                    {filteredIngredients.map(ing => (
                        <div key={ing.id} className="group flex items-center justify-between py-3 px-3 hover:bg-white/[0.03] transition-all border-b border-white/5 last:border-0">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-[#1c1917] rounded-xl flex items-center justify-center text-xl shadow-inner border border-white/5 group-hover:scale-110 transition-transform">
                                  {ing.emoji}
                                </div>
                                <div>
                                    <div className="text-white text-sm font-bold flex items-center gap-2">
                                        {ing.name}
                                        {ing.isPinned && <Pin size={10} className="text-orange-500 fill-orange-500/20" />}
                                    </div>
                                    <div className="text-[10px] text-stone-500 flex items-center gap-2 mt-0.5">
                                      <span className="bg-[#1c1917] px-1 py-0.5 rounded text-stone-400 font-medium">{ing.type}</span>
                                      <span className="opacity-60">•</span>
                                      <span>{ing.seconds}s</span>
                                      {ing.usageCount > 0 && (
                                        <>
                                          <span className="opacity-60">•</span>
                                          <span>{ing.usageCount} 次</span>
                                        </>
                                      )}
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-1.5">
                                <button 
                                    onClick={() => togglePin(ing.id)} 
                                    className={`p-2 rounded-lg transition-all active:scale-90 ${ing.isPinned ? 'text-orange-500 bg-orange-500/10' : 'text-stone-500 hover:text-white bg-[#1c1917] border border-white/5'}`}
                                >
                                    <Pin size={14} />
                                </button>
                                <button 
                                    onClick={() => handleEdit(ing)} 
                                    className="p-2 text-stone-500 hover:text-blue-400 bg-[#1c1917] border border-white/5 hover:border-blue-400/30 rounded-lg transition-all active:scale-90"
                                >
                                    <Edit3 size={14} />
                                </button>
                                <button 
                                    onClick={() => handleDelete(ing.id)} 
                                    className="p-2 text-stone-500 hover:text-red-400 bg-[#1c1917] border border-white/5 hover:border-red-400/30 rounded-lg transition-all active:scale-90"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </div>
                    ))}
                    <div className="h-12 w-full"></div>
                </div>
            </div>
        </div>
        
        <DeleteConfirmDialog 
          isOpen={deleteDialog.isOpen}
          ingredientName={deleteDialog.ingredientName}
          ingredientEmoji={deleteDialog.ingredientEmoji}
          onConfirm={confirmDelete}
          onCancel={cancelDelete}
        />
    </div>
  );
};

export default AdminPanel;