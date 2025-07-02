
import { useState, useEffect, createContext, useContext } from 'react';
import { useNavigate } from 'react-router-dom';

interface AuthUser {
  type: 'student' | 'admin';
  rollNumber?: string;
  department?: string;
  profileId?: string;
  adminCode?: string;
  loginTime?: string;
  persistentLogin?: boolean;
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  logout: () => void;
  checkAuth: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const checkAuth = () => {
    try {
      // First check localStorage
      let userData = localStorage.getItem('proposync-user');
      
      // If not found, check sessionStorage backup
      if (!userData) {
        userData = sessionStorage.getItem('proposync-user-backup');
        if (userData) {
          // Restore to localStorage
          localStorage.setItem('proposync-user', userData);
        }
      }

      if (userData) {
        const parsedUser = JSON.parse(userData);
        
        // Validate the user data structure
        if (parsedUser.type && (parsedUser.rollNumber || parsedUser.adminCode)) {
          setUser(parsedUser);
        } else {
          // Invalid data, clear storage
          localStorage.removeItem('proposync-user');
          sessionStorage.removeItem('proposync-user-backup');
          setUser(null);
        }
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Auth check error:', error);
      localStorage.removeItem('proposync-user');
      sessionStorage.removeItem('proposync-user-backup');
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('proposync-user');
    sessionStorage.removeItem('proposync-user-backup');
    setUser(null);
    navigate('/auth');
  };

  useEffect(() => {
    checkAuth();

    // Listen for storage changes from other tabs
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'proposync-user') {
        checkAuth();
      }
    };

    // Listen for visibility changes (app coming back from background)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        checkAuth();
      }
    };

    // Listen for focus events (app regaining focus)
    const handleFocus = () => {
      checkAuth();
    };

    window.addEventListener('storage', handleStorageChange);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
