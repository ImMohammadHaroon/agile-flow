import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import api from '../lib/api';
import toast from 'react-hot-toast';
import {
  CheckSquare,
  Clock,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Users as UsersIcon
} from 'lucide-react';
import { format } from 'date-fns';

export default function Dashboard() {
  const { profile } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentTasks, setRecentTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsData, tasksData] = await Promise.all([
        api.getTaskStats(),
        api.getTasks({ limit: 5 })
      ]);

      setStats(statsData.stats);
      setRecentTasks(tasksData.tasks.slice(0, 5));

      // Fetch users if HOD
      if (profile.role === 'HOD') {
        const usersData = await api.getUsers();
        setUsers(usersData.users);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Pending':
        return <span className="badge badge-pending">{status}</span>;
      case 'In Progress':
        return <span className="badge badge-progress">{status}</span>;
      case 'Completed':
        return <span className="badge badge-completed">{status}</span>;
      default:
        return <span className="badge">{status}</span>;
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {profile?.name}!
          </h1>
          <p className="text-gray-600 mt-1">
            Here's what's happening with your tasks today.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Total Tasks</p>
                <p className="text-3xl font-bold mt-2">{stats?.total || 0}</p>
              </div>
              <CheckSquare className="w-12 h-12 text-blue-200" />
            </div>
          </div>

          <div className="card bg-gradient-to-br from-yellow-500 to-orange-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100 text-sm font-medium">Pending</p>
                <p className="text-3xl font-bold mt-2">{stats?.pending || 0}</p>
              </div>
              <Clock className="w-12 h-12 text-yellow-200" />
            </div>
          </div>

          <div className="card bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">In Progress</p>
                <p className="text-3xl font-bold mt-2">{stats?.inProgress || 0}</p>
              </div>
              <TrendingUp className="w-12 h-12 text-purple-200" />
            </div>
          </div>

          <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Completed</p>
                <p className="text-3xl font-bold mt-2">{stats?.completed || 0}</p>
              </div>
              <CheckCircle2 className="w-12 h-12 text-green-200" />
            </div>
          </div>
        </div>

        {/* Recent Tasks */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Recent Tasks</h2>
            <a href="/tasks" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
              View All →
            </a>
          </div>

          {recentTasks.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">No tasks found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-primary-300 transition-colors"
                >
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{task.title}</h3>
                    <div className="flex items-center gap-4 mt-1">
                      <p className="text-sm text-gray-500">
                        {task.assignee?.name}
                      </p>
                      {task.deadline && (
                        <p className="text-sm text-gray-500">
                          Due: {format(new Date(task.deadline), 'MMM dd, yyyy')}
                        </p>
                      )}
                    </div>
                  </div>
                  <div>
                    {getStatusBadge(task.status)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* HOD Only: User Overview */}
        {profile.role === 'HOD' && (
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">User Overview</h2>
              <a href="/users" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                Manage Users →
              </a>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {['HOD', 'Professor', 'Supporting Staff', 'Student'].map((role) => {
                const count = users.filter(u => u.role === role).length;
                return (
                  <div key={role} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <UsersIcon className="w-8 h-8 text-primary-600" />
                      <div>
                        <p className="text-2xl font-bold text-gray-900">{count}</p>
                        <p className="text-sm text-gray-600">{role}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
