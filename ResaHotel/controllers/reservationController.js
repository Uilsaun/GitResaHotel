// controllers/reservationController.js - CORRIGÉ
import Reservation from '../models/Reservation.js';
import Chambre from '../models/Chambre.js';
import Auth from '../models/auth.js';  // ← CHANGÉ ICI

class ReservationController {
    // GET : /reservations
    static async index(req, res) {
        try {
            let reservations;
            
            if (req.session && req.session.clientId) {
                reservations = await Reservation.findByClientId(req.session.clientId);
            } else {
                reservations = await Reservation.findAll();
            }

            res.render('reservations/index', {
                title: 'Mes Réservations - Hôtel California',
                reservations,
                success: req.query.success === 'true',
                deleted: req.query.deleted === 'true',
                user: req.session.clientId ? {
                    id: req.session.clientId,
                    nom: req.session.clientNom,
                    email: req.session.clientEmail,
                    initiale: req.session.clientNom ? req.session.clientNom.charAt(0).toUpperCase() : '?'
                } : null
            });
        } catch (error) {
            console.error('Erreur lors de la récupération des réservations :', error);
            res.status(500).render('error', {
                title: 'Erreur',
                error: 'Impossible de récupérer les réservations'
            });
        }
    }

    // GET : /reservations/create
    static async create(req, res) {
        try {
            if (!req.session || !req.session.clientId) {
                const returnUrl = `/reservations/create?${new URLSearchParams(req.query).toString()}`;
                return res.redirect(`/auth/login?returnUrl=${encodeURIComponent(returnUrl)}`);
            }

            const { chambre_id, date_arrivee, date_depart } = req.query;
            
            // ← CHANGÉ ICI : Auth au lieu de Client
            const clientFromDb = await Auth.findById(req.session.clientId);
            
            const needsPhone = !clientFromDb.telephone || clientFromDb.telephone === 'null';
            const needsNbPersonnes = !clientFromDb.nombre_personnes;
            
            const chambre = chambre_id ? await Chambre.findById(chambre_id) : null;
            
            res.render('reservations/create', {
                title: 'Nouvelle Réservation - Hôtel California',
                chambre,
                client: {
                    id: req.session.clientId,
                    nom: req.session.clientNom,
                    email: req.session.clientEmail,
                    telephone: clientFromDb.telephone,
                    nombre_personnes: clientFromDb.nombre_personnes
                },
                needsPhone,
                needsNbPersonnes,
                filters: {
                    chambre_id: chambre_id || '',
                    date_arrivee: date_arrivee || '',
                    date_depart: date_depart || ''
                },
                errors: [],
                user: {
                    id: req.session.clientId,
                    nom: req.session.clientNom,
                    email: req.session.clientEmail

                }
            });
        } catch (error) {
            console.error('Erreur lors de l\'affichage du formulaire :', error);
            res.status(500).render('error', {
                title: 'Erreur',
                error: 'Impossible d\'afficher le formulaire de réservation'
            });
        }
    }

