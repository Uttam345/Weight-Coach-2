import React, { useEffect, useState, useRef } from 'react';
import { Play, CheckCircle2, Circle, Plus, Dumbbell, Timer, Trophy, X, Loader2, ChevronDown, ChevronUp, Trash2 } from 'lucide-react';
import { useWorkoutStore, type Exercise, type WorkoutSet, type SetType } from '../../store/workoutStore';

// --- Add Workout Modal ---
const generateSets = (count: number, reps: number, weight: number): WorkoutSet[] => {
    return Array.from({ length: count }, () => ({
        reps,
        weight,
        isCompleted: false,
        type: 'normal'
    }));
};

const WORKOUT_TEMPLATES = [
    {
        name: 'Chest & Triceps',
        exercises: [
            { name: 'Barbell Bench Press', sets: generateSets(4, 8, 60) },
            { name: 'Incline Dumbbell Press', sets: generateSets(3, 10, 24) },
            { name: 'Cable Chest Flyes', sets: generateSets(3, 15, 15) },
            { name: 'Tricep Pushdown', sets: generateSets(4, 12, 20) },
            { name: 'Overhead Tricep Extension', sets: generateSets(3, 12, 18) },
        ],
    },
    {
        name: 'Back & Biceps',
        exercises: [
            { name: 'Deadlifts', sets: generateSets(4, 5, 100) },
            { name: 'Pull-Ups', sets: generateSets(3, 8, 0) },
            { name: 'Barbell Rows', sets: generateSets(4, 10, 60) },
            { name: 'Barbell Curl', sets: generateSets(3, 12, 20) },
            { name: 'Hammer Curl', sets: generateSets(3, 12, 16) },
        ],
    },
    {
        name: 'Legs & Core',
        exercises: [
            { name: 'Barbell Squat', sets: generateSets(4, 8, 80) },
            { name: 'Romanian Deadlift', sets: generateSets(3, 10, 70) },
            { name: 'Leg Press', sets: generateSets(3, 12, 120) },
            { name: 'Leg Curl', sets: generateSets(3, 12, 40) },
        ],
    },
    {
        name: 'Shoulders & Arms',
        exercises: [
            { name: 'Overhead Press', sets: generateSets(4, 8, 40) },
            { name: 'Lateral Raises', sets: generateSets(4, 15, 10) },
            { name: 'Front Raises', sets: generateSets(3, 12, 10) },
            { name: 'EZ Bar Curl', sets: generateSets(3, 10, 25) },
            { name: 'Skull Crushers', sets: generateSets(3, 12, 20) },
        ],
    },
];

interface StartWorkoutModalProps {
    onClose: () => void;
    onCreate: (name: string, exercises: Exercise[]) => void;
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
                                    <span className="text-gray-500">{ex.sets.length} sets</span>
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
    const { todayWorkout, history, isLoading, fetchTodayWorkout, fetchHistory, createWorkout, syncWorkout, completeWorkout } = useWorkoutStore();
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

    // Derived stats for progress bar
    let completedSets = 0;
    let totalSets = 0;
    if (todayWorkout) {
        todayWorkout.exercises.forEach(ex => {
            ex.sets.forEach(set => {
                totalSets++;
                if (set.isCompleted) completedSets++;
            });
        });
    }
    const progressPct = totalSets > 0 ? (completedSets / totalSets) * 100 : 0;

    // Actions
    const updateSet = (exerciseIndex: number, setIndex: number, field: keyof WorkoutSet, value: any) => {
        if (!todayWorkout) return;
        const newExercises = structuredClone(todayWorkout.exercises);
        newExercises[exerciseIndex].sets[setIndex] = {
            ...newExercises[exerciseIndex].sets[setIndex],
            [field]: value
        };
        syncWorkout(todayWorkout._id, newExercises);
    };

    const addSet = (exerciseIndex: number) => {
        if (!todayWorkout) return;
        const newExercises = structuredClone(todayWorkout.exercises);
        const ex = newExercises[exerciseIndex];
        const lastSet = ex.sets.length > 0 ? ex.sets[ex.sets.length - 1] : { reps: 0, weight: 0, type: 'normal' };
        
        ex.sets.push({
            reps: lastSet.reps,
            weight: lastSet.weight,
            isCompleted: false,
            type: 'normal'
        });
        syncWorkout(todayWorkout._id, newExercises);
    };

    const removeSet = (exerciseIndex: number, setIndex: number) => {
        if (!todayWorkout) return;
        const newExercises = structuredClone(todayWorkout.exercises);
        newExercises[exerciseIndex].sets.splice(setIndex, 1);
        syncWorkout(todayWorkout._id, newExercises);
    };

    const addExercise = () => {
        if (!todayWorkout) return;
        const newName = prompt('Enter exercise name:');
        if (!newName) return;
        const newExercises = structuredClone(todayWorkout.exercises);
        newExercises.push({
            name: newName,
            sets: [
                { reps: 10, weight: 0, isCompleted: false, type: 'normal' as const }
            ]
        });
        syncWorkout(todayWorkout._id, newExercises);
    };

