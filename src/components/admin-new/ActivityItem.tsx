import React from 'react';
import { Activity } from './types';
import { Icon } from './Icon';

interface ActivityItemProps {
    activity: Activity;
}

export const ActivityItem: React.FC<ActivityItemProps> = ({ activity }) => {
    return (
        <div className="flex items-center gap-3 p-3 hover:bg-white/30 dark:hover:bg-white/5 rounded-2xl transition-colors cursor-pointer border-b border-dashed border-slate-200 dark:border-white/5 last:border-0 group">
            <div className="relative flex-shrink-0">
                {activity.user.avatar ? (
                    <div className="h-10 w-10 rounded-full p-[1px] bg-gradient-to-br from-blue-400 to-cyan-300 group-hover:from-violet-400 group-hover:to-fuchsia-300 transition-all">
                        <img
                            src={activity.user.avatar}
                            alt={activity.user.name}
                            className="h-full w-full rounded-full object-cover border border-white dark:border-gray-800"
                        />
                    </div>
                ) : (
                    <div className="h-10 w-10 rounded-full bg-violet-100 dark:bg-violet-900/40 flex items-center justify-center group-hover:bg-violet-200 dark:group-hover:bg-violet-800/50 transition-colors">
                        <Icon name="person_add" className="text-primary text-lg" />
                    </div>
                )}
            </div>

            <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{activity.user.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    {activity.action} {activity.target && <span className="text-slate-600 dark:text-slate-300">{activity.target}</span>}
                </p>
            </div>

            <span className="text-[10px] font-semibold text-slate-400 whitespace-nowrap group-hover:text-primary transition-colors">{activity.time}</span>
        </div>
    );
};
