import { useAuthStore } from '../../store/authStore';
import { Activity, Compass, Flame } from 'lucide-react';

const Overview = () => {
    const { user } = useAuthStore();

    return (
        <div className="flex flex-col gap-8 pb-20 md:pb-0 animate-fade-in">
            <header className="flex justify-between items-end">
                <div className="space-y-2">
                    <h1 className="text-3xl md:text-4xl font-display font-bold">Hey, <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent-blue">{user?.name || 'Athlete'}</span></h1>
                    <p className="text-gray-400">Your bio-profile is synced. Let's sculpt.</p>
                </div>
            </header>

            {/* Top Summaries */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-glass border border-glass-border p-6 rounded-2xl flex flex-col hover:border-primary/50 transition duration-300">
                    <div className="flex justify-between items-start mb-6">
                        <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                            <Activity className="w-6 h-6" />
                        </div>
                        <span className="px-2 py-1 bg-white/5 rounded-md text-xs font-semibold text-gray-400 border border-white/10">TODAY</span>
                    </div>
                    <h2 className="text-2xl font-bold mb-1">Hypertrophy Chest</h2>
                    <p className="text-gray-400 text-sm mb-6">6 Exercises • 45 Mins</p>
                    <div className="w-full h-1.5 bg-dark-900 rounded-full mb-3 overflow-hidden">
                        <div className="h-full bg-primary rounded-full w-[0%]" />
                    </div>
                    <span className="text-xs font-bold text-gray-500 uppercase">Not Started</span>
                </div>

                <div className="bg-glass border border-glass-border p-6 rounded-2xl flex flex-col hover:border-accent-blue/50 transition duration-300 overflow-hidden relative">
                    <div className="absolute right-[-10%] top-[-10%] w-[150px] h-[150px] bg-accent-blue/10 blur-[50px] rounded-full pointer-events-none" />
                    <div className="flex justify-between items-start mb-6 relative z-10">
                        <div className="w-12 h-12 rounded-full bg-accent-blue/20 flex items-center justify-center text-accent-blue">
                            <Compass className="w-6 h-6" />
                        </div>
                        <span className="px-2 py-1 bg-white/5 rounded-md text-xs font-semibold text-gray-400 border border-white/10">MACROS</span>
                    </div>
                    <div className="flex items-end gap-2 mb-1 relative z-10">
                        <h2 className="text-3xl font-display font-bold">1,450</h2>
                        <span className="text-gray-400 font-medium mb-1">/ 2500 kcal</span>
                    </div>
                    <p className="text-gray-500 text-sm mb-6 relative z-10">Remaining Budget</p>
                    <div className="flex gap-2 relative z-10 mt-auto">
                        <div className="flex-1 bg-dark-900 py-2 px-3 rounded-xl border border-white/5 text-center">
                            <div className="text-xs text-gray-500 mb-1">PRO</div>
                            <div className="font-bold text-sm text-green-400">120g</div>
                        </div>
                        <div className="flex-1 bg-dark-900 py-2 px-3 rounded-xl border border-white/5 text-center">
                            <div className="text-xs text-gray-500 mb-1">CARB</div>
                            <div className="font-bold text-sm text-yellow-400">200g</div>
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-dark-800 to-glass p-6 rounded-2xl border border-glass-border flex flex-col justify-between group hover:border-accent-purple/50 transition duration-300">
                    <div>
                        <div className="flex justify-between items-start mb-6">
                            <div className="w-12 h-12 rounded-full bg-accent-purple/20 flex items-center justify-center text-accent-purple relative">
                                <Flame className="w-6 h-6" />
                                <div className="absolute inset-0 bg-accent-purple/30 rounded-full animate-ping opacity-50 hidden group-hover:block" />
                            </div>
                            <span className="px-2 py-1 bg-accent-purple/20 text-accent-purple rounded-md text-xs font-bold border border-accent-purple/30">ACTIVE</span>
                        </div>
                        <h2 className="text-xl font-bold mb-2">AI Pro Coach</h2>
                        <p className="text-gray-400 text-sm leading-relaxed">
                            Your form was slightly off on deadlifts yesterday. Want me to walk you through a corrective warmup now?
                        </p>
                    </div>
                    <div className="mt-6 flex items-center text-accent-purple text-sm font-bold opacity-80 group-hover:opacity-100 transition tracking-wide cursor-pointer">
                        OPEN CHAT ↗
                    </div>
                </div>
            </div>

            {/* Weekly Progress Mock Segment */}
            <div className="mt-4 p-8 rounded-2xl bg-dark-800 border border-glass-border relative overflow-hidden hidden md:block">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12 translate-x-[-150%] animate-[slideUp_5s_infinite]" />
                <h3 className="text-lg font-bold mb-6">Activity Graph (Mock)</h3>
                <div className="w-full h-40 flex items-end justify-between px-2 gap-2">
                    {[40, 70, 45, 90, 65, 80, 50].map((height, i) => (
                        <div key={i} className="flex-1 bg-glass border border-glass-border hover:bg-primary/20 hover:border-primary/50 transition-all rounded-t-lg relative" style={{ height: `${height}%` }}>
                            {i === 3 && <div className="absolute top-[-25px] left-1/2 -translate-x-1/2 text-xs font-bold text-primary">LEG DAY</div>}
                        </div>
                    ))}
                </div>
                <div className="w-full flex justify-between mt-4 text-xs font-bold text-gray-500">
                    <span>MON</span><span>TUE</span><span>WED</span><span>THU</span><span>FRI</span><span>SAT</span><span>SUN</span>
                </div>
            </div>
        </div>
    );
};

export default Overview;
