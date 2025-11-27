import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './components/Login';
import AdminDashboard from './pages/AdminDashboard';
import VolunteerDashboard from './pages/VolunteerDashboard';
import StudentDashboard from './pages/StudentDashboard';
import StudentProfile from './pages/StudentProfile';
import VolunteerProfile from './pages/VolunteerProfile';
import Navbar from './components/Navbar';

const AppRoutes: React.FC = () => {
    const { user } = useAuth();

    const getDefaultRoute = () => {
        if (!user) return '/login';
        switch (user.role) {
            case 'admin':
                return '/admin';
            case 'volunteer':
                return '/volunteer';
            case 'student':
                return '/student';
            default:
                return '/login';
        }
    };

    return (
        <>
            {user && <Navbar />}
            <Routes>
                {/* Tenant-based routing - all routes nested under /:tenantId */}
                <Route path="/:tenantId">
                    <Route path="login" element={user ? <Navigate to={`/${window.location.pathname.split('/')[1]}${getDefaultRoute()}`} replace /> : <Login />} />

                    {/* Admin Routes */}
                    <Route
                        path="admin"
                        element={
                            <ProtectedRoute allowedRoles={['admin']}>
                                <AdminDashboard />
                            </ProtectedRoute>
                        }
                    />

                    {/* Volunteer Routes */}
                    <Route
                        path="volunteer"
                        element={
                            <ProtectedRoute allowedRoles={['volunteer']}>
                                <VolunteerDashboard />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="volunteer/profile"
                        element={
                            <ProtectedRoute allowedRoles={['volunteer']}>
                                <VolunteerProfile />
                            </ProtectedRoute>
                        }
                    />

                    {/* Student Routes */}
                    <Route
                        path="student"
                        element={
                            <ProtectedRoute allowedRoles={['student']}>
                                <StudentDashboard />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="student/:id"
                        element={
                            <ProtectedRoute allowedRoles={['admin', 'volunteer', 'student']}>
                                <StudentProfile />
                            </ProtectedRoute>
                        }
                    />

                    {/* Default route within tenant */}
                    <Route index element={<Navigate to="login" replace />} />
                </Route>

                {/* Root redirect to tenant-a */}
                <Route path="/" element={<Navigate to="/tenant-a/login" replace />} />
                <Route path="*" element={<Navigate to="/tenant-a/login" replace />} />
            </Routes>
        </>
    );
};

const App: React.FC = () => {
    return (
        <Router>
            <AuthProvider>
                <AppRoutes />
            </AuthProvider>
        </Router>
    );
};

export default App;
