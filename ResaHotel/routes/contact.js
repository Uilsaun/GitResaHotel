/* routes/contact.js */
import express from 'express';
import ContactController from '../controllers/contactController.js';

const router = express.Router();

router.get('/', ContactController.index);

router.get('/create', ContactController.create);

router.post('/', ContactController.store);

router.get('/:id/edit', ContactController.edit);

router.post('/:id/edit', ContactController.update);

router.get('/:id/delete', ContactController.delete);

router.post('/:id/delete', ContactController.destroy);


export default router;