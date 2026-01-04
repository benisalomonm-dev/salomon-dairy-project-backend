# 🔧 Guide de Configuration XAMPP pour le Projet Dairy Management

## 📥 Installation de XAMPP

### Windows
1. Télécharger XAMPP depuis https://www.apachefriends.org/download.html
2. Exécuter le fichier d'installation `xampp-windows-x64-installer.exe`
3. Choisir les composants à installer (Apache, MySQL, PHP, phpMyAdmin)
4. Installer dans `C:\xampp` (recommandé)

### Linux (Ubuntu/Debian)
```bash
# Télécharger l'installateur
wget https://www.apachefriends.org/xampp-files/8.2.12/xampp-linux-x64-8.2.12-0-installer.run

# Rendre exécutable
chmod +x xampp-linux-x64-*.run

# Installer
sudo ./xampp-linux-x64-*.run

# XAMPP sera installé dans /opt/lampp
```

### macOS
1. Télécharger XAMPP depuis https://www.apachefriends.org/download.html
2. Ouvrir le fichier .dmg
3. Glisser XAMPP dans Applications
4. Ouvrir XAMPP depuis Applications

---

## 🚀 Démarrer XAMPP

### Windows
1. Ouvrir **XAMPP Control Panel**
2. Cliquer sur **Start** à côté de **MySQL**
3. Apache est optionnel (seulement si vous voulez utiliser phpMyAdmin)

### Linux
```bash
# Démarrer XAMPP
sudo /opt/lampp/lampp start

# Démarrer uniquement MySQL
sudo /opt/lampp/lampp startmysql

# Vérifier le statut
sudo /opt/lampp/lampp status
```

### macOS
1. Ouvrir XAMPP depuis Applications
2. Cliquer sur l'onglet **Manage Servers**
3. Sélectionner **MySQL Database**
4. Cliquer sur **Start**

---

## 💾 Créer la Base de Données

### Méthode 1: Via phpMyAdmin (Interface Graphique)

1. **Démarrer Apache dans XAMPP** (pour accéder à phpMyAdmin)
2. **Ouvrir phpMyAdmin:**
   - Windows/Linux: http://localhost/phpmyadmin
   - macOS: http://localhost:8080/phpmyadmin
3. **Créer la base de données:**
   - Cliquer sur "**Nouvelle base de données**" ou "**New**"
   - Nom: `dairy_management`
   - Interclassement: `utf8mb4_general_ci`
   - Cliquer sur "**Créer**"

✅ **C'est fait!** Votre base de données est créée.

### Méthode 2: Via Ligne de Commande

**Windows:**
```cmd
# Aller dans le dossier XAMPP
cd C:\xampp

# Lancer MySQL
mysql\bin\mysql.exe -u root -p

# (Appuyer sur Entrée si aucun mot de passe)
```

**Linux:**
```bash
# Lancer MySQL
sudo /opt/lampp/bin/mysql -u root -p
```

**macOS:**
```bash
# Lancer MySQL
/Applications/XAMPP/xamppfiles/bin/mysql -u root -p
```

**Une fois dans MySQL:**
```sql
CREATE DATABASE dairy_management CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
SHOW DATABASES;
EXIT;
```

---

## ⚙️ Configuration du Projet

### 1. Créer le fichier .env

```bash
cd backend
cp .env.example .env
```

### 2. Éditer le fichier .env

Ouvrir `.env` et vérifier/modifier ces valeurs:

```env
# Database (MySQL via XAMPP)
DB_HOST=localhost
DB_PORT=3306
DB_NAME=dairy_management
DB_USER=root
DB_PASSWORD=
# ⚠️ Laisser DB_PASSWORD vide si vous n'avez pas défini de mot de passe dans XAMPP

# Server
PORT=5000
NODE_ENV=development

# JWT (changez ces valeurs en production!)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d

# Frontend
FRONTEND_URL=http://localhost:5173
```

---

## 🗄️ Initialiser la Base de Données

### 1. Installer les dépendances Node.js

```bash
cd backend
npm install
```

### 2. Créer les tables

```bash
npm run db:init
```

Vous devriez voir:
```
🔄 Initializing database...
✅ Database connection established
✅ All models synchronized successfully
📊 Tables created:
   - users
   - products
   - clients
   - orders
   - batches
   - invoices
```

### 3. Remplir avec des données de test

```bash
npm run db:seed
```

Cela créera:
- 4 utilisateurs (admin, manager, operator, driver)
- 4 produits (lait, yaourt, fromage, beurre)
- 3 clients
- 2 commandes
- 2 lots de production
- 2 factures

