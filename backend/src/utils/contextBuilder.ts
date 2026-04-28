import User from '../models/User';
import HealthMetric from '../models/HealthMetric';
import MealLog from '../models/MealLog';
import Workout from '../models/Workout';
import PantryItem from '../models/PantryItem';
import mongoose from 'mongoose';

export const buildComprehensiveUserContext = async (userId: string): Promise<string> => {
    try {
        const userObjId = new mongoose.Types.ObjectId(userId);
        
        // Fetch User Profile
        const user = await User.findById(userObjId);
        if (!user) return "No user found.";

        // Fetch Health Metrics (latest of each type)
        const metricTypes = ['weight', 'systolic', 'diastolic', 'heartRate', 'sleepHours', 'sleepQuality', 'steps'];
        const latestMetrics: Record<string, string> = {};
        for (const type of metricTypes) {
            const metric = await HealthMetric.findOne({ userId: userObjId, metricType: type }).sort({ recordedAt: -1 });
            if (metric) {
                latestMetrics[type] = `${metric.value} ${metric.unit}`;
            }
        }

        // Fetch Today's Meal Log
        const todayStr = new Date().toISOString().split('T')[0];
        const todayStart = new Date(todayStr);
        const mealLog = await MealLog.findOne({ userId: userObjId, date: todayStart });

        // Fetch Workouts (Today + Last 3)
        const todayWorkout = await Workout.findOne({ userId: userObjId, date: todayStr });
        const pastWorkouts = await Workout.find({ userId: userObjId, isCompleted: true })
            .sort({ date: -1 })
            .limit(3);

        // Fetch Pantry Items
        const pantry = await PantryItem.find({ userId: userObjId });

        // Format into Markdown
        let contextStr = `### USER PROFILE\n`;
        contextStr += `- Name: ${user.name}\n`;
        contextStr += `- Current Weight: ${user.weight} kg (Profile) / ${latestMetrics['weight'] || 'N/A'} (Latest Log)\n`;
        contextStr += `- Height: ${user.height} cm\n`;
        contextStr += `- Goal: ${user.dailyCalorieGoal} kcal/day\n`;
        contextStr += `- Diet/Cuisine Prefs: ${user.dietaryPreference} / ${user.cuisinePreference}\n\n`;

        contextStr += `### LATEST HEALTH METRICS\n`;
        contextStr += `- Sleep: ${latestMetrics['sleepHours'] || 'N/A'} (Quality: ${latestMetrics['sleepQuality'] || 'N/A'})\n`;
        contextStr += `- Steps: ${latestMetrics['steps'] || 'N/A'}\n`;
        contextStr += `- BP: ${latestMetrics['systolic'] || 'N/A'}/${latestMetrics['diastolic'] || 'N/A'}\n`;
        contextStr += `- Heart Rate: ${latestMetrics['heartRate'] || 'N/A'}\n\n`;

        contextStr += `### TODAY'S NUTRITION\n`;
        if (mealLog) {
            let totalCals = 0, totalPro = 0, totalCarb = 0, totalFat = 0;
            const mealTypes: ('breakfast' | 'lunch' | 'dinner' | 'snack')[] = ['breakfast', 'lunch', 'dinner', 'snack'];
            mealTypes.forEach(type => {
                mealLog.meals[type].forEach(f => {
                    totalCals += f.calories;
                    totalPro += f.protein;
                    totalCarb += f.carbs;
                    totalFat += f.fat;
                });
            });
            contextStr += `- Calories: ${Math.round(totalCals)} / ${user.dailyCalorieGoal} kcal\n`;
            contextStr += `- Macros: ${Math.round(totalPro)}g Pro, ${Math.round(totalCarb)}g Carb, ${Math.round(totalFat)}g Fat\n`;
            contextStr += `- Water Intake: ${mealLog.waterIntake} ml\n\n`;
        } else {
            contextStr += `- No meals logged today.\n\n`;
        }

        contextStr += `### WORKOUTS\n`;
        if (todayWorkout) {
            contextStr += `- Today's Session: "${todayWorkout.name}" - ${todayWorkout.isCompleted ? 'Completed' : 'In Progress'}\n`;
            const completedSets = todayWorkout.exercises.reduce((acc, ex) => acc + ex.sets.filter(s => s.isCompleted).length, 0);
            const totalSets = todayWorkout.exercises.reduce((acc, ex) => acc + ex.sets.length, 0);
            contextStr += `  - Progress: ${completedSets}/${totalSets} sets done across ${todayWorkout.exercises.length} exercises.\n`;
        } else {
            contextStr += `- No session started today.\n`;
        }
        
        if (pastWorkouts.length > 0) {
            contextStr += `- Recent Past Sessions:\n`;
            pastWorkouts.forEach(w => {
                if (w._id.toString() !== todayWorkout?._id.toString()) {
                    contextStr += `  - ${w.date}: "${w.name}" (${w.durationMinutes} min)\n`;
                }
            });
            contextStr += `\n`;
        } else {
            contextStr += `\n`;
        }

        contextStr += `### KITCHEN PANTRY (Available Ingredients)\n`;
        if (pantry.length > 0) {
            contextStr += pantry.map(p => `- ${p.name} (${p.quantity} ${p.unit})`).join('\n');
        } else {
            contextStr += `- Pantry is currently empty.`;
        }

        return contextStr;
    } catch (error) {
        console.error("Error building context:", error);
        return "Error fetching user context.";
    }
};
