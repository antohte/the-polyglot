const db = require('./db');

async function addInterestsColumn() {
    try {
        console.log('Checking/Adding interests column to users table...');

        // Check if column exists
        const [columns] = await db.query(`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME = 'interests'
        `);

        if (columns.length > 0) {
            console.log('Column "interests" already exists.');
        } else {
            await db.query(`
                ALTER TABLE users 
                ADD COLUMN interests TEXT DEFAULT NULL AFTER location
            `);
            console.log('Successfully added "interests" column.');
        }
        process.exit(0);
    } catch (err) {
        console.error('Error updating schema:', err);
        process.exit(1);
    }
}

addInterestsColumn();
