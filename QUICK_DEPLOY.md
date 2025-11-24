# Quick Deployment Guide

## 🎯 Fastest Way to Deploy

### Step 1: Deploy Backend (5 minutes)

**Using Railway:**
1. Go to [railway.app](https://railway.app) and sign in with GitHub
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repository
4. In Settings → Variables, add:
   ```
   NODE_ENV=production
   JWT_SECRET=<generate-random-string>
   CORS_ORIGIN=https://your-frontend.vercel.app
   ```
5. Copy the generated URL (e.g., `https://your-app.up.railway.app`)

**Using Render:**
1. Go to [render.com](https://render.com) and sign in with GitHub
2. Click "New +" → "Web Service"
3. Connect your repo
4. Set:
   - **Root Directory**: `server`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. Add environment variables (same as Railway)
6. Copy the generated URL

### Step 2: Deploy Frontend (3 minutes)

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click "New Project" → Import your repository
3. In Settings → Environment Variables, add:
   ```
   VITE_API_URL=https://your-backend-url.railway.app
   ```
   (Use the URL from Step 1)
4. Click "Redeploy" to apply changes

### Step 3: Update CORS (1 minute)

1. Go back to Railway/Render dashboard
2. Update `CORS_ORIGIN` to your Vercel frontend URL
3. Restart the service

### Step 4: Test (1 minute)

1. Visit your Vercel URL
2. Try logging in with: `admin@example.com` / `admin123`
3. If it works, you're done! 🎉

## ⚠️ Important Notes

- **Database**: Current setup uses SQLite which may not persist on free tiers. Consider upgrading or migrating to PostgreSQL for production.
- **Environment Variables**: Make sure to set strong `JWT_SECRET` values in production.
- **CORS**: Frontend and backend URLs must match exactly (including https://).

## 🆘 Troubleshooting

**CORS Errors?**
- Check that `CORS_ORIGIN` matches your frontend URL exactly
- No trailing slashes
- Include `https://`

**API Not Working?**
- Verify `VITE_API_URL` is set in Vercel
- Check backend logs in Railway/Render
- Test backend health: `https://your-backend-url/api/health`

**Can't Login?**
- Check backend is running
- Verify JWT_SECRET is set
- Check browser console for errors

## 📚 Full Documentation

For detailed deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md).

