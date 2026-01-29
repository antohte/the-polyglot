const db = require('../db');

async function updateSchema() {
    try {
        console.log('Adding password_hash column to users table...');

        // Add password_hash
        await db.query(`
            ALTER TABLE users
            ADD COLUMN password_hash VARCHAR(255) DEFAULT NULL;
        `).catch(err => {
            if (err.code === 'ER_DUP_FIELDNAME') {
                console.log('Column password_hash already exists.');
            } else {
                throw err;
            }
        });

        console.log('Schema updated successfully.');
        process.exit(0);
    } catch (err) {
        console.error('Schema update failed:', err);
        process.exit(1);
    }
}

updateSchema();
