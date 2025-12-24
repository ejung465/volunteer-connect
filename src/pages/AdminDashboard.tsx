import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import {
    BottomNav,
    HomeView,
    CalendarView,
    ChatView,
    ProfileView,
    StatsDetailView,
    AddModal,
    QuickActionModal,
    NotificationsModal,
    Icon,
    GlassCard
} from '../components/admin-new';
import { useAuth } from '../contexts/AuthContext';

interface Student {
    id: number;
    firstName: string;
    lastName: string;
    photoUrl?: string;
    gradeLevel: number;
    progressSummary?: string;
    email?: string;
}

interface Volunteer {
    id: number;
    firstName: string;
    lastName: string;
    photoUrl?: string;
    totalHours: number;
    email?: string;
}

interface Session {
    id: number;
    title?: string;
    sessionDate: string;
    attendanceCount: number;
}

interface Attendance {
    id: number;
    sessionId: number;
    volunteerId: number;
    studentId: number;
    hoursLogged: number;
    studentFirstName?: string;
    studentLastName?: string;
    volunteerFirstName?: string;
    volunteerLastName?: string;
}

const AdminDashboard: React.FC = () => {
    const navigate = useNavigate();
    const { logout } = useAuth();

    // UI State
    const [activeTab, setActiveTab] = useState('home');
    const [selectedStat, setSelectedStat] = useState<string | null>(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [quickAction, setQuickAction] = useState<string | null>(null);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [hasUnreadNotifications, setHasUnreadNotifications] = useState(true);
    const [profileViewMode, setProfileViewMode] = useState<string | null>(null);

    // Data States
    const [students, setStudents] = useState<Student[]>([]);
    const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
    const [sessions, setSessions] = useState<Session[]>([]);
    const [attendanceRecords, setAttendanceRecords] = useState<Attendance[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [volunteerHoursEdits, setVolunteerHoursEdits] = useState<{ [key: number]: number }>({});
    const [selectedSessionForHours, setSelectedSessionForHours] = useState<number | null>(null);

    // Initial Data Fetch
    useEffect(() => {
        fetchData();
        // Check local storage or system pref for dark mode if needed
        if (document.documentElement.classList.contains('dark')) {
            setIsDarkMode(true);
        }
    }, []);

    const toggleTheme = () => {
        setIsDarkMode(!isDarkMode);
        if (!isDarkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    };

    const handleNotificationsClick = () => {
        setIsNotificationsOpen(!isNotificationsOpen);
        if (hasUnreadNotifications) {
            setHasUnreadNotifications(false);
        }
    };

    const handleBack = () => {
        if (selectedStat) {
            setSelectedStat(null);
            return;
        }
        if (profileViewMode) {
            setProfileViewMode(null);
            return;
        }
    };

    const getHeaderTitle = () => {
        if (selectedStat) return 'Details';

        if (activeTab === 'profile' && profileViewMode) {
            switch (profileViewMode) {
                case 'edit': return 'Edit Profile';
                case 'personal': return 'Personal Info';
                case 'notifications': return 'Notifications';
                case 'privacy': return 'Security';
                case 'help': return 'Help Center';
                default: return 'My Profile';
            }
        }

        switch (activeTab) {
            case 'home': return 'Dashboard';
            case 'calendar': return 'Schedule';
            case 'chat': return 'Inbox';
            case 'profile': return 'Profile';
            default: return 'VolunteerConnect';
        }
    };

    const showBackButton = selectedStat || (activeTab === 'profile' && profileViewMode);

    const fetchData = async () => {
        try {
            const [studentsData, volunteersData, sessionsData] = await Promise.all([
                api.get('/api/students').catch(() => []),
                api.get('/api/volunteers').catch(() => []),
                api.get('/api/sessions').catch(() => []),
            ]);
            setStudents(Array.isArray(studentsData) ? studentsData : []);
            setVolunteers(Array.isArray(volunteersData) ? volunteersData : []);
            setSessions(Array.isArray(sessionsData) ? sessionsData : []);
            setIsLoading(false);
        } catch (error) {
            console.error('Failed to fetch data:', error);
            setIsLoading(false);
        }
    };

    const fetchAttendanceForSession = async (sessionId: number) => {
        try {
            const attendance = await api.get(`/api/sessions/${sessionId}/attendance`);
            setAttendanceRecords(Array.isArray(attendance) ? attendance : []);
        } catch (error) {
            console.error('Failed to fetch attendance:', error);
            setAttendanceRecords([]);
        }
    };

    // --- Actions ---

    const handleQuickActionSubmit = async (action: string, data: any) => {
        try {
            if (action === 'add_member') {
                // Extract name
                const nameParts = data.name ? data.name.trim().split(' ') : ['New', 'User'];
                const firstName = nameParts[0];
                const lastName = nameParts.slice(1).join(' ') || 'User';

                await api.post('/api/admin/users', {
                    firstName,
                    lastName,
                    email: data.email,
                    role: data.role || 'volunteer',
                    password: 'password123', // Default for now, as UI doesn't have it
                    gradeLevel: 1 // Default
                });
                fetchData();
            } else if (action === 'create_session') {
                const dateTime = `${data.date}T${data.time}`;
                await api.post('/api/sessions', {
                    title: data.title || 'Tutoring Session',
                    session_date: dateTime
                });
                fetchData();
            } else if (action === 'send_alert') {
                // Mock alert sending
                console.log('Sending alert:', data);
                alert('Alert sent successfully!');
            }
        } catch (error: any) {
            console.error('Action failed:', error);
            throw error; // Re-throw to let modal handle error state if needed
        }
    };

    // Helper to map data for StatsDetailView
    const getMappedData = (statId: string) => {
        if (statId === 'members') {
            return [
                ...students.map(s => ({
                    id: s.id,
                    name: `${s.firstName} ${s.lastName}`,
                    sub: `Student • Grade ${s.gradeLevel}`,
                    role: 'student',
                    email: s.email,
                    initials: `${s.firstName[0]}${s.lastName[0]}`,
                    action: 'Detail'
                })),
                ...volunteers.map(v => ({
                    id: v.id,
                    name: `${v.firstName} ${v.lastName}`,
                    sub: `Volunteer • ${v.totalHours} hrs`,
                    role: 'volunteer',
                    email: v.email,
                    initials: `${v.firstName[0]}${v.lastName[0]}`,
                    action: 'Detail'
                }))
            ].sort((a, b) => a.name.localeCompare(b.name));
        }
        if (statId === 'sessions') {
            const now = new Date();
            return sessions.map(s => {
                const sDate = new Date(s.sessionDate);
                const isPast = sDate < now;
                return {
                    id: s.id,
                    name: s.title || 'Session',
                    sub: `${sDate.toLocaleDateString()} ${sDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • ${s.attendanceCount} Attendees`,
                    status: isPast ? 'Completed' : 'Upcoming',
                    statusColor: isPast ? 'text-slate-500' : 'text-emerald-500',
                    icon: 'event'
                };
            }).sort((a, b) => new Date(b.sub.split('•')[0]).getTime() - new Date(a.sub.split('•')[0]).getTime());
        }
        // Placeholder for hours/approvals
        return undefined;
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
                <div className="spinner border-4 border-primary border-t-transparent rounded-full w-12 h-12 animate-spin"></div>
            </div>
        );
    }

    return (
        <>
            {/* Premium Background Ambience */}
            <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none bg-[#f8fafc] dark:bg-[#020617]">
                <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-gradient-to-br from-purple-400/20 to-indigo-400/20 dark:from-purple-900/20 dark:to-indigo-900/20 blur-[100px] opacity-70 animate-float"></div>
                <div className="absolute bottom-[0%] left-[-10%] w-[400px] h-[400px] rounded-full bg-gradient-to-tr from-blue-400/20 to-cyan-400/20 dark:from-blue-900/20 dark:to-cyan-900/20 blur-[80px] opacity-60"></div>
                <div className="absolute top-[40%] left-[20%] w-[300px] h-[300px] rounded-full bg-fuchsia-400/10 dark:bg-fuchsia-900/10 blur-[90px] animate-pulse"></div>
            </div>

            <div className="relative z-10 flex flex-col min-h-screen w-full max-w-md mx-auto transition-all duration-300">

                {/* Floating Header */}
                <div className="fixed top-5 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
                    <header className="glass-panel w-full max-w-md rounded-full px-5 py-3 shadow-premium pointer-events-auto transition-all duration-300 transform hover:scale-[1.01]">
                        <div className="flex items-center justify-between">
                            <button
                                onClick={showBackButton ? handleBack : toggleTheme}
                                className="flex size-10 items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-white/10 transition-all active:scale-95 group"
                            >
                                <Icon name={showBackButton ? "arrow_back" : (isDarkMode ? "light_mode" : "dark_mode")} className="text-slate-600 dark:text-slate-200 text-xl group-hover:text-primary transition-colors" />
                            </button>

                            <div className="flex flex-col items-center">
                                <h1 className="text-base font-extrabold tracking-tight text-slate-900 dark:text-white mb-0">{getHeaderTitle()}</h1>
                            </div>

                            <button
                                onClick={handleNotificationsClick}
                                className="flex size-10 items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-white/10 transition-all active:scale-95 relative group"
                            >
                                <Icon name={isNotificationsOpen ? "notifications_active" : "notifications"} className={`text-xl transition-colors ${isNotificationsOpen ? 'text-primary' : 'text-slate-600 dark:text-slate-200 group-hover:text-primary'}`} />
                                {hasUnreadNotifications && (
                                    <span className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-slate-900"></span>
                                )}
                            </button>
                        </div>
                    </header>
                </div>

                {/* Content Area */}
                <div className={`flex-1 flex flex-col pt-28 px-5 gap-6 pb-28 overflow-y-auto hide-scrollbar`}>
                    {/* Views */}
                    {selectedStat ? (
                        <StatsDetailView statId={selectedStat} items={getMappedData(selectedStat)} />
                    ) : (
                        <>
                            {activeTab === 'home' && (
                                <HomeView
                                    onStatClick={setSelectedStat}
                                    onQuickAction={(action) => setQuickAction(action)}
                                />
                            )}
                            {activeTab === 'calendar' && <CalendarView />} {/* TODO: Pass sessions data here */}
                            {activeTab === 'chat' && <ChatView />}
                            {activeTab === 'profile' && (
                                <ProfileView
                                    viewMode={profileViewMode}
                                    onNavigate={setProfileViewMode}
                                    onLogout={() => { logout?.(); navigate('/login'); }}
                                />
                            )}
                        </>
                    )}
                </div>

                {/* Navigation & Modals */}
                <BottomNav
                    activeTab={activeTab}
                    onTabChange={(tab) => {
                        setActiveTab(tab);
                        setSelectedStat(null);
                        setProfileViewMode(null);
                    }}
                    onActionClick={() => setIsAddModalOpen(true)}
                />

                <AddModal
                    isOpen={isAddModalOpen}
                    onClose={() => setIsAddModalOpen(false)}
                    onSelectAction={setQuickAction}
                />

                <QuickActionModal
                    isOpen={!!quickAction}
                    onClose={() => setQuickAction(null)}
                    action={quickAction}
                    onSubmit={handleQuickActionSubmit}
                />

                <NotificationsModal
                    isOpen={isNotificationsOpen}
                    onClose={() => setIsNotificationsOpen(false)}
                />
            </div>
        </>
    );
};

export default AdminDashboard;