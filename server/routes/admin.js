import express from 'express';
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

export default router;
