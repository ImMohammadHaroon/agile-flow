import { useEffect, useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import { supabase } from '../lib/supabase';
import api from '../lib/api';
import toast from 'react-hot-toast';
import { Send, Loader2, Users } from 'lucide-react';
import { format } from 'date-fns';
import { notifyNewMessage } from '../utils/notifications';

export default function CommunityChat() {
  const { profile } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchMessages();
    
    // Subscribe to new messages
    const channel = supabase
      .channel('community_messages_channel')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'community_messages'
        },
        async (payload) => {
          console.log('New community message received:', payload);
          
          // Fetch the complete message with user data
          const { data, error } = await supabase
            .from('community_messages')
            .select(`
              *,
              user:user_id(id, name, role)
            `)
            .eq('id', payload.new.id)
            .single();

          if (data && !error) {
            setMessages((prev) => {
              // Remove temporary message if exists
              const withoutTemp = prev.filter(msg => !msg.id.toString().startsWith('temp-'));
              
              // Check if real message already exists
              const exists = withoutTemp.some(msg => msg.id === data.id);
              if (exists) return prev;
              
              return [...withoutTemp, data];
            });
            
            // Show notification if message is from another user
            if (data.user_id !== profile?.id) {
              notifyNewMessage(data.user.name, data.message, false);
            }
          }
        }
      )
      .subscribe((status) => {
        console.log('Community messages subscription status:', status);
      });

    // Refresh messages every 10 seconds as fallback
    const refreshInterval = setInterval(() => {
      fetchMessages();
    }, 10000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(refreshInterval);
    };
  }, [profile?.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMessages = async () => {
    try {
      const data = await api.getCommunityMessages();
      setMessages(data.messages);
    } catch (error) {
      toast.error('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim()) return;

    const messageText = newMessage.trim();
    setSending(true);
    
    // Optimistically add message to UI
    const tempMessage = {
      id: 'temp-' + Date.now(),
      message: messageText,
      user_id: profile.id,
      user: { id: profile.id, name: profile.name, role: profile.role },
      created_at: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, tempMessage]);
    setNewMessage('');
    
    try {
      await api.sendCommunityMessage(messageText);
    } catch (error) {
      // Remove optimistic message on error
      setMessages(prev => prev.filter(m => m.id !== tempMessage.id));
      toast.error('Failed to send message');
      setNewMessage(messageText);
    } finally {
      setSending(false);
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'HOD':
        return 'bg-purple-100 text-purple-800';
      case 'Professor':
        return 'bg-blue-100 text-blue-800';
      case 'Supporting Staff':
        return 'bg-green-100 text-green-800';
      case 'Student':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-12 h-12 animate-spin text-primary-600" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-4rem)] flex flex-col">
        <div className="flex-1 flex flex-col m-0 bg-white">
          {/* Header - Fixed */}
          <div className="flex items-center justify-between pb-4 border-b px-6 pt-4 bg-white sticky top-0 z-10 shadow-sm">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Users className="w-7 h-7 text-primary-600" />
                Community Chat
              </h1>
              <p className="text-gray-600 text-sm mt-1">
                Connect with everyone in your institution
              </p>
            </div>
            <div className="text-sm text-gray-500">
              {messages.length} messages
            </div>
          </div>

          {/* Messages - Scrollable */}
          <div className="flex-1 overflow-y-auto py-4 space-y-4 px-6 bg-gray-50">
            {messages.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p>No messages yet. Start the conversation!</p>
              </div>
            ) : (
              messages.map((msg) => {
                const isOwnMessage = msg.user_id === profile?.id;
                
                return (
                  <div
                    key={msg.id}
                    className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-md ${isOwnMessage ? 'order-2' : 'order-1'}`}>
                      <div className="flex items-center gap-2 mb-1">
                        {!isOwnMessage && (
                          <>
                            <span className="text-sm font-medium text-gray-900">
                              {msg.user?.name}
                            </span>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${getRoleBadgeColor(msg.user?.role)}`}>
                              {msg.user?.role}
                            </span>
                          </>
                        )}
                        <span className="text-xs text-gray-500">
                          {format(new Date(msg.created_at), 'HH:mm')}
                        </span>
                      </div>
                      <div
                        className={`px-4 py-2 rounded-lg ${
                          isOwnMessage
                            ? 'bg-primary-600 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap break-words">
                          {msg.message}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input - Fixed */}
          <form onSubmit={handleSendMessage} className="pt-4 border-t px-6 pb-4 bg-white sticky bottom-0 z-10 shadow-lg">
            <div className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                className="input flex-1"
                disabled={sending}
              />
              <button
                type="submit"
                disabled={sending || !newMessage.trim()}
                className="btn btn-primary px-6 flex items-center gap-2"
              >
                {sending ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Send
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
