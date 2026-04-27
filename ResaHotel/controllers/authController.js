// authController.js - dossier controllers
import Auth, { AuthError } from '../models/auth.js';

class AuthController {

    static showLoginPage(req, res) {
        try {
            if (req.session && req.session.clientId) {
                return res.redirect('/');
            }
            res.render('auth/login', {
                title: 'Connexion',
                error: null,
                success: req.query.success || null,
                formData: null
            });
        } catch (error) {
            console.error('Erreur affichage page login:', error);
            res.status(500).render('error', { message: 'Erreur lors de l\'affichage de la page', error });
        }
    }

    static async login(req, res) {
        try {
            const { email, password, remember } = req.body;
            if (!email || !password) {
                return res.status(400).render('auth/login', {
                    title: 'Connexion', error: 'Email et mot de passe requis', success: null, formData: { email }
                });
            }
            const client = await Auth.login(email, password);
            req.session.clientId = client.id;
            req.session.clientEmail = client.email;
            req.session.clientNom = client.nom;
            req.session.clientTelephone = client.telephone;
            req.session.clientNombrePersonnes = client.nombre_personnes;
            if (remember) {
                req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000;
            } else {
                req.session.cookie.maxAge = null;
            }
            res.redirect('/chambres/disponibles');
        } catch (error) {
            console.error('Erreur lors de la connexion:', error);
            let errorMessage = 'Une erreur est survenue lors de la connexion';
            if (error instanceof AuthError) {
                if (error.code === 'INVALID_CREDENTIALS') errorMessage = 'Email ou mot de passe incorrect';
                else if (error.code === 'INVALID_EMAIL') errorMessage = 'Format d\'email invalide';
                else errorMessage = error.message;
            }
            res.status(400).render('auth/login', {
                title: 'Connexion', error: errorMessage, success: null, formData: { email: req.body.email }
            });
        }
    }

    static logout(req, res) {
        try {
            req.session.destroy((err) => {
                res.clearCookie('connect.sid');
                res.redirect('/');
            });
        } catch (error) {
            res.redirect('/');
        }
    }

    static showRegisterPage(req, res) {
        try {
            if (req.session && req.session.clientId) return res.redirect('/');
            res.render('auth/register', {
                title: 'Inscription', error: null, success: null, formData: {}
            });
        } catch (error) {
            res.status(500).render('error', { message: 'Erreur lors de l\'affichage de la page', error });
        }
    }

    static async register(req, res) {
        try {
            const { email, password, confirmPassword, nom } = req.body;
            if (!email || !password || !confirmPassword || !nom) {
                return res.status(400).render('auth/register', {
                    title: 'Inscription', error: 'Nom, email et mot de passe requis', success: null, formData: req.body
                });
            }
            if (password !== confirmPassword) {
                return res.status(400).render('auth/register', {
                    title: 'Inscription', error: 'Les mots de passe ne correspondent pas', success: null, formData: req.body
                });
            }
            await Auth.register({ email, password, nom });
            res.redirect('/auth/login?success=Inscription réussie ! Vous pouvez maintenant vous connecter');
        } catch (error) {
            let errorMessage = 'Une erreur est survenue lors de l\'inscription';
            if (error instanceof AuthError) errorMessage = error.message;
            res.status(400).render('auth/register', {
                title: 'Inscription', error: errorMessage, success: null, formData: req.body
            });
        }
    }

    // ✅ MÉTHODE MANQUANTE AJOUTÉE
    static async showProfilePage(req, res) {
        try {
            const client = await Auth.findById(req.session.clientId);
            const reservations = await client.getReservations();
            res.render('auth/profile', {
                title: 'Mon Profil',
                client: client,
                reservations: reservations,
                error: null,
                success: req.query.success || null
            });
        } catch (error) {
            console.error('Erreur affichage profil:', error);
            res.status(500).render('error', { title: 'Erreur', error: 'Impossible de charger le profil' });
        }
    }

    static async updateProfile(req, res) {
        try {
            if (!req.session.clientId) return res.redirect('/auth/login');
            const client = await Auth.findById(req.session.clientId);
            if (!client) { req.session.destroy(); return res.redirect('/auth/login'); }
            const { nom, telephone, nombre_personnes } = req.body;
            await client.updateProfile({ nom, telephone, nombre_personnes: parseInt(nombre_personnes, 10) });
            req.session.clientNom = nom;
            req.session.clientTelephone = telephone;
            req.session.clientNombrePersonnes = parseInt(nombre_personnes, 10);
            res.redirect('/auth/profile?success=Profil mis à jour avec succès');
        } catch (error) {
            const client = await Auth.findById(req.session.clientId);
            const reservations = await client.getReservations();
            let errorMessage = 'Une erreur est survenue';
            if (error instanceof AuthError) errorMessage = error.message;
            res.status(400).render('auth/profile', {
                title: 'Mon profil', client, reservations, error: errorMessage, success: null
            });
        }
    }

    static async changePassword(req, res) {
        try {
            if (!req.session.clientId) return res.redirect('/auth/login'); // ✅ corrigé
            const { oldPassword, newPassword, confirmPassword } = req.body;
            if (!oldPassword || !newPassword || !confirmPassword) {
                throw new AuthError('Tous les champs sont requis', 'VALIDATION_ERROR');
            }
            if (newPassword !== confirmPassword) {
                throw new AuthError('Les nouveaux mots de passe ne correspondent pas', 'VALIDATION_ERROR');
            }
            await Auth.changePassword(req.session.clientId, oldPassword, newPassword);
            res.redirect('/auth/profile?success=Mot de passe modifié avec succès'); // ✅ corrigé
        } catch (error) {
            const client = await Auth.findById(req.session.clientId);
            const reservations = await client.getReservations();
            let errorMessage = 'Une erreur est survenue';
            if (error instanceof AuthError) errorMessage = error.message;
            res.status(400).render('auth/profile', {
                title: 'Mon profil', client, reservations, error: errorMessage, success: null
            });
        }
    }
}

export default AuthController;