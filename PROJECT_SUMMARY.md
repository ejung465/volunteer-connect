# Volunteer Connect - Project Summary & Handoff Document

**Date:** November 24, 2025
**Project Name:** Volunteer Connect
**Description:** A full-stack web application for managing volunteer-refugee tutoring programs.

---

## 1. Project Overview

**Volunteer Connect** is a management platform designed to streamline the operations of a volunteer tutoring program for refugee students. It facilitates:
*   **Student Management:** Tracking student profiles, academic progress, and session history.
*   **Volunteer Management:** Managing volunteer profiles, availability, and hours logged.
*   **Session Tracking:** Recording attendance, session notes, and hours for reporting.
*   **Matching:** An algorithm to suggest optimal volunteer-student pairs based on history and availability.
*   **Reporting:** Integration with Google Sheets for data export and visualization.

---

## 2. Technology Stack

### Frontend
*   **Framework:** React (v18) with TypeScript
*   **Build Tool:** Vite
*   **Styling:** Vanilla CSS (with custom design system variables)
*   **Routing:** React Router DOM (v6)
*   **Charts:** Recharts (for data visualization)
*   **State Management:** React Context API (`AuthContext`)

### Backend
*   **Runtime:** Node.js
*   **Framework:** Express.js
*   **Database:** `sql.js` (SQLite in-memory/file-based)
*   **Authentication:** JSON Web Tokens (JWT) with `bcryptjs` for password hashing
*   **API Style:** RESTful API

### Integrations
*   **Google Sheets API:** For syncing user reports (via `googleapis` npm package).
*   **Google Drive API:** Placeholder structure for file storage.

---

## 3. Development History (Chronological)

### Phase 1: Initialization & Foundation
1.  **Project Setup:** Initialized a Vite + React + TypeScript project.
2.  **Backend Setup:** Created a Node.js/Express server structure.
3.  **Database Design:** Implemented a relational schema using `sql.js` with tables for `users`, `students`, `volunteers`, `sessions`, `attendance`, and `student_progress`.
4.  **Authentication:** Built a secure auth system with login/register endpoints, JWT generation, and protected frontend routes.

### Phase 2: Core Features
5.  **Role-Based Access:** Implemented distinct dashboards for `admin`, `volunteer`, and `student` roles.
6.  **Student Profiles:** Created detailed profile views with editable fields (bio, grade, progress).
7.  **Volunteer Profiles:** Added availability toggles and stats tracking (total hours).
8.  **Matching Algorithm:** Developed a backend utility to suggest volunteer-student pairs based on interaction frequency.

### Phase 3: Admin Dashboard & Reporting
9.  **Admin Dashboard:** Built a comprehensive dashboard to view all users and sessions.
10. **Session Management:** Added functionality to create sessions and log attendance.
11. **Google Sheets Sync:** Integrated a backend utility to push user data to a Google Sheet for reporting.
12. **UI Polishing:** Enhanced the Admin Dashboard with search filters, "Show More/Less" toggles, and improved layout.

### Phase 4: Debugging & Refinement
13. **Blank Page Fix:** Resolved a critical rendering issue caused by a mismatch between backend `snake_case` responses and frontend `camelCase` expectations.
    *   *Fix:* Updated SQL queries in `server/routes/students.js`, `volunteers.js`, and `sessions.js` to alias columns (e.g., `first_name as firstName`).
14. **Deployment Prep:** Configured the project for deployment (Git initialization, `.gitignore`, `Dockerfile`).

---

## 4. Current State

### Features Implemented
*   **Authentication:** Login/Logout with role redirection.
*   **Admin Dashboard:**
    *   List/Search Students & Volunteers.
    *   Create new Users (Student/Volunteer).
    *   Create/View Sessions.
    *   View recent activity.
*   **Volunteer Dashboard:**
    *   View upcoming sessions.
    *   View matched students.
    *   Track logged hours.
*   **Student Dashboard:**
    *   View own profile and progress.
    *   View session history.
*   **Data Persistence:** Data is saved to `server/database.sqlite`.

### Known Limitations / To-Do
*   **Database:** Currently using `sql.js` which writes to a local file. For scalable cloud deployment, migration to a persistent database (like PostgreSQL or a persistent SQLite volume) is recommended.
*   **Google Drive:** The integration is currently a placeholder; needs real API credentials to function.
*   **Error Handling:** Basic error boundaries exist, but more granular UI feedback for API errors could be added.

---

## 5. Project Structure

```
/
├── dist/                   # Built frontend assets
├── server/                 # Backend code
│   ├── middleware/         # Auth middleware
│   ├── routes/             # API endpoints (auth, students, volunteers, etc.)
│   ├── utils/              # Helpers (matching, googleSheets, database)
│   ├── database.js         # Database connection & schema
│   └── server.js           # Entry point
├── src/                    # Frontend code
│   ├── components/         # Reusable UI components
│   ├── contexts/           # Global state (AuthContext)
│   ├── pages/              # Page views (AdminDashboard, Login, etc.)
│   ├── utils/              # Frontend helpers (api.ts)
│   ├── App.tsx             # Main router
│   └── main.tsx            # Entry point
├── Dockerfile              # Deployment configuration
├── package.json            # Frontend dependencies
└── vite.config.ts          # Vite configuration
```

---

## 6. How to Run Locally

1.  **Install Dependencies:**
    ```bash
    npm install
    cd server && npm install
    ```
2.  **Start Backend:**
    ```bash
    # In a separate terminal
    cd server
    node server.js
    ```
3.  **Start Frontend:**
    ```bash
    # In the root directory
    npm run dev
    ```
4.  **Access App:** Open `http://localhost:5173`

---

## 7. Deployment Guide (Railway)

1.  **Push to GitHub:** Ensure the code is in a GitHub repository.
2.  **Create Railway Project:** Connect your GitHub repo to Railway.
3.  **Set Environment Variables:**
    *   `JWT_SECRET`: A random string.
    *   `GOOGLE_SPREADSHEET_ID`: ID of your reporting sheet.
    *   `GOOGLE_SERVICE_ACCOUNT_JSON`: Base64 encoded credentials (if using Sheets).
4.  **Deploy:** Railway will auto-detect the `Dockerfile` and build the app.

---

## 8. Debugging Tips for AI Assistants

If you are an AI assisting with this project:
*   **API Casing:** Always check that backend SQL queries alias columns to `camelCase` to match frontend interfaces.
*   **Database:** The `database.js` file initializes the schema. If you change the schema, delete `server/database.sqlite` to trigger a rebuild (data will be lost).
*   **Authentication:** The `AuthContext` handles the JWT token. If login fails, check the `Authorization` header in network requests.
