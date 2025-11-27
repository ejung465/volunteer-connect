import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getTenantIdFromUrl } from '../utils/tenantUtils';

const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();
    const tenantId = getTenantIdFromUrl();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            await login(email, password);
            // Get the user data from localStorage to determine where to navigate
            const userData = localStorage.getItem('user');
            if (userData) {
                const user = JSON.parse(userData);
                switch (user.role) {
                    case 'admin':
                        navigate('/admin');
                        break;
                    case 'volunteer':
                        navigate('/volunteer');
                        break;
                    case 'student':
                        navigate('/student');
                        break;
                    default:
                        navigate('/');
                }
            } else {
                navigate('/');
            }
        } catch (err) {
            setError('Invalid email or password. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center" style={{ minHeight: '100vh', padding: '2rem' }}>
            <div className="card" style={{ maxWidth: '450px', width: '100%' }}>
                <div className="text-center mb-xl">
                    <h1 className="navbar-brand" style={{ fontSize: 'var(--font-size-3xl)', marginBottom: 'var(--spacing-sm)' }}>
                        Volunteer Connect
                    </h1>
                    <p className="text-muted">Sign in to your account</p>
                    <div style={{
                        display: 'inline-block',
                        marginTop: 'var(--spacing-sm)',
                        padding: 'var(--spacing-xs) var(--spacing-md)',
                        backgroundColor: 'var(--color-primary-light)',
                        color: 'var(--color-primary)',
                        borderRadius: 'var(--radius-full)',
                        fontSize: 'var(--font-size-sm)',
                        fontWeight: '600'
                    }}>
                        Tenant: {tenantId.toUpperCase()}
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label" htmlFor="email">
                            Email Address
                        </label>
                        <input
                            id="email"
                            type="email"
                            className="form-input"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            required
                            autoComplete="email"
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="password">
                            Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            className="form-input"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                            autoComplete="current-password"
                        />
                    </div>

                    {error && (
                        <div style={{
                            padding: 'var(--spacing-md)',
                            marginBottom: 'var(--spacing-lg)',
                            backgroundColor: '#fee2e2',
                            color: '#991b1b',
                            borderRadius: 'var(--radius-md)',
                            fontSize: 'var(--font-size-sm)'
                        }}>
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="btn btn-primary btn-lg w-full"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <div className="spinner" style={{ width: '20px', height: '20px', borderWidth: '2px' }}></div>
                        ) : (
                            'Sign In'
                        )}
                    </button>
                </form>

                <div className="mt-lg text-center">
                    <p className="text-muted" style={{ fontSize: 'var(--font-size-sm)' }}>
                        Demo Accounts:<br />
                        <strong>Admin:</strong> admin@example.com / admin123<br />
                        <strong>Volunteer:</strong> volunteer@example.com / volunteer123<br />
                        <strong>Student:</strong> student@example.com / student123
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
