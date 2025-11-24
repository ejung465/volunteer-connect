import express from 'express';
import bcrypt from 'bcryptjs';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import { syncUserReport } from '../utils/googleSheets.js';

const router = express.Router();

// Create new user (admin only)
router.post('/users', authenticateToken, requireRole('admin'), async (req, res) => {
    const { firstName, lastName, email, password, role, gradeLevel, bio } = req.body;

    if (!email || !password || !role || !firstName || !lastName) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    if (!['volunteer', 'student', 'admin'].includes(role)) {
        return res.status(400).json({ error: 'Invalid role' });
    }

    try {
        const dbModule = await import('../database.js');
        const { run, get } = dbModule.default;

        // Check if user exists
        const existingUser = get('SELECT id FROM users WHERE email = ?', [email]);
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        run('INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?)', [email, hashedPassword, role]);
        const newUser = get('SELECT id FROM users WHERE email = ?', [email]);

        // Create profile based on role
        if (role === 'student') {
            run(`INSERT INTO students (user_id, first_name, last_name, grade_level, bio) VALUES (?, ?, ?, ?, ?)`,
                [newUser.id, firstName, lastName, gradeLevel || 1, bio || '']);
        } else if (role === 'volunteer') {
            run(`INSERT INTO volunteers (user_id, first_name, last_name, bio) VALUES (?, ?, ?, ?)`,
                [newUser.id, firstName, lastName, bio || '']);
        }

        // Sync to Google Sheets (fire and forget)
        syncUserReport({ firstName, lastName, email, role });

        res.status(201).json({ message: 'User created successfully', userId: newUser.id });

    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
