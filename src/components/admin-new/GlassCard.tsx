import React from 'react';

interface GlassCardProps {
    children: React.ReactNode;
    className?: string;
    onClick?: () => void;
}

export const GlassCard: React.FC<GlassCardProps> = ({ children, className = "", onClick }) => {
    return (
        <div
            onClick={onClick}
            className={`glass-card rounded-3xl p-4 relative overflow-hidden group transition-all duration-300 ${className}`}
        >
            {children}
        </div>
    );
};
