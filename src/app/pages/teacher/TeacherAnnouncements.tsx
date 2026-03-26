import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { api, adminApi } from '../../utils/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Badge } from '../../components/ui/badge';
import { toast } from 'sonner';
import { Megaphone, Plus, Edit, Trash2, Calendar } from 'lucide-react';

export default function TeacherAnnouncements() {
  const { user, accessToken } = useAuth();
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [announcementForm, setAnnouncementForm] = useState({
    title: '',
    content: '',
    type: 'general',
    category: '',
    date: new Date().toISOString().split('T')[0],
  });
  const [editingAnnouncement, setEditingAnnouncement] = useState<any>(null);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const data = await api.getAnnouncements();
      setAnnouncements(data);
    } catch (error) {
      toast.error('Failed to load announcements');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAnnouncement = async () => {
    if (!accessToken) return;
    try {
      if (editingAnnouncement) {
        await adminApi.updateAnnouncement(editingAnnouncement.id, announcementForm, accessToken);
        toast.success('Announcement updated successfully');
        setEditingAnnouncement(null);
      } else {
        await adminApi.createAnnouncement(announcementForm, accessToken);
        toast.success('Announcement posted successfully');
      }
      setDialogOpen(false);
      setAnnouncementForm({
        title: '',
        content: '',
        type: 'general',
        category: '',
        date: new Date().toISOString().split('T')[0],
      });
      fetchAnnouncements();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save announcement');
    }
  };

  const handleEditAnnouncement = (announcement: any) => {
    setEditingAnnouncement(announcement);
    setAnnouncementForm({
      title: announcement.title,
      content: announcement.content,
      type: announcement.type,
      category: announcement.category || '',
      date: announcement.date,
    });
    setDialogOpen(true);
  };

  const handleDeleteAnnouncement = async (id: string) => {
    if (!accessToken || !confirm('Are you sure you want to delete this announcement?')) return;
    try {
      await adminApi.deleteAnnouncement(id, accessToken);
      toast.success('Announcement deleted successfully');
      fetchAnnouncements();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete announcement');
    }
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      general: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      urgent: 'bg-red-500/20 text-red-400 border-red-500/30',
      event: 'bg-green-500/20 text-green-400 border-green-500/30',
      academic: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    };
    return colors[type] || colors.general;
  };

  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#d4af37]"></div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Announcements</h1>
            <p className="text-gray-400">Manage school announcements and updates</p>
          </div>
          {isAdmin && (
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  onClick={() => {
                    setEditingAnnouncement(null);
                    setAnnouncementForm({
                      title: '',
                      content: '',
                      type: 'general',
                      category: '',
                      date: new Date().toISOString().split('T')[0],
                    });
                  }}
                  className="bg-gradient-to-r from-[#1a472a] to-[#2d5f3f] hover:from-[#2d5f3f] hover:to-[#1a472a] text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Announcement
                </Button>
              </DialogTrigger>
              <DialogContent className="glass-card border-[#1a472a]/30 text-white max-w-2xl">
                <DialogHeader>
                  <DialogTitle>{editingAnnouncement ? 'Edit Announcement' : 'New Announcement'}</DialogTitle>
                  <DialogDescription className="text-gray-400">
                    {editingAnnouncement ? 'Update announcement details' : 'Create a new announcement'}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title" className="text-gray-300">Title</Label>
                    <Input
                      id="title"
                      value={announcementForm.title}
                      onChange={(e) => setAnnouncementForm({ ...announcementForm, title: e.target.value })}
                      className="bg-white/5 border-white/10 text-white"
                      placeholder="Enter announcement title"
                    />
                  </div>
                  <div>
                    <Label htmlFor="content" className="text-gray-300">Content</Label>
                    <Textarea
                      id="content"
                      value={announcementForm.content}
                      onChange={(e) => setAnnouncementForm({ ...announcementForm, content: e.target.value })}
                      className="bg-white/5 border-white/10 text-white"
                      placeholder="Enter announcement details"
                      rows={5}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="type" className="text-gray-300">Type</Label>
                      <Select
                        value={announcementForm.type}
                        onValueChange={(value) => setAnnouncementForm({ ...announcementForm, type: value })}
                      >
                        <SelectTrigger className="bg-white/5 border-white/10 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="glass-card border-[#1a472a]/30">
                          <SelectItem value="general">General</SelectItem>
                          <SelectItem value="urgent">Urgent</SelectItem>
                          <SelectItem value="event">Event</SelectItem>
                          <SelectItem value="academic">Academic</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="date" className="text-gray-300">Date</Label>
                      <Input
                        id="date"
                        type="date"
                        value={announcementForm.date}
                        onChange={(e) => setAnnouncementForm({ ...announcementForm, date: e.target.value })}
                        className="bg-white/5 border-white/10 text-white"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="category" className="text-gray-300">Category (Optional)</Label>
                    <Input
                      id="category"
                      value={announcementForm.category}
                      onChange={(e) => setAnnouncementForm({ ...announcementForm, category: e.target.value })}
                      className="bg-white/5 border-white/10 text-white"
                      placeholder="e.g., Sports, Events, Academics"
                    />
                  </div>
                  <Button
                    onClick={handleCreateAnnouncement}
                    className="w-full bg-gradient-to-r from-[#1a472a] to-[#2d5f3f]"
                  >
                    {editingAnnouncement ? 'Update Announcement' : 'Post Announcement'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card className="glass-card border-[#1a472a]/30">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-[#1a472a] to-[#2d5f3f] rounded-lg flex items-center justify-center">
                <Megaphone className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{announcements.length}</p>
                <p className="text-sm text-gray-400">Total Announcements</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Announcements List */}
      <div className="space-y-4">
        {announcements.length === 0 ? (
          <Card className="glass-card border-[#1a472a]/30">
            <CardContent className="py-12 text-center">
              <Megaphone className="h-12 w-12 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400">No announcements found</p>
            </CardContent>
          </Card>
        ) : (
          announcements.map((announcement) => (
            <Card key={announcement.id} className="glass-card border-[#1a472a]/30 hover:border-[#1a472a]/50 transition-colors">
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={getTypeColor(announcement.type)}>
                        {announcement.type}
                      </Badge>
                      {announcement.category && (
                        <Badge variant="outline" className="border-[#1a472a] text-[#d4af37]">
                          {announcement.category}
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-white text-xl mb-2">{announcement.title}</CardTitle>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(announcement.date).toLocaleDateString()}</span>
                    </div>
                  </div>
                  {isAdmin && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEditAnnouncement(announcement)}
                        className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteAnnouncement(announcement.id)}
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 whitespace-pre-line">{announcement.content}</p>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
