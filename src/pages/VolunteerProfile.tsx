import React from 'react';
import { Link } from 'react-router-dom';

const VolunteerProfile: React.FC = () => {
    return (
        <div className="container" style={{ paddingTop: 'var(--spacing-2xl)', paddingBottom: 'var(--spacing-2xl)' }}>
            <div className="fade-in">
                <h1>Volunteer Profile</h1>
                <p className="text-muted">Manage your volunteer profile and preferences</p>

                <div className="card mt-xl">
                    <p className="text-center text-muted">Profile page coming soon...</p>
                    <div className="text-center mt-lg">
                        <Link to="/volunteer" className="btn btn-primary">
                            Back to Dashboard
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VolunteerProfile;
