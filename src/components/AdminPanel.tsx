
import React, { useState, useEffect, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { ActionType, Ingredient, IngredientType } from '../../types';
import { Save, Trash2, Upload, Download, LogOut, Plus, X, Pin, Search } from 'lucide-react';
import { CATEGORIES } from '../../constants';

const ADMIN_KEY_STORAGE = 'hotpot_admin_password';

const AdminPanel: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { state, dispatch } = useData();
  const [passwordInput, setPasswordInput] = useState('');
  const [view, setView] = useState<'LOGIN' | 'SETUP' | 'DASHBOARD'>('LOGIN');
  const [adminSearch, setAdminSearch] = useState('');

  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Ingredient>>({
    name: '', emoji: '🍲', seconds: 60, type: IngredientType.OTHER
  });

  useEffect(() => {
    const savedPass = localStorage.getItem(ADMIN_KEY_STORAGE);
    if (!savedPass) {
      setView('SETUP');
    } else if (state.admin.isAuthenticated) {
      setView('DASHBOARD');
    }
  }, [state.admin.isAuthenticated]);

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
      setView('DASHBOARD');
    } else {
      alert('密码错误');
    }
  };

  const handleLogout = () => {
    dispatch({ type: ActionType.SET_ADMIN_AUTH, payload: false });
    onClose();
  };

  const handleSaveIngredient = () => {
    if (!formData.name || !formData.seconds) return;
    
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
    if (confirm('确认删除这个食材吗?')) {
      dispatch({ type: ActionType.DELETE_INGREDIENT, payload: id });
    }
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
      <div className="fixed inset-0 z-50 bg-stone-900 flex items-center justify-center p-4">
        <div className="bg-stone-800 p-6 rounded-2xl w-full max-w-sm border border-orange-500/30 shadow-2xl">
          <h2 className="text-2xl text-orange-500 font-bold mb-4">
            {view === 'SETUP' ? '设置管理员密码' : '管理员登录'}
          </h2>
          <input
            type="password"
            className="w-full bg-stone-900 border border-stone-600 rounded p-2 text-white mb-4"
            placeholder="请输入密码"
            value={passwordInput}
            onChange={(e) => setPasswordInput(e.target.value)}
          />
          <div className="flex gap-2">
            <button 
              onClick={view === 'SETUP' ? handleSetup : handleLogin}
              className="flex-1 bg-orange-600 text-white py-2 rounded font-bold hover:bg-orange-700 transition-colors"
            >
              {view === 'SETUP' ? '创建' : '进入'}
            </button>
            <button onClick={onClose} className="px-4 text-stone-400 hover:text-white transition-colors">取消</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-stone-900 text-white flex flex-col overflow-hidden">
        <div className="flex-1 flex flex-col pt-safe pb-safe">
            
            <div className="bg-stone-800 p-4 flex justify-between items-center shadow-md border-b border-stone-700 shrink-0">
                <h2 className="text-xl text-orange-500 font-bold">管理面板</h2>
                <div className="flex gap-2">
                    <button onClick={handleExport} className="p-2 bg-stone-700 hover:bg-stone-600 rounded text-white transition-colors"><Download size={18} /></button>
                    <label className="p-2 bg-stone-700 hover:bg-stone-600 rounded text-white cursor-pointer transition-colors">
                        <Upload size={18} />
                        <input type="file" className="hidden" accept=".json" onChange={handleImport} />
                    </label>
                    <button onClick={handleLogout} className="p-2 bg-red-900/50 hover:bg-red-900/70 rounded text-red-400 transition-colors"><LogOut size={18} /></button>
                    <button onClick={onClose} className="p-2 hover:bg-stone-700 rounded transition-colors"><X className="text-stone-400" /></button>
                </div>
            </div>

            <div className="p-4 bg-stone-800/50 border-b border-stone-700 shrink-0 space-y-3">
                <div className="flex flex-wrap gap-2">
                    <input 
                        placeholder="名称" 
                        value={formData.name} 
                        onChange={e => setFormData({...formData, name: e.target.value})}
                        className="bg-stone-900 text-white p-2 rounded flex-1 min-w-[120px] border border-stone-700 focus:border-orange-500 outline-none"
                    />
                    <input 
                        placeholder="Emoji" 
                        value={formData.emoji} 
                        onChange={e => setFormData({...formData, emoji: e.target.value})}
                        className="bg-stone-900 text-white p-2 rounded w-14 text-center border border-stone-700 focus:border-orange-500 outline-none"
                    />
                    <input 
                        type="number"
                        placeholder="秒数" 
                        value={formData.seconds} 
                        onChange={e => setFormData({...formData, seconds: parseInt(e.target.value)})}
                        className="bg-stone-900 text-white p-2 rounded w-20 border border-stone-700 focus:border-orange-500 outline-none"
                    />
                    <select 
                        value={formData.type}
                        onChange={e => setFormData({...formData, type: e.target.value as IngredientType})}
                        className="bg-stone-900 text-white p-2 rounded border border-stone-700 focus:border-orange-500 outline-none"
                    >
                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>
                <button 
                    onClick={handleSaveIngredient}
                    className="w-full bg-green-700 hover:bg-green-600 text-white py-2 rounded flex items-center justify-center gap-2 transition-colors font-bold shadow-sm"
                >
                    {editingId ? <Save size={18} /> : <Plus size={18} />}
                    {editingId ? '更新食材' : '添加食材'}
                </button>
                {editingId && (
                    <button onClick={() => { setEditingId(null); setFormData({name:'', emoji:'🍲', seconds:60, type:IngredientType.OTHER}); }} className="w-full mt-2 text-stone-400 text-sm hover:text-white">取消编辑</button>
                )}

                <div className="relative pt-2">
                    <Search className="absolute left-3 top-5 text-stone-500" size={16} />
                    <input 
                        placeholder="搜索食材列表..."
                        value={adminSearch}
                        onChange={e => setAdminSearch(e.target.value)}
                        className="w-full bg-stone-900 text-white pl-10 pr-4 py-2 rounded-xl border border-stone-700 outline-none focus:border-orange-500"
                    />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto hide-scrollbar p-4 space-y-2">
                {filteredIngredients.map(ing => (
                    <div key={ing.id} className={`flex items-center justify-between bg-stone-800 p-3 rounded border transition-colors ${ing.isPinned ? 'border-orange-500/50' : 'border-white/5'}`}>
                        <div className="flex items-center gap-3">
                            <span className="text-2xl">{ing.emoji}</span>
                            <div>
                                <div className="text-white font-bold flex items-center gap-2">
                                    {ing.name}
                                    {ing.isPinned && <Pin size={10} className="text-orange-500" />}
                                </div>
                                <div className="text-xs text-stone-400">{ing.type} • {ing.seconds}s</div>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button 
                                onClick={() => togglePin(ing.id)} 
                                className={`p-2 rounded transition-colors ${ing.isPinned ? 'text-orange-500 bg-orange-900/20' : 'text-stone-400 bg-stone-700'}`}
                            >
                                <Pin size={16} />
                            </button>
                            <button onClick={() => handleEdit(ing)} className="p-2 text-blue-400 bg-blue-900/20 hover:bg-blue-900/40 rounded transition-colors px-3">编辑</button>
                            <button onClick={() => handleDelete(ing.id)} className="p-2 text-red-400 bg-red-900/20 hover:bg-red-900/40 rounded transition-colors"><Trash2 size={16}/></button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </div>
  );
};

export default AdminPanel;
