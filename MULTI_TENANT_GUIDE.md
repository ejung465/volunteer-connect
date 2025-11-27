# Multi-Tenant SaaS Architecture Guide

## Overview

Your Volunteer Connect application has been successfully converted to a **Multi-Tenant SaaS architecture** using the **Database-Per-Tenant** model. This means each client organization gets their own isolated database, ensuring complete data separation and security.

## Architecture Components

### Backend Components

1. **`server/tenantRegistry.js`**
   - Maintains a registry of all tenants and their database connection details
   - Currently uses an in-memory mock registry (replace with a real master database in production)
   - Maps tenant IDs to their specific database file paths

2. **`server/tenantMiddleware.js`**
   - Express middleware that runs on every protected API request
   - Extracts the `tenantId` from the JWT token
   - Establishes or retrieves a cached connection to the tenant's database
   - Attaches the database connection to `req.tenantDb`

3. **`server/utils/dbSchema.js`**
   - Contains database initialization logic (`initializeDatabase`)
   - Contains optional seeding logic (`seedInitialData`)
   - Automatically creates all necessary tables for new tenants

4. **`server/routes/auth.js`**
   - Handles login and registration
   - Accepts `tenantId` in the request body
   - Automatically initializes new tenant databases on first registration
   - Includes `tenantId` in the JWT token payload

5. **All Route Controllers**
   - Refactored to use `req.tenantDb` instead of a global database
   - No longer import the old `database.js` file
   - Each request automatically uses the correct tenant's database

### Frontend Components

1. **`src/utils/tenantUtils.ts`**
   - Utility function to extract tenant ID from the URL
   - Supports both subdomain routing (production) and query parameters (development)

2. **`src/contexts/AuthContext.tsx`**
   - Updated to include `tenantId` in login requests
   - Automatically detects the tenant from the URL

3. **`src/components/Login.tsx`**
   - Displays the current tenant ID to the user
   - No manual tenant selection required

## How It Works

### Authentication Flow

1. User visits the application (e.g., `http://localhost:5173/?tenant=tenant-a`)
2. Frontend extracts `tenant-a` from the URL
3. User enters email and password
4. Frontend sends login request with `{ email, password, tenantId: 'tenant-a' }`
5. Backend validates credentials against `tenant-a`'s database
6. Backend returns JWT token containing `{ id, email, role, tenantId }`
7. All subsequent API requests use this token

### Request Flow

1. User makes an API request (e.g., GET `/api/students`)
2. `authenticateToken` middleware verifies the JWT and sets `req.user`
3. `tenantMiddleware` reads `req.user.tenantId` and connects to that tenant's database
4. `tenantMiddleware` attaches the connection to `req.tenantDb`
5. Route controller uses `req.tenantDb.all()`, `req.tenantDb.get()`, etc.
6. Response is sent back with data from the correct tenant's database

### New Tenant Onboarding

1. New organization wants to use your app (e.g., "Acme Volunteers")
2. Add entry to `tenantRegistry.js`:
   ```javascript
   'acme': {
       id: 'acme',
       name: 'Acme Volunteers',
       dbPath: join(__dirname, 'acme.sqlite')
   }
   ```
3. First user registers at `http://yourapp.com/?tenant=acme`
4. Backend automatically:
   - Creates `acme.sqlite`
   - Runs `initializeDatabase()` to create all tables
   - Creates the first user account
5. Organization is ready to use the app!

## Testing Locally

### Test with Different Tenants

1. **Start the server:**
   ```bash
   cd server
   node server.js
   ```

2. **Start the frontend:**
   ```bash
   npm run dev
   ```

3. **Test Tenant A:**
   - Visit: `http://localhost:5173/?tenant=tenant-a`
   - Register a new user or login with existing credentials
   - All data will be stored in `server/tenant_a.sqlite`

4. **Test Tenant B:**
   - Visit: `http://localhost:5173/?tenant=tenant-b`
   - Register a new user
   - All data will be stored in `server/tenant_b.sqlite`
   - **Data is completely isolated** - Tenant B cannot see Tenant A's data

