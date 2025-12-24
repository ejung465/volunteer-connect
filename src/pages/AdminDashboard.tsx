import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../utils/api';

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

type TabType = 'members' | 'sessions' | 'volunteerHours';

const AdminDashboard: React.FC = () => {
    const navigate = useNavigate();
    const [students, setStudents] = useState<Student[]>([]);
    const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
    const [sessions, setSessions] = useState<Session[]>([]);
    const [attendanceRecords, setAttendanceRecords] = useState<Attendance[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<TabType>('members');

    // Modal States
    const [showCreateSession, setShowCreateSession] = useState(false);
    const [newSessionDate, setNewSessionDate] = useState('');
    const [newSessionTitle, setNewSessionTitle] = useState('Weekly Tutoring');
    const [sessionTitleType, setSessionTitleType] = useState<'weekly' | 'custom'>('weekly');

    const [showCreateUser, setShowCreateUser] = useState(false);
    const [newUser, setNewUser] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        role: 'volunteer',
        gradeLevel: 1,
        bio: ''
    });

    const [memberSearch, setMemberSearch] = useState('');
    const [memberTypeFilter, setMemberTypeFilter] = useState<'all' | 'student' | 'volunteer'>('all');
    const [sessionSearch, setSessionSearch] = useState('');
    const [memberToRemove, setMemberToRemove] = useState<{ id: number; name: string; type: 'student' | 'volunteer' } | null>(null);
    const [volunteerHoursEdits, setVolunteerHoursEdits] = useState<{ [key: number]: number }>({});
    const [selectedSessionForHours, setSelectedSessionForHours] = useState<number | null>(null);
    const [selectedSessionDetails, setSelectedSessionDetails] = useState<Session | null>(null);

    // Initial Data Fetch
    useEffect(() => {
        fetchData();
    }, []);

    // Fetch dependent data
    useEffect(() => {
        if (activeTab === 'volunteerHours' && selectedSessionForHours) {
            fetchAttendanceForSession(selectedSessionForHours);
        }
    }, [activeTab, selectedSessionForHours]);

    useEffect(() => {
        if (selectedSessionDetails) {
            fetchAttendanceForSession(selectedSessionDetails.id);
        }
    }, [selectedSessionDetails]);

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
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
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

    // --- Action Handlers ---
    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/api/admin/users', newUser);
            setShowCreateUser(false);
            setNewUser({ firstName: '', lastName: '', email: '', password: '', role: 'volunteer', gradeLevel: 1, bio: '' });
            fetchData();
        } catch (error: any) {
            console.error('Failed to create user:', error);
            alert(error.response?.data?.error || 'Failed to create user');
        }
    };

    const handleCreateSession = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const title = sessionTitleType === 'weekly' ? 'Weekly Tutoring' : newSessionTitle;
            await api.post('/api/sessions', { session_date: newSessionDate, title });
            setShowCreateSession(false);
            // reset form
            setNewSessionDate('');
            setNewSessionTitle('Weekly Tutoring');
            setSessionTitleType('weekly');
            fetchData();
        } catch (error: any) {
            console.error('Failed to create session:', error);
            alert('Failed to create session.');
        }
    };

    const handleRemoveMember = async () => {
        if (!memberToRemove) return;
        try {
            if (memberToRemove.type === 'student') await api.delete(`/api/admin/students/${memberToRemove.id}`);
            else await api.delete(`/api/admin/volunteers/${memberToRemove.id}`);
            setMemberToRemove(null);
            fetchData();
        } catch (error: any) {
            console.error('Failed to remove member:', error);
            alert('Failed to remove member');
        }
    };

    const handleUpdateVolunteerHours = async (attendanceId: number, hours: number) => {
        setVolunteerHoursEdits({ ...volunteerHoursEdits, [attendanceId]: hours });
    };

    const handlePublishVolunteerHours = async () => {
        try {
            for (const [attendanceId, hours] of Object.entries(volunteerHoursEdits)) {
                await api.put(`/api/sessions/attendance/${attendanceId}`, { hours_logged: parseFloat(hours as any) });
            }
            setVolunteerHoursEdits({});
            if (selectedSessionForHours) fetchAttendanceForSession(selectedSessionForHours);
            alert('Volunteer hours published successfully!');
        } catch (error: any) {
            alert('Failed to publish volunteer hours');
        }
    };

    // Data Filtering
    const allMembers = [
        ...students.map(s => ({ ...s, type: 'student' as const })),
        ...volunteers.map(v => ({ ...v, type: 'volunteer' as const }))
    ].sort((a, b) => `${a.lastName}`.localeCompare(b.lastName));

    const filteredMembers = allMembers.filter(m =>
        `${m.firstName} ${m.lastName}`.toLowerCase().includes(memberSearch.toLowerCase()) &&
        (memberTypeFilter === 'all' || m.type === memberTypeFilter)
    );

    const now = new Date();
    const pastSessions = sessions.filter(s => new Date(s.sessionDate) < now)
        .sort((a, b) => new Date(b.sessionDate).getTime() - new Date(a.sessionDate).getTime());
    const futureSessions = sessions.filter(s => new Date(s.sessionDate) >= now)
        .sort((a, b) => new Date(a.sessionDate).getTime() - new Date(b.sessionDate).getTime());

    const allSessionsList = [...futureSessions, ...pastSessions];
    const filteredSessions = allSessionsList.filter(s =>
        (s.title || 'Weekly Tutoring').toLowerCase().includes(sessionSearch.toLowerCase()) ||
        new Date(s.sessionDate).toLocaleDateString().includes(sessionSearch)
    );

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-background-light dark:bg-background-dark">
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <div className="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-white transition-colors duration-300 min-h-screen">
            {/* Background Blobs */}
            <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-[10%] -left-[10%] w-[60%] h-[60%] rounded-full bg-purple-400/20 dark:bg-purple-600/20 blur-3xl"></div>
                <div className="absolute top-[20%] -right-[10%] w-[50%] h-[50%] rounded-full bg-fuchsia-400/20 dark:bg-fuchsia-600/20 blur-3xl"></div>
                <div className="absolute bottom-[10%] left-[20%] w-[70%] h-[40%] rounded-full bg-violet-300/20 dark:bg-violet-600/10 blur-3xl"></div>
            </div>

            {/* Main Container */}
            <div className="relative z-10 flex flex-col min-h-screen w-full max-w-4xl mx-auto shadow-2xl overflow-hidden bg-white/30 dark:bg-slate-900/20 border-x border-white/40 dark:border-white/10 backdrop-blur-sm">
                {/* Header */}
                <header className="sticky top-0 z-50 glass-panel border-b-0 pb-2">
                    <div className="flex items-center justify-between p-4">
                        <button onClick={() => navigate('/')} className="flex size-10 items-center justify-center rounded-full hover:bg-slate-900/5 dark:hover:bg-white/10 transition-colors">
                            <span className="material-symbols-outlined text-slate-800 dark:text-white text-2xl">arrow_back</span>
                        </button>
                        <h1 className="text-lg font-bold leading-tight text-slate-900 dark:text-white mb-0">Admin Dashboard</h1>
                        <button className="flex size-10 items-center justify-center rounded-full hover:bg-slate-900/5 dark:hover:bg-white/10 transition-colors relative">
                            <span className="material-symbols-outlined text-slate-800 dark:text-white text-2xl">notifications</span>
                            <span className="absolute top-2 right-2.5 h-2 w-2 rounded-full bg-red-500 border border-white"></span>
                        </button>
                    </div>

                    {/* Tabs */}
                    <div className="flex px-4 justify-between items-end">
                        <button onClick={() => setActiveTab('members')} className={`flex flex-col items-center justify-center border-b-[3px] pb-2 flex-1 group transition-colors ${activeTab === 'members' ? 'border-primary' : 'border-transparent hover:border-slate-300 dark:hover:border-white/10'}`}>
                            <p className={`text-sm font-bold leading-normal tracking-wide transition-colors ${activeTab === 'members' ? 'text-primary' : 'text-slate-500 dark:text-gray-400 group-hover:text-primary'}`}>Members</p>
                        </button>
                        <button onClick={() => setActiveTab('sessions')} className={`flex flex-col items-center justify-center border-b-[3px] pb-2 flex-1 group transition-colors ${activeTab === 'sessions' ? 'border-primary' : 'border-transparent hover:border-slate-300 dark:hover:border-white/10'}`}>
                            <p className={`text-sm font-bold leading-normal tracking-wide transition-colors ${activeTab === 'sessions' ? 'text-primary' : 'text-slate-500 dark:text-gray-400 group-hover:text-primary'}`}>Sessions</p>
                        </button>
                        <button onClick={() => setActiveTab('volunteerHours')} className={`flex flex-col items-center justify-center border-b-[3px] pb-2 flex-1 group transition-colors ${activeTab === 'volunteerHours' ? 'border-primary' : 'border-transparent hover:border-slate-300 dark:hover:border-white/10'}`}>
                            <p className={`text-sm font-bold leading-normal tracking-wide transition-colors ${activeTab === 'volunteerHours' ? 'text-primary' : 'text-slate-500 dark:text-gray-400 group-hover:text-primary'}`}>Hours</p>
                        </button>
                    </div>
                </header>

                {/* Dashboard Stats (Visible on all tabs or specific logic? - Let's keep it above or only on a "Home" tab. The HTML didn't strictly show it, but the previous dashboard did. Let's put concise stats at the top of the Members tab as a summary.) */}

                {/* Content Area */}
                <main className="flex-1 flex flex-col p-4 gap-6 overflow-y-auto hide-scrollbar pb-24">

                    {/* MEMBERS TAB */}
                    {activeTab === 'members' && (
                        <>
                            {/* Search */}
                            <div className="relative w-full">
                                <div className="glass-card flex items-center h-12 rounded-2xl px-4 transition-all focus-within:ring-2 focus-within:ring-primary/50">
                                    <span className="material-symbols-outlined text-primary/70 text-2xl mr-3">search</span>
                                    <input
                                        className="bg-transparent border-none outline-none text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-gray-400/60 w-full font-medium h-full focus:ring-0 p-0"
                                        placeholder="Search members..."
                                        type="text"
                                        value={memberSearch}
                                        onChange={(e) => setMemberSearch(e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* Filters & Add Button */}
                            <div className="flex flex-col gap-4">
                                <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-1">
                                    <button onClick={() => setMemberTypeFilter('all')} className={`flex h-9 shrink-0 items-center justify-center px-5 rounded-full transition-colors ${memberTypeFilter === 'all' ? 'bg-gradient-to-r from-violet-600 to-fuchsia-500 text-white shadow-lg shadow-violet-500/30' : 'glass-card hover:bg-white/60 dark:hover:bg-white/10 text-slate-800 dark:text-white'}`}>
                                        <span className="text-sm font-bold">All</span>
                                    </button>
                                    <button onClick={() => setMemberTypeFilter('student')} className={`flex h-9 shrink-0 items-center justify-center px-5 rounded-full transition-colors ${memberTypeFilter === 'student' ? 'bg-gradient-to-r from-violet-600 to-fuchsia-500 text-white shadow-lg shadow-violet-500/30' : 'glass-card hover:bg-white/60 dark:hover:bg-white/10 text-slate-800 dark:text-white'}`}>
                                        <span className="text-sm font-medium">Student</span>
                                    </button>
                                    <button onClick={() => setMemberTypeFilter('volunteer')} className={`flex h-9 shrink-0 items-center justify-center px-5 rounded-full transition-colors ${memberTypeFilter === 'volunteer' ? 'bg-gradient-to-r from-violet-600 to-fuchsia-500 text-white shadow-lg shadow-violet-500/30' : 'glass-card hover:bg-white/60 dark:hover:bg-white/10 text-slate-800 dark:text-white'}`}>
                                        <span className="text-sm font-medium">Volunteer</span>
                                    </button>
                                </div>
                                <button onClick={() => setShowCreateUser(true)} className="w-full h-12 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-500 text-white font-bold text-base flex items-center justify-center gap-2 shadow-lg shadow-violet-500/30 hover:shadow-violet-500/50 transition-all active:scale-[0.98]">
                                    <span className="material-symbols-outlined text-xl">add</span>
                                    Add Member
                                </button>
                            </div>

                            {/* Members Grid */}
                            <div className="grid grid-cols-2 gap-4">
                                {filteredMembers.map(member => (
                                    <div key={`${member.type}-${member.id}`} className="glass-card relative flex flex-col items-center p-4 rounded-[24px] gap-3 group">
                                        <button
                                            onClick={() => setMemberToRemove({ id: member.id, name: `${member.firstName} ${member.lastName}`, type: member.type })}
                                            className="absolute top-3 right-3 h-6 w-6 flex items-center justify-center rounded-full bg-slate-100 dark:bg-white/10 hover:bg-red-100 hover:text-red-600 transition-colors"
                                        >
                                            <span className="material-symbols-outlined text-sm">close</span>
                                        </button>
                                        <div className="relative">
                                            <div className={`h-16 w-16 rounded-full p-[2px] bg-gradient-to-br ${member.type === 'student' ? 'from-blue-400 to-cyan-300' : 'from-teal-400 to-emerald-400'}`}>
                                                {member.photoUrl ? (
                                                    <img alt={`${member.firstName} ${member.lastName}`} className="h-full w-full rounded-full object-cover border-2 border-white dark:border-gray-800" src={member.photoUrl} />
                                                ) : (
                                                    <div className="h-full w-full rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center text-white font-bold text-xl uppercase">
                                                        {member.firstName[0]}{member.lastName[0]}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="text-center">
                                            <h3 className="font-bold text-slate-900 dark:text-white text-base leading-tight">{member.firstName} {member.lastName}</h3>
                                            <div className={`mt-2 inline-flex px-2.5 py-1 rounded-lg border ${member.type === 'student' ? 'bg-gradient-to-r from-blue-500/10 to-cyan-400/10 border-blue-200/20 dark:border-blue-500/20' : 'bg-gradient-to-r from-teal-500/10 to-emerald-400/10 border-teal-200/20 dark:border-teal-500/20'}`}>
                                                <span className={`text-xs font-bold ${member.type === 'student' ? 'text-blue-600 dark:text-blue-300' : 'text-teal-600 dark:text-teal-300'}`}>
                                                    {member.type === 'student' ? 'Student' : 'Volunteer'}
                                                </span>
                                            </div>
                                            <p className="mt-2 text-xs font-medium text-slate-500 dark:text-gray-400">
                                                {member.type === 'student'
                                                    ? `Grade ${(member as Student).gradeLevel}`
                                                    : `${(member as Volunteer).totalHours} Hours`
                                                }
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}

                    {/* SESSIONS TAB */}
                    {activeTab === 'sessions' && (
                        <>
                            {/* Stats Row for Sessions */}
                            <div className="grid grid-cols-3 gap-3 mb-2">
                                <div className="glass-card p-3 rounded-2xl flex flex-col items-center">
                                    <span className="text-2xl font-bold text-primary">{sessions.length}</span>
                                    <span className="text-[10px] uppercase font-bold text-slate-500">Total</span>
                                </div>
                                <div className="glass-card p-3 rounded-2xl flex flex-col items-center">
                                    <span className="text-2xl font-bold text-green-500">{futureSessions.length}</span>
                                    <span className="text-[10px] uppercase font-bold text-slate-500">Upcoming</span>
                                </div>
                                <div className="glass-card p-3 rounded-2xl flex flex-col items-center">
                                    <span className="text-2xl font-bold text-slate-500">{pastSessions.length}</span>
                                    <span className="text-[10px] uppercase font-bold text-slate-500">Past</span>
                                </div>
                            </div>

                            <button onClick={() => setShowCreateSession(true)} className="w-full h-12 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-500 text-white font-bold text-base flex items-center justify-center gap-2 shadow-lg shadow-violet-500/30 hover:shadow-violet-500/50 transition-all active:scale-[0.98]">
                                <span className="material-symbols-outlined text-xl">add</span>
                                New Session
                            </button>

                            <div className="flex flex-col gap-4 mt-2">
                                <h3 className="font-bold text-lg text-slate-900 dark:text-white">Upcoming Sessions</h3>
                                {filteredSessions.filter(s => new Date(s.sessionDate) >= now).length === 0 ? (
                                    <p className="text-slate-500 text-center text-sm">No upcoming sessions.</p>
                                ) : (
                                    filteredSessions.filter(s => new Date(s.sessionDate) >= now).map(session => (
                                        <div key={session.id} className="glass-card p-4 rounded-[20px] flex justify-between items-center group cursor-pointer" onClick={() => setSelectedSessionDetails(session)}>
                                            <div className="flex items-center gap-4">
                                                <div className="h-12 w-12 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center text-violet-600 dark:text-violet-300 font-bold">
                                                    {new Date(session.sessionDate).getDate()}
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-slate-900 dark:text-white">{session.title}</h4>
                                                    <p className="text-xs text-slate-500">{new Date(session.sessionDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {session.attendanceCount} Attendees</p>
                                                </div>
                                            </div>
                                            <span className="material-symbols-outlined text-slate-400">chevron_right</span>
                                        </div>
                                    ))
                                )}

                                <h3 className="font-bold text-lg text-slate-900 dark:text-white mt-4">Past History</h3>
                                {filteredSessions.filter(s => new Date(s.sessionDate) < now).map(session => (
                                    <div key={session.id} className="glass-card p-4 rounded-[20px] opacity-75">
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 font-bold text-xs">
                                                {new Date(session.sessionDate).getMonth() + 1}/{new Date(session.sessionDate).getDate()}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-700 dark:text-slate-300 text-sm">{session.title}</h4>
                                                <p className="text-xs text-slate-500">{session.attendanceCount} Attendees</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}

                    {/* VOLUNTEER HOURS TAB */}
                    {activeTab === 'volunteerHours' && (
                        <>
                            <div className="glass-card p-6 rounded-[24px] text-center mb-4">
                                <h2 className="text-xl font-bold bg-gradient-to-r from-violet-600 to-fuchsia-500 bg-clip-text text-transparent mb-2">Manage Hours</h2>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Review and approve volunteer time logs.</p>
                            </div>

                            <div className="form-group mb-4">
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-2 mb-1 block">Select Session</label>
                                <select
                                    className="w-full p-3 rounded-xl glass-input bg-white/50 dark:bg-black/20 border border-white/40 focus:border-primary outline-none"
                                    value={selectedSessionForHours || ''}
                                    onChange={(e) => {
                                        const sid = Number(e.target.value);
                                        setSelectedSessionForHours(sid);
                                        if (sid) fetchAttendanceForSession(sid);
                                    }}
                                >
                                    <option value="">-- Choose Session --</option>
                                    {allSessionsList.map(s => (
                                        <option key={s.id} value={s.id}>{s.title} - {new Date(s.sessionDate).toLocaleDateString()}</option>
                                    ))}
                                </select>
                            </div>

                            {selectedSessionForHours && attendanceRecords.length > 0 && (
                                <div className="flex flex-col gap-3">
                                    {attendanceRecords.map(record => (
                                        <div key={record.id} className="glass-card p-4 rounded-[20px] flex items-center justify-between">
                                            <div>
                                                <p className="font-bold text-slate-800 dark:text-white text-sm">{record.volunteerFirstName} {record.volunteerLastName}</p>
                                                <p className="text-xs text-slate-500">Student: {record.studentFirstName}</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="number"
                                                    step="0.5"
                                                    className="w-16 p-2 rounded-lg text-center bg-white/50 border-none focus:ring-2 focus:ring-primary font-bold"
                                                    value={volunteerHoursEdits[record.id] !== undefined ? volunteerHoursEdits[record.id] : record.hoursLogged}
                                                    onChange={(e) => handleUpdateVolunteerHours(record.id, parseFloat(e.target.value))}
                                                />
                                                <span className="text-xs text-slate-500">hrs</span>
                                            </div>
                                        </div>
                                    ))}
                                    <button onClick={handlePublishVolunteerHours} className="mt-4 w-full h-12 rounded-full bg-gradient-to-r from-teal-400 to-emerald-500 text-white font-bold text-base shadow-lg shadow-teal-500/30">
                                        Publish Approved Hours
                                    </button>
                                </div>
                            )}
                        </>
                    )}

                </main>

                {/* Bottom Nav (Decorative mostly, keeping faithful to design) */}
                <nav className="absolute bottom-0 w-full glass-panel border-t border-white/40 pb-5 pt-2 px-6 flex justify-between items-center z-50">
                    <button className="p-2 opacity-60 hover:opacity-100 hover:text-primary transition-all flex flex-col items-center gap-1 group">
                        <span className="material-symbols-outlined text-3xl">home</span>
                    </button>
                    <button className="p-2 opacity-60 hover:opacity-100 hover:text-primary transition-all flex flex-col items-center gap-1 group">
                        <span className="material-symbols-outlined text-3xl">calendar_today</span>
                    </button>
                    <div className="relative -top-6">
                        <button onClick={() => setShowCreateUser(true)} className="flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-500 text-white shadow-lg shadow-violet-500/40 hover:shadow-violet-500/60 hover:scale-105 transition-all">
                            <span className="material-symbols-outlined text-3xl">add</span>
                        </button>
                    </div>
                    <button className="p-2 opacity-60 hover:opacity-100 hover:text-primary transition-all flex flex-col items-center gap-1 group">
                        <span className="material-symbols-outlined text-3xl">chat_bubble</span>
                    </button>
                    <button className="p-2 opacity-60 hover:opacity-100 hover:text-primary transition-all flex flex-col items-center gap-1 group">
                        <span className="material-symbols-outlined text-3xl">person</span>
                    </button>
                </nav>
            </div>

            {/* --- MODALS --- */}

            {/* Create User Modal */}
            {showCreateUser && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                    <div className="glass-card w-full max-w-md p-6 rounded-[32px] animate-fade-in-up bg-white dark:bg-slate-900">
                        <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">Add New Member</h2>
                        <form onSubmit={handleCreateUser} className="space-y-4">
                            <div>
                                <label className="text-xs font-bold uppercase text-slate-500 ml-2">Role</label>
                                <select className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-primary" value={newUser.role} onChange={e => setNewUser({ ...newUser, role: e.target.value })}>
                                    <option value="volunteer">Volunteer</option>
                                    <option value="student">Student</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <input placeholder="First Name" className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-primary" value={newUser.firstName} onChange={e => setNewUser({ ...newUser, firstName: e.target.value })} required />
                                <input placeholder="Last Name" className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-primary" value={newUser.lastName} onChange={e => setNewUser({ ...newUser, lastName: e.target.value })} required />
                            </div>
                            <input placeholder="Email Address" type="email" className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-primary" value={newUser.email} onChange={e => setNewUser({ ...newUser, email: e.target.value })} required />
                            <input placeholder="Password" type="password" className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-primary" value={newUser.password} onChange={e => setNewUser({ ...newUser, password: e.target.value })} required />

                            <div className="flex gap-3 mt-6">
                                <button type="button" onClick={() => setShowCreateUser(false)} className="flex-1 p-3 rounded-xl font-bold text-slate-500 hover:bg-slate-100">Cancel</button>
                                <button type="submit" className="flex-1 p-3 rounded-xl font-bold text-white bg-gradient-to-r from-violet-600 to-fuchsia-500 shadow-lg shadow-violet-500/30">Create Account</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Create Session Modal */}
            {showCreateSession && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                    <div className="glass-card w-full max-w-md p-6 rounded-[32px] animate-fade-in-up bg-white dark:bg-slate-900">
                        <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">Schedule Session</h2>
                        <form onSubmit={handleCreateSession} className="space-y-4">
                            <div>
                                <label className="text-xs font-bold uppercase text-slate-500 ml-2">Date & Time</label>
                                <input type="datetime-local" className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-primary" value={newSessionDate} onChange={e => setNewSessionDate(e.target.value)} required />
                            </div>
                            <div>
                                <label className="text-xs font-bold uppercase text-slate-500 ml-2">Session Title</label>
                                <input type="text" className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-primary" value={newSessionTitle} onChange={e => setNewSessionTitle(e.target.value)} />
                            </div>
                            <div className="flex gap-3 mt-6">
                                <button type="button" onClick={() => setShowCreateSession(false)} className="flex-1 p-3 rounded-xl font-bold text-slate-500 hover:bg-slate-100">Cancel</button>
                                <button type="submit" className="flex-1 p-3 rounded-xl font-bold text-white bg-gradient-to-r from-violet-600 to-fuchsia-500 shadow-lg shadow-violet-500/30">Schedule</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Remove Member Confirmation Modal */}
            {memberToRemove && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                    <div className="glass-card w-full max-w-sm p-6 rounded-[32px] animate-fade-in-up bg-white dark:bg-slate-900 text-center">
                        <div className="w-16 h-16 rounded-full bg-red-100 text-red-500 flex items-center justify-center mx-auto mb-4">
                            <span className="material-symbols-outlined text-3xl">warning</span>
                        </div>
                        <h2 className="text-xl font-bold mb-2 text-slate-900 dark:text-white">Remove Member?</h2>
                        <p className="text-sm text-slate-500 mb-6">Are you sure you want to remove <span className="font-bold text-slate-800">{memberToRemove.name}</span>?</p>

                        <div className="flex gap-3">
                            <button onClick={() => setMemberToRemove(null)} className="flex-1 p-3 rounded-xl font-bold text-slate-500 hover:bg-slate-100">Cancel</button>
                            <button onClick={handleRemoveMember} className="flex-1 p-3 rounded-xl font-bold text-white bg-red-500 shadow-lg shadow-red-500/30">Yes, Remove</button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default AdminDashboard;