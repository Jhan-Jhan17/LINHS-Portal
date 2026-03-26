import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { api, adminApi } from '../../utils/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Badge } from '../../components/ui/badge';
import { toast } from 'sonner';
import { BookOpen, Plus, Edit, Trash2, Users, Calendar } from 'lucide-react';

export default function Classes() {
  const { user, accessToken } = useAuth();
  const [classes, setClasses] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [classForm, setClassForm] = useState({
    name: '',
    gradeLevel: '',
    teacher: '',
    schedule: '',
    subject: '',
  });
  const [editingClass, setEditingClass] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [classesData, studentsData] = await Promise.all([
        api.getClasses(),
        api.getStudents(),
      ]);
      setClasses(classesData);
      setStudents(studentsData);
    } catch (error) {
      toast.error('Failed to load classes');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClass = async () => {
    if (!accessToken) return;
    try {
      if (editingClass) {
        await adminApi.updateClass(editingClass.id, classForm, accessToken);
        toast.success('Class updated successfully');
        setEditingClass(null);
      } else {
        await adminApi.createClass(classForm, accessToken);
        toast.success('Class created successfully');
      }
      setDialogOpen(false);
      setClassForm({
        name: '',
        gradeLevel: '',
        teacher: '',
        schedule: '',
        subject: '',
      });
      fetchData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save class');
    }
  };

  const handleEditClass = (cls: any) => {
    setEditingClass(cls);
    setClassForm({
      name: cls.name || '',
      gradeLevel: cls.gradeLevel || '',
      teacher: cls.teacher || '',
      schedule: cls.schedule || '',
      subject: cls.subject || '',
    });
    setDialogOpen(true);
  };

  const handleDeleteClass = async (id: string) => {
    if (!accessToken || !confirm('Are you sure you want to delete this class?')) return;
    try {
      await adminApi.deleteClass(id, accessToken);
      toast.success('Class deleted successfully');
      fetchData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete class');
    }
  };

  const getStudentCount = (classId: string) => {
    return students.filter((s) => s.classId === classId).length;
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
            <h1 className="text-3xl font-bold text-white mb-2">Classes</h1>
            <p className="text-gray-400">Manage class schedules and assignments</p>
          </div>
          {isAdmin && (
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  onClick={() => {
                    setEditingClass(null);
                    setClassForm({
                      name: '',
                      gradeLevel: '',
                      teacher: '',
                      schedule: '',
                      subject: '',
                    });
                  }}
                  className="bg-gradient-to-r from-[#1a472a] to-[#2d5f3f] hover:from-[#2d5f3f] hover:to-[#1a472a] text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Class
                </Button>
              </DialogTrigger>
              <DialogContent className="glass-card border-[#1a472a]/30 text-white max-w-md">
                <DialogHeader>
                  <DialogTitle>{editingClass ? 'Edit Class' : 'Add New Class'}</DialogTitle>
                  <DialogDescription className="text-gray-400">
                    {editingClass ? 'Update class information' : 'Enter class details'}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name" className="text-gray-300">Class Name</Label>
                    <Input
                      id="name"
                      value={classForm.name}
                      onChange={(e) => setClassForm({ ...classForm, name: e.target.value })}
                      className="bg-white/5 border-white/10 text-white"
                      placeholder="Grade 11 - Einstein"
                    />
                  </div>
                  <div>
                    <Label htmlFor="subject" className="text-gray-300">Subject</Label>
                    <Input
                      id="subject"
                      value={classForm.subject}
                      onChange={(e) => setClassForm({ ...classForm, subject: e.target.value })}
                      className="bg-white/5 border-white/10 text-white"
                      placeholder="Mathematics"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="gradeLevel" className="text-gray-300">Grade Level</Label>
                      <Input
                        id="gradeLevel"
                        value={classForm.gradeLevel}
                        onChange={(e) => setClassForm({ ...classForm, gradeLevel: e.target.value })}
                        className="bg-white/5 border-white/10 text-white"
                        placeholder="Grade 11"
                      />
                    </div>
                    <div>
                      <Label htmlFor="teacher" className="text-gray-300">Teacher</Label>
                      <Input
                        id="teacher"
                        value={classForm.teacher}
                        onChange={(e) => setClassForm({ ...classForm, teacher: e.target.value })}
                        className="bg-white/5 border-white/10 text-white"
                        placeholder="Mr. Santos"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="schedule" className="text-gray-300">Schedule</Label>
                    <Textarea
                      id="schedule"
                      value={classForm.schedule}
                      onChange={(e) => setClassForm({ ...classForm, schedule: e.target.value })}
                      className="bg-white/5 border-white/10 text-white"
                      placeholder="Monday 8:00 AM - 9:00 AM&#10;Wednesday 8:00 AM - 9:00 AM"
                      rows={3}
                    />
                  </div>
                  <Button
                    onClick={handleCreateClass}
                    className="w-full bg-gradient-to-r from-[#1a472a] to-[#2d5f3f]"
                  >
                    {editingClass ? 'Update Class' : 'Add Class'}
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
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{classes.length}</p>
                <p className="text-sm text-gray-400">Total Classes</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Classes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {classes.length === 0 ? (
          <Card className="glass-card border-[#1a472a]/30 col-span-full">
            <CardContent className="py-12 text-center">
              <BookOpen className="h-12 w-12 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400">No classes found</p>
            </CardContent>
          </Card>
        ) : (
          classes.map((cls) => (
            <Card key={cls.id} className="glass-card border-[#1a472a]/30 hover:border-[#1a472a]/50 transition-colors">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-white text-lg mb-1">{cls.name}</CardTitle>
                    {cls.subject && (
                      <CardDescription className="text-gray-400">{cls.subject}</CardDescription>
                    )}
                  </div>
                  {isAdmin && (
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEditClass(cls)}
                        className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 h-8 w-8 p-0"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteClass(cls.id)}
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10 h-8 w-8 p-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Badge variant="outline" className="border-[#1a472a] text-[#d4af37]">
                    {cls.gradeLevel}
                  </Badge>
                </div>
                {cls.teacher && (
                  <div className="flex items-center gap-2 text-sm text-gray-300">
                    <Users className="h-4 w-4 text-gray-500" />
                    <span>{cls.teacher}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <Users className="h-4 w-4 text-gray-500" />
                  <span>{getStudentCount(cls.id)} students</span>
                </div>
                {cls.schedule && (
                  <div className="flex items-start gap-2 text-sm text-gray-400">
                    <Calendar className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                    <div className="whitespace-pre-line">{cls.schedule}</div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
