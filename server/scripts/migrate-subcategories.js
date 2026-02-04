const db = require('../db');

async function migrateSubcategories() {
    try {
        console.log('Starting subcategories migration...');
        
        // 0. Trouver un utilisateur admin pour attribuer la création
        const [admins] = await db.query(`
            SELECT id FROM users WHERE role = 'admin' LIMIT 1
        `);
        
        if (admins.length === 0) {
            console.error('✗ No admin user found. Please create an admin user first.');
            process.exit(1);
            return;
        }
        
        const adminId = admins[0].id;
        console.log(`Using admin ID: ${adminId} for migration\n`);
        
        // 1. Obtenir toutes les catégories avec parent_id
        const [subcats] = await db.query(`
            SELECT * FROM categories WHERE parent_id IS NOT NULL
        `);
        
        if (subcats.length === 0) {
            console.log('✓ No subcategories to migrate');
            process.exit(0);
            return;
        }
        
        console.log(`Found ${subcats.length} subcategories to migrate`);
        
        // 2. Insérer chaque sous-catégorie dans la nouvelle table
        for (const subcat of subcats) {
            try {
                await db.query(`
                    INSERT INTO subcategories (category_id, name, slug, description, created_by, created_at, updated_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                `, [
                    subcat.parent_id,
                    subcat.name,
                    subcat.slug,
                    subcat.description || '',
                    adminId,
                    subcat.created_at,
                    subcat.updated_at
                ]);
                
                console.log(`  ✓ Migrated: ${subcat.name} (ID: ${subcat.id})`);
            } catch (err) {
                if (err.code === 'ER_DUP_ENTRY') {
                    console.log(`  ⚠ Skipped duplicate: ${subcat.name}`);
                } else {
                    console.error(`  ✗ Error migrating ${subcat.name}:`, err.message);
                }
            }
        }
        
        // 3. Supprimer les sous-catégories de la table categories (optionnel)
        console.log('\n⚠ Migration complete. You may want to delete old subcategories from categories table:');
        console.log('   DELETE FROM categories WHERE parent_id IS NOT NULL;');
        
        process.exit(0);
    } catch (err) {
        console.error('Error during migration:', err);
        process.exit(1);
    }
}

migrateSubcategories();
