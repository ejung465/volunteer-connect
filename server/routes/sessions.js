import express from 'express';
import db from '../database.js';

const router = express.Router();

// Get all sessions
router.get('/', (req, res) => {
    try {
        const sessions = db.all('SELECT * FROM sessions ORDER BY session_date DESC');
        res.json(sessions);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create new session
router.post('/', (req, res) => {
    const { session_date, start_time, end_time, location } = req.body;
    try {
        db.run(`
            INSERT INTO sessions (session_date, start_time, end_time, location)
            VALUES (?, ?, ?, ?)
        `, [session_date, start_time, end_time, location]);
        const info = db.get('SELECT last_insert_rowid() as id');
        res.status(201).json({ id: info.id, message: 'Session created successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Record attendance
router.post('/:id/attendance', (req, res) => {
    const { student_id, volunteer_id, hours_logged, notes } = req.body;
    try {
        db.run(`
            INSERT INTO attendance (session_id, student_id, volunteer_id, hours_logged, notes)
            VALUES (?, ?, ?, ?, ?)
        `, [req.params.id, student_id, volunteer_id, hours_logged, notes]);
        const info = db.get('SELECT last_insert_rowid() as id');
        res.status(201).json({ id: info.id, message: 'Attendance recorded successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get session attendance
router.get('/:id/attendance', (req, res) => {
    try {
        const attendance = db.all(`
            SELECT a.*, 
                   s.first_name as student_first_name, s.last_name as student_last_name,
                   v.first_name as volunteer_first_name, v.last_name as volunteer_last_name
            FROM attendance a
            JOIN students s ON a.student_id = s.id
            JOIN volunteers v ON a.volunteer_id = v.id
            WHERE a.session_id = ?
        `, [req.params.id]);
        res.json(attendance);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
