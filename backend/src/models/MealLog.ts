import mongoose, { Document, Schema } from 'mongoose';

export interface IFoodEntry {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  portion: number;
  unit: string;
}

export interface IMealLog extends Document {
  userId: mongoose.Types.ObjectId;
  date: Date;
  meals: {
    breakfast: IFoodEntry[];
    lunch: IFoodEntry[];
    dinner: IFoodEntry[];
    snack: IFoodEntry[];
  };
  waterIntake: number; // in milliliters
  createdAt: Date;
  updatedAt: Date;
}

const foodEntrySchema = new Schema<IFoodEntry>({
  name: { type: String, required: true },
  calories: { type: Number, required: true },
  protein: { type: Number, required: true },
  carbs: { type: Number, required: true },
  fat: { type: Number, required: true },
  portion: { type: Number, required: true },
  unit: { type: String, required: true, default: 'g' }
});

const mealLogSchema = new Schema<IMealLog>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  meals: {
    breakfast: [foodEntrySchema],
    lunch: [foodEntrySchema],
    dinner: [foodEntrySchema],
    snack: [foodEntrySchema]
  },
  waterIntake: { type: Number, default: 0 }
}, {
  timestamps: true
});

// Ensure only one log per user per day
mealLogSchema.index({ userId: 1, date: 1 }, { unique: true });

export default mongoose.model<IMealLog>('MealLog', mealLogSchema);
