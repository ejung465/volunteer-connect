import express from 'express';
import { requireRole } from '../middleware/auth.js';

const router = express.Router();

// Get all sessions
router.get('/', async (req, res) => {
    try {
        const { all } = req.tenantDb;

        const sessions = all(`
      SELECT 
        s.id,
        s.session_date as sessionDate,
        COUNT(DISTINCT a.id) as attendanceCount
      FROM sessions s
      LEFT JOIN attendance a ON s.id = a.session_id
      GROUP BY s.id
      ORDER BY s.session_date DESC
    `);

        res.json(sessions);
    } catch (error) {
        console.error('Error fetching sessions:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Create new session (admin only)
router.post('/', requireRole('admin'), async (req, res) => {
    const { sessionDate } = req.body;

    if (!sessionDate) {
        return res.status(400).json({ error: 'Session date is required' });
    }

    try {
        const { run, get } = req.tenantDb;

        run(`INSERT INTO sessions (session_date, created_by_admin_id) VALUES (?, ?)`,
            [sessionDate, req.user.id]);

        const newSession = get('SELECT last_insert_rowid() as id');

        res.status(201).json({
            message: 'Session created successfully',
            sessionId: newSession.id
        });
    } catch (error) {
        console.error('Error creating session:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get session details
router.get('/:id', async (req, res) => {
    try {
        const { get, all } = req.tenantDb;

        const session = get('SELECT * FROM sessions WHERE id = ?', [req.params.id]);

        if (!session) {
            return res.status(404).json({ error: 'Session not found' });
        }

        const attendance = all(`
      SELECT 
        a.*,
        v.first_name || ' ' || v.last_name as volunteerName,
        s.first_name || ' ' || s.last_name as studentName
      FROM attendance a
      JOIN volunteers v ON a.volunteer_id = v.id
      JOIN students s ON a.student_id = s.id
      WHERE a.session_id = ?
    `, [req.params.id]);

        res.json({ ...session, attendance });
    } catch (error) {
        console.error('Error fetching session details:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Add attendance record (admin only)
router.post('/:id/attendance', requireRole('admin'), async (req, res) => {
    const { volunteerId, studentId, hoursLogged, notes } = req.body;

    if (!volunteerId || !studentId) {
        return res.status(400).json({ error: 'Volunteer ID and Student ID are required' });
    }

    try {
        const { run } = req.tenantDb;

        run(`INSERT INTO attendance (session_id, volunteer_id, student_id, hours_logged, notes) VALUES (?, ?, ?, ?, ?)`,
            [req.params.id, volunteerId, studentId, hoursLogged || 2.0, notes]);

        // Update volunteer total hours
        run(`UPDATE volunteers SET total_hours = total_hours + ? WHERE id = ?`,
            [hoursLogged || 2.0, volunteerId]);

        res.status(201).json({ message: 'Attendance recorded successfully' });
    } catch (error) {
        console.error('Error recording attendance:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
