import mongoose from 'mongoose';

const setSchema = new mongoose.Schema({
    reps: { type: Number, required: true },
    weight: { type: Number, required: true }, // in kg
    isCompleted: { type: Boolean, default: false },
    type: { type: String, enum: ['normal', 'warmup', 'drop', 'failure'], default: 'normal' }
});

const exerciseSchema = new mongoose.Schema({
    name: { type: String, required: true },
    sets: [setSchema]
});

const workoutSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    date: {
        type: String, // YYYY-MM-DD
        required: true,
    },
    name: {
        type: String,
        required: true,
        default: 'My Workout',
    },
    exercises: [exerciseSchema],
    durationMinutes: { type: Number, default: 0 },
    isCompleted: { type: Boolean, default: false },
}, {
    timestamps: true,
});

// Compound index to find a user's workout on a given date quickly
workoutSchema.index({ userId: 1, date: 1 });

const Workout = mongoose.model('Workout', workoutSchema);
export default Workout;
