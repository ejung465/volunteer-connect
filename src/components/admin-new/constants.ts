import { Activity } from "./types";

export const AVATAR_1 = "https://lh3.googleusercontent.com/aida-public/AB6AXuB-XE27bL8dP--VWFWeCbRsdSZcBkZ_4K6ge-qs8y8ZN4BeCKnGgh8K1bBNtNiTcru6SNN_UvR2H2NcUnoMdeDLcuzrcTc3OFCbcI_lHUZrJMGu-fl6JkmkO1RAsPY0x0cZTTnbcDIakrvS09p6nrfgjBLvpKp5W1EJv5uSIDmT9mRgx5WgvVzvxx7Vsf3OYMccya4BtE_EnAtKNlk-q_F4dkcWDzHCT7MK5Z59OvvK9Q6Wb1sBp8nPTfa6CH9TxUeAz2ZeFdlrarkB";
export const AVATAR_2 = "https://lh3.googleusercontent.com/aida-public/AB6AXuDnTFTcWmsg5bwcwpdbgHYOX6GX9YqHLq9yt8nsey4INkRFsJf72WHv78hmpJ0gYiZXRwDdiU_cLwQcGFgXF8aXWLBwC_46FKDiM-DduYsFWJMqBa5ncmb-3I6kpRpeTvVHlTX3xAiRRjpa0R81lhuR1p_Z4qfjeCChBhTeNR-w-Cu_h9SWkiP1uE5YgBjJvmBTvaYxJxSXwYVMWADan886PJtXxpiFdzJYYuqwrPTFFZB4wkxqoEc4BAS-s_mxWWwRz3wK40F3hXDO";

export const MOCK_ACTIVITIES: Activity[] = [
    {
        id: '1',
        user: { name: 'Sarah Lee', avatar: AVATAR_1 },
        action: 'Logged 4 hours',
        target: '"Community Garden"',
        time: '2m ago',
        type: 'log_hours'
    },
    {
        id: '2',
        user: { name: 'New Member Joined', initials: true },
        action: 'David Kim requested to join',
        target: '',
        time: '15m ago',
        type: 'join'
    },
    {
        id: '3',
        user: { name: 'Michael Chen', avatar: AVATAR_2 },
        action: 'Registered for',
        target: '"Beach Cleanup"',
        time: '1h ago',
        type: 'register'
    }
];
