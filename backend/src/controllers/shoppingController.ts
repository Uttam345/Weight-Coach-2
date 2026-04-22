import { Request, Response } from 'express';
import ShoppingList from '../models/ShoppingList';
import { z } from 'zod';

const shoppingItemSchema = z.object({
    name: z.string().min(1),
    quantity: z.number().positive(),
    unit: z.string(),
    category: z.string().optional().default('other')
});

export const getShoppingList = async (req: Request, res: Response): Promise<void> => {
    try {
        let list = await ShoppingList.findOne({ userId: req.user._id });
        if (!list) {
            list = await ShoppingList.create({ userId: req.user._id, items: [] });
        }
        res.status(200).json(list.items);
    } catch (error) {
        console.error("getShoppingList error:", error);
        res.status(500).json({ message: "Server error fetching shopping list." });
    }
};

export const addShoppingItems = async (req: Request, res: Response): Promise<any> => {
    try {
        const { items } = req.body;
        if (!Array.isArray(items)) {
            return res.status(400).json({ message: "Items must be an array." });
        }

        const parsedItems = items.map(item => shoppingItemSchema.parse(item));

        let list = await ShoppingList.findOne({ userId: req.user._id });
        if (!list) {
            list = await ShoppingList.create({ userId: req.user._id, items: parsedItems });
        } else {
            // simple merge, not handling same item name deduplication for MVP to keep it fast
            list.items.push(...parsedItems.map(i => ({...i, checked: false})));
            await list.save();
        }

        res.status(200).json(list.items);
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ message: (error as any).errors[0].message });
        }
        console.error("addShoppingItems error:", error);
        res.status(500).json({ message: "Server error adding shopping items." });
    }
};

export const toggleShoppingItem = async (req: Request, res: Response): Promise<any> => {
    try {
        const { itemId } = req.params;
        const { checked } = req.body;

        const list = await ShoppingList.findOne({ userId: req.user._id });
        if (!list) return res.status(404).json({ message: "List not found." });

        const item = list.items.id(itemId);
        if (!item) return res.status(404).json({ message: "Item not found." });

        item.checked = checked;
        await list.save();

        res.status(200).json(list.items);
    } catch (error) {
        console.error("toggleShoppingItem error:", error);
        res.status(500).json({ message: "Server error toggling item." });
    }
};

export const clearCheckedItems = async (req: Request, res: Response): Promise<any> => {
    try {
        const list = await ShoppingList.findOne({ userId: req.user._id });
        if (!list) return res.status(404).json({ message: "List not found." });

        list.items = list.items.filter(item => !item.checked) as any;
        await list.save();

        res.status(200).json(list.items);
    } catch (error) {
        console.error("clearCheckedItems error:", error);
        res.status(500).json({ message: "Server error clearing items." });
    }
};
