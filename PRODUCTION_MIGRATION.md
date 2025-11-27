# Production Migration Checklist

## 🎯 Overview

This checklist will guide you through migrating your multi-tenant application from development (SQLite) to production (PostgreSQL + Cloud hosting).

---

## Phase 1: Database Migration (SQLite → PostgreSQL)

### ✅ Step 1: Set Up PostgreSQL

- [ ] **Install PostgreSQL** (or use managed service like AWS RDS, Google Cloud SQL, or Supabase)
- [ ] **Create Master Database** for tenant registry
  ```sql
  CREATE DATABASE volunteer_connect_master;
  ```
- [ ] **Create Tenants Table** in master database
  ```sql
  CREATE TABLE tenants (
    id SERIAL PRIMARY KEY,
    tenant_id VARCHAR(50) UNIQUE NOT NULL,
    tenant_name VARCHAR(255) NOT NULL,
    db_name VARCHAR(100) NOT NULL,
    db_host VARCHAR(255) NOT NULL,
    db_port INTEGER DEFAULT 5432,
    db_user VARCHAR(100) NOT NULL,
    db_password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true
  );
  ```

### ✅ Step 2: Update Tenant Registry

- [ ] **Install PostgreSQL client**
  ```bash
  cd server
  npm install pg
  ```

- [ ] **Update `server/tenantRegistry.js`**
  ```javascript
  import { Pool } from 'pg';

  const masterDb = new Pool({
    host: process.env.MASTER_DB_HOST,
    port: process.env.MASTER_DB_PORT || 5432,
    database: process.env.MASTER_DB_NAME,
    user: process.env.MASTER_DB_USER,
    password: process.env.MASTER_DB_PASSWORD,
  });

  export const getTenantConnectionDetails = async (tenantId) => {
    const result = await masterDb.query(
      'SELECT * FROM tenants WHERE tenant_id = $1 AND is_active = true',
      [tenantId]
    );
    
    if (!result.rows[0]) {
      throw new Error(`Tenant ${tenantId} not found or inactive`);
    }
    
    return {
      host: result.rows[0].db_host,
      port: result.rows[0].db_port,
      database: result.rows[0].db_name,
      user: result.rows[0].db_user,
      password: result.rows[0].db_password,
    };
  };
  ```

### ✅ Step 3: Update Tenant Middleware

- [ ] **Modify `server/tenantMiddleware.js`** to use PostgreSQL
  ```javascript
  import { Pool } from 'pg';

  const tenantDbCache = new Map();

  export const tenantMiddleware = async (req, res, next) => {
    try {
      const tenantId = req.user?.tenantId;
      
      if (!tenantId) {
        return res.status(400).json({ error: 'Tenant ID missing' });
      }

      if (tenantDbCache.has(tenantId)) {
        req.tenantDb = tenantDbCache.get(tenantId);
        return next();
      }

      const connectionDetails = await getTenantConnectionDetails(tenantId);
      
      const pool = new Pool(connectionDetails);
      
      const dbContext = {
        query: (text, params) => pool.query(text, params),
        get: async (text, params) => {
          const result = await pool.query(text, params);
          return result.rows[0] || null;
        },
        all: async (text, params) => {
          const result = await pool.query(text, params);
          return result.rows;
        },
        run: async (text, params) => {
          await pool.query(text, params);
        }
      };

      tenantDbCache.set(tenantId, dbContext);
      req.tenantDb = dbContext;
      
      next();
    } catch (error) {
      console.error('Tenant Middleware Error:', error);
      res.status(500).json({ error: 'Failed to connect to tenant database' });
    }
  };
  ```

### ✅ Step 4: Update Database Schema

- [ ] **Modify `server/utils/dbSchema.js`** for PostgreSQL syntax
  - Change `AUTOINCREMENT` → `SERIAL`
  - Change `DATETIME` → `TIMESTAMP`
  - Update SQL syntax as needed

---

## Phase 2: Environment Configuration

### ✅ Step 1: Environment Variables

