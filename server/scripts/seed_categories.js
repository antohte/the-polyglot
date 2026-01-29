const db = require('../db');

const CATEGORIES = [
    { name: "Stages / Formation / Masterclasses", slug: "stages-formation", description: "Tout ce qui concerne la formation professionnelle et académique." },
    { name: "Journalisme", slug: "journalisme", description: "Articles, enquêtes et actualités journalistiques." },
    { name: "Actualités : Licence / Fac / Catho", slug: "actualites", description: "La vie à la fac et les événements de la Catho." },
    { name: "Production / Langues : langue", slug: "production-langues", description: "Créations multilingues et discussions linguistiques." },
    { name: "Humanitaire / Bénévolat", slug: "humanitaire", description: "Les actions solidaires et opportunités de bénévolat." },
];

async function seed() {
    console.log("Seeding categories...");
    try {
        const pool = await db.getConnection(); // Handle transaction if we want, or just query

        for (const cat of CATEGORIES) {
            const [existing] = await pool.query('SELECT id FROM categories WHERE slug = ?', [cat.slug]);
            if (existing.length === 0) {
                console.log(`Inserting: ${cat.name}`);
                await pool.query('INSERT INTO categories (slug, name, description) VALUES (?, ?, ?)',
                    [cat.slug, cat.name, cat.description]);
            } else {
                console.log(`Skipping: ${cat.name} (already exists)`);
            }
        }
        pool.release();
        console.log("Done!");
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

seed();
