import { supabaseAdmin } from '../config/supabase.js';

// Get all users (for HOD and Professor to manage)
export const getAllUsers = async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select(`
        *,
        creator:created_by(id, name, role)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({ users: data });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get users by role
export const getUsersByRole = async (req, res) => {
  try {
    const { role } = req.params;
    
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('role', role)
      .order('name');

    if (error) throw error;

    res.json({ users: data });
  } catch (error) {
    console.error('Error fetching users by role:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get single user
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    res.json({ user: data });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: error.message });
  }
};

// Create user (HOD and Professor)
export const createUser = async (req, res) => {
  try {
    const { email, password, name, role } = req.body;
    const creatorRole = req.user.role;
    const creatorId = req.user.id;

    // Validate input
    if (!email || !password || !name || !role) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const validRoles = ['HOD', 'Professor', 'Supporting Staff', 'Student'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    // Role-based validation
    if (creatorRole === 'Professor') {
      // Professors can only create Students and Supporting Staff
      if (!['Student', 'Supporting Staff'].includes(role)) {
        return res.status(403).json({ 
          error: 'Professors can only create Students and Supporting Staff' 
        });
      }
    }
    // HOD can create any role

    // Create auth user
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name, role }
    });

    if (authError) throw authError;

    // Create user profile with created_by tracking
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .insert([
        {
          id: authData.user.id,
          email,
          name,
          role,
          created_by: creatorId
        }
      ])
      .select(`
        *,
        creator:created_by(id, name, role)
      `)
      .single();

    if (userError) throw userError;

    res.status(201).json({ 
      message: 'User created successfully',
      user: userData 
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: error.message });
  }
};

// Update user
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, role, online_status } = req.body;

    const updates = {};
    if (name !== undefined) updates.name = name;
    if (role !== undefined) updates.role = role;
    if (online_status !== undefined) updates.online_status = online_status;

    const { data, error } = await supabaseAdmin
      .from('users')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json({ 
      message: 'User updated successfully',
      user: data 
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: error.message });
  }
};

// Delete user
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Delete auth user (cascade will delete profile)
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(id);

    if (authError) throw authError;

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: error.message });
  }
};

// Update online status
export const updateOnlineStatus = async (req, res) => {
  try {
    const { online_status } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { data, error } = await supabaseAdmin
      .from('users')
      .update({ online_status })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;

    res.json({ user: data });
  } catch (error) {
    console.error('Error updating online status:', error);
    res.status(500).json({ error: error.message });
  }
};
