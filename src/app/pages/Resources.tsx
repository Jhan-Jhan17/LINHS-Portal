import { useEffect, useState } from 'react';
import { api } from '../utils/api';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { FileText, Download, FolderOpen, BookOpen, Calendar, FileCheck, File } from 'lucide-react';

export default function Resources() {
  const [resources, setResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await api.getResources();
        setResources(data);
      } catch (error) {
        // Fallback - will use empty array if mock data also fails
        setResources([]);
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

  const getCategoryIcon = (category: string) => {
    const cat = category?.toLowerCase();
    if (cat?.includes('handbook') || cat?.includes('guide')) return BookOpen;
    if (cat?.includes('calendar') || cat?.includes('schedule')) return Calendar;
    if (cat?.includes('form')) return FileCheck;
    return File;
  };

  return (
    <div className="min-h-screen py-16">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Downloadable Resources</h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Access important documents, forms, and materials for students and parents.
          </p>
        </div>

        {resources.length === 0 ? (
          <Card className="glass-card max-w-2xl mx-auto">
            <CardContent className="pt-6 text-center py-12">
              <FolderOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-300 text-lg">No resources available yet.</p>
              <p className="text-sm text-gray-500 mt-2">Resources will be uploaded by teachers soon.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-6">
            {resources.map((resource) => {
              const Icon = getCategoryIcon(resource.category);
              return (
                <Card key={resource.id} className="glass-card hover:border-[#d4af37]/50 transition-all">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-[#1a472a] to-[#2d5f3f] rounded-lg flex items-center justify-center flex-shrink-0">
                        <Icon className="h-6 w-6 text-[#d4af37]" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-white mb-2">{resource.name}</h3>
                        {resource.description && (
                          <p className="text-sm text-gray-400 mb-3">{resource.description}</p>
                        )}
                        {resource.category && (
                          <p className="text-xs text-gray-500 mb-3 bg-white/5 inline-block px-2 py-1 rounded">
                            {resource.category}
                          </p>
                        )}
                        {resource.url ? (
                          <a href={resource.url} target="_blank" rel="noopener noreferrer">
                            <Button size="sm" className="gap-2 bg-gradient-to-r from-[#1a472a] to-[#2d5f3f] hover:shadow-lg hover:shadow-[#1a472a]/50">
                              <Download className="h-4 w-4" />
                              Download
                            </Button>
                          </a>
                        ) : (
                          <Button size="sm" variant="outline" disabled className="gap-2 opacity-50">
                            <Download className="h-4 w-4" />
                            Not Available
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Default Resources Info */}
        <div className="max-w-4xl mx-auto mt-12">
          <Card className="glass-card border-[#d4af37]/30">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <FileText className="h-5 w-5 text-[#d4af37]" />
                Common Resources
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-gray-300">
                <li className="flex items-start gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition">
                  <BookOpen className="h-5 w-5 text-[#d4af37] mt-0.5 flex-shrink-0" />
                  <div>
                    <strong className="text-white">Student Handbook:</strong>
                    <p className="text-sm text-gray-400 mt-1">Contains school policies, rules, and regulations</p>
                  </div>
                </li>
                <li className="flex items-start gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition">
                  <Calendar className="h-5 w-5 text-[#d4af37] mt-0.5 flex-shrink-0" />
                  <div>
                    <strong className="text-white">Academic Calendar:</strong>
                    <p className="text-sm text-gray-400 mt-1">Important dates for the school year</p>
                  </div>
                </li>
                <li className="flex items-start gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition">
                  <FileCheck className="h-5 w-5 text-[#d4af37] mt-0.5 flex-shrink-0" />
                  <div>
                    <strong className="text-white">Enrollment Guidelines:</strong>
                    <p className="text-sm text-gray-400 mt-1">Information for new and returning students</p>
                  </div>
                </li>
                <li className="flex items-start gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition">
                  <File className="h-5 w-5 text-[#d4af37] mt-0.5 flex-shrink-0" />
                  <div>
                    <strong className="text-white">School Forms:</strong>
                    <p className="text-sm text-gray-400 mt-1">Various forms for student use</p>
                  </div>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}