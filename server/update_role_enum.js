const db = require('./db');

async function updateRoleEnum() {
    try {
        console.log('Updating users table role ENUM...');
        await db.query(`
            ALTER TABLE users 
            MODIFY COLUMN role ENUM('user', 'organizer', 'admin', 'moderator') DEFAULT 'user'
        `);
        console.log('Successfully added "moderator" to role ENUM.');
        process.exit(0);
    } catch (err) {
        console.error('Error updating schema:', err);
        process.exit(1);
    }
}

updateRoleEnum();
