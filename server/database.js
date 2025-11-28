import initSqlJs from 'sql.js';
import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync, writeFileSync, existsSync, unlinkSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const dbPath = join(__dirname, 'database.sqlite');

let db;
let SQL;

// Initialize database
const initDatabase = async () => {
  SQL = await initSqlJs();

  // Load existing database or create new one
  if (existsSync(dbPath)) {
    try {
      console.log('📂 Loading existing database...');
      const buffer = readFileSync(dbPath);
      db = new SQL.Database(buffer);
      console.log('✅ Database loaded successfully');
    } catch (error) {
      console.log('⚠️  Error loading database, creating new one...');
      db = new SQL.Database();
    }
  } else {
    console.log('📝 Creating new database...');
    db = new SQL.Database();
  }

  // Helper function to run SQL
  const run = (sql, params = []) => {
    try {
      const stmt = db.prepare(sql);
      if (params && params.length > 0) {
        // sql.js bind works with array of values for positional parameters
        stmt.bind(params);
      }
      stmt.step();
      stmt.free();
      saveDatabase();
    } catch (error) {
      console.error('SQL Error:', error.message);
      console.error('SQL:', sql);
      console.error('Params:', params);
      throw error;
    }
  };

  // Helper function to get single row
  const get = (sql, params = []) => {
    try {
      const stmt = db.prepare(sql);
      stmt.bind(params);
      const result = stmt.step() ? stmt.getAsObject() : null;
      stmt.free();
      return result;
    } catch (error) {
      console.error('SQL Error:', error.message);
      throw error;
    }
  };

  // Helper function to get all rows
  const all = (sql, params = []) => {
    try {
      const stmt = db.prepare(sql);
      stmt.bind(params);
      const results = [];
      while (stmt.step()) {
        results.push(stmt.getAsObject());
      }
      stmt.free();
      return results;
    } catch (error) {
      console.error('SQL Error:', error.message);
      throw error;
    }
  };

  // Save database to file
  const saveDatabase = () => {
    const data = db.export();
    writeFileSync(dbPath, data);
  };

  // Helper function to check if table exists
  const tableExists = (tableName) => {
    try {
      const result = get(`SELECT name FROM sqlite_master WHERE type='table' AND name=?`, [tableName]);
      return result !== null;
    } catch {
      return false;
    }
  };

  // Create all tables if they don't exist
  if (!tableExists('users')) {
    console.log('📋 Creating database tables...');

    db.run(`
    CREATE TABLE users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('admin', 'volunteer', 'student')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

    db.run(`
    CREATE TABLE students (
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

    db.run(`
    CREATE TABLE volunteers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER UNIQUE NOT NULL,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      photo_url TEXT,
      bio TEXT,
      grade TEXT,
      school TEXT,
      total_hours REAL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

    db.run(`
    CREATE TABLE sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT DEFAULT 'Weekly Tutoring',
      session_date DATE NOT NULL,
      created_by_admin_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (created_by_admin_id) REFERENCES users(id)
    )
  `);

    db.run(`
    CREATE TABLE attendance (
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

    db.run(`
    CREATE TABLE student_progress (
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

    db.run(`
    CREATE TABLE volunteer_availability (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      volunteer_id INTEGER NOT NULL,
      session_id INTEGER NOT NULL,
      is_available BOOLEAN DEFAULT 1,
      FOREIGN KEY (volunteer_id) REFERENCES volunteers(id) ON DELETE CASCADE,
      FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE,
      UNIQUE(volunteer_id, session_id)
    )
  `);

    // Save after creating tables
    saveDatabase();
    console.log('✅ Database tables created successfully');
  } else {
    console.log('✅ Database tables already exist');
  }

  // Check if we need to seed data
  let userCount;
  try {
    userCount = get('SELECT COUNT(*) as count FROM users');
  } catch (error) {
    console.log('⚠️  Error checking user count, assuming empty database');
    userCount = { count: 0 };
  }
  const needsSeeding = !userCount || userCount.count === 0;

  console.log(`📊 Current user count: ${userCount?.count || 0}`);

  if (needsSeeding) {
    console.log('📦 Seeding initial data...');

    const adminPassword = bcrypt.hashSync('admin123', 10);
    const volunteerPassword = bcrypt.hashSync('volunteer123', 10);
    const studentPassword = bcrypt.hashSync('student123', 10);

    // Insert users using run helper to ensure database is saved
    run(`INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?)`,
      ['admin@example.com', adminPassword, 'admin']);
    run(`INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?)`,
      ['volunteer@example.com', volunteerPassword, 'volunteer']);
    run(`INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?)`,
      ['sarah.johnson@example.com', volunteerPassword, 'volunteer']);
    run(`INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?)`,
      ['student@example.com', studentPassword, 'student']);
    run(`INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?)`,
      ['ahmed.hassan@example.com', studentPassword, 'student']);
    run(`INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?)`,
      ['maria.garcia@example.com', studentPassword, 'student']);

    // Insert volunteers
    run(`INSERT INTO volunteers (user_id, first_name, last_name, bio, total_hours) VALUES (?, ?, ?, ?, ?)`,
      [2, 'John', 'Smith', 'Passionate about helping students succeed in math and reading.', 7.5]);
    run(`INSERT INTO volunteers (user_id, first_name, last_name, bio, total_hours) VALUES (?, ?, ?, ?, ?)`,
      [3, 'Sarah', 'Johnson', 'Former teacher with 10 years of experience.', 7.5]);

    // Insert students
    run(`INSERT INTO students (user_id, first_name, last_name, grade_level, birthday, bio, progress_summary) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [4, 'Ali', 'Rahman', 5, '2014-03-15', 'Loves reading and wants to improve in math.',
        'Ali has been making great progress in reading comprehension. He is currently working on 5th grade level problems and has completed 45 problems so far. In math, he needs more practice with fractions and word problems.']);
    run(`INSERT INTO students (user_id, first_name, last_name, grade_level, birthday, bio, progress_summary) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [5, 'Ahmed', 'Hassan', 7, '2012-07-22', 'Enjoys science and math.',
        'Ahmed excels in math and is working on advanced 8th grade problems. He has completed 62 problems and shows strong analytical skills. Reading comprehension is improving steadily.']);
    run(`INSERT INTO students (user_id, first_name, last_name, grade_level, birthday, bio, progress_summary) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [6, 'Maria', 'Garcia', 4, '2015-11-08', 'Creative and artistic, working on building confidence in reading.',
        'Maria is making steady progress in both subjects. She has completed 38 reading problems and 42 math problems at the 4th grade level. She benefits from encouragement and positive reinforcement.']);

    // Insert student progress
    run(`INSERT INTO student_progress (student_id, subject, grade_level, problems_completed, areas_for_improvement) VALUES (?, ?, ?, ?, ?)`,
      [1, 'Math', 5, 45, 'Fractions, word problems']);
    run(`INSERT INTO student_progress (student_id, subject, grade_level, problems_completed, areas_for_improvement) VALUES (?, ?, ?, ?, ?)`,
      [1, 'Reading', 5, 52, 'Vocabulary expansion']);
    run(`INSERT INTO student_progress (student_id, subject, grade_level, problems_completed, areas_for_improvement) VALUES (?, ?, ?, ?, ?)`,
      [2, 'Math', 8, 62, 'Geometry proofs']);
    run(`INSERT INTO student_progress (student_id, subject, grade_level, problems_completed, areas_for_improvement) VALUES (?, ?, ?, ?, ?)`,
      [2, 'Reading', 7, 48, 'Reading speed']);
    run(`INSERT INTO student_progress (student_id, subject, grade_level, problems_completed, areas_for_improvement) VALUES (?, ?, ?, ?, ?)`,
      [3, 'Math', 4, 42, 'Multiplication tables']);
    run(`INSERT INTO student_progress (student_id, subject, grade_level, problems_completed, areas_for_improvement) VALUES (?, ?, ?, ?, ?)`,
      [3, 'Reading', 4, 38, 'Reading comprehension']);

    // Create sessions
    run(`INSERT INTO sessions (session_date, created_by_admin_id) VALUES (?, ?)`, ['2024-01-06', 1]);
    run(`INSERT INTO sessions (session_date, created_by_admin_id) VALUES (?, ?)`, ['2024-01-13', 1]);
    run(`INSERT INTO sessions (session_date, created_by_admin_id) VALUES (?, ?)`, ['2024-01-20', 1]);

    // Add attendance records
    run(`INSERT INTO attendance (session_id, volunteer_id, student_id, hours_logged, notes) VALUES (?, ?, ?, ?, ?)`,
      [1, 1, 1, 2.5, 'Worked on fractions and reading comprehension']);
    run(`INSERT INTO attendance (session_id, volunteer_id, student_id, hours_logged, notes) VALUES (?, ?, ?, ?, ?)`,
      [1, 2, 2, 2.5, 'Advanced math problems and vocabulary']);
    run(`INSERT INTO attendance (session_id, volunteer_id, student_id, hours_logged, notes) VALUES (?, ?, ?, ?, ?)`,
      [2, 1, 1, 2.5, 'Continued work on fractions']);
    run(`INSERT INTO attendance (session_id, volunteer_id, student_id, hours_logged, notes) VALUES (?, ?, ?, ?, ?)`,
      [2, 2, 3, 2.5, 'Multiplication practice and reading']);
    run(`INSERT INTO attendance (session_id, volunteer_id, student_id, hours_logged, notes) VALUES (?, ?, ?, ?, ?)`,
      [3, 1, 2, 2.5, 'Geometry and reading comprehension']);
    run(`INSERT INTO attendance (session_id, volunteer_id, student_id, hours_logged, notes) VALUES (?, ?, ?, ?, ?)`,
      [3, 2, 1, 2.5, 'Word problems and vocabulary']);

    console.log('✅ Initial data seeded successfully');
  } else {
    console.log('✅ Database already contains data, skipping seed');
  }

  return { db, run, get, all, saveDatabase };
};

export default await initDatabase();
