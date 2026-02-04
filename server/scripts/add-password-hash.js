const db = require('../db');

async function addPasswordHashColumn() {
    try {
        console.log('Adding password_hash column to users table...');
        
        await db.query(`
            ALTER TABLE users 
            ADD COLUMN password_hash VARCHAR(255) DEFAULT NULL 
            AFTER department
        `);
        
        console.log('✅ Column password_hash added successfully!');
        process.exit(0);
    } catch (error) {
        if (error.code === 'ER_DUP_FIELDNAME') {
            console.log('✅ Column password_hash already exists!');
            process.exit(0);
        } else {
            console.error('❌ Error adding column:', error.message);
            process.exit(1);
        }
    }
}

addPasswordHashColumn();
