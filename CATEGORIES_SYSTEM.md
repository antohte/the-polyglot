# Système de Catégories et Sous-catégories - Documentation

## Vue d'ensemble

J'ai mis en place un système complet de gestion des catégories et sous-catégories pour mon forum. L'objectif était de **séparer clairement** les catégories des sous-catégories et de rendre le tout **entièrement dynamique** avec les couleurs personnalisables.

### Objectifs atteints
- Tables séparées : `categories` et `subcategories` distinctes
- Système de demande de catégories avec validation admin
- Sous-catégories créées instantanément dans les catégories
- Design uniforme entre catégories statiques et dynamiques
- Couleurs entièrement dynamiques partout

---

## Architecture Base de Données

### Table `categories`

Stocke les catégories principales du forum.

```sql
CREATE TABLE categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    slug VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    parent_id INT DEFAULT NULL,  -- Obsolète, on utilise subcategories maintenant
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Caractéristiques :**
- Catégories **statiques** définies dans le code
- Catégories **dynamiques** créées par les users et approuvées par admin
- Identifiées par leur `slug` unique

### Table `subcategories` ✨ NOUVEAU

Table dédiée pour les sous-catégories, complètement séparée.

```sql
CREATE TABLE subcategories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) NOT NULL,
    description TEXT,
    created_by VARCHAR(128) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_subcategory (category_id, slug)
);
```

**Avantages de la séparation :**
- Relation claire parent → enfant
- Pas de confusion avec les catégories
- Gestion facilitée (CRUD distinct)
- Migration plus simple

### Table `category_requests`

Gère les demandes de nouvelles catégories par les utilisateurs.

```sql
CREATE TABLE category_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    requested_by VARCHAR(128) NOT NULL,
    category_name VARCHAR(255) NOT NULL,
    reason TEXT,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (requested_by) REFERENCES users(id) ON DELETE CASCADE
);
```

---

## API Routes

### Routes Categories (`/api/categories`)

**GET `/api/categories`**
- Liste toutes les catégories
- Utilisé par Forum.jsx pour afficher les catégories

**POST `/api/categories`**
- Créer une nouvelle catégorie (admin uniquement normalement)
- Body : `{ slug, name, description }`

**POST `/api/categories/requests`**
- Un user demande une nouvelle catégorie
- Body : `{ requested_by, category_name, reason }`
- Status : `pending` par défaut

**GET `/api/categories/requests`**
- Liste les demandes en attente (admin)
- Join avec `users` pour avoir le nom du demandeur

**POST `/api/categories/requests/:id/approve`**
- Admin approuve une demande
- Crée la catégorie dans la table `categories`
- Change le status à `approved`

**POST `/api/categories/requests/:id/reject`**
- Admin rejette une demande
- Change le status à `rejected`

**DELETE `/api/categories/:id`**
- Supprime une catégorie (admin)
- Cascade : supprime aussi ses sous-catégories

### Routes Subcategories (`/api/subcategories`) (NOUVEAU)

**GET `/api/subcategories/category/:categoryId`**
- Liste les sous-catégories d'une catégorie
- Join avec `users` pour avoir le nom du créateur
- Utilisé par Category.jsx

**POST `/api/subcategories`**
- Créer une sous-catégorie
- Body : `{ category_id, name, description, created_by }`
- Génère automatiquement le slug
- Création **instantanée** (pas de validation admin)

**PUT `/api/subcategories/:id`**
- Modifier une sous-catégorie
- Body : `{ name, description }`
- Régénère le slug si le nom change

**DELETE `/api/subcategories/:id`**
- Supprime une sous-catégorie

---

## Composants Frontend

### Forum.jsx - Page Forum

**Rôle :** Affiche toutes les catégories du forum.

**Fonctionnement :**
```jsx
// 1. Charge les catégories dynamiques depuis l'API
const [dynamicCategories, setDynamicCategories] = useState([]);
useEffect(() => {
    api.categories.getAll().then(cats => {
        setDynamicCategories(cats);
    });
}, []);

// 2. Combine avec les catégories statiques (sans doublons)
const staticSlugs = CATEGORIES.map(c => c.slug);
const uniqueDynamicCategories = dynamicCategories.filter(
    c => !staticSlugs.includes(c.slug)
);

