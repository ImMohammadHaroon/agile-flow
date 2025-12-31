import { supabaseAdmin } from '../config/supabase.js';
import { sendTaskAssignmentEmail } from '../services/emailService.js';

// Create task
export const createTask = async (req, res) => {
  try {
    const { title, description, deadline, assigned_to } = req.body;
    const assigned_by = req.user.id;
    const assignerRole = req.user.role;

    // Validate input
    if (!title || !assigned_to) {
      return res.status(400).json({ error: 'Title and assigned_to are required' });
    }

    // Get assigned user to check role
    const { data: assignedUser, error: userError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', assigned_to)
      .single();

    if (userError || !assignedUser) {
      return res.status(404).json({ error: 'Assigned user not found' });
    }

    // Validate role-based assignment
    if (assignerRole === 'Professor') {
      if (!['Student', 'Supporting Staff'].includes(assignedUser.role)) {
        return res.status(403).json({ 
          error: 'Professors can only assign tasks to Students and Supporting Staff' 
        });
      }
    }

    // Create task
    const { data: task, error } = await supabaseAdmin
      .from('tasks')
      .insert([
        {
          title,
          description,
          deadline,
          assigned_by,
          assigned_to,
          status: 'Pending'
        }
      ])
      .select(`
        *,
        assigner:assigned_by(id, name, email, role),
        assignee:assigned_to(id, name, email, role)
      `)
      .single();

    if (error) throw error;

    // Send email notification
    try {
      await sendTaskAssignmentEmail(
        assignedUser.email,
        assignedUser.name,
        title,
        req.user.name,
        deadline
      );
    } catch (emailError) {
      console.error('Email notification failed:', emailError);
      // Don't fail the request if email fails
    }

    res.status(201).json({ 
      message: 'Task created successfully',
      task 
    });
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get all tasks (with role-based filtering)
export const getTasks = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    const { status, assigned_to, assigned_by } = req.query;

    let query = supabaseAdmin
      .from('tasks')
      .select(`
        *,
        assigner:assigned_by(id, name, email, role),
        assignee:assigned_to(id, name, email, role)
      `);

    // Role-based filtering
    if (userRole === 'Student' || userRole === 'Supporting Staff') {
      // Can only see tasks assigned to them
      query = query.eq('assigned_to', userId);
    } else if (userRole === 'Professor') {
      // Can see tasks they assigned or tasks assigned to them
      query = query.or(`assigned_by.eq.${userId},assigned_to.eq.${userId}`);
    }
    // HOD can see all tasks (no additional filter)

    // Additional filters
    if (status) query = query.eq('status', status);
    if (assigned_to) query = query.eq('assigned_to', assigned_to);
    if (assigned_by) query = query.eq('assigned_by', assigned_by);

    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;

    if (error) throw error;

    res.json({ tasks: data });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get single task
export const getTaskById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const { data: task, error } = await supabaseAdmin
      .from('tasks')
      .select(`
        *,
        assigner:assigned_by(id, name, email, role),
        assignee:assigned_to(id, name, email, role)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;

    // Check access permission
    if (userRole === 'Student' || userRole === 'Supporting Staff') {
      if (task.assigned_to !== userId) {
        return res.status(403).json({ error: 'Access denied' });
      }
    } else if (userRole === 'Professor') {
      if (task.assigned_by !== userId && task.assigned_to !== userId) {
        return res.status(403).json({ error: 'Access denied' });
      }
    }

    res.json({ task });
  } catch (error) {
    console.error('Error fetching task:', error);
    res.status(500).json({ error: error.message });
  }
};

// Update task
export const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, deadline, status } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Get current task
    const { data: currentTask, error: fetchError } = await supabaseAdmin
      .from('tasks')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !currentTask) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Check permissions
    const isAssignee = currentTask.assigned_to === userId;
    const isAssigner = currentTask.assigned_by === userId;

    if (userRole === 'Student' || userRole === 'Supporting Staff') {
      // Can only update status if assigned to them
      if (!isAssignee) {
        return res.status(403).json({ error: 'Access denied' });
      }
      if (title !== undefined || description !== undefined || deadline !== undefined) {
        return res.status(403).json({ error: 'You can only update task status' });
      }
    } else if (userRole === 'Professor') {
      // Can update tasks they assigned or their own status
      if (!isAssigner && !isAssignee) {
        return res.status(403).json({ error: 'Access denied' });
      }
      // If they are only the assignee (not the assigner), they can only update status
      if (isAssignee && !isAssigner) {
        if (title !== undefined || description !== undefined || deadline !== undefined) {
          return res.status(403).json({ error: 'You can only update task status' });
        }
      }
    }

    // Build update object
    const updates = {};
    if (title !== undefined && (isAssigner || userRole === 'HOD')) updates.title = title;
    if (description !== undefined && (isAssigner || userRole === 'HOD')) updates.description = description;
    if (deadline !== undefined && (isAssigner || userRole === 'HOD')) updates.deadline = deadline;
    if (status !== undefined) updates.status = status;

    const { data, error } = await supabaseAdmin
      .from('tasks')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        assigner:assigned_by(id, name, email, role),
        assignee:assigned_to(id, name, email, role)
      `)
      .single();

    if (error) throw error;

    res.json({ 
      message: 'Task updated successfully',
      task: data 
    });
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ error: error.message });
  }
};

// Delete task
export const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Get current task
    const { data: currentTask, error: fetchError } = await supabaseAdmin
      .from('tasks')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !currentTask) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Only assigner or HOD can delete
    if (userRole !== 'HOD' && currentTask.assigned_by !== userId) {
      return res.status(403).json({ error: 'Only task creator or HOD can delete tasks' });
    }

    const { error } = await supabaseAdmin
      .from('tasks')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get task statistics
export const getTaskStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    let query = supabaseAdmin.from('tasks').select('status, assigned_to, assigned_by');

    // Role-based filtering
    if (userRole === 'Student' || userRole === 'Supporting Staff') {
      query = query.eq('assigned_to', userId);
    } else if (userRole === 'Professor') {
      query = query.or(`assigned_by.eq.${userId},assigned_to.eq.${userId}`);
    }

    const { data, error } = await query;

    if (error) throw error;

    const stats = {
      total: data.length,
      pending: data.filter(t => t.status === 'Pending').length,
      inProgress: data.filter(t => t.status === 'In Progress').length,
      completed: data.filter(t => t.status === 'Completed').length,
      assigned: data.filter(t => t.assigned_by === userId).length,
      received: data.filter(t => t.assigned_to === userId).length
    };

    res.json({ stats });
  } catch (error) {
    console.error('Error fetching task stats:', error);
    res.status(500).json({ error: error.message });
  }
};
