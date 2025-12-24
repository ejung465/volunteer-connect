import React from 'react';
import { StatCardProps } from '../types';
import { GlassCard } from './GlassCard';
import { Icon } from './Icon';

export const StatsCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  icon, 
  trend, 
  badge, 
  customContent,
  onClick
}) => {
  return (
    <GlassCard className="flex flex-col justify-between h-36 cursor-pointer" onClick={onClick}>
       {/* Background Decoration */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10 rounded-bl-full -mr-4 -mt-4 transition-transform duration-500 group-hover:scale-110 pointer-events-none"></div>
      
      <div className="flex items-start justify-between relative z-10">
        <div className="p-2.5 rounded-2xl bg-white/50 dark:bg-white/10 backdrop-blur-md transition-colors group-hover:bg-white/60 dark:group-hover:bg-white/20">
          <Icon name={icon} className="text-primary text-2xl" />
        </div>
        
        {trend && (
          <span className="flex items-center text-xs font-bold text-emerald-600 bg-emerald-100 dark:bg-emerald-500/20 px-2 py-1 rounded-lg">
             <Icon name="trending_up" className="text-[10px] mr-0.5" /> {trend}
          </span>
        )}

        {badge && (
           <span className="flex items-center text-xs font-bold text-emerald-600 bg-emerald-100 dark:bg-emerald-500/20 px-2 py-1 rounded-lg">
             {badge}
           </span>
        )}

        {customContent}
      </div>

      <div className="relative z-10">
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{value}</h3>
      </div>
    </GlassCard>
  );
};