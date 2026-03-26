import { useEffect, useState } from 'react';
import { api } from '../utils/api';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { 
  Mail, 
  MapPin,
  Phone, 
  Heart,
  Eye, 
  Target,
} from 'lucide-react';
import logo from '../../assets/lumbang.png';

export default function SchoolInfo() {
  const [schoolInfo, setSchoolInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const info = await api.getSchoolInfo();
        setSchoolInfo(info);
      } catch (error) {
        setSchoolInfo({
          name: 'Lumbang Integrated National High School',
          motto: 'Excellence in Education',
          vision: 'We dream of Filipinos who passionately love their country...',
          mission: 'To protect and promote the right of every Filipino...',
          coreValues: ['Maka-Diyos', 'Maka-tao', 'Makakalikasan', 'Makabansa'],
          address: 'Lumbang, Lipa City, Batangas',
          email: '301495@deped.gov.ph',
          phone: '(043) 784 3462',
          facebook: 'https://www.facebook.com/DepedTayoLINHS301495'
        });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#d4af37]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-16">
      <div className="container mx-auto px-4">
        {/* Header Section */}
        <div className="text-center mb-16">
          <div className="flex justify-center mb-8">
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[#1a472a] to-[#2d5f3f] p-2 ring-4 ring-[#d4af37]/30 shadow-2xl">
              <img src={logo} alt="LINHS Logo" className="w-full h-full object-contain" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">{schoolInfo?.name}</h1>
          <p className="text-xl md:text-2xl text-[#d4af37] font-semibold mb-4">{schoolInfo?.motto}</p>
        </div>

        {/* Vision/Mission Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-16 max-w-6xl mx-auto">
          <Card className="glass-card group hover:border-[#d4af37]/50 transition-all">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-gradient-to-br from-[#1a472a] to-[#2d5f3f] rounded-lg flex items-center justify-center">
                  <Eye className="h-5 w-5 text-[#d4af37]" />
                </div>
                <CardTitle className="text-white">Vision</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 whitespace-pre-line text-justify">{schoolInfo?.vision}</p>
            </CardContent>
          </Card>

          <Card className="glass-card group hover:border-[#d4af37]/50 transition-all">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-gradient-to-br from-[#1a472a] to-[#2d5f3f] rounded-lg flex items-center justify-center">
                  <Target className="h-5 w-5 text-[#d4af37]" />
                </div>
                <CardTitle className="text-white">Mission</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 whitespace-pre-line text-justify">{schoolInfo?.mission}</p>
            </CardContent>
          </Card>

          <Card className="glass-card group hover:border-[#d4af37]/50 transition-all">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-gradient-to-br from-[#1a472a] to-[#2d5f3f] rounded-lg flex items-center justify-center">
                    <Heart className="h-5 w-5 text-[#d4af37]" /> {/* Added Heart Icon */}
                </div>
                <CardTitle className="text-white">Core Values</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="text-gray-300 space-y-2">
                {schoolInfo?.coreValues.map((value: string, index: number) => (
                  <li key={index} className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#d4af37]"></div>
                    {value}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Contact Information Section */}
        <div className="max-w-4xl mx-auto mb-12">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-2xl text-white">Contact Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-8">
                {/* Address */}
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#1a472a] to-[#2d5f3f] rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin className="h-5 w-5 text-[#d4af37]" /> {/* ADDED MAP PIN */}
                  </div>
                  <div>
                    <p className="font-semibold text-white mb-1">Address</p>
                    <p className="text-gray-400">{schoolInfo?.address}</p>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#1a472a] to-[#2d5f3f] rounded-lg flex items-center justify-center flex-shrink-0">
                    <Mail className="h-5 w-5 text-[#d4af37]" /> {/* ADDED MAIL */}
                  </div>
                  <div>
                    <p className="font-semibold text-white mb-1">Email</p>
                    <a href={`mailto:${schoolInfo?.email}`} className="text-[#d4af37] hover:text-[#e8b923] transition-colors">
                      {schoolInfo?.email}
                    </a>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#1a472a] to-[#2d5f3f] rounded-lg flex items-center justify-center flex-shrink-0">
                    <Phone className="h-5 w-5 text-[#d4af37]" /> {/* ADDED PHONE */}
                  </div>
                  <div>
                    <p className="font-semibold text-white mb-1">Phone</p>
                    <a href={`tel:${schoolInfo?.phone}`} className="text-[#d4af37] hover:text-[#e8b923] transition-colors">
                      {schoolInfo?.phone}
                    </a>
                  </div>
                </div>

                {/* Facebook */}
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#1a472a] to-[#2d5f3f] rounded-lg flex items-center justify-center flex-shrink-0">

                  </div>
                  <div>
                    <p className="font-semibold text-white mb-1">Facebook</p>
                    <a href={schoolInfo?.facebook} target="_blank" rel="noopener noreferrer" className="text-[#d4af37] hover:text-[#e8b923] transition-colors">
                      Visit our page
                    </a>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}