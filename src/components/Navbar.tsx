import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getTenantIdFromUrl } from '../utils/tenantUtils';

const Navbar: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const tenantId = getTenantIdFromUrl();

    const handleLogout = () => {
        logout();
        navigate(`/${tenantId}/login`);
    };

    const getDashboardLink = () => {
        switch (user?.role) {
            case 'admin':
                return `/${tenantId}/admin`;
            case 'volunteer':
                return `/${tenantId}/volunteer`;
            case 'student':
                return `/${tenantId}/student`;
            default:
                return `/${tenantId}`;
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
                                <Link to={`/${tenantId}/volunteer/profile`} className="navbar-link">
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
