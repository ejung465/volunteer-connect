import React from 'react';
import { QuickActionProps } from '../types';
import { Icon } from './Icon';

export const QuickAction: React.FC<QuickActionProps> = ({ icon, label, variant = 'glass', onClick }) => {
  const isPrimary = variant === 'primary';
  
  return (
    <button 
      onClick={onClick}
      className="flex flex-col items-center gap-2 min-w-[5rem] group"
    >
      <div 
        className={`
          w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 group-active:scale-95
          ${isPrimary 
            ? 'bg-gradient-to-br from-violet-600 to-fuchsia-500 text-white shadow-lg shadow-violet-500/30' 
            : 'glass-card text-primary border border-white/50 dark:border-white/10 hover:bg-white/40 dark:hover:bg-white/5'
          }
        `}
      >
        <Icon name={icon} className="text-2xl" />
      </div>
      <span className="text-xs font-medium text-slate-600 dark:text-slate-300 text-center leading-tight">
        {label.split(' ').map((line, i) => (
          <React.Fragment key={i}>
            {line}
            {i < label.split(' ').length - 1 && <br />}
          </React.Fragment>
        ))}
      </span>
    </button>
  );
};
