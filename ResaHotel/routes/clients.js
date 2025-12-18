import express from 'express';
import clientControllers from '../controllers/clientControllers.js';

const router = express.Router();

router.get('/', clientControllers.index);

router.get('/create', clientControllers.create);

router.post('/', clientControllers.store);

router.get('/:id/edit', clientControllers.edit);
router.post('/:id/edit', clientControllers.update);

router.get('/:id/delete', clientControllers.delete);
router.post('/:id/delete', clientControllers.destroy);

export default router;
