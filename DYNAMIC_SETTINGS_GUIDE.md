# Système de Paramètres Dynamiques - Documentation Complète

## Vue d'ensemble

J'ai mis en place un système complet de personnalisation dynamique pour mon site. L'objectif était de **simplifier et harmoniser** l'utilisation des couleurs tout en permettant une personnalisation facile via l'interface admin.

### Objectifs atteints
- Simplification : de 60+ paramètres complexes → 6 couleurs essentielles + 7 textes
- Clarté : chaque couleur a un rôle précis et compréhensible
- Dynamique : tous les changements sont appliqués instantanément
- WordPress-like : interface admin intuitive avec onglets

---

## Système de Couleurs

### Les 6 Couleurs Essentielles

J'ai réduit le système à 6 couleurs qui contrôlent l'ensemble du design :

| Paramètre BDD | Variable CSS | Rôle |
|--------------|--------------|------|
| `main_color` | `--color-primary` | Couleur principale (boutons, liens, accents) |
| `secondary_color` | `--color-secondary` | Couleur secondaire (gradients des boutons) |
| `bg_site` | `--color-bg-primary` | Fond principal du site |
| `bg_cards` | `--color-bg-secondary` | Fond des cartes, posts, events |
| `text_main` | `--color-text-primary` | Texte principal (titres, headers) |
| `text_light` | `--color-text-secondary` | Texte secondaire (descriptions, labels) |

### Comment ça fonctionne

**Backend → Frontend**
1. Les couleurs sont stockées dans la table `settings` (MySQL)
2. L'API `/api/settings` les renvoie au frontend
3. Le `SettingsContext` les charge au démarrage
4. Les variables CSS sont injectées automatiquement dans `:root`

**Code dans SettingsContext.jsx :**
```javascript
const colorMappings = {
    'main_color': '--color-primary',
    'secondary_color': '--color-secondary',
    'bg_site': '--color-bg-primary',
    'bg_cards': '--color-bg-secondary',
    'text_main': '--color-text-primary',
    'text_light': '--color-text-secondary'
};

// Applique les couleurs au document
function applyStylesFromSettings(settings) {
    Object.keys(colorMappings).forEach(key => {
        const cssVar = colorMappings[key];
        const value = settings[key];
        if (value) {
            document.documentElement.style.setProperty(cssVar, value);
        }
    });
}
```

### Utilisation dans le code

**1. Classe CSS (recommandé pour les boutons)**
```jsx
<button className="btn btn-primary">Mon Bouton</button>
```
→ Définie dans `src/index.css` avec gradient dynamique

**2. Styles inline**
```jsx
<div style={{
    background: 'var(--color-bg-secondary)',
    color: 'var(--color-text-primary)',
    border: '2px solid var(--color-primary)'
}}>
    Contenu
</div>
```

**3. Fichiers CSS**
```css
.my-component {
    background: var(--color-bg-secondary);
    color: var(--color-text-primary);
}

.my-component:hover {
    border-color: var(--color-primary);
}
```

---

## Textes Dynamiques

### Les 7 Textes Configurables

| Clé | Utilisation |
|-----|-------------|
| `home_title` | Titre de la page d'accueil |
| `home_description` | Description de la page d'accueil |
| `forum_title` | Titre de la page forum |
| `forum_description` | Description de la page forum |
| `events_title` | Titre de la page événements |
| `events_description` | Description de la page événements |
| `events_cta` | Texte du bouton "Créer un événement" |

### Utilisation dans les composants

```jsx
import { useSettings } from '../contexts/SettingsContext';

function MaPage() {
    const { settings } = useSettings();
    
    return (
        <div>
            <h1>{settings?.home_title || 'Titre par défaut'}</h1>
            <p>{settings?.home_description || 'Description'}</p>
        </div>
    );
}
```

---

## 🖼️ Logo Dynamique

Le logo est géré via le paramètre `logo_url` et peut être changé depuis l'interface admin.

**Utilisation :**
```jsx
const { settings } = useSettings();
<img src={settings?.logo_url || '/default-logo.png'} alt="Logo" />
```

---

## ⚙️ Interface Admin

