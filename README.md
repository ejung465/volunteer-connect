# Volunteer Connect - Tutoring Management System

A comprehensive web application for managing a volunteer tutoring program for displaced refugee students. Features include profile management, progress tracking, volunteer-student matching, and administrative tools.

## 🌟 Features

### For Students (Refugees)
- Personal profile with photo, grade level, birthday, and bio
- Progress summary updated by volunteers
- Google Drive integration for scanned work files
- Session history showing which volunteers worked with them
- Workbook progress tracking for Math and Reading

### For Volunteers
- Dashboard with matched students
- Automatic volunteer hours logging
- Data visualization (pie charts) showing impact
- Access to student information and progress
- Session scheduling and availability management

### For Administrators
- Overview dashboard of all students and volunteers
- Session management and creation
- Attendance tracking
- Volunteer hour approval and logging
- Student-volunteer matching system

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation

1. **Install frontend dependencies:**
```bash
npm install
```

2. **Install backend dependencies:**
```bash
cd server
npm install
cd ..
```

3. **Set up environment variables:**
Copy `.env.example` to `.env` and update the values:
```bash
cp .env.example .env
```

### Running the Application

1. **Start the backend server:**
```bash
cd server
npm start
```
The server will run on http://localhost:3001

2. **Start the frontend (in a new terminal):**
```bash
npm run dev
```
The frontend will run on http://localhost:5173

3. **Access the application:**
Open your browser and navigate to http://localhost:5173

### Demo Accounts

Use these credentials to test different user roles:

- **Admin:** admin@example.com / admin123
- **Volunteer:** volunteer@example.com / volunteer123
- **Student:** student@example.com / student123

## 📁 Project Structure

```
volunteer-refugee-tutoring-app/
├── src/                      # Frontend source code
│   ├── components/          # React components
│   ├── contexts/            # React contexts (Auth)
│   ├── pages/               # Page components
│   ├── App.tsx              # Main app component
│   ├── main.tsx             # Entry point
│   └── index.css            # Global styles
├── server/                   # Backend source code
│   ├── routes/              # API routes
│   ├── middleware/          # Express middleware
│   ├── database.js          # Database setup
│   └── server.js            # Express server
├── index.html               # HTML entry point
├── package.json             # Frontend dependencies
└── README.md                # This file
```

## 🛠️ Technology Stack

### Frontend
- **React** with TypeScript
- **Vite** for fast development
- **React Router** for navigation
- **Recharts** for data visualization
- **Modern CSS** with custom design system

### Backend
- **Node.js** with Express
- **SQLite** database (better-sqlite3)
- **JWT** for authentication
- **bcryptjs** for password hashing

## 📊 Database Schema

The application uses SQLite with the following tables:
- `users` - User accounts with roles
- `students` - Student profiles
- `volunteers` - Volunteer profiles
- `sessions` - Weekly tutoring sessions
- `attendance` - Session attendance records
- `student_progress` - Math and Reading progress
- `volunteer_availability` - Volunteer scheduling

## 🔐 Security

- Passwords are hashed using bcryptjs
- JWT tokens for authentication
- Role-based access control
- Protected API routes

## 🎨 Design

The application features a modern, premium design with:
- Gradient color schemes
- Glassmorphism effects
- Smooth animations and transitions
- Responsive layout for all devices
- Data visualization with charts

## 📝 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Students
- `GET /api/students` - Get all students
- `GET /api/students/:id` - Get student by ID
- `GET /api/students/:id/progress` - Get student progress
- `GET /api/students/:id/sessions` - Get session history
- `PUT /api/students/:id/progress-summary` - Update progress summary

### Volunteers
- `GET /api/volunteers` - Get all volunteers
- `GET /api/volunteers/matched-students` - Get matched students
- `GET /api/volunteers/stats` - Get volunteer statistics
- `GET /api/volunteers/upcoming-sessions` - Get upcoming sessions

### Sessions
- `GET /api/sessions` - Get all sessions
- `POST /api/sessions` - Create new session (admin only)
- `GET /api/sessions/:id` - Get session details
- `POST /api/sessions/:id/attendance` - Record attendance (admin only)

## 🔮 Future Enhancements

- Google Drive API integration for file uploads
- Advanced matching algorithm
- Email notifications
- Mobile app version
- Report generation
- Multi-language support

## 📄 License

This project is created for educational and non-profit purposes.

## 🤝 Contributing

This is a volunteer management system for a refugee tutoring program. Contributions and suggestions are welcome!

## 🚀 Deployment

This application is ready for deployment! See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.

### Quick Deploy

**Frontend (Vercel):**
1. Push code to GitHub
2. Import project in Vercel
3. Set `VITE_API_URL` environment variable to your backend URL
4. Deploy!

**Backend (Railway/Render):**
1. Push code to GitHub
2. Create new project in Railway or Render
3. Set root directory to `server/`
4. Configure environment variables (see DEPLOYMENT.md)
5. Deploy!

### Environment Variables

**Frontend:**
- `VITE_API_URL` - Backend API URL (e.g., `https://your-backend.railway.app`)

**Backend:**
- `PORT` - Server port (default: 3001)
- `NODE_ENV` - Environment (production/development)
- `JWT_SECRET` - Secret key for JWT tokens
- `CORS_ORIGIN` - Frontend URL for CORS

See `.env.example` and `server/.env.example` for all available variables.

## 📧 Support

For questions or issues, please contact the administrator.
