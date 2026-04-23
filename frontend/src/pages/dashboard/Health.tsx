import React, { useEffect, useState } from 'react';
import { Scale, Heart, Moon, Footprints, Flame, Plus, Loader2, TrendingUp, AlertTriangle, X, Activity } from 'lucide-react';
import { useHealthStore, type MetricType } from '../../store/healthStore';
import { useAuthStore } from '../../store/authStore';
import { TrendChart } from '../../components/ui/TrendChart';

// ─── Normal ranges for out-of-range flagging ───────────────────────────────
const NORMAL_RANGES: Partial<Record<MetricType, { min: number; max: number; label: string }>> = {
    systolic:    { min: 90,  max: 120, label: 'mmHg (normal < 120)' },
    diastolic:   { min: 60,  max: 80,  label: 'mmHg (normal < 80)' },
    heartRate:   { min: 50,  max: 100, label: 'bpm' },
    sleepHours:  { min: 7,   max: 9,   label: 'hrs recommended' },
    sleepQuality:{ min: 3,   max: 5,   label: '/ 5 stars' },
};

const isOutOfRange = (type: MetricType, value: number) => {
    const r = NORMAL_RANGES[type];
    if (!r) return false;
    return value < r.min || value > r.max;
};

// ─── Metric definitions ───────────────────────────────────────────────────
const METRIC_CONFIG: {
    type: MetricType;
    label: string;
    unit: string;
    icon: React.FC<any>;
    color: string;
    placeholder: string;
    min: number;
    max: number;
    step: number;
}[] = [
    { type: 'weight',       label: 'Weight',        unit: 'kg',   icon: Scale,      color: '#ccff00', placeholder: '70.5', min: 30, max: 300, step: 0.1 },
    { type: 'systolic',     label: 'Systolic BP',   unit: 'mmHg', icon: Activity,   color: '#ef4444', placeholder: '120',  min: 60, max: 250, step: 1   },
    { type: 'diastolic',    label: 'Diastolic BP',  unit: 'mmHg', icon: Activity,   color: '#f97316', placeholder: '80',   min: 40, max: 150, step: 1   },
    { type: 'heartRate',    label: 'Heart Rate',    unit: 'bpm',  icon: Heart,      color: '#ec4899', placeholder: '72',   min: 30, max: 250, step: 1   },
    { type: 'sleepHours',   label: 'Sleep',         unit: 'hrs',  icon: Moon,       color: '#818cf8', placeholder: '7.5',  min: 0,  max: 24,  step: 0.5 },
    { type: 'sleepQuality', label: 'Sleep Quality', unit: '★',    icon: Moon,       color: '#a78bfa', placeholder: '4',    min: 1,  max: 5,   step: 1   },
    { type: 'steps',        label: 'Steps',         unit: 'steps',icon: Footprints, color: '#34d399', placeholder: '8000', min: 0,  max: 100000, step: 100 },
];

// ─── BMI Calculator ───────────────────────────────────────────────────────
const calcBMI = (weightKg: number, heightCm: number): number => {
    const hM = heightCm / 100;
    return parseFloat((weightKg / (hM * hM)).toFixed(1));
};
const bmiCategory = (bmi: number) => {
    if (bmi < 18.5) return { label: 'Underweight', color: 'text-accent-blue' };
    if (bmi < 25)   return { label: 'Normal',       color: 'text-primary' };
    if (bmi < 30)   return { label: 'Overweight',   color: 'text-yellow-400' };
    return                  { label: 'Obese',        color: 'text-red-400' };
};

// ─── Log Modal ────────────────────────────────────────────────────────────
interface LogModalProps {
    initialType?: MetricType;
    onClose: () => void;
    onLog: (type: MetricType, value: number, unit: string) => void;
    isLogging: boolean;
}