const allCategories = [
    ...CATEGORIES.map(c => ({ ...c, type: 'static' })),
    ...uniqueDynamicCategories.map(c => ({ ...c, type: 'dynamic' }))
];

// 3. Affiche toutes les catégories avec le MÊME design
{allCategories.map(c => (
    <Link to={`/forum/${c.slug}`} className="cat-card">
        <div className="cat-title">{c.name}</div>
        {c.description && <p>{c.description}</p>}
        <div className="cat-cta">Voir les posts →</div>
    </Link>
))}
```

**Couleurs dynamiques :**
- Background : `var(--color-bg-secondary)`
- Border : `var(--color-primary)` au hover
- Titre : `var(--color-text-primary)`
- CTA : `var(--color-text-secondary)`

**Bouton "Proposer une nouvelle catégorie" :**
```jsx
<button style={{
    background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
    color: 'white',
    // ...
}}>
    Proposer une nouvelle catégorie
</button>
```

### Category.jsx - Page d'une Catégorie

**Rôle :** Affiche une catégorie avec ses sous-catégories et posts.

**Chargement des données :**
```jsx
useEffect(() => {
    async function loadCategory() {
        // 1. Récupère toutes les catégories
        const allCats = await api.categories.getAll();
        const foundCat = allCats.find(c => c.slug === slug);
        
        // 2. Charge les sous-catégories depuis la table dédiée
        const subcategories = await api.subcategories.getByCategory(foundCat.id);
        
        // 3. Construit l'objet catégorie
        setCategory({
            ...foundCat,
            subcategories: subcategories.map(sub => ({
                id: sub.id,
                name: sub.name,
                slug: sub.slug,
                createdByName: sub.creator_name
            }))
        });
    }
    loadCategory();
}, [slug]);
```

**Affichage des Sous-catégories :**

Grid de cartes cliquables avec design dynamique :

```jsx
{subcategories.map(sub => {
    const isSelected = selectedSubcategory === sub.name;
    
    return (
        <div
            onClick={() => setSelectedSubcategory(sub.name)}
            style={{
                background: isSelected
                    ? 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))'
                    : 'var(--color-bg-secondary)',
                color: isSelected 
                    ? '#ffffff' 
                    : 'var(--color-text-secondary)',
                border: '2px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '16px',
                padding: '1.5rem',
                cursor: 'pointer',
                transition: 'all 0.3s'
            }}
        >
            <div style={{ fontSize: '2.5rem' }}></div>
            <div style={{ fontWeight: '700' }}>{sub.name}</div>
            <div style={{ fontSize: '0.75rem' }}>
                {sub.createdByName?.split(' ')[0]}
            </div>
        </div>
    );
})}
```

**Caractéristiques :**
- Sélection d'une sous-catégorie → filtre les posts
- Card sélectionnée : gradient avec couleurs principales
- Card non sélectionnée : fond secondaire
- Hover : transformation et shadow
- Badge de comptage : nombre de posts par sous-cat

**Bouton "Nouvelle sous-catégorie" :**
```jsx
<button 
    onClick={() => setShowSubcategoryModal(true)}
    className="btn btn-primary"
>
    Nouvelle sous-catégorie
