const fs = require('fs');
const { pool } = require('./src/config/db');
const path = require('path');

const runSeed = async () => {
    try {
        const schemaPath = path.join(__dirname, 'schema.sql');
        const seedPath = path.join(__dirname, 'seed.sql');

        const schema = fs.readFileSync(schemaPath, 'utf8');
        const seed = fs.readFileSync(seedPath, 'utf8');

        // console.log('Running Schema...');
        // await pool.query(schema);

        console.log('Running Seed...');
        await pool.query(seed);

        console.log('Database seeded successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
};

runSeed();
