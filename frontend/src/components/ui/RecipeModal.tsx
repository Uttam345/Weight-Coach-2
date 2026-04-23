import React from 'react';
import { Play, Check, X as XIcon, Plus, Info, Clock, Flame, Utensils } from 'lucide-react';
import type { MealSuggestion } from '../../store/kitchenStore';

interface RecipeModalProps {
    suggestion: MealSuggestion;
    onClose: () => void;
    onCook: () => void;
    onAddMissing: (items: {name: string, qty: number, unit: string, category: string}[]) => void;
}

const RecipeModal: React.FC<RecipeModalProps> = ({ suggestion, onClose, onCook, onAddMissing }) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
            <div className="bg-dark-800 border border-glass-border w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl my-auto flex flex-col max-h-[90vh]">
                
                {/* Header Image Area (Gradient placeholder) */}
                <div className="h-48 bg-gradient-to-br from-green-500/20 to-dark-900 relative flex-shrink-0">
                    <button 
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/80 rounded-full transition-colors text-white"
                    >
                        <XIcon className="w-5 h-5" />
                    </button>
                    <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-dark-800 to-transparent">
                        <h2 className="text-3xl font-display font-bold text-white">{suggestion.title}</h2>
                    </div>
                </div>

                {/* Scrollable Content */}
                <div className="p-6 overflow-y-auto flex-1 space-y-6 custom-scrollbar">
                    
                    {/* Macros Pill Row */}
                    <div className="flex gap-2 flex-wrap">
                        <div className="bg-dark-900 border border-white/5 py-2 px-4 rounded-xl flex items-center gap-2">
                            <Flame className="w-4 h-4 text-primary" />
                            <span className="font-bold">{suggestion.macros.calories} kcal</span>
                        </div>
                        <div className="bg-dark-900 border border-white/5 py-2 px-4 rounded-xl text-sm">
                            <span className="text-gray-500">PRO</span> <span className="font-bold text-green-400">{suggestion.macros.protein}g</span>
                        </div>
                        <div className="bg-dark-900 border border-white/5 py-2 px-4 rounded-xl text-sm">
                            <span className="text-gray-500">CARB</span> <span className="font-bold text-yellow-400">{suggestion.macros.carbs}g</span>
                        </div>
                        <div className="bg-dark-900 border border-white/5 py-2 px-4 rounded-xl text-sm">
                            <span className="text-gray-500">FAT</span> <span className="font-bold text-red-400">{suggestion.macros.fat}g</span>
                        </div>
                        <a 
                            href={suggestion.videoSearchQuery}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 py-2 px-4 rounded-xl flex items-center gap-2 text-sm font-bold transition-colors ml-auto"
                        >
                            <Play className="w-4 h-4 fill-red-400" /> Watch Video
                        </a>
                    </div>

                    {/* Ingredients Split */}
                    <div>
                        <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                            <Utensils className="w-5 h-5 text-gray-400" /> Ingredients
                        </h3>
                        <div className="bg-dark-900 border border-white/5 rounded-2xl p-4">
                            
                            {/* In Stock */}
                            <div className="space-y-2 mb-4">
                                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">From Your Pantry</h4>
                                {suggestion.ingredients.map((ing, i) => (
                                    <div key={i} className="flex justify-between items-center text-sm">
                                        <div className="flex items-center gap-2">
                                            {ing.available ? (
                                                <div className="w-4 h-4 rounded-full bg-green-500/20 flex items-center justify-center">
                                                    <Check className="w-3 h-3 text-green-500" />
                                                </div>
                                            ) : (
                                                <div className="w-4 h-4 rounded-full bg-red-500/20 flex items-center justify-center">
                                                    <XIcon className="w-3 h-3 text-red-500" />
                                                </div>
                                            )}
                                            <span className={ing.available ? 'text-gray-200' : 'text-gray-500 line-through'}>{ing.name}</span>
                                        </div>
                                        <span className="text-gray-500">{ing.qty} {ing.unit}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Missing */}
                            {suggestion.missingIngredients.length > 0 && (
                                <div className="space-y-2 pt-4 border-t border-white/5">
                                    <div className="flex justify-between items-center mb-2">
                                        <h4 className="text-xs font-bold text-red-400 uppercase tracking-wider">Missing Items</h4>
                                        <button 
                                            onClick={() => onAddMissing(suggestion.missingIngredients.map(m => ({...m, qty: parseFloat(m.qty) || 1, category: 'other'})))}
                                            className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                                        >
                                            <Plus className="w-3 h-3" /> Add to Shopping List
                                        </button>
                                    </div>
                                    {suggestion.missingIngredients.map((ing, i) => (
                                        <div key={i} className="flex justify-between items-center text-sm text-red-300/80">
                                            <span className="flex items-center gap-2">
                                                <span className="w-1 h-1 rounded-full bg-red-500" /> {ing.name}
                                            </span>
                                            <span>{ing.qty} {ing.unit}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Steps */}
                    <div>
                        <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                            <Clock className="w-5 h-5 text-gray-400" /> Instructions
                        </h3>
                        <div className="space-y-4">
                            {suggestion.steps.map((step, i) => (
                                <div key={i} className="flex gap-4">
                                    <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                                        {i + 1}
                                    </div>
                                    <p className="text-sm text-gray-300 leading-relaxed">{step}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>

                {/* Footer Action */}
                <div className="p-6 border-t border-glass-border bg-dark-800 flex-shrink-0">
                    <button 
                        onClick={onCook}
                        className="w-full bg-primary hover:bg-primary/90 text-dark-900 font-bold py-3.5 rounded-xl transition-all shadow-[0_5px_15px_-5px_rgba(204,255,0,0.5)] flex items-center justify-center gap-2 text-lg"
                    >
                        <ChefHatIcon className="w-5 h-5" /> I Cooked This!
                    </button>
                    <p className="text-center text-xs text-gray-500 mt-3 flex items-center justify-center gap-1">
                        <Info className="w-3 h-3" /> Ingredients will be deducted from your pantry.
                    </p>
                </div>
            </div>
        </div>
    );
};

// Quick mock icon for the button above since ChefHat is imported in parent but not here
const ChefHatIcon = (props: any) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M12 2l3 6 4-1-2 5h-10l-2-5 4 1 3-6z"/><path d="M6 12v8h12v-8"/></svg>
);

export default RecipeModal;
