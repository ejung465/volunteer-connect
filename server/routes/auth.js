import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../database.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Login
router.post('/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    try {
        const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);

        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        if (!bcrypt.compareSync(password, user.password_hash)) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Get profile data
        let profile = null;
        if (user.role === 'student') {
            profile = db.prepare('SELECT * FROM students WHERE user_id = ?').get(user.id);
        } else if (user.role === 'volunteer') {
            profile = db.prepare('SELECT * FROM volunteers WHERE user_id = ?').get(user.id);
        }

        res.json({
            token,
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                firstName: profile?.first_name,
                lastName: profile?.last_name
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Register
router.post('/register', (req, res) => {
    const { email, password, role, firstName, lastName } = req.body;

    if (!email || !password || !role) {
        return res.status(400).json({ error: 'Email, password, and role are required' });
    }

    if (!['admin', 'volunteer', 'student'].includes(role)) {
        return res.status(400).json({ error: 'Invalid role' });
    }

    try {
        const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(email);

        if (existingUser) {
            return res.status(409).json({ error: 'Email already exists' });
        }

        const passwordHash = bcrypt.hashSync(password, 10);

        const info = db.prepare('INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?)').run(email, passwordHash, role);
        const userId = info.lastInsertRowid;

        // Create profile based on role
        if (role === 'student' && firstName && lastName) {
            db.prepare('INSERT INTO students (user_id, first_name, last_name, grade_level) VALUES (?, ?, ?, ?)').run(userId, firstName, lastName, 1);
        } else if (role === 'volunteer' && firstName && lastName) {
            db.prepare('INSERT INTO volunteers (user_id, first_name, last_name) VALUES (?, ?, ?)').run(userId, firstName, lastName);
        }

        res.status(201).json({ message: 'User created successfully' });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
