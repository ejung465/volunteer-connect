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
    email?: string;
}

interface Volunteer {
    id: number;
    firstName: string;
    lastName: string;
    photoUrl?: string;
    totalHours: number;
    email?: string;
}

interface Session {
    id: number;
    title?: string;
    sessionDate: string;
    attendanceCount: number;
}

interface Attendance {
    id: number;
    sessionId: number;
    volunteerId: number;
    studentId: number;
    hoursLogged: number;
    studentFirstName?: string;
    studentLastName?: string;
    volunteerFirstName?: string;
    volunteerLastName?: string;
}

type TabType = 'members' | 'sessions' | 'volunteerHours';

const AdminDashboard: React.FC = () => {
    const [students, setStudents] = useState<Student[]>([]);
    const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
    const [sessions, setSessions] = useState<Session[]>([]);
    const [attendanceRecords, setAttendanceRecords] = useState<Attendance[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<TabType>('members');
    const [showCreateSession, setShowCreateSession] = useState(false);
    const [newSessionDate, setNewSessionDate] = useState('');
    const [newSessionTitle, setNewSessionTitle] = useState('Weekly Tutoring');
    const [sessionTitleType, setSessionTitleType] = useState<'weekly' | 'custom'>('weekly');
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
    const [memberSearch, setMemberSearch] = useState('');
    const [sessionSearch, setSessionSearch] = useState('');
    const [memberToRemove, setMemberToRemove] = useState<{ id: number; name: string; type: 'student' | 'volunteer' } | null>(null);
    const [volunteerHoursEdits, setVolunteerHoursEdits] = useState<{ [key: number]: number }>({});
    const [selectedSessionForHours, setSelectedSessionForHours] = useState<number | null>(null);

    // Filter members (students + volunteers) alphabetically
    const allMembers = [
        ...students.map(s => ({ ...s, type: 'student' as const })),
        ...volunteers.map(v => ({ ...v, type: 'volunteer' as const }))
    ].sort((a, b) => {
        const nameA = `${a.lastName} ${a.firstName}`.toLowerCase();
        const nameB = `${b.lastName} ${b.firstName}`.toLowerCase();
        return nameA.localeCompare(nameB);
    });

    const filteredMembers = allMembers.filter(m =>
        `${m.firstName} ${m.lastName}`.toLowerCase().includes(memberSearch.toLowerCase())
    );

    // Filter sessions (past and future)
    const now = new Date();
    const pastSessions = sessions.filter(s => new Date(s.sessionDate) < now)
        .sort((a, b) => new Date(b.sessionDate).getTime() - new Date(a.sessionDate).getTime());
    const futureSessions = sessions.filter(s => new Date(s.sessionDate) >= now)
        .sort((a, b) => new Date(a.sessionDate).getTime() - new Date(b.sessionDate).getTime());
    
    const allSessionsList = [...futureSessions, ...pastSessions];
    const filteredSessions = allSessionsList.filter(s =>
        (s.title || 'Weekly Tutoring').toLowerCase().includes(sessionSearch.toLowerCase()) ||
        new Date(s.sessionDate).toLocaleDateString().includes(sessionSearch)
    );

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if (activeTab === 'volunteerHours' && selectedSessionForHours) {
            fetchAttendanceForSession(selectedSessionForHours);
        }
    }, [activeTab, selectedSessionForHours]);

    const fetchData = async () => {
        try {
            const [studentsData, volunteersData, sessionsData] = await Promise.all([
                api.get('/api/students').catch(() => []),
                api.get('/api/volunteers').catch(() => []),
                api.get('/api/sessions').catch(() => []),
            ]);

            setStudents(Array.isArray(studentsData) ? studentsData : []);
            setVolunteers(Array.isArray(volunteersData) ? volunteersData : []);
            setSessions(Array.isArray(sessionsData) ? sessionsData : []);
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchAttendanceForSession = async (sessionId: number) => {
        try {
            const attendance = await api.get(`/api/sessions/${sessionId}/attendance`);
            setAttendanceRecords(Array.isArray(attendance) ? attendance : []);
        } catch (error) {
            console.error('Failed to fetch attendance:', error);
            setAttendanceRecords([]);
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
            const title = sessionTitleType === 'weekly' ? 'Weekly Tutoring' : newSessionTitle;
            await api.post('/api/sessions', {
                session_date: newSessionDate,
                title: title
            });
            setShowCreateSession(false);
            setNewSessionDate('');
            setNewSessionTitle('Weekly Tutoring');
            setSessionTitleType('weekly');
            fetchData();
        } catch (error: any) {
            console.error('Failed to create session:', error);
            alert(error.message || 'Failed to create session. Please try again.');
        }
    };

    const handleRemoveMember = async () => {
        if (!memberToRemove) return;
        try {
            if (memberToRemove.type === 'student') {
                await api.delete(`/api/admin/students/${memberToRemove.id}`);
            } else {
                await api.delete(`/api/admin/volunteers/${memberToRemove.id}`);
            }
            setMemberToRemove(null);
            fetchData();
        } catch (error: any) {
            console.error('Failed to remove member:', error);
            alert(error.message || 'Failed to remove member');
        }
    };

    const handleUpdateVolunteerHours = async (attendanceId: number, hours: number) => {
        setVolunteerHoursEdits({ ...volunteerHoursEdits, [attendanceId]: hours });
    };

    const handlePublishVolunteerHours = async () => {
        try {
            for (const [attendanceId, hours] of Object.entries(volunteerHoursEdits)) {
                await api.put(`/api/sessions/attendance/${attendanceId}`, { hours_logged: parseFloat(hours as any) });
            }
            setVolunteerHoursEdits({});
            if (selectedSessionForHours) {
                fetchAttendanceForSession(selectedSessionForHours);
            }
            alert('Volunteer hours published successfully!');
        } catch (error: any) {
            console.error('Failed to publish hours:', error);
            alert(error.message || 'Failed to publish volunteer hours');
        }
    };

    const handleStatClick = (type: 'students' | 'volunteers' | 'sessions') => {
        if (type === 'sessions') {
            setActiveTab('sessions');
            setTimeout(() => {
                document.getElementById('sessions-list')?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
        } else {
            setActiveTab('members');
            setMemberSearch('');
            setTimeout(() => {
                document.getElementById('members-list')?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
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
                {/* Header */}
                <div className="flex justify-between items-center mb-xl">
                    <div>
                        <h1 style={{ textAlign: 'center', width: '100%' }}>Admin Dashboard</h1>
                        <p style={{ color: '#000000', textAlign: 'center' }}>Manage students, volunteers, and sessions</p>
                    </div>
                </div>

                {/* Stats Overview */}
                <div className="grid grid-3 mb-xl">
                    <div
                        className="stat-card"
                        onClick={() => handleStatClick('students')}
                        style={{ cursor: 'pointer', transition: 'transform 0.2s' }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                        <div className="stat-value">{students.length}</div>
                        <div className="stat-label">Total Students</div>
                    </div>
                    <div
                        className="stat-card"
                        onClick={() => handleStatClick('volunteers')}
                        style={{ cursor: 'pointer', transition: 'transform 0.2s' }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                        <div className="stat-value">{volunteers.length}</div>
                        <div className="stat-label">Active Volunteers</div>
                    </div>
                    <div
                        className="stat-card"
                        onClick={() => handleStatClick('sessions')}
                        style={{ cursor: 'pointer', transition: 'transform 0.2s' }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                        <div className="stat-value">{sessions.length}</div>
                        <div className="stat-label">Sessions Held</div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="mb-xl" style={{ borderBottom: '2px solid var(--neutral-200)' }}>
                    <div className="flex gap-lg" style={{ marginBottom: '-2px' }}>
                        <button
                            onClick={() => setActiveTab('members')}
                            style={{
                                padding: 'var(--spacing-md) var(--spacing-lg)',
                                background: activeTab === 'members' ? 'transparent' : 'transparent',
                                border: 'none',
                                borderBottom: activeTab === 'members' ? '3px solid var(--primary-500)' : '3px solid transparent',
                                color: activeTab === 'members' ? 'var(--primary-500)' : 'var(--neutral-600)',
                                fontWeight: activeTab === 'members' ? 600 : 400,
                                cursor: 'pointer',
                                fontSize: 'var(--font-size-lg)',
                                transition: 'all 0.2s'
                            }}
                        >
                            Members
                        </button>
                        <button
                            onClick={() => setActiveTab('sessions')}
                            style={{
                                padding: 'var(--spacing-md) var(--spacing-lg)',
                                background: 'transparent',
                                border: 'none',
                                borderBottom: activeTab === 'sessions' ? '3px solid var(--primary-500)' : '3px solid transparent',
                                color: activeTab === 'sessions' ? 'var(--primary-500)' : 'var(--neutral-600)',
                                fontWeight: activeTab === 'sessions' ? 600 : 400,
                                cursor: 'pointer',
                                fontSize: 'var(--font-size-lg)',
                                transition: 'all 0.2s'
                            }}
                        >
                            Sessions
                        </button>
                        <button
                            onClick={() => setActiveTab('volunteerHours')}
                            style={{
                                padding: 'var(--spacing-md) var(--spacing-lg)',
                                background: 'transparent',
                                border: 'none',
                                borderBottom: activeTab === 'volunteerHours' ? '3px solid var(--primary-500)' : '3px solid transparent',
                                color: activeTab === 'volunteerHours' ? 'var(--primary-500)' : 'var(--neutral-600)',
                                fontWeight: activeTab === 'volunteerHours' ? 600 : 400,
                                cursor: 'pointer',
                                fontSize: 'var(--font-size-lg)',
                                transition: 'all 0.2s'
                            }}
                        >
                            Volunteer Hours
                        </button>
                    </div>
                </div>

                {/* Members Tab */}
                {activeTab === 'members' && (
                    <div id="members-list">
                        <div className="flex justify-between items-center mb-lg">
                            <h2>All Members</h2>
                            <div className="flex gap-md items-center">
                                <input
                                    type="text"
                                    placeholder="🔍 Search members..."
                                    className="form-input"
                                    style={{
                                        maxWidth: '350px',
                                        width: '100%',
                                        borderRadius: 'var(--radius-full)',
                                        padding: 'var(--spacing-sm) var(--spacing-lg)',
                                        border: '2px solid var(--neutral-200)',
                                        backgroundColor: 'var(--neutral-50)',
                                        transition: 'all 0.3s ease',
                                        outline: 'none'
                                    }}
                                    value={memberSearch}
                                    onChange={(e) => setMemberSearch(e.target.value)}
                                    onFocus={(e) => {
                                        e.currentTarget.style.borderColor = 'var(--primary-500)';
                                        e.currentTarget.style.backgroundColor = '#ffffff';
                                        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                                    }}
                                    onBlur={(e) => {
                                        e.currentTarget.style.borderColor = 'var(--neutral-200)';
                                        e.currentTarget.style.backgroundColor = 'var(--neutral-50)';
                                        e.currentTarget.style.boxShadow = 'none';
                                    }}
                                />
                                <button
                                    onClick={() => setShowCreateUser(true)}
                                    className="btn btn-primary"
                                    style={{ color: '#ffffff', whiteSpace: 'nowrap' }}
                                >
                                    + Add User
                                </button>
                            </div>
                        </div>
                        <div className="grid grid-3">
                            {filteredMembers.map((member) => (
                                <div key={`${member.type}-${member.id}`} className="card">
                                    <div className="flex justify-between items-start">
                                        <div style={{ flex: 1 }}>
                                            <div className="flex items-center gap-md mb-md">
                                                {member.photoUrl ? (
                                                    <img
                                                        src={member.photoUrl}
                                                        alt={`${member.firstName} ${member.lastName}`}
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
                                                        {member.firstName[0]}{member.lastName[0]}
                                                    </div>
                                                )}
                                                <div style={{ flex: 1 }}>
                                                    <h4 style={{ marginBottom: 'var(--spacing-xs)' }}>
                                                        {member.firstName} {member.lastName}
                                                    </h4>
                                                    <span className={`badge ${member.type === 'student' ? 'badge-primary' : 'badge-success'}`}>
                                                        {member.type === 'student' ? `Grade ${(member as Student).gradeLevel || ''}` : 'Volunteer'}
                                                    </span>
                                                </div>
                                            </div>
                                            {member.type === 'student' && (member as Student).progressSummary && (
                                                <p className="text-muted" style={{ fontSize: 'var(--font-size-sm)', marginBottom: 'var(--spacing-md)' }}>
                                                    {((member as Student).progressSummary || '').substring(0, 80)}...
                                                </p>
                                            )}
                                            {member.type === 'volunteer' && (
                                                <p className="text-muted" style={{ fontSize: 'var(--font-size-sm)', marginBottom: 'var(--spacing-md)' }}>
                                                    {(member as Volunteer).totalHours} hours logged
                                                </p>
                                            )}
                                        </div>
                                        <button
                                            onClick={() => setMemberToRemove({
                                                id: member.id,
                                                name: `${member.firstName} ${member.lastName}`,
                                                type: member.type
                                            })}
                                            className="btn btn-sm btn-outline"
                                            style={{ color: 'var(--secondary-500)', borderColor: 'var(--secondary-500)' }}
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Sessions Tab */}
                {activeTab === 'sessions' && (
                    <div id="sessions-list">
                        <div className="flex justify-between items-center mb-lg">
                            <h2>Sessions</h2>
                            <div className="flex gap-md items-center">
                                <input
                                    type="text"
                                    placeholder="🔍 Search sessions..."
                                    className="form-input"
                                    style={{
                                        maxWidth: '350px',
                                        width: '100%',
                                        borderRadius: 'var(--radius-full)',
                                        padding: 'var(--spacing-sm) var(--spacing-lg)',
                                        border: '2px solid var(--neutral-200)',
                                        backgroundColor: 'var(--neutral-50)',
                                        transition: 'all 0.3s ease',
                                        outline: 'none'
                                    }}
                                    value={sessionSearch}
                                    onChange={(e) => setSessionSearch(e.target.value)}
                                    onFocus={(e) => {
                                        e.currentTarget.style.borderColor = 'var(--primary-500)';
                                        e.currentTarget.style.backgroundColor = '#ffffff';
                                        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                                    }}
                                    onBlur={(e) => {
                                        e.currentTarget.style.borderColor = 'var(--neutral-200)';
                                        e.currentTarget.style.backgroundColor = 'var(--neutral-50)';
                                        e.currentTarget.style.boxShadow = 'none';
                                    }}
                                />
                                <button
                                    onClick={() => setShowCreateSession(true)}
                                    className="btn btn-primary"
                                >
                                    + Create Session
                                </button>
                            </div>
                        </div>
                        {futureSessions.length > 0 && (
                            <div className="mb-xl">
                                <h3 className="mb-md">Upcoming Sessions</h3>
                                <div className="grid grid-2">
                                    {filteredSessions.filter(s => new Date(s.sessionDate) >= now).map((session) => (
                                        <div key={session.id} className="card">
                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <h4 style={{ marginBottom: 'var(--spacing-xs)' }}>
                                                        {session.title || 'Weekly Tutoring'}
                                                    </h4>
                                                    <p className="text-muted" style={{ fontSize: 'var(--font-size-sm)', marginBottom: 0 }}>
                                                        {new Date(session.sessionDate).toLocaleDateString('en-US', {
                                                            weekday: 'long',
                                                            year: 'numeric',
                                                            month: 'long',
                                                            day: 'numeric',
                                                        })}
                                                    </p>
                                                    <p className="text-muted" style={{ fontSize: 'var(--font-size-sm)', marginTop: 'var(--spacing-xs)' }}>
                                                        {session.attendanceCount || 0} attendees
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        {pastSessions.length > 0 && (
                            <div>
                                <h3 className="mb-md">Past Sessions</h3>
                                <div className="grid grid-2">
                                    {filteredSessions.filter(s => new Date(s.sessionDate) < now).map((session) => (
                                        <div key={session.id} className="card">
                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <h4 style={{ marginBottom: 'var(--spacing-xs)' }}>
                                                        {session.title || 'Weekly Tutoring'}
                                                    </h4>
                                                    <p className="text-muted" style={{ fontSize: 'var(--font-size-sm)', marginBottom: 0 }}>
                                                        {new Date(session.sessionDate).toLocaleDateString('en-US', {
                                                            weekday: 'long',
                                                            year: 'numeric',
                                                            month: 'long',
                                                            day: 'numeric',
                                                        })}
                                                    </p>
                                                    <p className="text-muted" style={{ fontSize: 'var(--font-size-sm)', marginTop: 'var(--spacing-xs)' }}>
                                                        {session.attendanceCount || 0} attendees
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Volunteer Hours Tab */}
                {activeTab === 'volunteerHours' && (
                    <div>
                        <div className="flex justify-between items-center mb-lg">
                            <h2>Manage Volunteer Hours</h2>
                            {Object.keys(volunteerHoursEdits).length > 0 && (
                                <button
                                    onClick={handlePublishVolunteerHours}
                                    className="btn btn-primary"
                                    style={{ color: '#ffffff' }}
                                >
                                    Publish Changes
                                </button>
                            )}
                        </div>
                        <div className="mb-lg">
                            <label className="form-label">Select Session</label>
                            <select
                                className="form-input"
                                value={selectedSessionForHours || ''}
                                onChange={(e) => {
                                    const sessionId = e.target.value ? parseInt(e.target.value) : null;
                                    setSelectedSessionForHours(sessionId);
                                    if (sessionId) {
                                        fetchAttendanceForSession(sessionId);
                                    }
                                }}
                                style={{ maxWidth: '400px' }}
                            >
                                <option value="">-- Select a session --</option>
                                {allSessionsList.map(session => (
                                    <option key={session.id} value={session.id}>
                                        {session.title || 'Weekly Tutoring'} - {new Date(session.sessionDate).toLocaleDateString()}
                                    </option>
                                ))}
                            </select>
                        </div>
                        {selectedSessionForHours && attendanceRecords.length > 0 && (
                            <div className="card">
                                <h3 className="mb-md">Attendance Records</h3>
                                <div style={{ overflowX: 'auto' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                        <thead>
                                            <tr style={{ borderBottom: '2px solid var(--neutral-200)' }}>
                                                <th style={{ padding: 'var(--spacing-md)', textAlign: 'left' }}>Volunteer</th>
                                                <th style={{ padding: 'var(--spacing-md)', textAlign: 'left' }}>Student</th>
                                                <th style={{ padding: 'var(--spacing-md)', textAlign: 'left' }}>Hours</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {attendanceRecords.map((record) => (
                                                <tr key={record.id} style={{ borderBottom: '1px solid var(--neutral-200)' }}>
                                                    <td style={{ padding: 'var(--spacing-md)' }}>
                                                        {record.volunteerFirstName} {record.volunteerLastName}
                                                    </td>
                                                    <td style={{ padding: 'var(--spacing-md)' }}>
                                                        {record.studentFirstName} {record.studentLastName}
                                                    </td>
                                                    <td style={{ padding: 'var(--spacing-md)' }}>
                                                        <input
                                                            type="number"
                                                            step="0.5"
                                                            min="0"
                                                            className="form-input"
                                                            style={{ width: '100px' }}
                                                            value={volunteerHoursEdits[record.id] !== undefined ? volunteerHoursEdits[record.id] : record.hoursLogged}
                                                            onChange={(e) => handleUpdateVolunteerHours(record.id, parseFloat(e.target.value) || 0)}
                                                        />
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                        {selectedSessionForHours && attendanceRecords.length === 0 && (
                            <div className="card text-center">
                                <p className="text-muted">No attendance records found for this session.</p>
                            </div>
                        )}
                        {!selectedSessionForHours && (
                            <div className="card text-center">
                                <p className="text-muted">Please select a session to manage volunteer hours.</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Remove Member Confirmation Modal */}
                {memberToRemove && (
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
                            <h2>Confirm Removal</h2>
                            <p className="mb-lg">
                                Are you sure you want to remove <strong>{memberToRemove.name}</strong>? This action cannot be undone.
                            </p>
                            <div className="flex gap-md">
                                <button
                                    onClick={handleRemoveMember}
                                    className="btn btn-danger"
                                    style={{ backgroundColor: 'var(--secondary-500)', color: '#ffffff' }}
                                >
                                    Yes, Remove
                                </button>
                                <button
                                    onClick={() => setMemberToRemove(null)}
                                    className="btn btn-outline"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}

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
                                    <label className="form-label" htmlFor="sessionTitle">
                                        Session Title
                                    </label>
                                    <select
                                        id="sessionTitle"
                                        className="form-input"
                                        value={sessionTitleType}
                                        onChange={(e) => {
                                            const value = e.target.value as 'weekly' | 'custom';
                                            setSessionTitleType(value);
                                            if (value === 'weekly') {
                                                setNewSessionTitle('Weekly Tutoring');
                                            }
                                        }}
                                    >
                                        <option value="weekly">Weekly Tutoring</option>
                                        <option value="custom">Custom</option>
                                    </select>
                                </div>
                                {sessionTitleType === 'custom' && (
                                    <div className="form-group">
                                        <label className="form-label" htmlFor="customTitle">
                                            Custom Title
                                        </label>
                                        <input
                                            id="customTitle"
                                            type="text"
                                            className="form-input"
                                            value={newSessionTitle}
                                            onChange={(e) => setNewSessionTitle(e.target.value)}
                                            placeholder="Enter session title..."
                                            required
                                        />
                                    </div>
                                )}
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
            </div>
        </div>
    );
};

export default AdminDashboard;