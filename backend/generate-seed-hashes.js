const bcrypt = require('bcrypt');

async function generateHashes() {
    const adminHash = await bcrypt.hash('admin123', 10);
    const userHash = await bcrypt.hash('user123', 10);

    console.log('\n=== SEED USER CREDENTIALS ===\n');
    console.log('Admin Account:');
    console.log('  Email: admin@globetrotter.com');
    console.log('  Password: admin123');
    console.log('  Hash:', adminHash);
    console.log('\nRegular User Account:');
    console.log('  Email: user@globetrotter.com');
    console.log('  Password: user123');
    console.log('  Hash:', userHash);
    console.log('\n=== SQL INSERT STATEMENTS ===\n');
    console.log(`INSERT INTO users (email, password_hash, name, role) VALUES`);
    console.log(`('admin@globetrotter.com', '${adminHash}', 'Admin User', 'admin');`);
    console.log(`\nINSERT INTO users (email, password_hash, name, role) VALUES`);
    console.log(`('user@globetrotter.com', '${userHash}', 'Test User', 'user');`);
    console.log('\n=============================\n');
}

generateHashes().catch(console.error);
