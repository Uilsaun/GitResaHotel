// authRoutes.js - dossier routes
import express from 'express';
import AuthController from '../controllers/authController.js';

const router = express.Router();

// Middleware pour vérifier si le client est connecté
const isAuthenticated = (req, res, next) => {
    if (req.session && req.session.clientId) {
        return next();
    }
    res.redirect('/login');
};

// Middleware pour vérifier si le client n'est PAS connecté
const isNotAuthenticated = (req, res, next) => {
    if (req.session && req.session.clientId) {
        return res.redirect('/dashboard');
    }
    next();
};

// Routes publiques (accessible sans connexion)
router.get('/login', isNotAuthenticated, AuthController.showLoginPage);
router.post('/login', isNotAuthenticated, AuthController.login);

router.get('/register', isNotAuthenticated, AuthController.showRegisterPage);
router.post('/register', isNotAuthenticated, AuthController.register);

// Routes protégées (nécessite une connexion)
router.get('/profile', isAuthenticated, AuthController.showProfile);
router.post('/profile', isAuthenticated, AuthController.updateProfile);
router.post('/change-password', isAuthenticated, AuthController.changePassword);

router.get('/logout', AuthController.logout);
router.post('/logout', AuthController.logout);

export default router;
export { isAuthenticated, isNotAuthenticated };