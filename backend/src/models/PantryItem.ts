import mongoose from 'mongoose';

const pantryItemSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    name: { type: String, required: true },
    quantity: { type: Number, required: true, default: 1 },
    unit: { type: String, default: 'item' }, // e.g. kg, g, ml, item
    category: {
        type: String,
        enum: ['protein', 'carbs', 'fats', 'dairy', 'vegetables', 'fruits', 'supplements', 'other'],
        default: 'other',
    },
}, {
    timestamps: true,
});

const PantryItem = mongoose.model('PantryItem', pantryItemSchema);
export default PantryItem;
