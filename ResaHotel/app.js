// code app.js
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

import chambreRoutes from './routes/chambres.js';
import serviceRoutes from './routes/service.js';
import clientsRoutes from './routes/clients.js';
import contactRoutes from './routes/contact.js';
import authRoutes from './routes/auth.js'

const app = express();
const PORT = 3000;

// ---- Calcul du chemin absolu pour Windows ----
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Utilisation de path.resolve pour s'assurer que le chemin est correct
app.set('view engine', 'ejs');
app.set('views', path.resolve(__dirname, 'views')); // <-- ici

// ---- Middleware ----
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// ---- Routes ----
app.use('/chambres', chambreRoutes);
app.use('/clients', clientsRoutes);
app.use('/service', serviceRoutes);
app.use('/contact', contactRoutes);
app.use('/auth', authRoutes);

app.get('/', (req, res) => {
    res.render('accueil', { title: 'Hôtel California - Système de Gestion' });
});

// ---- Test rapide pour vérifier si Express trouve error.ejs ----
app.get('/test-error', (req, res) => {
    res.render('error', { title: 'Test Error', error: 'Ceci est un test' });
});

// ---- 404 ----
app.use((req, res) => {
    res.status(404).render('error', { title: 'Page non trouvée', error: 'La page demandée n\'existe pas.' });
});

// ---- Lancement du serveur ----
app.listen(PORT, () => console.log(`Serveur démarré sur http://localhost:${PORT}`));
