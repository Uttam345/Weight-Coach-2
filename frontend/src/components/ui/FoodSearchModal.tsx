import React, { useState, useEffect } from 'react';
import { searchFoods, type FoodSearchResult } from '../../services/foodService';
import { X, Search, Plus } from 'lucide-react';

interface FoodSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (mealType: string, food: any) => void;
}

export const FoodSearchModal: React.FC<FoodSearchModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<FoodSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [mealType, setMealType] = useState('breakfast');
  const [portion, setPortion] = useState('100');

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (query.length >= 2) {
        setIsLoading(true);
        const data = await searchFoods(query);
        setResults(data);
        setIsLoading(false);
      } else {
        setResults([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  if (!isOpen) return null;

  const handleAdd = (food: FoodSearchResult) => {
    const p = parseFloat(portion) || 100;
    const multiplier = p / 100;
    
    onAdd(mealType, {
      name: food.name,
      calories: Math.round(food.calories * multiplier),
      protein: Math.round(food.protein * multiplier),
      carbs: Math.round(food.carbs * multiplier),
      fat: Math.round(food.fat * multiplier),
      portion: p,
      unit: 'g'
    });
    
    onClose();
    setQuery('');
    setResults([]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-dark-800 border border-glass-border w-full max-w-md rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[80vh]">
        <div className="p-4 border-b border-white/5 flex justify-between items-center bg-dark-900">
          <h2 className="text-xl font-bold">Add Meal</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>
        
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

        <div className="p-4 border-b border-white/5">
          <div className="relative flex items-center">
            <Search className="absolute left-3 w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="Search Open Food Facts..."
              className="w-full bg-dark-900 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-primary transition-colors"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div className="mt-3 flex items-center gap-2">
            <label className="text-sm text-gray-400 font-bold">Portion (g/ml):</label>
            <input 
              type="number" 
              value={portion} 
              onChange={(e) => setPortion(e.target.value)}
              className="bg-dark-900 border border-white/10 rounded-lg py-1 px-3 w-24 text-white"
            />
          </div>
        </div>

        <div className="overflow-y-auto p-2 flex-1">
          {isLoading ? (
            <div className="text-center p-8 text-gray-500">Searching...</div>
          ) : results.length > 0 ? (
            <ul className="space-y-2">
              {results.map((food) => (
                <li key={food.id} className="flex items-center justify-between p-3 bg-dark-900 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/10">
                  <div className="flex-1 pr-4">
                    <h4 className="font-bold text-sm">{food.name}</h4>
                    {food.brand && <p className="text-xs text-gray-500">{food.brand}</p>}
                    <div className="flex gap-3 mt-1 text-xs font-medium text-gray-400">
                      <span>{Math.round(food.calories)} kcal</span>
                      <span className="text-green-400">P: {Math.round(food.protein)}g</span>
                      <span className="text-yellow-400">C: {Math.round(food.carbs)}g</span>
                      <span className="text-red-400">F: {Math.round(food.fat)}g</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleAdd(food)}
                    className="p-2 bg-primary/10 text-primary hover:bg-primary/20 rounded-full transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </li>
              ))}
            </ul>
          ) : query.length >= 2 ? (
            <div className="text-center p-8 text-gray-500">No foods found.</div>
          ) : (
            <div className="text-center p-8 text-gray-600 flex flex-col items-center">
              <Search className="w-8 h-8 mb-2 opacity-50" />
              <p>Type to search the global food database.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
