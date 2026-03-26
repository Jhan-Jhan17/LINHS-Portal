import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { api, adminApi } from '../../utils/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Badge } from '../../components/ui/badge';
import { toast } from 'sonner';
import { GraduationCap, Plus, Search, Download } from 'lucide-react';

export default function Grades() {
  const { user, accessToken } = useAuth();
  const [grades, setGrades] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [filteredGrades, setFilteredGrades] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [gradeForm, setGradeForm] = useState({
    lrn: '',
    subject: '',
    grade: '',
    term: '1st Quarter',
    schoolYear: '2025-2026',
  });

  useEffect(() => {
    fetchData();
  }, [accessToken]);

  useEffect(() => {
    // Filter grades based on search query
    if (searchQuery.trim() === '') {
      setFilteredGrades(grades);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = grades.filter((grade) => {
        const lrn = (grade.lrn || '').toLowerCase();
        const subject = (grade.subject || '').toLowerCase();
        const student = students.find((s) => s.lrn === grade.lrn);
        const studentName = student
          ? `${student.firstName || ''} ${student.lastName || ''}`.toLowerCase()
          : '';
        return lrn.includes(query) || subject.includes(query) || studentName.includes(query);
      });
      setFilteredGrades(filtered);
    }
  }, [searchQuery, grades, students]);

  const fetchData = async () => {
    try {
      const [studentsData] = await Promise.all([api.getStudents()]);
      setStudents(studentsData);

      if (accessToken) {
        const gradesData = await adminApi.getGrades(accessToken);
        setGrades(gradesData);
        setFilteredGrades(gradesData);
      }
    } catch (error) {
      toast.error('Failed to load grades');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGrade = async () => {
    if (!accessToken) return;
    try {
      await adminApi.createGrade(gradeForm, accessToken);
      toast.success('Grade recorded successfully');
      setDialogOpen(false);
      setGradeForm({
        lrn: '',
        subject: '',
        grade: '',
        term: '1st Quarter',
        schoolYear: '2025-2026',
      });
      fetchData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to record grade');
    }
  };

  const getStudentName = (lrn: string) => {
    const student = students.find((s) => s.lrn === lrn);
    return student ? `${student.firstName} ${student.lastName}` : 'Unknown';
  };

  const getGradeColor = (grade: string) => {
    const numGrade = parseFloat(grade);
    if (numGrade >= 90) return 'text-green-400';
    if (numGrade >= 85) return 'text-blue-400';
    if (numGrade >= 80) return 'text-yellow-400';
    if (numGrade >= 75) return 'text-orange-400';
    return 'text-red-400';
  };

  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin' || user?.role === 'teacher';

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
            <h1 className="text-3xl font-bold text-white mb-2">Grades</h1>
            <p className="text-gray-400">Manage student grades and performance</p>
          </div>
          {isAdmin && (
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  onClick={() => {
                    setGradeForm({
                      lrn: '',
                      subject: '',
                      grade: '',
                      term: '1st Quarter',
                      schoolYear: '2025-2026',
                    });
                  }}
                  className="bg-gradient-to-r from-[#1a472a] to-[#2d5f3f] hover:from-[#2d5f3f] hover:to-[#1a472a] text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Grade
                </Button>
              </DialogTrigger>
              <DialogContent className="glass-card border-[#1a472a]/30 text-white max-w-md">
                <DialogHeader>
                  <DialogTitle>Add Grade</DialogTitle>
                  <DialogDescription className="text-gray-400">
                    Enter student grade information
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="lrn" className="text-gray-300">Student LRN</Label>
                    <Input
                      id="lrn"
                      value={gradeForm.lrn}
                      onChange={(e) => setGradeForm({ ...gradeForm, lrn: e.target.value })}
                      className="bg-white/5 border-white/10 text-white"
                      placeholder="123456789012"
                    />
                  </div>
                  <div>
                    <Label htmlFor="subject" className="text-gray-300">Subject</Label>
                    <Input
                      id="subject"
                      value={gradeForm.subject}
                      onChange={(e) => setGradeForm({ ...gradeForm, subject: e.target.value })}
                      className="bg-white/5 border-white/10 text-white"
                      placeholder="Mathematics"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="grade" className="text-gray-300">Grade</Label>
                      <Input
                        id="grade"
                        type="number"
                        min="0"
                        max="100"
                        value={gradeForm.grade}
                        onChange={(e) => setGradeForm({ ...gradeForm, grade: e.target.value })}
                        className="bg-white/5 border-white/10 text-white"
                        placeholder="95"
                      />
                    </div>
                    <div>
                      <Label htmlFor="term" className="text-gray-300">Term</Label>
                      <Select
                        value={gradeForm.term}
                        onValueChange={(value) => setGradeForm({ ...gradeForm, term: value })}
                      >
                        <SelectTrigger className="bg-white/5 border-white/10 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="glass-card border-[#1a472a]/30">
                          <SelectItem value="1st Quarter">1st Quarter</SelectItem>
                          <SelectItem value="2nd Quarter">2nd Quarter</SelectItem>
                          <SelectItem value="3rd Quarter">3rd Quarter</SelectItem>
                          <SelectItem value="4th Quarter">4th Quarter</SelectItem>
                          <SelectItem value="Final">Final</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="schoolYear" className="text-gray-300">School Year</Label>
                    <Input
                      id="schoolYear"
                      value={gradeForm.schoolYear}
                      onChange={(e) => setGradeForm({ ...gradeForm, schoolYear: e.target.value })}
                      className="bg-white/5 border-white/10 text-white"
                      placeholder="2025-2026"
                    />
                  </div>
                  <Button
                    onClick={handleCreateGrade}
                    className="w-full bg-gradient-to-r from-[#1a472a] to-[#2d5f3f]"
                  >
                    Add Grade
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
            placeholder="Search by name, LRN, or subject..."
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
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{grades.length}</p>
                <p className="text-sm text-gray-400">Total Grades</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Grades List */}
      <Card className="glass-card border-[#1a472a]/30">
        <CardHeader>
          <CardTitle className="text-white">All Grades</CardTitle>
          <CardDescription className="text-gray-400">
            {filteredGrades.length} {filteredGrades.length === 1 ? 'grade' : 'grades'} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Student</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium hidden md:table-cell">LRN</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Subject</th>
                  <th className="text-center py-3 px-4 text-gray-400 font-medium">Grade</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium hidden lg:table-cell">Term</th>
                </tr>
              </thead>
              <tbody>
                {filteredGrades.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-gray-500">
                      No grades found
                    </td>
                  </tr>
                ) : (
                  filteredGrades.map((grade, index) => (
                    <tr key={index} className="border-b border-white/5 hover:bg-white/5">
                      <td className="py-3 px-4">
                        <div className="text-white font-medium">{getStudentName(grade.lrn)}</div>
                        <div className="text-sm text-gray-400 md:hidden">
                          LRN: {grade.lrn}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-300 hidden md:table-cell">{grade.lrn}</td>
                      <td className="py-3 px-4 text-gray-300">{grade.subject}</td>
                      <td className="py-3 px-4 text-center">
                        <span className={`text-xl font-bold ${getGradeColor(grade.grade)}`}>
                          {grade.grade}
                        </span>
                      </td>
                      <td className="py-3 px-4 hidden lg:table-cell">
                        <Badge variant="outline" className="border-[#1a472a] text-[#d4af37]">
                          {grade.term}
                        </Badge>
                      </td>
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
