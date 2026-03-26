import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { api, adminApi } from '../../utils/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Badge } from '../../components/ui/badge';
import { toast } from 'sonner';
import { Users, Plus, Edit, Trash2, Search } from 'lucide-react';

export default function Students() {
  const { user, accessToken } = useAuth();
  const [students, setStudents] = useState<any[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [studentForm, setStudentForm] = useState({
    name: '',
    gradeLevel: '',
    section: '',
    classId: '',
    lrn: '',
    firstName: '',
    lastName: '',
  });
  const [editingStudent, setEditingStudent] = useState<any>(null);

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    // Filter students based on search query
    if (searchQuery.trim() === '') {
      setFilteredStudents(students);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = students.filter((student) => {
        const fullName = `${student.firstName || ''} ${student.lastName || ''}`.toLowerCase();
        const lrn = (student.lrn || '').toLowerCase();
        const section = (student.section || '').toLowerCase();
        return fullName.includes(query) || lrn.includes(query) || section.includes(query);
      });
      setFilteredStudents(filtered);
    }
  }, [searchQuery, students]);

  const fetchStudents = async () => {
    try {
      const data = await api.getStudents();
      setStudents(data);
      setFilteredStudents(data);
    } catch (error) {
      toast.error('Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateStudent = async () => {
    if (!accessToken) return;
    try {
      if (editingStudent) {
        await adminApi.updateStudent(editingStudent.id, studentForm, accessToken);
        toast.success('Student updated successfully');
        setEditingStudent(null);
      } else {
        await adminApi.createStudent(studentForm, accessToken);
        toast.success('Student created successfully');
      }
      setDialogOpen(false);
      setStudentForm({
        name: '',
        gradeLevel: '',
        section: '',
        classId: '',
        lrn: '',
        firstName: '',
        lastName: '',
      });
      fetchStudents();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save student');
    }
  };

  const handleEditStudent = (student: any) => {
    setEditingStudent(student);
    setStudentForm({
      name: student.name || '',
      gradeLevel: student.gradeLevel || '',
      section: student.section || '',
      classId: student.classId || '',
      lrn: student.lrn || '',
      firstName: student.firstName || '',
      lastName: student.lastName || '',
    });
    setDialogOpen(true);
  };

  const handleDeleteStudent = async (id: string) => {
    if (!accessToken || !confirm('Are you sure you want to delete this student?')) return;
    try {
      await adminApi.deleteStudent(id, accessToken);
      toast.success('Student deleted successfully');
      fetchStudents();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete student');
    }
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
            <h1 className="text-3xl font-bold text-white mb-2">Students</h1>
            <p className="text-gray-400">Manage student records</p>
          </div>
          {isAdmin && (
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  onClick={() => {
                    setEditingStudent(null);
                    setStudentForm({
                      name: '',
                      gradeLevel: '',
                      section: '',
                      classId: '',
                      lrn: '',
                      firstName: '',
                      lastName: '',
                    });
                  }}
                  className="bg-gradient-to-r from-[#1a472a] to-[#2d5f3f] hover:from-[#2d5f3f] hover:to-[#1a472a] text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Student
                </Button>
              </DialogTrigger>
              <DialogContent className="glass-card border-[#1a472a]/30 text-white max-w-md">
                <DialogHeader>
                  <DialogTitle>{editingStudent ? 'Edit Student' : 'Add New Student'}</DialogTitle>
                  <DialogDescription className="text-gray-400">
                    {editingStudent ? 'Update student information' : 'Enter student details'}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName" className="text-gray-300">First Name</Label>
                      <Input
                        id="firstName"
                        value={studentForm.firstName}
                        onChange={(e) => setStudentForm({ ...studentForm, firstName: e.target.value })}
                        className="bg-white/5 border-white/10 text-white"
                        placeholder="Juan"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName" className="text-gray-300">Last Name</Label>
                      <Input
                        id="lastName"
                        value={studentForm.lastName}
                        onChange={(e) => setStudentForm({ ...studentForm, lastName: e.target.value })}
                        className="bg-white/5 border-white/10 text-white"
                        placeholder="Dela Cruz"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="lrn" className="text-gray-300">LRN</Label>
                    <Input
                      id="lrn"
                      value={studentForm.lrn}
                      onChange={(e) => setStudentForm({ ...studentForm, lrn: e.target.value })}
                      className="bg-white/5 border-white/10 text-white"
                      placeholder="123456789012"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="gradeLevel" className="text-gray-300">Grade Level</Label>
                      <Input
                        id="gradeLevel"
                        value={studentForm.gradeLevel}
                        onChange={(e) => setStudentForm({ ...studentForm, gradeLevel: e.target.value })}
                        className="bg-white/5 border-white/10 text-white"
                        placeholder="Grade 11"
                      />
                    </div>
                    <div>
                      <Label htmlFor="section" className="text-gray-300">Section</Label>
                      <Input
                        id="section"
                        value={studentForm.section}
                        onChange={(e) => setStudentForm({ ...studentForm, section: e.target.value })}
                        className="bg-white/5 border-white/10 text-white"
                        placeholder="Einstein"
                      />
                    </div>
                  </div>
                  <Button
                    onClick={handleCreateStudent}
                    className="w-full bg-gradient-to-r from-[#1a472a] to-[#2d5f3f]"
                  >
                    {editingStudent ? 'Update Student' : 'Add Student'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, LRN, or section..."
            className="pl-10 bg-white/5 border-white/10 text-white"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card className="glass-card border-[#1a472a]/30">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-[#1a472a] to-[#2d5f3f] rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{students.length}</p>
                <p className="text-sm text-gray-400">Total Students</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Students List */}
      <Card className="glass-card border-[#1a472a]/30">
        <CardHeader>
          <CardTitle className="text-white">All Students</CardTitle>
          <CardDescription className="text-gray-400">
            {filteredStudents.length} {filteredStudents.length === 1 ? 'student' : 'students'} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Name</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium hidden md:table-cell">LRN</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Grade & Section</th>
                  {isAdmin && <th className="text-right py-3 px-4 text-gray-400 font-medium">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={isAdmin ? 4 : 3} className="text-center py-8 text-gray-500">
                      No students found
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((student) => (
                    <tr key={student.id} className="border-b border-white/5 hover:bg-white/5">
                      <td className="py-3 px-4">
                        <div className="text-white font-medium">
                          {student.firstName} {student.lastName}
                        </div>
                        <div className="text-sm text-gray-400 md:hidden">
                          LRN: {student.lrn || 'N/A'}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-300 hidden md:table-cell">{student.lrn || 'N/A'}</td>
                      <td className="py-3 px-4">
                        <Badge variant="outline" className="border-[#1a472a] text-[#d4af37]">
                          {student.gradeLevel} - {student.section}
                        </Badge>
                      </td>
                      {isAdmin && (
                        <td className="py-3 px-4">
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleEditStudent(student)}
                              className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeleteStudent(student.id)}
                              className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
