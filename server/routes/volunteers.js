import express from 'express';
import db from '../database.js';

const router = express.Router();

// Get all volunteers
router.get('/', (req, res) => {
    try {
        const volunteers = db.all(`
            SELECT 
                v.id,
                v.first_name as firstName,
                v.last_name as lastName,
                v.photo_url as photoUrl,
                v.bio,
                v.total_hours as totalHours,
                u.email 
            FROM volunteers v 
            JOIN users u ON v.user_id = u.id
        `);
        res.json(volunteers);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get volunteer by ID
router.get('/:id', (req, res) => {
    try {
        const volunteer = db.get(`
            SELECT 
                v.id,
                v.first_name as firstName,
                v.last_name as lastName,
                v.photo_url as photoUrl,
                v.bio,
                v.total_hours as totalHours,
                u.email 
            FROM volunteers v 
            JOIN users u ON v.user_id = u.id 
            WHERE v.id = ?
        `, [req.params.id]);

        if (!volunteer) {
            return res.status(404).json({ error: 'Volunteer not found' });
        }
        res.json(volunteer);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create new volunteer
router.post('/', (req, res) => {
    const { first_name, last_name, email } = req.body;

    try {
        db.run('INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?)', [email, 'temp_hash', 'volunteer']);
        const user = db.get('SELECT last_insert_rowid() as id');

        db.run('INSERT INTO volunteers (user_id, first_name, last_name) VALUES (?, ?, ?)',
            [user.id, first_name, last_name]);

        res.status(201).json({ id: user.id, message: 'Volunteer created successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get volunteer stats
router.get('/:id/stats', (req, res) => {
    try {
        const stats = db.get(`
            SELECT 
                COUNT(DISTINCT session_id) as total_sessions,
                SUM(hours_logged) as total_hours
            FROM attendance
            WHERE volunteer_id = ?
        `, [req.params.id]);
        res.json(stats);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update volunteer profile
router.put('/:id', (req, res) => {
    const { firstName, lastName, bio, phone, photoUrl } = req.body;
    try {
        db.run(`
            UPDATE volunteers 
            SET first_name = COALESCE(?, first_name),
                last_name = COALESCE(?, last_name),
                bio = COALESCE(?, bio),
                phone = COALESCE(?, phone),
                photo_url = COALESCE(?, photo_url),
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `, [firstName, lastName, bio, phone, photoUrl, req.params.id]);
        res.json({ message: 'Volunteer profile updated successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
