const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

async function debugDb() {
    console.log('--- Debugging Database ---');
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'the_polyglot'
    });

    try {
        console.log('1. Describing `users` table:');
        const [columns] = await connection.query('DESCRIBE users');
        console.log(columns.map(c => `${c.Field} (${c.Type}) Null:${c.Null} Key:${c.Key}`).join('\n'));

        console.log('\n2. Listing last 5 users:');
        const [users] = await connection.query('SELECT id, email, full_name, created_at FROM users ORDER BY created_at DESC LIMIT 5');
        console.table(users);

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await connection.end();
    }
}

debugDb();
