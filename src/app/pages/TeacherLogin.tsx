import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { toast } from 'sonner';
import { Lock, Mail, LogIn, Info } from 'lucide-react';
import logo from '../../assets/lumbang.png';

export default function TeacherLogin() {
  const navigate = useNavigate();
  const { login, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // If already logged in, redirect to dashboard
  useEffect(() => {
    if (user) {
      navigate('/teacher/dashboard');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await login(email, password);
      toast.success('Login successful!');
      navigate('/teacher/dashboard');
    } catch (error: any) {
      toast.error(error.message || 'Failed to login. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoCredentials = (role: 'teacher' | 'admin' | 'adviser1' | 'adviser2' | 'adviser3' | 'guidance' | 'nurse' | 'registrar' | 'lab' | 'sports' | 'library' | 'ict' | 'music' | 'facilities') => {
    const credentials = {
      teacher: { email: 'teacher@linhs.edu.ph', password: 'teacher123' },
      admin: { email: 'admin@linhs.edu.ph', password: 'admin123' },
      adviser1: { email: 'adviser1@linhs.edu.ph', password: 'adviser123' },
      adviser2: { email: 'adviser2@linhs.edu.ph', password: 'adviser123' },
      adviser3: { email: 'adviser3@linhs.edu.ph', password: 'adviser123' },
      guidance: { email: 'guidance@linhs.edu.ph', password: 'guidance123' },
      nurse: { email: 'nurse@linhs.edu.ph', password: 'nurse123' },
      registrar: { email: 'registrar@linhs.edu.ph', password: 'registrar123' },
      lab: { email: 'lab.admin@linhs.edu.ph', password: 'equipment123' },
      sports: { email: 'sports.admin@linhs.edu.ph', password: 'equipment123' },
      library: { email: 'library.admin@linhs.edu.ph', password: 'equipment123' },
      ict: { email: 'ict.admin@linhs.edu.ph', password: 'equipment123' },
      music: { email: 'music.admin@linhs.edu.ph', password: 'equipment123' },
      facilities: { email: 'facilities@linhs.edu.ph', password: 'facilities123' },
    };
    setEmail(credentials[role].email);
    setPassword(credentials[role].password);
  };

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md relative z-10">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <img src={logo} alt="LINHS Logo" className="w-24 h-24 object-contain" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Teacher Portal</h1>
          <p className="text-gray-400">Lumbang Integrated National High School</p>
        </div>

        {/* Login Card */}
        <Card className="glass-card border-2 border-[#1a472a]/30 backdrop-blur-xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-white">Login</CardTitle>
            <CardDescription className="text-gray-400">
              Enter your credentials to access the admin dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email" className="text-gray-300">Email</Label>
                <div className="relative mt-1.5">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="teacher@linhs.edu.ph"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-[#d4af37] focus:ring-[#d4af37]"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="password" className="text-gray-300">Password</Label>
                <div className="relative mt-1.5">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-[#d4af37] focus:ring-[#d4af37]"
                    required
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-[#1a472a] to-[#2d5f3f] hover:from-[#2d5f3f] hover:to-[#1a472a] text-white gap-2 h-11 shadow-lg shadow-[#1a472a]/50"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Logging in...
                  </>
                ) : (
                  <>
                    <LogIn className="h-4 w-4" />
                    Login to Dashboard
                  </>
                )}
              </Button>
            </form>

            {/* Demo Credentials */}
            <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg max-h-96 overflow-y-auto">
              <div className="flex items-start gap-2 mb-3">
                <Info className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-200">
                  <strong className="block mb-1">Demo Credentials - Click to Auto-fill:</strong>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => fillDemoCredentials('admin')}
                  className="text-left p-2 rounded bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 transition-colors"
                >
                  <div className="text-xs text-purple-400 font-semibold">Super Admin</div>
                  <div className="text-xs text-white font-mono truncate">admin@linhs.edu.ph</div>
                </button>
                
                <button
                  type="button"
                  onClick={() => fillDemoCredentials('teacher')}
                  className="text-left p-2 rounded bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 transition-colors"
                >
                  <div className="text-xs text-blue-400 font-semibold">Teacher</div>
                  <div className="text-xs text-white font-mono truncate">teacher@linhs.edu.ph</div>
                </button>
                
                <button
                  type="button"
                  onClick={() => fillDemoCredentials('adviser1')}
                  className="text-left p-2 rounded bg-green-500/10 hover:bg-green-500/20 border border-green-500/30 transition-colors"
                >
                  <div className="text-xs text-green-400 font-semibold">Adviser (ICT 11-A)</div>
                  <div className="text-xs text-white font-mono truncate">adviser1@linhs.edu.ph</div>
                </button>
                
                <button
                  type="button"
                  onClick={() => fillDemoCredentials('adviser2')}
                  className="text-left p-2 rounded bg-green-500/10 hover:bg-green-500/20 border border-green-500/30 transition-colors"
                >
                  <div className="text-xs text-green-400 font-semibold">Adviser (STEM 11-A)</div>
                  <div className="text-xs text-white font-mono truncate">adviser2@linhs.edu.ph</div>
                </button>
                
                <button
                  type="button"
                  onClick={() => fillDemoCredentials('adviser3')}
                  className="text-left p-2 rounded bg-green-500/10 hover:bg-green-500/20 border border-green-500/30 transition-colors"
                >
                  <div className="text-xs text-green-400 font-semibold">Adviser (HUMSS 11-A)</div>
                  <div className="text-xs text-white font-mono truncate">adviser3@linhs.edu.ph</div>
                </button>
                
                <button
                  type="button"
                  onClick={() => fillDemoCredentials('guidance')}
                  className="text-left p-2 rounded bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/30 transition-colors"
                >
                  <div className="text-xs text-yellow-400 font-semibold">Guidance Counselor</div>
                  <div className="text-xs text-white font-mono truncate">guidance@linhs.edu.ph</div>
                </button>
                
                <button
                  type="button"
                  onClick={() => fillDemoCredentials('nurse')}
                  className="text-left p-2 rounded bg-pink-500/10 hover:bg-pink-500/20 border border-pink-500/30 transition-colors"
                >
                  <div className="text-xs text-pink-400 font-semibold">School Nurse</div>
                  <div className="text-xs text-white font-mono truncate">nurse@linhs.edu.ph</div>
                </button>
                
                <button
                  type="button"
                  onClick={() => fillDemoCredentials('registrar')}
                  className="text-left p-2 rounded bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/30 transition-colors"
                >
                  <div className="text-xs text-orange-400 font-semibold">Registrar</div>
                  <div className="text-xs text-white font-mono truncate">registrar@linhs.edu.ph</div>
                </button>
                
                <button
                  type="button"
                  onClick={() => fillDemoCredentials('lab')}
                  className="text-left p-2 rounded bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 transition-colors"
                >
                  <div className="text-xs text-cyan-400 font-semibold">Lab Admin</div>
                  <div className="text-xs text-white font-mono truncate">lab.admin@linhs.edu.ph</div>
                </button>
                
                <button
                  type="button"
                  onClick={() => fillDemoCredentials('sports')}
                  className="text-left p-2 rounded bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 transition-colors"
                >
                  <div className="text-xs text-cyan-400 font-semibold">Sports Admin</div>
                  <div className="text-xs text-white font-mono truncate">sports.admin@linhs.edu.ph</div>
                </button>
                
                <button
                  type="button"
                  onClick={() => fillDemoCredentials('library')}
                  className="text-left p-2 rounded bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 transition-colors"
                >
                  <div className="text-xs text-cyan-400 font-semibold">Library Admin</div>
                  <div className="text-xs text-white font-mono truncate">library.admin@linhs.edu.ph</div>
                </button>
                
                <button
                  type="button"
                  onClick={() => fillDemoCredentials('ict')}
                  className="text-left p-2 rounded bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 transition-colors"
                >
                  <div className="text-xs text-cyan-400 font-semibold">ICT Admin</div>
                  <div className="text-xs text-white font-mono truncate">ict.admin@linhs.edu.ph</div>
                </button>
                
                <button
                  type="button"
                  onClick={() => fillDemoCredentials('music')}
                  className="text-left p-2 rounded bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 transition-colors"
                >
                  <div className="text-xs text-cyan-400 font-semibold">Music Admin</div>
                  <div className="text-xs text-white font-mono truncate">music.admin@linhs.edu.ph</div>
                </button>
                
                <button
                  type="button"
                  onClick={() => fillDemoCredentials('facilities')}
                  className="text-left p-2 rounded bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 transition-colors"
                >
                  <div className="text-xs text-red-400 font-semibold">Facilities Admin</div>
                  <div className="text-xs text-white font-mono truncate">facilities@linhs.edu.ph</div>
                </button>
              </div>
              
              <p className="text-xs text-gray-500 mt-3">
                All accounts are ready to test. Each role has different access permissions.
              </p>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-gray-500 mt-6">
          This portal is for authorized teachers and administrators only.
        </p>
      </div>
    </div>
  );
}