---

## 🧪 Tester la Connexion

### Vérifier que MySQL fonctionne

**Via phpMyAdmin:**
1. Aller sur http://localhost/phpmyadmin
2. Vous devriez voir `dairy_management` dans la liste des bases de données
3. Cliquer dessus pour voir les tables créées

**Via ligne de commande:**
```bash
# Windows
C:\xampp\mysql\bin\mysql.exe -u root -p

# Linux
sudo /opt/lampp/bin/mysql -u root -p

# macOS
/Applications/XAMPP/xamppfiles/bin/mysql -u root -p

# Puis dans MySQL:
USE dairy_management;
SHOW TABLES;
SELECT * FROM users;
EXIT;
```

---

## 🚀 Démarrer le Backend

```bash
cd backend
npm run dev
```

Vous devriez voir:
```
✅ MySQL Connected: localhost:3306
✅ Database models synchronized
🚀 Server running on port 5000
```

Le backend est maintenant disponible sur: **http://localhost:5000/api/v1**

---

## 🔐 Comptes de Test

Une fois les données seeded, vous pouvez vous connecter avec:

| Rôle | Email | Mot de passe |
|------|-------|--------------|
| Admin | admin@dairy.com | password123 |
| Manager | manager@dairy.com | password123 |
| Operateur | operator@dairy.com | password123 |
| Chauffeur | driver@dairy.com | password123 |

---

## ⚠️ Problèmes Courants

### 1. "Port 3306 already in use"

**Cause:** Un autre serveur MySQL est déjà en cours d'exécution.

**Solution:**
```bash
# Windows - Arrêter le service MySQL
net stop MySQL80

# Linux
sudo systemctl stop mysql

# Puis redémarrer XAMPP MySQL
```

### 2. "Access denied for user 'root'@'localhost'"

**Cause:** Mot de passe incorrect ou utilisateur non configuré.

**Solution:**
- Vérifier que `DB_PASSWORD` est vide dans `.env`
- Si vous avez défini un mot de passe dans XAMPP, le mettre dans `.env`

### 3. "Cannot find module 'mysql2'"

**Solution:**
```bash
cd backend
npm install
```

### 4. "Database dairy_management does not exist"

**Solution:**
Créer la base de données manuellement via phpMyAdmin ou ligne de commande.

### 5. XAMPP ne démarre pas sur Linux

**Solution:**
```bash
# Donner les permissions
sudo chmod +x /opt/lampp/lampp

# Arrêter les processus conflictuels
sudo systemctl stop apache2
sudo systemctl stop mysql

# Redémarrer XAMPP
sudo /opt/lampp/lampp restart
```

---

## 🛠️ Commandes Utiles

### XAMPP

```bash
# Linux - Démarrer tout XAMPP
sudo /opt/lampp/lampp start

# Linux - Démarrer uniquement MySQL
sudo /opt/lampp/lampp startmysql

# Linux - Arrêter XAMPP
sudo /opt/lampp/lampp stop

# Linux - Redémarrer XAMPP
sudo /opt/lampp/lampp restart

# Linux - Statut de XAMPP
sudo /opt/lampp/lampp status
```

### Base de Données

```bash
# Initialiser (créer les tables)
npm run db:init

# Remplir avec des données
npm run db:seed

# Réinitialiser complètement
npm run db:reset
```

### Backend

```bash
# Mode développement (avec hot-reload)
npm run dev

# Build pour production
npm run build

# Démarrer en production
npm start
```

---

## 📋 Checklist de Configuration

- [ ] XAMPP installé
- [ ] MySQL démarré dans XAMPP
- [ ] Base de données `dairy_management` créée
- [ ] Fichier `.env` créé et configuré
- [ ] `npm install` exécuté
- [ ] `npm run db:init` exécuté (tables créées)
- [ ] `npm run db:seed` exécuté (données de test)
- [ ] `npm run dev` démarre sans erreur
- [ ] Backend accessible sur http://localhost:5000/api/v1

---

## 🎓 Ressources

- **XAMPP:** https://www.apachefriends.org/
- **Documentation MySQL:** https://dev.mysql.com/doc/
- **phpMyAdmin:** http://localhost/phpmyadmin
- **Backend API:** http://localhost:5000/api/v1

---

## ✅ Félicitations!

Votre environnement XAMPP est configuré et le backend fonctionne! 🎉

Vous pouvez maintenant:
1. Démarrer le frontend: `cd .. && npm run dev`
2. Accéder à l'application: http://localhost:5173
3. Se connecter avec admin@dairy.com / password123
