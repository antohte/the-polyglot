const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '../.env') });

async function initDb() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        multipleStatements: true
    });

    try {
        console.log('Connected to MySQL server...');

        // Create Database
        await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME || 'the_polyglot'}`);
        console.log(`Database ${process.env.DB_NAME || 'the_polyglot'} created or exists.`);

        // Use Database
        await connection.query(`USE ${process.env.DB_NAME || 'the_polyglot'}`);

        // Read Schema
        const schemaPath = path.join(__dirname, '../../database/schema.sql');
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');

        // Execute Schema
        console.log('Executing schema.sql...');
        await connection.query(schemaSql);
        console.log('Schema executed successfully.');

    } catch (err) {
        console.error('Error initializing database:', err);
    } finally {
        await connection.end();
    }
}

initDb();
