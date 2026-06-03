import { useEffect, useState } from 'react';
import { api } from '../utils/api';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Megaphone, Calendar, AlertCircle, Bell, Info } from 'lucide-react';

export default function Announcements() {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await api.getAnnouncements();
        setAnnouncements(data);
      } catch (error) {
        // Fallback - will use empty array if mock data also fails
        setAnnouncements([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getTypeColor = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'urgent':
      case 'emergency':
        return 'from-red-500 to-red-600';
      case 'important':
        return 'from-orange-500 to-orange-600';
      case 'event':
        return 'from-blue-500 to-blue-600';
      default:
        return 'from-[#1a472a] to-[#2d5f3f]';
    }
  };

  const getBadgeColor = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'urgent':
      case 'emergency':
        return 'bg-red-500/20 text-red-300 border-red-500/50';
      case 'important':
        return 'bg-orange-500/20 text-orange-300 border-orange-500/50';
      case 'event':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/50';
      default:
        return 'bg-[#1a472a] text-[#d4af37] border-[#d4af37]/30';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'urgent':
      case 'emergency':
        return <AlertCircle className="h-5 w-5" />;
      case 'event':
        return <Calendar className="h-5 w-5" />;
      case 'important':
        return <Bell className="h-5 w-5" />;
      default:
        return <Megaphone className="h-5 w-5" />;
    }
  };

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
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Announcements</h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Stay updated with the latest news, events, and important information from our school.
          </p>
        </div>

        {announcements.length === 0 ? (
          <Card className="glass-card max-w-2xl mx-auto">
            <CardContent className="pt-6 text-center py-12">
              <Megaphone className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-300 text-lg">No announcements available yet.</p>
              <p className="text-sm text-gray-500 mt-2">Check back later for updates.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="max-w-4xl mx-auto space-y-6">
            {announcements.map((announcement) => (
              <Card 
                key={announcement.id} 
                className={`glass-card border-l-4 hover:border-[#d4af37]/50 transition-all ${
                  announcement.type?.toLowerCase() === 'urgent' || announcement.type?.toLowerCase() === 'emergency'
                    ? 'border-l-red-500'
                    : announcement.type?.toLowerCase() === 'important'
                    ? 'border-l-orange-500'
                    : announcement.type?.toLowerCase() === 'event'
                    ? 'border-l-blue-500'
                    : 'border-l-[#d4af37]'
                }`}
              >
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-lg bg-gradient-to-br ${getTypeColor(announcement.type)} text-white flex-shrink-0 shadow-lg`}>
                      {getTypeIcon(announcement.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div>
                          <h3 className="text-xl font-bold text-white mb-2">
                            {announcement.title}
                          </h3>
                          <div className="flex flex-wrap items-center gap-3 text-sm">
                            <div className="flex items-center gap-1 text-gray-400">
                              <Calendar className="h-4 w-4" />
                              {new Date(announcement.date).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </div>
                            {announcement.type && (
                              <Badge className={getBadgeColor(announcement.type)}>
                                {announcement.type}
                              </Badge>
                            )}
                            {announcement.category && (
                              <Badge variant="outline" className="border-white/20 text-gray-400">
                                {announcement.category}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                        {announcement.content}
                      </p>
                      {announcement.author && (
                        <p className="text-sm text-gray-500 mt-3 flex items-center gap-2">
                          <Info className="h-3 w-3" />
                          Posted by: {announcement.author}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}