    const removeExercise = (exerciseIndex: number) => {
        if (!todayWorkout) return;
        if (!confirm('Remove this exercise?')) return;
        const newExercises = structuredClone(todayWorkout.exercises);
        newExercises.splice(exerciseIndex, 1);
        syncWorkout(todayWorkout._id, newExercises);
    };

    if (isLoading && !todayWorkout) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    const setTypeStyle = (type: SetType) => {
        switch (type) {
            case 'warmup': return 'text-orange-400 bg-orange-400/10 border-orange-400/20';
            case 'drop': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
            case 'failure': return 'text-red-400 bg-red-400/10 border-red-400/20';
            default: return 'text-gray-400 bg-white/5 border-white/10';
        }
    };

    const typeLabel = (type: SetType, index: number) => {
        switch (type) {
            case 'warmup': return 'W';
            case 'drop': return 'D';
            case 'failure': return 'F';
            default: return index + 1;
        }
    };

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
                    <div className={`p-5 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-4 z-40 backdrop-blur-xl ${todayWorkout.isCompleted ? 'bg-primary/10 border-primary/30' : 'bg-dark-800/90 border-glass-border shadow-2xl'}`}>
                        <div className="flex-1">
                            {todayWorkout.isCompleted ? (
                                <div className="flex items-center gap-2 text-primary font-bold text-lg">
                                    <Trophy className="w-6 h-6" /> Session Complete!
                                </div>
                            ) : (
                                <div className="flex items-center justify-between md:justify-start gap-4">
                                    <div className="flex items-center gap-2 text-primary font-bold text-2xl font-mono">
                                        <Timer className="w-5 h-5" />
                                        {formatTime(elapsed)}
                                    </div>
                                    <span className="text-gray-400 font-medium text-sm bg-dark-900 px-3 py-1 rounded-full">{completedSets}/{totalSets} sets</span>
                                </div>
                            )}
                            <div className="w-full h-1.5 bg-dark-900 rounded-full mt-3 overflow-hidden">
                                <div
                                    className="h-full bg-primary rounded-full transition-all duration-500"
                                    style={{ width: `${progressPct}%` }}
                                />
                            </div>
                        </div>
                        {!todayWorkout.isCompleted && (
                            <button
                                onClick={handleComplete}
                                className="bg-primary hover:bg-primary/90 text-dark-900 font-bold py-3 px-6 rounded-xl transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(204,255,0,0.3)] w-full md:w-auto"
                            >
                                <Trophy className="w-5 h-5 fill-dark-900" /> Finish
                            </button>
                        )}
                        {todayWorkout.isCompleted && (
                            <div className="text-gray-400 text-sm font-bold bg-dark-900 px-4 py-2 rounded-xl">
                                Duration: {todayWorkout.durationMinutes} min
                            </div>
                        )}
                    </div>

