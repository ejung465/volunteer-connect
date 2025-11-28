import express from 'express';
import bcrypt from 'bcryptjs';
import db from '../database.js';

const router = express.Router();

// Get dashboard stats
router.get('/stats', (req, res) => {
    try {
        const stats = {
            students: db.get('SELECT COUNT(*) as count FROM students').count,
            volunteers: db.get('SELECT COUNT(*) as count FROM volunteers').count,
            sessions: db.get('SELECT COUNT(*) as count FROM sessions').count,
            hours: db.get('SELECT COALESCE(SUM(hours_logged), 0) as count FROM attendance').count
        };
        res.json(stats);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create user (admin only)
router.post('/users', (req, res) => {
    const { firstName, lastName, email, password, role, gradeLevel } = req.body;

    if (!email || !password || !role || !firstName || !lastName) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    try {
        const existingUser = db.get('SELECT id FROM users WHERE email = ?', [email]);
        if (existingUser) {
            return res.status(409).json({ error: 'Email already exists' });
        }

        const passwordHash = bcrypt.hashSync(password, 10);
        db.run('INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?)', [email, passwordHash, role]);
        const newUser = db.get('SELECT last_insert_rowid() as id');
        const userId = newUser.id;

        if (role === 'student') {
            db.run('INSERT INTO students (user_id, first_name, last_name, grade_level) VALUES (?, ?, ?, ?)',
                [userId, firstName, lastName, gradeLevel || 1]);
        } else if (role === 'volunteer') {
            db.run('INSERT INTO volunteers (user_id, first_name, last_name) VALUES (?, ?, ?)',
                [userId, firstName, lastName]);
        }

        res.status(201).json({ id: userId, message: 'User created successfully' });
    } catch (error) {
        console.error('Create user error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Delete student
router.delete('/students/:id', (req, res) => {
    try {
        const student = db.get('SELECT user_id FROM students WHERE id = ?', [req.params.id]);
        if (!student) {
            return res.status(404).json({ error: 'Student not found' });
        }
        // Delete user will cascade delete student due to foreign key
        db.run('DELETE FROM users WHERE id = ?', [student.user_id]);
        res.json({ message: 'Student deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete volunteer
router.delete('/volunteers/:id', (req, res) => {
    try {
        const volunteer = db.get('SELECT user_id FROM volunteers WHERE id = ?', [req.params.id]);
        if (!volunteer) {
            return res.status(404).json({ error: 'Volunteer not found' });
        }
        // Delete user will cascade delete volunteer due to foreign key
        db.run('DELETE FROM users WHERE id = ?', [volunteer.user_id]);
        res.json({ message: 'Volunteer deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
