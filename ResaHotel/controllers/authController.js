// authController.js - dossier controllers
import Auth, { AuthError } from '../models/auth.js';

class AuthController {
    // Afficher la page de connexion
    static showLoginPage(req, res) {
        try {
            if (req.session && req.session.clientId) {
                return res.redirect('/dashboard');
            }

            res.render('auth/login', {
                title: 'Connexion',
                error: null,
                success: req.query.success || null
            });
        } catch (error) {
            console.error('Erreur affichage page login:', error);
            res.status(500).render('error', {
                message: 'Erreur lors de l\'affichage de la page',
                error: error
            });
        }
    }

    // Traiter la connexion
    static async login(req, res) {
        try {
            const { email, password, remember } = req.body;

            if (!email || !password) {
                return res.status(400).render('auth/login', {
                    title: 'Connexion',
                    error: 'Email et mot de passe requis',
                    success: null,
                    formData: { email }
                });
            }

            const client = await Auth.login(email, password);

            // Créer la session
            req.session.clientId = client.id;
            req.session.clientEmail = client.email;
            req.session.clientNom = client.nom;
            req.session.clientTelephone = client.telephone;
            req.session.clientNombrePersonnes = client.nombre_personnes;

            // Gérer "Se souvenir de moi"
            if (remember) {
                req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000; // 30 jours
            } else {
                req.session.cookie.maxAge = null; // Session browser
            }

            res.redirect('/dashboard');
        } catch (error) {
            console.error('Erreur lors de la connexion:', error);

            let errorMessage = 'Une erreur est survenue lors de la connexion';
            if (error instanceof AuthError) {
                if (error.code === 'INVALID_CREDENTIALS') {
                    errorMessage = 'Email ou mot de passe incorrect';
                } else if (error.code === 'INVALID_EMAIL') {
                    errorMessage = 'Format d\'email invalide';
                } else {
                    errorMessage = error.message;
                }
            }

            res.status(400).render('auth/login', {
                title: 'Connexion',
                error: errorMessage,
                success: null,
                formData: { email: req.body.email }
            });
        }
    }

    // Déconnexion
    static logout(req, res) {
        try {
            req.session.destroy((err) => {
                if (err) {
                    console.error('Erreur lors de la déconnexion:', err);
                    return res.redirect('/dashboard');
                }
                res.clearCookie('connect.sid');
                res.redirect('/login?success=Vous avez été déconnecté avec succès');
            });
        } catch (error) {
            console.error('Erreur lors de la déconnexion:', error);
            res.redirect('/dashboard');
        }
    }

    // Afficher la page d'inscription
    static showRegisterPage(req, res) {
        try {
            if (req.session && req.session.clientId) {
                return res.redirect('/dashboard');
            }

            res.render('auth/register', {
                title: 'Inscription',
                error: null,
                success: null,
                formData: {}
            });
        } catch (error) {
            console.error('Erreur affichage page inscription:', error);
            res.status(500).render('error', {
                message: 'Erreur lors de l\'affichage de la page',
                error: error
            });
        }
    }

    // Traiter l'inscription
    static async register(req, res) {
        try {
            const { email, password, confirmPassword, nom, telephone, nombre_personnes } = req.body;

            if (!email || !password || !confirmPassword || !nom || !telephone || !nombre_personnes) {
                return res.status(400).render('auth/register', {
                    title: 'Inscription',
                    error: 'Tous les champs sont requis',
                    success: null,
                    formData: req.body
                });
            }

            if (password !== confirmPassword) {
                return res.status(400).render('auth/register', {
                    title: 'Inscription',
                    error: 'Les mots de passe ne correspondent pas',
                    success: null,
                    formData: req.body
                });
            }

            const client = await Auth.register({
                email,
                password,
                nom,
                telephone,
                nombre_personnes: parseInt(nombre_personnes, 10)
            });

            res.redirect('/login?success=Inscription réussie ! Vous pouvez maintenant vous connecter');
        } catch (error) {
            console.error('Erreur lors de l\'inscription:', error);

            let errorMessage = 'Une erreur est survenue lors de l\'inscription';
            if (error instanceof AuthError) {
                errorMessage = error.message;
            }

            res.status(400).render('auth/register', {
                title: 'Inscription',
                error: errorMessage,
                success: null,
                formData: req.body
            });
        }
    }

    // Afficher le profil client
    static async showProfile(req, res) {
        try {
            if (!req.session.clientId) {
                return res.redirect('/login');
            }

            const client = await Auth.findById(req.session.clientId);
            if (!client) {
                req.session.destroy();
                return res.redirect('/login');
            }

            const reservations = await client.getReservations();

            res.render('auth/profile', {
                title: 'Mon profil',
                client: client,
                reservations: reservations,
                error: null,
                success: req.query.success || null
            });
        } catch (error) {
            console.error('Erreur affichage profil:', error);
            res.status(500).render('error', {
                message: 'Erreur lors de l\'affichage du profil',
                error: error
            });
        }
    }

    // Mettre à jour le profil
    static async updateProfile(req, res) {
        try {
            if (!req.session.clientId) {
                return res.redirect('/login');
            }

            const client = await Auth.findById(req.session.clientId);
            if (!client) {
                req.session.destroy();
                return res.redirect('/login');
            }

            const { nom, telephone, nombre_personnes } = req.body;

            await client.updateProfile({
                nom,
                telephone,
                nombre_personnes: parseInt(nombre_personnes, 10)
            });

            // Mettre à jour la session
            req.session.clientNom = nom;
            req.session.clientTelephone = telephone;
            req.session.clientNombrePersonnes = parseInt(nombre_personnes, 10);

            res.redirect('/profile?success=Profil mis à jour avec succès');
        } catch (error) {
            console.error('Erreur mise à jour profil:', error);

            const client = await Auth.findById(req.session.clientId);
            const reservations = await client.getReservations();

            let errorMessage = 'Une erreur est survenue';
            if (error instanceof AuthError) {
                errorMessage = error.message;
            }

            res.status(400).render('auth/profile', {
                title: 'Mon profil',
                client: client,
                reservations: reservations,
                error: errorMessage,
                success: null
            });
        }
    }

    // Changer le mot de passe
    static async changePassword(req, res) {
        try {
            if (!req.session.clientId) {
                return res.redirect('/login');
            }

            const { oldPassword, newPassword, confirmPassword } = req.body;

            if (!oldPassword || !newPassword || !confirmPassword) {
                throw new AuthError('Tous les champs sont requis', 'VALIDATION_ERROR');
            }

            if (newPassword !== confirmPassword) {
                throw new AuthError('Les nouveaux mots de passe ne correspondent pas', 'VALIDATION_ERROR');
            }

            await Auth.changePassword(req.session.clientId, oldPassword, newPassword);

            res.redirect('/profile?success=Mot de passe modifié avec succès');
        } catch (error) {
            console.error('Erreur changement mot de passe:', error);

            const client = await Auth.findById(req.session.clientId);
            const reservations = await client.getReservations();

            let errorMessage = 'Une erreur est survenue';
            if (error instanceof AuthError) {
                errorMessage = error.message;
            }

            res.status(400).render('auth/profile', {
                title: 'Mon profil',
                client: client,
                reservations: reservations,
                error: errorMessage,
                success: null
            });
        }
    }
}

export default AuthController;