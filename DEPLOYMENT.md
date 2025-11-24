# Deployment Guide

This guide will help you deploy the Volunteer Connect application to production.

## Architecture

The application consists of two parts:
- **Frontend**: React + TypeScript + Vite (deploy to Vercel)
- **Backend**: Node.js + Express + SQLite (deploy to Railway or Render)

## Prerequisites

1. GitHub account
2. Vercel account (for frontend)
3. Railway or Render account (for backend)
4. Environment variables configured

## Deployment Steps

### 1. Backend Deployment (Railway)

#### Option A: Railway

1. **Create Railway Account**
   - Go to [railway.app](https://railway.app)
   - Sign up with GitHub

2. **Deploy Backend**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository
   - Railway will detect the `server/` directory
   - Or manually set the root directory to `server/`

3. **Configure Environment Variables**
   - In Railway dashboard, go to Variables tab
   - Add the following:
     ```
     PORT=3001
     NODE_ENV=production
     JWT_SECRET=<generate-a-strong-secret>
     CORS_ORIGIN=https://your-frontend-domain.vercel.app
     ```
   - Railway will automatically assign a PORT, so you may not need to set it

4. **Get Backend URL**
   - Railway will provide a URL like: `https://your-app.up.railway.app`
   - Copy this URL for frontend configuration

#### Option B: Render

1. **Create Render Account**
   - Go to [render.com](https://render.com)
   - Sign up with GitHub

2. **Deploy Backend**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Configure:
     - **Name**: volunteer-connect-backend
     - **Root Directory**: server
     - **Environment**: Node
     - **Build Command**: `npm install`
     - **Start Command**: `npm start`

3. **Configure Environment Variables**
   - In Render dashboard, go to Environment tab
   - Add the same variables as Railway

4. **Get Backend URL**
   - Render will provide a URL like: `https://your-app.onrender.com`

### 2. Frontend Deployment (Vercel)

1. **Create Vercel Account**
   - Go to [vercel.com](https://vercel.com)
   - Sign up with GitHub

2. **Deploy Frontend**
   - Click "New Project"
   - Import your GitHub repository
   - Vercel will auto-detect Vite configuration

3. **Configure Environment Variables**
   - In Vercel dashboard, go to Settings → Environment Variables
   - Add:
     ```
     VITE_API_URL=https://your-backend-url.railway.app
     ```
   - Replace with your actual backend URL from Railway/Render

4. **Redeploy**
   - After adding environment variables, trigger a new deployment
   - Vercel will rebuild with the new API URL

### 3. Update CORS on Backend

After deploying the frontend, update the backend CORS_ORIGIN:
- Go to Railway/Render dashboard
- Update `CORS_ORIGIN` to your Vercel frontend URL
- Example: `https://your-app.vercel.app`

### 4. Database Considerations

⚠️ **Important**: The current setup uses SQLite with `sql.js`, which stores data in memory and saves to a file. This means:
- Data is ephemeral on Railway/Render free tiers
- For production, consider migrating to:
  - PostgreSQL (Railway/Render offer managed PostgreSQL)
  - Or use a persistent volume for SQLite

### 5. Verify Deployment

1. **Test Backend**
   - Visit: `https://your-backend-url.railway.app/api/health`
   - Should return: `{"status":"ok","message":"Server is running"}`

2. **Test Frontend**
   - Visit your Vercel URL
   - Try logging in with demo accounts
   - Verify API calls work

## Environment Variables Summary

### Frontend (Vercel)
```
VITE_API_URL=https://your-backend-url.railway.app
```

### Backend (Railway/Render)
```
PORT=3001 (or auto-assigned)
NODE_ENV=production
JWT_SECRET=<strong-random-secret>
CORS_ORIGIN=https://your-frontend.vercel.app
```

## Troubleshooting

### CORS Errors
- Ensure `CORS_ORIGIN` in backend matches your frontend URL exactly
- Include protocol (https://) and no trailing slash

### API Connection Issues
- Verify `VITE_API_URL` is set correctly in Vercel
- Check backend logs in Railway/Render dashboard
- Ensure backend is running and accessible

### Database Issues
- SQLite file may not persist on free tiers
- Consider upgrading to a paid plan or migrating to PostgreSQL

## Production Checklist

- [ ] Backend deployed and accessible
- [ ] Frontend deployed and accessible
- [ ] Environment variables configured
- [ ] CORS configured correctly
- [ ] Test login functionality
- [ ] Test API endpoints
- [ ] Update JWT_SECRET to a strong value
- [ ] Consider database migration for persistence
- [ ] Set up monitoring/logging
- [ ] Configure custom domains (optional)

## Custom Domains

### Vercel
- Go to Project Settings → Domains
- Add your custom domain
- Follow DNS configuration instructions

### Railway/Render
- Both platforms support custom domains
- Configure in project settings
- Update CORS_ORIGIN accordingly

## Support

For issues or questions:
1. Check platform-specific documentation
2. Review application logs
3. Verify environment variables
4. Test endpoints individually

