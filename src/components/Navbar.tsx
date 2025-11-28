import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../utils/api';

const Navbar: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

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

    const getProfileLink = () => {
        switch (user?.role) {
            case 'volunteer':
                return '/volunteer/profile';
            case 'student':
                // Student profile is accessed via clicking the Student badge
                return null;
            default:
                return null;
        }
    };

    const handleRoleClick = async () => {
        if (user?.role === 'student') {
            try {
                const studentData = await api.get('/api/students/me');
                if (studentData && studentData.id) {
                    navigate(`/student/${studentData.id}`);
                }
            } catch (error) {
                console.error('Failed to fetch student data:', error);
            }
        }
    };

    const profileLink = getProfileLink();

    return (
        <nav className="navbar">
            <div className="container">
                <div className="navbar-content" style={{ position: 'relative' }}>
                    <Link to={getDashboardLink()} className="navbar-brand">
                        Volunteer Connect
                    </Link>

                    <ul className="navbar-nav" style={{
                        position: 'absolute',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        display: 'flex',
                        gap: 'var(--spacing-lg)',
                        alignItems: 'center'
                    }}>
                        {user?.role === 'volunteer' && (
                            <>
                                <li>
                                    <Link to={getDashboardLink()} className="navbar-link">
                                        Dashboard
                                    </Link>
                                </li>
                                {profileLink && (
                                    <li>
                                        <Link to={profileLink} className="navbar-link">
                                            My Profile
                                        </Link>
                                    </li>
                                )}
                            </>
                        )}
                    </ul>

                    <ul className="navbar-nav" style={{ marginLeft: 'auto' }}>
                        <li>
                            {user?.role === 'student' ? (
                                <button
                                    onClick={handleRoleClick}
                                    className="badge badge-primary"
                                    style={{ cursor: 'pointer', border: 'none', background: 'var(--primary-gradient)', padding: 'var(--spacing-xs) var(--spacing-md)' }}
                                >
                                    {getRoleName()}
                                </button>
                            ) : (
                                <span className="badge badge-primary">{getRoleName()}</span>
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
        </nav>
    );
};

export default Navbar;