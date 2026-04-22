import mongoose from 'mongoose';

const shoppingItemSchema = new mongoose.Schema({
    name: { type: String, required: true },
    quantity: { type: Number, required: true },
    unit: { type: String, required: true },
    category: { type: String, default: 'other' },
    checked: { type: Boolean, default: false }
});

const shoppingListSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
        unique: true
    },
    items: [shoppingItemSchema]
}, { timestamps: true });

const ShoppingList = mongoose.model('ShoppingList', shoppingListSchema);
export default ShoppingList;
