import { Router } from 'express';
import { getShoppingList, addShoppingItems, toggleShoppingItem, clearCheckedItems } from '../controllers/shoppingController';
import { protect } from '../middlewares/authMiddleware';

const router = Router();

router.use(protect);

router.get('/', getShoppingList);
router.post('/', addShoppingItems);
router.put('/:itemId', toggleShoppingItem);
router.delete('/checked', clearCheckedItems);

export default router;
