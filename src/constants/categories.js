export const CATEGORIES = [
{ name: 'Stages / Formation / Masterclasses', slug: 'stages-formation-masterclasses' },
{ name: 'Journalisme', slug: 'journalisme' },
{ name: 'Actualités : Licence / Fac / Catho', slug: 'actualites-licence-fac-catho' },
{ name: 'Production / Langues', slug: 'production-langues' },
{ name: 'Humanitaire / Bénévolat', slug: 'humanitaire-benevolat' }
]


export const bySlug = Object.fromEntries(CATEGORIES.map(c => [c.slug, c.name]))