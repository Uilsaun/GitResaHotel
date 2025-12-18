// controllers/chambreController.js

import Chambre from '../models/Chambre.js'; // ⚠️ L'import était commenté !

class ChambreController {
    static async index(req, res) {
        try {
            const chambres = await Chambre.findAll();
            res.render('chambres/index', { 
                title: 'Gestion des Chambres', 
                chambres 
            });
        } catch (error) {
            console.error('Erreur lors de la récupération des chambres:', error);
            res.status(500).render('error', { 
                title: 'Erreur',
                error: 'Impossible de récupérer les chambres' 
            });
        }
    }

    static create(req, res) {
        res.render('chambres/create', { 
            title: 'Ajouter une Chambre', 
            chambre: {}, 
            errors: [] 
        });
    }

    static async store(req, res) {
        try {
            
            await Chambre.create(req.body);
            res.redirect('/chambres');
        } catch (error) {
            console.error('Erreur lors de la création de la chambre:', error);
            res.render('chambres/create', { 
                title: 'Ajouter une Chambre', 
                chambre: req.body, 
                errors: [{ msg: error.message }] 
            });
        }
    }

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
            console.error('Erreur lors de la récupération de la chambre:', error);
            res.redirect('/chambres');
        }
    }

    static async update(req, res) {
        try {
            const chambre = await Chambre.findById(req.params.id);
            if (chambre) {
                await chambre.update(req.body);
            }
            res.redirect('/chambres');
        } catch (error) {
            console.error('Erreur lors de la mise à jour de la chambre:', error);
            res.redirect('/chambres');
        }
    }

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
            console.error('Erreur lors de la récupération de la chambre:', error);
            res.redirect('/chambres');
        }
    }

    static async destroy(req, res) {
        try {
            const chambre = await Chambre.findById(req.params.id);
            if (!chambre) {
                return res.redirect('/chambres');
            }
            await chambre.delete(req.params.id);
            res.redirect('/chambres');
        } catch (error) {
            console.error('Erreur lors de la suppression de la chambre:', error);
            res.redirect('/chambres');
        }
    }
}

export default ChambreController;