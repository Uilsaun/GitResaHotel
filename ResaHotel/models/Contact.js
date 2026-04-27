/* contact model */
import db from './connexion.js';

class Contact {
    constructor(data) {
        this.id = data.id;
        this.nom_entreprise = data.nom_entreprise;
        this.email = data.email;
        this.telephone = data.telephone;
        this.adresse = data.adresse;
        this.site_web = data.site_web;
        this.type_sponsor = data.type_sponsor;
        this.hotel_id = data.hotel_id;
    }

    static async findAll() {
        const [rows] = await db.execute('SELECT * FROM contact ORDER BY nom_entreprise ASC');
        return rows.map(row => new Contact(row));
    }

    static async findById(id) {
        const [rows] = await db.execute('SELECT * FROM contact WHERE id = ?', [id]);
        return rows.length > 0 ? new Contact(rows[0]) : null;
    }

    static async create(contactData) {
        const [result] = await db.execute(
            `INSERT INTO contact 
            (nom_entreprise, email, telephone, adresse, site_web, type_sponsor, hotel_id) 
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                contactData.nom_entreprise,
                contactData.email,
                contactData.telephone,
                contactData.adresse,
                contactData.site_web,
                contactData.type_sponsor,
                contactData.hotel_id
            ]
        );
        return result.insertId;
    }

    async update(contactData) {
        await db.execute(
            `UPDATE contact 
             SET nom_entreprise = ?, email = ?, telephone = ?, adresse = ?, site_web = ?, type_sponsor = ?, hotel_id = ?
             WHERE id = ?`,
            [
                contactData.nom_entreprise,
                contactData.email,
                contactData.telephone,
                contactData.adresse,
                contactData.site_web,
                contactData.type_sponsor,
                contactData.hotel_id,
                this.id
            ]
        );

        Object.assign(this, contactData);
    }

    async delete() {
        await db.execute('DELETE FROM contact WHERE id = ?', [this.id]);
    }
}

export default Contact;