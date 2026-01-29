const db = require('../db');

async function updateSchema() {
    try {
        console.log('Adding extra columns to users table...');
        await db.query(`
            ALTER TABLE users
            ADD COLUMN license_year VARCHAR(50) DEFAULT NULL,
            ADD COLUMN department VARCHAR(100) DEFAULT NULL;
        `);
        console.log('Success!');
        process.exit(0);
    } catch (err) {
        if (err.code === 'ER_DUP_FIELDNAME') {
            console.log('Columns likely exist.');
        } else {
            console.error('Error updating schema:', err);
        }
        process.exit(1);
    }
}

updateSchema();
