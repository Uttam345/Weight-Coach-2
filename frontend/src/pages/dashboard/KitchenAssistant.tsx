import { useState } from 'react';
import { Search, Package, Youtube, Play, Plus, Zap, ChefHat, Loader2 } from 'lucide-react';
import { aiApi } from '../../services/api';

const KitchenAssistant = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [analysisResult, setAnalysisResult] = useState<{name: string; cals: number; pro: number; carb: number; fat: number} | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    const handleAnalyze = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchQuery || isAnalyzing) return;
        
        setIsAnalyzing(true);
        setAnalysisResult(null);

        try {
            const data = await aiApi.analyzeFood(searchQuery);
            setAnalysisResult({
                name: data.name || searchQuery,
                cals: data.cals || 0,
                pro: data.pro || 0,
                carb: data.carb || 0,
                fat: data.fat || 0,
            });
        } catch (error) {
            console.error("Analysis Error:", error);
            alert("Could not analyze food perfectly. Ensure backend is synced!");
        } finally {
            setIsAnalyzing(false);
            setSearchQuery('');
        }
    };

    return (
        <div className="flex flex-col gap-8 pb-20 md:pb-0 animate-fade-in relative z-10 w-full max-w-5xl mx-auto">
            <header className="flex flex-col md:flex-row justify-between md:items-end gap-4 border-b border-white/5 pb-4">
                <div>
                    <h1 className="text-3xl md:text-4xl font-display font-bold mb-2 flex items-center gap-3">
                        <ChefHat className="w-8 h-8 text-green-400" />
                        Kitchen OS
                    </h1>
                    <p className="text-gray-400">Inventory synced. Goals mapped. Let's cook.</p>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Analyzer & Pantry */}
                <div className="col-span-1 lg:col-span-1 flex flex-col gap-6">
                    {/* Food Analyzer */}
                    <div className="bg-dark-800 border border-glass-border p-6 rounded-3xl">
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                            <Search className="w-5 h-5 text-gray-400" /> Goal Analyzer
                        </h3>
                        <form onSubmit={handleAnalyze} className="relative mb-6">
                            <input 
                                type="text"
                                placeholder="Scan food (e.g. Ribeye Steak)"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-dark-900 border border-glass-border rounded-xl py-3 pl-4 pr-12 outline-none focus:border-green-400/50 transition flex-1 text-sm placeholder:text-gray-600"
                            />
                            <button type="submit" disabled={isAnalyzing} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 w-8 h-8 flex items-center justify-center bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition disabled:opacity-50">
                                {isAnalyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                            </button>
                        </form>

                        {analysisResult && (
                            <div className="bg-dark-900 border border-green-500/20 rounded-2xl p-4 animate-fade-in relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-1 h-full bg-green-400" />
                                <h4 className="font-bold mb-3 capitalize truncate">{analysisResult.name}</h4>
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div><span className="text-gray-500 text-xs block">Kcal</span><span className="font-bold">{analysisResult.cals}</span></div>
                                    <div><span className="text-gray-500 text-xs block">Protein</span><span className="font-bold text-green-400">{analysisResult.pro}g</span></div>
                                    <div><span className="text-gray-500 text-xs block">Carbs</span><span className="font-bold text-yellow-400">{analysisResult.carb}g</span></div>
                                    <div><span className="text-gray-500 text-xs block">Fats</span><span className="font-bold text-red-400">{analysisResult.fat}g</span></div>
                                </div>
                                <button className="w-full mt-4 bg-glass border border-glass-border hover:bg-white/5 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2">
                                    <Plus className="w-3 h-3" /> Log to Dashboard
                                </button>
                            </div>
                        )}
                        {!analysisResult && !isAnalyzing && (
                            <p className="text-xs text-gray-500 text-center">Type any food to see how it impacts your daily macro targets.</p>
                        )}
                        {isAnalyzing && (
                            <p className="text-xs text-green-400 text-center animate-pulse">Running Neural Scan...</p>
                        )}
                    </div>

                    {/* Pantry Core */}
                    <div className="bg-dark-800 border border-glass-border p-6 rounded-3xl flex-1">
                        <h3 className="font-bold text-lg mb-4 flex items-center justify-between">
                            <span className="flex items-center gap-2"><Package className="w-5 h-5 text-gray-400" /> Smart Stock</span>
                            <span className="text-xs font-bold bg-dark-900 px-2 py-1 rounded text-gray-500">8 ITEMS</span>
                        </h3>
                        <div className="space-y-3">
                            {['Whey Isolate', 'Egg Whites', 'Chicken Breast', 'Jasmine Rice', 'Almond Milk'].map(item => (
                                <div key={item} className="flex justify-between items-center text-sm border-b border-white/5 pb-2 last:border-0">
                                    <span className="text-gray-300">{item}</span>
                                    <span className="text-green-500 font-bold text-xs uppercase bg-green-500/10 px-2 py-0.5 rounded">In Stock</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Column: Recipe Engine */}
                <div className="col-span-1 lg:col-span-2 bg-dark-800 border border-glass-border rounded-3xl p-6 md:p-8 flex flex-col relative overflow-hidden group hover:border-green-500/30 transition-colors">
                    <div className="absolute right-[-10%] top-[-10%] w-[200px] h-[200px] bg-green-500/10 blur-[60px] rounded-full pointer-events-none" />
                    
                    <div className="flex justify-between items-start mb-6 relative z-10">
                        <div>
                            <span className="text-xs font-bold text-green-400 tracking-widest uppercase mb-1 block">AI Generated Recipe</span>
                            <h2 className="text-3xl font-display font-bold mb-2 text-white">Anabolic French Toast</h2>
                            <p className="text-gray-400">Utilizing <span className="text-white">Egg Whites</span> and <span className="text-white">Bread</span> from your Smart Stock.</p>
                        </div>
                        <div className="bg-dark-900 px-4 py-2 rounded-xl border border-white/10 text-center">
                            <span className="text-xs text-gray-500 block">TOTAL MACROS</span>
                            <span className="font-bold font-display text-lg text-green-400">45g PRO</span>
                        </div>
                    </div>

                    {/* Mock Video Player Workspace */}
                    <div className="w-full aspect-video bg-dark-900 rounded-2xl border border-glass-border overflow-hidden relative z-10 shadow-2xl mb-6 group cursor-pointer group-hover:border-white/20 transition-all">
                        {/* Thumbnail background representation */}
                        <div className="absolute inset-0 bg-gradient-to-br from-dark-800 to-black flex flex-col items-center justify-center">
                            <div className="w-16 h-16 rounded-full bg-red-500/90 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-red-500 transition-transform shadow-[0_0_30px_rgba(239,68,68,0.4)]">
                                <Play className="w-8 h-8 text-white fill-white ml-1" />
                            </div>
                            <span className="font-display font-bold text-lg text-white">Anabolic French Toast Guide</span>
                            <span className="text-gray-400 text-sm">Chef Coach Nova • 8:42</span>
                        </div>
                        {/* Video progress bar mock */}
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
                            <div className="h-full bg-red-500 w-1/3" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 relative z-10">
                        <div>
                            <h4 className="font-bold text-sm text-gray-400 mb-3 uppercase">Ingredients</h4>
                            <ul className="text-sm space-y-2 text-gray-200">
                                <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-green-400" /> 4 slices regular white bread</li>
                                <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-green-400" /> 1 cup liquid egg whites</li>
                                <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-green-400" /> 1 packet zero-cal sweetener</li>
                                <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-green-400" /> Dash of cinnamon & vanilla</li>
                            </ul>
                        </div>
                        
                        <div className="bg-glass border border-glass-border rounded-2xl p-4">
                            <div className="flex items-center gap-2 mb-2 text-green-400">
                                <Play className="w-4 h-4 fill-green-400" />
                                <span className="font-bold text-sm">Action Assistant</span>
                            </div>
                            <p className="text-sm text-gray-400 mb-4 line-clamp-3">
                                Soak the bread thoroughly in the egg white mixture. Pan fry on medium heat until golden brown. Serve with sugar-free syrup to hit your 45g protein target without overflowing carbs.
                            </p>
                            <button className="w-full bg-white text-dark-900 flex items-center justify-center gap-2 font-bold py-2 rounded-xl text-sm hover:bg-gray-200 transition">
                                <Youtube className="w-4 h-4 fill-red-500 text-red-500" /> Play Full Tutorial
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default KitchenAssistant;
