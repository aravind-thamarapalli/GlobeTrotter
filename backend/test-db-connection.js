const { Client } = require('pg');
require('dotenv').config();

const testConnection = async () => {
    console.log('Testing connection to:', process.env.DATABASE_URL);

    const client = new Client({
        connectionString: process.env.DATABASE_URL,
    });

    try {
        await client.connect();
        console.log('✅ SUCCESS: Connected to PostgreSQL successfully!');

        // Check if database exists/is correct
        const res = await client.query('SELECT current_database()');
        console.log(`📂 Current Database: ${res.rows[0].current_database}`);

        await client.end();
    } catch (err) {
        console.error('❌ ERROR: Could not connect to database.');
        console.error('----------------------------------------');
        console.error('Code:', err.code);
        console.error('Message:', err.message);
        if (err.code === 'ECONNREFUSED') {
            console.error('Suggestion: Ensure PostgreSQL service is running on your computer at port 5432.');
        } else if (err.code === '28P01') {
            console.error('Suggestion: Check your username and password in backend/.env');
        } else if (err.code === '3D000') {
            console.error('Suggestion: The database "globetrotter" does not exist. Run "CREATE DATABASE globetrotter;" in psql.');
        }
    }
};

testConnection();
