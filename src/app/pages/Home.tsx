import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../utils/api';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { 
  GraduationCap, 
  Users, 
  BookOpen, 
  TrendingUp, 
  ArrowRight,
  Calendar,
  Award,
  Target,
  CheckCircle2,
  FileText,
  Megaphone
} from 'lucide-react';
import logo from '../../assets/lumbang.png';

interface SchoolInfo {
  name: string;
  motto: string;
  vision: string;
  mission: string;
  address: string;
  email: string;
  phone: string;
}

interface Stats {
  totalStudents: number;
  totalClasses: number;
  strandCounts: {
    ict: number;
    stem: number;
    humss: number;
  };
}

interface Announcement {
  id: string;
  title: string;
  content: string;
  date: string;
  priority: string;
}

export default function Home() {
  const [schoolInfo, setSchoolInfo] = useState<SchoolInfo | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [info, statsData, announcementsData] = await Promise.all([
          api.getSchoolInfo(),
          api.getStats(),
          api.getAnnouncements(),
        ]);
        setSchoolInfo(info);
        setStats(statsData);
        setAnnouncements(announcementsData.slice(0, 3));
      } catch (error) {
        // Fallback to hardcoded data if mock data also fails
        setSchoolInfo({
          name: 'Lumbang Integrated National High School',
          motto: 'Excellence in Education',
          vision: 'A center of excellence providing quality education for all students.',
          mission: 'To develop well-rounded individuals equipped with knowledge, skills, and values.',
          address: 'Lumbang, Philippines',
          email: 'linhs@example.com',
          phone: '+63 123 456 7890',
        });
        setStats({
          totalStudents: 0,
          totalClasses: 0,
          strandCounts: { ict: 0, stem: 0, humss: 0 }
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#d4af37]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0">
          <div className="absolute w-96 h-96 bg-[#1a472a] rounded-full blur-3xl opacity-20 top-0 left-1/4 animate-pulse"></div>
          <div className="absolute w-96 h-96 bg-[#d4af37] rounded-full blur-3xl opacity-10 bottom-0 right-1/4 animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-5xl mx-auto text-center">
            {/* Logo */}
            <div className="flex justify-center mb-8">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[#1a472a] to-[#2d5f3f] p-2 ring-4 ring-[#d4af37]/30 shadow-2xl shadow-[#1a472a]/50">
                <img src={logo} alt="LINHS Logo" className="w-full h-full object-contain" />
              </div>
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 leading-tight">
              {schoolInfo?.name}
            </h1>
            
            {/* Motto */}
            <p className="text-xl md:text-2xl text-[#d4af37] font-semibold mb-6">
              {schoolInfo?.motto}
            </p>

            {/* Est. Year */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full mb-8">
              <Calendar className="h-4 w-4 text-[#d4af37]" />
              <span className="text-gray-300 text-sm font-medium">Established 1968</span>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/announcements">
                <Button className="bg-gradient-to-r from-[#1a472a] to-[#2d5f3f] hover:from-[#2d5f3f] hover:to-[#1a472a] text-white gap-2 h-12 px-8 shadow-lg shadow-[#1a472a]/50">
                  <Megaphone className="h-5 w-5" />
                  View Announcements
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/school-info">
                <Button variant="outline" className="h-12 px-8 bg-white/5 border-white/20 text-white hover:bg-white/10 hover:border-[#d4af37]">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            <Card className="glass-card p-6 text-center">
              <GraduationCap className="h-8 w-8 text-[#d4af37] mx-auto mb-3" />
              <div className="text-3xl font-bold text-white mb-1">Excellence</div>
              <div className="text-sm text-gray-400">In Education</div>
            </Card>
            <Card className="glass-card p-6 text-center">
              <Award className="h-8 w-8 text-[#d4af37] mx-auto mb-3" />
              <div className="text-3xl font-bold text-white mb-1">100%</div>
              <div className="text-sm text-gray-400">Commitment</div>
            </Card>
          </div>
        </div>
      </section>

      {/* Student Services Section */}
      <section className="py-16 bg-gradient-to-b from-transparent to-[#0a0e0d]/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">Student Services</h2>
            <p className="text-gray-400">Quick access to student resources and services</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <Link to="/clearance">
              <Card className="glass-card p-8 group hover:border-[#d4af37]/50 transition-all cursor-pointer h-full">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                    <CheckCircle2 className="h-7 w-7 text-green-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-[#d4af37] transition-colors">
                      Check Clearance
                    </h3>
                    <p className="text-gray-400 text-sm mb-4">
                      Enter your LRN number to check your clearance status and view any pending liabilities
                    </p>
                    <div className="text-[#d4af37] text-sm font-medium flex items-center gap-2">
                      Check Now <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </Card>
            </Link>

            <Link to="/document-request">
              <Card className="glass-card p-8 group hover:border-[#d4af37]/50 transition-all cursor-pointer h-full">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                    <FileText className="h-7 w-7 text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-[#d4af37] transition-colors">
                      Request Documents
                    </h3>
                    <p className="text-gray-400 text-sm mb-4">
                      Submit requests for Form 137, certificates, transcripts, and other official documents
                    </p>
                    <div className="text-[#d4af37] text-sm font-medium flex items-center gap-2">
                      Request Now <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          </div>
        </div>
      </section>

      {/* Vision & Mission */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* Vision */}
            <Card className="glass-card p-8 group hover:border-[#d4af37]/50 transition-all">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-[#1a472a] to-[#2d5f3f] rounded-lg flex items-center justify-center">
                  <Target className="h-6 w-6 text-[#d4af37]" />
                </div>
                <h3 className="text-2xl font-bold text-white">Our Vision</h3>
              </div>
              <p className="text-gray-300 leading-relaxed text-justify whitespace-pre-line">
                {schoolInfo?.vision}
              </p>
            </Card>

            {/* Mission */}
            <Card className="glass-card p-8 group hover:border-[#d4af37]/50 transition-all">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-[#1a472a] to-[#2d5f3f] rounded-lg flex items-center justify-center">
                  <Award className="h-6 w-6 text-[#d4af37]" />
                </div>
                <h3 className="text-2xl font-bold text-white">Our Mission</h3>
              </div>
              <p className="text-gray-300 leading-relaxed text-justify whitespace-pre-line">
                {schoolInfo?.mission}
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Recent Announcements */}
      {announcements.length > 0 && (
        <section className="py-16 bg-gradient-to-b from-transparent to-[#0a0e0d]">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8 max-w-6xl mx-auto">
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">Latest Announcements</h2>
                <p className="text-gray-400">Stay updated with school news</p>
              </div>
              <Link to="/announcements">
                <Button variant="outline" className="bg-white/5 border-white/20 text-white hover:bg-white/10 hover:border-[#d4af37]">
                  View All
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {announcements.map((announcement) => (
                <Card key={announcement.id} className="glass-card p-6 hover:border-[#d4af37]/50 transition-all">
                  <div className="flex items-center gap-2 mb-3">
                    <Calendar className="h-4 w-4 text-[#d4af37]" />
                    <span className="text-sm text-gray-400">
                      {new Date(announcement.date).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2">
                    {announcement.title}
                  </h3>
                  <p className="text-gray-400 text-sm line-clamp-3">
                    {announcement.content}
                  </p>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}