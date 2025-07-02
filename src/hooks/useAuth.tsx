
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
    console.log('AuthProvider: Checking authentication...');
    try {
      // First check localStorage
      let userData = localStorage.getItem('proposync-user');
      console.log('AuthProvider: localStorage data:', userData);
      
      // If not found, check sessionStorage backup
      if (!userData) {
        userData = sessionStorage.getItem('proposync-user-backup');
        console.log('AuthProvider: sessionStorage backup data:', userData);
        if (userData) {
          // Restore to localStorage
          localStorage.setItem('proposync-user', userData);
          console.log('AuthProvider: Restored data to localStorage');
        }
      }

      if (userData) {
        const parsedUser = JSON.parse(userData);
        console.log('AuthProvider: Parsed user data:', parsedUser);
        
        // Validate the user data structure
        if (parsedUser.type && (parsedUser.rollNumber || parsedUser.adminCode)) {
          console.log('AuthProvider: Valid user data, setting user');
          setUser(parsedUser);
        } else {
          console.log('AuthProvider: Invalid user data structure, clearing storage');
          // Invalid data, clear storage
          localStorage.removeItem('proposync-user');
          sessionStorage.removeItem('proposync-user-backup');
          setUser(null);
        }
      } else {
        console.log('AuthProvider: No user data found');
        setUser(null);
      }
    } catch (error) {
      console.error('AuthProvider: Auth check error:', error);
      localStorage.removeItem('proposync-user');
      sessionStorage.removeItem('proposync-user-backup');
      setUser(null);
    } finally {
      setIsLoading(false);
      console.log('AuthProvider: Auth check completed');
    }
  };

  const logout = () => {
    console.log('AuthProvider: Logout initiated');
    localStorage.removeItem('proposync-user');
    sessionStorage.removeItem('proposync-user-backup');
    setUser(null);
    navigate('/auth');
  };

  useEffect(() => {
    console.log('AuthProvider: useEffect triggered');
    checkAuth();

    // Listen for storage changes from other tabs
    const handleStorageChange = (e: StorageEvent) => {
      console.log('AuthProvider: Storage change detected:', e.key);
      if (e.key === 'proposync-user') {
        checkAuth();
      }
    };

    // Listen for visibility changes (app coming back from background)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('AuthProvider: App gained focus, checking auth');
        checkAuth();
      }
    };

    // Listen for focus events (app regaining focus)
    const handleFocus = () => {
      console.log('AuthProvider: Window focused, checking auth');
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
