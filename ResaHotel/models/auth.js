// Auth.js - dossier models
import db from './connexion.js';
import bcrypt from 'bcrypt';

class AuthError extends Error {
    constructor(message, code) {
        super(message);
        this.name = 'AuthError';
        this.code = code;
    }
}

class Auth {
    constructor(data) {
        this.id = data.id;
        this.email = data.email;
        this.nom = data.nom;
        this.telephone = data.telephone;
        this.nombre_personnes = data.nombre_personnes;
        this.password = data.password;
    }

    // Validation de l'email
    static validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email || typeof email !== 'string') {
            throw new AuthError('Email requis', 'INVALID_EMAIL');
        }
        if (!emailRegex.test(email)) {
            throw new AuthError('Format d\'email invalide', 'INVALID_EMAIL');
        }
        if (email.length > 255) {
            throw new AuthError('Email trop long', 'INVALID_EMAIL');
        }
        return true;
    }

    // Validation du mot de passe
    static validatePassword(password) {
        if (!password || typeof password !== 'string') {
            throw new AuthError('Mot de passe requis', 'INVALID_PASSWORD');
        }
        if (password.length < 8) {
            throw new AuthError('Le mot de passe doit contenir au moins 8 caractères', 'WEAK_PASSWORD');
        }
        if (password.length > 128) {
            throw new AuthError('Mot de passe trop long', 'INVALID_PASSWORD');
        }
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumbers = /\d/.test(password);

        if (!hasUpperCase || !hasLowerCase || !hasNumbers) {
            throw new AuthError(
                'Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre',
                'WEAK_PASSWORD'
            );
        }
        return true;
    }

    // Validation des données client
    static validateClientData(clientData, requirePassword = true) {
        const errors = [];

        // Email
        try {
            this.validateEmail(clientData.email);
        } catch (error) {
            errors.push(error.message);
        }

        // Nom
        if (!clientData.nom || typeof clientData.nom !== 'string' || clientData.nom.trim().length === 0) {
            errors.push('Nom requis');
        } else if (clientData.nom.length > 255) {
            errors.push('Nom trop long');
        }

        // Téléphone
        if (!clientData.telephone || typeof clientData.telephone !== 'string' || clientData.telephone.trim().length === 0) {
            errors.push('Téléphone requis');
        } else if (clientData.telephone.length > 20) {
            errors.push('Numéro de téléphone trop long');
        }

        // Nombre de personnes
        if (!clientData.nombre_personnes || typeof clientData.nombre_personnes !== 'number') {
            errors.push('Nombre de personnes requis');
        } else if (!Number.isInteger(clientData.nombre_personnes)) {
            errors.push('Le nombre de personnes doit être un entier');
        } else if (clientData.nombre_personnes < 1 || clientData.nombre_personnes > 20) {
            errors.push('Le nombre de personnes doit être entre 1 et 20');
        }

        // Mot de passe (si requis)
        if (requirePassword) {
            try {
                this.validatePassword(clientData.password);
            } catch (error) {
                errors.push(error.message);
            }
        }

        if (errors.length > 0) {
            throw new AuthError(errors.join(', '), 'VALIDATION_ERROR');
        }

        return true;
    }

    // Inscription d'un nouveau client
    static async register(clientData) {
        let connection;
        try {
            // Validation
            this.validateClientData(clientData, true);

            // Vérifier si l'email existe déjà
            const existingClient = await this.findByEmail(clientData.email);
            if (existingClient) {
                throw new AuthError('Cet email est déjà utilisé', 'EMAIL_EXISTS');
            }

            // Hasher le mot de passe
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(clientData.password, saltRounds);

            // Transaction
            connection = await db.getConnection();
            await connection.beginTransaction();

            const [result] = await connection.execute(
                `INSERT INTO clients (nom, email, telephone, nombre_personnes, password) 
                 VALUES (?, ?, ?, ?, ?)`,
                [
                    clientData.nom.trim(),
                    clientData.email.toLowerCase().trim(),
                    clientData.telephone.trim(),
                    clientData.nombre_personnes,
                    hashedPassword
                ]
            );

            await connection.commit();

            // Retourner le client sans le mot de passe
            return await this.findById(result.insertId);
        } catch (error) {
            if (connection) {
                await connection.rollback();
            }
            if (error instanceof AuthError) throw error;
            throw new AuthError(
                `Erreur lors de l'inscription: ${error.message}`,
                'REGISTRATION_ERROR'
            );
        } finally {
            if (connection) {
                connection.release();
            }
        }
    }

    // Connexion d'un client
    static async login(email, password) {
        try {
            // Validation
            this.validateEmail(email);
            if (!password) {
                throw new AuthError('Mot de passe requis', 'INVALID_PASSWORD');
            }

            // Trouver le client
            const [rows] = await db.execute(
                'SELECT * FROM clients WHERE email = ?',
                [email.toLowerCase().trim()]
            );

            if (rows.length === 0) {
                throw new AuthError('Email ou mot de passe incorrect', 'INVALID_CREDENTIALS');
            }

            const client = rows[0];

            // Vérifier le mot de passe
            const isValidPassword = await bcrypt.compare(password, client.password);
            if (!isValidPassword) {
                throw new AuthError('Email ou mot de passe incorrect', 'INVALID_CREDENTIALS');
            }

            // Retourner le client sans le mot de passe
            const { password: _, ...clientWithoutPassword } = client;
            return new Auth(clientWithoutPassword);
        } catch (error) {
            if (error instanceof AuthError) throw error;
            throw new AuthError(
                `Erreur lors de la connexion: ${error.message}`,
                'LOGIN_ERROR'
            );
        }
    }

    // Trouver un client par ID
    static async findById(id) {
        try {
            const numId = parseInt(id, 10);
            if (isNaN(numId) || numId <= 0) {
                throw new AuthError('ID invalide', 'INVALID_ID');
            }

            const [rows] = await db.execute(
                'SELECT id, nom, email, telephone, nombre_personnes FROM clients WHERE id = ?',
                [numId]
            );

            return rows.length > 0 ? new Auth(rows[0]) : null;
        } catch (error) {
            if (error instanceof AuthError) throw error;
            throw new AuthError(
                `Erreur lors de la récupération du client: ${error.message}`,
                'FETCH_ERROR'
            );
        }
    }

    // Trouver un client par email
    static async findByEmail(email) {
        try {
            this.validateEmail(email);

            const [rows] = await db.execute(
                'SELECT id, nom, email, telephone, nombre_personnes FROM clients WHERE email = ?',
                [email.toLowerCase().trim()]
            );

            return rows.length > 0 ? new Auth(rows[0]) : null;
        } catch (error) {
            if (error instanceof AuthError) throw error;
            throw new AuthError(
                `Erreur lors de la récupération du client: ${error.message}`,
                'FETCH_ERROR'
            );
        }
    }

    // Récupérer toutes les réservations d'un client
    async getReservations() {
        try {
            const [rows] = await db.execute(
                `SELECT r.*, ch.numero as chambre_numero, ch.capacite as chambre_capacite
                 FROM reservations r
                 JOIN chambres ch ON r.chambre_id = ch.id
                 WHERE r.client_id = ?
                 ORDER BY r.date_arrivee DESC`,
                [this.id]
            );
            return rows;
        } catch (error) {
            throw new AuthError(
                `Erreur lors de la récupération des réservations: ${error.message}`,
                'FETCH_ERROR'
            );
        }
    }

    // Changer le mot de passe
    static async changePassword(clientId, oldPassword, newPassword) {
        let connection;
        try {
            // Validation
            this.validatePassword(newPassword);

            // Récupérer le client avec le mot de passe
            const [rows] = await db.execute(
                'SELECT * FROM clients WHERE id = ?',
                [clientId]
            );

            if (rows.length === 0) {
                throw new AuthError('Client non trouvé', 'CLIENT_NOT_FOUND');
            }

            const client = rows[0];

            // Vérifier l'ancien mot de passe
            const isValidPassword = await bcrypt.compare(oldPassword, client.password);
            if (!isValidPassword) {
                throw new AuthError('Ancien mot de passe incorrect', 'INVALID_PASSWORD');
            }

            // Hasher le nouveau mot de passe
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

            // Transaction
            connection = await db.getConnection();
            await connection.beginTransaction();

            await connection.execute(
                'UPDATE clients SET password = ? WHERE id = ?',
                [hashedPassword, clientId]
            );

            await connection.commit();
            return true;
        } catch (error) {
            if (connection) {
                await connection.rollback();
            }
            if (error instanceof AuthError) throw error;
            throw new AuthError(
                `Erreur lors du changement de mot de passe: ${error.message}`,
                'PASSWORD_CHANGE_ERROR'
            );
        } finally {
            if (connection) {
                connection.release();
            }
        }
    }

    // Mettre à jour le profil
    async updateProfile(clientData) {
        let connection;
        try {
            // Validation partielle
            if (clientData.nom) {
                if (typeof clientData.nom !== 'string' || clientData.nom.trim().length === 0) {
                    throw new AuthError('Nom invalide', 'INVALID_DATA');
                }
                if (clientData.nom.length > 255) {
                    throw new AuthError('Nom trop long', 'INVALID_DATA');
                }
            }

            if (clientData.telephone) {
                if (typeof clientData.telephone !== 'string' || clientData.telephone.trim().length === 0) {
                    throw new AuthError('Téléphone invalide', 'INVALID_DATA');
                }
                if (clientData.telephone.length > 20) {
                    throw new AuthError('Téléphone trop long', 'INVALID_DATA');
                }
            }

            if (clientData.nombre_personnes !== undefined) {
                if (!Number.isInteger(clientData.nombre_personnes) || clientData.nombre_personnes < 1 || clientData.nombre_personnes > 20) {
                    throw new AuthError('Nombre de personnes invalide', 'INVALID_DATA');
                }
            }

            // Transaction
            connection = await db.getConnection();
            await connection.beginTransaction();

            const nom = clientData.nom !== undefined ? clientData.nom.trim() : this.nom;
            const telephone = clientData.telephone !== undefined ? clientData.telephone.trim() : this.telephone;
            const nombre_personnes = clientData.nombre_personnes !== undefined ? clientData.nombre_personnes : this.nombre_personnes;

            await connection.execute(
                'UPDATE clients SET nom = ?, telephone = ?, nombre_personnes = ? WHERE id = ?',
                [nom, telephone, nombre_personnes, this.id]
            );

            await connection.commit();

            // Mise à jour de l'instance
            this.nom = nom;
            this.telephone = telephone;
            this.nombre_personnes = nombre_personnes;

            return true;
        } catch (error) {
            if (connection) {
                await connection.rollback();
            }
            if (error instanceof AuthError) throw error;
            throw new AuthError(
                `Erreur lors de la mise à jour du profil: ${error.message}`,
                'UPDATE_ERROR'
            );
        } finally {
            if (connection) {
                connection.release();
            }
        }
    }

    // Méthode utilitaire pour le JSON
    toJSON() {
        return {
            id: this.id,
            nom: this.nom,
            email: this.email,
            telephone: this.telephone,
            nombre_personnes: this.nombre_personnes
        };
    }
}

export default Auth;
export { AuthError };