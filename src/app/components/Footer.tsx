import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin } from 'lucide-react';
import logo from '../../assets/lumbang.png';

export default function Footer() {
  return (
    <footer className="glass-card border-t border-white/10 mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* School Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#1a472a] to-[#2d5f3f] p-1 ring-2 ring-[#d4af37]/30">
                <img src={logo} alt="LINHS Logo" className="w-full h-full object-contain" />
              </div>
              <div>
                <div className="text-white font-bold text-sm leading-tight">LINHS</div>
                <div className="text-[#d4af37] text-xs">Since 1968</div>
              </div>
            </div>
            <p className="text-gray-400 text-sm">
            Azurite Batch 2025-2026
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-400 hover:text-[#d4af37] text-sm transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/school-info" className="text-gray-400 hover:text-[#d4af37] text-sm transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/announcements" className="text-gray-400 hover:text-[#d4af37] text-sm transition-colors">
                  Announcements
                </Link>
              </li>
            </ul>
          </div>

          {/* Student Services */}
          <div>
            <h3 className="text-white font-semibold mb-4">Student Services</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/clearance" className="text-gray-400 hover:text-[#d4af37] text-sm transition-colors">
                  Clearance Check
                </Link>
              </li>
              <li>
                <Link to="/document-request" className="text-gray-400 hover:text-[#d4af37] text-sm transition-colors">
                  Document Request
                </Link>
              </li>
              <li>
                <Link to="/resources" className="text-gray-400 hover:text-[#d4af37] text-sm transition-colors">
                  Resources
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-white font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-sm">
                
                <span className="text-gray-400">Lumbang, Lipa City, Batangas</span>
              </li>
              <li className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-[#d4af37] flex-shrink-0" />
                <span className="text-gray-400">(043) 784 3462</span>
              </li>
              <li className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-[#d4af37] flex-shrink-0" />
                <a href="mailto:301495@deped.gov.ph" className="text-gray-400 hover:text-[#d4af37] transition-colors">
                  301495@deped.gov.ph
                </a>
              </li>
              <li className="flex items-center gap-2 text-sm">
                <a href="https://www.facebook.com/DepedTayoLINHS301495" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#d4af37] transition-colors">
                  Follow us on Facebook
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-400 text-sm">
            &copy; {new Date().getFullYear()} Lumbang Integrated National High School. All rights reserved.
          </p>
          <Link 
            to="/teacher/login" 
            className="text-[#d4af37] hover:text-[#e8b923] text-sm font-medium transition-colors"
          >
            Teacher Portal Login
          </Link>
        </div>
      </div>
    </footer>
  );
}