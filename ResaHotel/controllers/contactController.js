// controllers/contactController.js
import Contact from '../models/Contact.js';

class ContactController {
    static async index(req, res) {
        try {
            const contacts = await Contact.findAll();
            res.render('contacts/index', { 
                title: 'Gestion des Contacts', 
                contacts 
            });
        } catch (error) {
            console.error('Erreur lors de la récupération des contacts:', error);
            res.status(500).render('error', {
                title: 'Erreur',
                error: 'Impossible de récupérer les contacts' 
            });
        }
    }

    static create(req, res) {
        res.render('contacts/create', { 
            title: 'Ajouter un Contact',
            contact: {},
            errors: []
        });
    }

    static async store(req, res) {
        try {
            await Contact.create({
                ...req.body,
                hotel_id: req.body.hotel_id || 1 // valeur par défaut si non envoyée
            });
            res.redirect('/contacts');
        } catch (error) {
            console.error('Erreur lors de la création du contact:', error);
            res.render('contacts/create', {
                title: 'Ajouter un Contact',
                contact: req.body,
                errors: [{ msg: error.message }]
            });
        }
    }

    static async edit(req, res) {
        try {
            const contact = await Contact.findById(req.params.id);
            if (!contact) {
                return res.status(404).render('error', { title: 'Contact introuvable' });
            }
            res.render('contacts/edit', {
                title: 'Modifier le Contact',
                contact,
                errors: []
            });
        } catch (error) {
            console.error('Erreur lors de la récupération du contact:', error);
            res.redirect('/contacts');
        }
    }

    static async update(req, res) {
        try {
            const contact = await Contact.findById(req.params.id);
            if (!contact) {
                return res.status(404).render('error', { title: 'Contact introuvable' });
            }
            await contact.update(req.body);
            res.redirect('/contacts');
        } catch (error) {
            console.error('Erreur lors de la mise à jour du contact:', error);
            res.render('contacts/edit', {
                title: 'Modifier le Contact',
                contact: { id: req.params.id, ...req.body },
                errors: [{ msg: error.message }]
            });
        }
    }

    static async delete(req, res) {
        try {
            const contact = await Contact.findById(req.params.id);
            if (!contact) {
                return res.status(404).render('error', { title: 'Contact introuvable' });
            }
            res.render('contacts/delete', {
                title: 'Supprimer le Contact',
                contact
            });
        } catch (error) {
            console.error('Erreur lors de la récupération du contact:', error);
            res.redirect('/contacts');
        }
    }

    static async destroy(req, res) {
        try {
            const contact = await Contact.findById(req.params.id);
            if (!contact) {
                return res.status(404).render('error', { title: 'Contact introuvable' });
            }
            await contact.delete(); // ✅ pas d’argument ici
            res.redirect('/contacts');
        } catch (error) {
            console.error('Erreur lors de la suppression du contact:', error);
            res.redirect('/contacts');
        }
    }
}

export default ContactController;
