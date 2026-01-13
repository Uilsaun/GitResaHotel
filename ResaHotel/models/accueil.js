// commante pour la bse de donnee des ticket 
import db from './connexion.js';

export async function ajouterTicket(data) {
    const { nom_personne, email, sujet, message_complement, hotel_id } = data;

    const sql = `
        INSERT INTO ticket (nom_personne, email, sujet, message_complement, hotel_id)
        VALUES (?, ?, ?, ?, ?)
    `;

    try {
        const [result] = await db.execute(sql, [
            nom_personne,
            email,
            sujet,
            message_complement,
            hotel_id
        ]);

        return { success: true, ticket_id: result.insertId };
    } catch (error) {
        console.error("Erreur insertion ticket :", error);
        return { success: false, error: error.message };
    }
}
