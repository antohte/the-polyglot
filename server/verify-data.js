const db = require('./db');

async function check() {
    try {
        const [rows] = await db.query('SELECT * FROM categories');
        console.log('Categories in DB:', rows);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

check();
