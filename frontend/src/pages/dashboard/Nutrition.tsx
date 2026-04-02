import { Flame, Droplets, Target, Award } from 'lucide-react';

const Nutrition = () => {
    return (
        <div className="flex flex-col gap-6 animate-fade-in relative z-10 pb-20 md:pb-0">
            <header className="mb-4">
                <h1 className="text-3xl font-display font-bold mb-2">Macro Precision</h1>
                <p className="text-gray-400">Track strictly. Eat for performance.</p>
            </header>

            {/* Daily summary rings mock */}
            <div className="bg-dark-800 border border-glass-border p-6 rounded-3xl grid grid-cols-1 md:grid-cols-4 gap-8 mb-4">
                <div className="flex flex-col items-center justify-center col-span-1 md:col-span-2 relative">
                    <div className="absolute top-0 left-0 right-0 h-[100px] bg-primary/10 blur-[80px] rounded-full" />
                    {/* Fake radial progress */}
                    <div className="relative w-48 h-48 rounded-full border-[12px] border-dark-900 flex flex-col items-center justify-center shadow-[inset_0_0_20px_rgba(204,255,0,0.1)]">
                         {/* We fake the ring using a conic layout in css if needed, here just border colors */}
                         <div className="absolute inset-[-12px] rounded-full border-[12px] border-primary [clip-path:polygon(50%_50%,50%_0%,100%_0%,100%_70%,50%_50%)]" />
                         <span className="text-4xl font-display font-bold text-white z-10 block">1,450</span>
                         <span className="text-xs font-bold tracking-widest text-gray-500 uppercase z-10 block">KCAL LEFT</span>
                    </div>
                </div>

                <div className="flex flex-col justify-center gap-6 col-span-1 md:col-span-2">
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm font-bold">
                            <span className="text-gray-400">Protein</span>
                            <span className="text-white">120g <span className="text-gray-500 font-medium">/ 180g</span></span>
                        </div>
                        <div className="h-2 w-full bg-dark-900 rounded-full overflow-hidden">
                            <div className="h-full bg-green-400 rounded-full w-[66%]" />
                        </div>
                    </div>
                    
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm font-bold">
                            <span className="text-gray-400">Carbs</span>
                            <span className="text-white">200g <span className="text-gray-500 font-medium">/ 250g</span></span>
                        </div>
                        <div className="h-2 w-full bg-dark-900 rounded-full overflow-hidden">
                            <div className="h-full bg-yellow-400 rounded-full w-[80%]" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between text-sm font-bold">
                            <span className="text-gray-400">Fats</span>
                            <span className="text-white">45g <span className="text-gray-500 font-medium">/ 70g</span></span>
                        </div>
                        <div className="h-2 w-full bg-dark-900 rounded-full overflow-hidden">
                            <div className="h-full bg-red-400 rounded-full w-[64%]" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <button className="bg-primary hover:bg-primary/90 text-dark-900 flex items-center justify-center gap-3 p-4 rounded-2xl font-bold transition-all shadow-[0_5px_15px_-5px_rgba(204,255,0,0.4)]">
                    <Flame className="w-5 h-5" /> Quick Add Meal
                </button>
                <button className="bg-glass hover:bg-white/10 border border-glass-border text-white flex items-center justify-center gap-3 p-4 rounded-2xl font-bold transition-all">
                    <Droplets className="w-5 h-5 text-accent-blue" /> Log Water (1/3L)
                </button>
            </div>

            {/* Meal History */}
            <div className="bg-dark-800 border border-glass-border rounded-3xl p-6 mt-4">
                <h3 className="font-bold text-lg mb-4 flex items-center justify-between">Today's Log <span className="text-xs text-primary font-bold bg-primary/10 px-2 py-1 rounded">2 MEALS</span></h3>
                <div className="space-y-3">
                    <div className="flex justify-between items-center bg-dark-900 p-4 rounded-xl border border-white/5">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-lg bg-orange-500/20 text-orange-500 flex items-center justify-center">
                                <Award className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="font-bold">Breakfast</h4>
                                <p className="text-xs text-gray-500">Oatmeal & Protein Shake</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="font-bold">550 kcal</div>
                            <div className="text-xs text-gray-500">PRO: 45g</div>
                        </div>
                    </div>

                    <div className="flex justify-between items-center bg-dark-900 p-4 rounded-xl border border-white/5">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-lg bg-green-500/20 text-green-500 flex items-center justify-center">
                                <Target className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="font-bold">Lunch</h4>
                                <p className="text-xs text-gray-500">Chicken Breast, Rice & Broccoli</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="font-bold">700 kcal</div>
                            <div className="text-xs text-gray-500">PRO: 60g</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Nutrition;
