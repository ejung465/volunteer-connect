import React, { useState } from 'react';
import { Icon } from './components/Icon';
import { BottomNav } from './components/BottomNav';
import { HomeView } from './components/HomeView';
import { CalendarView } from './components/CalendarView';
import { ChatView } from './components/ChatView';
import { ProfileView } from './components/ProfileView';
import { AddModal } from './components/AddModal';
import { NotificationsModal } from './components/NotificationsModal';
import { StatsDetailView } from './components/StatsDetailView';
import { QuickActionModal } from './components/QuickActionModal';

function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(true);
  const [selectedStat, setSelectedStat] = useState<string | null>(null);
  const [quickActionModalType, setQuickActionModalType] = useState<string | null>(null);
  const [profileViewMode, setProfileViewMode] = useState<string | null>(null);

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

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setSelectedStat(null);
    setProfileViewMode(null);
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

  const handleQuickAction = (action: string) => {
    if (action === 'settings') {
      setActiveTab('profile');
      setProfileViewMode(null);
    } else if (action === 'verify_hours') {
      setSelectedStat('approvals');
    } else {
      setQuickActionModalType(action);
    }
  };

  const getHeaderTitle = () => {
    if (selectedStat) return 'Details';
    
    if (activeTab === 'profile' && profileViewMode) {
        switch(profileViewMode) {
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

  const renderContent = () => {
    if (selectedStat) {
      return <StatsDetailView statId={selectedStat} />;
    }
    switch (activeTab) {
      case 'home': return <HomeView onStatClick={setSelectedStat} onQuickAction={handleQuickAction} />;
      case 'calendar': return <CalendarView />;
      case 'chat': return <ChatView />;
      case 'profile': return (
        <ProfileView 
            viewMode={profileViewMode} 
            onNavigate={setProfileViewMode} 
            onLogout={() => {
                alert("You have been logged out.");
                setActiveTab('home');
                setProfileViewMode(null);
            }} 
        />
      );
      default: return <HomeView onStatClick={setSelectedStat} onQuickAction={handleQuickAction} />;
    }
  };

  const showBackButton = selectedStat || (activeTab === 'profile' && profileViewMode);

  return (
    <>
      {/* Premium Background Ambience */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none bg-[#f8fafc] dark:bg-[#020617]">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-gradient-to-br from-purple-400/20 to-indigo-400/20 dark:from-purple-900/20 dark:to-indigo-900/20 blur-[100px] opacity-70 animate-float"></div>
        <div className="absolute bottom-[0%] left-[-10%] w-[400px] h-[400px] rounded-full bg-gradient-to-tr from-blue-400/20 to-cyan-400/20 dark:from-blue-900/20 dark:to-cyan-900/20 blur-[80px] opacity-60"></div>
        <div className="absolute top-[40%] left-[20%] w-[300px] h-[300px] rounded-full bg-fuchsia-400/10 dark:bg-fuchsia-900/10 blur-[90px] animate-pulse"></div>
      </div>

      {/* Main Layout Container */}
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
                 <h1 className="text-base font-extrabold tracking-tight text-slate-900 dark:text-white">{getHeaderTitle()}</h1>
                 {/* Optional subtle subtitle/indicator could go here */}
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

        {/* Content Area - Added padding-top to account for floating header */}
        <main className="flex-1 flex flex-col pt-28 px-5 gap-6 pb-28 overflow-y-auto hide-scrollbar">
          {renderContent()}
        </main>

        <BottomNav 
          activeTab={activeTab} 
          onTabChange={handleTabChange} 
          onActionClick={() => setIsAddModalOpen(true)}
        />
        
        <AddModal 
          isOpen={isAddModalOpen} 
          onClose={() => setIsAddModalOpen(false)} 
        />
        
        <NotificationsModal 
          isOpen={isNotificationsOpen} 
          onClose={() => setIsNotificationsOpen(false)} 
        />

        <QuickActionModal 
          isOpen={!!quickActionModalType} 
          action={quickActionModalType} 
          onClose={() => setQuickActionModalType(null)} 
        />
      </div>
    </>
  );
}

export default App;