import { useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useNutritionStore } from '../../store/nutritionStore';
import { useWorkoutStore } from '../../store/workoutStore';
import { Activity, Compass, Flame, Dumbbell, Droplets } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Overview = () => {
    const { user } = useAuthStore();
    const navigate = useNavigate();
    const { currentLog, goals, fetchDailyLog } = useNutritionStore();
    const { todayWorkout, history, fetchTodayWorkout, fetchHistory } = useWorkoutStore();

    useEffect(() => {
        fetchDailyLog();
        fetchTodayWorkout();
        fetchHistory();
    }, [fetchDailyLog, fetchTodayWorkout, fetchHistory]);

    // Nutrition totals
    const meals = currentLog?.meals || { breakfast: [], lunch: [], dinner: [], snack: [] };
    const allEntries = [...meals.breakfast, ...meals.lunch, ...meals.dinner, ...meals.snack];
    const caloriesConsumed = allEntries.reduce((s, e) => s + e.calories, 0);
    const caloriesRemaining = goals.calories - caloriesConsumed;
    const proteinConsumed = allEntries.reduce((s, e) => s + e.protein, 0);
    const carbsConsumed = allEntries.reduce((s, e) => s + e.carbs, 0);
    const waterConsumed = currentLog?.waterIntake || 0;
    const calPct = Math.min((caloriesConsumed / goals.calories) * 100, 100);

    // Workout state
    const completedExercises = todayWorkout?.exercises.filter(e => e.done).length || 0;
    const totalExercises = todayWorkout?.exercises.length || 0;
    const workoutPct = totalExercises > 0 ? (completedExercises / totalExercises) * 100 : 0;

    // Last 7 days workout activity from history
    const last7Days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        return d.toISOString().split('T')[0];
    });
    const workoutsByDate = new Map(history.map(w => [w.date, w]));

    return (
        <div className="flex flex-col gap-8 pb-20 md:pb-0 animate-fade-in">
            <header className="flex justify-between items-end">
                <div className="space-y-2">
                    <h1 className="text-3xl md:text-4xl font-display font-bold">
                        Hey, <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent-blue">{user?.name?.split(' ')[0] || 'Athlete'}</span>
                    </h1>
                    <p className="text-gray-400">Your bio-profile is synced. Let's sculpt.</p>
                </div>
            </header>

            {/* Top Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Workout Card */}
                <div
                    onClick={() => navigate('/dashboard/workouts')}
                    className="bg-glass border border-glass-border p-6 rounded-2xl flex flex-col hover:border-primary/50 transition duration-300 cursor-pointer"
                >
                    <div className="flex justify-between items-start mb-6">
                        <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                            <Dumbbell className="w-6 h-6" />
                        </div>
                        <span className="px-2 py-1 bg-white/5 rounded-md text-xs font-semibold text-gray-400 border border-white/10">TODAY</span>
                    </div>
                    {todayWorkout ? (
                        <>
                            <h2 className="text-xl font-bold mb-1">{todayWorkout.name}</h2>
                            <p className="text-gray-400 text-sm mb-4">{completedExercises}/{totalExercises} exercises • {todayWorkout.durationMinutes}m</p>
                            <div className="w-full h-1.5 bg-dark-900 rounded-full overflow-hidden mt-auto">
                                <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${workoutPct}%` }} />
                            </div>
                            <span className="text-xs font-bold text-gray-500 uppercase mt-2">
                                {todayWorkout.isCompleted ? '✅ Completed' : `${Math.round(workoutPct)}% Done`}
                            </span>
                        </>
                    ) : (
                        <>
                            <h2 className="text-xl font-bold mb-1">No Session Yet</h2>
                            <p className="text-gray-400 text-sm mb-6">Tap to start today's workout</p>
                            <div className="w-full h-1.5 bg-dark-900 rounded-full mt-auto overflow-hidden">
                                <div className="h-full bg-primary rounded-full w-0" />
                            </div>
                            <span className="text-xs font-bold text-gray-500 uppercase mt-2">Not Started</span>
                        </>
                    )}
                </div>

                {/* Nutrition Card */}
                <div
                    onClick={() => navigate('/dashboard/nutrition')}
                    className="bg-glass border border-glass-border p-6 rounded-2xl flex flex-col hover:border-accent-blue/50 transition duration-300 overflow-hidden relative cursor-pointer"
                >
                    <div className="absolute right-[-10%] top-[-10%] w-[150px] h-[150px] bg-accent-blue/10 blur-[50px] rounded-full pointer-events-none" />
                    <div className="flex justify-between items-start mb-6 relative z-10">
                        <div className="w-12 h-12 rounded-full bg-accent-blue/20 flex items-center justify-center text-accent-blue">
                            <Compass className="w-6 h-6" />
                        </div>
                        <span className="px-2 py-1 bg-white/5 rounded-md text-xs font-semibold text-gray-400 border border-white/10">MACROS</span>
                    </div>
                    <div className="flex items-end gap-2 mb-1 relative z-10">
                        <h2 className="text-3xl font-display font-bold">{caloriesConsumed.toLocaleString()}</h2>
                        <span className="text-gray-400 font-medium mb-1">/ {goals.calories.toLocaleString()} kcal</span>
                    </div>
                    <p className="text-gray-500 text-sm mb-4 relative z-10">{caloriesRemaining > 0 ? `${caloriesRemaining} kcal remaining` : 'Goal reached!'}</p>
                    <div className="w-full h-1.5 bg-dark-900 rounded-full overflow-hidden mb-4 relative z-10">
                        <div className="h-full bg-accent-blue rounded-full transition-all duration-500" style={{ width: `${calPct}%` }} />
                    </div>
                    <div className="flex gap-2 relative z-10 mt-auto">
                        <div className="flex-1 bg-dark-900 py-2 px-3 rounded-xl border border-white/5 text-center">
                            <div className="text-xs text-gray-500 mb-1">PRO</div>
                            <div className="font-bold text-sm text-green-400">{proteinConsumed}g</div>
                        </div>
                        <div className="flex-1 bg-dark-900 py-2 px-3 rounded-xl border border-white/5 text-center">
                            <div className="text-xs text-gray-500 mb-1">CARB</div>
                            <div className="font-bold text-sm text-yellow-400">{carbsConsumed}g</div>
                        </div>
                        <div className="flex-1 bg-dark-900 py-2 px-3 rounded-xl border border-white/5 text-center">
                            <div className="text-xs text-gray-500 mb-1">H₂O</div>
                            <div className="font-bold text-sm text-accent-blue">{(waterConsumed / 1000).toFixed(1)}L</div>
                        </div>
                    </div>
                </div>

                {/* AI Coach Card */}
                <div
                    onClick={() => navigate('/dashboard/ai-coach')}
                    className="bg-gradient-to-br from-dark-800 to-glass p-6 rounded-2xl border border-glass-border flex flex-col justify-between group hover:border-accent-purple/50 transition duration-300 cursor-pointer"
                >
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
                            Ask Coach Nova anything — nutrition, form, recovery, or a personalized plan.
                        </p>
                    </div>
                    <div className="mt-6 flex items-center text-accent-purple text-sm font-bold opacity-80 group-hover:opacity-100 transition tracking-wide">
                        OPEN CHAT ↗
                    </div>
                </div>
            </div>

            {/* Weekly Activity Graph */}
            <div className="p-6 rounded-2xl bg-dark-800 border border-glass-border relative overflow-hidden">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold flex items-center gap-2">
                        <Activity className="w-5 h-5 text-primary" /> Weekly Workout Activity
                    </h3>
                    <span className="text-xs text-gray-500 font-bold">{history.filter(w => last7Days.includes(w.date)).length} / 7 days active</span>
                </div>
                <div className="w-full h-40 flex items-end justify-between px-2 gap-2">
                    {last7Days.map((date, i) => {
                        const session = workoutsByDate.get(date);
                        const heightPct = session
                            ? session.isCompleted
                                ? 90
                                : session.exercises.filter(e => e.done).length / Math.max(session.exercises.length, 1) * 70 + 20
                            : 8;
                        const isToday = date === new Date().toISOString().split('T')[0];
                        return (
                            <div key={date} className="flex-1 flex flex-col items-center gap-2">
                                <div
                                    className={`w-full rounded-t-lg border transition-all ${session ? 'bg-primary/30 border-primary/50 hover:bg-primary/50' : 'bg-glass border-glass-border'} ${isToday ? 'ring-1 ring-primary' : ''}`}
                                    style={{ height: `${heightPct}%` }}
                                />
                                {isToday && <span className="text-xs font-bold text-primary">●</span>}
                            </div>
                        );
                    })}
                </div>
                <div className="w-full flex justify-between mt-4 text-xs font-bold text-gray-500 px-2">
                    {last7Days.map(d => (
                        <span key={d}>{new Date(d + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 3).toUpperCase()}</span>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Overview;
