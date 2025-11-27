import express from 'express';
import { tenantMiddleware } from './tenantMiddleware.js';

const app = express();
const PORT = 3002;

// Mock Auth Middleware - In your real app, this is your JWT verification
// This middleware MUST run before tenantMiddleware to set req.user.tenantId
const mockAuthMiddleware = (req, res, next) => {
    // Simulate a logged-in user belonging to 'tenant-a'
    req.user = {
        id: 1,
        email: 'user@tenant-a.com',
        tenantId: 'tenant-a' // This would come from the JWT payload
    };
    next();
};

// 1. Apply Auth Middleware
app.use(mockAuthMiddleware);

// 2. Apply Tenant Middleware
// This will attach the correct DB connection to req.tenantDb based on req.user.tenantId
app.use(tenantMiddleware);

// Sample Controller Function
const getUserData = (req, res) => {
    try {
        // Access the tenant-specific database connection
        const { all } = req.tenantDb;

        // Example query
        // Note: Since we are creating new empty DBs in this example, this table might not exist yet.
        // In a real scenario, you would run migrations when creating the tenant DB.

        // For demonstration, let's just check tables
        const tables = all("SELECT name FROM sqlite_master WHERE type='table'");

        res.json({
            message: `Connected to database for tenant: ${req.user.tenantId}`,
            tables: tables
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Database error' });
    }
};

// Route using the controller
app.get('/api/users', getUserData);

app.listen(PORT, () => {
    console.log(`Example server running on http://localhost:${PORT}`);
    console.log(`Try accessing http://localhost:${PORT}/api/users`);
});
