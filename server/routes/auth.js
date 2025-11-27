import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import initSqlJs from 'sql.js';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { getTenantConnectionDetails } from '../tenantRegistry.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Helper to load DB for a tenant
const loadTenantDb = async (tenantId) => {
    try {
        const details = await getTenantConnectionDetails(tenantId);
        const SQL = await initSqlJs();

        let db;
        if (existsSync(details.dbPath)) {
            const buffer = readFileSync(details.dbPath);
            db = new SQL.Database(buffer);
        } else {
            // If DB doesn't exist, create new for registration, or return null for login?
            // For simplicity, we'll create a new one if it doesn't exist (e.g. first run for a tenant)
            db = new SQL.Database();
        }

        const saveDatabase = () => {
            const data = db.export();
            writeFileSync(details.dbPath, data);
        };

        const get = (sql, params = []) => {
            try {
                const stmt = db.prepare(sql);
                stmt.bind(params);
                const result = stmt.step() ? stmt.getAsObject() : null;
                stmt.free();
                return result;
            } catch (e) {
                console.error("SQL Get Error:", e);
                return null;
            }
        };

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
            } catch (e) {
                console.error("SQL All Error:", e);
                return [];
            }
        };

        const run = (sql, params = []) => {
            try {
                const stmt = db.prepare(sql);
                stmt.bind(params);
                stmt.step();
                stmt.free();
                saveDatabase();
            } catch (e) {
                console.error("SQL Run Error:", e);
                throw e;
            }
        };

        return { db, get, all, run };
    } catch (error) {
        console.error(`Failed to load DB for tenant ${tenantId}:`, error);
        throw error;
    }
};

// Login
router.post('/login', async (req, res) => {
    // Default to 'tenant-a' for backward compatibility/demo
    const { email, password, tenantId = 'tenant-a' } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    try {
        const { get, all } = await loadTenantDb(tenantId);

        console.log(`[LOGIN] Attempting login for: ${email} on tenant: ${tenantId}`);

        // Check if users table exists (in case of fresh DB)
        try {
            const check = get("SELECT name FROM sqlite_master WHERE type='table' AND name='users'");
            if (!check) {
                return res.status(500).json({ error: 'Database not initialized for this tenant' });
            }
        } catch (e) {
            return res.status(500).json({ error: 'Database error' });
        }

        const user = get('SELECT * FROM users WHERE email = ?', [email]);

        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password.' });
        }

        if (!user.password_hash) {
            return res.status(401).json({ error: 'Invalid email or password.' });
        }

        const isValidPassword = bcrypt.compareSync(password, user.password_hash);

        if (!isValidPassword) {
            return res.status(401).json({ error: 'Invalid email or password.' });
        }

        // Get additional user info based on role
        let firstName, lastName;
        if (user.role === 'student') {
            const student = get('SELECT first_name, last_name FROM students WHERE user_id = ?', [user.id]);
            firstName = student?.first_name;
            lastName = student?.last_name;
        } else if (user.role === 'volunteer') {
            const volunteer = get('SELECT first_name, last_name FROM volunteers WHERE user_id = ?', [user.id]);
            firstName = volunteer?.first_name;
            lastName = volunteer?.last_name;
        }

        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role, tenantId }, // Include tenantId
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            token,
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                firstName,
                lastName,
                tenantId
            },
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Register (for creating new accounts)
router.post('/register', async (req, res) => {
    const { email, password, role, firstName, lastName, tenantId = 'tenant-a' } = req.body;

    if (!email || !password || !role) {
        return res.status(400).json({ error: 'Email, password, and role are required' });
    }

    if (!['admin', 'volunteer', 'student'].includes(role)) {
        return res.status(400).json({ error: 'Invalid role' });
    }

    try {
        const { get, run, db } = await loadTenantDb(tenantId);

        // Ensure tables exist
        const tableCheck = get("SELECT name FROM sqlite_master WHERE type='table' AND name='users'");
        if (!tableCheck) {
            console.log(`[REGISTER] Initializing database for tenant: ${tenantId}`);
            initializeDatabase(db);

            // Save the initialized database
            const details = await getTenantConnectionDetails(tenantId);
            writeFileSync(details.dbPath, db.export());
        }

        const existingUser = get('SELECT id FROM users WHERE email = ?', [email]);

        if (existingUser) {
            return res.status(409).json({ error: 'Email already exists' });
        }

        const passwordHash = bcrypt.hashSync(password, 10);

        run(`INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?)`,
            [email, passwordHash, role]);

        const newUser = get('SELECT last_insert_rowid() as id');
        const userId = newUser.id;

        // Create profile based on role
        if (role === 'student' && firstName && lastName) {
            run(`INSERT INTO students (user_id, first_name, last_name, grade_level) VALUES (?, ?, ?, ?)`,
                [userId, firstName, lastName, 1]);
        } else if (role === 'volunteer' && firstName && lastName) {
            run(`INSERT INTO volunteers (user_id, first_name, last_name) VALUES (?, ?, ?)`,
                [userId, firstName, lastName]);
        }

        res.status(201).json({ message: 'User created successfully' });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
