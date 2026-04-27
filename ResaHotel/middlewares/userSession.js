// middleware/userSession.js
export const userSession = (req, res, next) => {
    // Rendre l'utilisateur disponible dans toutes les vues
    res.locals.user = null;
    
    if (req.session && req.session.clientId) {
        res.locals.user = {
            id: req.session.clientId,
            nom: req.session.clientNom,
            email: req.session.clientEmail,
            telephone: req.session.clientTelephone,
            initiale: req.session.clientNom ? req.session.clientNom.charAt(0).toUpperCase() : 'U'
        };
    }
    
    next();
};