import { Play, CheckCircle2, ChevronRight } from 'lucide-react';

const Workouts = () => {
    const routine = [
        { name: "Barbell Bench Press", sets: "4 sets x 8-10 reps", done: true },
        { name: "Incline Dumbbell Press", sets: "3 sets x 10-12 reps", done: false },
        { name: "Chest Flyes (Cable)", sets: "3 sets x 15 reps", done: false },
        { name: "Triceps Pushdown", sets: "4 sets x 12 reps", done: false }
    ];

    return (
        <div className="flex flex-col gap-6 animate-fade-in relative z-10 pb-20 md:pb-0">
            <header className="mb-4 flex flex-col md:flex-row justify-between md:items-end gap-4">
                <div>
                    <h1 className="text-3xl font-display font-bold mb-2">Training Hub</h1>
                    <p className="text-gray-400">Hypertrophy Chest & Triceps (Week 4)</p>
                </div>
                <button className="bg-primary hover:bg-primary-hover text-dark-900 font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(204,255,0,0.3)] transition-all">
                    <Play className="w-5 h-5 fill-dark-900" /> Start Workout
                </button>
            </header>

            {/* Current Routine Block */}
            <div className="bg-dark-800 border border-glass-border p-6 rounded-3xl">
                <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-accent-blue shadow-[0_0_10px_rgba(0,209,255,0.8)]" /> 
                    Today's Flow
                </h3>
                
                <div className="flex flex-col gap-3">
                    {routine.map((ex, i) => (
                        <div key={i} className={`flex items-center justify-between p-4 rounded-2xl border ${ex.done ? 'bg-primary/5 border-primary/20' : 'bg-dark-900 border-white/5 hover:border-white/20 hover:bg-white/5 cursor-pointer'} transition-all`}>
                            <div className="flex items-center gap-4">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${ex.done ? 'bg-primary text-dark-900' : 'bg-dark-800 border border-gray-600 text-gray-600'}`}>
                                    {ex.done ? <CheckCircle2 className="w-5 h-5" /> : i + 1}
                                </div>
                                <div>
                                    <h4 className={`font-bold ${ex.done ? 'text-white' : 'text-gray-300'}`}>{ex.name}</h4>
                                    <p className="text-sm text-gray-500">{ex.sets}</p>
                                </div>
                            </div>
                            <ChevronRight className="w-5 h-5 text-gray-600" />
                        </div>
                    ))}
                </div>
            </div>

            {/* Previous Activity */}
            <div className="mt-4">
                <h3 className="font-bold text-lg mb-4 text-gray-400 px-2">Past Sessions</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-glass border border-glass-border p-4 rounded-2xl flex items-center justify-between opacity-70">
                        <div>
                            <div className="text-xs font-bold text-primary mb-1">YESTERDAY</div>
                            <h4 className="font-bold">Legs & Core</h4>
                            <p className="text-xs text-gray-500">Volume: 12,400 lbs</p>
                        </div>
                        <div className="text-gray-400 font-bold">60m</div>
                    </div>
                    <div className="bg-glass border border-glass-border p-4 rounded-2xl flex items-center justify-between opacity-70">
                        <div>
                            <div className="text-xs font-bold text-gray-500 mb-1">TUESDAY</div>
                            <h4 className="font-bold">Active Recovery</h4>
                            <p className="text-xs text-gray-500">Yoga & Mobility</p>
                        </div>
                        <div className="text-gray-400 font-bold">25m</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Workouts;
