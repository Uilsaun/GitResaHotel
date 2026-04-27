//connexion.js

// Imports needed for DB connexion
import mysql from 'mysql2/promise';
import fs from 'fs'; // FS : FileSystem (lire les fichiers du disque)
import ini from 'ini'; // INI : Lire le contenu des fichiers au format .ini
import path from 'path'; // PATH: Détermine les chemins (working dir)
import { fileURLToPath } from 'url'; // URL: Convertit les liens en chemin
// Récupérer le chemin local (file://...) et le répertoire courant (workspace/resaHotelCalifornia2)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Lecture des paramètres depuis un fichier configDB.ini (à exclure dans .gitignore)
const config = ini.parse(fs.readFileSync(path.join(__dirname, '../config/configDB.ini'), 'utf-8'));
const dbConfig = {
    host: config.host,
    user: config.user,
    password: config.password,
    database: config.database,
    charset: config.charset
};
// Pool de connexions pour optimiser les performances
const pool = mysql.createPool({
    ...dbConfig,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Exporte le module pool
export default pool;
