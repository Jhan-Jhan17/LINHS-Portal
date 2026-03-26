import { useEffect, useState } from 'react';
import { api } from '../utils/api';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Image, Calendar, Tag } from 'lucide-react';

export default function Gallery() {
  const [gallery, setGallery] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await api.getGallery();
        setGallery(data);
      } catch (error) {
        // Fallback - will use empty array if mock data also fails
        setGallery([]);
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
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Photo Gallery</h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Explore memorable moments from school events, activities, and achievements.
          </p>
        </div>

        {gallery.length === 0 ? (
          <Card className="glass-card max-w-2xl mx-auto">
            <CardContent className="pt-6 text-center py-12">
              <Image className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-300 text-lg">No photos available yet.</p>
              <p className="text-sm text-gray-500 mt-2">Photos from school events will be posted here.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {gallery.map((item) => (
                <Card 
                  key={item.id} 
                  className="glass-card hover:border-[#d4af37]/50 transition-all overflow-hidden group cursor-pointer"
                  onClick={() => setSelectedImage(item)}
                >
                  <div className="relative aspect-video bg-gradient-to-br from-white/5 to-white/10 overflow-hidden">
                    {item.imageUrl ? (
                      <img 
                        src={item.imageUrl} 
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iIzFhMWExYSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM2NjY2NjYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5JbWFnZSBOb3QgQXZhaWxhYmxlPC90ZXh0Pjwvc3ZnPg==';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Image className="h-16 w-16 text-gray-500" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </div>
                  <CardContent className="pt-4">
                    <h3 className="font-bold text-white mb-2">{item.title}</h3>
                    {item.description && (
                      <p className="text-sm text-gray-400 mb-3 line-clamp-2">{item.description}</p>
                    )}
                    <div className="flex items-center justify-between">
                      {item.date && (
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Calendar className="h-3 w-3" />
                          {new Date(item.date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </div>
                      )}
                      {item.category && (
                        <Badge className="bg-[#1a472a] text-[#d4af37] border border-[#d4af37]/30 text-xs">
                          {item.category}
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Image Modal */}
        {selectedImage && (
          <div 
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedImage(null)}
          >
            <div className="max-w-5xl w-full" onClick={(e) => e.stopPropagation()}>
              <Card className="glass-card border-[#d4af37]/30">
                <CardContent className="p-6">
                  <div className="mb-4">
                    <img 
                      src={selectedImage.imageUrl} 
                      alt={selectedImage.title}
                      className="w-full h-auto max-h-[70vh] object-contain rounded-lg"
                    />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">{selectedImage.title}</h3>
                  {selectedImage.description && (
                    <p className="text-gray-300 mb-4">{selectedImage.description}</p>
                  )}
                  <div className="flex items-center gap-4 text-sm">
                    {selectedImage.date && (
                      <div className="flex items-center gap-2 text-gray-400">
                        <Calendar className="h-4 w-4" />
                        {new Date(selectedImage.date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </div>
                    )}
                    {selectedImage.category && (
                      <Badge className="bg-[#1a472a] text-[#d4af37] border border-[#d4af37]/30">
                        <Tag className="h-3 w-3 mr-1" />
                        {selectedImage.category}
                      </Badge>
                    )}
                  </div>
                  <button
                    onClick={() => setSelectedImage(null)}
                    className="mt-6 px-4 py-2 bg-gradient-to-r from-[#1a472a] to-[#2d5f3f] text-white rounded-lg hover:shadow-lg hover:shadow-[#1a472a]/50 transition"
                  >
                    Close
                  </button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}