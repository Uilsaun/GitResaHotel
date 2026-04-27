// models/Client.js
import db from './connexion.js';

class Client {
    constructor(data) {
        this.id = data.id;
        this.nom = data.nom;
        this.email = data.email;
        this.telephone = data.telephone;
        this.chambre_id = data.chambre_id;
        this.chambre_nom = data.chambre_nom;
    }

    // Récupérer tous les clients
    static async findAll() {
        const [rows] = await db.execute('SELECT * FROM clients ORDER BY id');
        return rows.map(row => new Client(row));
    }
    // Ajouter un client
    static async create(clientData) {
        const [result] = await db.execute(
            'INSERT INTO clients (nom, email, telephone, chambre_id) VALUES (?, ?, ?, ?)',
            [clientData.nom, clientData.email, clientData.telephone, clientData.chambre_id]
        );
        return result.insertId;
    }

    // Mettre à jour un client
    async update(clientData) {
        await db.execute(
            'UPDATE clients SET nom = ?, email = ?, telephone = ?, chambre_id = ? WHERE id = ?',
            [clientData.nom, clientData.email, clientData.telephone, clientData.chambre_id, this.id]
        );
        this.nom = clientData.nom;
        this.email = clientData.email;
        this.telephone = clientData.telephone;
        this.chambre_id = clientData.chambre_id;
    }

    // ✅ MODIFICATION : Renommer en destroy() pour correspondre au controller
    async destroy() {
        await db.execute('DELETE FROM clients WHERE id = ?', [this.id]);
    }
}

export default Client;