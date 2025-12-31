import { useEffect, useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import { supabase } from '../lib/supabase';
import api from '../lib/api';
import toast from 'react-hot-toast';
import { Send, Loader2, Mail, Search } from 'lucide-react';
import { format } from 'date-fns';
import { notifyNewMessage } from '../utils/notifications';

export default function PrivateMessages() {
  const { profile } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [professors, setProfessors] = useState([]);
  const [hods, setHods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchConversations();
    fetchUsers();
    
    // Subscribe to private messages
    const channel = supabase
      .channel('private_messages_channel')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages'
        },
        async (payload) => {
          console.log('New private message received:', payload);
          const newMsg = payload.new;
          
          // Only update if message involves current user
          if (newMsg.sender_id === profile?.id || newMsg.receiver_id === profile?.id) {
            // Fetch complete message with user data
            const { data, error } = await supabase
              .from('messages')
              .select(`
                *,
                sender:sender_id(id, name, role),
                receiver:receiver_id(id, name, role)
              `)
              .eq('id', newMsg.id)
              .single();

            if (data && !error) {
              // Update messages if chat is open
              if (selectedUser && 
                  (data.sender_id === selectedUser.id || data.receiver_id === selectedUser.id)) {
                setMessages(prev => {
                  // Remove temporary message if exists
                  const withoutTemp = prev.filter(msg => !msg.id.toString().startsWith('temp-'));
                  
                  // Check if real message already exists
                  const exists = withoutTemp.some(msg => msg.id === data.id);
                  if (exists) return prev;
                  
                  return [...withoutTemp, data];
                });
              }
              
              // Refresh conversations
              fetchConversations();
              
              // Show notification if message is from another user
              if (data.sender_id !== profile?.id) {
                notifyNewMessage(data.sender.name, data.message, true);
              }
            }
          }
        }
      )
      .subscribe((status) => {
        console.log('Private messages subscription status:', status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile?.id, selectedUser?.id]);

  useEffect(() => {
    if (selectedUser) {
      fetchMessages(selectedUser.id);
    }
  }, [selectedUser]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchConversations = async () => {
    try {
      const data = await api.getConversations();
      setConversations(data.conversations || []);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const data = await api.getUsers();
      if (profile.role === 'HOD') {
        setProfessors(data.users.filter(u => u.role === 'Professor'));
      } else if (profile.role === 'Professor') {
        setHods(data.users.filter(u => u.role === 'HOD'));
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchMessages = async (userId) => {
    try {
      const data = await api.getPrivateMessages(userId);
      setMessages(data.messages);
    } catch (error) {
      toast.error('Failed to load messages');
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !selectedUser) return;

    const messageText = newMessage.trim();
    setSending(true);
    
    // Optimistically add message to UI
    const tempMessage = {
      id: 'temp-' + Date.now(),
      message: messageText,
      sender_id: profile.id,
      receiver_id: selectedUser.id,
      sender: { id: profile.id, name: profile.name, role: profile.role },
      receiver: selectedUser,
      created_at: new Date().toISOString(),
      read: false
    };
    
    setMessages(prev => [...prev, tempMessage]);
    setNewMessage('');
    
    try {
      await api.sendPrivateMessage(selectedUser.id, messageText);
      // Refresh conversations to update last message
      fetchConversations();
    } catch (error) {
      // Remove optimistic message on error
      setMessages(prev => prev.filter(m => m.id !== tempMessage.id));
      toast.error('Failed to send message');
      setNewMessage(messageText);
    } finally {
      setSending(false);
    }
  };

  const getAvailableUsers = () => {
    const existing = conversations.map(c => c.user.id);
    const allUsers = profile.role === 'HOD' ? professors : hods;
    return allUsers.filter(u => !existing.includes(u.id));
  };

  const availableUsers = getAvailableUsers();
  const filteredConversations = conversations.filter(c =>
    c.user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
      <div className="h-[calc(100vh-8rem)] flex gap-6">
        {/* Conversations Sidebar */}
        <div className="w-80 card flex flex-col">
          <div className="pb-4 border-b">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Mail className="w-6 h-6 text-primary-600" />
              Messages
            </h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-9 text-sm"
              />
            </div>
          </div>

          {/* New Conversation */}
          {availableUsers.length > 0 && (
            <div className="py-3 border-b">
              <p className="text-xs font-medium text-gray-500 mb-2 px-1">START NEW CHAT</p>
              <div className="space-y-1">
                {availableUsers.map(user => (
                  <button
                    key={user.id}
                    onClick={() => setSelectedUser(user)}
                    className="w-full flex items-center gap-3 px-3 py-2 hover:bg-primary-50 rounded-lg transition-colors text-left"
                  >
                    <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-primary-600 font-semibold">
                        {user.name[0].toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {user.name}
                      </p>
                      <p className="text-xs text-gray-500">{user.role}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto py-2">
            {filteredConversations.length === 0 ? (
              <div className="text-center py-8 text-gray-500 text-sm">
                <p>No conversations yet</p>
              </div>
            ) : (
              <div className="space-y-1">
                {filteredConversations.map((conv) => (
                  <button
                    key={conv.user.id}
                    onClick={() => setSelectedUser(conv.user)}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-colors text-left ${
                      selectedUser?.id === conv.user.id
                        ? 'bg-primary-50 border-l-4 border-primary-600'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-primary-600 font-semibold">
                        {conv.user.name[0].toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {conv.user.name}
                        </p>
                        {conv.lastMessageTime && (
                          <span className="text-xs text-gray-500">
                            {format(new Date(conv.lastMessageTime), 'HH:mm')}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-600 truncate">
                        {conv.lastMessage}
                      </p>
                    </div>
                    {conv.unread && (
                      <div className="w-2 h-2 bg-primary-600 rounded-full flex-shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 card flex flex-col">
          {!selectedUser ? (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <Mail className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-lg">Select a conversation to start messaging</p>
              </div>
            </div>
          ) : (
            <>
              {/* Chat Header */}
              <div className="pb-4 border-b">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-primary-600 font-semibold text-lg">
                      {selectedUser.name[0].toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      {selectedUser.name}
                    </h2>
                    <p className="text-sm text-gray-500">{selectedUser.role}</p>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto py-4 space-y-4">
                {messages.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <p>No messages yet. Start the conversation!</p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isOwnMessage = msg.sender_id === profile?.id;
                    
                    return (
                      <div
                        key={msg.id}
                        className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-md ${isOwnMessage ? 'order-2' : 'order-1'}`}>
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
                          <p className="text-xs text-gray-500 mt-1">
                            {format(new Date(msg.created_at), 'MMM dd, HH:mm')}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <form onSubmit={handleSendMessage} className="pt-4 border-t">
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
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
