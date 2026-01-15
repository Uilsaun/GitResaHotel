// routes/chambres.js
import express from 'express';
import ChambreController from '../controllers/chambreController.js';

const router = express.Router();

// Route pour les chambres disponibles (DOIT être AVANT les routes avec :id)
router.get('/disponibles', ChambreController.showAvailable);

// Liste de toutes les chambres (gestion admin)
router.get('/', ChambreController.index);

// Page création
router.get('/create', ChambreController.create);
router.post('/create', ChambreController.store);

// Page modification
router.get('/edit/:id', ChambreController.edit);
router.post('/edit/:id', ChambreController.update);

// Page suppression
router.get('/delete/:id', ChambreController.delete);
router.post('/delete/:id', ChambreController.destroy);

export default router;