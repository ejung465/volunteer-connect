# Multi-Tenant Quick Reference

## 🚀 Quick Start

### Start Development Environment
```bash
# Terminal 1 - Backend
cd server
node server.js

# Terminal 2 - Frontend  
npm run dev
```

### Access Different Tenants
- **Tenant A**: http://localhost:5173/?tenant=tenant-a
- **Tenant B**: http://localhost:5173/?tenant=tenant-b
- **Custom**: http://localhost:5173/?tenant=YOUR_TENANT_ID

## 🔑 Key Concepts

### Tenant ID Flow
```
URL → Frontend → Login Request → JWT Token → All API Requests → Correct Database
```

### Request Lifecycle
1. User visits `?tenant=acme`
2. Frontend extracts `acme`
3. Login sends `{ email, password, tenantId: 'acme' }`
4. Backend returns JWT with `tenantId: 'acme'`
5. All requests use this token
6. Middleware routes to `acme.sqlite`

## 📁 Key Files

| File | Purpose |
|------|---------|
| `server/tenantRegistry.js` | Maps tenant IDs to databases |
| `server/tenantMiddleware.js` | Routes requests to correct DB |
| `server/utils/dbSchema.js` | Creates tables for new tenants |
| `src/utils/tenantUtils.ts` | Extracts tenant from URL |

## 🛠️ Common Tasks

### Add a New Tenant

1. **Add to registry** (`server/tenantRegistry.js`):
```javascript
'newclient': {
    id: 'newclient',
    name: 'New Client Org',
    dbPath: join(__dirname, 'newclient.sqlite')
}
```

2. **Register first user**:
```bash
# Visit: http://localhost:5173/?tenant=newclient
# Or use API:
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@newclient.com",
    "password": "password123",
    "role": "admin",
    "firstName": "Admin",
    "lastName": "User",
    "tenantId": "newclient"
  }'
```

3. **Done!** Database auto-created and initialized.

### Test Tenant Isolation

```bash
cd server
node test-multi-tenant.js
```

### Check Which Tenant You're Using

Look at the login page - it displays: **"Tenant: TENANT-A"**

## 🔍 Debugging

### Check JWT Token Contents
```javascript
// In browser console:
const token = localStorage.getItem('token');
const payload = JSON.parse(atob(token.split('.')[1]));
console.log('Tenant ID:', payload.tenantId);
```

### Verify Database Files
```bash
# List all tenant databases
ls server/*.sqlite

# Should see:
# tenant_a.sqlite
# tenant_b.sqlite
# etc.
```

### Common Issues

| Problem | Solution |
|---------|----------|
| "Tenant not found" | Add tenant to `tenantRegistry.js` |
| Wrong data showing | Clear localStorage and re-login |
| Database not created | Check write permissions in `server/` |

## 📊 Architecture Diagram

```
┌──────────────┐
│   Browser    │  ?tenant=acme
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  Frontend    │  getTenantIdFromUrl() → 'acme'
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Auth Endpoint│  { email, password, tenantId: 'acme' }
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ JWT Token    │  { id, email, role, tenantId: 'acme' }
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ API Request  │  Authorization: Bearer TOKEN
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Middleware   │  req.user.tenantId → 'acme'
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ tenantDb     │  req.tenantDb → acme.sqlite
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Controller   │  req.tenantDb.all('SELECT * FROM students')
└──────────────┘
```

## 🎯 Production Checklist

- [ ] Replace SQLite with PostgreSQL
- [ ] Update `tenantRegistry.js` to use master DB
- [ ] Set up subdomain DNS (*.yourapp.com)
- [ ] Configure HTTPS/SSL
- [ ] Add rate limiting
- [ ] Set up automated backups
- [ ] Implement monitoring
- [ ] Add audit logging

## 📚 Documentation

- **Full Guide**: `MULTI_TENANT_GUIDE.md`
- **Summary**: `MULTI_TENANT_SUMMARY.md`
- **This File**: `MULTI_TENANT_QUICK_REF.md`

## 🧪 Test Commands

```bash
# Test multi-tenant isolation
node server/test-multi-tenant.js

# Start server
node server/server.js

# Start frontend
npm run dev

# Register new user
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"pass123","role":"admin","firstName":"Test","lastName":"User","tenantId":"tenant-a"}'

# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"pass123","tenantId":"tenant-a"}'
```

## 💡 Tips

1. **Always specify tenant ID** in login/register requests
2. **Use query params** for local dev: `?tenant=xxx`
3. **Use subdomains** for production: `xxx.yourapp.com`
4. **Check browser console** for tenant ID confirmation
5. **Clear localStorage** if switching tenants frequently

---

**Need Help?** Check `MULTI_TENANT_GUIDE.md` for detailed troubleshooting.
