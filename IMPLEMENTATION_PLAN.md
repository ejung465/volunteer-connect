# UI/UX Improvements Implementation Plan

## Phase 1: Admin Dashboard Improvements ✓
- [ ] Fix text colors (make subtitle and button text more visible)
- [ ] Make stat cards clickable (redirect to filtered lists)
- [ ] Sort students and volunteers alphabetically
- [ ] Improve search box styling
- [ ] Fix session creation functionality
- [ ] Add session title with dropdown (Weekly Tutoring/Custom)
- [ ] Restructure header navigation (center tabs, add Members/Sessions/Volunteer Hours)
- [ ] Add member management with confirmation dialog
- [ ] Create volunteer hours tracking system with publish feature

## Phase 2: Volunteer Profile & Dashboard
- [ ] Add volunteer profile fields (name, grade, school, bio)
- [ ] Center navigation buttons in header
- [ ] Fix text visibility (make subtitles black)
- [ ] Add RSVP system for upcoming sessions (green/red checkmarks)
- [ ] Implement matched students pairing algorithm (most sessions first)
- [ ] Add attendance tracking for volunteers
- [ ] Allow manual student selection for sessions
- [ ] Update impact data based on actual attendance

## Phase 3: Student Dashboard & Profile
- [ ] Fix text visibility (make subtitles black)
- [ ] Center dashboard navigation
- [ ] Make "Student" badge clickable to open full profile
- [ ] Add profile editing capability for students
- [ ] Allow editing: grade, birthday, bio, profile picture
- [ ] Restrict editing: progress summary, workbook progress
- [ ] Restructure layout (progress/history top, workbook/drive bottom)
- [ ] Add "New Entry" button for volunteers to add progress
- [ ] Change workbook progress from percentages to number boxes
- [ ] Make workbook editable by admin/volunteers only
- [ ] Add profile picture upload for all user types

## Phase 4: Session & Attendance System
- [ ] Create session-student-volunteer matching system
- [ ] Track attendance per session
- [ ] Store session history with progress summaries
- [ ] Implement pairing algorithm (top 3 by session count, then random)
- [ ] Add manual override for volunteer-student pairing

## Phase 5: Backend API Endpoints Needed
- [ ] GET /api/volunteers/me (current volunteer data)
- [ ] PUT /api/volunteers/:id (update volunteer profile)
- [ ] GET /api/sessions/:id/attendance
- [ ] POST /api/sessions/:id/attendance (mark attendance)
- [ ] GET /api/sessions/:id/rsvp
- [ ] POST /api/sessions/:id/rsvp (volunteer RSVP)
- [ ] GET /api/students/:id/matched-volunteers
- [ ] POST /api/students/:id/progress (add progress entry)
- [ ] POST /api/upload/profile-picture (image upload)
- [ ] DELETE /api/users/:id (with confirmation)

---

## Starting with Phase 1: Admin Dashboard
Let's begin with the most critical fixes first.
