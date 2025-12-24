import React from 'react';
import { Icon } from './Icon';
import { GlassCard } from './GlassCard';

interface AddModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddModal: React.FC<AddModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const actions = [
    { icon: 'event', label: 'New Event', color: 'from-blue-400 to-blue-600' },
    { icon: 'person_add', label: 'Add Member', color: 'from-emerald-400 to-emerald-600' },
    { icon: 'schedule', label: 'Log Hours', color: 'from-orange-400 to-orange-600' },
    { icon: 'campaign', label: 'Announcement', color: 'from-purple-400 to-purple-600' },
  ];

  return (
    <div className="absolute inset-0 z-[60] flex flex-col justify-end pointer-events-none">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm pointer-events-auto transition-opacity duration-300 animate-in fade-in"
        onClick={onClose}
      />
      
      {/* Modal Content - Bottom Sheet style */}
      <div className="w-full p-4 z-10 pointer-events-auto animate-in slide-in-from-bottom-10 duration-300">
        <GlassCard className="!bg-white/90 dark:!bg-slate-900/90 backdrop-blur-2xl border-white/50 shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Quick Create</h2>
            <button 
              onClick={onClose}
              className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
            >
              <Icon name="close" className="text-slate-500 dark:text-slate-400" />
            </button>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            {actions.map((action, idx) => (
              <button 
                key={idx}
                className="flex flex-col items-center justify-center gap-3 p-4 rounded-2xl bg-white/50 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 border border-white/20 transition-all active:scale-95 group shadow-sm hover:shadow-md"
              >
                <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${action.color} text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                  <Icon name={action.icon} className="text-2xl" />
                </div>
                <span className="font-semibold text-slate-700 dark:text-slate-200">{action.label}</span>
              </button>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
};
