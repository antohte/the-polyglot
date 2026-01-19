// src/constants/categories.js

export const CATEGORIES = [
    { name: "Stages / Formation / Masterclasses", slug: "stages-formation" },
    { name: "Journalisme", slug: "journalisme" },
    { name: "Actualités : Licence / Fac / Catho", slug: "actualites" },
    { name: "Production / Langues : langue", slug: "production-langues" },
    { name: "Humanitaire / Bénévolat", slug: "humanitaire" },
];

// Helper object to quickly find category name by slug
export const bySlug = CATEGORIES.reduce((acc, cat) => {
    acc[cat.slug] = cat.name;
    return acc;
}, {});

// Legacy category name mappings to support old posts
// Maps old category names to new standardized names
export const legacyCategoryMapping = {
    "Journalisme": "Journalisme",
    "Formation": "Stages / Formation / Masterclasses",
    "Stages": "Stages / Formation / Masterclasses",
    "Masterclasses": "Stages / Formation / Masterclasses",
    "Actualités": "Actualités : Licence / Fac / Catho",
    "Licence": "Actualités : Licence / Fac / Catho",
    "Production": "Production / Langues : langue",
    "Langues": "Production / Langues : langue",
    "Humanitaire": "Humanitaire / Bénévolat",
    "Bénévolat": "Humanitaire / Bénévolat",
};
