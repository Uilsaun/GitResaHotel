// controllers/clientControllers.js
import Client from '../models/Client.js';

class clientControllers {
    // GET : /clients → afficher liste des clients
    static async index(req, res) {
        try {
            const clients = await Client.findAll();
            res.render('clients/index', {
                title: 'Hôtel California - Gestion des Clients',
                clients
            });
        } catch (error) {
            console.error('Erreur lors de la récupération des clients :', error);
            res.status(500).render('error', {
                title: 'Erreur',
                error: 'Impossible de récupérer les clients'
            });
        }
    }

    // GET : /clients/create → afficher formulaire création
    static create(req, res) {
        res.render('clients/create', {
            title: 'Ajouter un Client',
            client: {},
            errors: []
        });
    }

    // POST : /clients → ajouter un client
    static async store(req, res) {
        try {
            await Client.create(req.body);
            res.redirect('/clients');
        } catch (error) {
            console.error('Erreur lors de la création du client :', error);
            res.render('clients/create', {
                title: 'Ajouter un Client',
                client: req.body,
                errors: [{ msg: error.message }]
            });
        }
    }

    // GET : /clients/:id/edit → afficher formulaire édition
    static async edit(req, res) {
        try {
            const client = await Client.findAll(req.params.id);
            if (!client) {
                return res.redirect('/clients');
            }
            res.render('clients/edit', {
                title: 'Modifier le Client',
                client,
                errors: []
            });
        } catch (error) {
            console.error('Erreur lors de la récupération du client :', error);
            res.redirect('/clients');
        }
    }

    // POST : /clients/:id/edit → modifier client
    static async update(req, res) {
        try {
            const client = await Client.findAll(req.params.id);
            if (client) {
                await client.update(req.body);
            }
            res.redirect('/clients');
        } catch (error) {
            console.error('Erreur lors de la mise à jour du client :', error);
            res.redirect('/clients');
        }
    }

    // GET : /clients/:id/delete → confirmation suppression
    static async delete(req, res) {
        try {
            const client = await Client.findAll(req.params.id);
            if (!client) {
                return res.redirect('/clients');
            }
            res.render('clients/delete', {
                title: 'Supprimer le Client',
                client
            });
        } catch (error) {
            console.error('Erreur lors de la récupération du client :', error);
            res.redirect('/clients');
        }
    }

    // POST : /clients/:id/delete → supprimer client
    static async destroy(req, res) {
        try {
            const client = await Client.findAll(req.params.id);
            if (!client) {
                return res.redirect('/clients');
            }
            await client.destroy();
            res.redirect('/clients');
        } catch (error) {
            console.error('Erreur lors de la suppression du client :', error);
            res.redirect('/clients');
        }
    }
}

export default clientControllers;