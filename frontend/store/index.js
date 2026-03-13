import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import Cookies from 'js-cookie';
import { authAPI } from '../lib/api';
import { initSocket, disconnectSocket } from '../lib/socket';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: true,

      setToken: (token) => {
        Cookies.set('token', token, { expires: 7 });
        localStorage.setItem('token', token);
        set({ token });
      },

      login: (user, token) => {
        Cookies.set('token', token, { expires: 7 });
        localStorage.setItem('token', token);
        initSocket(token);
        set({ user, token });
      },

      logout: async () => {
        try { await authAPI.logout(); } catch (_) {}
        Cookies.remove('token');
        localStorage.removeItem('token');
        disconnectSocket();
        set({ user: null, token: null });
      },

      fetchMe: async () => {
        try {
          set({ isLoading: true });
          const res = await authAPI.getMe();
          set({ user: res.data.user, isLoading: false });
          const token = get().token;
          if (token) initSocket(token);
        } catch {
          set({ user: null, token: null, isLoading: false });
          Cookies.remove('token');
          localStorage.removeItem('token');
        }
      },

      updateUser: (updates) => set((state) => ({ user: { ...state.user, ...updates } })),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ token: state.token }),
    }
  )
);

export const useUIStore = create((set, get) => ({
  theme: 'dark',
  sidebarOpen: false,
  activeChannelId: null,

  toggleTheme: () => {
    const newTheme = get().theme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    set({ theme: newTheme });
  },

  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setActiveChannel: (id) => set({ activeChannelId: id }),
}));

export const useChatStore = create((set, get) => ({
  channels: [],
  messages: {},         // { [channelId]: Message[] }
  typingUsers: {},      // { [channelId]: { userId, username }[] }
  unreadCounts: {},     // { [channelId]: number }

  setChannels: (channels) => set({ channels }),
  addChannel: (channel) => set((s) => ({ channels: [channel, ...s.channels] })),
  updateChannel: (id, updates) =>
    set((s) => ({ channels: s.channels.map((c) => (c._id === id ? { ...c, ...updates } : c)) })),

  setMessages: (channelId, messages) =>
    set((s) => ({ messages: { ...s.messages, [channelId]: messages } })),

  addMessage: (message) => {
    const chId = message.channel;
    set((s) => ({
      messages: { ...s.messages, [chId]: [...(s.messages[chId] || []), message] },
      unreadCounts: {
        ...s.unreadCounts,
        [chId]: (s.unreadCounts[chId] || 0) + 1,
      },
    }));
  },

  updateMessageReactions: (messageId, channelId, reactions) =>
    set((s) => ({
      messages: {
        ...s.messages,
        [channelId]: (s.messages[channelId] || []).map((m) =>
          m._id === messageId ? { ...m, reactions } : m
        ),
      },
    })),

  setTyping: (channelId, userId, username, isTyping) =>
    set((s) => {
      const current = s.typingUsers[channelId] || [];
      const filtered = current.filter((u) => u.userId !== userId);
      return {
        typingUsers: {
          ...s.typingUsers,
          [channelId]: isTyping ? [...filtered, { userId, username }] : filtered,
        },
      };
    }),

  clearUnread: (channelId) =>
    set((s) => ({ unreadCounts: { ...s.unreadCounts, [channelId]: 0 } })),
}));

export const useNotificationStore = create((set) => ({
  notifications: [],
  unreadCount: 0,

  setNotifications: (notifications) => {
    const unreadCount = notifications.filter((n) => !n.read).length;
    set({ notifications, unreadCount });
  },

  addNotification: (notif) =>
    set((s) => ({
      notifications: [notif, ...s.notifications],
      unreadCount: s.unreadCount + 1,
    })),

  markAllRead: () => set({ unreadCount: 0, notifications: [] }),
}));
