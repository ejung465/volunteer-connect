import React from 'react';
import { StatsCard } from './StatsCard';
import { QuickAction } from './QuickAction';
import { ActivityItem } from './ActivityItem';
import { MOCK_ACTIVITIES } from '../constants';
import { GlassCard } from './GlassCard';
import { Icon } from './Icon';

interface HomeViewProps {
  onStatClick: (id: string) => void;
  onQuickAction: (action: string) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ onStatClick, onQuickAction }) => {
  return (
    <div className="flex flex-col gap-6 pb-24">
       {/* Welcome Section */}
       <div className="flex flex-col gap-1 px-1">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Overview</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Welcome back. Here is today's summary.</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            <StatsCard 
              title="Total Members" 
              value="1,248" 
              icon="groups" 
              trend="12%" 
              onClick={() => onStatClick('members')}
            />
            <StatsCard 
              title="Total Vol. Hours" 
              value="15.4k" 
              icon="schedule" 
              onClick={() => onStatClick('hours')}
            />
            <StatsCard 
              title="Active Sessions" 
              value="42" 
              icon="calendar_month" 
              badge="Active" 
              onClick={() => onStatClick('sessions')}
            />
            
            {/* Custom Pending Approvals Card */}
            <GlassCard 
              className="flex flex-col justify-between h-36 cursor-pointer hover:border-primary/50 transition-colors"
              onClick={() => onStatClick('approvals')}
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-orange-400/10 to-amber-400/10 rounded-bl-full -mr-4 -mt-4 transition-transform duration-500 group-hover:scale-110 pointer-events-none"></div>
              <div className="flex items-start justify-between relative z-10">
                <div className="p-2.5 rounded-2xl bg-white/50 dark:bg-white/10 backdrop-blur-md">
                  <Icon name="pending_actions" className="text-orange-500 text-2xl" />
                </div>
                <div className="h-6 w-6 rounded-full bg-red-500 text-white flex items-center justify-center text-xs font-bold border-2 border-white dark:border-slate-800 shadow-sm animate-bounce">
                  8
                </div>
              </div>
              <div className="relative z-10">
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Approvals</p>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">Pending</h3>
              </div>
            </GlassCard>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-col gap-3">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white px-1">Quick Actions</h3>
            <div className="flex items-center justify-between px-2">
              <QuickAction icon="person_add" label="Add Member" variant="primary" onClick={() => onQuickAction('add_member')} />
              <QuickAction icon="event_available" label="Create Session" onClick={() => onQuickAction('create_session')} />
              <QuickAction icon="verified" label="Verify Hours" onClick={() => onQuickAction('verify_hours')} />
              <QuickAction icon="campaign" label="Send Alert" onClick={() => onQuickAction('send_alert')} />
            </div>
          </div>

          {/* Recent Activity */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Recent Activity</h3>
              <button className="text-xs font-bold text-primary hover:text-primary/80 transition-colors">View All</button>
            </div>
            
            <GlassCard className="rounded-[24px] p-1 !bg-white/40 dark:!bg-slate-800/40">
              {MOCK_ACTIVITIES.map(activity => (
                <ActivityItem key={activity.id} activity={activity} />
              ))}
            </GlassCard>
          </div>
    </div>
  );
};