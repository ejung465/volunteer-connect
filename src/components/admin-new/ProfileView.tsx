import React, { useState } from 'react';
import { GlassCard } from './GlassCard';
import { Icon } from './Icon';

interface ProfileViewProps {
    viewMode: string | null;
    onNavigate: (mode: string | null) => void;
    onLogout: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ viewMode, onNavigate, onLogout }) => {
    // Mock State for the forms
    const [user, setUser] = useState({
        name: "Emma Wilson",
        role: "Community Coordinator",
        email: "emma.w@volunteer.org",
        phone: "+1 (555) 123-4567",
        location: "San Francisco, CA"
    });

    const [notifs, setNotifs] = useState({
        push: true,
        email: false,
        events: true
    });

    if (viewMode === 'edit') {
        return (
            <div className="flex flex-col gap-4 animate-in slide-in-from-right duration-300">
                <div className="flex justify-center mb-6">
                    <div className="relative">
                        <div className="w-28 h-28 rounded-full p-1 bg-gradient-to-br from-violet-500 to-fuchsia-500">
                            <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&h=256" alt="Profile" className="w-full h-full rounded-full object-cover border-4 border-white dark:border-slate-900" />
                        </div>
                        <button className="absolute bottom-1 right-1 w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center shadow-lg border-2 border-white">
                            <Icon name="camera_alt" className="text-sm" />
                        </button>
                    </div>
                </div>

                <GlassCard className="flex flex-col gap-4">
                    <div>
                        <label className="text-xs font-bold text-slate-500 ml-1">Full Name</label>
                        <input
                            type="text"
                            value={user.name}
                            onChange={e => setUser({ ...user, name: e.target.value })}
                            className="w-full mt-1 p-3 rounded-xl bg-white/50 dark:bg-slate-800/50 border-none focus:ring-2 focus:ring-primary/50 text-slate-900 dark:text-white"
                        />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-500 ml-1">Role</label>
                        <input
                            type="text"
                            value={user.role}
                            onChange={e => setUser({ ...user, role: e.target.value })}
                            className="w-full mt-1 p-3 rounded-xl bg-white/50 dark:bg-slate-800/50 border-none focus:ring-2 focus:ring-primary/50 text-slate-900 dark:text-white"
                        />
                    </div>
                    <button onClick={() => onNavigate(null)} className="w-full py-3 mt-2 rounded-xl bg-primary text-white font-bold shadow-lg shadow-primary/30 active:scale-95 transition-transform">
                        Save Changes
                    </button>
                </GlassCard>
            </div>
        );
    }

    if (viewMode === 'personal') {
        return (
            <div className="flex flex-col gap-4 animate-in slide-in-from-right duration-300">
                <GlassCard className="flex flex-col gap-4">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                            <Icon name="person" className="text-2xl" />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900 dark:text-white">Personal Details</h3>
                            <p className="text-xs text-slate-500">Manage your contact info</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="p-3 rounded-xl bg-white/40 dark:bg-white/5 border border-white/50 dark:border-white/10">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email</label>
                            <p className="font-medium text-slate-900 dark:text-white">{user.email}</p>
                        </div>
                        <div className="p-3 rounded-xl bg-white/40 dark:bg-white/5 border border-white/50 dark:border-white/10">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Phone</label>
                            <p className="font-medium text-slate-900 dark:text-white">{user.phone}</p>
                        </div>
                        <div className="p-3 rounded-xl bg-white/40 dark:bg-white/5 border border-white/50 dark:border-white/10">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Location</label>
                            <p className="font-medium text-slate-900 dark:text-white">{user.location}</p>
                        </div>
                    </div>
                </GlassCard>
            </div>
        );
    }

    if (viewMode === 'notifications') {
        return (
            <div className="flex flex-col gap-4 animate-in slide-in-from-right duration-300">
                <GlassCard>
                    <div className="flex flex-col gap-4">
                        {[
                            { id: 'push', label: 'Push Notifications', desc: 'Receive alerts on your device', icon: 'notifications' },
                            { id: 'email', label: 'Email Digest', desc: 'Daily summary of activity', icon: 'mail' },
                            { id: 'events', label: 'New Events', desc: 'When new sessions are created', icon: 'event' }
                        ].map((item) => (
                            <div key={item.id} className="flex items-center justify-between py-2">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500">
                                        <Icon name={item.icon} />
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-900 dark:text-white text-sm">{item.label}</p>
                                        <p className="text-xs text-slate-500">{item.desc}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setNotifs({ ...notifs, [item.id]: !notifs[item.id as keyof typeof notifs] })}
                                    className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${notifs[item.id as keyof typeof notifs] ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-700'}`}
                                >
                                    <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-300 ${notifs[item.id as keyof typeof notifs] ? 'translate-x-6' : 'translate-x-0'}`}></div>
                                </button>
                            </div>
                        ))}
                    </div>
                </GlassCard>
            </div>
        );
    }

    if (viewMode === 'privacy') {
        return (
            <div className="flex flex-col gap-4 animate-in slide-in-from-right duration-300">
                <GlassCard className="flex flex-col gap-1">
                    <button className="flex items-center justify-between p-4 hover:bg-white/40 dark:hover:bg-white/5 rounded-xl transition-colors">
                        <span className="font-medium text-slate-900 dark:text-white">Change Password</span>
                        <Icon name="chevron_right" className="text-slate-400" />
                    </button>
                    <div className="h-px bg-slate-200 dark:bg-white/10 mx-4"></div>
                    <div className="flex items-center justify-between p-4">
                        <span className="font-medium text-slate-900 dark:text-white">Two-Factor Authentication</span>
                        <div className="w-12 h-6 rounded-full bg-slate-300 dark:bg-slate-700 p-1">
                            <div className="w-4 h-4 rounded-full bg-white shadow-sm"></div>
                        </div>
                    </div>
                </GlassCard>
            </div>
        )
    }

    if (viewMode === 'help') {
        return (
            <div className="flex flex-col gap-4 animate-in slide-in-from-right duration-300">
                <GlassCard className="space-y-2">
                    <h3 className="font-bold mb-2 text-slate-900 dark:text-white">FAQ</h3>
                    {['How do I approve hours?', 'Can I export reports?', 'How to add a new admin?'].map((q, i) => (
                        <div key={i} className="p-3 rounded-xl bg-white/40 dark:bg-white/5 border border-white/50 dark:border-white/10 text-sm font-medium text-slate-700 dark:text-slate-200">
                            {q}
                        </div>
                    ))}
                    <button className="w-full py-3 mt-4 text-primary font-bold text-sm bg-primary/10 rounded-xl">Contact Support</button>
                </GlassCard>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-6 pb-24 animate-in fade-in duration-300">
            <div className="flex flex-col items-center mt-4">
                <div className="relative">
                    <div className="w-28 h-28 rounded-full p-1 bg-gradient-to-br from-violet-500 to-fuchsia-500">
                        <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&h=256" alt="Profile" className="w-full h-full rounded-full object-cover border-4 border-white dark:border-slate-900" />
                    </div>
                    <button
                        onClick={() => onNavigate('edit')}
                        className="absolute bottom-1 right-1 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center shadow-lg border-2 border-white dark:border-slate-900 active:scale-95 transition-transform"
                    >
                        <Icon name="edit" className="text-sm" />
                    </button>
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-3">{user.name}</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">{user.role}</p>

                <div className="flex gap-4 mt-6 w-full px-4">
                    <GlassCard className="flex-1 flex flex-col items-center py-4 gap-1">
                        <span className="text-2xl font-bold text-slate-900 dark:text-white">42</span>
                        <span className="text-xs text-slate-500">Events</span>
                    </GlassCard>
                    <GlassCard className="flex-1 flex flex-col items-center py-4 gap-1">
                        <span className="text-2xl font-bold text-slate-900 dark:text-white">128h</span>
                        <span className="text-xs text-slate-500">Hours</span>
                    </GlassCard>
                </div>
            </div>

            <div className="flex flex-col gap-3">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white px-1 uppercase opacity-60 ml-2">Settings</h3>

                <div className="bg-white/40 dark:bg-slate-800/40 rounded-3xl p-2">
                    {[
                        { id: 'personal', icon: 'person', label: 'Personal Information' },
                        { id: 'notifications', icon: 'notifications', label: 'Notifications', badge: '2' },
                        { id: 'privacy', icon: 'lock', label: 'Privacy & Security' },
                        { id: 'help', icon: 'help', label: 'Help & Support' },
                    ].map((item) => (
                        <button
                            key={item.id}
                            onClick={() => onNavigate(item.id)}
                            className="w-full flex items-center justify-between p-4 hover:bg-white/50 dark:hover:bg-white/5 rounded-2xl transition-colors group active:scale-[0.99]"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-white/60 dark:bg-white/10 flex items-center justify-center text-slate-600 dark:text-slate-300">
                                    <Icon name={item.icon} />
                                </div>
                                <span className="font-medium text-slate-700 dark:text-slate-200">{item.label}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                {item.badge && <span className="w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">{item.badge}</span>}
                                <Icon name="chevron_right" className="text-slate-400 group-hover:text-primary transition-colors" />
                            </div>
                        </button>
                    ))}
                </div>

                <button
                    onClick={onLogout}
                    className="flex items-center justify-center gap-2 p-4 mt-2 rounded-2xl text-red-500 font-bold hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors active:scale-95"
                >
                    <Icon name="logout" />
                    Log Out
                </button>
            </div>
        </div>
    );
};
