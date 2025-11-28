import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api';

interface StudentData {
    id: number;
    firstName: string;
    lastName: string;
    photoUrl?: string;
    gradeLevel: number;
    birthday?: string;
    bio?: string;
    progressSummary?: string;
}

const StudentDashboard: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [studentData, setStudentData] = useState<StudentData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (user) {
            fetchStudentData();
        } else {
            setIsLoading(false);
        }
    }, [user]);

    const fetchStudentData = async () => {
        try {
            const token = localStorage.getItem('token');

            if (!token) {
                console.error('No authentication token found');
                setIsLoading(false);
                return;
            }

            const data = await api.get('/api/students/me');
            setStudentData(data);
        } catch (error) {
            console.error('Failed to fetch student data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center" style={{ minHeight: 'calc(100vh - 80px)' }}>
                <div className="spinner"></div>
            </div>
        );
    }

    if (!studentData) {
        return (
            <div className="container" style={{ paddingTop: 'var(--spacing-2xl)' }}>
                <div className="card text-center">
                    <h2>Student profile not found</h2>
                    <p className="text-muted">Please contact an administrator.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container" style={{ paddingTop: 'var(--spacing-2xl)', paddingBottom: 'var(--spacing-2xl)' }}>
            <div className="fade-in">
                <div className="mb-xl">
                    <h1>Welcome, {studentData.firstName}!</h1>
                    <p style={{ color: '#000000' }}>View your profile and track your progress</p>
                </div>

                <div className="card">
                    <div className="flex items-center gap-lg mb-xl">
                        {studentData.photoUrl ? (
                            <img
                                src={studentData.photoUrl}
                                alt={`${studentData.firstName} ${studentData.lastName}`}
                                className="avatar avatar-xl"
                            />
                        ) : (
                            <div
                                className="avatar avatar-xl"
                                style={{
                                    background: 'var(--primary-gradient)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'white',
                                    fontSize: 'var(--font-size-3xl)',
                                    fontWeight: 700,
                                }}
                            >
                                {studentData.firstName[0]}{studentData.lastName[0]}
                            </div>
                        )}
                        <div>
                            <h2 style={{ marginBottom: 'var(--spacing-xs)' }}>
                                {studentData.firstName} {studentData.lastName}
                            </h2>
                            <div className="flex gap-sm">
                                <span className="badge badge-primary">Grade {studentData.gradeLevel}</span>
                                {studentData.birthday && (
                                    <span className="badge badge-success">
                                        {new Date(studentData.birthday).toLocaleDateString('en-US', {
                                            month: 'long',
                                            day: 'numeric',
                                        })}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {studentData.bio && (
                        <div className="mb-lg">
                            <h3>About Me</h3>
                            <p className="text-muted">{studentData.bio}</p>
                        </div>
                    )}

                    {studentData.progressSummary && (
                        <div className="mb-lg">
                            <h3>Progress Summary</h3>
                            <div
                                style={{
                                    padding: 'var(--spacing-lg)',
                                    background: 'var(--neutral-50)',
                                    borderRadius: 'var(--radius-md)',
                                    borderLeft: '4px solid var(--primary-500)',
                                }}
                            >
                                <p style={{ marginBottom: 0 }}>{studentData.progressSummary}</p>
                            </div>
                        </div>
                    )}

                    <button
                        onClick={() => navigate(`/student/${studentData.id}`)}
                        className="btn btn-primary"
                    >
                        View Full Profile
                    </button>
                </div>
            </div>
        </div>
    );
};

export default StudentDashboard;
