import { Router } from 'express';
import { getPantry, addPantryItem, updatePantryItem, deletePantryItem } from '../controllers/pantryController';
import { protect } from '../middlewares/authMiddleware';

const router = Router();
router.use(protect);

router.get('/', getPantry);
router.post('/', addPantryItem);
router.put('/:id', updatePantryItem);
router.delete('/:id', deletePantryItem);

export default router;
