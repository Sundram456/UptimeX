// Database configuration and connection pool
const { Pool } = require('pg');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL || 
    `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`;

const pool = new Pool({
    connectionString: connectionString,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
});

// Query wrapper with error handling
async function query(text, params) {
    const client = await pool.connect();
    try {
        const result = await client.query(text, params);
        return result;
    } finally {
        client.release();
    }
}

// Batch query (for transactions)
async function batchQuery(queries) {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const results = [];
        for (const q of queries) {
            const result = await client.query(q.text, q.params);
            results.push(result);
        }
        await client.query('COMMIT');
        return results;
    } catch (e) {
        await client.query('ROLLBACK');
        throw e;
    } finally {
        client.release();
    }
}

module.exports = {
    pool,
    query,
    batchQuery,
};
