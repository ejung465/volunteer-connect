import express from 'express';
import db from '../database.js';

const router = express.Router();

// Get dashboard stats
router.get('/stats', (req, res) => {
    try {
        const stats = {
            students: db.prepare('SELECT COUNT(*) as count FROM students').get().count,
            volunteers: db.prepare('SELECT COUNT(*) as count FROM volunteers').get().count,
            sessions: db.prepare('SELECT COUNT(*) as count FROM sessions').get().count,
            hours: db.prepare('SELECT COALESCE(SUM(hours_logged), 0) as count FROM attendance').get().count
        };
        res.json(stats);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
