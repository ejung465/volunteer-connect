import React from 'react';
import { Icon } from './Icon';
import { GlassCard } from './GlassCard';

interface NotificationsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    const notifications = [
        { id: 1, text: "Sarah Lee logged 4 hours", time: "2m ago", icon: "schedule", color: "text-blue-500", bg: "bg-blue-100 dark:bg-blue-900/30" },
        { id: 2, text: "New event 'Beach Cleanup' created", time: "1h ago", icon: "event", color: "text-purple-500", bg: "bg-purple-100 dark:bg-purple-900/30" },
        { id: 3, text: "Reminder: Verify weekly hours", time: "5h ago", icon: "verified", color: "text-emerald-500", bg: "bg-emerald-100 dark:bg-emerald-900/30" },
    ];

    return (
        <div className="absolute inset-0 z-[60] flex flex-col justify-start pointer-events-none">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-transparent pointer-events-auto"
                onClick={onClose}
            />

            {/* Modal Content - Dropdown style */}
            <div className="absolute top-16 right-4 w-80 z-10 pointer-events-auto animate-in fade-in zoom-in-95 duration-200">
                <GlassCard className="!bg-white/95 dark:!bg-slate-900/95 backdrop-blur-2xl border-white/50 shadow-2xl p-0 overflow-hidden">
                    <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-white/5">
                        <h2 className="text-base font-bold text-slate-900 dark:text-white">Notifications</h2>
                        <button
                            onClick={onClose}
                            className="p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                        >
                            <Icon name="close" className="text-slate-500 dark:text-slate-400 text-lg" />
                        </button>
                    </div>

                    <div className="flex flex-col max-h-[60vh] overflow-y-auto">
                        {notifications.map((notif) => (
                            <div key={notif.id} className="flex items-start gap-3 p-4 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors cursor-pointer border-b border-slate-50 dark:border-white/5 last:border-0">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${notif.bg}`}>
                                    <Icon name={notif.icon} className={`${notif.color} text-xl`} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 leading-tight mb-1">{notif.text}</p>
                                    <p className="text-xs text-slate-500">{notif.time}</p>
                                </div>
                                <div className="w-2 h-2 rounded-full bg-primary mt-1.5"></div>
                            </div>
                        ))}
                    </div>
                    <button className="w-full py-3 text-xs font-bold text-primary hover:bg-primary/5 transition-colors border-t border-slate-100 dark:border-white/5">
                        Mark all as read
                    </button>
                </GlassCard>
            </div>
        </div>
    );
};
