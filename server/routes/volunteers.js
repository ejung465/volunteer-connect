import express from 'express';
import db from '../database.js';

const router = express.Router();

// Get all volunteers
router.get('/', (req, res) => {
    try {
        const volunteers = db.prepare(`
            SELECT v.*, u.email 
            FROM volunteers v 
            JOIN users u ON v.user_id = u.id
        `).all();
        res.json(volunteers);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get volunteer by ID
router.get('/:id', (req, res) => {
    try {
        const volunteer = db.prepare(`
            SELECT v.*, u.email 
            FROM volunteers v 
            JOIN users u ON v.user_id = u.id 
            WHERE v.id = ?
        `).get(req.params.id);

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
        const createUser = db.transaction(() => {
            const info = db.prepare('INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?)')
                .run(email, 'temp_hash', 'volunteer');

            db.prepare('INSERT INTO volunteers (user_id, first_name, last_name) VALUES (?, ?, ?)')
                .run(info.lastInsertRowid, first_name, last_name);

            return info.lastInsertRowid;
        });

        const userId = createUser();
        res.status(201).json({ id: userId, message: 'Volunteer created successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get volunteer stats
router.get('/:id/stats', (req, res) => {
    try {
        const stats = db.prepare(`
            SELECT 
                COUNT(DISTINCT session_id) as total_sessions,
                SUM(hours_logged) as total_hours
            FROM attendance
            WHERE volunteer_id = ?
        `).get(req.params.id);
        res.json(stats);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update volunteer profile
router.put('/:id', (req, res) => {
    const { firstName, lastName, bio, phone, photoUrl } = req.body;
    try {
        db.prepare(`
            UPDATE volunteers 
            SET first_name = COALESCE(?, first_name),
                last_name = COALESCE(?, last_name),
                bio = COALESCE(?, bio),
                phone = COALESCE(?, phone),
                photo_url = COALESCE(?, photo_url),
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `).run(firstName, lastName, bio, phone, photoUrl, req.params.id);
        res.json({ message: 'Volunteer profile updated successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
