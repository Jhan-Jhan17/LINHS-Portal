import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Use the Vite environment variable, falling back to localhost/linhs-api
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost/linhs-api';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'super_admin' | 'teacher' | 'adviser' | 'guidance' | 'nurse' | 'registrar' | 'equipment_admin' | 'facilities_admin';
  section?: string;
  category?: string;
}

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  loading: boolean;
  isSuperAdmin: boolean;
  isTeacher: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [isTeacher, setIsTeacher] = useState(false);

  const updateUserRoles = (user: User) => {
    if (user.role === 'admin' || user.role === 'super_admin') {
      setIsSuperAdmin(true);
      setIsTeacher(false);
    } else if (user.role === 'teacher' || user.role === 'adviser') {
      setIsSuperAdmin(false);
      setIsTeacher(true);
    } else {
      setIsSuperAdmin(false);
      setIsTeacher(false);
    }
  };

  useEffect(() => {
    // Check for existing session in localStorage
    const storedUser = localStorage.getItem('auth_user');
    const storedToken = localStorage.getItem('auth_token');
        
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        if (storedToken) {
          setAccessToken(storedToken);
        }
        updateUserRoles(parsedUser);
      } catch (e) {
        console.error("Failed to parse stored user", e);
      }
    }
    
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    // Send request to your WAMP PHP backend
    const response = await fetch(`${API_BASE}/auth/login.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      // Throw the error message returned by PHP
      throw new Error(data.error || 'Invalid email or password');
    }

    const { token, user } = data;

    // Store session
    localStorage.setItem('auth_user', JSON.stringify(user));
    if (token) {
      localStorage.setItem('auth_token', token);
      setAccessToken(token);
    }
    
    setUser(user);
    updateUserRoles(user);
  };

  const signup = async (email: string, password: string, name: string) => {
    throw new Error('Signup must be done directly through the database for security reasons.');
  };

  const logout = async () => {
    // Attempt to notify the backend, but don't block if it fails
    try {
      await fetch(`${API_BASE}/auth/logout.php`, { method: 'POST' });
    } catch (error) {
      console.error("Logout request failed", error);
    }

    // Clear localStorage
    localStorage.removeItem('auth_user');
    localStorage.removeItem('auth_token');
        
    setUser(null);
    setAccessToken(null);
    setIsSuperAdmin(false);
    setIsTeacher(false);
  };

  return (
    <AuthContext.Provider value={{ user, accessToken, loading, isSuperAdmin, isTeacher, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}