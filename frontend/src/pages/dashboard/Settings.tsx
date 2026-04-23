import React, { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { Save, User as UserIcon, Activity, Flame, Loader2 } from 'lucide-react';

const Settings = () => {
    const { user, updateProfile } = useAuthStore();
    const [isSaving, setIsSaving] = useState(false);
    
    // Bio-metrics state
    const [height, setHeight] = useState(user?.height || 170);
    const [weight, setWeight] = useState(user?.weight || 70);
    
    // Nutrition goals
    const [dailyCalorieGoal, setDailyCalorieGoal] = useState(user?.dailyCalorieGoal || 2000);
    
    // AI Preferences
    const [dietaryPreference, setDietaryPreference] = useState(user?.dietaryPreference || 'none');
    const [cuisinePreference, setCuisinePreference] = useState(user?.cuisinePreference || 'any');

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await updateProfile({
                height: Number(height),
                weight: Number(weight),
                dailyCalorieGoal: Number(dailyCalorieGoal),
                dietaryPreference,
                cuisinePreference
            });
            alert('Profile updated successfully!');
        } catch (error) {
            alert('Failed to update profile.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="flex flex-col gap-8 animate-fade-in relative z-10 max-w-3xl mx-auto pb-20 md:pb-0">
            <header className="flex flex-col gap-2">
                <h1 className="text-3xl md:text-4xl font-display font-bold flex items-center gap-3">
                    <UserIcon className="w-8 h-8 text-primary" />
                    Profile & Settings
                </h1>
                <p className="text-gray-400">Manage your bio-metrics and AI preferences.</p>
            </header>

            <form onSubmit={handleSave} className="space-y-6">
                {/* Account Details */}
                <div className="bg-dark-800 border border-glass-border rounded-3xl p-6">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        Account Details
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-bold text-gray-500 block mb-1">Name</label>
                            <input disabled value={user?.name || ''} className="w-full bg-dark-900/50 border border-white/5 rounded-xl py-3 px-4 text-gray-400 cursor-not-allowed" />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-500 block mb-1">Email</label>
                            <input disabled value={user?.email || ''} className="w-full bg-dark-900/50 border border-white/5 rounded-xl py-3 px-4 text-gray-400 cursor-not-allowed" />
                        </div>
                    </div>
                </div>

                {/* Bio-Metrics */}
                <div className="bg-dark-800 border border-glass-border rounded-3xl p-6">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <Activity className="w-5 h-5 text-accent-blue" />
                        Bio-Metrics
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-bold text-gray-500 block mb-1">Height (cm)</label>
                            <input 
                                type="number" 
                                required
                                value={height} 
                                onChange={(e) => setHeight(Number(e.target.value))} 
                                className="w-full bg-dark-900 border border-white/10 rounded-xl py-3 px-4 text-white focus:border-primary transition-colors outline-none" 
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-500 block mb-1">Weight (kg)</label>
                            <input 
                                type="number" 
                                required
                                value={weight} 
                                onChange={(e) => setWeight(Number(e.target.value))} 
                                className="w-full bg-dark-900 border border-white/10 rounded-xl py-3 px-4 text-white focus:border-primary transition-colors outline-none" 
                            />
                        </div>
                    </div>
                </div>

                {/* Nutrition Goals & Preferences */}
                <div className="bg-dark-800 border border-glass-border rounded-3xl p-6">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <Flame className="w-5 h-5 text-orange-400" />
                        Nutrition Goals & AI Preferences
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="md:col-span-2">
                            <label className="text-xs font-bold text-gray-500 block mb-1">Daily Calorie Target (kcal)</label>
                            <input 
                                type="number" 
                                required
                                value={dailyCalorieGoal} 
                                onChange={(e) => setDailyCalorieGoal(Number(e.target.value))} 
                                className="w-full md:w-1/2 bg-dark-900 border border-white/10 rounded-xl py-3 px-4 text-white focus:border-primary transition-colors outline-none text-xl font-bold text-primary" 
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-500 block mb-1">Dietary Preference</label>
                            <select 
                                value={dietaryPreference} 
                                onChange={(e) => setDietaryPreference(e.target.value)} 
                                className="w-full bg-dark-900 border border-white/10 rounded-xl py-3 px-4 text-white focus:border-primary transition-colors outline-none"
                            >
                                <option value="none">None</option>
                                <option value="vegetarian">Vegetarian</option>
                                <option value="vegan">Vegan</option>
                                <option value="gluten-free">Gluten-Free</option>
                                <option value="keto">Keto</option>
                                <option value="paleo">Paleo</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-500 block mb-1">Preferred Cuisine (AI Cook)</label>
                            <select 
                                value={cuisinePreference} 
                                onChange={(e) => setCuisinePreference(e.target.value)} 
                                className="w-full bg-dark-900 border border-white/10 rounded-xl py-3 px-4 text-white focus:border-primary transition-colors outline-none"
                            >
                                <option value="any">Any</option>
                                <option value="italian">Italian</option>
                                <option value="asian">Asian</option>
                                <option value="mexican">Mexican</option>
                                <option value="indian">Indian</option>
                                <option value="mediterranean">Mediterranean</option>
                            </select>
                        </div>
                    </div>
                    <p className="text-xs text-gray-500">Your dietary and cuisine preferences are automatically synced with the AI Kitchen Cook to generate tailored meal suggestions.</p>
                </div>

                <div className="flex justify-end pt-4">
                    <button 
                        type="submit" 
                        disabled={isSaving}
                        className="bg-primary hover:bg-primary/90 text-dark-900 font-bold py-3 px-8 rounded-xl transition-all shadow-[0_0_15px_rgba(204,255,0,0.3)] disabled:opacity-70 flex items-center gap-2"
                    >
                        {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                        Save Changes
                    </button>
                </div>
            </form>
        </div>
    );
};

export default Settings;
