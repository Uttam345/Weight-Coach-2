import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    height: { type: Number, default: 170 },
    weight: { type: Number, default: 70 },
    dailyCalorieGoal: { type: Number, default: 2000 },
    dietaryPreference: { type: String, default: 'none' },
    cuisinePreference: { type: String, default: 'any' }
}, {
    timestamps: true,
});

const User = mongoose.model('User', userSchema);
export default User;
