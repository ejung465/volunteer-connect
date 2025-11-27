import initSqlJs from 'sql.js';
import { readFileSync, existsSync } from 'fs';
import { getTenantConnectionDetails } from './tenantRegistry.js';

// Cache for tenant database connections
// Map<tenantId, { db: SQL.Database, run: Function, get: Function, all: Function }>
const tenantDbCache = new Map();

let SQL;

// Initialize SQL.js once
const initSQL = async () => {
    if (!SQL) {
        SQL = await initSqlJs();
    }
};

/**
 * Helper to create DB wrappers (run, get, all) for a specific DB instance
 */
const createDbWrappers = (db, dbPath) => {
    const saveDatabase = () => {
        // In a real DB (Postgres/MySQL), this isn't needed. 
        // For SQL.js/SQLite file, we might need to save back to disk if we want persistence.
        // For this middleware example, we'll skip the write-back implementation details 
        // or keep it simple if needed. 
        // If the user wants to save, they might need a separate mechanism or we can inject it here.
        // For now, we'll assume read-heavy or in-memory for the example, 
        // or we would need 'fs' writeFileSync here.
    };

    const run = (sql, params = []) => {
        try {
            const stmt = db.prepare(sql);
            if (params && params.length > 0) stmt.bind(params);
            stmt.step();
            stmt.free();
            // saveDatabase(); // Uncomment if persistence is needed
        } catch (error) {
            console.error('SQL Error:', error.message);
            throw error;
        }
    };

    const get = (sql, params = []) => {
        try {
            const stmt = db.prepare(sql);
            stmt.bind(params);
            const result = stmt.step() ? stmt.getAsObject() : null;
            stmt.free();
            return result;
        } catch (error) {
            console.error('SQL Error:', error.message);
            throw error;
        }
    };

    const all = (sql, params = []) => {
        try {
            const stmt = db.prepare(sql);
            stmt.bind(params);
            const results = [];
            while (stmt.step()) {
                results.push(stmt.getAsObject());
            }
            stmt.free();
            return results;
        } catch (error) {
            console.error('SQL Error:', error.message);
            throw error;
        }
    };

    return { db, run, get, all };
};

export const tenantMiddleware = async (req, res, next) => {
    try {
        await initSQL();

        // 1. Extract tenantId
        // Assuming req.user is populated by previous auth middleware
        const tenantId = req.user?.tenantId;

        if (!tenantId) {
            return res.status(400).json({ error: 'Tenant ID is missing from user context' });
        }

        // 2. Check cache
        if (tenantDbCache.has(tenantId)) {
            req.tenantDb = tenantDbCache.get(tenantId);
            return next();
        }

        // 3. Get connection details
        const connectionDetails = await getTenantConnectionDetails(tenantId);

        // 4. Establish connection
        // For SQL.js, we load the file.
        let db;
        if (existsSync(connectionDetails.dbPath)) {
            const buffer = readFileSync(connectionDetails.dbPath);
            db = new SQL.Database(buffer);
        } else {
            // Initialize new DB if not exists (or handle error)
            db = new SQL.Database();
            // You might want to run migrations here for a new tenant
        }

        // 5. Create wrappers and cache
        const dbContext = createDbWrappers(db, connectionDetails.dbPath);
        tenantDbCache.set(tenantId, dbContext);

        // 6. Attach to request
        req.tenantDb = dbContext;

        next();
    } catch (error) {
        console.error('Tenant Middleware Error:', error);
        res.status(500).json({ error: 'Failed to connect to tenant database' });
    }
};