    // POST : /reservations/create
    static async store(req, res) {
        try {
            if (!req.session || !req.session.clientId) {
                return res.redirect('/auth/login');
            }

            const { chambre_id, date_arrivee, date_depart, telephone, nombre_personnes } = req.body;
            const client_id = req.session.clientId;
            
            if (!chambre_id || !date_arrivee || !date_depart) {
                throw new Error('Tous les champs sont obligatoires');
            }

            if (new Date(date_depart) <= new Date(date_arrivee)) {
                throw new Error('La date de départ doit être après la date d\'arrivée');
            }

            // Si téléphone fourni, mettre à jour
            if (telephone && telephone.trim() !== '') {
                const telephoneRegex = /^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/;
                if (!telephoneRegex.test(telephone.replace(/\s/g, ''))) {
                    throw new Error('Format de téléphone invalide');
                }

                // ← CHANGÉ ICI : Auth au lieu de Client
                const client = await Auth.findById(client_id);
                if (client) {
                    await client.updateProfile({
                        nom: req.session.clientNom,
                        telephone: telephone.trim(),
                        nombre_personnes: nombre_personnes ? parseInt(nombre_personnes) : 1
                    });
                }

                req.session.clientTelephone = telephone.trim();
                req.session.clientNombrePersonnes = nombre_personnes ? parseInt(nombre_personnes) : 1;
            }
            
            const isAvailable = await Reservation.checkAvailability(
                chambre_id,
                date_arrivee,
                date_depart
            );
            
            if (!isAvailable) {
                const chambre = await Chambre.findById(chambre_id);
                const clientFromDb = await Auth.findById(client_id);  // ← CHANGÉ ICI
                
                return res.render('reservations/create', {
                    title: 'Nouvelle Réservation - Hôtel California',
                    chambre,
                    client: {
                        id: client_id,
                        nom: req.session.clientNom,
                        email: req.session.clientEmail,
                        telephone: clientFromDb.telephone,
                        nombre_personnes: clientFromDb.nombre_personnes
                    },
                    needsPhone: !clientFromDb.telephone,
                    needsNbPersonnes: !clientFromDb.nombre_personnes,
                    filters: { chambre_id, date_arrivee, date_depart },
                    errors: [{ msg: 'Cette chambre n\'est plus disponible pour ces dates' }],
                    user: {
                        id: client_id,
                        nom: req.session.clientNom,
                        email: req.session.clientEmail
                    }
                });
            }
            
            await Reservation.create({
                client_id,
                chambre_id,
                date_arrivee,
                date_depart
            });
            
            res.redirect('/reservations?success=true');
        } catch (error) {
            console.error('Erreur lors de la création de la réservation :', error);
            
            try {
                const chambre = req.body.chambre_id ? await Chambre.findById(req.body.chambre_id) : null;
                const clientFromDb = await Auth.findById(req.session.clientId);  // ← CHANGÉ ICI
                
                res.render('reservations/create', {
                    title: 'Nouvelle Réservation - Hôtel California',
                    chambre,
                    client: {
                        id: req.session.clientId,
                        nom: req.session.clientNom,
                        email: req.session.clientEmail,
                        telephone: clientFromDb.telephone,
                        nombre_personnes: clientFromDb.nombre_personnes
                    },
                    needsPhone: !clientFromDb.telephone,
                    needsNbPersonnes: !clientFromDb.nombre_personnes,
                    filters: req.body,
                    errors: [{ msg: error.message || 'Erreur lors de la création de la réservation' }],
                    user: {
                        id: req.session.clientId,
                        nom: req.session.clientNom,
                        email: req.session.clientEmail
                    }
                });
            } catch (renderError) {
                res.redirect('/reservations');
            }
        }
    }

    // GET : /reservations/delete/:id
    static async delete(req, res) {
        try {
            if (!req.session || !req.session.clientId) {
                return res.redirect('/auth/login');
            }

            const reservation = await Reservation.findById(req.params.id);
            
            if (!reservation) {
                return res.redirect('/reservations');
            }

            if (reservation.client_id !== req.session.clientId) {
                return res.status(403).render('error', {
                    title: 'Accès refusé',
                    error: 'Vous ne pouvez pas supprimer cette réservation'
                });
            }

            res.render('reservations/delete', {
                title: 'Supprimer Réservation - Hôtel California',
                reservation,
                user: {
                    id: req.session.clientId,
                    nom: req.session.clientNom
                }
            });
        } catch (error) {
            console.error('Erreur :', error);
            res.redirect('/reservations');
        }
    }

    // POST : /reservations/delete/:id
    static async destroy(req, res) {
        try {
            if (!req.session || !req.session.clientId) {
                return res.redirect('/auth/login');
            }

            const reservation = await Reservation.findById(req.params.id);
            
            if (!reservation) {
                return res.redirect('/reservations');
            }

            if (reservation.client_id !== req.session.clientId) {
                return res.status(403).render('error', {
                    title: 'Accès refusé',
                    error: 'Vous ne pouvez pas supprimer cette réservation'
                });
            }

            await Reservation.delete(req.params.id);
            res.redirect('/reservations?deleted=true');
        } catch (error) {
            console.error('Erreur lors de la suppression :', error);
            res.redirect('/reservations');
        }
    }
}

export default ReservationController;