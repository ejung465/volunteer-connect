import React, { useState, useRef, useEffect } from 'react';
import { Icon } from './Icon';
import { AVATAR_1, AVATAR_2 } from '../constants';

interface Message {
  id: string;
  text: string;
  sender: 'me' | 'them';
  time: string;
}

interface Chat {
    id: number;
    name: string;
    lastMessage: string;
    time: string;
    avatar?: string;
    initials?: string;
    unread: number;
    online?: boolean;
    messages: Message[];
}

interface Contact {
    id: number;
    name: string;
    role: string;
    avatar?: string;
    initials?: string;
}

export const ChatView: React.FC = () => {
    const [selectedChatId, setSelectedChatId] = useState<number | null>(null);
    const [isNewChatOpen, setIsNewChatOpen] = useState(false);
    const [inputValue, setInputValue] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const [chats, setChats] = useState<Chat[]>([
        { 
            id: 1, 
            name: 'Sarah Lee', 
            lastMessage: 'Great, thanks for letting me know!', 
            time: '2m', 
            avatar: AVATAR_1, 
            unread: 2,
            online: true,
            messages: [
                { id: '1', text: 'Hey Sarah, how are you?', sender: 'me', time: '10:00 AM' },
                { id: '2', text: 'I am doing good! I had a quick question.', sender: 'them', time: '10:02 AM' },
                { id: '3', text: 'Can I switch my shift for tomorrow?', sender: 'them', time: '10:02 AM' },
                { id: '4', text: 'Sure, that works for me.', sender: 'me', time: '04:28 PM' },
                { id: '5', text: 'Great, thanks for letting me know!', sender: 'them', time: '04:29 PM' },
            ]
        },
        { 
            id: 2, 
            name: 'Michael Chen', 
            lastMessage: 'I confirmed the location for the event.', 
            time: '1h', 
            avatar: AVATAR_2, 
            unread: 0,
            online: false,
            messages: [
                 { id: '1', text: 'Did you check the venue?', sender: 'me', time: 'Yesterday' },
                 { id: '2', text: 'Yes, I went there this morning.', sender: 'them', time: '9:00 AM' },
                 { id: '3', text: 'I confirmed the location for the event.', sender: 'them', time: '9:05 AM' },
            ]
        },
        { 
            id: 3, 
            name: 'Coordinators Group', 
            lastMessage: 'David: Agenda for the meeting is attached.', 
            time: '3h', 
            initials: 'CG', 
            unread: 0,
            messages: [
                { id: '1', text: 'Meeting starts in 10 mins.', sender: 'them', time: '2:50 PM' },
                { id: '2', text: 'Got it, see you there.', sender: 'me', time: '2:55 PM' },
                { id: '3', text: 'David: Agenda for the meeting is attached.', sender: 'them', time: '3:00 PM' },
            ]
        },
        { 
            id: 4, 
            name: 'Volunteer Support', 
            lastMessage: 'Thanks for your report.', 
            time: '1d', 
            initials: 'VS', 
            unread: 0,
             messages: [
                { id: '1', text: 'I found a bug in the logging system.', sender: 'me', time: 'Yesterday' },
                { id: '2', text: 'Thanks for your report.', sender: 'them', time: 'Yesterday' },
            ]
        },
    ]);

    const contacts: Contact[] = [
        { id: 101, name: "Sarah Lee", avatar: AVATAR_1, role: "Volunteer" },
        { id: 102, name: "Michael Chen", avatar: AVATAR_2, role: "Coordinator" },
        { id: 103, name: "David Kim", initials: "DK", role: "Volunteer" },
        { id: 104, name: "Emily Davis", initials: "ED", role: "Admin" },
        { id: 105, name: "James Wilson", initials: "JW", role: "Volunteer" },
        { id: 106, name: "Jessica Taylor", initials: "JT", role: "Coordinator" },
    ];

    const activeChat = chats.find(c => c.id === selectedChatId);

    // Scroll to bottom when messages change
    useEffect(() => {
        if (activeChat && messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [activeChat?.messages, activeChat?.id]);

    const handleSendMessage = () => {
        if (!inputValue.trim() || !activeChat) return;

        const newMessage: Message = {
            id: Date.now().toString(),
            text: inputValue,
            sender: 'me',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        const updatedChats = chats.map(chat => {
            if (chat.id === activeChat.id) {
                return {
                    ...chat,
                    messages: [...chat.messages, newMessage],
                    lastMessage: 'You: ' + inputValue,
                    time: 'Now'
                };
            }
            return chat;
        });

        setChats(updatedChats);
        setInputValue("");
        
        // Simulate automated reply
        if (activeChat.id === 1 && Math.random() > 0.5) { 
             setTimeout(() => {
                setChats(currentChats => {
                    const replyMessage: Message = {
                        id: (Date.now() + 1).toString(),
                        text: "Got it, thanks!",
                        sender: 'them',
                        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    };
                     return currentChats.map(chat => {
                        if (chat.id === activeChat.id) {
                            return {
                                ...chat,
                                messages: [...chat.messages, replyMessage],
                                lastMessage: replyMessage.text,
                                time: 'Now'
                            };
                        }
                        return chat;
                    });
                })
             }, 2000);
        }
    };

    const handleStartChat = (contact: Contact) => {
        const existingChat = chats.find(c => c.name === contact.name);
        if (existingChat) {
            setSelectedChatId(existingChat.id);
        } else {
            const newChat: Chat = {
                id: Date.now(),
                name: contact.name,
                lastMessage: 'Start a conversation',
                time: 'Now',
                avatar: contact.avatar,
                initials: contact.initials,
                unread: 0,
                online: false,
                messages: []
            };
            setChats([newChat, ...chats]);
            setSelectedChatId(newChat.id);
        }
        setIsNewChatOpen(false);
    };

    // View: Conversation (Full Screen Overlay)
    if (selectedChatId !== null && activeChat) {
         return (
            <div className="fixed inset-0 z-[100] flex justify-center items-start bg-slate-100/50 dark:bg-black/50 backdrop-blur-sm">
                <div className="w-full max-w-md h-full bg-[#f3f4f6] dark:bg-[#0f172a] flex flex-col relative shadow-2xl animate-in slide-in-from-right duration-300">
                     {/* Chat Header - Clean White */}
                     <div className="px-4 py-3 flex items-center gap-3 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 z-20 pt-safe-top shadow-sm">
                        <button onClick={() => setSelectedChatId(null)} className="p-2 -ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                            <Icon name="arrow_back" className="text-slate-900 dark:text-white" />
                        </button>
                        <div className="relative">
                            {activeChat.avatar ? (
                                <img src={activeChat.avatar} className="w-10 h-10 rounded-full object-cover" alt={activeChat.name} />
                            ) : (
                                 <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-400 to-fuchsia-400 flex items-center justify-center text-white font-bold text-xs">
                                     {activeChat.initials}
                                 </div>
                            )}
                            {activeChat.online && (
                                <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full"></div>
                            )}
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold text-slate-900 dark:text-white text-sm leading-tight">{activeChat.name}</h3>
                            <p className="text-xs text-emerald-500 font-medium">
                                {activeChat.online ? 'Online' : 'Offline'}
                            </p>
                        </div>
                        <button className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400">
                            <Icon name="more_vert" />
                        </button>
                     </div>

                     {/* Messages Area */}
                     <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 bg-[#f3f4f6] dark:bg-slate-950 pb-4">
                        {activeChat.messages.length === 0 && (
                            <div className="flex flex-col items-center justify-center h-full text-slate-400">
                                <Icon name="chat" className="text-4xl mb-2 opacity-50" />
                                <p className="text-sm">No messages yet. Say hi!</p>
                            </div>
                        )}
                        {activeChat.messages.map((msg, index) => {
                            const isMe = msg.sender === 'me';
                            return (
                                <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`
                                        max-w-[80%] px-4 py-3 rounded-2xl text-sm relative shadow-sm
                                        ${isMe 
                                            ? 'bg-primary text-white rounded-tr-sm' 
                                            : 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-200 rounded-tl-sm'
                                        }
                                    `}>
                                        <p className="leading-relaxed">{msg.text}</p>
                                        <p className={`text-[10px] mt-1 opacity-70 ${isMe ? 'text-right text-white/90' : 'text-right text-slate-400'}`}>
                                            {msg.time}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                        <div ref={messagesEndRef} />
                     </div>

                     {/* Input Area */}
                     <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 pb-8">
                        <div className="flex items-center gap-3">
                            <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors rounded-full p-1 hover:bg-slate-100 dark:hover:bg-slate-800">
                                <Icon name="add_circle" className="text-2xl" />
                            </button>
                            
                            <div className="flex-1 relative">
                                <input 
                                    type="text" 
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                    placeholder="Type a message..." 
                                    className="w-full h-11 pl-4 pr-10 rounded-full border-none bg-slate-100 dark:bg-slate-800 focus:ring-1 focus:ring-primary/50 text-slate-900 dark:text-white text-sm placeholder-slate-500"
                                    autoFocus
                                />
                                <button className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                                    <Icon name="sentiment_satisfied" className="text-xl" />
                                </button>
                            </div>
                            
                            <button 
                                onClick={handleSendMessage}
                                className={`w-11 h-11 flex items-center justify-center rounded-full transition-all duration-300 
                                    ${inputValue.trim() 
                                        ? 'bg-primary text-white shadow-md hover:bg-primary/90' 
                                        : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                                    }`}
                            >
                                <Icon name="send" className="ml-0.5 text-xl filled" />
                            </button>
                        </div>
                     </div>
                </div>
            </div>
         );
    }

    // View: New Chat Modal
    if (isNewChatOpen) {
        return (
            <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center">
                 <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm transition-opacity duration-300" onClick={() => setIsNewChatOpen(false)} />
                 <div className="w-full max-w-md bg-[#f0f9ff] dark:bg-[#0f172a] h-[85vh] sm:h-[600px] rounded-t-3xl sm:rounded-3xl shadow-2xl relative z-10 flex flex-col animate-in slide-in-from-bottom-10 duration-300 overflow-hidden">
                    <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center glass-panel bg-white/50 dark:bg-slate-900/50">
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white">New Message</h2>
                        <button onClick={() => setIsNewChatOpen(false)} className="p-2 rounded-full hover:bg-slate-900/5 dark:hover:bg-white/10 transition-colors">
                            <Icon name="close" className="text-slate-500" />
                        </button>
                    </div>
                    
                    <div className="p-4">
                         <div className="relative">
                            <input 
                                type="text" 
                                placeholder="Search people..." 
                                className="w-full h-12 pl-12 pr-4 rounded-xl border-none bg-white dark:bg-slate-800 shadow-sm focus:ring-2 focus:ring-primary/50 text-slate-900 dark:text-white placeholder-slate-400"
                            />
                            <Icon name="search" className="absolute left-4 top-3 text-slate-400 text-2xl" />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto px-4 pb-8">
                        <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3 px-1">Suggested</p>
                         <div className="flex flex-col gap-2">
                            {contacts.map(contact => (
                                <button 
                                    key={contact.id} 
                                    onClick={() => handleStartChat(contact)} 
                                    className="flex items-center gap-4 p-3 rounded-2xl hover:bg-white dark:hover:bg-white/5 transition-colors text-left group border border-transparent hover:border-slate-200 dark:hover:border-slate-700/50"
                                >
                                    {contact.avatar ? (
                                        <img src={contact.avatar} className="w-12 h-12 rounded-full object-cover border border-white dark:border-slate-700 shadow-sm" alt={contact.name} />
                                    ) : (
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-400 to-fuchsia-400 flex items-center justify-center text-white font-bold text-sm shadow-sm border border-white/20">
                                            {contact.initials}
                                        </div>
                                    )}
                                    <div className="flex-1">
                                        <h3 className="font-bold text-slate-900 dark:text-white text-base">{contact.name}</h3>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">{contact.role}</p>
                                    </div>
                                    <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-primary group-hover:text-white transition-colors">
                                        <Icon name="chevron_right" />
                                    </div>
                                </button>
                            ))}
                         </div>
                    </div>
                 </div>
            </div>
        )
    }

    // View: List
    return (
        <div className="flex flex-col gap-6 pb-24">
            <div className="flex flex-col gap-1 px-1">
                 <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Messages</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Recent conversations.</p>
                    </div>
                    <button 
                        onClick={() => setIsNewChatOpen(true)}
                        className="w-11 h-11 rounded-full bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/30 hover:scale-110 active:scale-95 transition-all"
                    >
                        <Icon name="add" className="text-2xl" />
                    </button>
                </div>
            </div>

            {/* Search Bar */}
            <div className="relative">
                <input 
                    type="text" 
                    placeholder="Search messages..." 
                    className="w-full h-12 pl-12 pr-4 rounded-2xl border-none bg-white/50 dark:bg-slate-800/50 backdrop-blur-md focus:ring-2 focus:ring-primary/50 text-slate-900 dark:text-white placeholder-slate-500"
                />
                <Icon name="search" className="absolute left-4 top-3 text-slate-400 text-2xl" />
            </div>

            <div className="flex flex-col gap-2">
                {chats.map(chat => (
                    <div 
                        key={chat.id} 
                        onClick={() => {
                            // Mark as read
                            const updatedChats = chats.map(c => c.id === chat.id ? { ...c, unread: 0 } : c);
                            setChats(updatedChats);
                            setSelectedChatId(chat.id);
                        }}
                        className="flex items-center gap-3 p-3 rounded-2xl hover:bg-white/40 dark:hover:bg-white/5 transition-colors cursor-pointer group active:scale-[0.98] duration-200"
                    >
                        <div className="relative">
                            {chat.avatar ? (
                                <img src={chat.avatar} alt={chat.name} className="w-12 h-12 rounded-full object-cover border border-white dark:border-slate-700" />
                            ) : (
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-400 to-fuchsia-400 flex items-center justify-center text-white font-bold text-sm border border-white dark:border-slate-700">
                                    {chat.initials}
                                </div>
                            )}
                            {chat.unread > 0 && (
                                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center border-2 border-white dark:border-slate-800">
                                    {chat.unread}
                                </span>
                            )}
                            {chat.online && (
                                    <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900"></span>
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-baseline mb-0.5">
                                <h3 className={`text-sm ${chat.unread > 0 ? 'font-bold text-slate-900 dark:text-white' : 'font-medium text-slate-700 dark:text-slate-300'}`}>{chat.name}</h3>
                                <span className="text-[10px] text-slate-400">{chat.time}</span>
                            </div>
                            <p className={`text-xs truncate ${chat.unread > 0 ? 'font-semibold text-slate-800 dark:text-slate-200' : 'text-slate-500 dark:text-slate-400'}`}>
                                {chat.lastMessage}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};