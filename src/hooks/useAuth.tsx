
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
  login: (userData: AuthUser) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const login = (userData: AuthUser) => {
    console.log('AuthProvider: Login initiated with:', userData);
    try {
      const userDataString = JSON.stringify(userData);
      localStorage.setItem('proposync-user', userDataString);
      sessionStorage.setItem('proposync-user-backup', userDataString);
      
      setUser(userData);
      setIsLoading(false);
      console.log('AuthProvider: Login successful, user set');
    } catch (error) {
      console.error('AuthProvider: Login error:', error);
      setIsLoading(false);
    }
  };

  const checkAuth = () => {
    console.log('AuthProvider: Checking authentication...');
    setIsLoading(true);
    
    try {
      let userData = localStorage.getItem('proposync-user');
      console.log('AuthProvider: localStorage data:', userData);
      
      if (!userData) {
        userData = sessionStorage.getItem('proposync-user-backup');
        console.log('AuthProvider: sessionStorage backup data:', userData);
        if (userData) {
          localStorage.setItem('proposync-user', userData);
          console.log('AuthProvider: Restored data to localStorage');
        }
      }

      if (userData) {
        const parsedUser = JSON.parse(userData);
        console.log('AuthProvider: Parsed user data:', parsedUser);
        
        if (parsedUser.type && (parsedUser.rollNumber || parsedUser.adminCode)) {
          console.log('AuthProvider: Valid user data, setting user');
          setUser(parsedUser);
        } else {
          console.log('AuthProvider: Invalid user data structure, clearing storage');
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
    }
    
    setIsLoading(false);
    console.log('AuthProvider: Auth check completed');
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
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, logout, checkAuth, login }}>
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
