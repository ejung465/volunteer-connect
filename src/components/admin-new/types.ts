import React from 'react';

export interface Activity {
    id: string;
    user: {
        name: string;
        avatar?: string;
        initials?: boolean;
    };
    action: string;
    target: string;
    time: string;
    type: 'log_hours' | 'join' | 'register';
}

export interface StatCardProps {
    title: string;
    value: string;
    icon: string;
    trend?: string;
    trendType?: 'up' | 'down' | 'neutral';
    badge?: string;
    badgeColor?: string;
    customContent?: React.ReactNode;
    onClick?: () => void;
}

export interface QuickActionProps {
    icon: string;
    label: string;
    variant?: 'primary' | 'glass';
    onClick?: () => void;
}
