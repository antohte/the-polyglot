const db = require('./db');

async function addLocationColumn() {
    try {
        console.log('Checking/Adding location column to users table...');

        // Check if column exists
        const [columns] = await db.query(`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME = 'location'
        `);

        if (columns.length > 0) {
            console.log('Column "location" already exists.');
        } else {
            await db.query(`
                ALTER TABLE users 
                ADD COLUMN location VARCHAR(255) DEFAULT NULL AFTER bio
            `);
            console.log('Successfully added "location" column.');
        }
        process.exit(0);
    } catch (err) {
        console.error('Error updating schema:', err);
        process.exit(1);
    }
}

addLocationColumn();
