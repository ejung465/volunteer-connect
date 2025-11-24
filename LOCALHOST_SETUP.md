# Localhost Development Setup

## Quick Start for Local Development

### Option 1: Using Vite Proxy (Recommended)

The Vite dev server is already configured with a proxy, so you don't need to set `VITE_API_URL` for localhost.

1. **Start the backend:**
   ```bash
   cd server
   npm install
   npm start
   ```
   Backend runs on: `http://localhost:3001`

2. **Start the frontend:**
   ```bash
   npm install
   npm run dev
   ```
   Frontend runs on: `http://localhost:5173`

3. **No .env file needed!** The Vite proxy automatically forwards `/api/*` requests to `http://localhost:3001`

### Option 2: Explicit API URL

If you want to explicitly set the API URL:

1. **Create `.env.local` file in the root:**
   ```env
   VITE_API_URL=http://localhost:3001
   ```

2. **Start both servers** (same as Option 1)

## Environment Variables

### Frontend (`.env.local` or `.env`)
```env
# Leave empty to use Vite proxy, or set explicitly:
VITE_API_URL=http://localhost:3001
```

### Backend (`server/.env`)
```env
PORT=3001
NODE_ENV=development
JWT_SECRET=dev-secret-key-change-in-production
CORS_ORIGIN=http://localhost:5173
```

## How It Works

### With Vite Proxy (Default)
- Frontend: `http://localhost:5173`
- API calls: `/api/auth/login` → Vite proxy → `http://localhost:3001/api/auth/login`
- No `VITE_API_URL` needed

### With Explicit URL
- Frontend: `http://localhost:5173`
- API calls: `http://localhost:3001/api/auth/login` (direct)
- Requires `VITE_API_URL=http://localhost:3001` in `.env.local`

## Testing

1. **Backend Health Check:**
   ```bash
   curl http://localhost:3001/api/health
   ```
   Should return: `{"status":"ok","message":"Server is running"}`

2. **Frontend:**
   - Open `http://localhost:5173`
   - Try logging in with: `admin@example.com` / `admin123`

## Troubleshooting

**CORS Errors?**
- Make sure `CORS_ORIGIN=http://localhost:5173` is set in `server/.env`
- Check backend is running on port 3001

**API Not Working?**
- Verify backend is running: `curl http://localhost:3001/api/health`
- Check browser console for errors
- Verify Vite proxy is working (check Network tab in DevTools)

**Port Already in Use?**
- Change `PORT` in `server/.env` to a different port
- Update `VITE_API_URL` accordingly
- Or update Vite proxy target in `vite.config.ts`

## Example API Calls

The API utility automatically handles localhost:

```typescript
import { api } from './utils/api';

// GET request
const students = await api.get('/api/students');

// POST request
const result = await api.post('/api/auth/login', {
  email: 'admin@example.com',
  password: 'admin123'
});

// PUT request
await api.put('/api/students/1/progress', {
  progressSummary: 'Updated summary'
});
```

All requests will automatically:
- Use `http://localhost:3001` if `VITE_API_URL` is set
- Or use relative paths (via Vite proxy) if `VITE_API_URL` is empty

