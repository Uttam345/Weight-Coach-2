import mongoose from 'mongoose';

export type MetricType =
    | 'weight'
    | 'systolic'
    | 'diastolic'
    | 'heartRate'
    | 'sleepHours'
    | 'sleepQuality'
    | 'steps';

const healthMetricSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    metricType: {
        type: String,
        enum: ['weight', 'systolic', 'diastolic', 'heartRate', 'sleepHours', 'sleepQuality', 'steps'],
        required: true,
    },
    value: { type: Number, required: true },
    unit: { type: String, required: true },
    recordedAt: { type: Date, default: Date.now },
}, {
    timestamps: false,
});

// Compound index: quickly fetch all readings of a type for a user ordered by date
healthMetricSchema.index({ userId: 1, metricType: 1, recordedAt: -1 });

const HealthMetric = mongoose.model('HealthMetric', healthMetricSchema);
export default HealthMetric;