const LogModal: React.FC<LogModalProps> = ({ initialType = 'weight', onClose, onLog, isLogging }) => {
    const [selectedType, setSelectedType] = useState<MetricType>(initialType);
    const [value, setValue] = useState('');
    const config = METRIC_CONFIG.find(m => m.type === selectedType)!;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const num = parseFloat(value);
        if (isNaN(num)) return;
        onLog(selectedType, num, config.unit);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-dark-800 border border-glass-border w-full max-w-sm rounded-3xl overflow-hidden">
                <div className="p-5 border-b border-white/5 flex justify-between items-center">
                    <h2 className="font-bold text-lg flex items-center gap-2">
                        <Plus className="w-5 h-5 text-primary" /> Log Reading
                    </h2>
                    <button onClick={onClose}><X className="w-5 h-5 text-gray-400" /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-5 space-y-4">
                    <div>
                        <label className="text-sm font-bold text-gray-400 mb-2 block">Metric</label>
                        <div className="grid grid-cols-2 gap-2">
                            {METRIC_CONFIG.map(m => (
                                <button
                                    key={m.type}
                                    type="button"
                                    onClick={() => { setSelectedType(m.type); setValue(''); }}
                                    className={`py-2 px-3 rounded-xl text-sm font-bold text-left border transition-all ${selectedType === m.type ? 'border-primary bg-primary/10 text-white' : 'border-white/10 bg-dark-900 text-gray-400 hover:border-white/30'}`}
                                >
                                    {m.label}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="text-sm font-bold text-gray-400 mb-2 block">
                            Value ({config.unit})
                        </label>
                        <input
                            required
                            type="number"
                            min={config.min}
                            max={config.max}
                            step={config.step}
                            placeholder={config.placeholder}
                            value={value}
                            onChange={e => setValue(e.target.value)}
                            className="w-full bg-dark-900 border border-white/10 rounded-xl py-3 px-4 text-white text-lg focus:outline-none focus:border-primary transition-colors"
                        />
                        {value && isOutOfRange(selectedType, parseFloat(value)) && (
                            <p className="text-xs text-red-400 flex items-center gap-1 mt-1">
                                <AlertTriangle className="w-3 h-3" /> Value is outside the normal range.
                            </p>
                        )}
                    </div>
                    <button
                        type="submit"
                        disabled={isLogging || !value}
                        className="w-full bg-primary hover:bg-primary/90 text-dark-900 font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                    >
                        {isLogging ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                        Log Reading
                    </button>
                </form>
            </div>
        </div>
    );
};

// ─── Stars component ─────────────────────────────────────────────────────
const Stars: React.FC<{ value: number }> = ({ value }) => (
    <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map(s => (
            <span key={s} className={s <= value ? 'text-yellow-400' : 'text-gray-700'}>★</span>
        ))}
    </div>
);

// ─── Main Health Page ─────────────────────────────────────────────────────
const Health = () => {
    const { latest, history, streak, isLoading, isLogging, fetchLatest, fetchHistory, fetchStreak, logMetric } = useHealthStore();
    const [showLogModal, setShowLogModal] = useState(false);
    const [logInitialType, setLogInitialType] = useState<MetricType>('weight');
    const [chartMetric, setChartMetric] = useState<MetricType>('weight');
    const [chartDays, setChartDays] = useState(30);
    const { user } = useAuthStore();
    const [userHeight, setUserHeight] = useState(user?.height || 170); // cm, user-editable

    useEffect(() => {
        fetchLatest();
        fetchStreak();
    }, [fetchLatest, fetchStreak]);

    useEffect(() => {
        fetchHistory(chartMetric, chartDays);
    }, [chartMetric, chartDays, fetchHistory]);

    const handleLog = async (type: MetricType, value: number, unit: string) => {
        await logMetric(type, value, unit);
        fetchStreak();
        if (type === chartMetric) fetchHistory(chartMetric, chartDays);
    };

    const openLog = (type: MetricType) => {
        setLogInitialType(type);
        setShowLogModal(true);
    };

    // BMI calculation
    const weightMetric = latest['weight'];
    const bmi = weightMetric ? calcBMI(weightMetric.value, userHeight) : null;
    const bmiInfo = bmi ? bmiCategory(bmi) : null;

    const chartConfig = METRIC_CONFIG.find(m => m.type === chartMetric)!;
    const chartData = history.map(h => ({ date: h.recordedAt, value: h.value }));

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6 animate-fade-in relative z-10 pb-20 md:pb-0">
            {/* Header */}
            <header className="flex flex-col md:flex-row justify-between md:items-end gap-4">
                <div>
                    <h1 className="text-3xl font-display font-bold mb-1">Health Dashboard</h1>
                    <p className="text-gray-400">Track vitals, sleep, and body composition over time.</p>
                </div>
                <button
                    onClick={() => { setLogInitialType('weight'); setShowLogModal(true); }}
                    className="bg-primary hover:bg-primary/90 text-dark-900 font-bold py-3 px-6 rounded-xl flex items-center gap-2 shadow-[0_0_15px_rgba(204,255,0,0.3)] transition-all w-fit"
                >
                    <Plus className="w-5 h-5" /> Log Reading
                </button>
            </header>

            {/* Streak Banner */}
            {streak > 0 && (
                <div className="flex items-center gap-3 bg-gradient-to-r from-orange-500/10 to-transparent border border-orange-500/20 p-4 rounded-2xl">
                    <Flame className="w-8 h-8 text-orange-400 flex-shrink-0" />
                    <div>
                        <p className="font-bold text-white">{streak}-Day Logging Streak 🔥</p>
                        <p className="text-sm text-gray-400">Keep it up — consistency is everything.</p>
                    </div>
                </div>
            )}

            {/* Metric Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">

                {/* Weight + BMI card */}
                <div
                    onClick={() => openLog('weight')}
                    className="col-span-2 bg-dark-800 border border-glass-border p-5 rounded-2xl hover:border-primary/40 transition-all cursor-pointer group"
                >
                    <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-2">
                            <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center">
                                <Scale className="w-5 h-5 text-primary" />
                            </div>
                            <span className="font-bold text-gray-300">Weight & BMI</span>
                        </div>
                        <Plus className="w-4 h-4 text-gray-600 group-hover:text-primary transition-colors" />
                    </div>
                    {weightMetric ? (
                        <div className="flex items-end gap-4">
                            <div>
                                <span className="text-4xl font-display font-bold text-primary">{weightMetric.value}</span>
                                <span className="text-gray-500 ml-1">kg</span>
                            </div>
                            {bmi && bmiInfo && (
                                <div className="mb-1">
                                    <div className="text-lg font-bold text-white">BMI {bmi}</div>
                                    <div className={`text-xs font-bold ${bmiInfo.color}`}>{bmiInfo.label}</div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <p className="text-gray-500 text-sm mt-2">No data — tap to log</p>
                    )}
                    <div className="mt-3 flex items-center gap-2">
                        <label className="text-xs text-gray-500 font-bold">Height:</label>
                        <input
                            type="number"
                            value={userHeight}
                            onClick={e => e.stopPropagation()}
                            onChange={e => setUserHeight(parseInt(e.target.value) || 170)}
                            className="w-16 bg-dark-900 border border-white/10 rounded-lg px-2 py-1 text-xs text-white focus:outline-none"
                        />
                        <span className="text-xs text-gray-500">cm</span>
                    </div>
                </div>

                {/* Heart Rate */}
                {(['heartRate', 'systolic', 'diastolic'] as MetricType[]).map(type => {
                    const cfg = METRIC_CONFIG.find(m => m.type === type)!;
                    const m = latest[type];
                    const flag = m && isOutOfRange(type, m.value);
                    return (
                        <div
                            key={type}
                            onClick={() => openLog(type)}
                            className={`bg-dark-800 border p-5 rounded-2xl hover:border-opacity-60 transition-all cursor-pointer group ${flag ? 'border-red-500/40 bg-red-500/5' : 'border-glass-border'}`}
                        >
                            <div className="flex justify-between items-start mb-3">
                                <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ backgroundColor: `${cfg.color}20` }}>
                                    <cfg.icon className="w-5 h-5" style={{ color: cfg.color }} />
                                </div>
                                {flag && <AlertTriangle className="w-4 h-4 text-red-400" />}
                                {!flag && <Plus className="w-4 h-4 text-gray-600 group-hover:text-primary transition-colors" />}
                            </div>
                            <div className="text-2xl font-display font-bold" style={{ color: flag ? '#ef4444' : cfg.color }}>
                                {m ? m.value : '—'}
                            </div>
                            <div className="text-xs font-bold text-gray-500 mt-1">{cfg.label}</div>
                            <div className="text-xs text-gray-600">{cfg.unit}</div>
                        </div>
                    );
                })}

                {/* Sleep */}
                <div
                    onClick={() => openLog('sleepHours')}
                    className="bg-dark-800 border border-glass-border p-5 rounded-2xl hover:border-indigo-500/40 transition-all cursor-pointer group"
                >
                    <div className="flex justify-between items-start mb-3">
                        <div className="w-9 h-9 rounded-full bg-indigo-500/20 flex items-center justify-center">
                            <Moon className="w-5 h-5 text-indigo-400" />
                        </div>
                        <Plus className="w-4 h-4 text-gray-600 group-hover:text-primary transition-colors" />
                    </div>
                    <div className="text-2xl font-display font-bold text-indigo-400">
                        {latest['sleepHours'] ? `${latest['sleepHours'].value}h` : '—'}
                    </div>
                    <div className="text-xs font-bold text-gray-500 mt-1">Sleep</div>
                    {latest['sleepQuality'] && (
                        <div className="mt-1.5">
                            <Stars value={latest['sleepQuality'].value} />
                        </div>
                    )}
                </div>

                {/* Steps */}
                <div
                    onClick={() => openLog('steps')}
                    className="bg-dark-800 border border-glass-border p-5 rounded-2xl hover:border-emerald-500/40 transition-all cursor-pointer group"
                >
                    <div className="flex justify-between items-start mb-3">
                        <div className="w-9 h-9 rounded-full bg-emerald-500/20 flex items-center justify-center">
                            <Footprints className="w-5 h-5 text-emerald-400" />
                        </div>
                        <Plus className="w-4 h-4 text-gray-600 group-hover:text-primary transition-colors" />
                    </div>
                    <div className="text-2xl font-display font-bold text-emerald-400">
                        {latest['steps'] ? latest['steps'].value.toLocaleString() : '—'}
                    </div>
                    <div className="text-xs font-bold text-gray-500 mt-1">Steps Today</div>
                    {latest['steps'] && (
                        <div className="mt-2 h-1.5 bg-dark-900 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-emerald-400 rounded-full transition-all"
                                style={{ width: `${Math.min((latest['steps'].value / 10000) * 100, 100)}%` }}
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Trend Chart Section */}
            <div className="bg-dark-800 border border-glass-border p-6 rounded-3xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-primary" />
                        <h3 className="font-bold text-lg">Trend Chart</h3>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                        {/* Metric selector */}
                        <select
                            value={chartMetric}
                            onChange={e => setChartMetric(e.target.value as MetricType)}
                            className="bg-dark-900 border border-white/10 rounded-xl py-1.5 px-3 text-sm text-white focus:outline-none focus:border-primary transition-colors"
                        >
                            {METRIC_CONFIG.map(m => (
                                <option key={m.type} value={m.type}>{m.label}</option>
                            ))}
                        </select>
                        {/* Period selector */}
                        {[7, 30].map(d => (
                            <button
                                key={d}
                                onClick={() => setChartDays(d)}
                                className={`px-3 py-1.5 rounded-xl text-sm font-bold transition-all border ${chartDays === d ? 'bg-primary/20 border-primary/50 text-primary' : 'border-white/10 text-gray-500 hover:border-white/30'}`}
                            >
                                {d}d
                            </button>
                        ))}
                    </div>
                </div>

                <TrendChart
                    data={chartData}
                    color={chartConfig.color}
                    unit={chartConfig.unit === 'steps' ? '' : chartConfig.unit}
                    height={140}
                />

                {chartData.length === 0 && (
                    <p className="text-center text-gray-600 text-sm py-4">
                        No {chartConfig.label} data for the last {chartDays} days. Start logging to see your trend!
                    </p>
                )}
            </div>

            {/* Out-of-range advisory */}
            {(['systolic', 'diastolic', 'heartRate', 'sleepHours'] as MetricType[]).some(
                t => latest[t] && isOutOfRange(t, latest[t]!.value)
            ) && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 flex gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="font-bold text-red-300 mb-1">Some readings are outside normal range</p>
                        <p className="text-sm text-red-400/80">
                            If this persists, consider consulting a healthcare professional.
                            This is not a medical diagnosis.
                        </p>
                    </div>
                </div>
            )}

            {/* Log Modal */}
            {showLogModal && (
                <LogModal
                    initialType={logInitialType}
                    onClose={() => setShowLogModal(false)}
                    onLog={handleLog}
                    isLogging={isLogging}
                />
            )}
        </div>
    );
};

export default Health;
