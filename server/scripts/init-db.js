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

        // Drop and recreate tables to ensure schema is up to date
        console.log('Dropping existing tables...');
        await connection.query('SET FOREIGN_KEY_CHECKS = 0');
        
        const [tables] = await connection.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = '${process.env.DB_NAME || 'the_polyglot'}'
        `);
        
        for (const { table_name } of tables) {
            await connection.query(`DROP TABLE IF EXISTS ${table_name}`);
            console.log(`  ✓ Dropped table: ${table_name}`);
        }
        
        await connection.query('SET FOREIGN_KEY_CHECKS = 1');

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
