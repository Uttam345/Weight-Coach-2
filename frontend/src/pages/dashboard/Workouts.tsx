import React, { useEffect, useState, useRef } from 'react';
import { Play, CheckCircle2, Circle, Plus, Dumbbell, Timer, Trophy, X, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { useWorkoutStore, type Exercise } from '../../store/workoutStore';

// --- Add Workout Modal ---
const WORKOUT_TEMPLATES = [
    {
        name: 'Chest & Triceps',
        exercises: [
            { name: 'Barbell Bench Press', sets: 4, reps: '8-10', weight: 60 },
            { name: 'Incline Dumbbell Press', sets: 3, reps: '10-12', weight: 24 },
            { name: 'Cable Chest Flyes', sets: 3, reps: '15', weight: 15 },
            { name: 'Tricep Pushdown', sets: 4, reps: '12', weight: 20 },
            { name: 'Overhead Tricep Extension', sets: 3, reps: '12', weight: 18 },
        ],
    },
    {
        name: 'Back & Biceps',
        exercises: [
            { name: 'Deadlifts', sets: 4, reps: '5', weight: 100 },
            { name: 'Pull-Ups', sets: 3, reps: '8-10', weight: 0 },
            { name: 'Barbell Rows', sets: 4, reps: '10', weight: 60 },
            { name: 'Barbell Curl', sets: 3, reps: '12', weight: 20 },
            { name: 'Hammer Curl', sets: 3, reps: '12', weight: 16 },
        ],
    },
    {
        name: 'Legs & Core',
        exercises: [
            { name: 'Barbell Squat', sets: 4, reps: '8', weight: 80 },
            { name: 'Romanian Deadlift', sets: 3, reps: '10', weight: 70 },
            { name: 'Leg Press', sets: 3, reps: '12', weight: 120 },
            { name: 'Leg Curl', sets: 3, reps: '12', weight: 40 },
            { name: 'Plank', sets: 3, reps: '60s', weight: 0 },
        ],
    },
    {
        name: 'Shoulders & Arms',
        exercises: [
            { name: 'Overhead Press', sets: 4, reps: '8', weight: 40 },
            { name: 'Lateral Raises', sets: 4, reps: '15', weight: 10 },
            { name: 'Front Raises', sets: 3, reps: '12', weight: 10 },
            { name: 'EZ Bar Curl', sets: 3, reps: '10', weight: 25 },
            { name: 'Skull Crushers', sets: 3, reps: '12', weight: 20 },
        ],
    },
];

interface StartWorkoutModalProps {
    onClose: () => void;
    onCreate: (name: string, exercises: Omit<Exercise, 'done'>[]) => void;
}

const StartWorkoutModal: React.FC<StartWorkoutModalProps> = ({ onClose, onCreate }) => {
    const [selectedTemplate, setSelectedTemplate] = useState(0);
    const [workoutName, setWorkoutName] = useState(WORKOUT_TEMPLATES[0].name);

    const handleSelect = (i: number) => {
        setSelectedTemplate(i);
        setWorkoutName(WORKOUT_TEMPLATES[i].name);
    };

    const handleStart = () => {
        onCreate(workoutName, WORKOUT_TEMPLATES[selectedTemplate].exercises);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-dark-800 border border-glass-border w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl">
                <div className="p-6 border-b border-white/5 flex justify-between items-center">
                    <h2 className="text-xl font-bold flex items-center gap-2"><Dumbbell className="w-5 h-5 text-primary" /> Start Workout</h2>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full"><X className="w-5 h-5 text-gray-400" /></button>
                </div>
                <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                    <div>
                        <label className="text-sm font-bold text-gray-400 mb-2 block">Workout Name</label>
                        <input
                            type="text"
                            value={workoutName}
                            onChange={e => setWorkoutName(e.target.value)}
                            className="w-full bg-dark-900 border border-white/10 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:border-primary transition-colors"
                        />
                    </div>
                    <div>
                        <label className="text-sm font-bold text-gray-400 mb-2 block">Choose Template</label>
                        <div className="grid grid-cols-2 gap-2">
                            {WORKOUT_TEMPLATES.map((t, i) => (
                                <button
                                    key={t.name}
                                    onClick={() => handleSelect(i)}
                                    className={`p-3 rounded-xl text-left border text-sm transition-all ${selectedTemplate === i ? 'border-primary bg-primary/10 text-white' : 'border-white/10 bg-dark-900 text-gray-400 hover:border-white/30'}`}
                                >
                                    <span className="font-bold block">{t.name}</span>
                                    <span className="text-xs opacity-60">{t.exercises.length} exercises</span>
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="text-sm font-bold text-gray-400 mb-2 block">Exercises Preview</label>
                        <div className="space-y-1">
                            {WORKOUT_TEMPLATES[selectedTemplate].exercises.map(ex => (
                                <div key={ex.name} className="flex justify-between text-sm py-1.5 px-3 bg-dark-900 rounded-lg">
                                    <span className="text-gray-300">{ex.name}</span>
                                    <span className="text-gray-500">{ex.sets}×{ex.reps}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="p-6 border-t border-white/5">
                    <button
                        onClick={handleStart}
                        className="w-full bg-primary hover:bg-primary/90 text-dark-900 font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-[0_5px_15px_-5px_rgba(204,255,0,0.5)]"
                    >
                        <Play className="w-5 h-5 fill-dark-900" /> Start Session
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- Main Workouts Component ---
const Workouts = () => {
    const { todayWorkout, history, isLoading, fetchTodayWorkout, fetchHistory, createWorkout, toggleExercise, completeWorkout } = useWorkoutStore();
    const [showStartModal, setShowStartModal] = useState(false);
    const [startTime, setStartTime] = useState<number | null>(null);
    const [elapsed, setElapsed] = useState(0);
    const [showHistory, setShowHistory] = useState(false);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        fetchTodayWorkout();
        fetchHistory();
    }, [fetchTodayWorkout, fetchHistory]);

    // Start timer when a workout is in progress
    useEffect(() => {
        if (todayWorkout && !todayWorkout.isCompleted && startTime === null) {
            setStartTime(Date.now());
        }
        if (todayWorkout?.isCompleted) {
            if (timerRef.current) clearInterval(timerRef.current);
        }
    }, [todayWorkout]);

    useEffect(() => {
        if (startTime !== null && todayWorkout && !todayWorkout.isCompleted) {
            timerRef.current = setInterval(() => {
                setElapsed(Math.floor((Date.now() - startTime) / 1000));
            }, 1000);
        }
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, [startTime, todayWorkout]);

    const formatTime = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

    const handleComplete = () => {
        if (!todayWorkout) return;
        const mins = Math.floor(elapsed / 60);
        completeWorkout(todayWorkout._id, mins);
        if (timerRef.current) clearInterval(timerRef.current);
    };

    const completedCount = todayWorkout?.exercises.filter(e => e.done).length || 0;
    const totalCount = todayWorkout?.exercises.length || 0;
    const progressPct = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6 animate-fade-in relative z-10 pb-20 md:pb-0">
            <header className="mb-2 flex flex-col md:flex-row justify-between md:items-end gap-4">
                <div>
                    <h1 className="text-3xl font-display font-bold mb-1">Training Hub</h1>
                    <p className="text-gray-400">
                        {todayWorkout ? todayWorkout.name : 'No session started today.'}
                    </p>
                </div>
                {!todayWorkout && (
                    <button
                        onClick={() => setShowStartModal(true)}
                        className="bg-primary hover:bg-primary/90 text-dark-900 font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(204,255,0,0.3)] transition-all"
                    >
                        <Play className="w-5 h-5 fill-dark-900" /> Start Workout
                    </button>
                )}
            </header>

            {/* No workout state */}
            {!todayWorkout && !isLoading && (
                <div className="bg-dark-800 border border-glass-border rounded-3xl p-12 flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                        <Dumbbell className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">No Session Today</h3>
                    <p className="text-gray-500 mb-6 max-w-xs">Choose a workout template and start logging your sets, reps, and weights.</p>
                    <button
                        onClick={() => setShowStartModal(true)}
                        className="bg-primary hover:bg-primary/90 text-dark-900 font-bold py-3 px-8 rounded-xl transition-all"
                    >
                        Start Today's Session
                    </button>
                </div>
            )}

            {/* Active / Completed Workout */}
            {todayWorkout && (
                <>
                    {/* Status Bar */}
                    <div className={`p-5 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-4 ${todayWorkout.isCompleted ? 'bg-primary/10 border-primary/30' : 'bg-dark-800 border-glass-border'}`}>
                        <div>
                            {todayWorkout.isCompleted ? (
                                <div className="flex items-center gap-2 text-primary font-bold text-lg">
                                    <Trophy className="w-6 h-6" /> Session Complete!
                                </div>
                            ) : (
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-2 text-primary font-bold text-2xl font-mono">
                                        <Timer className="w-5 h-5" />
                                        {formatTime(elapsed)}
                                    </div>
                                    <span className="text-gray-500 text-sm">{completedCount}/{totalCount} exercises done</span>
                                </div>
                            )}
                            <div className="w-full md:w-64 h-1.5 bg-dark-900 rounded-full mt-3 overflow-hidden">
                                <div
                                    className="h-full bg-primary rounded-full transition-all duration-500"
                                    style={{ width: `${progressPct}%` }}
                                />
                            </div>
                        </div>
                        {!todayWorkout.isCompleted && (
                            <button
                                onClick={handleComplete}
                                className="bg-primary/20 border border-primary/40 text-primary font-bold py-2.5 px-6 rounded-xl hover:bg-primary/30 transition-all flex items-center gap-2"
                            >
                                <Trophy className="w-5 h-5" /> Finish Workout
                            </button>
                        )}
                        {todayWorkout.isCompleted && (
                            <div className="text-gray-400 text-sm font-bold">
                                Duration: {todayWorkout.durationMinutes} min
                            </div>
                        )}
                    </div>

                    {/* Exercise List */}
                    <div className="bg-dark-800 border border-glass-border p-6 rounded-3xl">
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-primary shadow-[0_0_10px_rgba(204,255,0,0.8)]" />
                            {todayWorkout.name}
                        </h3>
                        <div className="flex flex-col gap-3">
                            {todayWorkout.exercises.map((ex, i) => (
                                <button
                                    key={i}
                                    disabled={todayWorkout.isCompleted}
                                    onClick={() => toggleExercise(todayWorkout._id, i, !ex.done)}
                                    className={`flex items-center justify-between p-4 rounded-2xl border text-left transition-all w-full ${ex.done ? 'bg-primary/5 border-primary/20' : 'bg-dark-900 border-white/5 hover:border-white/20 hover:bg-white/5 cursor-pointer'}`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold ${ex.done ? 'bg-primary text-dark-900' : 'bg-dark-800 border border-gray-600 text-gray-600'}`}>
                                            {ex.done ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                                        </div>
                                        <div>
                                            <h4 className={`font-bold ${ex.done ? 'text-white line-through opacity-60' : 'text-gray-200'}`}>{ex.name}</h4>
                                            <p className="text-sm text-gray-500">{ex.sets} sets × {ex.reps} reps{ex.weight > 0 ? ` • ${ex.weight}kg` : ''}</p>
                                        </div>
                                    </div>
                                    {ex.done
                                        ? <CheckCircle2 className="w-5 h-5 text-primary" />
                                        : <Circle className="w-5 h-5 text-gray-600" />
                                    }
                                </button>
                            ))}
                        </div>
                    </div>
                </>
            )}

            {/* Past Sessions */}
            <div>
                <button
                    onClick={() => setShowHistory(!showHistory)}
                    className="flex items-center gap-2 font-bold text-gray-400 hover:text-white transition mb-4 px-2"
                >
                    Past Sessions {showHistory ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                {showHistory && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {history.length === 0 && (
                            <p className="text-gray-500 text-sm col-span-2 px-2">No past sessions yet. Complete a workout to see it here.</p>
                        )}
                        {history.map(session => (
                            <div key={session._id} className="bg-glass border border-glass-border p-4 rounded-2xl flex items-center justify-between">
                                <div>
                                    <div className="text-xs font-bold text-primary mb-1">{new Date(session.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }).toUpperCase()}</div>
                                    <h4 className="font-bold">{session.name}</h4>
                                    <p className="text-xs text-gray-500">{session.exercises.length} exercises • {session.exercises.filter(e => e.done).length} completed</p>
                                </div>
                                <div className="text-gray-400 font-bold">{session.durationMinutes}m</div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {showStartModal && (
                <StartWorkoutModal
                    onClose={() => setShowStartModal(false)}
                    onCreate={(name, exercises) => createWorkout(name, exercises)}
                />
            )}
        </div>
    );
};

export default Workouts;
