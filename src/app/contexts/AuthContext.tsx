import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'super_admin' | 'teacher' | 'adviser' | 'guidance' | 'nurse' | 'registrar' | 'equipment_admin' | 'facilities_admin';
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

// Mock users for local authentication
const MOCK_USERS = [
  { id: '1', email: 'admin@linhs.edu.ph', password: 'admin123', name: 'Super Admin', role: 'super_admin' as const },
  { id: '2', email: 'teacher@linhs.edu.ph', password: 'teacher123', name: 'John Teacher', role: 'teacher' as const },
  
  // Class Advisers (3 sections)
  { id: '3', email: 'adviser1@linhs.edu.ph', password: 'adviser123', name: 'Maria Santos', role: 'adviser' as const, section: 'ICT 11-A' },
  { id: '4', email: 'adviser2@linhs.edu.ph', password: 'adviser123', name: 'Pedro Cruz', role: 'adviser' as const, section: 'STEM 11-A' },
  { id: '5', email: 'adviser3@linhs.edu.ph', password: 'adviser123', name: 'Ana Reyes', role: 'adviser' as const, section: 'HUMSS 11-A' },
  
  // Specialized Staff
  { id: '6', email: 'guidance@linhs.edu.ph', password: 'guidance123', name: 'Mary Counselor', role: 'guidance' as const },
  { id: '7', email: 'nurse@linhs.edu.ph', password: 'nurse123', name: 'Sarah Nurse', role: 'nurse' as const },
  { id: '8', email: 'registrar@linhs.edu.ph', password: 'registrar123', name: 'Robert Registrar', role: 'registrar' as const },
  
  // Equipment Admins (5 categories)
  { id: '9', email: 'lab.admin@linhs.edu.ph', password: 'equipment123', name: 'Laboratory Admin', role: 'equipment_admin' as const, category: 'laboratory' },
  { id: '10', email: 'sports.admin@linhs.edu.ph', password: 'equipment123', name: 'Sports Admin', role: 'equipment_admin' as const, category: 'sports' },
  { id: '11', email: 'library.admin@linhs.edu.ph', password: 'equipment123', name: 'Library Admin', role: 'equipment_admin' as const, category: 'library' },
  { id: '12', email: 'ict.admin@linhs.edu.ph', password: 'equipment123', name: 'ICT Admin', role: 'equipment_admin' as const, category: 'ict' },
  { id: '13', email: 'music.admin@linhs.edu.ph', password: 'equipment123', name: 'Music Admin', role: 'equipment_admin' as const, category: 'music' },
  
  // Facilities Admin
  { id: '14', email: 'facilities@linhs.edu.ph', password: 'facilities123', name: 'Lisa Facilities', role: 'facilities_admin' as const },
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [isTeacher, setIsTeacher] = useState(false);

  const updateUserRoles = (user: User) => {
    if (user.role === 'super_admin') {
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
    
    if (storedUser && storedToken) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      setAccessToken(storedToken);
      updateUserRoles(parsedUser);
    }
    
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Find user in mock database
    const foundUser = MOCK_USERS.find(
      u => u.email === email && u.password === password
    );

    if (!foundUser) {
      throw new Error('Invalid email or password');
    }

    // Create user object without password
    const { password: _, ...userWithoutPassword } = foundUser;
    const token = `mock_token_${foundUser.id}_${Date.now()}`;

    // Store session
    localStorage.setItem('auth_user', JSON.stringify(userWithoutPassword));
    localStorage.setItem('auth_token', token);

    setUser(userWithoutPassword);
    setAccessToken(token);
    updateUserRoles(userWithoutPassword);
  };

  const signup = async (email: string, password: string, name: string) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Check if user already exists
    const existingUser = MOCK_USERS.find(u => u.email === email);
    if (existingUser) {
      throw new Error('User already exists');
    }

    // For demo purposes, we'll throw an error since we can't add to the mock array
    throw new Error('Signup is not available in demo mode. Please use existing accounts.');
  };

  const logout = async () => {
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