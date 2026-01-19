# Configuration des règles Firestore

Pour que le système de gestion des catégories fonctionne correctement, vous devez ajouter les règles suivantes à votre fichier `firestore.rules` :

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // ... vos règles existantes ...
    
    // Règles pour les demandes de catégories
    match /categoryRequests/{requestId} {
      // Tous les utilisateurs authentifiés peuvent créer une demande
      allow create: if request.auth != null 
        && request.resource.data.requestedBy == request.auth.uid;
      
      // Tous peuvent lire les demandes
      allow read: if true;
      
      // Seuls les admins peuvent mettre à jour ou supprimer
      allow update, delete: if request.auth != null 
        && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true;
    }
    
    // Règles pour les catégories
    match /categories/{categoryId} {
      // Tous peuvent lire les catégories
      allow read: if true;
      
      // Seuls les admins peuvent créer des catégories
      allow create: if request.auth != null 
        && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true;
      
      // Les utilisateurs authentifiés peuvent ajouter des sous-catégories
      // Les admins peuvent tout modifier
      allow update: if request.auth != null && (
        // Vérifier si c'est juste l'ajout d'une sous-catégorie
        (request.resource.data.diff(resource.data).affectedKeys().hasOnly(['subcategories', 'updatedAt']))
        ||
        // Ou si l'utilisateur est admin
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true
      );
      
      // Seuls les admins peuvent supprimer
      allow delete: if request.auth != null 
        && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true;
    }
    
    // Règles pour les posts (mise à jour pour inclure les sous-catégories)
    match /posts/{postId} {
      // Tous peuvent lire
      allow read: if true;
      
      // Les utilisateurs authentifiés peuvent créer des posts
      allow create: if request.auth != null 
        && request.resource.data.authorId == request.auth.uid;
      
      // L'auteur peut modifier son post
      allow update: if request.auth != null 
        && resource.data.authorId == request.auth.uid;
      
      // L'auteur ou un admin peut supprimer
      allow delete: if request.auth != null && (
        resource.data.authorId == request.auth.uid
        || get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true
      );
    }
  }
}
```

## Collections créées

### categoryRequests
Structure d'un document :
```javascript
{
  name: string,              // Nom de la catégorie
  slug: string,              // Slug URL-friendly
  description: string,       // Description de la catégorie
  requestedBy: string,       // UID de l'utilisateur
  requestedByName: string,   // Nom de l'utilisateur
  status: "pending" | "approved" | "rejected",
  createdAt: timestamp,
  approvedAt: timestamp (optionnel),
  rejectedAt: timestamp (optionnel)
}
```

### categories
Structure d'un document :
```javascript
{
  name: string,              // Nom de la catégorie
  slug: string,              // Slug URL-friendly
  description: string,       // Description
  icon: string (optionnel),  // Emoji ou icône
  subcategories: array,      // Tableau de sous-catégories
  createdAt: timestamp,
  createdBy: string         // UID de l'admin qui a approuvé
}
```

Structure d'une sous-catégorie :
```javascript
{
  name: string,              // Nom de la sous-catégorie
  slug: string,              // Slug URL-friendly
  createdBy: string,         // UID de l'utilisateur
  createdByName: string,     // Nom de l'utilisateur
  createdAt: timestamp
}
```

## Fonctionnalités implémentées

1. **Proposition de catégories** : Tous les utilisateurs authentifiés peuvent proposer de nouvelles catégories via un modal accessible depuis la page Forum.

2. **Validation admin** : Les admins peuvent approuver, rejeter ou supprimer les demandes de catégories via `/admin/categories`.

3. **Création de sous-catégories** : Dans chaque catégorie, les utilisateurs authentifiés peuvent créer librement des sous-catégories sans validation admin.

4. **Filtrage par sous-catégorie** : Sur la page d'une catégorie, les utilisateurs peuvent filtrer les posts par sous-catégorie.

5. **Association aux posts** : Lors de la création d'un post, si la catégorie a des sous-catégories, l'utilisateur peut en sélectionner une.

## Composants créés

- `CategoryRequestModal.jsx` : Modal pour proposer une nouvelle catégorie
- `AdminCategories.jsx` : Page admin pour gérer les demandes de catégories
- `SubcategoryModal.jsx` : Modal pour créer une sous-catégorie

## Modifications apportées

- `Forum.jsx` : Charge et affiche les catégories dynamiques + bouton de proposition
- `Category.jsx` : Affiche et filtre par sous-catégories + bouton de création
- `NewPostForm.jsx` : Support du choix de sous-catégorie
- `AdminLayout.jsx` : Ajout du lien "Catégories" dans le menu admin
- `App.jsx` : Ajout de la route `/admin/categories`
