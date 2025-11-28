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
                v.grade,
                v.school,
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

// Get current volunteer's data (for volunteer role)
router.get('/me', (req, res) => {
    try {
        if (!req.user || req.user.role !== 'volunteer') {
            return res.status(403).json({ error: 'Access denied' });
        }

        const volunteer = db.get(`
            SELECT 
                v.id,
                v.first_name as firstName,
                v.last_name as lastName,
                v.photo_url as photoUrl,
                v.bio,
                v.grade,
                v.school,
                v.total_hours as totalHours,
                u.email 
            FROM volunteers v 
            JOIN users u ON v.user_id = u.id 
            WHERE v.user_id = ?
        `, [req.user.id]);

        if (!volunteer) {
            return res.status(404).json({ error: 'Volunteer profile not found' });
        }
        res.json(volunteer);
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
                v.grade,
                v.school,
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

// Get current volunteer's stats
router.get('/stats', (req, res) => {
    try {
        if (!req.user || req.user.role !== 'volunteer') {
            return res.status(403).json({ error: 'Access denied' });
        }

        const volunteer = db.get('SELECT id FROM volunteers WHERE user_id = ?', [req.user.id]);
        if (!volunteer) {
            return res.status(404).json({ error: 'Volunteer profile not found' });
        }

        // Get total hours
        const hoursData = db.get(`
            SELECT SUM(hours_logged) as totalHours
            FROM attendance
            WHERE volunteer_id = ?
        `, [volunteer.id]);

        // Get session data by student
        const sessionData = db.all(`
            SELECT 
                s.first_name || ' ' || s.last_name as studentName,
                SUM(a.hours_logged) as hours
            FROM attendance a
            JOIN students s ON a.student_id = s.id
            WHERE a.volunteer_id = ?
            GROUP BY s.id, s.first_name, s.last_name
            ORDER BY hours DESC
        `, [volunteer.id]);

        res.json({
            totalHours: hoursData?.totalHours || 0,
            sessionData: sessionData || []
        });
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

// Get upcoming sessions for current volunteer
router.get('/upcoming-sessions', (req, res) => {
    try {
        if (!req.user || req.user.role !== 'volunteer') {
            return res.status(403).json({ error: 'Access denied' });
        }

        const volunteer = db.get('SELECT id FROM volunteers WHERE user_id = ?', [req.user.id]);
        if (!volunteer) {
            return res.status(404).json({ error: 'Volunteer profile not found' });
        }

        const now = new Date().toISOString().split('T')[0];
        const sessions = db.all(`
            SELECT 
                s.id,
                s.title,
                s.session_date as sessionDate,
                COALESCE(va.is_available, NULL) as isAvailable
            FROM sessions s
            LEFT JOIN volunteer_availability va ON va.session_id = s.id AND va.volunteer_id = ?
            WHERE s.session_date >= ?
            ORDER BY s.session_date ASC
        `, [volunteer.id, now]);

        res.json(sessions.map(s => ({
            ...s,
            isAvailable: s.isAvailable === 1 ? true : s.isAvailable === 0 ? false : null
        })));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get matched students for current volunteer
router.get('/matched-students', (req, res) => {
    try {
        if (!req.user || req.user.role !== 'volunteer') {
            return res.status(403).json({ error: 'Access denied' });
        }

        const volunteer = db.get('SELECT id FROM volunteers WHERE user_id = ?', [req.user.id]);
        if (!volunteer) {
            return res.status(404).json({ error: 'Volunteer profile not found' });
        }

        // Get students this volunteer has worked with, sorted by session count
        const students = db.all(`
            SELECT 
                s.id,
                s.first_name as firstName,
                s.last_name as lastName,
                s.photo_url as photoUrl,
                s.grade_level as gradeLevel,
                s.progress_summary as progressSummary,
                COUNT(DISTINCT a.session_id) as sessionCount,
                MAX(a.created_at) as lastSessionDate
            FROM attendance a
            JOIN students s ON a.student_id = s.id
            WHERE a.volunteer_id = ?
            GROUP BY s.id, s.first_name, s.last_name, s.photo_url, s.grade_level, s.progress_summary
            ORDER BY sessionCount DESC, lastSessionDate DESC
        `, [volunteer.id]);

        res.json(students);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update volunteer profile
router.put('/:id', (req, res) => {
    const { firstName, lastName, bio, grade, school, photoUrl } = req.body;
    try {
        db.run(`
            UPDATE volunteers 
            SET first_name = COALESCE(?, first_name),
                last_name = COALESCE(?, last_name),
                bio = COALESCE(?, bio),
                grade = COALESCE(?, grade),
                school = COALESCE(?, school),
                photo_url = COALESCE(?, photo_url),
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `, [firstName, lastName, bio, grade, school, photoUrl, req.params.id]);
        res.json({ message: 'Volunteer profile updated successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
