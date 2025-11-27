import express from 'express';
import db from '../database.js';

const router = express.Router();

// Get matches for a student
router.get('/student/:id', (req, res) => {
    try {
        const matches = db.prepare(`
            SELECT m.*, v.first_name, v.last_name, v.bio
            FROM matches m
            JOIN volunteers v ON m.volunteer_id = v.id
            WHERE m.student_id = ? AND m.status = 'active'
        `).all(req.params.id);
        res.json(matches);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create match
router.post('/', (req, res) => {
    const { student_id, volunteer_id } = req.body;
    try {
        const info = db.prepare(`
            INSERT INTO matches (student_id, volunteer_id, status)
            VALUES (?, ?, 'active')
        `).run(student_id, volunteer_id);
        res.status(201).json({ id: info.lastInsertRowid, message: 'Match created successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// End match
router.put('/:id/end', (req, res) => {
    try {
        db.prepare("UPDATE matches SET status = 'ended', end_date = CURRENT_DATE WHERE id = ?")
            .run(req.params.id);
        res.json({ message: 'Match ended successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
