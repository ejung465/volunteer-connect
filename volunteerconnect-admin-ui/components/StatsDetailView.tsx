import React, { useState } from 'react';
import { GlassCard } from './GlassCard';
import { Icon } from './Icon';
import { AVATAR_1, AVATAR_2 } from '../constants';

interface StatsDetailViewProps {
  statId: string;
}

export const StatsDetailView: React.FC<StatsDetailViewProps> = ({ statId }) => {
  const [filter, setFilter] = useState<string>('all');
  const [selectedMember, setSelectedMember] = useState<any>(null);

  // Mock data configuration based on ID
  const config = {
    members: {
      title: 'Total Members',
      value: '1,248',
      icon: 'groups',
      color: 'from-violet-500 to-fuchsia-500',
      iconColor: 'text-fuchsia-500',
      description: 'Active registered volunteers & tutors',
      trend: '+12%',
      // Updated history to show the split
      history: [
        { label: 'Volunteers', value: '850', sub: 'Active' },
        { label: 'Tutors', value: '398', sub: 'Active' }
      ],
      list: [
        { 
            name: 'Sarah Lee', 
            sub: 'Volunteer • Joined today', 
            avatar: AVATAR_1, 
            role: 'volunteer',
            description: 'Passionate about community gardening and teaching kids. Loves to organize outdoor activities.',
            email: 'sarah.lee@example.com',
            phone: '(555) 123-4567'
        },
        { 
            name: 'David Kim', 
            sub: 'Tutor • Joined yesterday', 
            initials: 'DK', 
            role: 'tutor',
            description: 'Math major offering free tutoring sessions for high schoolers. Available on weekends.',
            email: 'david.kim@example.com',
            phone: '(555) 234-5678'
        },
        { 
            name: 'Michael Chen', 
            sub: 'Volunteer • Joined 2 days ago', 
            avatar: AVATAR_2, 
            role: 'volunteer',
            description: 'Experienced in event coordination and logistics. Always happy to help with setup.',
            email: 'm.chen@example.com',
            phone: '(555) 345-6789'
        },
        { 
            name: 'Emily Davis', 
            sub: 'Tutor • Joined 3 days ago', 
            initials: 'ED', 
            role: 'tutor',
            description: 'Specializes in English literature and creative writing workshops.',
            email: 'emily.d@example.com',
            phone: '(555) 456-7890'
        },
        { 
            name: 'James Wilson', 
            sub: 'Volunteer • Joined 1 week ago', 
            initials: 'JW', 
            role: 'volunteer',
            description: 'General volunteer ready to assist with any task needed.',
            email: 'j.wilson@example.com',
            phone: '(555) 567-8901'
        },
        { 
            name: 'Jessica Taylor', 
            sub: 'Tutor • Joined 1 week ago', 
            initials: 'JT', 
            role: 'tutor',
            description: 'Science tutor with a background in biology and chemistry.',
            email: 'jess.taylor@example.com',
            phone: '(555) 678-9012'
        },
      ]
    },
    hours: {
      title: 'Total Vol. Hours',
      value: '15.4k',
      icon: 'schedule',
      color: 'from-blue-400 to-cyan-400',
      iconColor: 'text-blue-500',
      description: 'Hours contributed this year',
      trend: '+5%',
      history: [
        { label: 'This Month', value: '1.2k', sub: 'Hours' },
        { label: 'Avg per Vol', value: '12.4', sub: 'Hours' }
      ],
      list: [
        { name: 'Community Garden', sub: '450 hours total', icon: 'local_florist' },
        { name: 'Beach Cleanup', sub: '320 hours total', icon: 'waves' },
        { name: 'Food Drive', sub: '210 hours total', icon: 'volunteer_activism' },
        { name: 'Teaching Workshop', sub: '180 hours total', icon: 'school' },
      ]
    },
    sessions: {
      title: 'Active Sessions',
      value: '42',
      icon: 'calendar_month',
      color: 'from-emerald-400 to-teal-400',
      iconColor: 'text-emerald-500',
      description: 'Currently ongoing or scheduled',
      trend: 'Active',
      history: [
        { label: 'Upcoming', value: '18', sub: 'Next 7 days' },
        { label: 'Completed', value: '156', sub: 'This month' }
      ],
      list: [
        { name: 'Morning Garden Care', sub: 'In progress • 12 vols', status: 'Live', statusColor: 'text-emerald-500' },
        { name: 'Library Sorting', sub: 'Starts in 2h • 5 vols', status: 'Soon', statusColor: 'text-blue-500' },
        { name: 'Senior Center Visit', sub: 'Tomorrow • 8 vols', status: 'Sched', statusColor: 'text-slate-500' },
      ]
    },
    approvals: {
      title: 'Pending Approvals',
      value: '8',
      icon: 'pending_actions',
      color: 'from-orange-400 to-amber-400',
      iconColor: 'text-orange-500',
      description: 'Requires your attention',
      trend: 'Urgent',
      history: [
        { label: 'Hour Logs', value: '5', sub: 'Pending' },
        { label: 'New Applications', value: '3', sub: 'Pending' }
      ],
      list: [
        { name: 'John Doe', sub: 'Logged 4 hours', action: 'Verify', actionColor: 'bg-emerald-500' },
        { name: 'Alice Smith', sub: 'Application review', action: 'Review', actionColor: 'bg-blue-500' },
        { name: 'Project Alpha', sub: 'New event proposal', action: 'View', actionColor: 'bg-purple-500' },
      ]
    }
  };

  const data = config[statId as keyof typeof config];

  if (!data) return <div>Stat not found</div>;

  // Filter list based on role if it exists
  const filteredList = statId === 'members' 
    ? data.list.filter((item: any) => filter === 'all' || item.role === filter)
    : data.list;

  return (
    <>
        <div className="flex flex-col gap-6 pb-24 animate-in slide-in-from-right duration-300">
        {/* Hero Card */}
        <div className={`relative w-full rounded-[2rem] p-6 overflow-hidden shadow-xl`}>
            <div className={`absolute inset-0 bg-gradient-to-br ${data.color} opacity-90`}></div>
            <div className="absolute inset-0 bg-white/10 backdrop-blur-[1px]"></div>
            
            {/* Background shapes */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-white/20 rounded-full blur-2xl -mr-10 -mt-10"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-black/10 rounded-full blur-2xl -ml-10 -mb-10"></div>

            <div className="relative z-10 text-white">
            <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md border border-white/30">
                    <Icon name={data.icon} className="text-2xl" />
                </div>
                <div className="px-3 py-1 bg-white/20 rounded-full backdrop-blur-md border border-white/30 text-xs font-bold">
                    {data.trend}
                </div>
            </div>
            
            <h2 className="text-4xl font-bold mb-1">{data.value}</h2>
            <p className="text-lg font-medium opacity-90">{data.title}</p>
            <p className="text-sm opacity-70 mt-4">{data.description}</p>
            </div>
        </div>

        {/* Analytics Row */}
        <div className="flex gap-4">
            {data.history.map((item, i) => (
                <GlassCard key={i} className="flex-1 flex flex-col gap-1 py-4 px-5">
                    <span className="text-xl font-bold text-slate-900 dark:text-white">{item.value}</span>
                    <span className="text-xs font-bold text-slate-500">{item.label}</span>
                    <span className="text-[10px] text-slate-400">{item.sub}</span>
                </GlassCard>
            ))}
        </div>

        {/* Filter Control (Specific for Members) */}
        {statId === 'members' && (
            <div className="flex p-1 bg-slate-200 dark:bg-white/5 rounded-xl border border-slate-300 dark:border-white/10">
                {['all', 'volunteer', 'tutor'].map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`flex-1 py-2 rounded-lg text-xs font-bold capitalize transition-all duration-300 ${
                            filter === f 
                            ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm' 
                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                        }`}
                    >
                        {f === 'all' ? 'All' : f + 's'}
                    </button>
                ))}
            </div>
        )}

        {/* Details List */}
        <div className="flex flex-col gap-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white px-1">Detailed Breakdown</h3>
            <div className="flex flex-col gap-3">
                {filteredList.map((item: any, i: number) => (
                    <GlassCard 
                        key={i} 
                        className={`flex items-center gap-4 !py-3 ${statId === 'members' ? 'cursor-pointer hover:bg-white/60 dark:hover:bg-white/10 transition-colors' : ''}`}
                        onClick={() => {
                            if (statId === 'members') setSelectedMember(item);
                        }}
                    >
                        {item.avatar ? (
                            <img src={item.avatar} className="w-10 h-10 rounded-full object-cover" alt="" />
                        ) : item.initials ? (
                            <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${data.color} flex items-center justify-center text-white text-xs font-bold`}>{item.initials}</div>
                        ) : (
                            <div className={`w-10 h-10 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center ${data.iconColor}`}>
                                <Icon name={item.icon || 'circle'} className="text-xl" />
                            </div>
                        )}
                        
                        <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">{item.name}</h4>
                            <p className="text-xs text-slate-500 truncate">{item.sub}</p>
                        </div>

                        {item.status && (
                            <span className={`text-xs font-bold ${item.statusColor}`}>{item.status}</span>
                        )}
                        {item.action && (
                            <button className={`px-3 py-1.5 rounded-full text-[10px] font-bold text-white ${item.actionColor} shadow-sm active:scale-95 transition-transform`}>
                                {item.action}
                            </button>
                        )}
                    </GlassCard>
                ))}
                {filteredList.length === 0 && (
                    <div className="text-center py-8 text-slate-400 text-sm">
                        No members found.
                    </div>
                )}
            </div>
        </div>
        </div>

        {/* Member Detail Modal */}
        {selectedMember && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                 <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setSelectedMember(null)} />
                 <GlassCard className="w-full max-w-sm relative z-10 flex flex-col items-center p-6 animate-in zoom-in-95 duration-200 !bg-white/95 dark:!bg-slate-900/95 shadow-2xl">
                    <button 
                        onClick={() => setSelectedMember(null)}
                        className="absolute top-4 right-4 p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                    >
                        <Icon name="close" className="text-slate-500" />
                    </button>

                    {/* Avatar */}
                    <div className="w-24 h-24 rounded-full mb-4 relative group">
                        {selectedMember.avatar ? (
                             <img src={selectedMember.avatar} className="w-full h-full rounded-full object-cover shadow-lg border-4 border-white dark:border-slate-800" alt={selectedMember.name} />
                        ) : (
                            <div className={`w-full h-full rounded-full bg-gradient-to-br ${data.color} flex items-center justify-center text-white text-3xl font-bold shadow-lg border-4 border-white dark:border-slate-800`}>
                                {selectedMember.initials}
                            </div>
                        )}
                        <div className="absolute bottom-1 right-1 bg-white dark:bg-slate-800 rounded-full p-1.5 border border-slate-100 dark:border-slate-700 shadow-sm">
                            <Icon name={selectedMember.role === 'tutor' ? 'school' : 'volunteer_activism'} className={`text-sm ${data.iconColor}`} filled />
                        </div>
                    </div>

                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">{selectedMember.name}</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium capitalize mb-5 bg-slate-100 dark:bg-white/5 px-3 py-1 rounded-full mt-1">
                        {selectedMember.role}
                    </p>

                    <div className="w-full bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-5 mb-5 text-center border border-slate-100 dark:border-white/5">
                        <p className="text-sm text-slate-600 dark:text-slate-300 italic leading-relaxed">
                            "{selectedMember.description || 'No description provided.'}"
                        </p>
                    </div>

                    <div className="w-full flex flex-col gap-3">
                         <div className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-white/5">
                            <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-500">
                                <Icon name="mail" className="text-xl" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Email</p>
                                <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{selectedMember.email || 'N/A'}</p>
                            </div>
                         </div>

                         <div className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-white/5">
                            <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-500">
                                <Icon name="call" className="text-xl" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Phone</p>
                                <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{selectedMember.phone || 'N/A'}</p>
                            </div>
                         </div>
                    </div>
                    
                    <button className="w-full mt-6 py-3.5 rounded-xl bg-primary text-white font-bold shadow-lg shadow-primary/30 active:scale-[0.98] transition-all hover:bg-primary/90">
                        View Full Profile
                    </button>
                 </GlassCard>
            </div>
        )}
    </>
  );
};