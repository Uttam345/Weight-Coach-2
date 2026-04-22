import React, { useEffect, useState } from 'react';
import { Flame, Droplets, Target, Award, Plus } from 'lucide-react';
import { useNutritionStore } from '../../store/nutritionStore';
import { MacroRing } from '../../components/ui/MacroRing';
import { FoodSearchModal } from '../../components/ui/FoodSearchModal';

const Nutrition = () => {
    const { currentLog, isLoading, fetchDailyLog, goals, addMealEntry, addWater } = useNutritionStore();
    const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

    useEffect(() => {
        // Only fetch if we haven't already or need a refresh
        fetchDailyLog();
    }, [fetchDailyLog]);

    const handleAddWater = () => {
        addWater(330); // Approximate 1/3L
    };

    // Calculate totals
    const meals = currentLog?.meals || { breakfast: [], lunch: [], dinner: [], snack: [] };
    const allEntries = [...meals.breakfast, ...meals.lunch, ...meals.dinner, ...meals.snack];
    
    const consumed = allEntries.reduce((acc, curr) => ({
        calories: acc.calories + curr.calories,
        protein: acc.protein + curr.protein,
        carbs: acc.carbs + curr.carbs,
        fat: acc.fat + curr.fat
    }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

    const totalMeals = Object.values(meals).reduce((acc, curr) => acc + (curr.length > 0 ? 1 : 0), 0);
    const waterConsumed = currentLog?.waterIntake || 0;

    return (
        <div className="flex flex-col gap-6 animate-fade-in relative z-10 pb-20 md:pb-0">
            <header className="mb-4">
                <h1 className="text-3xl font-display font-bold mb-2">Macro Precision</h1>
                <p className="text-gray-400">Track strictly. Eat for performance.</p>
            </header>

            {/* Daily summary rings */}
            <div className="bg-dark-800 border border-glass-border p-6 rounded-3xl grid grid-cols-1 md:grid-cols-4 gap-8 mb-4">
                <div className="flex flex-col items-center justify-center col-span-1 md:col-span-2 relative">
                    <div className="absolute top-0 left-0 right-0 h-[100px] bg-primary/10 blur-[80px] rounded-full" />
                    <MacroRing 
                        caloriesConsumed={consumed.calories} 
                        caloriesGoal={goals.calories} 
                    />
                </div>

                <div className="flex flex-col justify-center gap-6 col-span-1 md:col-span-2">
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm font-bold">
                            <span className="text-gray-400">Protein</span>
                            <span className="text-white">{consumed.protein}g <span className="text-gray-500 font-medium">/ {goals.protein}g</span></span>
                        </div>
                        <div className="h-2 w-full bg-dark-900 rounded-full overflow-hidden">
                            <div className="h-full bg-green-400 rounded-full transition-all duration-500" style={{ width: `${Math.min((consumed.protein / goals.protein) * 100, 100)}%` }} />
                        </div>
                    </div>
                    
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm font-bold">
                            <span className="text-gray-400">Carbs</span>
                            <span className="text-white">{consumed.carbs}g <span className="text-gray-500 font-medium">/ {goals.carbs}g</span></span>
                        </div>
                        <div className="h-2 w-full bg-dark-900 rounded-full overflow-hidden">
                            <div className="h-full bg-yellow-400 rounded-full transition-all duration-500" style={{ width: `${Math.min((consumed.carbs / goals.carbs) * 100, 100)}%` }} />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between text-sm font-bold">
                            <span className="text-gray-400">Fats</span>
                            <span className="text-white">{consumed.fat}g <span className="text-gray-500 font-medium">/ {goals.fat}g</span></span>
                        </div>
                        <div className="h-2 w-full bg-dark-900 rounded-full overflow-hidden">
                            <div className="h-full bg-red-400 rounded-full transition-all duration-500" style={{ width: `${Math.min((consumed.fat / goals.fat) * 100, 100)}%` }} />
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <button 
                    onClick={() => setIsSearchModalOpen(true)}
                    className="bg-primary hover:bg-primary/90 text-dark-900 flex items-center justify-center gap-3 p-4 rounded-2xl font-bold transition-all shadow-[0_5px_15px_-5px_rgba(204,255,0,0.4)]"
                >
                    <Flame className="w-5 h-5" /> Quick Add Meal
                </button>
                <button 
                    onClick={handleAddWater}
                    className="bg-glass hover:bg-white/10 border border-glass-border text-white flex items-center justify-center gap-3 p-4 rounded-2xl font-bold transition-all"
                >
                    <Droplets className="w-5 h-5 text-accent-blue" /> Log Water ({waterConsumed}ml)
                </button>
            </div>

            {/* Meal History */}
            <div className="bg-dark-800 border border-glass-border rounded-3xl p-6 mt-4">
                <h3 className="font-bold text-lg mb-4 flex items-center justify-between">
                    Today's Log 
                    <span className="text-xs text-primary font-bold bg-primary/10 px-2 py-1 rounded">{totalMeals} MEALS</span>
                </h3>
                
                {isLoading && <div className="text-center p-4 text-gray-500">Loading meals...</div>}
                {!isLoading && allEntries.length === 0 && (
                    <div className="text-center p-8 bg-dark-900 rounded-xl border border-white/5">
                        <p className="text-gray-500 mb-4">No meals logged today.</p>
                        <button 
                            onClick={() => setIsSearchModalOpen(true)}
                            className="text-primary font-bold flex items-center justify-center gap-2 mx-auto hover:underline"
                        >
                            <Plus className="w-4 h-4" /> Add your first meal
                        </button>
                    </div>
                )}
                
                <div className="space-y-4">
                    {Object.entries(meals).map(([mealType, items]) => {
                        if (items.length === 0) return null;
                        
                        const mealCals = items.reduce((sum, item) => sum + item.calories, 0);
                        const mealPro = items.reduce((sum, item) => sum + item.protein, 0);
                        
                        return (
                            <div key={mealType} className="flex flex-col bg-dark-900 p-4 rounded-xl border border-white/5">
                                <div className="flex justify-between items-center mb-3">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-lg bg-white/5 text-white flex items-center justify-center capitalize">
                                            <Target className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold capitalize">{mealType}</h4>
                                            <p className="text-xs text-gray-500">{items.length} items</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-bold">{mealCals} kcal</div>
                                        <div className="text-xs text-gray-500">PRO: {mealPro}g</div>
                                    </div>
                                </div>
                                <div className="pl-14 space-y-2 border-t border-white/5 pt-3">
                                    {items.map((item, idx) => (
                                        <div key={idx} className="flex justify-between text-sm">
                                            <span className="text-gray-400">{item.name} <span className="text-xs">({item.portion}{item.unit})</span></span>
                                            <span className="text-white font-medium">{item.calories} kcal</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <FoodSearchModal 
                isOpen={isSearchModalOpen}
                onClose={() => setIsSearchModalOpen(false)}
                onAdd={addMealEntry}
            />
        </div>
    );
};

export default Nutrition;
