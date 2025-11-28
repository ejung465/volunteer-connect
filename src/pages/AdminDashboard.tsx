import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../utils/api';

interface Student {
    id: number;
    firstName: string;
    lastName: string;
    photoUrl?: string;
    gradeLevel: number;
    progressSummary?: string;
}

interface Volunteer {
    id: number;
    firstName: string;
    lastName: string;
    totalHours: number;
}

interface Session {
    id: number;
    sessionDate: string;
    attendanceCount: number;
}

const AdminDashboard: React.FC = () => {
    const [students, setStudents] = useState<Student[]>([]);
    const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
    const [sessions, setSessions] = useState<Session[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showCreateSession, setShowCreateSession] = useState(false);
    const [newSessionDate, setNewSessionDate] = useState('');
    const [showCreateUser, setShowCreateUser] = useState(false);
    const [newUser, setNewUser] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        role: 'volunteer',
        gradeLevel: 1,
        bio: ''
    });

    // Search and filter states
    const [studentSearch, setStudentSearch] = useState('');
    const [volunteerSearch, setVolunteerSearch] = useState('');
    const [showAllStudents, setShowAllStudents] = useState(false);
    const [showAllVolunteers, setShowAllVolunteers] = useState(false);
    const [showAllSessions, setShowAllSessions] = useState(false);
    const [viewFilter, setViewFilter] = useState<'all' | 'students' | 'volunteers' | 'sessions'>('all');

    // Derived state for filtered lists
    const filteredStudents = students
        .filter(s =>
            `${s.firstName} ${s.lastName}`.toLowerCase().includes(studentSearch.toLowerCase())
        )
        .sort((a, b) => `${a.lastName} ${a.firstName}`.localeCompare(`${b.lastName} ${b.firstName}`));

    const filteredVolunteers = volunteers
        .filter(v =>
            `${v.firstName} ${v.lastName}`.toLowerCase().includes(volunteerSearch.toLowerCase())
        )
        .sort((a, b) => `${a.lastName} ${a.firstName}`.localeCompare(`${b.lastName} ${b.firstName}`));

    const displayedStudents = showAllStudents ? filteredStudents : filteredStudents.slice(0, 6);
    const displayedVolunteers = showAllVolunteers ? filteredVolunteers : filteredVolunteers.slice(0, 6);
    const displayedSessions = showAllSessions ? sessions : sessions.slice(0, 6);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            // Fetch students, volunteers, and sessions
            const [students, volunteers, sessions] = await Promise.all([
                api.get('/api/students').catch(() => []),
                api.get('/api/volunteers').catch(() => []),
                api.get('/api/sessions').catch(() => []),
            ]);

            setStudents(Array.isArray(students) ? students : []);
            setVolunteers(Array.isArray(volunteers) ? volunteers : []);
            setSessions(Array.isArray(sessions) ? sessions : []);
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/api/admin/users', newUser);
            setShowCreateUser(false);
            setNewUser({ firstName: '', lastName: '', email: '', password: '', role: 'volunteer', gradeLevel: 1, bio: '' });
            fetchData();
        } catch (error: any) {
            console.error('Failed to create user:', error);
            alert(error.message || 'Failed to create user');
        }
    };

    const handleCreateSession = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/api/sessions', { sessionDate: newSessionDate });
            setShowCreateSession(false);
            setNewSessionDate('');
            fetchData();
        } catch (error) {
            console.error('Failed to create session:', error);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center" style={{ minHeight: 'calc(100vh - 80px)' }}>
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <div className="container" style={{ paddingTop: 'var(--spacing-2xl)', paddingBottom: 'var(--spacing-2xl)' }}>
            <div className="fade-in">
                <div className="flex justify-between items-center mb-xl">
                    <div>
                        <h1>Admin Dashboard</h1>
                        <p style={{ color: 'var(--neutral-900)' }}>Manage students, volunteers, and sessions</p>
                    </div>
                    <div className="flex gap-md">
                        <button
                            onClick={() => setShowCreateUser(true)}
                            className="btn btn-primary"
                            style={{ marginRight: 'var(--spacing-sm)' }}
                        >
                            + Add User
                        </button>
                        <button
                            onClick={() => setShowCreateSession(true)}
                            className="btn btn-primary"
                        >
                            + Create Session
                        </button>
                    </div>
                </div>

                {/* Stats Overview */}
                <div className="grid grid-3 mb-xl">
                    <div
                        className="stat-card"
                        onClick={() => {
                            setViewFilter('students');
                            setShowAllStudents(true);
                            document.getElementById('students-section')?.scrollIntoView({ behavior: 'smooth' });
                        }}
                        style={{ cursor: 'pointer', transition: 'transform 0.2s' }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                        <div className="stat-value">{students.length}</div>
                        <div className="stat-label">Total Students</div>
                    </div>
                    <div
                        className="stat-card"
                        onClick={() => {
                            setViewFilter('volunteers');
                            setShowAllVolunteers(true);
                            document.getElementById('volunteers-section')?.scrollIntoView({ behavior: 'smooth' });
                        }}
                        style={{ cursor: 'pointer', transition: 'transform 0.2s' }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                        <div className="stat-value">{volunteers.length}</div>
                        <div className="stat-label">Active Volunteers</div>
                    </div>
                    <div
                        className="stat-card"
                        onClick={() => {
                            setViewFilter('sessions');
                            setShowAllSessions(true);
                            document.getElementById('sessions-section')?.scrollIntoView({ behavior: 'smooth' });
                        }}
                        style={{ cursor: 'pointer', transition: 'transform 0.2s' }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                        <div className="stat-value">{sessions.length}</div>
                        <div className="stat-label">Sessions Held</div>
                    </div>
                </div>

                {/* Create User Modal */}
                {showCreateUser && (
                    <div style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000,
                    }}>
                        <div className="card" style={{ maxWidth: '500px', width: '100%', margin: 'var(--spacing-lg)', maxHeight: '90vh', overflowY: 'auto' }}>
                            <h2>Add New User</h2>
                            <form onSubmit={handleCreateUser}>
                                <div className="form-group">
                                    <label className="form-label">Role</label>
                                    <select
                                        className="form-input"
                                        value={newUser.role}
                                        onChange={e => setNewUser({ ...newUser, role: e.target.value })}
                                    >
                                        <option value="volunteer">Volunteer</option>
                                        <option value="student">Student</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </div>
                                <div className="grid grid-2 gap-md">
                                    <div className="form-group">
                                        <label className="form-label">First Name</label>
                                        <input
                                            className="form-input"
                                            value={newUser.firstName}
                                            onChange={e => setNewUser({ ...newUser, firstName: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Last Name</label>
                                        <input
                                            className="form-input"
                                            value={newUser.lastName}
                                            onChange={e => setNewUser({ ...newUser, lastName: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Email</label>
                                    <input
                                        type="email"
                                        className="form-input"
                                        value={newUser.email}
                                        onChange={e => setNewUser({ ...newUser, email: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Password</label>
                                    <input
                                        type="password"
                                        className="form-input"
                                        value={newUser.password}
                                        onChange={e => setNewUser({ ...newUser, password: e.target.value })}
                                        required
                                        minLength={6}
                                    />
                                </div>
                                {newUser.role === 'student' && (
                                    <div className="form-group">
                                        <label className="form-label">Grade Level</label>
                                        <input
                                            type="number"
                                            className="form-input"
                                            value={newUser.gradeLevel}
                                            onChange={e => setNewUser({ ...newUser, gradeLevel: parseInt(e.target.value) })}
                                            min={1}
                                            max={12}
                                        />
                                    </div>
                                )}
                                <div className="flex gap-md mt-lg">
                                    <button type="submit" className="btn btn-primary">Create User</button>
                                    <button type="button" onClick={() => setShowCreateUser(false)} className="btn btn-outline">Cancel</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Create Session Modal */}
                {showCreateSession && (
                    <div style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000,
                    }}>
                        <div className="card" style={{ maxWidth: '500px', width: '100%', margin: 'var(--spacing-lg)' }}>
                            <h2>Create New Session</h2>
                            <form onSubmit={handleCreateSession}>
                                <div className="form-group">
                                    <label className="form-label" htmlFor="sessionDate">
                                        Session Date
                                    </label>
                                    <input
                                        id="sessionDate"
                                        type="date"
                                        className="form-input"
                                        value={newSessionDate}
                                        onChange={(e) => setNewSessionDate(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="flex gap-md">
                                    <button type="submit" className="btn btn-primary">
                                        Create Session
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowCreateSession(false)}
                                        className="btn btn-outline"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Students Section */}
                <div className="mb-xl" id="students-section">
                    <div className="flex justify-between items-center mb-md">
                        <h2>Students</h2>
                        <input
                            type="text"
                            placeholder="🔍 Search students..."
                            className="form-input"
                            style={{
                                maxWidth: '300px',
                                borderRadius: 'var(--radius-full)',
                                paddingLeft: 'var(--spacing-lg)',
                                border: '2px solid var(--neutral-200)',
                                transition: 'all 0.2s'
                            }}
                            value={studentSearch}
                            onChange={(e) => setStudentSearch(e.target.value)}
                            onFocus={(e) => e.currentTarget.style.borderColor = 'var(--primary-500)'}
                            onBlur={(e) => e.currentTarget.style.borderColor = 'var(--neutral-200)'}
                        />
                    </div>
                    <div className="grid grid-3">
                        {displayedStudents.map((student) => (
                            <Link
                                key={student.id}
                                to={`/student/${student.id}`}
                                className="card"
                                style={{ textDecoration: 'none', color: 'inherit' }}
                            >
                                <div className="flex items-center gap-md mb-md">
                                    {student.photoUrl ? (
                                        <img
                                            src={student.photoUrl}
                                            alt={`${student.firstName} ${student.lastName}`}
                                            className="avatar avatar-lg"
                                        />
                                    ) : (
                                        <div
                                            className="avatar avatar-lg"
                                            style={{
                                                background: 'var(--primary-gradient)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: 'white',
                                                fontSize: 'var(--font-size-xl)',
                                                fontWeight: 700,
                                            }}
                                        >
                                            {student.firstName[0]}{student.lastName[0]}
                                        </div>
                                    )}
                                    <div style={{ flex: 1 }}>
                                        <h4 style={{ marginBottom: 'var(--spacing-xs)' }}>
                                            {student.firstName} {student.lastName}
                                        </h4>
                                        <span className="badge badge-primary">Grade {student.gradeLevel}</span>
                                        {student.progressSummary && (
                                            <p className="text-muted mt-sm" style={{ fontSize: 'var(--font-size-sm)', marginBottom: 0 }}>
                                                {student.progressSummary.substring(0, 80)}...
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                    {filteredStudents.length > 6 && (
                        <div className="flex justify-center mt-md">
                            <button
                                className="btn btn-outline"
                                onClick={() => setShowAllStudents(!showAllStudents)}
                            >
                                {showAllStudents ? 'Show Less' : `Show All (${filteredStudents.length})`}
                            </button>
                        </div>
                    )}
                </div>

                {/* Volunteers Section */}
                <div className="mb-xl" id="volunteers-section">
                    <div className="flex justify-between items-center mb-md">
                        <h2>Volunteers</h2>
                        <input
                            type="text"
                            placeholder="🔍 Search volunteers..."
                            className="form-input"
                            style={{
                                maxWidth: '300px',
                                borderRadius: 'var(--radius-full)',
                                paddingLeft: 'var(--spacing-lg)',
                                border: '2px solid var(--neutral-200)',
                                transition: 'all 0.2s'
                            }}
                            value={volunteerSearch}
                            onChange={(e) => setVolunteerSearch(e.target.value)}
                            onFocus={(e) => e.currentTarget.style.borderColor = 'var(--primary-500)'}
                            onBlur={(e) => e.currentTarget.style.borderColor = 'var(--neutral-200)'}
                        />
                    </div>
                    <div className="grid grid-3">
                        {displayedVolunteers.map((volunteer) => (
                            <div key={volunteer.id} className="card">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h4 style={{ marginBottom: 'var(--spacing-xs)' }}>
                                            {volunteer.firstName} {volunteer.lastName}
                                        </h4>
                                        <p className="text-muted" style={{ fontSize: 'var(--font-size-sm)', marginBottom: 0 }}>
                                            {volunteer.totalHours} hours logged
                                        </p>
                                    </div>
                                    <div className="stat-value" style={{ fontSize: 'var(--font-size-2xl)' }}>
                                        {volunteer.totalHours}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    {filteredVolunteers.length > 6 && (
                        <div className="flex justify-center mt-md">
                            <button
                                className="btn btn-outline"
                                onClick={() => setShowAllVolunteers(!showAllVolunteers)}
                            >
                                {showAllVolunteers ? 'Show Less' : `Show All (${filteredVolunteers.length})`}
                            </button>
                        </div>
                    )}
                </div>

                {/* Recent Sessions */}
                <div>
                    <h2>Recent Sessions</h2>
                    <div className="grid grid-2">
                        {displayedSessions.map((session) => (
                            <div key={session.id} className="card">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h4 style={{ marginBottom: 'var(--spacing-xs)' }}>
                                            {new Date(session.sessionDate).toLocaleDateString('en-US', {
                                                weekday: 'long',
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                            })}
                                        </h4>
                                        <p className="text-muted" style={{ fontSize: 'var(--font-size-sm)', marginBottom: 0 }}>
                                            {session.attendanceCount} attendees
                                        </p>
                                    </div>
                                    <button className="btn btn-sm btn-outline">
                                        View Details
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                    {sessions.length > 6 && (
                        <div className="flex justify-center mt-md">
                            <button
                                className="btn btn-outline"
                                onClick={() => setShowAllSessions(!showAllSessions)}
                            >
                                {showAllSessions ? 'Show Less' : `Show All (${sessions.length})`}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
