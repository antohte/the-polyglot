const db = require('../db');

async function updateSchema() {
    try {
        console.log('Adding subcategory column to posts table...');
        await db.query(`
            ALTER TABLE posts
            ADD COLUMN subcategory VARCHAR(100) DEFAULT NULL;
        `);
        console.log('Success!');
        process.exit(0);
    } catch (err) {
        if (err.code === 'ER_DUP_FIELDNAME') {
            console.log('Column already exists.');
            process.exit(0);
        }
        console.error('Error updating schema:', err);
        process.exit(1);
    }
}

updateSchema();
