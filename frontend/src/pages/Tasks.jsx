import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import { supabase } from '../lib/supabase';
import api from '../lib/api';
import toast from 'react-hot-toast';
import {
  Plus,
  Search,
  Filter,
  Calendar,
  User,
  X,
  Loader2,
  Edit,
  Trash2
} from 'lucide-react';
import { format } from 'date-fns';
import { notifyNewTask } from '../utils/notifications';

export default function Tasks() {
  const { profile, isAdmin } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchTasks();
    if (isAdmin) {
      fetchUsers();
    }
    subscribeToTasks();
  }, []);

  useEffect(() => {
    filterTasks();
  }, [tasks, searchTerm, statusFilter]);

  const subscribeToTasks = () => {
    const channel = supabase
      .channel('tasks')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks'
        },
        async (payload) => {
          // Check if it's a new task assigned to current user
          if (payload.eventType === 'INSERT' && payload.new.assigned_to === profile?.id) {
            // Fetch complete task with user data
            const { data } = await supabase
              .from('tasks')
              .select(`
                *,
                assigner:assigned_by(id, name, email, role),
                assignee:assigned_to(id, name, email, role)
              `)
              .eq('id', payload.new.id)
              .single();

            if (data) {
              // Show notification for new task assignment
              notifyNewTask(data.assigner.name, data.title);
            }
          }
          
          // Refresh tasks on any change (INSERT, UPDATE, DELETE)
          fetchTasks();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const fetchTasks = async () => {
    try {
      const data = await api.getTasks();
      setTasks(data.tasks);
    } catch (error) {
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const data = await api.getUsers();
      setUsers(data.users);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const filterTasks = () => {
    let filtered = [...tasks];

    if (searchTerm) {
      filtered = filtered.filter(
        (task) =>
          task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          task.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((task) => task.status === statusFilter);
    }

    setFilteredTasks(filtered);
  };

  const handleCreateTask = async (taskData) => {
    try {
      await api.createTask(taskData);
      toast.success('Task created successfully');
      setShowCreateModal(false);
      fetchTasks();
    } catch (error) {
      toast.error(error.message || 'Failed to create task');
    }
  };

  const handleUpdateTask = async (taskData) => {
    try {
      await api.updateTask(selectedTask.id, taskData);
      toast.success('Task updated successfully');
      setShowEditModal(false);
      setSelectedTask(null);
      fetchTasks();
    } catch (error) {
      toast.error(error.message || 'Failed to update task');
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!confirm('Are you sure you want to delete this task?')) return;

    try {
      await api.deleteTask(taskId);
      toast.success('Task deleted successfully');
      fetchTasks();
    } catch (error) {
      toast.error(error.message || 'Failed to delete task');
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await api.updateTask(taskId, { status: newStatus });
      toast.success('Task status updated');
      fetchTasks();
    } catch (error) {
      toast.error(error.message || 'Failed to update status');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Pending':
        return 'badge badge-pending';
      case 'In Progress':
        return 'badge badge-progress';
      case 'Completed':
        return 'badge badge-completed';
      default:
        return 'badge';
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
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Tasks</h1>
            <p className="text-gray-600 mt-1">
              Manage and track your tasks
            </p>
          </div>
          {isAdmin && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn btn-primary flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Create Task
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="card">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-500" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="input"
              >
                <option value="all">All Status</option>
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tasks Grid */}
        {filteredTasks.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-gray-500">No tasks found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredTasks.map((task) => (
              <div key={task.id} className="card hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {task.title}
                    </h3>
                    <p className="text-gray-600 text-sm line-clamp-2">
                      {task.description || 'No description'}
                    </p>
                  </div>
                  {(isAdmin || task.assigned_to === profile.id) && (
                    <div className="flex items-center gap-2 ml-4">
                      {task.assigned_to === profile.id && (
                        <button
                          onClick={() => {
                            setSelectedTask(task);
                            setShowEditModal(true);
                          }}
                          className="text-primary-600 hover:text-primary-700"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                      )}
                      {(profile.role === 'HOD' || task.assigned_by === profile.id) && (
                        <button
                          onClick={() => handleDeleteTask(task.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      <span>
                        {task.assigned_to === profile.id ? 'You' : task.assignee?.name}
                      </span>
                    </div>
                    {task.deadline && (
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>{format(new Date(task.deadline), 'MMM dd, yyyy')}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <span className={getStatusBadge(task.status)}>
                      {task.status}
                    </span>
                    {task.assigned_to === profile.id && (
                      <select
                        value={task.status}
                        onChange={(e) => handleStatusChange(task.id, e.target.value)}
                        className="text-sm border border-gray-300 rounded-lg px-3 py-1 focus:ring-2 focus:ring-primary-500"
                      >
                        <option value="Pending">Pending</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                      </select>
                    )}
                  </div>

                  <div className="text-xs text-gray-500 pt-2 border-t">
                    Assigned by: {task.assigner?.name}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Task Modal */}
      {showCreateModal && (
        <TaskModal
          users={users}
          currentRole={profile.role}
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateTask}
        />
      )}

      {/* Edit Task Modal */}
      {showEditModal && selectedTask && (
        <TaskModal
          task={selectedTask}
          users={users}
          currentRole={profile.role}
          onClose={() => {
            setShowEditModal(false);
            setSelectedTask(null);
          }}
          onSubmit={handleUpdateTask}
        />
      )}
    </DashboardLayout>
  );
}

// Task Modal Component
function TaskModal({ task, users, currentRole, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    title: task?.title || '',
    description: task?.description || '',
    deadline: task?.deadline ? format(new Date(task.deadline), "yyyy-MM-dd'T'HH:mm") : '',
    assigned_to: task?.assigned_to || '',
    status: task?.status || 'Pending'
  });
  const [submitting, setSubmitting] = useState(false);

  // Filter users based on role
  const getEligibleUsers = () => {
    if (currentRole === 'HOD') {
      return users; // Can assign to anyone
    } else if (currentRole === 'Professor') {
      return users.filter(u => ['Student', 'Supporting Staff'].includes(u.role));
    }
    return [];
  };

  const eligibleUsers = getEligibleUsers();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      let submitData;
      
      if (task) {
        // When editing, only send status (assigned user can only change status)
        submitData = { status: formData.status };
      } else {
        // When creating, send all data
        submitData = { ...formData };
        if (!submitData.deadline) delete submitData.deadline;
      }
      
      await onSubmit(submitData);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">
            {task ? 'Edit Task' : 'Create New Task'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Show title and description but disable if user is only assignee */}
          {task && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> As the assigned user, you can only update the task status. 
                Contact the task creator to modify other details.
              </p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="input"
              required
              disabled={!!task}
              readOnly={!!task}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="input"
              rows="3"
              disabled={!!task}
              readOnly={!!task}
            />
          </div>

          {!task && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assign To *
              </label>
              <select
                value={formData.assigned_to}
                onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })}
                className="input"
                required
              >
                <option value="">Select user...</option>
                {eligibleUsers.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name} ({user.role})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Deadline
            </label>
            <input
              type="datetime-local"
              value={formData.deadline}
              onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
              className="input"
              disabled={!!task}
              readOnly={!!task}
            />
          </div>

          {task && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="input"
              >
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 btn btn-secondary"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 btn btn-primary flex items-center justify-center gap-2"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {task ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                task ? 'Update Task' : 'Create Task'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
