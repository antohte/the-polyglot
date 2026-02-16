const mysql = require('mysql2');
const dotenv = require('dotenv');

const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

// Try to load .env from multiple locations
const envPathCwd = path.join(process.cwd(), '.env');
const envPathDir = path.join(__dirname, '.env');

console.log('Attempting to load .env from:', envPathCwd);
dotenv.config({ path: envPathCwd });

// If DB_HOST is still not set, try __dirname
if (!process.env.DB_HOST) {
    console.log('DB_HOST missing, trying .env from:', envPathDir);
    dotenv.config({ path: envPathDir });
}

if (!process.env.DB_HOST) {
    console.error('CRITICAL ERROR: DB_HOST is not set. Environment variables failed to load.');
    console.error('Current CWD:', process.cwd());
    console.error('__dirname:', __dirname);
}

const pool = mysql.createPool({
    host: process.env.DB_HOST || '127.0.0.1',
    user: process.env.DB_USER || 'u548879916_polyglot',
    password: process.env.DB_PASSWORD || 'ThePolyglot59',
    database: process.env.DB_NAME || 'u548879916_thepolyglot',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

pool.getConnection((err, connection) => {
    if (err) {
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
            console.error('Database connection was closed.');
        }
        if (err.code === 'ER_CON_COUNT_ERROR') {
            console.error('Database has too many connections.');
        }
        if (err.code === 'ECONNREFUSED') {
            console.error('Database connection was refused.');
        }
        console.error('Error connecting to DB:', err);
    }
    if (connection) connection.release();
    return;
});

module.exports = pool.promise();
