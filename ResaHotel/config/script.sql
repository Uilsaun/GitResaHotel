-- ======================================================================================
-- Informations de connexion à la base de données :
-- host=localhost
-- user=username
-- password=password
-- database=resahotelcalifornia
-- charset=utf8mb4
-- ======================================================================================

DROP DATABASE IF EXISTS resahotelcalifornia;
CREATE DATABASE resahotelcalifornia CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE resahotelcalifornia;

-- ======================================================================================
-- Création de l'utilisateur MySQL
-- ======================================================================================

DROP USER IF EXISTS 'username'@'localhost';
CREATE USER 'username'@'localhost' IDENTIFIED BY 'password';
GRANT ALL PRIVILEGES ON resahotelcalifornia.* TO 'username'@'localhost';
FLUSH PRIVILEGES;

-- ======================================================================================
-- TABLE : users
-- ======================================================================================

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'user') DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ======================================================================================
-- TABLE : clients
-- ======================================================================================

CREATE TABLE clients (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NULL,
    nom VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    password VARCHAR(255) NOT NULL,
    telephone VARCHAR(20) NOT NULL DEFAULT '',
    nombre_personnes INT NOT NULL DEFAULT 1,
    FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ======================================================================================
-- TABLE : chambres
-- ======================================================================================

CREATE TABLE chambres (
    id INT AUTO_INCREMENT PRIMARY KEY,
    numero VARCHAR(10) NOT NULL UNIQUE,
    capacite INT NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ======================================================================================
-- TABLE : hotel
-- ======================================================================================

CREATE TABLE hotel (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    adresse VARCHAR(255),
    ville VARCHAR(100),
    telephone VARCHAR(20),
    email VARCHAR(100),
    site_web VARCHAR(255)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ======================================================================================
-- TABLE : reservations
-- ======================================================================================

CREATE TABLE reservations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    client_id INT NOT NULL,
    chambre_id INT NOT NULL,
    date_arrivee DATE NOT NULL,
    date_depart DATE NOT NULL,
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
    FOREIGN KEY (chambre_id) REFERENCES chambres(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ======================================================================================
-- TABLE : contact (sponsors) liée à hotel
-- ======================================================================================

CREATE TABLE contact (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom_entreprise VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    telephone VARCHAR(20),
    adresse VARCHAR(255),
    site_web VARCHAR(255),
    type_sponsor VARCHAR(50),
    hotel_id INT NOT NULL,
    FOREIGN KEY (hotel_id) REFERENCES hotel(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ======================================================================================
-- TABLE : ticket
-- ======================================================================================

CREATE TABLE ticket (
    ticket_id           int AUTO_INCREMENT PRIMARY KEY,
    nom_personne        VARCHAR(100) NOT NULL,
    email               VARCHAR(100) NOT NULL,
    sujet               VARCHAR(100) NOT NULL,
    message_complement  VARCHAR(100) NOT NULL,
    hotel_id            int NOT NULL,
    FOREIGN KEY (hotel_id) REFERENCES hotel(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ======================================================================================
-- TABLE : avis_hotel
-- ======================================================================================

CREATE TABLE avis_hotel (
    avis_id         INT AUTO_INCREMENT PRIMARY KEY,
    notation        INT NOT NULL,
    message         VARCHAR(100),
    email           VARCHAR(100) NOT NULL,
    avis_googlemaps INT,
    hotel_id        int NOT NULL,
    FOREIGN KEY (hotel_id) REFERENCES hotel(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- ======================================================================================
-- INSERTIONS DE DONNÉES
-- ======================================================================================

-- 👤 Utilisateur admin par défaut
-- Mot de passe : admin123
INSERT INTO users (nom, email, password, role) VALUES
('Admin', 'admin@hotelcalifornia.fr', '$2b$10$Vxk1jzIzVSnZXVy/xpYw6ejqJd7QGkg3mI4pJkLGlxzjHRSKDCV3y', 'admin');

-- 👥 Clients (password = 'Password1' haché)
INSERT INTO clients (nom, email, password, telephone, nombre_personnes) VALUES
('Jean Dupont', 'jean.dupont@email.com', '$2b$10$Vxk1jzIzVSnZXVy/xpYw6ejqJd7QGkg3mI4pJkLGlxzjHRSKDCV3y', '0612345678', 2),
('Marie Martin', 'marie.martin@email.com', '$2b$10$Vxk1jzIzVSnZXVy/xpYw6ejqJd7QGkg3mI4pJkLGlxzjHRSKDCV3y', '0687654321', 3),
('Pierre Durand', 'pierre.durand@email.com', '$2b$10$Vxk1jzIzVSnZXVy/xpYw6ejqJd7QGkg3mI4pJkLGlxzjHRSKDCV3y', '0654321789', 1),
('Sophie Leclerc', 'sophie.leclerc@email.com', '$2b$10$Vxk1jzIzVSnZXVy/xpYw6ejqJd7QGkg3mI4pJkLGlxzjHRSKDCV3y', '0678912345', 4),
('Thomas Bernard', 'thomas.bernard@email.com', '$2b$10$Vxk1jzIzVSnZXVy/xpYw6ejqJd7QGkg3mI4pJkLGlxzjHRSKDCV3y', '0690123456', 2),
('Émilie Moreau', 'emilie.moreau@email.com', '$2b$10$Vxk1jzIzVSnZXVy/xpYw6ejqJd7QGkg3mI4pJkLGlxzjHRSKDCV3y', '0676543210', 1),
('François Petit', 'francois.petit@email.com', '$2b$10$Vxk1jzIzVSnZXVy/xpYw6ejqJd7QGkg3mI4pJkLGlxzjHRSKDCV3y', '0645678912', 2),
('Isabelle Roux', 'isabelle.roux@email.com', '$2b$10$Vxk1jzIzVSnZXVy/xpYw6ejqJd7QGkg3mI4pJkLGlxzjHRSKDCV3y', '0698765432', 3);

-- 🏨 Chambres
INSERT INTO chambres (numero, capacite) VALUES
('101', 2),
('102', 2),
('103', 1),
('201', 3),
('202', 2),
('203', 4),
('301', 2),
('302', 3),
('401', 4),
('402', 1);

-- 📅 Réservations
INSERT INTO reservations (client_id, chambre_id, date_arrivee, date_depart) VALUES
(1, 1, '2024-01-15', '2024-01-20'),
(3, 3, '2024-02-05', '2024-02-07'),
(2, 4, '2025-03-18', '2025-03-25'),
(5, 2, '2025-03-15', '2025-03-22'),
(4, 6, '2025-04-10', '2025-04-17'),
(6, 8, '2025-05-01', '2025-05-05'),
(7, 5, '2025-06-15', '2025-06-22'),
(8, 9, '2025-07-01', '2025-07-10'),
(1, 1, '2025-05-10', '2025-05-15'),
(2, 1, '2025-06-20', '2025-06-25'),
(4, 7, '2025-08-05', '2025-08-12'),
(4, 10, '2025-10-10', '2025-10-15');

-- 🏢 Hôtel
INSERT INTO hotel (nom, adresse, ville, telephone, email, site_web) VALUES
('Hôtel California', '30 Rue Louise Michel', 'Grenoble', '0438123600', 'kwentinsaundev@hotelcalifornia.fr', 'http://localhost:3000/');

-- 🤝 Contacts (sponsors)
INSERT INTO contact (nom_entreprise, email, telephone, adresse, site_web, type_sponsor, hotel_id) VALUES
('Nintendo', 'contact@nintendo.de', '0147258369', '10 Rue de la Paix, Paris', 'http://www.nintendo.fr', 'Partenaire', 1),
('Sony', 'contact@sony.de', '0147258368', '15 Avenue des Champs, Paris', 'http://www.sony.fr', 'Fournisseur', 1),
('Adidas', 'contact@adidas.de', '0147258367', '20 Boulevard Haussmann, Paris', 'http://www.adidas.fr', 'Publicitaire', 1),
('Apple', 'contact@apple.de', '0147258366', '25 Rue de Rivoli, Paris', 'http://www.apple.fr', 'Partenaire', 1),
('Samsung', 'contact@samsung.de', '0147258365', '30 Avenue Montaigne, Paris', 'http://www.samsung.fr', 'Fournisseur', 1),
('Microsoft', 'contact@microsoft.de', '0147258364', '35 Rue Saint-Honoré, Paris', 'http://www.microsoft.fr', 'Publicitaire', 1);

-- ======================================================================================
-- FIN DU SCRIPT
-- ======================================================================================