5. **Verify Isolation:**
   - Create a student in Tenant A
   - Switch to Tenant B (`?tenant=tenant-b`)
   - The student list will be empty (or show only Tenant B's students)

### Testing Registration Flow

```bash
# Register first user for a new tenant
POST http://localhost:3001/api/auth/register
Content-Type: application/json

{
  "email": "admin@neworg.com",
  "password": "secure123",
  "role": "admin",
  "firstName": "John",
  "lastName": "Doe",
  "tenantId": "neworg"
}
```

**Important:** Before testing, add `neworg` to `tenantRegistry.js`:
```javascript
'neworg': {
    id: 'neworg',
    name: 'New Organization',
    dbPath: join(__dirname, 'neworg.sqlite')
}
```

## Production Deployment

### Subdomain Routing

For production, you'll want to use subdomains instead of query parameters:

1. **DNS Setup:**
   - Configure wildcard DNS: `*.yourapp.com` → Your server IP
   - Or add specific subdomains: `acme.yourapp.com`, `demo.yourapp.com`

2. **Frontend Update:**
   The `getTenantIdFromUrl()` function already supports this:
   ```typescript
   // Production: tenant-a.yourapp.com → returns 'tenant-a'
   // Development: localhost:5173/?tenant=tenant-a → returns 'tenant-a'
   ```

3. **No code changes needed!** The utility automatically detects the environment.

### Master Database

Replace the mock registry in `tenantRegistry.js` with a real database:

```javascript
import { Pool } from 'pg'; // or your preferred DB

const masterDb = new Pool({
    connectionString: process.env.MASTER_DB_URL
});

export const getTenantConnectionDetails = async (tenantId) => {
    const result = await masterDb.query(
        'SELECT db_host, db_name, db_user, db_password FROM tenants WHERE tenant_id = $1',
        [tenantId]
    );
    
    if (!result.rows[0]) {
        throw new Error(`Tenant ${tenantId} not found`);
    }
    
    return result.rows[0];
};
```

### Database Recommendations

For production, consider migrating from SQLite to PostgreSQL:

1. **Why PostgreSQL?**
   - Better concurrency
   - More robust for production workloads
   - Native support for connection pooling
   - Better backup and replication options

2. **Migration Path:**
   - Update `tenantMiddleware.js` to use `pg` instead of `sql.js`
   - Update `dbSchema.js` to use PostgreSQL syntax
   - Each tenant gets their own PostgreSQL database (not just a file)

## Security Considerations

✅ **Implemented:**
- Tenant isolation at the database level
- JWT tokens include tenant ID
- Middleware validates tenant access on every request
- No cross-tenant data leakage possible

⚠️ **Additional Recommendations:**
1. **Rate Limiting:** Add per-tenant rate limiting
2. **Audit Logging:** Log all tenant access for compliance
3. **Backup Strategy:** Implement automated per-tenant backups
4. **Encryption:** Encrypt sensitive data at rest
5. **HTTPS Only:** Enforce HTTPS in production

## Troubleshooting

### "Tenant database not initialized"
- **Cause:** Tenant ID not in registry
- **Fix:** Add tenant to `tenantRegistry.js`

### "Cannot find name 'getTenantIdFromUrl'"
- **Cause:** Missing import
- **Fix:** Add `import { getTenantIdFromUrl } from '../utils/tenantUtils';`

### Data showing from wrong tenant
- **Cause:** Token contains old tenant ID
- **Fix:** Log out and log back in to get new token

### Database file not created
- **Cause:** Permissions issue or path error
- **Fix:** Check server has write permissions to the directory

## Next Steps

1. **Add Tenant Management UI:**
   - Admin panel to create new tenants
   - Tenant settings and configuration

2. **Implement Billing:**
   - Track usage per tenant
   - Integrate with Stripe/payment processor

3. **Add Tenant Customization:**
   - Custom branding per tenant
   - Configurable features

4. **Monitoring & Analytics:**
   - Per-tenant usage metrics
   - Performance monitoring

5. **Backup & Recovery:**
   - Automated tenant database backups
   - Point-in-time recovery

## Support

For questions or issues with the multi-tenant implementation, refer to:
- Backend code: `server/tenantMiddleware.js`
- Frontend code: `src/utils/tenantUtils.ts`
- Database schema: `server/utils/dbSchema.js`
