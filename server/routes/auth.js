import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    try {
        const dbModule = await import('../database.js');
        const { get, all } = dbModule.default;

        console.log(`[LOGIN] Attempting login for: ${email}`);
        
        const user = get('SELECT * FROM users WHERE email = ?', [email]);
        
        console.log(`[LOGIN] User found:`, user ? 'Yes' : 'No');
        if (user) {
            console.log(`[LOGIN] User role: ${user.role}, User ID: ${user.id}`);
        }

        if (!user) {
            console.log(`[LOGIN] No user found with email: ${email}`);
            // Debug: List all users
            const allUsers = all('SELECT email, role FROM users');
            console.log(`[LOGIN] All users in database:`, allUsers);
            return res.status(401).json({ error: 'Invalid email or password. Please try again.' });
        }

        console.log(`[LOGIN] Checking password...`);
        console.log(`[LOGIN] Password hash exists: ${!!user.password_hash}`);
        
        if (!user.password_hash) {
            console.log(`[LOGIN] ERROR: User has no password hash!`);
            return res.status(401).json({ error: 'Invalid email or password. Please try again.' });
        }
        
        const isValidPassword = bcrypt.compareSync(password, user.password_hash);
        console.log(`[LOGIN] Password valid: ${isValidPassword}`);

        if (!isValidPassword) {
            console.log(`[LOGIN] Invalid password for: ${email}`);
            console.log(`[LOGIN] Attempted password: ${password}`);
            // For debugging - show first few chars of hash
            console.log(`[LOGIN] Stored hash starts with: ${user.password_hash.substring(0, 20)}...`);
            return res.status(401).json({ error: 'Invalid email or password. Please try again.' });
        }

        // Get additional user info based on role
        let firstName, lastName;
        if (user.role === 'student') {
            const student = get('SELECT first_name, last_name FROM students WHERE user_id = ?', [user.id]);
            firstName = student?.first_name;
            lastName = student?.last_name;
        } else if (user.role === 'volunteer') {
            const volunteer = get('SELECT first_name, last_name FROM volunteers WHERE user_id = ?', [user.id]);
            firstName = volunteer?.first_name;
            lastName = volunteer?.last_name;
        }

        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            token,
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                firstName,
                lastName,
            },
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Register (for creating new accounts)
router.post('/register', async (req, res) => {
    const { email, password, role, firstName, lastName } = req.body;

    if (!email || !password || !role) {
        return res.status(400).json({ error: 'Email, password, and role are required' });
    }

    if (!['admin', 'volunteer', 'student'].includes(role)) {
        return res.status(400).json({ error: 'Invalid role' });
    }

    try {
        const dbModule = await import('../database.js');
        const { get, run } = dbModule.default;

        const existingUser = get('SELECT id FROM users WHERE email = ?', [email]);

        if (existingUser) {
            return res.status(409).json({ error: 'Email already exists' });
        }

        const passwordHash = bcrypt.hashSync(password, 10);

        run(`INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?)`,
            [email, passwordHash, role]);

        const newUser = get('SELECT last_insert_rowid() as id');
        const userId = newUser.id;

        // Create profile based on role
        if (role === 'student' && firstName && lastName) {
            run(`INSERT INTO students (user_id, first_name, last_name, grade_level) VALUES (?, ?, ?, ?)`,
                [userId, firstName, lastName, 1]);
        } else if (role === 'volunteer' && firstName && lastName) {
            run(`INSERT INTO volunteers (user_id, first_name, last_name) VALUES (?, ?, ?)`,
                [userId, firstName, lastName]);
        }

        res.status(201).json({ message: 'User created successfully' });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
