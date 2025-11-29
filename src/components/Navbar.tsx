import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../utils/api';

const Navbar: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [showDropdown, setShowDropdown] = useState(false);
    const [showAdminSettings, setShowAdminSettings] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const getDashboardLink = () => {
        switch (user?.role) {
            case 'admin':
                return '/admin';
            case 'volunteer':
                return '/volunteer';
            case 'student':
                return '/student';
            default:
                return '/';
        }
    };

    const getRoleName = () => {
        switch (user?.role) {
            case 'admin':
                return 'Administrator';
            case 'volunteer':
                return 'Volunteer';
            case 'student':
                return 'Student';
            default:
                return '';
        }
    };

    const getBadgeStyle = () => {
        const baseStyle = {
            cursor: 'pointer',
            border: 'none',
            padding: 'var(--spacing-xs) var(--spacing-md)',
            color: 'white',
            borderRadius: 'var(--radius-full)',
            fontSize: 'var(--font-size-sm)',
            fontWeight: 600,
            fontFamily: 'var(--font-family)', // Ensure consistent font
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--spacing-xs)'
        };

        switch (user?.role) {
            case 'admin':
                return {
                    ...baseStyle,
                    background: 'var(--primary-gradient)', // Purple
                };
            case 'volunteer':
                return {
                    ...baseStyle,
                    background: 'var(--volunteer-gradient)', // Red
                };
            case 'student':
                return {
                    ...baseStyle,
                    background: 'var(--student-gradient)', // Blue
                };
            default:
                return baseStyle;
        }
    };

    const handleRoleClick = async () => {
        if (user?.role === 'student') {
            // Students just go to their profile (which is their dashboard now)
            try {
                const studentData = await api.get('/api/students/me');
                if (studentData && studentData.id) {
                    navigate(`/student/${studentData.id}`);
                }
            } catch (error) {
                console.error('Failed to fetch student data:', error);
            }
        } else {
            // Admin and Volunteer toggle dropdown
            setShowDropdown(!showDropdown);
        }
    };

    return (
        <nav className="navbar">
            <div className="container">
                <div className="navbar-content" style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Link to={getDashboardLink()} className="navbar-brand">
                        Volunteer Connect
                    </Link>

                    {/* No centered links for anyone now, as requested */}

                    <ul className="navbar-nav" style={{ marginLeft: 'auto', display: 'flex', gap: 'var(--spacing-md)', alignItems: 'center' }}>
                        <li style={{ position: 'relative' }}>
                            <button
                                onClick={handleRoleClick}
                                style={getBadgeStyle()}
                            >
                                {getRoleName()}
                                {(user?.role === 'admin' || user?.role === 'volunteer') && (
                                    <span style={{ fontSize: '10px' }}>▼</span>
                                )}
                            </button>

                            {/* Dropdown Menu */}
                            {showDropdown && (user?.role === 'admin' || user?.role === 'volunteer') && (
                                <div style={{
                                    position: 'absolute',
                                    top: '100%',
                                    right: 0,
                                    marginTop: 'var(--spacing-sm)',
                                    backgroundColor: 'white',
                                    borderRadius: 'var(--radius-md)',
                                    boxShadow: 'var(--shadow-lg)',
                                    padding: 'var(--spacing-sm)',
                                    minWidth: '150px',
                                    zIndex: 1000,
                                    border: '1px solid var(--neutral-200)'
                                }}>
                                    {user?.role === 'admin' && (
                                        <button
                                            onClick={() => {
                                                setShowAdminSettings(true);
                                                setShowDropdown(false);
                                            }}
                                            className="btn btn-sm btn-ghost"
                                            style={{ width: '100%', textAlign: 'left', marginBottom: 'var(--spacing-xs)' }}
                                        >
                                            Settings
                                        </button>
                                    )}
                                    {user?.role === 'volunteer' && (
                                        <Link
                                            to="/volunteer/profile"
                                            className="btn btn-sm btn-ghost"
                                            style={{ width: '100%', textAlign: 'left', display: 'block', textDecoration: 'none', color: 'inherit', marginBottom: 'var(--spacing-xs)' }}
                                            onClick={() => setShowDropdown(false)}
                                        >
                                            Profile
                                        </Link>
                                    )}
                                </div>
                            )}
                        </li>

                        <li>
                            <button onClick={handleLogout} className="btn btn-sm btn-outline">
                                Logout
                            </button>
                        </li>
                    </ul>
                </div>
            </div>

            {/* Admin Settings Modal */}
            {showAdminSettings && (
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
                    zIndex: 2000,
                }}>
                    <div className="card" style={{ maxWidth: '400px', width: '100%', margin: 'var(--spacing-lg)' }}>
                        <div className="flex justify-between items-center mb-lg">
                            <h2>Admin Settings</h2>
                            <button
                                onClick={() => setShowAdminSettings(false)}
                                className="btn btn-sm btn-outline"
                                style={{ border: 'none', fontSize: '1.2rem' }}
                            >
                                ✕
                            </button>
                        </div>
                        <div className="mb-lg">
                            <div className="form-group">
                                <label className="form-label">Name</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={`${user?.firstName || ''} ${user?.lastName || ''}`}
                                    readOnly
                                    disabled
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Email</label>
                                <input
                                    type="email"
                                    className="form-input"
                                    value={user?.email || ''}
                                    readOnly
                                    disabled
                                />
                            </div>
                            <p className="text-muted" style={{ fontSize: 'var(--font-size-sm)' }}>
                                To update these details, please contact system support.
                            </p>
                        </div>
                        <div className="flex justify-end">
                            <button
                                onClick={() => setShowAdminSettings(false)}
                                className="btn btn-primary"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;