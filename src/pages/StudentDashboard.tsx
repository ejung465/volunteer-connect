import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
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

interface Session {
    id: number;
    sessionDate: string;
    volunteerName: string;
    notes?: string;
    progressSummary?: string;
}

interface WorkbookProgress {
    mathLevel?: number;
    readingLevel?: number;
}

const StudentDashboard: React.FC = () => {
    const { user } = useAuth();
    const [student, setStudent] = useState<StudentData | null>(null);
    const [sessions, setSessions] = useState<Session[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [editedProfile, setEditedProfile] = useState<Partial<StudentData>>({});
    const [workbookProgress, setWorkbookProgress] = useState<WorkbookProgress>({});
    const [photoFile, setPhotoFile] = useState<File | null>(null);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);

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
            if (!token) return;

            // Fetch current student data
            const studentData = await api.get('/api/students/me');

            if (studentData) {
                setStudent(studentData);
                setEditedProfile(studentData);
                if (studentData.photoUrl) {
                    setPhotoPreview(studentData.photoUrl);
                }

                // Fetch sessions
                const sessionsData = await api.get(`/api/students/${studentDatax1.id}/sessions`).catch(() => []);
                setSessions(Array.isArray(sessionsData) ? sessionsData : []);

                // Fetch progress
                const progressData = await api.get(`/api/students/${studentData.id}/progress`).catch(() => []);
                if (Array.isArray(progressData)) {
                    const math = progressData.find((p: any) => p.subject === 'Math');
                    const reading = progressData.find((p: any) => p.subject === 'Reading');
                    setWorkbookProgress({
                        mathLevel: math?.grade_level || studentData?.gradeLevel || 0,
                        readingLevel: reading?.grade_level || studentData?.gradeLevel || 0
                    });
                }
            }
        } catch (error) {
            console.error('Error fetching student data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setPhotoFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSaveProfile = async () => {
        if (!student) return;
        try {
            let photoUrl = student.photoUrl;
            if (photoFile && photoPreview) {
                // In a real app, upload file here. For now using data URL or existing logic
                photoUrl = photoPreview;
            }

            await api.put(`/api/students/${student.id}`, {
                firstName: editedProfile.firstName,
                lastName: editedProfile.lastName,
                gradeLevel: editedProfile.gradeLevel,
                birthday: editedProfile.birthday,
                bio: editedProfile.bio,
                photoUrl: photoUrl
            });

            setIsEditingProfile(false);
            fetchStudentData();
            alert('Profile updated successfully!');
        } catch (error: any) {
            console.error('Error updating profile:', error);
            alert(error.message || 'Failed to update profile');
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center" style={{ minHeight: 'calc(100vh - 80px)' }}>
                <div className="spinner"></div>
            </div>
        );
    }

    if (!student) {
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
                    <h1>Welcome, {student.firstName}!</h1>
                    <p style={{ color: '#000000' }}>View your profile and track your progress</p>
                </div>

                {/* Profile Card */}
                <div className="card mb-xl">
                    <div className="flex gap-lg items-start">
                        <div style={{ position: 'relative' }}>
                            {photoPreview ? (
                                <img src={photoPreview} alt={student.firstName} className="avatar avatar-xl" style={{ objectFit: 'cover' }} />
                            ) : (
                                <div className="avatar avatar-xl" style={{ fontSize: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--student-gradient)', color: 'white', fontWeight: 700 }}>
                                    {student.firstName[0]}{student.lastName[0]}
                                </div>
                            )}
                            {isEditingProfile && (
                                <label className="btn btn-sm btn-primary" style={{ position: 'absolute', bottom: 0, right: 0, cursor: 'pointer', margin: 0 }}>
                                    <input type="file" accept="image/*" onChange={handlePhotoChange} style={{ display: 'none' }} />
                                    📷
                                </label>
                            )}
                        </div>
                        <div className="flex-1" style={{ width: '100%' }}>
                            {isEditingProfile ? (
                                <>
                                    <div className="grid grid-2 gap-md mb-md">
                                        <div className="form-group">
                                            <label className="form-label">First Name</label>
                                            <input
                                                className="form-input"
                                                style={{ width: '100%' }}
                                                value={editedProfile.firstName || ''}
                                                onChange={e => setEditedProfile({ ...editedProfile, firstName: e.target.value })}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Last Name</label>
                                            <input
                                                className="form-input"
                                                style={{ width: '100%' }}
                                                value={editedProfile.lastName || ''}
                                                onChange={e => setEditedProfile({ ...editedProfile, lastName: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-2 gap-md mb-md">
                                        <div className="form-group">
                                            <label className="form-label">Grade</label>
                                            <input
                                                type="number"
                                                className="form-input"
                                                style={{ width: '100%' }}
                                                min={1} max={12}
                                                value={editedProfile.gradeLevel || ''}
                                                onChange={e => setEditedProfile({ ...editedProfile, gradeLevel: parseInt(e.target.value) })}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Birthday</label>
                                            <input
                                                type="date"
                                                className="form-input"
                                                style={{ width: '100%' }}
                                                value={editedProfile.birthday || ''}
                                                onChange={e => setEditedProfile({ ...editedProfile, birthday: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div className="form-group mb-md">
                                        <label className="form-label">Quick Bio</label>
                                        <textarea
                                            className="form-input"
                                            style={{ width: '100%' }}
                                            rows={3}
                                            value={editedProfile.bio || ''}
                                            onChange={e => setEditedProfile({ ...editedProfile, bio: e.target.value })}
                                        />
                                    </div>
                                    <div className="flex gap-md">
                                        <button onClick={handleSaveProfile} className="btn btn-primary">Save</button>
                                        <button onClick={() => { setIsEditingProfile(false); setEditedProfile(student); setPhotoFile(null); setPhotoPreview(student.photoUrl || null); }} className="btn btn-outline">Cancel</button>
                                    </div>
                                </>
                            ) : (
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h1>{student.firstName} {student.lastName}</h1>
                                        <div className="flex gap-sm mt-sm flex-wrap">
                                            <span className="badge badge-primary">Grade {student.gradeLevel}</span>
                                            {student.birthday && <span className="badge badge-success">Born: {new Date(student.birthday).toLocaleDateString()}</span>}
                                        </div>
                                        {student.bio && <p className="mt-md">{student.bio}</p>}
                                    </div>
                                    <button
                                        onClick={() => setIsEditingProfile(true)}
                                        className="btn btn-outline btn-sm"
                                        style={{ whiteSpace: 'nowrap' }}
                                    >
                                        Edit Profile
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Progress & History Grid */}
                <div className="grid grid-2 gap-xl mb-xl">
                    {/* Progress Summary */}
                    <div className="card">
                        <h2>Progress Summary</h2>
                        <p>{student.progressSummary || 'No progress summary yet.'}</p>
                    </div>

                    {/* Session History */}
                    <div className="card">
                        <h2>Session History</h2>
                        <div className="flex flex-col gap-md" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                            {sessions.length > 0 ? sessions.map(session => (
                                <div key={session.id} className="border-bottom pb-md">
                                    <div className="flex justify-between">
                                        <strong>{new Date(session.sessionDate).toLocaleDateString()}</strong>
                                        <span className="text-muted">with {session.volunteerName}</span>
                                    </div>
                                    {session.notes && <p className="mt-xs text-sm">{session.notes}</p>}
                                </div>
                            )) : (
                                <p className="text-muted">No sessions recorded yet.</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Workbook & Drive Grid */}
                <div className="grid grid-2 gap-xl">
                    {/* Workbook Progress */}
                    <div className="card">
                        <h2>Workbook Progress</h2>
                        <div className="mb-md">
                            <div className="flex justify-between items-center mb-xs">
                                <strong>Math Level:</strong>
                                <span>{workbookProgress.mathLevel || 'N/A'}</span>
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between items-center mb-xs">
                                <strong>Reading Level:</strong>
                                <span>{workbookProgress.readingLevel || 'N/A'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Google Drive */}
                    <div className="card">
                        <h2>Google Drive</h2>
                        <div className="p-lg border rounded text-center" style={{ background: 'var(--neutral-50)' }}>
                            <p className="mb-md">Access scanned work and documents</p>
                            <a href="#" className="btn btn-primary" onClick={e => e.preventDefault()}>
                                Open Student Folder
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentDashboard;
