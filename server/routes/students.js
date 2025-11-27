import express from 'express';
import { requireRole } from '../middleware/auth.js';

const router = express.Router();

// Get all students (admin/volunteer)
router.get('/', async (req, res) => {
    try {
        const { all } = req.tenantDb;

        const students = all(`
      SELECT 
        s.id,
        s.first_name as firstName,
        s.last_name as lastName,
        s.photo_url as photoUrl,
        s.grade_level as gradeLevel,
        s.progress_summary as progressSummary,
        u.email 
      FROM students s
      JOIN users u ON s.user_id = u.id
      ORDER BY s.last_name, s.first_name
    `);

        res.json(students);
    } catch (error) {
        console.error('Error fetching students:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get current student's data (student role)
router.get('/me', requireRole('student'), async (req, res) => {
    try {
        const { get } = req.tenantDb;

        const student = get(`
            SELECT 
                s.id,
                s.first_name as firstName,
                s.last_name as lastName,
                s.photo_url as photoUrl,
                s.grade_level as gradeLevel,
                s.birthday,
                s.bio,
                s.progress_summary as progressSummary,
                s.google_drive_folder_id as googleDriveFolderId
            FROM students s 
            WHERE s.user_id = ?
        `, [req.user.id]);

        if (!student) {
            return res.status(404).json({ error: 'Student profile not found' });
        }

        res.json(student);
    } catch (error) {
        console.error('Error fetching student data:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get student by ID
router.get('/:id', async (req, res) => {
    try {
        const { get } = req.tenantDb;

        const student = get(`
      SELECT 
        s.id,
        s.first_name as firstName,
        s.last_name as lastName,
        s.photo_url as photoUrl,
        s.grade_level as gradeLevel,
        s.birthday,
        s.bio,
        s.progress_summary as progressSummary,
        s.google_drive_folder_id as googleDriveFolderId,
        u.email 
      FROM students s
      JOIN users u ON s.user_id = u.id
      WHERE s.id = ?
    `, [req.params.id]);

        if (!student) {
            return res.status(404).json({ error: 'Student not found' });
        }

        res.json(student);
    } catch (error) {
        console.error('Error fetching student:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get student progress
router.get('/:id/progress', async (req, res) => {
    try {
        const { all } = req.tenantDb;

        const progress = all(`
      SELECT * FROM student_progress 
      WHERE student_id = ?
      ORDER BY subject, updated_at DESC
    `, [req.params.id]);

        res.json(progress);
    } catch (error) {
        console.error('Error fetching progress:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get student session history
router.get('/:id/sessions', async (req, res) => {
    try {
        const { all } = req.tenantDb;

        const sessions = all(`
      SELECT 
        a.id,
        s.session_date as sessionDate,
        v.first_name || ' ' || v.last_name as volunteerName,
        a.hours_logged as hoursLogged,
        a.notes
      FROM attendance a
      JOIN sessions s ON a.session_id = s.id
      JOIN volunteers v ON a.volunteer_id = v.id
      WHERE a.student_id = ?
      ORDER BY s.session_date DESC
    `, [req.params.id]);

        res.json(sessions);
    } catch (error) {
        console.error('Error fetching sessions:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update progress summary (volunteer/admin only)
router.put('/:id/progress-summary', requireRole('volunteer', 'admin'), async (req, res) => {
    const { progressSummary } = req.body;

    try {
        const { run } = req.tenantDb;

        run(`
      UPDATE students 
      SET progress_summary = ?, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `, [progressSummary, req.params.id]);

        res.json({ message: 'Progress summary updated successfully' });
    } catch (error) {
        console.error('Error updating progress summary:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update student profile
router.put('/:id', async (req, res) => {
    const { firstName, lastName, gradeLevel, birthday, bio, photoUrl, googleDriveFolderId } = req.body;

    try {
        const { run } = req.tenantDb;

        run(`
      UPDATE students 
      SET first_name = COALESCE(?, first_name),
          last_name = COALESCE(?, last_name),
          grade_level = COALESCE(?, grade_level),
          birthday = COALESCE(?, birthday),
          bio = COALESCE(?, bio),
          photo_url = COALESCE(?, photo_url),
          google_drive_folder_id = COALESCE(?, google_drive_folder_id),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [firstName, lastName, gradeLevel, birthday, bio, photoUrl, googleDriveFolderId, req.params.id]);

        res.json({ message: 'Student profile updated successfully' });
    } catch (error) {
        console.error('Error updating student:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
