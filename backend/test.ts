import mongoose from 'mongoose';
import Workout from './src/models/Workout';
import dotenv from 'dotenv';
dotenv.config();

async function run() {
    await mongoose.connect(process.env.MONGO_URI as string);
    const today = new Date().toISOString().split('T')[0];
    await Workout.deleteMany({ date: today });
    console.log("Deleted today's workouts");
    process.exit(0);
}
run();
