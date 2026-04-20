// models/Reservation.js
import db from './connexion.js';

class Reservation {
    constructor(data) {
        this.id = data.id;
        this.client_id = data.client_id;
        this.chambre_id = data.chambre_id;
        this.date_arrivee = data.date_arrivee;
        this.date_depart = data.date_depart;
    }

    // Récupérer toutes les réservations avec les infos jointes
    static async findAll() {
        const [rows] = await db.execute(`
            SELECT 
                r.id,
                r.client_id,
                r.chambre_id,
                r.date_arrivee,
                r.date_depart,
                c.nom as client_nom,
                c.email as client_email,
                c.telephone as client_telephone,
                ch.numero as chambre_numero,
                ch.capacite as chambre_capacite
            FROM reservations r
            INNER JOIN clients c ON r.client_id = c.id
            INNER JOIN chambres ch ON r.chambre_id = ch.id
            ORDER BY r.date_arrivee DESC
        `);
        return rows;
    }

    // Récupérer une réservation par ID avec les infos jointes
    static async findById(id) {
        const [rows] = await db.execute(`
            SELECT 
                r.id,
                r.client_id,
                r.chambre_id,
                r.date_arrivee,
                r.date_depart,
                c.nom as client_nom,
                c.email as client_email,
                c.telephone as client_telephone,
                c.nombre_personnes as client_nombre_personnes,
                ch.numero as chambre_numero,
                ch.capacite as chambre_capacite
            FROM reservations r
            INNER JOIN clients c ON r.client_id = c.id
            INNER JOIN chambres ch ON r.chambre_id = ch.id
            WHERE r.id = ?
        `, [id]);
        return rows.length > 0 ? rows[0] : null;
    }

    // Créer une nouvelle réservation
    static async create(reservationData) {
        const [result] = await db.execute(
            'INSERT INTO reservations (client_id, chambre_id, date_arrivee, date_depart) VALUES (?, ?, ?, ?)',
            [
                reservationData.client_id,
                reservationData.chambre_id,
                reservationData.date_arrivee,
                reservationData.date_depart
            ]
        );
        return result.insertId;
    }

    // Supprimer une réservation
    static async delete(id) {
        await db.execute('DELETE FROM reservations WHERE id = ?', [id]);
    }

    // Vérifier la disponibilité d'une chambre pour des dates données
    static async checkAvailability(chambre_id, date_arrivee, date_depart, excludeReservationId = null) {
        let query = `
            SELECT COUNT(*) as count
            FROM reservations
            WHERE chambre_id = ?
            AND (
                (date_arrivee <= ? AND date_depart > ?) OR
                (date_arrivee < ? AND date_depart >= ?) OR
                (date_arrivee >= ? AND date_depart <= ?)
            )
        `;
        
        const params = [
            chambre_id,
            date_arrivee, date_arrivee,
            date_depart, date_depart,
            date_arrivee, date_depart
        ];
        
        if (excludeReservationId) {
            query += ' AND id != ?';
            params.push(excludeReservationId);
        }
        
        const [rows] = await db.execute(query, params);
        return rows[0].count === 0;
    }

    // Récupérer les réservations d'un client spécifique
    static async findByClientId(clientId) {
        const [rows] = await db.execute(`
            SELECT 
                r.*,
                ch.numero as chambre_numero,
                ch.capacite as chambre_capacite
            FROM reservations r
            INNER JOIN chambres ch ON r.chambre_id = ch.id
            WHERE r.client_id = ?
            ORDER BY r.date_arrivee DESC
        `, [clientId]);
        return rows;
    }

    // Récupérer les réservations d'une chambre spécifique
    static async findByChambreId(chambreId) {
        const [rows] = await db.execute(`
            SELECT 
                r.*,
                c.nom as client_nom,
                c.email as client_email,
                c.telephone as client_telephone
            FROM reservations r
            INNER JOIN clients c ON r.client_id = c.id
            WHERE r.chambre_id = ?
            ORDER BY r.date_arrivee DESC
        `, [chambreId]);
        return rows;
    }
}

export default Reservation;