import express from 'express';
import db from '../database.js';

const router = express.Router();

// Get all sessions
router.get('/', (req, res) => {
    try {
        const sessions = db.prepare('SELECT * FROM sessions ORDER BY session_date DESC').all();
        res.json(sessions);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create new session
router.post('/', (req, res) => {
    const { session_date, start_time, end_time, location } = req.body;
    try {
        const info = db.prepare(`
            INSERT INTO sessions (session_date, start_time, end_time, location)
            VALUES (?, ?, ?, ?)
        `).run(session_date, start_time, end_time, location);
        res.status(201).json({ id: info.lastInsertRowid, message: 'Session created successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Record attendance
router.post('/:id/attendance', (req, res) => {
    const { student_id, volunteer_id, hours_logged, notes } = req.body;
    try {
        const info = db.prepare(`
            INSERT INTO attendance (session_id, student_id, volunteer_id, hours_logged, notes)
            VALUES (?, ?, ?, ?, ?)
        `).run(req.params.id, student_id, volunteer_id, hours_logged, notes);
        res.status(201).json({ id: info.lastInsertRowid, message: 'Attendance recorded successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get session attendance
router.get('/:id/attendance', (req, res) => {
    try {
        const attendance = db.prepare(`
            SELECT a.*, 
                   s.first_name as student_first_name, s.last_name as student_last_name,
                   v.first_name as volunteer_first_name, v.last_name as volunteer_last_name
            FROM attendance a
            JOIN students s ON a.student_id = s.id
            JOIN volunteers v ON a.volunteer_id = v.id
            WHERE a.session_id = ?
        `).all(req.params.id);
        res.json(attendance);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
