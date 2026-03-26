import { useEffect } from 'react';
import { Outlet, useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { 
  LogOut, 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  GraduationCap,
  FileText,
  Calendar,
  Settings,
  Bell,
  ChevronLeft,
  Menu,
  X
} from 'lucide-react';
import { useState } from 'react';
import logo from '../../assets/lumbang.png';

export default function AuthenticatedLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      navigate('/teacher/login');
    }
  }, [user, navigate]);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Close sidebar on mobile by default
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isSuperAdmin = user?.role === 'super_admin';
  const isTeacherOrAdviser = user?.role === 'teacher' || user?.role === 'adviser';

  // Navigation links based on role
  const navLinks = [
    { 
      path: '/teacher/dashboard', 
      label: 'Dashboard', 
      icon: LayoutDashboard,
      roles: ['teacher', 'adviser', 'super_admin', 'guidance', 'nurse', 'registrar', 'equipment_admin', 'facilities_admin']
    },
    { 
      path: '/teacher/students', 
      label: 'Students', 
      icon: Users,
      roles: ['teacher', 'adviser', 'super_admin']
    },
    { 
      path: '/teacher/classes', 
      label: 'Classes', 
      icon: BookOpen,
      roles: ['teacher', 'adviser', 'super_admin']
    },
    { 
      path: '/teacher/grades', 
      label: 'Grades', 
      icon: GraduationCap,
      roles: ['teacher', 'adviser', 'super_admin']
    },
    { 
      path: '/teacher/announcements', 
      label: 'Announcements', 
      icon: Bell,
      roles: ['super_admin']
    },
    { 
      path: '/teacher/settings', 
      label: 'Settings', 
      icon: Settings,
      roles: ['teacher', 'adviser', 'super_admin', 'guidance', 'nurse', 'registrar', 'equipment_admin', 'facilities_admin']
    },
  ];

  // Filter links based on user role
  const visibleLinks = navLinks.filter(link => 
    link.roles.includes(user?.role || '')
  );

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#0a0e0d] flex">
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-[#0f1311] border-b border-[#1a472a]/30 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1a472a] to-[#2d5f3f] p-1 ring-2 ring-[#d4af37]/30">
              <img src={logo} alt="LINHS Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <div className="text-white font-bold text-sm leading-tight">LINHS</div>
              <div className="text-[#d4af37] text-xs">{isSuperAdmin ? 'Admin' : 'Teacher'} Portal</div>
            </div>
          </div>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        ${sidebarOpen ? 'w-64' : 'w-20'} 
        bg-[#0f1311] border-r border-[#1a472a]/30 transition-all duration-300 flex flex-col
        fixed h-full z-40
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        md:static
      `}>
        {/* Logo and Toggle - Desktop Only */}
        <div className="hidden md:flex p-4 border-b border-[#1a472a]/30 items-center justify-between">
          {sidebarOpen && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1a472a] to-[#2d5f3f] p-1 ring-2 ring-[#d4af37]/30">
                <img src={logo} alt="LINHS Logo" className="w-full h-full object-contain" />
              </div>
              <div>
                <div className="text-white font-bold text-sm leading-tight">LINHS</div>
                <div className="text-[#d4af37] text-xs">{isSuperAdmin ? 'Admin' : 'Teacher'} Portal</div>
              </div>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            {sidebarOpen ? <ChevronLeft className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* User Info */}
        <div className={`p-4 border-b border-[#1a472a]/30 ${!sidebarOpen && 'hidden md:block'}`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#d4af37] to-[#b8941f] flex items-center justify-center text-white font-semibold flex-shrink-0">
              {user.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            {(sidebarOpen || mobileMenuOpen) && (
              <div className="flex-1 min-w-0">
                <div className="text-white font-medium text-sm truncate">{user.name}</div>
                <div className="text-gray-400 text-xs truncate">{user.email}</div>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 p-3 overflow-y-auto">
          <div className="space-y-1">
            {visibleLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.path);
              
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                    active
                      ? 'bg-[#1a472a] text-white'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                  title={!sidebarOpen && !mobileMenuOpen ? link.label : undefined}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  {(sidebarOpen || mobileMenuOpen) && <span className="font-medium text-sm">{link.label}</span>}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Logout Button */}
        <div className="p-3 border-t border-[#1a472a]/30">
          <Button
            onClick={handleLogout}
            variant="ghost"
            className={`w-full justify-start text-gray-400 hover:text-white hover:bg-red-500/10 ${
              !sidebarOpen && !mobileMenuOpen && 'justify-center'
            }`}
          >
            <LogOut className="h-5 w-5 flex-shrink-0" />
            {(sidebarOpen || mobileMenuOpen) && <span className="ml-3">Logout</span>}
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`
        flex-1 transition-all duration-300
        pt-20 md:pt-0
        ${sidebarOpen ? 'md:ml-0' : 'md:ml-0'}
      `}>
        <Outlet />
      </main>
    </div>
  );
}