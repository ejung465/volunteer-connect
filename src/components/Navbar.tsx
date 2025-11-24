import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

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

    return (
        <nav className="navbar">
            <div className="container">
                <div className="navbar-content">
                    <Link to={getDashboardLink()} className="navbar-brand">
                        Volunteer Connect
                    </Link>

                    <ul className="navbar-nav">
                        <li>
                            <Link to={getDashboardLink()} className="navbar-link">
                                Dashboard
                            </Link>
                        </li>

                        {user?.role === 'volunteer' && (
                            <li>
                                <Link to="/volunteer/profile" className="navbar-link">
                                    My Profile
                                </Link>
                            </li>
                        )}

                        <li>
                            <span className="badge badge-primary">{getRoleName()}</span>
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
