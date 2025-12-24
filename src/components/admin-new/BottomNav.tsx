import React from 'react';
import { Icon } from './Icon';

interface BottomNavProps {
    activeTab: string;
    onTabChange: (tab: string) => void;
    onActionClick?: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange, onActionClick }) => {
    const getTabClass = (tabName: string) => {
        const isActive = activeTab === tabName;
        return `p-2 flex flex-col items-center justify-center gap-1 transition-all duration-500 ease-out relative z-10 ${isActive ? 'text-primary -translate-y-1' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'}`;
    };

    const getIndicatorClass = (tabName: string) => {
        return `absolute -bottom-2 w-1 h-1 rounded-full bg-primary transition-all duration-300 ${activeTab === tabName ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}`
    }

    return (
        <div className="fixed bottom-6 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
            <nav className="glass-panel-admin w-full max-w-md flex justify-between items-center rounded-full px-4 py-2 shadow-premium pointer-events-auto transform hover:scale-[1.01] transition-transform duration-300">

                <button onClick={() => onTabChange('home')} className={`flex-1 ${getTabClass('home')}`}>
                    <Icon name="home" className={`text-[26px] ${activeTab === 'home' ? 'filled' : ''}`} />
                    <div className={getIndicatorClass('home')}></div>
                </button>

                <button onClick={() => onTabChange('calendar')} className={`flex-1 ${getTabClass('calendar')}`}>
                    <Icon name="calendar_today" className={`text-[24px] ${activeTab === 'calendar' ? 'filled' : ''}`} />
                    <div className={getIndicatorClass('calendar')}></div>
                </button>

                <div className="relative -top-8 px-2 group">
                    <div className="absolute inset-0 bg-primary/30 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <button
                        onClick={onActionClick}
                        className="relative flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white shadow-lg shadow-violet-500/40 hover:shadow-violet-500/60 hover:-translate-y-1 transition-all duration-300 active:scale-95 ring-4 ring-[#f8fafc] dark:ring-[#020617]"
                    >
                        <Icon name="add" className="text-3xl" />
                    </button>
                </div>

                <button onClick={() => onTabChange('chat')} className={`flex-1 ${getTabClass('chat')}`}>
                    <Icon name="chat_bubble" className={`text-[24px] ${activeTab === 'chat' ? 'filled' : ''}`} />
                    <div className={getIndicatorClass('chat')}></div>
                </button>

                <button onClick={() => onTabChange('profile')} className={`flex-1 ${getTabClass('profile')}`}>
                    <Icon name="person" className={`text-[26px] ${activeTab === 'profile' ? 'filled' : ''}`} />
                    <div className={getIndicatorClass('profile')}></div>
                </button>
            </nav>
        </div>
    );
};
