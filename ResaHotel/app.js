// app.js
import express from 'express';
import session from 'express-session';
import path from 'path';
import { fileURLToPath } from 'url';

// Routes
import reservationRoutes from './routes/reservations.js';
import chambreRoutes from './routes/chambres.js';
import serviceRoutes from './routes/service.js';
import clientsRoutes from './routes/clients.js';
import contactRoutes from './routes/contact.js';
import authRoutes from './routes/auth.js';

const app = express();
const PORT = 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.set('view engine', 'ejs');
app.set('views', path.resolve(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(session({
    secret: 'votre_secret_de_session_changez_moi_en_production',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false,
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000
    }
}));

// ---- Middleware utilisateur INLINE (au lieu d'importer) ----
app.use((req, res, next) => {
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
});

// ---- Routes ----
app.use('/auth', authRoutes);
app.use('/chambres', chambreRoutes);
app.use('/clients', clientsRoutes);
app.use('/service', serviceRoutes);
app.use('/contact', contactRoutes);
app.use('/reservations', reservationRoutes);

app.get('/', (req, res) => {
    res.render('accueil', { title: 'Hôtel California - Système de Gestion' });
});

app.get('/test-error', (req, res) => {
    res.render('error', { title: 'Test Error', error: 'Ceci est un test' });
});

app.use((req, res) => {
    res.status(404).render('error', { 
        title: 'Page non trouvée', 
        error: 'La page demandée n\'existe pas.' 
    });
});

app.listen(PORT, () => console.log(`Serveur démarré sur http://localhost:${PORT}`));