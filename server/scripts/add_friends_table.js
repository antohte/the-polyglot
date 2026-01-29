const db = require('../db');

async function updateSchema() {
    try {
        console.log('Creating friends table...');
        await db.query(`
            CREATE TABLE IF NOT EXISTS friends (
                id INT AUTO_INCREMENT PRIMARY KEY,
                requester_id VARCHAR(128) NOT NULL,
                addressee_id VARCHAR(128) NOT NULL,
                status ENUM('pending', 'accepted', 'rejected') DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (requester_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (addressee_id) REFERENCES users(id) ON DELETE CASCADE,
                UNIQUE KEY unique_friendship (requester_id, addressee_id)
            );
        `);
        console.log('Success!');
        process.exit(0);
    } catch (err) {
        console.error('Error updating schema:', err);
        process.exit(1);
    }
}

updateSchema();
