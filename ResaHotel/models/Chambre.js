//Chambre.js dossier models
import db from './connexion.js';

class Chambre {
    constructor(data) {
        this.id = data.id;
        this.numero = data.numero;
        this.capacite = data.capacite;
    }

    static async findAll() {
        const [rows] = await db.execute('SELECT * FROM chambres ORDER BY numero');
        return rows.map(row => new Chambre(row));
    }

    static async findById(id) {
        const [rows] = await db.execute('SELECT * FROM chambres WHERE id = ?', [id]);
        return rows.length > 0 ? new Chambre(rows[0]) : null;
    }

    static async create(chambreData) {
        const [result] = await db.execute(
            'INSERT INTO chambres (numero, capacite) VALUES (?, ?)',
            [chambreData.numero, chambreData.capacite]
        );
        return result.insertId;
    }

    async update(chambreData) {
        await db.execute(
            'UPDATE chambres SET numero = ?, capacite = ? WHERE id = ?',
            [chambreData.numero, chambreData.capacite, this.id]
        );
        this.numero = chambreData.numero;
        this.capacite = chambreData.capacite;
    }

    async delete(id) {
        await db.execute('DELETE FROM chambres WHERE id = ?', [id]);
    }

    static async isAvailable(chambreId, dateArrivee, dateDepart) {
        const [rows] = await db.execute(`
            SELECT COUNT(*) as count
            FROM reservations
            WHERE chambre_id = ?
            AND (
                (date_arrivee <= ? AND date_depart > ?) OR
                (date_arrivee < ? AND date_depart >= ?) OR
                (date_arrivee >= ? AND date_depart <= ?)
            )
        `, [chambreId, dateArrivee, dateArrivee, dateDepart, dateDepart, dateArrivee, dateDepart]);
        return rows[0].count === 0;
    }
}

// ✅ Export ESM
export default Chambre;
