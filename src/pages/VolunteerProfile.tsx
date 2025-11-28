import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../utils/api';

interface VolunteerData {
    id: number;
    firstName: string;
    lastName: string;
    photoUrl?: string;
    bio?: string;
    grade?: string;
    school?: string;
    totalHours: number;
    email?: string;
}

const VolunteerProfile: React.FC = () => {
    const { user } = useAuth();
    const [volunteerData, setVolunteerData] = useState<VolunteerData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editedData, setEditedData] = useState<Partial<VolunteerData>>({});
    const [photoFile, setPhotoFile] = useState<File | null>(null);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);

    useEffect(() => {
        if (user) {
            fetchVolunteerData();
        } else {
            setIsLoading(false);
        }
    }, [user]);

    const fetchVolunteerData = async () => {
        try {
            const data = await api.get('/api/volunteers/me');
            setVolunteerData(data);
            setEditedData(data);
            if (data.photoUrl) {
                setPhotoPreview(data.photoUrl);
            }
        } catch (error) {
            console.error('Failed to fetch volunteer data:', error);
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

    const handleSave = async () => {
        try {
            let photoUrl = volunteerData?.photoUrl;
            
            // Upload photo if changed
            if (photoFile) {
                const formData = new FormData();
                formData.append('photo', photoFile);
                // For now, we'll handle photo upload later - just use data URL
                photoUrl = photoPreview || undefined;
            }

            await api.put(`/api/volunteers/${volunteerData?.id}`, {
                firstName: editedData.firstName,
                lastName: editedData.lastName,
                bio: editedData.bio,
                grade: editedData.grade,
                school: editedData.school,
                photoUrl: photoUrl
            });

            setIsEditing(false);
            fetchVolunteerData();
            alert('Profile updated successfully!');
        } catch (error: any) {
            console.error('Failed to update profile:', error);
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

    if (!volunteerData) {
        return (
            <div className="container" style={{ paddingTop: 'var(--spacing-2xl)' }}>
                <div className="card text-center">
                    <h2>Volunteer profile not found</h2>
                    <p className="text-muted">Please contact an administrator.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container" style={{ paddingTop: 'var(--spacing-2xl)', paddingBottom: 'var(--spacing-2xl)' }}>
            <div className="fade-in">
                <div className="flex justify-between items-center mb-xl">
                    <div>
                        <h1>Volunteer Profile</h1>
                        <p style={{ color: '#000000' }}>Manage your volunteer profile and preferences</p>
                    </div>
                    {!isEditing && (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="btn btn-primary"
                        >
                            Edit Profile
                        </button>
                    )}
                </div>

                <div className="card">
                    <div className="flex items-center gap-lg mb-xl">
                        <div style={{ position: 'relative' }}>
                            {photoPreview ? (
                                <img
                                    src={photoPreview}
                                    alt={`${volunteerData.firstName} ${volunteerData.lastName}`}
                                    className="avatar avatar-xl"
                                    style={{ objectFit: 'cover' }}
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
                                    {volunteerData.firstName[0]}{volunteerData.lastName[0]}
                                </div>
                            )}
                            {isEditing && (
                                <label
                                    className="btn btn-sm btn-primary"
                                    style={{
                                        position: 'absolute',
                                        bottom: 0,
                                        right: 0,
                                        cursor: 'pointer',
                                        margin: 0,
                                    }}
                                >
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handlePhotoChange}
                                        style={{ display: 'none' }}
                                    />
                                    📷
                                </label>
                            )}
                        </div>
                        <div style={{ flex: 1 }}>
                            {isEditing ? (
                                <>
                                    <div className="grid grid-2 gap-md mb-md">
                                        <div className="form-group">
                                            <label className="form-label">First Name</label>
                                            <input
                                                className="form-input"
                                                value={editedData.firstName || ''}
                                                onChange={e => setEditedData({ ...editedData, firstName: e.target.value })}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Last Name</label>
                                            <input
                                                className="form-input"
                                                value={editedData.lastName || ''}
                                                onChange={e => setEditedData({ ...editedData, lastName: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-2 gap-md mb-md">
                                        <div className="form-group">
                                            <label className="form-label">Grade</label>
                                            <input
                                                className="form-input"
                                                value={editedData.grade || ''}
                                                onChange={e => setEditedData({ ...editedData, grade: e.target.value })}
                                                placeholder="e.g., 12th, College Freshman"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">School</label>
                                            <input
                                                className="form-input"
                                                value={editedData.school || ''}
                                                onChange={e => setEditedData({ ...editedData, school: e.target.value })}
                                                placeholder="School name"
                                            />
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <h2 style={{ marginBottom: 'var(--spacing-xs)' }}>
                                        {volunteerData.firstName} {volunteerData.lastName}
                                    </h2>
                                    <div className="flex gap-sm flex-wrap">
                                        {volunteerData.grade && (
                                            <span className="badge badge-primary">{volunteerData.grade}</span>
                                        )}
                                        {volunteerData.school && (
                                            <span className="badge badge-success">{volunteerData.school}</span>
                                        )}
                                        <span className="badge badge-secondary">{volunteerData.totalHours} hours</span>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {isEditing ? (
                        <div className="form-group">
                            <label className="form-label">Bio</label>
                            <textarea
                                className="form-input"
                                rows={5}
                                value={editedData.bio || ''}
                                onChange={e => setEditedData({ ...editedData, bio: e.target.value })}
                                placeholder="Tell us about yourself..."
                            />
                        </div>
                    ) : (
                        volunteerData.bio && (
                            <div className="mb-lg">
                                <h3>About Me</h3>
                                <p>{volunteerData.bio}</p>
                            </div>
                        )
                    )}

                    {isEditing && (
                        <div className="flex gap-md mt-lg">
                            <button
                                onClick={handleSave}
                                className="btn btn-primary"
                            >
                                Save Changes
                            </button>
                            <button
                                onClick={() => {
                                    setIsEditing(false);
                                    setEditedData(volunteerData);
                                    setPhotoFile(null);
                                    setPhotoPreview(volunteerData.photoUrl || null);
                                }}
                                className="btn btn-outline"
                            >
                                Cancel
                            </button>
                        </div>
                    )}

                    {!isEditing && (
                        <div className="flex gap-md mt-lg">
                            <Link to="/volunteer" className="btn btn-primary">
                                Back to Dashboard
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VolunteerProfile;