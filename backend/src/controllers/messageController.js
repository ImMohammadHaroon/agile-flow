import { supabaseAdmin } from '../config/supabase.js';

// Get private messages (HOD and Professors)
export const getPrivateMessages = async (req, res) => {
  try {
    const userId = req.user.id;
    const { otherUserId } = req.query;

    let query = supabaseAdmin
      .from('messages')
      .select(`
        *,
        sender:sender_id(id, name, role),
        receiver:receiver_id(id, name, role)
      `)
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`);

    if (otherUserId) {
      query = query.or(`and(sender_id.eq.${userId},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${userId})`);
    }

    query = query.order('created_at', { ascending: true });

    const { data, error } = await query;

    if (error) throw error;

    res.json({ messages: data });
  } catch (error) {
    console.error('Error fetching private messages:', error);
    res.status(500).json({ error: error.message });
  }
};

// Send private message
export const sendPrivateMessage = async (req, res) => {
  try {
    const { receiver_id, message } = req.body;
    const sender_id = req.user.id;

    if (!receiver_id || !message) {
      return res.status(400).json({ error: 'Receiver ID and message are required' });
    }

    // Verify receiver exists and is HOD or Professor
    const { data: receiver, error: receiverError } = await supabaseAdmin
      .from('users')
      .select('role')
      .eq('id', receiver_id)
      .single();

    if (receiverError || !receiver) {
      return res.status(404).json({ error: 'Receiver not found' });
    }

    if (!['HOD', 'Professor'].includes(receiver.role)) {
      return res.status(403).json({ error: 'Can only message HOD or Professors' });
    }

    // Create message
    const { data, error } = await supabaseAdmin
      .from('messages')
      .insert([
        {
          sender_id,
          receiver_id,
          message
        }
      ])
      .select(`
        *,
        sender:sender_id(id, name, role),
        receiver:receiver_id(id, name, role)
      `)
      .single();

    if (error) throw error;

    res.status(201).json({ 
      message: 'Message sent successfully',
      data 
    });
  } catch (error) {
    console.error('Error sending private message:', error);
    res.status(500).json({ error: error.message });
  }
};

// Mark message as read
export const markMessageAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Verify user is the receiver
    const { data: message, error: fetchError } = await supabaseAdmin
      .from('messages')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    if (message.receiver_id !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { data, error } = await supabaseAdmin
      .from('messages')
      .update({ read: true })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json({ message: data });
  } catch (error) {
    console.error('Error marking message as read:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get unread message count
export const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;

    const { count, error } = await supabaseAdmin
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('receiver_id', userId)
      .eq('read', false);

    if (error) throw error;

    res.json({ unreadCount: count || 0 });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get community messages
export const getCommunityMessages = async (req, res) => {
  try {
    const { limit = 100 } = req.query;

    const { data, error } = await supabaseAdmin
      .from('community_messages')
      .select(`
        *,
        user:user_id(id, name, role)
      `)
      .order('created_at', { ascending: false })
      .limit(parseInt(limit));

    if (error) throw error;

    // Reverse to show oldest first
    res.json({ messages: data.reverse() });
  } catch (error) {
    console.error('Error fetching community messages:', error);
    res.status(500).json({ error: error.message });
  }
};

// Send community message
export const sendCommunityMessage = async (req, res) => {
  try {
    const { message } = req.body;
    const user_id = req.user.id;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const { data, error } = await supabaseAdmin
      .from('community_messages')
      .insert([
        {
          user_id,
          message
        }
      ])
      .select(`
        *,
        user:user_id(id, name, role)
      `)
      .single();

    if (error) throw error;

    res.status(201).json({ 
      message: 'Message sent successfully',
      data 
    });
  } catch (error) {
    console.error('Error sending community message:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get conversation list (for HOD and Professors)
export const getConversations = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get all users who have exchanged messages with current user
    const { data: messages, error } = await supabaseAdmin
      .from('messages')
      .select(`
        *,
        sender:sender_id(id, name, role),
        receiver:receiver_id(id, name, role)
      `)
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Build unique conversations
    const conversationMap = new Map();
    
    messages.forEach(msg => {
      const otherUser = msg.sender_id === userId ? msg.receiver : msg.sender;
      
      if (!conversationMap.has(otherUser.id)) {
        conversationMap.set(otherUser.id, {
          user: otherUser,
          lastMessage: msg.message,
          lastMessageTime: msg.created_at,
          unread: !msg.read && msg.receiver_id === userId
        });
      }
    });

    const conversations = Array.from(conversationMap.values());

    res.json({ conversations });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ error: error.message });
  }
};
