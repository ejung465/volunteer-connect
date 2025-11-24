# Localhost Configuration Example

## Quick Setup

### 1. Backend Configuration (`server/.env`)
```env
PORT=3001
NODE_ENV=development
JWT_SECRET=dev-secret-key-12345
CORS_ORIGIN=http://localhost:5173
```

### 2. Frontend Configuration (`.env.local`)

**Option A: Use Vite Proxy (Recommended)**
```env
# Leave empty - Vite proxy handles it automatically
VITE_API_URL=
```

**Option B: Explicit URL**
```env
VITE_API_URL=http://localhost:3001
```

### 3. Start Development Servers

**Terminal 1 - Backend:**
```bash
cd server
npm install
npm start
# Server running on http://localhost:3001
```

**Terminal 2 - Frontend:**
```bash
npm install
npm run dev
# Frontend running on http://localhost:5173
```

## How API Calls Work

### With Vite Proxy (VITE_API_URL empty):
```typescript
// Frontend makes: /api/students
// Vite proxy forwards to: http://localhost:3001/api/students
```

### With Explicit URL (VITE_API_URL=http://localhost:3001):
```typescript
// Frontend makes: http://localhost:3001/api/students
// Direct connection to backend
```

## Example API Usage

```typescript
import { api } from './utils/api';

// Login
const login = async () => {
  const data = await api.post('/api/auth/login', {
    email: 'admin@example.com',
    password: 'admin123'
  });
  console.log(data);
};

// Get students
const getStudents = async () => {
  const students = await api.get('/api/students');
  console.log(students);
};

// Update student progress
const updateProgress = async (studentId: number) => {
  await api.put(`/api/students/${studentId}/progress`, {
    progressSummary: 'Making great progress!'
  });
};
```

## Test Endpoints

```bash
# Health check
curl http://localhost:3001/api/health

# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}'
```

## Demo Accounts

- **Admin:** `admin@example.com` / `admin123`
- **Volunteer:** `volunteer@example.com` / `volunteer123`
- **Student:** `student@example.com` / `student123`

