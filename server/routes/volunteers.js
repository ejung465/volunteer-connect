import express from 'express';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Get all volunteers
router.get('/', authenticateToken, async (req, res) => {
    try {
        const dbModule = await import('../database.js');
        const { all } = dbModule.default;

        const volunteers = all(`
      SELECT 
        v.id,
        v.first_name as firstName,
        v.last_name as lastName,
        v.total_hours as totalHours,
        u.email 
      FROM volunteers v
      JOIN users u ON v.user_id = u.id
      ORDER BY v.last_name, v.first_name
    `);

        res.json(volunteers);
    } catch (error) {
        console.error('Error fetching volunteers:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get matched students for current volunteer
router.get('/matched-students', authenticateToken, requireRole('volunteer'), async (req, res) => {
    try {
        const dbModule = await import('../database.js');
        const { get, all } = dbModule.default;

        // Get volunteer ID from user ID
        const volunteer = get('SELECT id FROM volunteers WHERE user_id = ?', [req.user.id]);

        if (!volunteer) {
            return res.status(404).json({ error: 'Volunteer profile not found' });
        }

        // Get students this volunteer has worked with most
        const students = all(`
      SELECT 
        s.id,
        s.first_name as firstName,
        s.last_name as lastName,
        s.photo_url as photoUrl,
        s.grade_level as gradeLevel,
        s.progress_summary as progressSummary,
        COUNT(a.id) as session_count
      FROM students s
      JOIN attendance a ON s.id = a.student_id
      WHERE a.volunteer_id = ?
      GROUP BY s.id
      ORDER BY session_count DESC
      LIMIT 5
    `, [volunteer.id]);

        res.json(students);
    } catch (error) {
        console.error('Error fetching matched students:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get volunteer stats
router.get('/stats', authenticateToken, requireRole('volunteer'), async (req, res) => {
    try {
        const dbModule = await import('../database.js');
        const { get, all } = dbModule.default;

        const volunteer = get('SELECT id, total_hours FROM volunteers WHERE user_id = ?', [req.user.id]);

        if (!volunteer) {
            return res.status(404).json({ error: 'Volunteer profile not found' });
        }

        // Get session data for pie chart
        const sessionData = all(`
      SELECT 
        s.first_name || ' ' || s.last_name as studentName,
        SUM(a.hours_logged) as hours
      FROM attendance a
      JOIN students s ON a.student_id = s.id
      WHERE a.volunteer_id = ?
      GROUP BY a.student_id
      ORDER BY hours DESC
    `, [volunteer.id]);

        res.json({
            totalHours: volunteer.total_hours,
            sessionData,
        });
    } catch (error) {
        console.error('Error fetching volunteer stats:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get upcoming sessions for volunteer
router.get('/upcoming-sessions', authenticateToken, requireRole('volunteer'), async (req, res) => {
    try {
        const dbModule = await import('../database.js');
        const { get, all } = dbModule.default;

        const volunteer = get('SELECT id FROM volunteers WHERE user_id = ?', [req.user.id]);

        if (!volunteer) {
            return res.status(404).json({ error: 'Volunteer profile not found' });
        }

        const sessions = all(`
      SELECT 
        s.id,
        s.session_date as sessionDate,
        COALESCE(va.is_available, 0) as isAvailable
      FROM sessions s
      LEFT JOIN volunteer_availability va ON s.id = va.session_id AND va.volunteer_id = ?
      WHERE s.session_date >= date('now')
      ORDER BY s.session_date ASC
      LIMIT 10
    `, [volunteer.id]);

        res.json(sessions);
    } catch (error) {
        console.error('Error fetching upcoming sessions:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
