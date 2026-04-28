import React, { useState } from 'react';
import { aiApi } from '../../services/api';
import { X, Search, Plus, Sparkles, Edit2 } from 'lucide-react';

interface FoodSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (mealType: string, food: any) => void;
}

export const FoodSearchModal: React.FC<FoodSearchModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [activeTab, setActiveTab] = useState<'ai' | 'manual'>('ai');
  const [mealType, setMealType] = useState('breakfast');
  
  // AI Search state
  const [query, setQuery] = useState('');
  const [aiResult, setAiResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Manual Add state
  const [manualForm, setManualForm] = useState({
    name: '',
    calories: '',
    protein: '',
    carbs: '',
    fat: '',
    portion: '100',
    unit: 'g'
  });

  if (!isOpen) return null;

  const handleAiSearch = async () => {
    if (!query.trim()) return;
    setIsLoading(true);
    setError('');
    try {
      const data = await aiApi.analyzeFood(query);
      setAiResult(data);
    } catch (err: any) {
      setError(err.message || 'Failed to analyze food. Try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddAiResult = () => {
    if (!aiResult) return;
    
    onAdd(mealType, {
      name: aiResult.name,
      calories: aiResult.cals,
      protein: aiResult.pro,
      carbs: aiResult.carb,
      fat: aiResult.fat,
      portion: 1, // AI usually gives total for the meal described
      unit: 'serving'
    });
    
    resetAndClose();
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualForm.name || !manualForm.calories) return;

    onAdd(mealType, {
      name: manualForm.name,
      calories: Number(manualForm.calories),
      protein: Number(manualForm.protein || 0),
      carbs: Number(manualForm.carbs || 0),
      fat: Number(manualForm.fat || 0),
      portion: Number(manualForm.portion || 100),
      unit: manualForm.unit || 'g'
    });

    resetAndClose();
  };

  const resetAndClose = () => {
    setQuery('');
    setAiResult(null);
    setManualForm({ name: '', calories: '', protein: '', carbs: '', fat: '', portion: '100', unit: 'g' });
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-dark-800 border border-glass-border w-full max-w-md rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        <div className="p-4 border-b border-white/5 flex justify-between items-center bg-dark-900">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Plus className="w-5 h-5 text-primary" />
            Add Meal
          </h2>
          <button onClick={resetAndClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>
        
        {/* Meal Type Selector */}
        <div className="p-4 flex gap-2 overflow-x-auto border-b border-white/5 hide-scrollbar">
          {['breakfast', 'lunch', 'dinner', 'snack'].map((type) => (
            <button
              key={type}
              onClick={() => setMealType(type)}
              className={`px-4 py-1.5 rounded-full text-sm font-bold capitalize whitespace-nowrap transition-colors ${
                mealType === type ? 'bg-primary text-dark-900' : 'bg-dark-900 text-gray-400 hover:text-white'
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/5">
          <button
            onClick={() => setActiveTab('ai')}
            className={`flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${
              activeTab === 'ai' ? 'text-primary border-b-2 border-primary bg-white/5' : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Sparkles className="w-4 h-4" /> AI Estimate
          </button>
          <button
            onClick={() => setActiveTab('manual')}
            className={`flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${
              activeTab === 'manual' ? 'text-primary border-b-2 border-primary bg-white/5' : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Edit2 className="w-4 h-4" /> Manual Add
          </button>
        </div>

        <div className="overflow-y-auto p-4 flex-1 hide-scrollbar">
          {activeTab === 'ai' ? (
            <div className="space-y-4">
              <p className="text-sm text-gray-400">
                Describe your meal and let AI estimate the macros. 
                <br/>Example: <span className="italic text-gray-300">"2 scrambled eggs with a slice of sourdough toast"</span>
              </p>
              
              <div className="relative flex items-center gap-2">
                <input
                  type="text"
                  placeholder="What did you eat?"
                  className="flex-1 bg-dark-900 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-primary transition-colors"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAiSearch()}
                />
                <button 
                  onClick={handleAiSearch}
                  disabled={isLoading || !query.trim()}
                  className="bg-primary text-dark-900 p-3 rounded-xl hover:bg-primary/90 disabled:opacity-50 transition-colors"
                >
                  <Search className="w-5 h-5" />
                </button>
              </div>

              {error && <div className="text-red-400 text-sm p-3 bg-red-400/10 rounded-xl border border-red-400/20">{error}</div>}

              {isLoading && (
                <div className="text-center p-8 space-y-3">
                  <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto" />
                  <p className="text-gray-400 text-sm animate-pulse">Analyzing nutritional content...</p>
                </div>
              )}

              {aiResult && !isLoading && (
                <div className="bg-dark-900 p-4 rounded-xl border border-white/10 space-y-4 animate-fade-in">
                  <h3 className="font-bold text-lg">{aiResult.name}</h3>
                  <div className="grid grid-cols-4 gap-2 text-center">
                    <div className="bg-white/5 rounded-lg p-2">
                      <div className="text-xs text-gray-500 mb-1">CALS</div>
                      <div className="font-bold text-white">{aiResult.cals}</div>
                    </div>
                    <div className="bg-green-400/10 rounded-lg p-2">
                      <div className="text-xs text-green-500 mb-1">PRO</div>
                      <div className="font-bold text-green-400">{aiResult.pro}g</div>
                    </div>
                    <div className="bg-yellow-400/10 rounded-lg p-2">
                      <div className="text-xs text-yellow-500 mb-1">CARB</div>
                      <div className="font-bold text-yellow-400">{aiResult.carb}g</div>
                    </div>
                    <div className="bg-red-400/10 rounded-lg p-2">
                      <div className="text-xs text-red-500 mb-1">FAT</div>
                      <div className="font-bold text-red-400">{aiResult.fat}g</div>
                    </div>
                  </div>
                  <button
                    onClick={handleAddAiResult}
                    className="w-full bg-primary text-dark-900 font-bold py-3 rounded-xl hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                  >
                    <Plus className="w-5 h-5" /> Add to {mealType}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={handleManualSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-sm text-gray-400 font-bold">Food Name *</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Chicken Breast"
                  value={manualForm.name}
                  onChange={(e) => setManualForm({...manualForm, name: e.target.value})}
                  className="w-full bg-dark-900 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-primary transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm text-gray-400 font-bold">Calories *</label>
                  <input
                    required
                    type="number"
                    min="0"
                    placeholder="kcal"
                    value={manualForm.calories}
                    onChange={(e) => setManualForm({...manualForm, calories: e.target.value})}
                    className="w-full bg-dark-900 border border-white/10 rounded-xl py-2 px-4 text-white focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm text-gray-400 font-bold">Protein (g)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="g"
                    value={manualForm.protein}
                    onChange={(e) => setManualForm({...manualForm, protein: e.target.value})}
                    className="w-full bg-dark-900 border border-white/10 rounded-xl py-2 px-4 text-white focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm text-gray-400 font-bold">Carbs (g)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="g"
                    value={manualForm.carbs}
                    onChange={(e) => setManualForm({...manualForm, carbs: e.target.value})}
                    className="w-full bg-dark-900 border border-white/10 rounded-xl py-2 px-4 text-white focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm text-gray-400 font-bold">Fat (g)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="g"
                    value={manualForm.fat}
                    onChange={(e) => setManualForm({...manualForm, fat: e.target.value})}
                    className="w-full bg-dark-900 border border-white/10 rounded-xl py-2 px-4 text-white focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-white/5">
                <button
                  type="submit"
                  disabled={!manualForm.name || !manualForm.calories}
                  className="w-full bg-glass border border-glass-border text-white font-bold py-3 rounded-xl hover:bg-white/10 hover:text-primary transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Plus className="w-5 h-5" /> Save Entry
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

