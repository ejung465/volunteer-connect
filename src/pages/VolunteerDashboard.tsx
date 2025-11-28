import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../utils/api';

interface MatchedStudent {
    id: number;
    firstName: string;
    lastName: string;
    photoUrl?: string;
    gradeLevel: number;
    progressSummary?: string;
}

interface SessionData {
    studentName: string;
    hours: number;
}

interface UpcomingSession {
    id: number;
    title?: string;
    sessionDate: string;
    isAvailable: boolean | null;
}

const COLORS = ['#667eea', '#764ba2', '#f5576c', '#f093fb', '#4facfe', '#00f2fe'];

const VolunteerDashboard: React.FC = () => {
    const { user } = useAuth();
    const [matchedStudents, setMatchedStudents] = useState<MatchedStudent[]>([]);
    const [totalHours, setTotalHours] = useState(0);
    const [sessionData, setSessionData] = useState<SessionData[]>([]);
    const [upcomingSessions, setUpcomingSessions] = useState<UpcomingSession[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [updatingRSVP, setUpdatingRSVP] = useState<number | null>(null);

    useEffect(() => {
        if (user) {
            fetchVolunteerData();
        } else {
            setIsLoading(false);
        }
    }, [user]);

    const fetchVolunteerData = async () => {
        try {
            const token = localStorage.getItem('token');

            // Check if token exists before making requests
            if (!token) {
                console.error('No authentication token found');
                setIsLoading(false);
                return;
            }

            const [matchedStudents, stats, sessions] = await Promise.all([
                api.get('/api/volunteers/matched-students').catch(() => []),
                api.get('/api/volunteers/stats').catch(() => ({ totalHours: 0, sessionData: [] })),
                api.get('/api/volunteers/upcoming-sessions').catch(() => []),
            ]);

            setMatchedStudents(Array.isArray(matchedStudents) ? matchedStudents : []);
            setTotalHours(stats.totalHours || 0);
            setSessionData(Array.isArray(stats.sessionData) ? stats.sessionData : []);
            setUpcomingSessions(Array.isArray(sessions) ? sessions : []);
        } catch (error) {
            console.error('Failed to fetch volunteer data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleRSVP = async (sessionId: number, isAvailable: boolean) => {
        try {
            setUpdatingRSVP(sessionId);
            await api.post(`/api/sessions/${sessionId}/rsvp`, { isAvailable });
            
            // Update local state
            setUpcomingSessions(sessions => 
                sessions.map(s => 
                    s.id === sessionId 
                        ? { ...s, isAvailable } 
                        : s
                )
            );
        } catch (error: any) {
            console.error('Failed to update RSVP:', error);
            alert(error.message || 'Failed to update RSVP. Please try again.');
        } finally {
            setUpdatingRSVP(null);
        }
    };

    const isSessionPast = (sessionDate: string) => {
        return new Date(sessionDate) < new Date();
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center" style={{ minHeight: 'calc(100vh - 80px)' }}>
                <div className="spinner"></div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="flex items-center justify-center" style={{ minHeight: 'calc(100vh - 80px)' }}>
                <div className="card">
                    <p className="text-muted">Please log in to view your dashboard.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container" style={{ paddingTop: 'var(--spacing-2xl)', paddingBottom: 'var(--spacing-2xl)' }}>
            <div className="fade-in">
                <div className="mb-xl">
                    <h1>Welcome back, {user?.firstName || 'Volunteer'}!</h1>
                    <p style={{ color: '#000000' }}>Here's your volunteer dashboard</p>
                </div>

                {/* Stats Overview */}
                <div className="grid grid-3 mb-xl">
                    <div className="stat-card">
                        <div className="stat-value">{totalHours}</div>
                        <div className="stat-label">Total Hours</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value">{matchedStudents.length}</div>
                        <div className="stat-label">Students Helped</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value">{upcomingSessions.length}</div>
                        <div className="stat-label">Upcoming Sessions</div>
                    </div>
                </div>

                <div className="grid grid-2 mb-xl">
                    {/* Matched Students */}
                    <div>
                        <h2>Your Matched Students</h2>
                        <div className="flex flex-col gap-md">
                            {matchedStudents.length > 0 ? (
                                matchedStudents.map((student) => (
                                    <Link
                                        key={student.id}
                                        to={`/student/${student.id}`}
                                        className="card"
                                        style={{ textDecoration: 'none', color: 'inherit' }}
                                    >
                                        <div className="flex items-center gap-md">
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
                                ))
                            ) : (
                                <div className="card text-center">
                                    <p className="text-muted">No students matched yet. Check back after the next session!</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Impact Visualization */}
                    <div>
                        <h2>Your Impact</h2>
                        <div className="card">
                            {sessionData.length > 0 ? (
                                <>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <PieChart>
                                            <Pie
                                                data={sessionData}
                                                cx="50%"
                                                cy="50%"
                                                labelLine={false}
                                                label={({ studentName, hours }) => `${studentName}: ${hours}h`}
                                                outerRadius={80}
                                                fill="#8884d8"
                                                dataKey="hours"
                                            >
                                                {sessionData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                            <Legend />
                                        </PieChart>
                                    </ResponsiveContainer>
                                    <div className="mt-lg">
                                        <h4>Hours by Student</h4>
                                        {sessionData.map((data, index) => (
                                            <div key={index} className="flex justify-between items-center mt-sm">
                                                <div className="flex items-center gap-sm">
                                                    <div
                                                        style={{
                                                            width: '12px',
                                                            height: '12px',
                                                            borderRadius: '50%',
                                                            background: COLORS[index % COLORS.length],
                                                        }}
                                                    ></div>
                                                    <span>{data.studentName}</span>
                                                </div>
                                                <span className="font-semibold">{data.hours} hours</span>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            ) : (
                                <div className="text-center">
                                    <p className="text-muted">No session data yet. Start volunteering to see your impact!</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Upcoming Sessions */}
                <div>
                    <h2>Upcoming Sessions</h2>
                    {upcomingSessions.length > 0 ? (
                        <div className="grid grid-2">
                            {upcomingSessions.map((session) => {
                                const isPast = isSessionPast(session.sessionDate);
                                const canEdit = !isPast;
                                
                                return (
                                    <div key={session.id} className="card">
                                        <div className="flex justify-between items-center">
                                            <div style={{ flex: 1 }}>
                                                <h4 style={{ marginBottom: 'var(--spacing-xs)' }}>
                                                    {session.title || 'Weekly Tutoring'}
                                                </h4>
                                                <p className="text-muted" style={{ fontSize: 'var(--font-size-sm)', marginBottom: 'var(--spacing-md)' }}>
                                                    {new Date(session.sessionDate).toLocaleDateString('en-US', {
                                                        weekday: 'long',
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric',
                                                    })}
                                                </p>
                                                {canEdit ? (
                                                    <div className="flex gap-sm">
                                                        <button
                                                            onClick={() => handleRSVP(session.id, true)}
                                                            disabled={updatingRSVP === session.id || session.isAvailable === true}
                                                            className="btn btn-sm"
                                                            style={{
                                                                backgroundColor: session.isAvailable === true ? '#10b981' : 'transparent',
                                                                color: session.isAvailable === true ? 'white' : '#10b981',
                                                                border: '2px solid #10b981',
                                                                minWidth: '100px',
                                                                opacity: updatingRSVP === session.id ? 0.5 : 1
                                                            }}
                                                        >
                                                            ✓ Going
                                                        </button>
                                                        <button
                                                            onClick={() => handleRSVP(session.id, false)}
                                                            disabled={updatingRSVP === session.id || session.isAvailable === false}
                                                            className="btn btn-sm"
                                                            style={{
                                                                backgroundColor: session.isAvailable === false ? '#ef4444' : 'transparent',
                                                                color: session.isAvailable === false ? 'white' : '#ef4444',
                                                                border: '2px solid #ef4444',
                                                                minWidth: '100px',
                                                                opacity: updatingRSVP === session.id ? 0.5 : 1
                                                            }}
                                                        >
                                                            ✗ Not Going
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <span className="badge badge-secondary">Session has passed</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="card text-center">
                            <p className="text-muted">No upcoming sessions scheduled.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VolunteerDashboard;
