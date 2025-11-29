import dbModule from '../database.js';

const { run } = dbModule;

console.log('🌱 Seeding future sessions...');

const today = new Date();

// Add sessions for the next 4 weeks
for (let i = 1; i <= 4; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + (i * 7));
    const dateStr = date.toISOString().split('T')[0];

    try {
        run(`INSERT INTO sessions (title, session_date, created_by_admin_id) VALUES (?, ?, ?)`,
            ['Weekly Tutoring', dateStr, 1]);
        console.log(`✅ Added session for ${dateStr}`);
    } catch (e) {
        console.error(`❌ Failed to add session for ${dateStr}:`, e.message);
    }
}

console.log('✨ Seeding complete.');
process.exit(0);
