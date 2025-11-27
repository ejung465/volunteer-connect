import express from 'express';
import { requireRole } from '../middleware/auth.js';
import { matchStudentsToVolunteers } from '../utils/matching-algorithm.js';

const router = express.Router();

// Generate matches for a specific session date
router.post('/generate', requireRole('admin'), async (req, res) => {
    const { sessionDate } = req.body;

    if (!sessionDate) {
        return res.status(400).json({ error: 'Session date is required' });
    }

    try {
        const { all } = req.tenantDb;

        // 1. Get all active students
        const students = all('SELECT * FROM students');

        // 2. Get volunteers available for this date
        // (For now, we'll assume all volunteers are available, or use the availability table if populated)
        // In a real app, we'd join with volunteer_availability
        const volunteers = all(`
            SELECT v.* 
            FROM volunteers v
            JOIN volunteer_availability va ON v.id = va.volunteer_id
            JOIN sessions s ON va.session_id = s.id
            WHERE s.session_date = ? AND va.is_available = 1
        `, [sessionDate]);

        // Fallback: If no availability data, just get all volunteers (for demo purposes)
        const availableVolunteers = volunteers.length > 0 ? volunteers : all('SELECT * FROM volunteers');

        // 3. Get historical attendance for context
        const history = all('SELECT * FROM attendance');

        // 4. Run algorithm
        const matches = matchStudentsToVolunteers(students, availableVolunteers, history);

        // 5. Format response
        const results = Object.entries(matches).map(([studentId, volunteerId]) => {
            const student = students.find(s => s.id == studentId);
            const volunteer = availableVolunteers.find(v => v.id == volunteerId);
            return {
                student,
                volunteer
            };
        });

        res.json({ matches: results });

    } catch (error) {
        console.error('Error generating matches:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
