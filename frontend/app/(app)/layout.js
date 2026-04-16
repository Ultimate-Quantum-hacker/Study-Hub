'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore, useUIStore, useChatStore, useNotificationStore } from '../../store/index';
import Sidebar from '../../components/Sidebar';
import ErrorBoundary from '../../components/ErrorBoundary';
import { Toaster } from 'react-hot-toast';
import { getSocket } from '../../lib/socket';

export default function AppLayout({ children }) {
  const { user, token, isLoading, fetchMe } = useAuthStore();
  const { sidebarOpen, setSidebarOpen } = useUIStore();
  const { addMessage, updateMessageReactions, editMessage, deleteMessage, updatePollOptions, pinMessage, setTyping } = useChatStore();
  const { addNotification } = useNotificationStore();
  const router = useRouter();

  useEffect(() => {
    if (!token) { router.push('/login'); return; }
    if (!user) fetchMe();
  }, [token]);

  // Setup socket listeners
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    socket.on('new-message', (message) => {
      const activeChannelId = useUIStore.getState().activeChannelId;
      const currentUserId = useAuthStore.getState().user?._id;
      addMessage(message, message.channel === activeChannelId || message.sender?._id === currentUserId);
    });
    socket.on('message-reaction', ({ messageId, channelId, reactions }) => updateMessageReactions(messageId, channelId, reactions));
    socket.on('message-edited', ({ messageId, channelId, content }) => editMessage(messageId, channelId, content));
    socket.on('message-deleted', ({ messageId, channelId }) => deleteMessage(messageId, channelId));
    socket.on('poll-updated', ({ messageId, channelId, pollOptions }) => updatePollOptions(messageId, channelId, pollOptions));
    socket.on('message-pinned', ({ messageId, channelId, isPinned }) => pinMessage(messageId, channelId, isPinned));
    socket.on('user-typing', ({ channelId, userId, username, isTyping }) => setTyping(channelId, userId, username, isTyping));
    socket.on('notification', (notif) => addNotification(notif));

    return () => {
      socket.off('new-message');
      socket.off('message-reaction');
      socket.off('message-edited');
      socket.off('message-deleted');
      socket.off('poll-updated');
      socket.off('message-pinned');
      socket.off('user-typing');
      socket.off('notification');
    };
  }, []);

  if (isLoading && !user) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <div className="spinner" style={{ width: 32, height: 32 }} />
      </div>
    );
  }

  return (
    <>
      <Toaster position="top-right" toastOptions={{ style: { background: 'var(--bg-elevated)', color: 'var(--text-primary)', border: '1px solid var(--border)' } }} />
      <div className="app-layout">
        {sidebarOpen && (
          <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
        )}
        <Sidebar />
        <main className="main-content">
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </main>
      </div>
    </>
  );
}

