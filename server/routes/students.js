import express from 'express';
import db from '../database.js';

const router = express.Router();

// Get all students
router.get('/', (req, res) => {
    try {
        const students = db.all(`
            SELECT s.*, u.email 
            FROM students s 
            JOIN users u ON s.user_id = u.id
        `);
        res.json(students);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get student by ID
router.get('/:id', (req, res) => {
    try {
        const student = db.get(`
            SELECT s.*, u.email 
            FROM students s 
            JOIN users u ON s.user_id = u.id 
            WHERE s.id = ?
        `, [req.params.id]);

        if (!student) {
            return res.status(404).json({ error: 'Student not found' });
        }
        res.json(student);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create new student
router.post('/', (req, res) => {
    const { first_name, last_name, grade_level, email } = req.body;

    try {
        db.run('INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?)', [email, 'temp_hash', 'student']);
        const user = db.get('SELECT last_insert_rowid() as id');

        db.run('INSERT INTO students (user_id, first_name, last_name, grade_level) VALUES (?, ?, ?, ?)',
            [user.id, first_name, last_name, grade_level]);

        res.status(201).json({ id: user.id, message: 'Student created successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get student progress
router.get('/:id/progress', (req, res) => {
    try {
        const progress = db.all(`
            SELECT * FROM student_progress 
            WHERE student_id = ?
            ORDER BY subject, updated_at DESC
        `, [req.params.id]);
        res.json(progress);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get student session history
router.get('/:id/sessions', (req, res) => {
    try {
        const sessions = db.all(`
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
        res.status(500).json({ error: error.message });
    }
});

// Update progress summary
router.put('/:id/progress-summary', (req, res) => {
    const { progressSummary } = req.body;
    try {
        db.run(`
            UPDATE students 
            SET progress_summary = ?, updated_at = CURRENT_TIMESTAMP 
            WHERE id = ?
        `, [progressSummary, req.params.id]);
        res.json({ message: 'Progress summary updated successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update student profile
router.put('/:id', (req, res) => {
    const { firstName, lastName, gradeLevel, birthday, bio, photoUrl, googleDriveFolderId } = req.body;
    try {
        db.run(`
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
        res.status(500).json({ error: error.message });
    }
});

export default router;
