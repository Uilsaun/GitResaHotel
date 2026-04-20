// Middleware pour rendre la session disponible dans les templates EJS
app.use((req, res, next) => {
    res.locals.clientId = req.session.clientId || null;
    res.locals.clientNom = req.session.clientNom || null;
    res.locals.clientEmail = req.session.clientEmail || null;
    next();
});