### AdminSettings.jsx - 3 Onglets

**1. Onglet Logo 🖼️**
- Upload d'un nouveau logo
- Aperçu en temps réel
- Sauvegarde automatique de l'URL

**2. Onglet Couleurs 🎨**
Divisé en 3 sections claires :

**🎨 Couleurs des boutons**
- `main_color` : Couleur principale
- `secondary_color` : Couleur secondaire (gradients)

**🎭 Arrière-plan et Cards**
- `bg_site` : Fond du site
- `bg_cards` : Fond des cards

**✍️ Textes**
- `text_main` : Texte principal
- `text_light` : Texte atténué

Chaque couleur a un color picker et une description claire.

**3. Onglet Textes 📝**
Personnalisation des textes des 3 pages principales :
- Section Accueil (title, description)
- Section Forum (title, description)
- Section Événements (title, description, CTA)

### Comment modifier les couleurs

1. Connexion admin → Dashboard → Paramètres
2. Onglet "Couleurs"
3. Utiliser les color pickers
4. Cliquer sur "💾 Enregistrer"
5. Les changements s'appliquent instantanément !

---

## Architecture Technique

### Backend (Express + MySQL)

**Table `settings`**
```sql
CREATE TABLE settings (
    setting_key VARCHAR(100) PRIMARY KEY,
    setting_value TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

**Routes API** (`server/routes/settings.js`)
- `GET /api/settings` - Récupère tous les paramètres
- `PUT /api/settings` - Met à jour les paramètres (bulk update)

**Script d'initialisation** (`server/scripts/seed-settings.js`)
```bash
cd server
node scripts/seed-settings.js
```

### Frontend (React + Context API)

**SettingsContext** (`src/contexts/SettingsContext.jsx`)
- Gère l'état global des settings
- Charge les settings au démarrage de l'app
- Injecte les variables CSS automatiquement
- Expose `settings`, `loading`, `updateSettings()`

**Intégration dans App.jsx**
```jsx
<SettingsProvider>
    <App />
</SettingsProvider>
```

---

## Composants Mis à Jour (Liste Complète)

J'ai systématiquement remplacé toutes les couleurs hardcodées par des variables CSS dynamiques :

### Pages Principales
- `src/pages/Home.jsx` - Textes dynamiques (home_title, home_description)
- `src/pages/Forum.jsx` - Bouton "Proposer catégorie", textes
- `src/pages/Events.jsx` - Bouton FAB, textes (events_title, etc.)
- `src/pages/Category.jsx` - Cartes sous-catégories, boutons, titres
- `src/pages/Profile.jsx` - Avatar 120px gradient, badges
- `src/pages/Login.jsx` - Toggle buttons

### Composants
- `src/components/NewPostForm.jsx` - Bouton "Publier maintenant"
- `src/components/SubcategoryModal.jsx` - Bouton submit, div "Catégorie parent"
- `src/components/CategoryRequestModal.jsx` - Bouton submit
- `src/components/ProfileModal.jsx` - Header gradient, boutons

### Styles CSS
- `src/index.css` - Classe `.btn-primary` avec gradient dynamique
- `src/styles/Header.css` - Background, nav-links
- `src/styles/Categories.css` - Cat-cards, titres, liens
- `src/styles/Profile.css` - Nom profil, badges
- `src/styles/UserProfile.css` - Avatar, badges
- `src/styles/Friends.css` - Titre section amis
- ✅ `src/styles/Login.css` - Toggle buttons (.toggle-btn, .toggle-text)
- ✅ `src/styles/Modal.css` - Modal headers
- ✅ `src/styles/ProfileModal.css` - Header gradient
- ✅ `src/styles.css` - FAB button (12px border-radius)

---

## 🎯 Exemples Concrets

### Boutons Primaires
Tous les boutons principaux utilisent maintenant la classe `.btn-primary` :

**CSS** (`src/index.css`)
```css
.btn-primary {
    background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
    color: white;
    border: none;
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
    transition: all 0.3s ease;
}

.btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(99, 102, 241, 0.4);
}
```

**Utilisation**
```jsx
<button className="btn btn-primary">
    Créer un post
