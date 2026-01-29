const db = require('../db');

async function updateSchema() {
    try {
        console.log('Adding extra columns to posts table...');
        await db.query(`
            ALTER TABLE posts
            ADD COLUMN files JSON DEFAULT NULL,
            ADD COLUMN language VARCHAR(10) DEFAULT 'fr',
            ADD COLUMN post_type VARCHAR(50) DEFAULT 'article';
        `);
        console.log('Success!');
        process.exit(0);
    } catch (err) {
        if (err.code === 'ER_DUP_FIELDNAME') {
            console.log('Columns likely exist or partial failure.');
            // simplified handling
        } else {
            console.error('Error updating schema:', err);
        }
        process.exit(1);
    }
}

updateSchema();
