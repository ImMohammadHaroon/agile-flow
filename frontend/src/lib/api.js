const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

class ApiService {
  constructor() {
    this.baseURL = API_URL;
  }

  getAuthToken() {
    return localStorage.getItem('supabase_token');
  }

  async request(endpoint, options = {}) {
    const token = this.getAuthToken();
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    };

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Request failed');
      }

      return data;
    } catch (error) {
      console.error('API request error:', error);
      throw error;
    }
  }

  // Auth
  async getCurrentUser() {
    return this.request('/api/auth/me');
  }

  async register(userData) {
    return this.request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  // Users
  async getUsers() {
    return this.request('/api/users');
  }

  async getUsersByRole(role) {
    return this.request(`/api/users/role/${role}`);
  }

  async createUser(userData) {
    return this.request('/api/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async updateUser(id, userData) {
    return this.request(`/api/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async deleteUser(id) {
    return this.request(`/api/users/${id}`, {
      method: 'DELETE',
    });
  }

  async updateOnlineStatus(status) {
    return this.request('/api/users/status/online', {
      method: 'PATCH',
      body: JSON.stringify({ online_status: status }),
    });
  }

  // Tasks
  async getTasks(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/api/tasks${query ? `?${query}` : ''}`);
  }

  async getTask(id) {
    return this.request(`/api/tasks/${id}`);
  }

  async createTask(taskData) {
    return this.request('/api/tasks', {
      method: 'POST',
      body: JSON.stringify(taskData),
    });
  }

  async updateTask(id, taskData) {
    return this.request(`/api/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(taskData),
    });
  }

  async deleteTask(id) {
    return this.request(`/api/tasks/${id}`, {
      method: 'DELETE',
    });
  }

  async getTaskStats() {
    return this.request('/api/tasks/stats');
  }

  // Messages
  async getCommunityMessages(limit = 100) {
    return this.request(`/api/messages/community?limit=${limit}`);
  }

  async sendCommunityMessage(message) {
    return this.request('/api/messages/community', {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
  }

  async getPrivateMessages(otherUserId) {
    return this.request(`/api/messages/private?otherUserId=${otherUserId}`);
  }

  async sendPrivateMessage(receiver_id, message) {
    return this.request('/api/messages/private', {
      method: 'POST',
      body: JSON.stringify({ receiver_id, message }),
    });
  }

  async markMessageAsRead(id) {
    return this.request(`/api/messages/private/${id}/read`, {
      method: 'PATCH',
    });
  }

  async getUnreadCount() {
    return this.request('/api/messages/private/unread-count');
  }

  async getConversations() {
    return this.request('/api/messages/private/conversations');
  }
}

export default new ApiService();
