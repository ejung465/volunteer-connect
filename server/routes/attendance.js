import express from 'express';
import db from '../database.js';

const router = express.Router();

// Update attendance hours
router.put('/:id', (req, res) => {
    const { hours_logged } = req.body;
    try {
        db.run(`
            UPDATE attendance 
            SET hours_logged = ?
            WHERE id = ?
        `, [hours_logged, req.params.id]);
        res.json({ message: 'Attendance updated successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
