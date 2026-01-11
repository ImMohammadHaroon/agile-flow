import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import api from '../lib/api';
import toast from 'react-hot-toast';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('Session error:', error);
        // Clear invalid tokens
        localStorage.removeItem('supabase_token');
        supabase.auth.signOut();
        setLoading(false);
        return;
      }
      
      setSession(session);
      if (session) {
        localStorage.setItem('supabase_token', session.access_token);
        fetchUserProfile();
      } else {
        setLoading(false);
      }
    }).catch((err) => {
      console.error('Failed to get session:', err);
      localStorage.removeItem('supabase_token');
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        localStorage.setItem('supabase_token', session.access_token);
        fetchUserProfile();
      } else {
        localStorage.removeItem('supabase_token');
        setUser(null);
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Heartbeat to maintain online status
  useEffect(() => {
    if (!user) return;

    // Update online status every 30 seconds
    const heartbeat = setInterval(async () => {
      try {
        await api.updateOnlineStatus(true);
      } catch (error) {
        console.error('Heartbeat error:', error);
      }
    }, 30000);

    // Set offline on tab/window close
    const handleBeforeUnload = async () => {
      try {
        // Use sendBeacon for reliable status update on page unload
        const token = localStorage.getItem('supabase_token');
        if (token) {
          const blob = new Blob(
            [JSON.stringify({ online_status: false })],
            { type: 'application/json' }
          );
          navigator.sendBeacon(
            `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/users/status/online`,
            blob
          );
        }
      } catch (error) {
        console.error('Error setting offline status:', error);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      clearInterval(heartbeat);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [user]);

  const fetchUserProfile = async () => {
    try {
      const data = await api.getCurrentUser();
      setProfile(data.user);
      setUser(data.user);
      
      // Set online status to true when user logs in
      await api.updateOnlineStatus(true);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      toast.error('Failed to load user profile');
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      localStorage.setItem('supabase_token', data.session.access_token);
      await fetchUserProfile();
      
      return { success: true };
    } catch (error) {
      console.error('Sign in error:', error);
      return { success: false, error: error.message };
    }
  };

  const signUp = async (email, password, name, role) => {
    try {
      const result = await api.register({ email, password, name, role });
      return { success: true, data: result };
    } catch (error) {
      console.error('Sign up error:', error);
      return { success: false, error: error.message };
    }
  };

  const signOut = async () => {
    try {
      await api.updateOnlineStatus(false);
    } catch (error) {
      console.error('Error updating online status:', error);
    }

    await supabase.auth.signOut();
    localStorage.removeItem('supabase_token');
    setUser(null);
    setProfile(null);
  };

  const updateProfile = async (updates) => {
    try {
      const data = await api.updateUser(user.id, updates);
      setProfile(data.user);
      setUser(data.user);
      return { success: true };
    } catch (error) {
      console.error('Update profile error:', error);
      return { success: false, error: error.message };
    }
  };

  const value = {
    user,
    profile,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    updateProfile,
    isAdmin: profile?.role === 'HOD' || profile?.role === 'Professor',
    isHOD: profile?.role === 'HOD',
    isProfessor: profile?.role === 'Professor',
    isStaff: profile?.role === 'Supporting Staff',
    isStudent: profile?.role === 'Student',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