- [ ] **Create `.env` file** in server directory
  ```env
  # Master Database (Tenant Registry)
  MASTER_DB_HOST=your-db-host.com
  MASTER_DB_PORT=5432
  MASTER_DB_NAME=volunteer_connect_master
  MASTER_DB_USER=master_user
  MASTER_DB_PASSWORD=secure_password

  # Application
  NODE_ENV=production
  PORT=3001
  JWT_SECRET=your-super-secure-jwt-secret-change-this
  CORS_ORIGIN=https://yourapp.com

  # Optional: Google Drive/Sheets
  GOOGLE_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
  GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
  ```

- [ ] **Add `.env` to `.gitignore`**
  ```
  .env
  .env.local
  .env.production
  ```

### ✅ Step 2: Update package.json

- [ ] **Add production dependencies**
  ```json
  {
    "dependencies": {
      "pg": "^8.11.0",
      "dotenv": "^16.4.1",
      "helmet": "^7.1.0",
      "express-rate-limit": "^7.1.5"
    }
  }
  ```

- [ ] **Install dependencies**
  ```bash
  npm install
  ```

---

## Phase 3: DNS & Subdomain Setup

### ✅ Step 1: Configure DNS

- [ ] **Set up wildcard DNS** or individual subdomains
  ```
  Type: A Record
  Name: *
  Value: YOUR_SERVER_IP
  TTL: 3600
  ```

- [ ] **Or add specific subdomains**
  ```
  tenant-a.yourapp.com → YOUR_SERVER_IP
  tenant-b.yourapp.com → YOUR_SERVER_IP
  demo.yourapp.com → YOUR_SERVER_IP
  ```

### ✅ Step 2: SSL/HTTPS

