import { useState } from 'react';
import { Link, useLocation } from "react-router-dom";
import { Menu, X, LogIn } from 'lucide-react';
import { Button } from './ui/button';
import logo from '../../assets/lumbang.png';

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/school-info', label: 'About' },
    { path: '/announcements', label: 'Announcements' },
    { path: '/resources', label: 'Resources' },
    { path: '/gallery', label: 'Gallery' },
  ];

  const studentLinks = [
    { path: '/clearance', label: 'Check Clearance' },
    { path: '/document-request', label: 'Request Document' },
  ];

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <nav className="sticky top-0 z-50 bg-[#0a0e0d] border-b border-[#1a472a]/50 backdrop-blur-xl shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo and School Name */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#1a472a] to-[#2d5f3f] p-1 ring-2 ring-[#d4af37]/30 group-hover:ring-[#d4af37] transition-all">
              <img src={logo} alt="LINHS Logo" className="w-full h-full object-contain" />
            </div>
            <div className="hidden md:block">
              <div className="text-white font-bold text-lg leading-tight">LINHS</div>
              <div className="text-[#d4af37] text-xs">Lumbang Integrated NHS</div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive(link.path)
                    ? 'bg-[#1a472a] text-white'
                    : 'text-gray-300 hover:text-white hover:bg-white/5'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Teacher Login Button */}
          <div className="hidden lg:flex items-center gap-4">
            <Link to="/teacher/login">
              <Button className="bg-gradient-to-r from-[#1a472a] to-[#2d5f3f] hover:from-[#2d5f3f] hover:to-[#1a472a] text-white gap-2 shadow-lg shadow-[#1a472a]/50">
                <LogIn className="h-4 w-4" />
                Teacher Portal
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden p-2 rounded-lg text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="lg:hidden py-4 border-t border-white/10">
            <div className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={`px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                    isActive(link.path)
                      ? 'bg-[#1a472a] text-white'
                      : 'text-gray-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                to="/teacher/login"
                onClick={() => setIsOpen(false)}
                className="mt-2"
              >
                <Button className="w-full bg-gradient-to-r from-[#1a472a] to-[#2d5f3f] hover:from-[#2d5f3f] hover:to-[#1a472a] text-white gap-2">
                  <LogIn className="h-4 w-4" />
                  Teacher Portal
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}