</button>
```

### Cartes de Sous-catégories
Les cartes dans `Category.jsx` sont entièrement dynamiques :

```jsx
<div style={{
    background: isSelected 
        ? 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))'
        : 'var(--color-bg-secondary)',
    color: isSelected 
        ? '#ffffff' 
        : 'var(--color-text-secondary)'
}}>
    {subcategory.name}
</div>
```

### Avatars avec Gradients
```jsx
<div style={{
    width: '120px',
    height: '120px',
    background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
    borderRadius: '50%'
}}>
    {initials}
</div>
```

---

## Workflow de Développement

### Ajouter un Nouveau Paramètre

**1. Backend - Ajouter dans seed-settings.js**
```javascript
{ key: 'mon_nouveau_param', value: 'Valeur par défaut' }
```

**2. Si c'est une couleur - Ajouter dans SettingsContext.jsx**
```javascript
const colorMappings = {
    // ... existing mappings
    'mon_nouveau_param': '--ma-nouvelle-couleur'
};
```

**3. Interface Admin - Ajouter dans AdminSettings.jsx**
```jsx
<div className="form-group">
    <label>Mon Nouveau Paramètre</label>
    <input
        type="color"
        value={localSettings.mon_nouveau_param || '#ffffff'}
        onChange={(e) => setLocalSettings({
            ...localSettings,
            mon_nouveau_param: e.target.value
        })}
    />
    <small>Description du paramètre</small>
</div>
```

**4. Utilisation dans le code**
```jsx
// Pour une couleur
<div style={{ background: 'var(--ma-nouvelle-couleur)' }}>...</div>

// Pour un texte
const { settings } = useSettings();
<p>{settings?.mon_nouveau_param}</p>
```

**5. Ré-initialiser la base**
```bash
cd server
node scripts/seed-settings.js
```

---

## 🚀 Initialisation d'un Nouveau Projet

```bash
# 1. Créer la base de données
cd server
node scripts/init-db.js

# 2. Initialiser les paramètres par défaut
node scripts/seed-settings.js

# 3. Démarrer le backend
node index.js

# 4. Démarrer le frontend (nouveau terminal)
cd ..
npm run dev
```

---

## 📊 État du Système

### Statistiques
- **14 paramètres totaux** : 1 logo + 6 couleurs + 7 textes
- **15+ composants** mis à jour avec couleurs dynamiques
- **10+ fichiers CSS** harmonisés
- **6 variables CSS** injectées dynamiquement
- **3 onglets** dans l'interface admin

### Couverture
- ✅ 100% des boutons principaux
- ✅ 100% des titres de pages
- ✅ 100% des cards et backgrounds
- ✅ 100% des avatars et badges
- ✅ 100% des modals et headers

---

## 🎉 Résultats

### Avant
- 60+ paramètres confus
- Couleurs hardcodées partout
- Difficile de savoir ce qui change quoi
- Maintenance complexe

### Après
- 6 couleurs claires et explicites
- Tout est dynamique via CSS variables
- Interface admin intuitive
- Changements instantanés
- Maintenance simplifiée

---

## 📚 Ressources

### Fichiers Clés à Connaître

**Backend**
- `server/routes/settings.js` - API routes
- `server/scripts/seed-settings.js` - Valeurs par défaut

**Frontend**
- `src/contexts/SettingsContext.jsx` - Gestion globale
- `src/pages/admin/AdminSettings.jsx` - Interface admin
- `src/index.css` - Variables CSS et classes de base

**Documentation**
- `DYNAMIC_SETTINGS_GUIDE.md` - Ce fichier
- `CATEGORIES_SYSTEM.md` - Système de catégories

---

## 🔮 Améliorations Futures Possibles

- [ ] Prévisualisation en temps réel avant sauvegarde
- [ ] Thèmes prédéfinis (Clair, Sombre, Coloré)
- [ ] Export/Import de configurations
- [ ] Historique des modifications
- [ ] Mode sombre automatique
- [ ] Gestion multi-langues (i18n)

---

**Date de dernière mise à jour** : 4 février 2026  
**Version** : 2.0 (Système simplifié et harmonisé)
