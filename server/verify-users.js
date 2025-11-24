// Quick script to verify demo accounts exist
import dbModule from './database.js';
import bcrypt from 'bcryptjs';

const { get, all } = dbModule;

console.log('\n=== Verifying Demo Accounts ===\n');

// Get all users
const users = all('SELECT id, email, role, password_hash FROM users');

console.log(`Total users in database: ${users.length}\n`);

if (users.length === 0) {
    console.log('❌ NO USERS FOUND IN DATABASE!');
    console.log('   The database needs to be seeded.');
    console.log('   Delete database.sqlite and restart the server.\n');
    process.exit(1);
}

// Check each demo account
const demoAccounts = [
    { email: 'admin@example.com', password: 'admin123', role: 'admin' },
    { email: 'volunteer@example.com', password: 'volunteer123', role: 'volunteer' },
    { email: 'student@example.com', password: 'student123', role: 'student' }
];

console.log('Checking demo accounts:\n');

demoAccounts.forEach(account => {
    const user = users.find(u => u.email === account.email);
    
    if (user) {
        console.log(`✅ ${account.email} (${account.role})`);
        console.log(`   User ID: ${user.id}`);
        
        // Test password
        if (user.password_hash) {
            const isValid = bcrypt.compareSync(account.password, user.password_hash);
            if (isValid) {
                console.log(`   ✅ Password hash is valid`);
            } else {
                console.log(`   ❌ Password hash does NOT match!`);
                console.log(`   This account will NOT work for login.`);
            }
        } else {
            console.log(`   ❌ No password hash found!`);
        }
    } else {
        console.log(`❌ ${account.email} - NOT FOUND in database`);
    }
    console.log();
});

console.log('=== All Users in Database ===\n');
users.forEach(user => {
    console.log(`- ${user.email} (${user.role}) - ID: ${user.id}`);
});

console.log('\n=== Verification Complete ===\n');

