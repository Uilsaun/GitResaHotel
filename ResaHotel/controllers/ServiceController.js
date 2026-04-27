//ServiceControlle.
import Service from '../models/Service.js';

class ServiceController {
    static async index(req, res) {
        try {
            const services = await Service.findAll();
            res.render('service/index', { 
                title: 'Nos Services', 
                services 
            });
            
        } catch (error) {
            console.error(error);
            res.status(500).send("Erreur serveur");
        }
    }
}

export default ServiceController;
