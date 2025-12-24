import React, { useState, useEffect } from 'react';
import { Icon } from './Icon';
import { GlassCard } from './GlassCard';

interface QuickActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  action: string | null;
}

export const QuickActionModal: React.FC<QuickActionModalProps> = ({ isOpen, onClose, action }) => {
  const [isUnlimited, setIsUnlimited] = useState(false);

  // Reset state when action changes or modal opens
  useEffect(() => {
    setIsUnlimited(false);
  }, [action, isOpen]);

  if (!isOpen || !action) return null;

  const getConfig = () => {
    switch (action) {
      case 'add_member':
        return {
          title: 'Add New Member',
          icon: 'person_add',
          color: 'from-violet-500 to-fuchsia-500',
          content: (
            <div className="flex flex-col gap-4">
              <input type="text" placeholder="Full Name" className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-primary/50 text-slate-900 dark:text-white" />
              <input type="email" placeholder="Email Address" className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-primary/50 text-slate-900 dark:text-white" />
              <div className="relative">
                 <select className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-primary/50 text-slate-500 dark:text-slate-400 appearance-none">
                    <option>Volunteer</option>
                    <option>Student</option>
                    <option>Admin</option>
                 </select>
                 <Icon name="expand_more" className="absolute right-3 top-3.5 text-slate-400 pointer-events-none" />
              </div>
            </div>
          ),
          buttonText: 'Send Invitation'
        };
      case 'create_session':
        return {
          title: 'Create Session',
          icon: 'event',
          color: 'from-blue-400 to-cyan-400',
          content: (
            <div className="flex flex-col gap-4">
              <input type="text" placeholder="Session Title" className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-primary/50 text-slate-900 dark:text-white" />
              <div className="flex gap-4">
                <input type="date" className="flex-1 p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-primary/50 text-slate-500 dark:text-slate-400" />
                <input type="time" className="flex-1 p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-primary/50 text-slate-500 dark:text-slate-400" />
              </div>
              <div className="flex flex-col gap-2">
                <input 
                  type="number" 
                  placeholder="Max Volunteers" 
                  disabled={isUnlimited}
                  className={`w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-primary/50 text-slate-900 dark:text-white transition-opacity ${isUnlimited ? 'opacity-50' : ''}`} 
                />
                <div className="flex items-center gap-2 px-1">
                   <input 
                     type="checkbox" 
                     id="unlimited" 
                     checked={isUnlimited}
                     onChange={(e) => setIsUnlimited(e.target.checked)}
                     className="rounded text-primary focus:ring-primary border-gray-300 dark:border-gray-600 bg-transparent w-4 h-4" 
                   />
                   <label htmlFor="unlimited" className="text-sm font-medium text-slate-600 dark:text-slate-300 cursor-pointer select-none">Unlimited volunteers</label>
                </div>
              </div>
            </div>
          ),
          buttonText: 'Create Event'
        };
      case 'send_alert':
        return {
          title: 'Send Announcement',
          icon: 'campaign',
          color: 'from-orange-400 to-amber-400',
          content: (
             <div className="flex flex-col gap-4">
              <input type="text" placeholder="Subject" className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-primary/50 text-slate-900 dark:text-white" />
              <textarea placeholder="Message..." rows={4} className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-primary/50 resize-none text-slate-900 dark:text-white"></textarea>
              <div className="flex items-center gap-2">
                 <input type="checkbox" id="urgent" className="rounded text-primary focus:ring-primary border-gray-300 dark:border-gray-600 bg-transparent" />
                 <label htmlFor="urgent" className="text-sm text-slate-600 dark:text-slate-300">Mark as Urgent</label>
              </div>
            </div>
          ),
          buttonText: 'Send Blast'
        };
      default:
        return null;
    }
  };

  const config = getConfig();
  if (!config) return null;

  return (
    <div className="absolute inset-0 z-[70] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300 animate-in fade-in"
        onClick={onClose}
      />
      
      <GlassCard className="w-full max-w-sm !bg-white/95 dark:!bg-slate-900/95 backdrop-blur-2xl shadow-2xl z-10 animate-in zoom-in-95 duration-300 relative">
        <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
        >
            <Icon name="close" className="text-slate-500 dark:text-slate-400" />
        </button>

        <div className="flex flex-col items-center mb-6">
            <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${config.color} flex items-center justify-center text-white shadow-lg mb-4`}>
                <Icon name={config.icon} className="text-3xl" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">{config.title}</h2>
        </div>

        {config.content}

        <button 
            onClick={onClose}
            className={`w-full py-3.5 rounded-xl bg-gradient-to-r ${config.color} text-white font-bold shadow-lg mt-6 active:scale-[0.98] transition-transform`}
        >
            {config.buttonText}
        </button>
      </GlassCard>
    </div>
  );
};