</button>
```

### SubcategoryModal.jsx - Modal de Création

**Rôle :** Créer une sous-catégorie dans la catégorie actuelle.

**Fonctionnement :**
```jsx
const handleSubmit = async (e) => {
    e.preventDefault();
    
    await api.subcategories.create({
        category_id: categoryId,  // ID de la catégorie parente
        name: subcategoryName.trim(),
        description: '',
        created_by: user.uid
    });
    
    addToast('Sous-catégorie créée avec succès', 'success');
    onSuccess();  // Recharge les sous-catégories
    onClose();
};
```

**Design :**
- Header : gradient avec `var(--color-primary)` et `var(--color-secondary)`
- Div "Catégorie parent" : fond `var(--color-bg-secondary)`, texte `var(--color-text-secondary)`
- Bouton submit : classe `.btn-primary`

**Note importante :** Les sous-catégories sont créées **instantanément** sans validation admin.

### CategoryRequestModal.jsx - Demande de Catégorie

**Rôle :** Un user demande la création d'une nouvelle catégorie.

**Fonctionnement :**
```jsx
const handleSubmit = async (e) => {
    e.preventDefault();
    
    await api.categories.request({
        requested_by: user.uid,
        category_name: categoryName,
        reason: reason
    });
    
    addToast('Demande envoyée ! Un admin va la traiter.', 'success');
    onClose();
};
```

**Workflow :**
1. User remplit le formulaire (nom + raison)
2. Demande créée avec status `pending`
3. Admin voit la demande dans AdminCategories.jsx
4. Admin approuve → catégorie créée
5. Admin rejette → demande archivée

### AdminCategories.jsx - Gestion Admin

**Rôle :** Interface admin pour approuver/rejeter les demandes.

**Fonctionnement :**
```jsx
// Charge les demandes en attente
const [requests, setRequests] = useState([]);
useEffect(() => {
    api.categories.getRequests().then(setRequests);
}, []);

// Approuver
const handleApprove = async (id) => {
    await api.categories.approveRequest(id);
    // Recharge la liste
    api.categories.getRequests().then(setRequests);
};

// Rejeter
const handleReject = async (id) => {
    await api.categories.rejectRequest(id);
    api.categories.getRequests().then(setRequests);
};
```

**Interface :**
- Tableau des demandes avec : nom, raison, demandeur, date
- Bouton "Approuver" (vert)
- Bouton "Rejeter" (rouge)

---

## Couleurs Dynamiques

### Classe `.cat-card` (Catégories)

**Fichier :** `src/styles/Categories.css`

```css
.cat-card {
    display: block;
    padding: 24px;
    background: var(--color-bg-secondary);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 16px;
    transition: all 0.3s;
}

.cat-card::before {
    content: '';
    background: var(--color-primary);
    /* Animation au hover */
}

.cat-card:hover {
    border-color: var(--color-primary);
    transform: translateY(-4px);
}

.cat-title {
    color: var(--color-text-primary);
}

.cat-cta {
    color: var(--color-text-secondary);
}
```

### Cartes de Sous-catégories

**Style inline dans Category.jsx :**

```jsx
// État normal
background: 'var(--color-bg-secondary)'
color: 'var(--color-text-secondary)'

// État sélectionné
background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))'
color: '#ffffff'
```

**Effets dynamiques :**
- Hover : `transform: translateY(-4px)`
- Shadow : `0 8px 24px rgba(0, 0, 0, 0.3)`
- Badge comptage : `background: rgba(255, 255, 255, 0.25)`

---

## Scripts de Maintenance

### Créer la Table Subcategories

```bash
cd server
node scripts/create-subcategories-table.js
```

**Ce que fait ce script :**
1. Crée la table `subcategories`
2. Ajoute la colonne `subcategory_id` dans `posts` (si pas déjà présente)
3. Configure les foreign keys

### Migrer les Anciennes Sous-catégories

```bash
cd server
node scripts/migrate-subcategories.js
```

**Ce que fait ce script :**
1. Trouve toutes les catégories avec `parent_id` (ancien système)
2. Les insère dans la table `subcategories`
3. Utilise le premier admin comme `created_by`
4. Suggère de supprimer les anciennes entrées

**Commande SQL suggérée après migration :**
```sql
DELETE FROM categories WHERE parent_id IS NOT NULL;
```

---

## Flux de Données

### Création d'une Catégorie par un User

```
User clique "Proposer catégorie"
    ↓
CategoryRequestModal s'ouvre
    ↓
User remplit (nom + raison)
    ↓
POST /api/categories/requests
    ↓
Insertion dans `category_requests` (status: pending)
    ↓
Admin voit la demande dans AdminCategories
    ↓
Admin clique "Approuver"
    ↓
POST /api/categories/requests/:id/approve
    ↓
Insertion dans `categories` + update status
    ↓
Catégorie apparaît sur la page Forum
```

### Création d'une Sous-catégorie

```
User sur page Category (ex: /forum/test)
    ↓
Clique "Nouvelle sous-catégorie"
    ↓
SubcategoryModal s'ouvre
    ↓
User entre le nom
    ↓
