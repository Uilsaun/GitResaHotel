//Service.js dossier models
import db from './connexion.js';

class Service {
    constructor(data) {
        this.id = data.id;
        this.name = data.name;
        this.address = data.address;
        this.email = data.email;
        this.phone = data.phone;
    }

    static async findAll() {
        const [rows] = await db.execute('SELECT * FROM service');
        return rows.map(row => new Service(row));
    }
}

export default Service;
