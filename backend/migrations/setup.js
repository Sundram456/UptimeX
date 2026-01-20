// Setup script - Initialize database
// Usage: node migrations/setup.js

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Parse DATABASE_URL to extract database name
const DATABASE_URL = process.env.DATABASE_URL;
const dbNameMatch = DATABASE_URL?.match(/\/([^/?]+)(\?|$)/);
const DB_NAME = dbNameMatch ? dbNameMatch[1] : 'uptimex';

// Create connection string for postgres db (default)
const postgresConnectionString = DATABASE_URL?.replace(/\/[^/?]+(\?|$)/, '/postgres$1') ||
    `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/postgres`;

const pool = new Pool({
    connectionString: postgresConnectionString,
});

async function setup() {
    const client = await pool.connect();

    try {
        console.log(`Creating database "${DB_NAME}"...`);
        await client.query(`CREATE DATABASE "${DB_NAME}";`);
        console.log(`Database "${DB_NAME}" created successfully`);
    } catch (error) {
        if (error.code === '42P04') {
            console.log(`Database "${DB_NAME}" already exists`);
        } else {
            console.error('Error creating database:', error);
            client.release();
            await pool.end();
            process.exit(1);
        }
    }

    client.release();
    await pool.end();

    // Connect to new database and run schema
    const mainPool = new Pool({
        connectionString: process.env.DATABASE_URL,
    });

    const client2 = await mainPool.connect();

    try {
        const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
        await client2.query(schema);
        console.log('Schema created successfully');
    } catch (error) {
        console.error('Error creating schema:', error);
        client2.release();
        await mainPool.end();
        process.exit(1);
    }

    client2.release();
    await mainPool.end();
    console.log('Database setup completed!');
}

setup().catch(console.error);