- [ ] **Obtain SSL certificate** (Let's Encrypt recommended)
  ```bash
  # Using Certbot
  sudo certbot --nginx -d yourapp.com -d *.yourapp.com
  ```

- [ ] **Configure auto-renewal**
  ```bash
  sudo certbot renew --dry-run
  ```

---

## Phase 4: Security Hardening

### ✅ Step 1: Add Security Middleware

- [ ] **Update `server/server.js`**
  ```javascript
  import helmet from 'helmet';
  import rateLimit from 'express-rate-limit';

  // Security headers
  app.use(helmet());

  // Rate limiting
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP'
  });
  app.use('/api/', limiter);

  // Stricter rate limit for auth
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: 'Too many login attempts'
  });
  app.use('/api/auth/', authLimiter);
  ```

### ✅ Step 2: Update CORS

- [ ] **Configure production CORS**
  ```javascript
  const corsOptions = {
    origin: process.env.CORS_ORIGIN || 'https://yourapp.com',
    credentials: true,
    optionsSuccessStatus: 200
  };
  app.use(cors(corsOptions));
  ```

### ✅ Step 3: Secure JWT

- [ ] **Generate strong JWT secret**
  ```bash
  node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
  ```
- [ ] **Update JWT_SECRET in .env**

---

## Phase 5: Deployment

### ✅ Option A: Cloud Run (Google Cloud)

- [ ] **Create Dockerfile** (already exists)
- [ ] **Build and push image**
  ```bash
  gcloud builds submit --tag gcr.io/PROJECT_ID/volunteer-connect
  ```
- [ ] **Deploy to Cloud Run**
  ```bash
  gcloud run deploy volunteer-connect \
    --image gcr.io/PROJECT_ID/volunteer-connect \
    --platform managed \
    --region us-central1 \
    --allow-unauthenticated
  ```

### ✅ Option B: Railway

- [ ] **Connect GitHub repository**
- [ ] **Add environment variables** in Railway dashboard
- [ ] **Deploy** (automatic on push)

### ✅ Option C: AWS/DigitalOcean/etc.

- [ ] **Set up server** (Ubuntu recommended)
- [ ] **Install Node.js and PM2**
  ```bash
  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
  sudo apt-get install -y nodejs
  sudo npm install -g pm2
  ```
- [ ] **Clone repository and install**
  ```bash
  git clone your-repo
  cd volunteer-connect/server
  npm install --production
  ```
- [ ] **Start with PM2**
  ```bash
  pm2 start server.js --name volunteer-connect
  pm2 save
  pm2 startup
  ```

---

## Phase 6: Frontend Deployment

### ✅ Step 1: Build Frontend

- [ ] **Update API URL** in `src/utils/api.ts`
  ```typescript
  const API_URL = process.env.VITE_API_URL || 'https://api.yourapp.com';
  ```

- [ ] **Build production bundle**
  ```bash
  npm run build
  ```

### ✅ Step 2: Deploy to Hosting

#### Firebase Hosting
```bash
firebase deploy
```

#### Vercel
```bash
vercel --prod
```

#### Netlify
```bash
netlify deploy --prod
```

---

## Phase 7: Monitoring & Logging

### ✅ Step 1: Add Logging

- [ ] **Install Winston**
  ```bash
  npm install winston
  ```

- [ ] **Configure logging**
  ```javascript
  import winston from 'winston';

  const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [
      new winston.transports.File({ filename: 'error.log', level: 'error' }),
      new winston.transports.File({ filename: 'combined.log' })
    ]
  });
  ```

### ✅ Step 2: Set Up Monitoring

- [ ] **Choose monitoring service**
  - [ ] Google Cloud Monitoring
  - [ ] Datadog
  - [ ] New Relic
  - [ ] Sentry (for error tracking)

- [ ] **Configure alerts** for:
  - [ ] Server downtime
  - [ ] High error rates
  - [ ] Database connection issues
  - [ ] High CPU/memory usage

---

## Phase 8: Backup Strategy

### ✅ Step 1: Database Backups

- [ ] **Set up automated backups** for master database
- [ ] **Set up automated backups** for each tenant database
- [ ] **Test restore procedure**
- [ ] **Document backup retention policy**

### ✅ Step 2: Application Backups

- [ ] **Set up Git repository backups**
- [ ] **Document deployment rollback procedure**

---

## Phase 9: Testing

### ✅ Pre-Launch Testing

- [ ] **Test tenant isolation** in production environment
- [ ] **Load testing** with multiple concurrent tenants
- [ ] **Security audit** (penetration testing)
- [ ] **Test backup/restore procedures**
- [ ] **Test SSL certificates**
- [ ] **Test subdomain routing**
- [ ] **Test all API endpoints**

### ✅ User Acceptance Testing

- [ ] **Create test tenant accounts**
- [ ] **Test complete user workflows**
- [ ] **Test on multiple devices/browsers**
- [ ] **Verify email notifications** (if applicable)

---

## Phase 10: Launch

### ✅ Pre-Launch

- [ ] **Final security review**
- [ ] **Update documentation**
- [ ] **Prepare support resources**
- [ ] **Set up monitoring dashboards**

### ✅ Launch Day

- [ ] **Deploy to production**
- [ ] **Verify all services running**
- [ ] **Monitor logs for errors**
- [ ] **Test critical paths**
- [ ] **Announce launch**

### ✅ Post-Launch

- [ ] **Monitor performance metrics**
- [ ] **Respond to user feedback**
- [ ] **Fix any critical bugs**
- [ ] **Plan next iteration**

---

## 📋 Quick Reference

### Production URLs
- **Frontend**: https://yourapp.com
- **API**: https://api.yourapp.com
- **Tenant A**: https://tenant-a.yourapp.com
- **Tenant B**: https://tenant-b.yourapp.com

### Key Contacts
- **Database Admin**: _______________
- **DevOps**: _______________
- **Security**: _______________

### Emergency Procedures
1. **Server Down**: _______________
2. **Database Issues**: _______________
3. **Security Incident**: _______________

---

## ✅ Final Checklist

Before going live, ensure:

- [ ] All environment variables set correctly
- [ ] SSL certificates installed and valid
- [ ] Database backups configured
- [ ] Monitoring and alerts active
- [ ] Rate limiting enabled
- [ ] Security headers configured
- [ ] CORS properly configured
- [ ] Error logging working
- [ ] All tests passing
- [ ] Documentation up to date
- [ ] Support team trained
- [ ] Rollback plan documented

---

**🎉 Ready for Production!**

Once all items are checked, your multi-tenant SaaS application is ready to serve customers at scale!
