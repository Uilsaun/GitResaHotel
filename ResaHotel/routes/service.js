//routes/service.js
import express from 'express';
import ServiceController from '../controllers/ServiceController.js';

const router = express.Router();

// Liste des chambres
router.get('/', ServiceController.index);


export default router;
