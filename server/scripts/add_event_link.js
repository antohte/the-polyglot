const db = require('../db');

async function updateSchema() {
    try {
        console.log('Adding link column to events table...');
        await db.query(`
            ALTER TABLE events
            ADD COLUMN link VARCHAR(512) DEFAULT NULL;
        `);
        console.log('Success!');
        process.exit(0);
    } catch (err) {
        if (err.code === 'ER_DUP_FIELDNAME') {
            console.log('Column already exists.');
        } else {
            console.error('Error updating schema:', err);
        }
        process.exit(1);
    }
}

updateSchema();
