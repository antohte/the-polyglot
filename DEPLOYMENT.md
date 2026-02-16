# Guide de Déploiement - The Polyglot sur Hostinger

Ce guide vous accompagne dans le déploiement de votre application full-stack sur Hostinger.

## 📋 Prérequis

- Un compte Hostinger avec un plan d'hébergement web (Business ou Premium recommandé)
- Accès SSH activé sur votre hébergement
- Node.js installé sur votre serveur Hostinger (vérifier avec le support si nécessaire)
- Une base de données MySQL créée via le panneau Hostinger

## 🗄️ Étape 1 : Configuration de la Base de Données

### 1.1 Créer la base de données MySQL

1. Connectez-vous à votre panneau Hostinger
2. Allez dans **Bases de données** → **Gestion MySQL**
3. Créez une nouvelle base de données :
   - Nom : `the_polyglot` (ou votre choix)
   - Créez un utilisateur avec tous les privilèges
   - **Notez** : nom de la base, utilisateur, mot de passe, et hôte

### 1.2 Importer le schéma de base de données

1. Accédez à **phpMyAdmin** depuis le panneau Hostinger
2. Sélectionnez votre base de données
3. Allez dans l'onglet **Importer**
4. Importez les fichiers SQL depuis `database/` :
   - Commencez par le schéma principal
   - Puis les données initiales si nécessaire

## 🚀 Étape 2 : Préparation du Projet

### 2.1 Build local du frontend

Sur votre machine locale, dans le dossier du projet :

```bash
# Installer les dépendances
npm install

# Build du frontend
npm run build:all
```

Cela va :

- Compiler le frontend React avec Vite → `dist/`
- Copier le build dans `server/client_build/`

### 2.2 Installer les dépendances du serveur

```bash
cd server
npm install --production
```

## 📦 Étape 3 : Upload des Fichiers

### Option A : Via FTP/SFTP (Recommandé pour débutants)

1. Utilisez FileZilla ou le gestionnaire de fichiers Hostinger
2. Connectez-vous avec vos identifiants FTP
3. Uploadez **uniquement** le dossier `server/` vers `public_html/` ou votre dossier web
4. Structure finale sur le serveur :
   ```
   public_html/
   ├── client_build/        (frontend compilé)
   ├── routes/
   ├── middleware/
   ├── scripts/
   ├── uploads/
   ├── db.js
   ├── index.js
   ├── package.json
   ├── .env                 (à créer)
   └── node_modules/        (à installer via SSH)
   ```

### Option B : Via SSH et Git

```bash
# Se connecter en SSH
ssh votre_utilisateur@votre_domaine.com

# Aller dans le dossier web
cd public_html

# Cloner le repository (si vous utilisez Git)
git clone votre_repo_url .

# Build du frontend
npm install
npm run build:all

# Installer les dépendances du serveur
cd server
npm install --production
```

## ⚙️ Étape 4 : Configuration de l'Environnement

### 4.1 Créer le fichier `.env`

Dans le dossier `server/`, créez un fichier `.env` :

```bash
# Via SSH
cd public_html/server
nano .env
```

Contenu du fichier `.env` :

```env
# Database Configuration
DB_HOST=localhost
DB_USER=votre_utilisateur_mysql
DB_PASSWORD=votre_mot_de_passe_mysql
DB_NAME=the_polyglot

# Server Configuration
PORT=5000
NODE_ENV=production

# JWT Secret (générez une clé aléatoire sécurisée)
JWT_SECRET=votre_cle_secrete_jwt_tres_longue_et_aleatoire

# CORS Origin
CORS_ORIGIN=https://votre-domaine.com
```

**Important** : Générez un JWT_SECRET sécurisé :

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 4.2 Tester la connexion à la base de données

```bash
cd server
node -e "require('./db')"
```

Si aucune erreur n'apparaît, la connexion est OK.

## 🔧 Étape 5 : Configuration du Serveur Node.js

### 5.1 Configurer Node.js sur Hostinger

1. Dans le panneau Hostinger, allez dans **Avancé** → **Node.js**
2. Activez Node.js pour votre domaine
3. Configurez :
   - **Mode d'application** : Production
   - **Version Node.js** : 18.x ou supérieur
   - **Fichier d'application** : `server/index.js`
   - **Répertoire de l'application** : `public_html/server`
   - **Port** : 5000 (ou celui dans votre .env)

