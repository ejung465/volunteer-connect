import React, { useState } from 'react';
import { GlassCard } from './GlassCard';
import { Icon } from './Icon';

export const CalendarView: React.FC = () => {
    const [selectedDate, setSelectedDate] = useState<number>(15);

    const events = [
        { id: 1, title: 'Community Garden', time: '10:00 AM - 2:00 PM', date: 12, month: 'SEP', volunteers: 12, color: 'text-emerald-500', dotColor: 'bg-emerald-500' },
        { id: 2, title: 'Beach Cleanup', time: '08:00 AM - 11:00 AM', date: 15, month: 'SEP', volunteers: 45, color: 'text-blue-500', dotColor: 'bg-blue-500' },
        { id: 3, title: 'Food Drive', time: '09:00 AM - 5:00 PM', date: 22, month: 'SEP', volunteers: 8, color: 'text-orange-500', dotColor: 'bg-orange-500' },
        { id: 4, title: 'Teaching Workshop', time: '04:00 PM - 6:00 PM', date: 28, month: 'SEP', volunteers: 5, color: 'text-purple-500', dotColor: 'bg-purple-500' },
    ];

    // September 2024 starts on Sunday (index 0) and has 30 days
    const days = Array.from({ length: 30 }, (_, i) => i + 1);
    const weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
    const startOffset = 0; // Sunday

    const getEventForDate = (date: number) => events.find(e => e.date === date);

    return (
        <div className="flex flex-col gap-6 pb-24">
            <div className="flex flex-col gap-1 px-1">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Schedule</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Upcoming volunteer sessions.</p>
            </div>

            {/* Calendar Grid Widget */}
            <GlassCard className="p-5">
                <div className="flex items-center justify-between mb-6">
                    <button className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
                        <Icon name="chevron_left" className="text-slate-600 dark:text-slate-300" />
                    </button>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">September 2024</h3>
                    <button className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
                        <Icon name="chevron_right" className="text-slate-600 dark:text-slate-300" />
                    </button>
                </div>

                <div className="grid grid-cols-7 gap-1 mb-2">
                    {weekDays.map(day => (
                        <div key={day} className="h-8 flex items-center justify-center text-xs font-bold text-slate-400 uppercase tracking-wide">
                            {day}
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-7 gap-y-2 gap-x-1">
                    {/* Empty cells for start offset */}
                    {Array.from({ length: startOffset }).map((_, i) => (
                        <div key={`empty-${i}`} className="aspect-square" />
                    ))}

                    {days.map(day => {
                        const hasEvent = getEventForDate(day);
                        const isSelected = day === selectedDate;

                        return (
                            <button
                                key={day}
                                onClick={() => setSelectedDate(day)}
                                className={`
                                    aspect-square rounded-full flex flex-col items-center justify-center relative transition-all duration-300 group
                                    ${isSelected
                                        ? 'bg-primary text-white shadow-lg shadow-primary/30 scale-105 z-10'
                                        : 'text-slate-700 dark:text-slate-200 hover:bg-black/5 dark:hover:bg-white/10'
                                    }
                                `}
                            >
                                <span className={`text-sm ${isSelected ? 'font-bold' : 'font-medium'}`}>{day}</span>
                                {hasEvent && !isSelected && (
                                    <span className={`absolute bottom-2 w-1.5 h-1.5 rounded-full ${hasEvent.dotColor}`}></span>
                                )}
                            </button>
                        );
                    })}
                </div>
            </GlassCard>

            <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between px-1 mt-2">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Events</h3>
                    <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-1 rounded-lg">4 Upcoming</span>
                </div>

                {events.map((event) => {
                    const isSelected = event.date === selectedDate;
                    return (
                        <GlassCard
                            key={event.id}
                            className={`flex items-center gap-4 transition-all duration-300 ${isSelected ? 'ring-2 ring-primary/50 bg-white/60 dark:bg-slate-800/60' : ''}`}
                            onClick={() => setSelectedDate(event.date)}
                        >
                            <div className="flex flex-col items-center justify-center w-16 h-16 rounded-2xl bg-white/60 dark:bg-white/10 backdrop-blur-md shadow-sm group-hover:scale-105 transition-transform">
                                <span className="text-xs font-bold text-slate-500 uppercase">{event.month}</span>
                                <span className="text-xl font-bold text-slate-900 dark:text-white">{event.date}</span>
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold text-slate-900 dark:text-white">{event.title}</h3>
                                <div className="flex items-center text-xs text-slate-500 dark:text-slate-400 mt-1">
                                    <Icon name="schedule" className="text-[14px] mr-1" />
                                    {event.time}
                                </div>
                            </div>
                            <div className={`flex flex-col items-end ${event.color}`}>
                                <Icon name="group" className="text-xl" />
                                <span className="text-xs font-bold">{event.volunteers}</span>
                            </div>
                        </GlassCard>
                    );
                })}
            </div>
        </div>
    );
};
