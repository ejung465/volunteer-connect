// Quick test script to check database
import dbModule from './database.js';

const { get, all } = dbModule;

console.log('\n=== Database Test ===\n');

// Test 1: Check if users table exists and has data
try {
    const users = all('SELECT id, email, role FROM users');
    console.log(`Found ${users.length} users:`);
    users.forEach(user => {
        console.log(`  - ${user.email} (${user.role})`);
    });
} catch (error) {
    console.error('Error reading users:', error.message);
}

// Test 2: Try to find admin user
try {
    const admin = get('SELECT * FROM users WHERE email = ?', ['admin@example.com']);
    if (admin) {
        console.log('\n✅ Admin user found!');
        console.log(`   ID: ${admin.id}, Email: ${admin.email}, Role: ${admin.role}`);
    } else {
        console.log('\n❌ Admin user NOT found!');
    }
} catch (error) {
    console.error('Error finding admin:', error.message);
}

console.log('\n=== Test Complete ===\n');

