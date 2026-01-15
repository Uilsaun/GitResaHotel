// controllers/chambreController.js
import Chambre from '../models/Chambre.js';

class ChambreController {
    // GET : /chambres → afficher liste de toutes les chambres
    static async index(req, res) {
        try {
            const chambres = await Chambre.findAll();
            res.render('chambres/index', {
                title: 'Hôtel California - Gestion des Chambres',
                chambres
            });
        } catch (error) {
            console.error('Erreur lors de la récupération des chambres :', error);
            res.status(500).render('error', {
                title: 'Erreur',
                error: 'Impossible de récupérer les chambres'
            });
        }
    }

    // GET : /chambres/disponibles → afficher chambres disponibles (avec ou sans dates)
    static async showAvailable(req, res) {
        try {
            const { date_arrivee, date_depart, nb_personnes } = req.query;
            
            let chambres;
            let hasDateFilter = false;
            
            // Si des dates sont fournies, filtrer par disponibilité
            if (date_arrivee && date_depart) {
                hasDateFilter = true;
                chambres = await Chambre.findAvailable(
                    date_arrivee, 
                    date_depart, 
                    nb_personnes ? parseInt(nb_personnes) : null
                );
            } else {
                // Sinon, afficher toutes les chambres
                chambres = await Chambre.findAll();
                
                // Filtrer par capacité si spécifiée
                if (nb_personnes) {
                    const capacite = parseInt(nb_personnes);
                    chambres = chambres.filter(c => c.capacite >= capacite);
                }
            }

            res.render('chambres/dispo', {
                title: 'Chambres Disponibles - Hôtel California',
                chambres,
                filters: {
                    date_arrivee: date_arrivee || '',
                    date_depart: date_depart || '',
                    nb_personnes: nb_personnes || 2
                },
                hasDateFilter
            });
        } catch (error) {
            console.error('Erreur lors de la récupération des chambres disponibles :', error);
            res.status(500).render('error', {
                title: 'Erreur',
                error: 'Impossible de récupérer les chambres disponibles'
            });
        }
    }

    // GET : /chambres/create → afficher formulaire création
    static create(req, res) {
        res.render('chambres/create', {
            title: 'Ajouter une Chambre',
            chambre: {},
            errors: []
        });
    }

    // POST : /chambres/create → ajouter une chambre
    static async store(req, res) {
        try {
            await Chambre.create(req.body);
            res.redirect('/chambres');
        } catch (error) {
            console.error('Erreur lors de la création de la chambre :', error);
            res.render('chambres/create', {
                title: 'Ajouter une Chambre',
                chambre: req.body,
                errors: [{ msg: error.message }]
            });
        }
    }

    // GET : /chambres/edit/:id → afficher formulaire édition
    static async edit(req, res) {
        try {
            const chambre = await Chambre.findById(req.params.id);
            if (!chambre) {
                return res.redirect('/chambres');
            }
            res.render('chambres/edit', {
                title: 'Modifier la Chambre',
                chambre,
                errors: []
            });
        } catch (error) {
            console.error('Erreur lors de la récupération de la chambre :', error);
            res.redirect('/chambres');
        }
    }

    // POST : /chambres/edit/:id → modifier chambre
    static async update(req, res) {
        try {
            const chambre = await Chambre.findById(req.params.id);
            if (chambre) {
                await chambre.update(req.body);
            }
            res.redirect('/chambres');
        } catch (error) {
            console.error('Erreur lors de la mise à jour de la chambre :', error);
            res.redirect('/chambres');
        }
    }

    // GET : /chambres/delete/:id → confirmation suppression
    static async delete(req, res) {
        try {
            const chambre = await Chambre.findById(req.params.id);
            if (!chambre) {
                return res.redirect('/chambres');
            }
            res.render('chambres/delete', {
                title: 'Supprimer la Chambre',
                chambre
            });
        } catch (error) {
            console.error('Erreur lors de la récupération de la chambre :', error);
            res.redirect('/chambres');
        }
    }

    // POST : /chambres/delete/:id → supprimer chambre
    static async destroy(req, res) {
        try {
            const chambre = await Chambre.findById(req.params.id);
            if (!chambre) {
                return res.redirect('/chambres');
            }
            await chambre.delete(req.params.id);
            res.redirect('/chambres');
        } catch (error) {
            console.error('Erreur lors de la suppression de la chambre :', error);
            res.redirect('/chambres');
        }
    }
}

export default ChambreController;