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
    const { logout } = useAuth(); // Assuming Context exposes logout
    const [activeTab, setActiveTab] = useState('home');
    const [selectedStat, setSelectedStat] = useState<string | null>(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [quickAction, setQuickAction] = useState<string | null>(null);

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
    }, []);

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
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-28 font-manrope transition-colors duration-300">
            {/* Header (Floating) */}
            <div className={`p-4 pt-safe-top max-w-md mx-auto relative min-h-screen flex flex-col ${selectedStat ? 'z-50' : ''}`}>

                {/* Back Button for Detail View */}
                {selectedStat && (
                    <div className="flex items-center gap-2 mb-4 animate-in slide-in-from-left duration-300">
                        <button
                            onClick={() => setSelectedStat(null)}
                            className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-white/10 transition-colors"
                        >
                            <Icon name="arrow_back" className="text-slate-900 dark:text-white" />
                        </button>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Back</h2>
                    </div>
                )}

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
                                viewMode={null}
                                onNavigate={(mode) => console.log('Navigate profile', mode)}
                                onLogout={() => { logout?.(); navigate('/login'); }}
                            />
                        )}
                    </>
                )}
            </div>

            {/* Navigation & Modals */}
            <BottomNav
                activeTab={activeTab}
                onTabChange={setActiveTab}
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
        </div>
    );
};

export default AdminDashboard;