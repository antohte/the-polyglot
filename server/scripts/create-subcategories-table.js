const db = require('../db');

async function createSubcategoriesTable() {
    try {
        console.log('Creating subcategories table...');
        
        // Créer la table subcategories
        await db.query(`
            CREATE TABLE IF NOT EXISTS subcategories (
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
            )
        `);
        
        console.log('✓ Table subcategories created successfully');
        
        // Mettre à jour la table posts pour utiliser subcategory_id au lieu de subcategory string
        console.log('Adding subcategory_id column to posts table...');
        
        try {
            await db.query(`
                ALTER TABLE posts
                ADD COLUMN subcategory_id INT DEFAULT NULL,
                ADD FOREIGN KEY (subcategory_id) REFERENCES subcategories(id) ON DELETE SET NULL
            `);
            console.log('✓ Posts table updated successfully');
        } catch (alterErr) {
            if (alterErr.code === 'ER_DUP_FIELDNAME') {
                console.log('✓ Column subcategory_id already exists in posts');
            } else {
                throw alterErr;
            }
        }
        
        process.exit(0);
    } catch (err) {
        if (err.code === 'ER_TABLE_EXISTS_ERROR') {
            console.log('Table subcategories already exists.');
        } else if (err.code === 'ER_DUP_FIELDNAME') {
            console.log('Column subcategory_id already exists in posts.');
        } else {
            console.error('Error creating subcategories table:', err);
        }
        process.exit(1);
    }
}

createSubcategoriesTable();
