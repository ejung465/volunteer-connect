import bcrypt from 'bcryptjs';

export const initializeDatabase = (db) => {
    console.log('📋 Initializing new tenant database...');

    const run = (sql, params = []) => {
        const stmt = db.prepare(sql);
        if (params.length > 0) stmt.bind(params);
        stmt.step();
        stmt.free();
    };

    // Create Tables
    run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('admin', 'volunteer', 'student')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

    run(`
    CREATE TABLE IF NOT EXISTS students (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER UNIQUE NOT NULL,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      photo_url TEXT,
      grade_level INTEGER NOT NULL,
      birthday DATE,
      bio TEXT,
      progress_summary TEXT,
      google_drive_folder_id TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

    run(`
    CREATE TABLE IF NOT EXISTS volunteers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER UNIQUE NOT NULL,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      photo_url TEXT,
      bio TEXT,
      total_hours REAL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

    run(`
    CREATE TABLE IF NOT EXISTS sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_date DATE NOT NULL,
      created_by_admin_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (created_by_admin_id) REFERENCES users(id)
    )
  `);

    run(`
    CREATE TABLE IF NOT EXISTS attendance (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id INTEGER NOT NULL,
      volunteer_id INTEGER NOT NULL,
      student_id INTEGER NOT NULL,
      hours_logged REAL DEFAULT 2.0,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE,
      FOREIGN KEY (volunteer_id) REFERENCES volunteers(id) ON DELETE CASCADE,
      FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
    )
  `);

    run(`
    CREATE TABLE IF NOT EXISTS student_progress (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER NOT NULL,
      subject TEXT NOT NULL CHECK(subject IN ('Math', 'Reading')),
      grade_level INTEGER NOT NULL,
      problems_completed INTEGER DEFAULT 0,
      areas_for_improvement TEXT,
      last_updated_by INTEGER,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
      FOREIGN KEY (last_updated_by) REFERENCES volunteers(id)
    )
  `);

    run(`
    CREATE TABLE IF NOT EXISTS volunteer_availability (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      volunteer_id INTEGER NOT NULL,
      session_id INTEGER NOT NULL,
      is_available BOOLEAN DEFAULT 1,
      FOREIGN KEY (volunteer_id) REFERENCES volunteers(id) ON DELETE CASCADE,
      FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE,
      UNIQUE(volunteer_id, session_id)
    )
  `);

    console.log('✅ Database tables created successfully');
};

export const seedInitialData = (db) => {
    console.log('📦 Seeding initial data...');

    const run = (sql, params = []) => {
        const stmt = db.prepare(sql);
        if (params.length > 0) stmt.bind(params);
        stmt.step();
        stmt.free();
    };

    // Only seed if users table is empty
    const stmt = db.prepare('SELECT COUNT(*) as count FROM users');
    stmt.step();
    const count = stmt.getAsObject().count;
    stmt.free();

    if (count > 0) {
        console.log('✅ Database already contains data, skipping seed');
        return;
    }

    const adminPassword = bcrypt.hashSync('admin123', 10);
    const volunteerPassword = bcrypt.hashSync('volunteer123', 10);
    const studentPassword = bcrypt.hashSync('student123', 10);

    // Insert users
    run(`INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?)`,
        ['admin@example.com', adminPassword, 'admin']);
    run(`INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?)`,
        ['volunteer@example.com', volunteerPassword, 'volunteer']);
    run(`INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?)`,
        ['student@example.com', studentPassword, 'student']);

    // Insert volunteers
    run(`INSERT INTO volunteers (user_id, first_name, last_name, bio, total_hours) VALUES (?, ?, ?, ?, ?)`,
        [2, 'John', 'Smith', 'Passionate about helping students succeed.', 0]);

    // Insert students
    run(`INSERT INTO students (user_id, first_name, last_name, grade_level, bio) VALUES (?, ?, ?, ?, ?)`,
        [3, 'Ali', 'Rahman', 5, 'Loves reading.']);

    console.log('✅ Initial data seeded successfully');
};