### 5.2 Démarrer l'application

Via le panneau Hostinger :

- Cliquez sur **Redémarrer** dans la section Node.js

Ou via SSH :

```bash
cd public_html/server
npm start
```

Pour un démarrage automatique, utilisez PM2 :

```bash
npm install -g pm2
pm2 start index.js --name "the-polyglot"
pm2 save
pm2 startup
```

## 🌐 Étape 6 : Configuration du Domaine

### 6.1 Pointer le domaine vers l'application

1. Dans le panneau Hostinger, allez dans **Domaines**
2. Configurez votre domaine pour pointer vers `public_html/server/client_build`
3. Ou configurez un reverse proxy Apache/Nginx vers `localhost:5000`

### 6.2 Configuration Apache (si nécessaire)

Créez/modifiez `.htaccess` dans `public_html/` :

```apache
# Reverse proxy vers Node.js
<IfModule mod_proxy.c>
  ProxyPreserveHost On
  ProxyPass /api http://localhost:5000/api
  ProxyPassReverse /api http://localhost:5000/api
</IfModule>

# Servir le frontend statique
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /

  # Ne pas réécrire les fichiers existants
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d

  # Ne pas réécrire les appels API
  RewriteCond %{REQUEST_URI} !^/api/

  # Rediriger vers index.html pour React Router
  RewriteRule ^ /server/client_build/index.html [L]
</IfModule>
```

## ✅ Étape 7 : Vérification

### 7.1 Tests de base

1. **Frontend** : Accédez à `https://votre-domaine.com`
   - La page d'accueil doit se charger
   - La navigation doit fonctionner

2. **API** : Testez `https://votre-domaine.com/api/health`
   - Devrait retourner : "API is running..."

3. **Base de données** : Essayez de vous inscrire/connecter
   - Vérifiez que les données sont enregistrées dans MySQL

### 7.2 Vérifier les logs

Via SSH :

```bash
# Logs Node.js
pm2 logs the-polyglot

# Logs Apache
tail -f /var/log/apache2/error.log
```

## 🔒 Étape 8 : Sécurité (Important !)

### 8.1 HTTPS

1. Activez le certificat SSL gratuit dans le panneau Hostinger
2. Forcez HTTPS en ajoutant dans `.htaccess` :

```apache
RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
```

### 8.2 Permissions des fichiers

```bash
# Permissions sécurisées
chmod 644 .env
chmod 755 uploads/
```

### 8.3 Sécuriser les uploads

Assurez-vous que le dossier `uploads/` n'autorise pas l'exécution de scripts :

```apache
# Dans uploads/.htaccess
<FilesMatch "\.(php|php3|php4|php5|phtml)$">
  Order Deny,Allow
  Deny from all
</FilesMatch>
```

## 🐛 Dépannage

### L'application ne démarre pas

1. Vérifiez les logs : `pm2 logs` ou `tail -f /var/log/apache2/error.log`
2. Vérifiez que Node.js est bien installé : `node -v`
3. Vérifiez les permissions : `ls -la`
4. Vérifiez le fichier `.env`

### Erreur de connexion à la base de données

1. Vérifiez les identifiants dans `.env`
2. Testez la connexion MySQL : `mysql -u user -p database_name`
3. Vérifiez que l'hôte est correct (souvent `localhost` sur Hostinger)

### Les routes React ne fonctionnent pas

1. Vérifiez que `.htaccess` est bien configuré
2. Vérifiez que `mod_rewrite` est activé
3. Vérifiez les chemins dans la configuration Apache

### Les images/uploads ne s'affichent pas

1. Vérifiez les permissions du dossier `uploads/` : `chmod 755 uploads/`
2. Vérifiez le chemin dans le code
3. Vérifiez la configuration du serveur statique dans `index.js`

## 📞 Support

- **Documentation Hostinger** : https://support.hostinger.com
- **Support Hostinger** : Via le panneau de contrôle
- **Node.js sur Hostinger** : https://support.hostinger.com/en/articles/5617903-how-to-set-up-a-node-js-application

## 🔄 Mises à jour futures

Pour mettre à jour l'application :

```bash
# Sur votre machine locale
npm run build:all

# Upload via FTP ou Git
git pull origin main
npm run build:all

# Redémarrer l'application
pm2 restart the-polyglot
```

---

**Bon déploiement ! 🚀**