                    {/* Exercise List - HEVY Style */}
                    <div className="flex flex-col gap-4">
                        {todayWorkout.exercises.map((ex, exIndex) => (
                            <div key={ex._id || exIndex} className="bg-dark-800 border border-glass-border rounded-3xl overflow-hidden">
                                {/* Exercise Header */}
                                <div className="p-4 bg-dark-900/50 flex justify-between items-center border-b border-glass-border">
                                    <h3 className="font-bold text-lg text-primary">{ex.name}</h3>
                                    {!todayWorkout.isCompleted && (
                                        <button onClick={() => removeExercise(exIndex)} className="p-2 text-gray-500 hover:text-red-400 transition-colors">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                                
                                {/* Sets Table */}
                                <div className="p-2">
                                    {/* Table Header */}
                                    <div className="grid grid-cols-[3rem_1fr_1fr_3rem] gap-2 px-2 py-2 text-xs font-bold text-gray-500 text-center">
                                        <div>SET</div>
                                        <div>KG</div>
                                        <div>REPS</div>
                                        <div><CheckCircle2 className="w-4 h-4 mx-auto" /></div>
                                    </div>
                                    
                                    {/* Sets Rows */}
                                    {ex.sets.map((set, setIndex) => (
                                        <div key={set._id || setIndex} className={`grid grid-cols-[3rem_1fr_1fr_3rem] gap-2 p-2 items-center rounded-xl transition-colors ${set.isCompleted ? 'bg-primary/5' : 'hover:bg-white/5'}`}>
                                            {/* Set Number / Type Indicator */}
                                            <button 
                                                disabled={todayWorkout.isCompleted}
                                                onClick={() => {
                                                    const types: SetType[] = ['normal', 'warmup', 'drop', 'failure'];
                                                    const nextType = types[(types.indexOf(set.type) + 1) % types.length];
                                                    updateSet(exIndex, setIndex, 'type', nextType);
                                                }}
                                                className={`w-8 h-8 mx-auto rounded-lg flex items-center justify-center font-bold text-sm border transition-colors ${setTypeStyle(set.type)} ${todayWorkout.isCompleted ? 'cursor-default' : 'cursor-pointer hover:border-white/30'}`}
                                            >
                                                {typeLabel(set.type, setIndex)}
                                            </button>
                                            
                                            {/* Weight Input */}
                                            <div className="relative">
                                                <input 
                                                    type="number" 
                                                    disabled={todayWorkout.isCompleted}
                                                    value={set.weight || ''}
                                                    onChange={(e) => updateSet(exIndex, setIndex, 'weight', parseFloat(e.target.value) || 0)}
                                                    className={`w-full text-center font-bold py-2 rounded-xl focus:outline-none transition-colors ${set.isCompleted ? 'bg-transparent text-white' : 'bg-dark-900 border border-glass-border text-white focus:border-primary focus:bg-dark-800'}`}
                                                    placeholder="-"
                                                />
                                            </div>

                                            {/* Reps Input */}
                                            <div className="relative">
                                                <input 
                                                    type="number" 
                                                    disabled={todayWorkout.isCompleted}
                                                    value={set.reps || ''}
                                                    onChange={(e) => updateSet(exIndex, setIndex, 'reps', parseInt(e.target.value) || 0)}
                                                    className={`w-full text-center font-bold py-2 rounded-xl focus:outline-none transition-colors ${set.isCompleted ? 'bg-transparent text-white' : 'bg-dark-900 border border-glass-border text-white focus:border-primary focus:bg-dark-800'}`}
                                                    placeholder="-"
                                                />
                                            </div>

                                            {/* Done Toggle */}
                                            <button 
                                                disabled={todayWorkout.isCompleted}
                                                onClick={() => updateSet(exIndex, setIndex, 'isCompleted', !set.isCompleted)}
                                                className={`w-10 h-8 mx-auto rounded-xl flex items-center justify-center transition-all ${set.isCompleted ? 'bg-primary text-dark-900 shadow-[0_0_10px_rgba(204,255,0,0.4)]' : 'bg-dark-900 border border-glass-border text-gray-600 hover:border-primary/50 hover:text-primary'}`}
                                            >
                                                <CheckCircle2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    ))}
                                    
                                    {/* Add Set Button */}
                                    {!todayWorkout.isCompleted && (
                                        <button 
                                            onClick={() => addSet(exIndex)}
                                            className="w-full mt-2 py-2 flex items-center justify-center gap-2 text-sm font-bold text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
                                        >
                                            <Plus className="w-4 h-4" /> Add Set
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                        
                        {/* Add Exercise Button */}
                        {!todayWorkout.isCompleted && (
                            <button 
                                onClick={addExercise}
                                className="w-full py-4 bg-primary/10 hover:bg-primary/20 border border-primary/20 text-primary font-bold rounded-3xl flex items-center justify-center gap-2 transition-all"
                            >
                                <Plus className="w-5 h-5" /> Add Exercise
                            </button>
                        )}
                    </div>
                </>
            )}

            {/* Past Sessions */}
            <div className="mt-8 border-t border-glass-border pt-8">
                <button
                    onClick={() => setShowHistory(!showHistory)}
                    className="flex items-center gap-2 font-bold text-white hover:text-primary transition mb-4 px-2"
                >
                    Past Sessions {showHistory ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </button>
                {showHistory && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {history.length === 0 && (
                            <p className="text-gray-500 text-sm col-span-2 px-2">No past sessions yet. Complete a workout to see it here.</p>
                        )}
                        {history.map(session => {
                            const completedSetsCount = session.exercises.reduce((acc, ex) => acc + ex.sets.filter(s => s.isCompleted).length, 0);
                            const totalSetsCount = session.exercises.reduce((acc, ex) => acc + ex.sets.length, 0);
                            return (
                                <div key={session._id} className="bg-dark-800 border border-glass-border p-5 rounded-3xl flex flex-col gap-3 hover:border-primary/30 transition-colors">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h4 className="font-bold text-lg text-white">{session.name}</h4>
                                            <div className="text-sm font-medium text-gray-400 mt-1">
                                                {new Date(session.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                                            </div>
                                        </div>
                                        <div className="bg-dark-900 px-3 py-1 rounded-xl text-primary font-bold text-sm">
                                            {session.durationMinutes}m
                                        </div>
                                    </div>
                                    <div className="pt-3 border-t border-glass-border flex gap-4 text-sm font-medium text-gray-400">
                                        <div><span className="text-white">{session.exercises.length}</span> Exercises</div>
                                        <div><span className="text-white">{completedSetsCount}/{totalSetsCount}</span> Sets Done</div>
                                    </div>
                                </div>
                            )
                        })}
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
