import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import studentRoutes from './routes/students.js';
import volunteerRoutes from './routes/volunteers.js';
import sessionRoutes from './routes/sessions.js';
import matchingRoutes from './routes/matching.js';
import adminRoutes from './routes/admin.js';
import attendanceRoutes from './routes/attendance.js';
import './database.js'; // Initialize database

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
const corsOptions = {
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});
// Routes
app.use('/api/auth', authRoutes);

// Protected Routes Middleware
import { authenticateToken } from './middleware/auth.js';

app.use('/api', authenticateToken);

app.use('/api/students', studentRoutes);
app.use('/api/volunteers', volunteerRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/matching', matchingRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/sessions/attendance', attendanceRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Server is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

// Serve static files from the React frontend app
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static files from the dist directory (one level up from server)
const distPath = path.join(__dirname, '../dist');
app.use(express.static(distPath));

// Handle React routing, return all requests to React app
app.get('*', (req, res) => {
    // Check if the request is for an API endpoint to avoid returning HTML for API 404s
    if (req.path.startsWith('/api')) {
        return res.status(404).json({ error: 'API route not found' });
    }
    res.sendFile(path.join(distPath, 'index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════════════════════╗
║                                                        ║
║   🚀 Volunteer Connect Server                         ║
║                                                        ║
║   Server running on: http://localhost:${PORT}         ║
║   Environment: ${process.env.NODE_ENV || 'development'}                           ║
║                                                        ║
║   API Endpoints:                                       ║
║   - POST /api/auth/login                               ║
║   - POST /api/auth/register                            ║
║   - GET  /api/students                                 ║
║   - GET  /api/volunteers                               ║
║   - GET  /api/sessions                                 ║
║                                                        ║
║   Demo Accounts:                                       ║
║   Admin: admin@example.com / admin123                  ║
║   Volunteer: volunteer@example.com / volunteer123      ║
║   Student: student@example.com / student123            ║
║                                                        ║
╚════════════════════════════════════════════════════════╝
  `);
});

export default app;