POST /api/subcategories
    ↓
Insertion directe dans `subcategories` (INSTANTANÉ)
    ↓
Recharge GET /api/subcategories/category/:id
    ↓
Sous-catégorie apparaît dans la liste
```

### Affichage des Catégories

```
User visite /forum
    ↓
Forum.jsx monte
    ↓
GET /api/categories
    ↓
Combine statiques (CATEGORIES.js) + dynamiques (BDD)
    ↓
Filtre les doublons par slug
    ↓
Affiche avec design uniforme
    ↓
Toutes les catégories ont le MÊME aspect
```

---

## Différences Statique vs Dynamique

### Catégories Statiques

**Définies dans :** `src/constants/categories.js`

```javascript
export const CATEGORIES = [
    {
        name: "Stages / Formation / Masterclasses",
        slug: "stages-formation",
        description: "Opportunités de stages et formations",
        subcategories: [...]
    },
    // ...
];
```

**Caractéristiques :**
- Définies dans le code
- Toujours présentes
- Peut avoir des sous-catégories hardcodées
- Utilisées comme base

### Catégories Dynamiques

**Stockées dans :** Table `categories` (MySQL)

**Caractéristiques :**
- Créées via demandes users
- Approuvées par admin
- Peuvent être supprimées
- Apparaissent avec le même design que les statiques

**Design uniforme :** Aucune différence visuelle entre statiques et dynamiques !

### Sous-catégories

**Toutes dynamiques** depuis la table `subcategories` :
- Créées instantanément par n'importe quel user
- Liées à une catégorie via `category_id`
- Peuvent être modifiées/supprimées
- Design entièrement dynamique avec CSS variables

---

## Cas d'Usage Concrets

### Scénario 1 : Créer une Nouvelle Catégorie

**Qui :** Utilisateur lambda (role: user)

1. Je vais sur la page Forum
3. Je clique sur "Proposer une nouvelle catégorie"
3. Je remplis :
   - Nom : "Échanges Internationaux"
   - Raison : "Pour partager les expériences Erasmus"
4. Je soumets
5. Toast : "Demande envoyée !"
6. J'attends la validation admin

**Qui :** Admin

1. Je vais dans Dashboard → Catégories
2. Je vois la demande de l'utilisateur
3. Je lis la raison
4. Je clique "✅ Approuver"
5. La catégorie est créée avec slug "echanges-internationaux"
6. Elle apparaît sur le Forum pour tous !

### Scénario 2 : Créer une Sous-catégorie

**Qui :** Utilisateur lambda

1. Je vais sur /forum/echanges-internationaux
2. Je clique "Nouvelle sous-catégorie"
3. Je tape "Erasmus Espagne"
4. Je valide
5. **INSTANTANÉ** : la sous-catégorie apparaît dans la liste
6. Je peux créer un post dedans immédiatement !

### Scénario 3 : Naviguer entre Sous-catégories

**Qui :** Utilisateur visiteur

1. Je suis sur /forum/echanges-internationaux
2. Je vois plusieurs sous-catégories : "Erasmus Espagne", "Erasmus Italie", etc.
3. Je clique sur "Erasmus Espagne"
4. La card devient **gradient coloré** (sélectionnée)
5. Les posts sont filtrés pour cette sous-cat uniquement
6. Je clique sur une autre → la sélection change

---

## Checklist de Test

### Catégories

- [ ] Affichage des catégories statiques sur /forum
- [ ] Affichage des catégories dynamiques sur /forum
- [ ] Design uniforme (pas de différence visuelle)
- [ ] Bouton "Proposer catégorie" visible et fonctionnel
- [ ] Modal de demande fonctionne
- [ ] Demande apparaît dans AdminCategories (admin)
- [ ] Approbation crée la catégorie
- [ ] Catégorie approuvée apparaît sur /forum
- [ ] Couleurs dynamiques (border hover = primary)

### Sous-catégories

- [ ] Affichage des sous-catégories sur /forum/:slug
- [ ] Bouton "Nouvelle sous-catégorie" visible
- [ ] Modal de création fonctionne
- [ ] Sous-catégorie créée instantanément
- [ ] Design avec gradient quand sélectionnée
- [ ] Background secondaire quand non sélectionnée
- [ ] Nom créateur affiché
- [ ] Badge comptage posts fonctionnel
- [ ] Clic sur sous-cat filtre les posts

### Admin

- [ ] AdminCategories accessible (role: admin uniquement)
- [ ] Liste des demandes affichée
- [ ] Bouton approuver fonctionne
- [ ] Bouton rejeter fonctionne
- [ ] Liste se met à jour après action

### Couleurs Dynamiques

- [ ] Cat-cards utilisent var(--color-bg-secondary)
- [ ] Hover utilise var(--color-primary)
- [ ] Titres utilisent var(--color-text-primary)
- [ ] CTA utilise var(--color-text-secondary)
- [ ] Sous-cat gradient utilise primary + secondary
- [ ] Changement dans AdminSettings appliqué immédiatement

---

## Performance et Optimisation

### Chargements Optimisés

**Forum.jsx :**
- Un seul appel `GET /api/categories` au mount
- Combine avec statiques côté client (pas de requête supplémentaire)
- Pas de re-fetch inutile

**Category.jsx :**
- `GET /api/categories` pour trouver la catégorie
- `GET /api/subcategories/category/:id` pour les sous-cats
- `GET /api/posts?category=slug` pour les posts
- Total : 3 requêtes au chargement de la page

### Mémoire et État

**React Query serait un plus** (non implémenté) :
- Cache des catégories
- Invalidation automatique après création
- Moins de re-fetch

**État local :**
- `useState` pour les listes (simple et efficace)
- `useEffect` avec dépendances précises
- Pas de boucles infinies

---

## Fichiers Importants

### Backend
- `server/routes/categories.js` - Routes catégories
- `server/routes/subcategories.js` - Routes sous-catégories ✨
- `server/scripts/create-subcategories-table.js` - Setup table
- `server/scripts/migrate-subcategories.js` - Migration

### Frontend - Pages
- `src/pages/Forum.jsx` - Liste des catégories
- `src/pages/Category.jsx` - Page catégorie + sous-cats
- `src/pages/admin/AdminCategories.jsx` - Gestion admin

### Frontend - Composants
- `src/components/CategoryRequestModal.jsx` - Demander catégorie
- `src/components/SubcategoryModal.jsx` - Créer sous-cat

### Frontend - Styles
- `src/styles/Categories.css` - Styles des cat-cards

### Frontend - Constants
- `src/constants/categories.js` - Catégories statiques

### API Client
- `src/api/client.js` - Méthodes `api.categories.*` et `api.subcategories.*`

---

## Améliorations Futures

### Court Terme
- [ ] Modifier une sous-catégorie existante
- [ ] Supprimer une sous-catégorie (avec confirmation)
- [ ] Réorganiser l'ordre des sous-cats (drag & drop)
- [ ] Icônes personnalisées par catégorie

### Moyen Terme
- [ ] Permissions : qui peut créer des sous-cats
- [ ] Modération : signaler une catégorie inappropriée
- [ ] Statistiques : posts par catégorie/sous-cat
- [ ] Recherche : filtrer les catégories

### Long Terme
- [ ] Catégories imbriquées (niveau 3+)
- [ ] Tags en plus des sous-catégories
- [ ] Abonnement à une catégorie (notifications)
- [ ] Export/Import de la structure

---

## Dépannage

### "No subcategories found"
- Vérifier que la table `subcategories` existe
- Lancer `node scripts/create-subcategories-table.js`
- Vérifier les foreign keys

### "Cannot read property 'id' of undefined"
- La catégorie n'existe pas en BDD
- Vérifier le slug dans l'URL
- Ajouter la catégorie statique dans `CATEGORIES.js`

### "Duplicate entry"
- Le slug existe déjà
- Changer le nom de la sous-catégorie
- Vérifier la contrainte UNIQUE

### Les couleurs ne changent pas
- Vérifier que SettingsContext est bien wrappé dans App
- Ouvrir DevTools → vérifier les CSS variables dans `:root`
- Forcer un refresh (Ctrl+F5)

---

**Date de dernière mise à jour** : 4 février 2026  
**Version** : 2.0 (Table subcategories séparée + Design dynamique)
