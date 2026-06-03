import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api, adminApi } from '../utils/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { ScrollArea } from '../components/ui/scroll-area';
import { QRScanner } from '../components/QRScanner';
import { toast } from 'sonner';
import QRCode from 'qrcode';
import {
  Users, BookOpen, Megaphone, Settings, Plus, Edit, Trash2, GraduationCap,
  BarChart3, FolderOpen, Image, LogOut, ClipboardCheck, FileText,
  QrCode, Scan, Activity, AlertTriangle, Wrench, Package, Heart,
  FileCheck, Download, CheckCircle, XCircle, Clock, School
} from 'lucide-react';

export default function TeacherDashboard() {
  const navigate = useNavigate();
  const { user, loading: authLoading, logout } = useAuth();
  
  const [stats, setStats] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [resources, setResources] = useState<any[]>([]);
  const [gallery, setGallery] = useState<any[]>([]);
  const [schoolInfo, setSchoolInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // New feature states
  const [attendanceRecords, setAttendanceRecords] = useState<any[]>([]);
  const [guidanceRecords, setGuidanceRecords] = useState<any[]>([]);
  const [facilityRecords, setFacilityRecords] = useState<any[]>([]);
  const [equipmentRecords, setEquipmentRecords] = useState<any[]>([]);
  const [clinicVisits, setClinicVisits] = useState<any[]>([]);
  const [grades, setGrades] = useState<any[]>([]);
  const [documentRequests, setDocumentRequests] = useState<any[]>([]);
  const [qrCodes, setQrCodes] = useState<{ lrn: string; qrCode: string; name: string }[]>([]);

  // Dialog states
  const [studentDialogOpen, setStudentDialogOpen] = useState(false);
  const [classDialogOpen, setClassDialogOpen] = useState(false);
  const [announcementDialogOpen, setAnnouncementDialogOpen] = useState(false);
  const [resourceDialogOpen, setResourceDialogOpen] = useState(false);
  const [galleryDialogOpen, setGalleryDialogOpen] = useState(false);
  const [schoolInfoDialogOpen, setSchoolInfoDialogOpen] = useState(false);
  const [attendanceDialogOpen, setAttendanceDialogOpen] = useState(false);
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const [scanDialogOpen, setScanDialogOpen] = useState(false);
  const [guidanceDialogOpen, setGuidanceDialogOpen] = useState(false);
  const [facilityDialogOpen, setFacilityDialogOpen] = useState(false);
  const [equipmentDialogOpen, setEquipmentDialogOpen] = useState(false);
  const [clinicDialogOpen, setClinicDialogOpen] = useState(false);
  const [gradeDialogOpen, setGradeDialogOpen] = useState(false);

  // Form states (UPDATED TO SNAKE_CASE TO MATCH MYSQL DATABASE)
  const [studentForm, setStudentForm] = useState({ lrn: '', first_name: '', last_name: '', strand: '' });
  const [classForm, setClassForm] = useState({ name: '', grade_level: '', section: '', adviser: '' });
  const [announcementForm, setAnnouncementForm] = useState({ title: '', content: '', priority: 'normal', category: 'general' });
  const [resourceForm, setResourceForm] = useState({ title: '', description: '', category: '', file_url: '', link_url: '' });
  const [galleryForm, setGalleryForm] = useState({ image_url: '', caption: '' });
  const [schoolInfoForm, setSchoolInfoForm] = useState<any>(null);
  const [selectedClass, setSelectedClass] = useState('');
  const [guidanceForm, setGuidanceForm] = useState({ incident: '', students_involved: '', section: '', severity: 'low', status: 'pending', date: new Date().toISOString().split('T')[0] });
  const [facilityForm, setFacilityForm] = useState({
    issue_category: 'electrical',
    priority: 'low',
    item_type: '',
    specific_item: '',
    location: '',
    description: '',
    condition: 'not_working',
    reported_by: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [equipmentForm, setEquipmentForm] = useState({ item_name: '', category: 'clinic', borrower_lrn: '', borrower_name: '', borrow_date: new Date().toISOString().split('T')[0], expected_return_date: '' });
  const [clinicForm, setClinicForm] = useState({ student_lrn: '', student_name: '', complaint: '', diagnosis: '', treatment: '', date: new Date().toISOString().split('T')[0] });
  const [gradeForm, setGradeForm] = useState({ lrn: '', subject: '', grade: '', term: '1st Quarter', school_year: '2025-2026' });

  // Edit states
  const [editingStudent, setEditingStudent] = useState<any>(null);
  const [editingClass, setEditingClass] = useState<any>(null);
  const [editingAnnouncement, setEditingAnnouncement] = useState<any>(null);
  const [editingResource, setEditingResource] = useState<any>(null);
  const [editingGallery, setEditingGallery] = useState<any>(null);

  // User object is already flat from our AuthContext update
  const userRole = user?.role;
  const userSection = user?.section;
  const userCategory = user?.category;

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/teacher/login');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      const promises: Promise<any>[] = [
        api.getStats(),
        api.getStudents(),
        api.getClasses(),
        api.getAnnouncements(),
        api.getResources(),
        api.getGallery(),
        api.getSchoolInfo(),
      ];

      if (user) {
        if (userRole === 'guidance' || userRole === 'adviser' || userRole === 'super_admin' || userRole === 'teacher') {
          promises.push(api.getGuidanceRecords());
        }
        if (userRole === 'facilities_admin' || userRole === 'adviser' || userRole === 'super_admin' || userRole === 'teacher') {
          promises.push(api.getFacilityRecords());
        }
        if (userRole === 'equipment_admin' || userRole === 'super_admin' || userRole === 'teacher') {
          promises.push(api.getEquipmentRecords());
        }
        if (userRole === 'nurse' || userRole === 'super_admin') {
          promises.push(api.getClinicVisits());
        }
        if (userRole === 'adviser' || userRole === 'super_admin' || userRole === 'teacher') {
          promises.push(api.getGrades());
        }
        if (userRole === 'registrar' || userRole === 'super_admin') {
          promises.push(api.getDocumentRequests());
        }
      }

      const results = await Promise.all(promises);

      setStats(results[0]);
      setStudents(results[1]);
      setClasses(results[2]);
      setAnnouncements(results[3]);
      setResources(results[4]);
      setGallery(results[5]);
      setSchoolInfo(results[6]);
      setSchoolInfoForm(results[6]);

      let currentIndex = 7;
      if (results[currentIndex] && (userRole === 'guidance' || userRole === 'adviser' || userRole === 'super_admin' || userRole === 'teacher')) {
        setGuidanceRecords(results[currentIndex]);
        currentIndex++;
      }
      if (results[currentIndex] && (userRole === 'facilities_admin' || userRole === 'adviser' || userRole === 'super_admin' || userRole === 'teacher')) {
        setFacilityRecords(results[currentIndex]);
        currentIndex++;
      }
      if (results[currentIndex] && (userRole === 'equipment_admin' || userRole === 'super_admin' || userRole === 'teacher')) {
        setEquipmentRecords(results[currentIndex]);
        currentIndex++;
      }
      if (results[currentIndex] && (userRole === 'nurse' || userRole === 'super_admin')) {
        setClinicVisits(results[currentIndex]);
        currentIndex++;
      }
      if (results[currentIndex] && (userRole === 'adviser' || userRole === 'super_admin' || userRole === 'teacher')) {
        setGrades(results[currentIndex]);
        currentIndex++;
      }
      if (results[currentIndex] && (userRole === 'registrar' || userRole === 'super_admin')) {
        setDocumentRequests(results[currentIndex]);
        currentIndex++;
      }
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // Student Management
  const handleCreateStudent = async () => {
    if (!user) return;
    try {
      if (editingStudent) {
        await api.updateStudent(editingStudent.id, studentForm);
        toast.success('Student updated successfully');
        setEditingStudent(null);
      } else {
        await api.createStudent(studentForm);
        toast.success('Student created successfully');
      }
      setStudentDialogOpen(false);
      setStudentForm({ lrn: '', first_name: '', last_name: '', strand: '' });
      fetchData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save student');
    }
  };

  const handleEditStudent = (student: any) => {
    setEditingStudent(student);
    setStudentForm({
      lrn: student.lrn || '',
      first_name: student.first_name || '',
      last_name: student.last_name || '',
      strand: student.strand || ''
    });
    setStudentDialogOpen(true);
  };

  const handleDeleteStudent = async (id: string) => {
    if (!user || !confirm('Are you sure you want to delete this student?')) return;
    try {
      await api.deleteStudent(id);
      toast.success('Student deleted successfully');
      fetchData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete student');
    }
  };

  // Class Management
  const handleCreateClass = async () => {
    if (!user) return;
    try {
      if (editingClass) {
        await api.updateClass(editingClass.id, classForm);
        toast.success('Class updated successfully');
        setEditingClass(null);
      } else {
        await api.createClass(classForm);
        toast.success('Class created successfully');
      }
      setClassDialogOpen(false);
      setClassForm({ name: '', grade_level: '', section: '', adviser: '' });
      fetchData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save class');
    }
  };

  const handleEditClass = (cls: any) => {
    setEditingClass(cls);
    setClassForm({
      name: cls.name || '',
      grade_level: cls.grade_level || '',
      section: cls.section || '',
      adviser: cls.adviser || ''
    });
    setClassDialogOpen(true);
  };

  const handleDeleteClass = async (id: string) => {
    if (!user || !confirm('Are you sure you want to delete this class?')) return;
    try {
      await api.deleteClass(id);
      toast.success('Class deleted successfully');
      fetchData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete class');
    }
  };

  // Announcement Management
  const handleCreateAnnouncement = async () => {
    if (!user) return;
    try {
      if (editingAnnouncement) {
        await api.updateAnnouncement(editingAnnouncement.id, announcementForm);
        toast.success('Announcement updated successfully');
        setEditingAnnouncement(null);
      } else {
        await api.createAnnouncement(announcementForm);
        toast.success('Announcement posted successfully');
      }
      setAnnouncementDialogOpen(false);
      setAnnouncementForm({ title: '', content: '', priority: 'normal', category: 'general' });
      fetchData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save announcement');
    }
  };

  const handleEditAnnouncement = (announcement: any) => {
    setEditingAnnouncement(announcement);
    setAnnouncementForm({
      title: announcement.title || '',
      content: announcement.content || '',
      priority: announcement.priority || 'normal',
      category: announcement.category || 'general'
    });
    setAnnouncementDialogOpen(true);
  };

  const handleDeleteAnnouncement = async (id: string) => {
    if (!user || !confirm('Are you sure you want to delete this announcement?')) return;
    try {
      await api.deleteAnnouncement(id);
      toast.success('Announcement deleted successfully');
      fetchData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete announcement');
    }
  };

  // Resource Management
  const handleCreateResource = async () => {
    if (!user) return;
    try {
      if (editingResource) {
        await api.updateResource(editingResource.id, resourceForm);
        toast.success('Resource updated successfully');
        setEditingResource(null);
      } else {
        await api.createResource(resourceForm);
        toast.success('Resource added successfully');
      }
      setResourceDialogOpen(false);
      setResourceForm({ title: '', description: '', category: '', file_url: '', link_url: '' });
      fetchData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save resource');
    }
  };

  const handleEditResource = (resource: any) => {
    setEditingResource(resource);
    setResourceForm({
      title: resource.title || '',
      description: resource.description || '',
      category: resource.category || '',
      file_url: resource.file_url || '',
      link_url: resource.link_url || ''
    });
    setResourceDialogOpen(true);
  };

  const handleDeleteResource = async (id: string) => {
    if (!user || !confirm('Are you sure you want to delete this resource?')) return;
    try {
      await api.deleteResource(id);
      toast.success('Resource deleted successfully');
      fetchData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete resource');
    }
  };

  // Gallery Management
  const handleCreateGalleryItem = async () => {
    if (!user) return;
    try {
      if (editingGallery) {
        await api.updateGalleryItem(editingGallery.id, galleryForm);
        toast.success('Gallery item updated successfully');
        setEditingGallery(null);
      } else {
        await api.createGalleryItem(galleryForm);
        toast.success('Gallery item added successfully');
      }
      setGalleryDialogOpen(false);
      setGalleryForm({ image_url: '', caption: '' });
      fetchData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save gallery item');
    }
  };

  const handleEditGalleryItem = (item: any) => {
    setEditingGallery(item);
    setGalleryForm({
      image_url: item.image_url || '',
      caption: item.caption || ''
    });
    setGalleryDialogOpen(true);
  };

  const handleDeleteGalleryItem = async (id: string) => {
    if (!user || !confirm('Are you sure you want to delete this gallery item?')) return;
    try {
      await api.deleteGalleryItem(id);
      toast.success('Gallery item deleted successfully');
      fetchData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete gallery item');
    }
  };

  // School Info Management
  const handleUpdateSchoolInfo = async () => {
    if (!user) return;
    try {
      await api.updateSchoolInfo(schoolInfoForm);
      toast.success('School information updated successfully');
      setSchoolInfoDialogOpen(false);
      fetchData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update school information');
    }
  };

  // QR Code Generation for Attendance
  const handleGenerateQRCodes = async () => {
    if (!selectedClass) {
      toast.error('Please select a class');
      return;
    }

    try {
      // Find students in the selected class section
      const classInfo = classes.find(c => c.id === selectedClass);
      const classStudents = students.filter((s: any) => 
        s.section === classInfo?.section
      );

      if (classStudents.length === 0) {
        toast.error('No students found in this section');
        return;
      }

      const qrCodesList: { lrn: string; qrCode: string; name: string }[] = [];

      for (const student of classStudents) {
        if (student.lrn) {
          try {
            // Encode the LRN into the QR code
            const qrCodeDataUrl = await QRCode.toDataURL(student.lrn);
            qrCodesList.push({
              lrn: student.lrn,
              qrCode: qrCodeDataUrl,
              name: `${student.first_name} ${student.last_name}`
            });
          } catch (err) {
            console.error('Error generating QR for', student.lrn, err);
          }
        }
      }

      setQrCodes(qrCodesList);
      setQrDialogOpen(true);
      toast.success(`Generated ${qrCodesList.length} QR codes`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to generate QR codes');
    }
  };

  // Scan QR Code for Attendance
  const handleQRScan = async (decodedText: string) => {
    if (!selectedClass) {
      toast.error('Please select a class first');
      return;
    }

    try {
      const today = new Date().toISOString().split('T')[0];
      // Note: decodedText should be the student's LRN based on our generator above
      await api.recordAttendance(decodedText, selectedClass, today);
      toast.success(`Attendance recorded for LRN: ${decodedText}`);
      
      const attendance = await api.getAttendance(selectedClass);
      setAttendanceRecords(attendance);
    } catch (error: any) {
      toast.error(error.message || 'Failed to record attendance');
    }
  };

  // Guidance Record Management
  const handleCreateGuidanceRecord = async () => {
    if (!user) return;
    try {
      await api.createGuidanceRecord(guidanceForm);
      toast.success('Guidance record created successfully');
      setGuidanceDialogOpen(false);
      setGuidanceForm({ incident: '', students_involved: '', section: '', severity: 'low', status: 'pending', date: new Date().toISOString().split('T')[0] });
      fetchData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to create guidance record');
    }
  };

  const handleUpdateGuidanceRecord = async (id: string, status: string) => {
    if (!user) return;
    try {
      await api.updateGuidanceRecord(id, { status });
      toast.success('Guidance record updated');
      fetchData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update record');
    }
  };

  // Facility Record Management
  const handleCreateFacilityRecord = async () => {
    if (!user) return;
    try {
      await api.createFacilityRecord(facilityForm);
      toast.success('Maintenance issue reported successfully');
      setFacilityDialogOpen(false);
      setFacilityForm({
        issue_category: 'electrical',
        priority: 'low',
        item_type: '',
        specific_item: '',
        location: '',
        description: '',
        condition: 'not_working',
        reported_by: '',
        date: new Date().toISOString().split('T')[0]
      });
      fetchData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to create facility record');
    }
  };

  const handleUpdateFacilityRecord = async (id: string, status: string) => {
    if (!user) return;
    try {
      await api.updateFacilityRecord(id, status);
      toast.success('Facility record updated');
      fetchData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update record');
    }
  };

  // Equipment Record Management
  const handleCreateEquipmentRecord = async () => {
    if (!user) return;
    try {
      await api.createEquipmentRecord({ ...equipmentForm, category: userCategory || equipmentForm.category });
      toast.success('Equipment borrowing record created successfully');
      setEquipmentDialogOpen(false);
      setEquipmentForm({ item_name: '', category: 'clinic', borrower_lrn: '', borrower_name: '', borrow_date: new Date().toISOString().split('T')[0], expected_return_date: '' });
      fetchData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to create equipment record');
    }
  };

  const handleUpdateEquipmentRecord = async (id: string, status: string) => {
    if (!user) return;
    try {
      await api.updateEquipmentRecord(id, status);
      toast.success('Equipment record updated');
      fetchData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update record');
    }
  };

  // Clinic Visit Management
  const handleCreateClinicVisit = async () => {
    if (!user) return;
    try {
      await api.createClinicVisit(clinicForm);
      toast.success('Clinic visit recorded successfully');
      setClinicDialogOpen(false);
      setClinicForm({ student_lrn: '', student_name: '', complaint: '', diagnosis: '', treatment: '', date: new Date().toISOString().split('T')[0] });
      fetchData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to record clinic visit');
    }
  };

  // Grade Management
  const handleCreateGrade = async () => {
    if (!user) return;
    try {
      await api.createGrade(gradeForm);
      toast.success('Grade recorded successfully');
      setGradeDialogOpen(false);
      setGradeForm({ lrn: '', subject: '', grade: '', term: '1st Quarter', school_year: '2025-2026' });
      fetchData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to record grade');
    }
  };

  // Document Request Management
  const handleUpdateDocumentRequest = async (id: string, status: string) => {
    if (!user) return;
    try {
      await api.updateDocumentRequest(id, { status });
      toast.success('Document request updated');
      fetchData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update request');
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0a0e0d]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#d4af37]"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const getRoleBadgeColor = () => {
    const roleColors: Record<string, string> = {
      'super_admin': 'bg-purple-600',
      'teacher': 'bg-blue-600',
      'adviser': 'bg-green-600',
      'guidance': 'bg-yellow-600',
      'nurse': 'bg-pink-600',
      'registrar': 'bg-orange-600',
      'equipment_admin': 'bg-cyan-600',
      'facilities_admin': 'bg-red-600',
    };
    return roleColors[userRole || ''] || 'bg-gray-600';
  };

  const getRoleDisplay = () => {
    const roleNames: Record<string, string> = {
      'super_admin': 'Super Administrator',
      'teacher': 'Teacher',
      'adviser': 'Class Adviser',
      'guidance': 'Guidance Counselor',
      'nurse': 'School Nurse',
      'registrar': 'Registrar',
      'equipment_admin': 'Equipment Admin',
      'facilities_admin': 'Facilities Admin',
    };
    return (userRole && roleNames[userRole]) || userRole || 'Staff';
  };

  // Determine which tabs to show based on role
  const availableTabs = [];

  // Everyone can see Students, Classes, Announcements, Resources, Gallery
  if (userRole === 'super_admin' || userRole === 'teacher' || userRole === 'adviser') {
    availableTabs.push('students', 'classes', 'announcements', 'resources', 'gallery');
  }

  // Attendance - Teachers and Advisers
  if (userRole === 'super_admin' || userRole === 'teacher' || userRole === 'adviser') {
    availableTabs.push('attendance');
  }

  // Grades - Teachers and Advisers
  if (userRole === 'super_admin' || userRole === 'teacher' || userRole === 'adviser') {
    availableTabs.push('grades');
  }

  // Guidance - Guidance Counselor and Advisers
  if (userRole === 'super_admin' || userRole === 'guidance' || userRole === 'adviser' || userRole === 'teacher') {
    availableTabs.push('guidance');
  }

  // Facilities - Facilities Admin and Advisers
  if (userRole === 'super_admin' || userRole === 'facilities_admin' || userRole === 'adviser' || userRole === 'teacher') {
    availableTabs.push('facilities');
  }

  // Equipment - Equipment Admins
  if (userRole === 'super_admin' || userRole === 'equipment_admin' || userRole === 'teacher') {
    availableTabs.push('equipment');
  }

  // Clinic - School Nurse
  if (userRole === 'super_admin' || userRole === 'nurse') {
    availableTabs.push('clinic');
  }

  // Registrar - Document Requests
  if (userRole === 'super_admin' || userRole === 'registrar') {
    availableTabs.push('documents');
  }

  // Settings - Everyone
  availableTabs.push('settings');

  const isSuperAdmin = userRole === 'super_admin';
  const isTeacher = userRole === 'teacher' || userRole === 'adviser';

return (
    <div className={`${isSuperAdmin ? 'bg-[#050b14]' : 'bg-[#0a0e0d]'} min-h-screen`}>
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className={`text-3xl font-bold mb-2 ${isSuperAdmin ? 'text-blue-400' : 'text-white'}`}>
            {isSuperAdmin ? 'System Administration' : isTeacher ? 'Teacher Dashboard' : 'Staff Dashboard'}
          </h1>
          <p className="text-gray-400">Welcome back, {user.name || user.email}</p>
          <Badge className={`${getRoleBadgeColor()} mt-2`}>
            {getRoleDisplay()}
            {userSection && ` - ${userSection}`}
            {userCategory && ` (${userCategory})`}
          </Badge>
        </div>

        {/* Statistics Cards - Conditional based on role */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          {isSuperAdmin ? (
            <>
              <Card className="glass-card border-blue-900/30 bg-blue-950/10">
                <CardContent className="pt-6 text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-900 to-blue-800 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Users className="h-6 w-6 text-blue-400" />
                  </div>
                  <p className="text-2xl font-bold text-white">{students.length}</p>
                  <p className="text-sm text-gray-400">Total System Students</p>
                </CardContent>
              </Card>
              <Card className="glass-card border-blue-900/30 bg-blue-950/10">
                <CardContent className="pt-6 text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-900 to-blue-800 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Settings className="h-6 w-6 text-blue-400" />
                  </div>
                  <p className="text-2xl font-bold text-white">{classes.length}</p>
                  <p className="text-sm text-gray-400">Active Classes</p>
                </CardContent>
              </Card>
              <Card className="glass-card border-blue-900/30 bg-blue-950/10">
                <CardContent className="pt-6 text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-900 to-blue-800 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Activity className="h-6 w-6 text-blue-400" />
                  </div>
                  <p className="text-2xl font-bold text-white">{documentRequests.length}</p>
                  <p className="text-sm text-gray-400">Pending Requests</p>
                </CardContent>
              </Card>
              <Card className="glass-card border-blue-900/30 bg-blue-950/10">
                <CardContent className="pt-6 text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-900 to-blue-800 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <AlertTriangle className="h-6 w-6 text-blue-400" />
                  </div>
                  <p className="text-2xl font-bold text-white">{guidanceRecords.length + facilityRecords.length}</p>
                  <p className="text-sm text-gray-400">System Alerts</p>
                </CardContent>
              </Card>
            </>
          ) : (
            <>
              <Card className="glass-card border-[#1a472a]/30">
                <CardContent className="pt-6 text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#1a472a] to-[#2d5f3f] rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Users className="h-6 w-6 text-[#d4af37]" />
                  </div>
                  <p className="text-2xl font-bold text-white">{students.length}</p>
                  <p className="text-sm text-gray-400">My Students</p>
                </CardContent>
              </Card>
              <Card className="glass-card border-[#1a472a]/30">
                <CardContent className="pt-6 text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#1a472a] to-[#2d5f3f] rounded-lg flex items-center justify-center mx-auto mb-3">
                    <BookOpen className="h-6 w-6 text-[#d4af37]" />
                  </div>
                  <p className="text-2xl font-bold text-white">{classes.length}</p>
                  <p className="text-sm text-gray-400">My Classes</p>
                </CardContent>
              </Card>
              <Card className="glass-card border-[#1a472a]/30">
                <CardContent className="pt-6 text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#1a472a] to-[#2d5f3f] rounded-lg flex items-center justify-center mx-auto mb-3">
                    <ClipboardCheck className="h-6 w-6 text-[#d4af37]" />
                  </div>
                  <p className="text-2xl font-bold text-white">{attendanceRecords.length}</p>
                  <p className="text-sm text-gray-400">Attendance Today</p>
                </CardContent>
              </Card>
              <Card className="glass-card border-[#1a472a]/30">
                <CardContent className="pt-6 text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#1a472a] to-[#2d5f3f] rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Megaphone className="h-6 w-6 text-[#d4af37]" />
                  </div>
                  <p className="text-2xl font-bold text-white">{announcements.length}</p>
                  <p className="text-sm text-gray-400">Announcements</p>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Main Content Tabs */}
        <div className={`flex ${isSuperAdmin ? 'flex-col md:flex-row gap-6' : 'flex-col'}`}>
          <Tabs defaultValue={availableTabs[0]} className={`w-full ${isSuperAdmin ? 'flex flex-col md:flex-row gap-6' : ''}`}>
            <TabsList className={`${isSuperAdmin ? 'flex flex-col w-full md:w-64 gap-2 bg-white/5 p-3 h-auto items-stretch' : 'flex flex-wrap w-full gap-2 mb-6 bg-white/5 p-3 h-auto'}`}>
            {availableTabs.includes('students') && (
              <TabsTrigger value="students" className="data-[state=active]:bg-[#1a472a] data-[state=active]:text-white flex-1 min-w-[140px]">
                <Users className="h-4 w-4 mr-2" />
                Students
              </TabsTrigger>
            )}
            {availableTabs.includes('classes') && (
              <TabsTrigger value="classes" className="data-[state=active]:bg-[#1a472a] data-[state=active]:text-white flex-1 min-w-[140px]">
                <BookOpen className="h-4 w-4 mr-2" />
                Classes
              </TabsTrigger>
            )}
            {availableTabs.includes('attendance') && (
              <TabsTrigger value="attendance" className="data-[state=active]:bg-[#1a472a] data-[state=active]:text-white flex-1 min-w-[140px]">
                <ClipboardCheck className="h-4 w-4 mr-2" />
                Attendance
              </TabsTrigger>
            )}
            {availableTabs.includes('grades') && (
              <TabsTrigger value="grades" className="data-[state=active]:bg-[#1a472a] data-[state=active]:text-white flex-1 min-w-[140px]">
                <GraduationCap className="h-4 w-4 mr-2" />
                Grades
              </TabsTrigger>
            )}
            {availableTabs.includes('guidance') && (
              <TabsTrigger value="guidance" className="data-[state=active]:bg-[#1a472a] data-[state=active]:text-white flex-1 min-w-[140px]">
                <AlertTriangle className="h-4 w-4 mr-2" />
                Guidance
              </TabsTrigger>
            )}
            {availableTabs.includes('facilities') && (
              <TabsTrigger value="facilities" className="data-[state=active]:bg-[#1a472a] data-[state=active]:text-white flex-1 min-w-[140px]">
                <Wrench className="h-4 w-4 mr-2" />
                Facilities
              </TabsTrigger>
            )}
            {availableTabs.includes('equipment') && (
              <TabsTrigger value="equipment" className="data-[state=active]:bg-[#1a472a] data-[state=active]:text-white flex-1 min-w-[140px]">
                <Package className="h-4 w-4 mr-2" />
                Equipment
              </TabsTrigger>
            )}
            {availableTabs.includes('clinic') && (
              <TabsTrigger value="clinic" className="data-[state=active]:bg-[#1a472a] data-[state=active]:text-white flex-1 min-w-[140px]">
                Clinic
              </TabsTrigger>
            )}
            {availableTabs.includes('documents') && (
              <TabsTrigger value="documents" className="data-[state=active]:bg-[#1a472a] data-[state=active]:text-white flex-1 min-w-[140px]">
                <FileCheck className="h-4 w-4 mr-2" />
                Documents
              </TabsTrigger>
            )}
            {availableTabs.includes('announcements') && (
              <TabsTrigger value="announcements" className="data-[state=active]:bg-[#1a472a] data-[state=active]:text-white flex-1 min-w-[140px]">
                <Megaphone className="h-4 w-4 mr-2" />
                News
              </TabsTrigger>
            )}
            {availableTabs.includes('resources') && (
              <TabsTrigger value="resources" className="data-[state=active]:bg-[#1a472a] data-[state=active]:text-white flex-1 min-w-[140px]">
                <FolderOpen className="h-4 w-4 mr-2" />
                Resources
              </TabsTrigger>
            )}
            {availableTabs.includes('gallery') && (
              <TabsTrigger value="gallery" className="data-[state=active]:bg-[#1a472a] data-[state=active]:text-white flex-1 min-w-[140px]">
                <Image className="h-4 w-4 mr-2" />
                Gallery
              </TabsTrigger>
            )}
            {availableTabs.includes('settings') && (
              <TabsTrigger value="settings" className="data-[state=active]:bg-[#1a472a] data-[state=active]:text-white flex-1 min-w-[140px]">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </TabsTrigger>
            )}
            </TabsList>

          {/* Students Tab */}
          {availableTabs.includes('students') && (
            <TabsContent value="students">
              <Card className="glass-card bg-[#0a0e0d] border-[#1a472a]/30">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-white">Student Management</CardTitle>
                      <CardDescription className="text-gray-400">Add and manage student records</CardDescription>
                    </div>
                    <Dialog open={studentDialogOpen} onOpenChange={(open) => {
                      setStudentDialogOpen(open);
                      if (!open) {
                        setEditingStudent(null);
                        // Resetting to match the snake_case state we defined earlier
                        setStudentForm({ lrn: '', first_name: '', last_name: '', strand: '' });
                      }
                    }}>
                      <DialogTrigger asChild>
                        <Button className="bg-green-600 hover:bg-green-700 gap-2 text-white">
                          <Plus className="h-4 w-4" />
                          Add Student
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-[#0f1311] border-[#1a472a]/30">
                        <DialogHeader>
                          <DialogTitle className="text-white">{editingStudent ? 'Edit Student' : 'Add New Student'}</DialogTitle>
                          <DialogDescription className="text-gray-400">Enter student information</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label className="text-white">LRN (Learner Reference Number)</Label>
                            <Input
                              value={studentForm.lrn}
                              onChange={(e) => setStudentForm({ ...studentForm, lrn: e.target.value })}
                              placeholder="e.g. 123456789012"
                              className="bg-white/5 border-white/10 text-white"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label className="text-white">First Name</Label>
                              <Input
                                value={studentForm.first_name}
                                onChange={(e) => setStudentForm({ ...studentForm, first_name: e.target.value })}
                                placeholder="First Name"
                                className="bg-white/5 border-white/10 text-white"
                              />
                            </div>
                            <div>
                              <Label className="text-white">Last Name</Label>
                              <Input
                                value={studentForm.last_name}
                                onChange={(e) => setStudentForm({ ...studentForm, last_name: e.target.value })}
                                placeholder="Last Name"
                                className="bg-white/5 border-white/10 text-white"
                              />
                            </div>
                          </div>
                          <div>
                            <Label className="text-white">Strand</Label>
                            <Select value={studentForm.strand} onValueChange={(v) => setStudentForm({ ...studentForm, strand: v })}>
                              <SelectTrigger className="bg-white/5 border-white/10 text-white">
                                <SelectValue placeholder="Select strand" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="ICT">ICT</SelectItem>
                                <SelectItem value="STEM">STEM</SelectItem>
                                <SelectItem value="HUMSS">HUMSS</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <Button onClick={handleCreateStudent} className="w-full bg-green-600 hover:bg-green-700 text-white">
                            {editingStudent ? 'Update Student' : 'Add Student'}
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[500px]">
                    {students.length === 0 ? (
                      <div className="text-center py-12 text-gray-500">
                        <Users className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                        <p>No students yet. Click "Add Student" to get started.</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {students.map((student) => (
                          <div key={student.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 border border-white/10">
                            <div className="flex-1">
                              <p className="font-semibold text-white">
                                {/* Fixed to display first_name and last_name */}
                                {student.first_name} {student.last_name}
                              </p>
                              <p className="text-sm text-gray-400">
                                {student.lrn && `LRN: ${student.lrn} | `}
                                Strand: {student.strand || 'Not Assigned'}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <Button variant="ghost" size="sm" onClick={() => handleEditStudent(student)} className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => handleDeleteStudent(student.id)} className="text-red-400 hover:text-red-300 hover:bg-red-500/10">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* Classes Tab */}
          {availableTabs.includes('classes') && (
            <TabsContent value="classes">
              <Card className="glass-card bg-[#0a0e0d] border-[#1a472a]/30">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-white">Class Management</CardTitle>
                      <CardDescription className="text-gray-400">Create and manage classes</CardDescription>
                    </div>
                    <Dialog open={classDialogOpen} onOpenChange={(open) => {
                      setClassDialogOpen(open);
                      if (!open) {
                        setEditingClass(null);
                        // Matched to snake_case state
                        setClassForm({ name: '', grade_level: '', section: '', adviser: '' });
                      }
                    }}>
                      <DialogTrigger asChild>
                        <Button className="bg-green-600 hover:bg-green-700 gap-2 text-white">
                          <Plus className="h-4 w-4" />
                          Add Class
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-[#0f1311] border-[#1a472a]/30">
                        <DialogHeader>
                          <DialogTitle className="text-white">{editingClass ? 'Edit Class' : 'Add New Class'}</DialogTitle>
                          <DialogDescription className="text-gray-400">Enter class information</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label className="text-white">Class Name</Label>
                            <Input
                              value={classForm.name}
                              onChange={(e) => setClassForm({ ...classForm, name: e.target.value })}
                              placeholder="e.g., ICT 11-A"
                              className="bg-white/5 border-white/10 text-white"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label className="text-white">Grade Level</Label>
                              <Select value={classForm.grade_level} onValueChange={(v) => setClassForm({ ...classForm, grade_level: v })}>
                                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                                  <SelectValue placeholder="Select grade" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="11">Grade 11</SelectItem>
                                  <SelectItem value="12">Grade 12</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label className="text-white">Section</Label>
                              <Input
                                value={classForm.section}
                                onChange={(e) => setClassForm({ ...classForm, section: e.target.value })}
                                placeholder="e.g., A, B, Newton"
                                className="bg-white/5 border-white/10 text-white"
                              />
                            </div>
                          </div>
                          <div>
                            <Label className="text-white">Adviser Name (Optional)</Label>
                            <Input
                              value={classForm.adviser}
                              onChange={(e) => setClassForm({ ...classForm, adviser: e.target.value })}
                              placeholder="Adviser name"
                              className="bg-white/5 border-white/10 text-white"
                            />
                          </div>
                          <Button onClick={handleCreateClass} className="w-full bg-green-600 hover:bg-green-700 text-white">
                            {editingClass ? 'Update Class' : 'Add Class'}
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[500px]">
                    {classes.length === 0 ? (
                      <div className="text-center py-12 text-gray-500">
                        <BookOpen className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                        <p>No classes yet. Click "Add Class" to get started.</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {classes.map((cls) => (
                          <div key={cls.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 border border-white/10">
                            <div className="flex-1">
                              <p className="font-semibold text-white">{cls.name}</p>
                              <p className="text-sm text-gray-400">
                                Grade {cls.grade_level}
                                {cls.section && ` | Section: ${cls.section}`}
                                {cls.adviser && ` | Adviser: ${cls.adviser}`}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <Button variant="ghost" size="sm" onClick={() => handleEditClass(cls)} className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => handleDeleteClass(cls.id)} className="text-red-400 hover:text-red-300 hover:bg-red-500/10">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* Attendance Tab */}
          {availableTabs.includes('attendance') && (
            <TabsContent value="attendance">
              <Card className="glass-card bg-[#0a0e0d] border-[#1a472a]/30">
                <CardHeader>
                  <CardTitle className="text-white">Attendance Management</CardTitle>
                  <CardDescription className="text-gray-400">Generate QR codes and scan student attendance</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label className="text-white">Select Class</Label>
                    <Select value={selectedClass} onValueChange={setSelectedClass}>
                      <SelectTrigger className="bg-white/5 border-white/10 text-white">
                        <SelectValue placeholder="Select a class" />
                      </SelectTrigger>
                      <SelectContent>
                        {classes.map((cls) => (
                          <SelectItem key={cls.id} value={cls.id.toString()}>{cls.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <Button 
                      onClick={handleGenerateQRCodes} 
                      disabled={!selectedClass}
                      className="bg-blue-600 hover:bg-blue-700 gap-2 text-white"
                    >
                      <QrCode className="h-4 w-4" />
                      Generate QR Codes
                    </Button>
                    
                    <Dialog open={scanDialogOpen} onOpenChange={setScanDialogOpen}>
                      <DialogTrigger asChild>
                        <Button 
                          disabled={!selectedClass}
                          className="bg-green-600 hover:bg-green-700 gap-2 text-white"
                        >
                          <Scan className="h-4 w-4" />
                          Scan Attendance
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-[#0f1311] border-[#1a472a]/30">
                        <DialogHeader>
                          <DialogTitle className="text-white">Scan Student QR Code</DialogTitle>
                          <DialogDescription className="text-gray-400">
                            Scan student QR codes to record attendance
                          </DialogDescription>
                        </DialogHeader>
                        <QRScanner 
                          onScanSuccess={(decodedText) => {
                            handleQRScan(decodedText);
                            // Optional: Automatically close dialog after successful scan
                            // setScanDialogOpen(false); 
                          }}
                          onScanError={(error) => console.log(error)} // Suppressing toast spam on every frame tick
                        />
                      </DialogContent>
                    </Dialog>
                  </div>

                  {selectedClass && attendanceRecords.length > 0 && (
                    <div>
                      <h3 className="text-white text-lg font-semibold mb-3">Recent Attendance</h3>
                      <ScrollArea className="h-[300px]">
                        <div className="space-y-2">
                          {attendanceRecords.map((record: any) => (
                            <div key={record.id} className="p-3 bg-white/5 rounded-lg border border-white/10 flex justify-between items-center">
                              <div>
                                {/* Fallback to both snake_case and camelCase just in case */}
                                <p className="text-white font-medium">LRN: {record.student_lrn || record.lrn}</p>
                                <p className="text-sm text-gray-400">
                                  {new Date(record.timestamp || record.date).toLocaleDateString()} | Status: <span className="text-green-400 capitalize">{record.status}</span>
                                </p>
                              </div>
                              <CheckCircle className="h-5 w-5 text-green-500" />
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* QR Codes Dialog */}
              <Dialog open={qrDialogOpen} onOpenChange={setQrDialogOpen}>
                <DialogContent className="bg-[#0f1311] border-[#1a472a]/30 max-w-4xl">
                  <DialogHeader>
                    <DialogTitle className="text-white">Student QR Codes</DialogTitle>
                    <DialogDescription className="text-gray-400">
                      Print these QR codes and distribute to students
                    </DialogDescription>
                  </DialogHeader>
                  <ScrollArea className="h-[500px]">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4">
                      {qrCodes.map((qr) => (
                        <div key={qr.lrn} className="p-4 bg-white rounded-lg text-center">
                          <img src={qr.qrCode} alt={`QR for ${qr.name}`} className="mx-auto mb-2" />
                          <p className="text-sm font-semibold text-gray-800">{qr.name}</p>
                          <p className="text-xs text-gray-600">{qr.lrn}</p>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                  <div className="flex justify-end gap-2">
                    <Button 
                      onClick={() => window.print()}
                      className="bg-green-600 hover:bg-green-700 gap-2 text-white"
                    >
                      <Download className="h-4 w-4" />
                      Print QR Codes
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </TabsContent>
          )}

          {/* Grades Tab */}
          {availableTabs.includes('grades') && (
            <TabsContent value="grades">
              <Card className="glass-card bg-[#0a0e0d] border-[#1a472a]/30">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-white">Grades Management</CardTitle>
                      <CardDescription className="text-gray-400">Record and manage student grades</CardDescription>
                    </div>
                    <Dialog open={gradeDialogOpen} onOpenChange={(open) => {
                      setGradeDialogOpen(open);
                      if (!open) {
                        setGradeForm({ lrn: '', subject: '', grade: '', term: '1st Quarter', school_year: '2025-2026' });
                      }
                    }}>
                      <DialogTrigger asChild>
                        <Button className="bg-green-600 hover:bg-green-700 gap-2 text-white">
                          <Plus className="h-4 w-4" />
                          Add Grade
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-[#0f1311] border-[#1a472a]/30">
                        <DialogHeader>
                          <DialogTitle className="text-white">Record Grade</DialogTitle>
                          <DialogDescription className="text-gray-400">Enter student grade information</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label className="text-white">Student LRN</Label>
                            <Input
                              value={gradeForm.lrn}
                              onChange={(e) => setGradeForm({ ...gradeForm, lrn: e.target.value })}
                              placeholder="LRN137000000000"
                              className="bg-white/5 border-white/10 text-white"
                            />
                          </div>
                          <div>
                            <Label className="text-white">Subject</Label>
                            <Input
                              value={gradeForm.subject}
                              onChange={(e) => setGradeForm({ ...gradeForm, subject: e.target.value })}
                              placeholder="Subject name"
                              className="bg-white/5 border-white/10 text-white"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label className="text-white">Grade</Label>
                              <Input
                                type="number"
                                value={gradeForm.grade}
                                onChange={(e) => setGradeForm({ ...gradeForm, grade: e.target.value })}
                                placeholder="0-100"
                                min="0"
                                max="100"
                                className="bg-white/5 border-white/10 text-white"
                              />
                            </div>
                            <div>
                              <Label className="text-white">School Year</Label>
                              <Input
                                value={gradeForm.school_year}
                                onChange={(e) => setGradeForm({ ...gradeForm, school_year: e.target.value })}
                                placeholder="2025-2026"
                                className="bg-white/5 border-white/10 text-white"
                              />
                            </div>
                          </div>
                          <div>
                            <Label className="text-white">Term</Label>
                            <Select value={gradeForm.term} onValueChange={(v) => setGradeForm({ ...gradeForm, term: v })}>
                              <SelectTrigger className="bg-white/5 border-white/10 text-white">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="1st Quarter">1st Quarter</SelectItem>
                                <SelectItem value="2nd Quarter">2nd Quarter</SelectItem>
                                <SelectItem value="3rd Quarter">3rd Quarter</SelectItem>
                                <SelectItem value="4th Quarter">4th Quarter</SelectItem>
                                <SelectItem value="Final">Final</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <Button onClick={handleCreateGrade} className="w-full bg-green-600 hover:bg-green-700 text-white">
                            Record Grade
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[500px]">
                    {grades.length === 0 ? (
                      <div className="text-center py-12 text-gray-500">
                        <GraduationCap className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                        <p>No grades recorded yet.</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {grades.map((grade: any) => (
                          <div key={grade.id} className="p-3 bg-white/5 rounded-lg border border-white/10">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <p className="font-semibold text-white">
                                  {grade.subject} - {grade.term}
                                </p>
                                <p className="text-sm text-gray-400">
                                  LRN: {grade.lrn} | Grade: <span className={grade.grade < 75 ? 'text-red-400' : 'text-green-400'}>{grade.grade}</span> | SY: {grade.school_year || grade.schoolYear}
                                </p>
                              </div>
                              {grade.grade < 75 && (
                                <Badge className="bg-red-600">Failed</Badge>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>
          )}

{/* Guidance Tab */}
          {availableTabs.includes('guidance') && (
            <TabsContent value="guidance">
              <Card className="glass-card bg-[#0a0e0d] border-[#1a472a]/30">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-white">Guidance Records</CardTitle>
                      <CardDescription className="text-gray-400">Track student behavioral incidents and counseling</CardDescription>
                    </div>
                    <Dialog open={guidanceDialogOpen} onOpenChange={(open) => {
                      setGuidanceDialogOpen(open);
                      if (!open) {
                        setGuidanceForm({ incident: '', students_involved: '', section: '', severity: 'low', status: 'pending', date: new Date().toISOString().split('T')[0] });
                      }
                    }}>
                      <DialogTrigger asChild>
                        <Button className="bg-green-600 hover:bg-green-700 gap-2 text-white">
                          <Plus className="h-4 w-4" />
                          Add Record
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-[#0f1311] border-[#1a472a]/30">
                        <DialogHeader>
                          <DialogTitle className="text-white">Create Guidance Record</DialogTitle>
                          <DialogDescription className="text-gray-400">Record behavioral incident or counseling session</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label className="text-white">Incident Description</Label>
                            <Textarea
                              value={guidanceForm.incident}
                              onChange={(e) => setGuidanceForm({ ...guidanceForm, incident: e.target.value })}
                              placeholder="Describe the incident or issue"
                              className="bg-white/5 border-white/10 text-white"
                            />
                          </div>
                          <div>
                            <Label className="text-white">Students Involved (LRNs, comma-separated)</Label>
                            <Input
                              value={guidanceForm.students_involved}
                              onChange={(e) => setGuidanceForm({ ...guidanceForm, students_involved: e.target.value })}
                              placeholder="LRN137000000001,LRN137000000002"
                              className="bg-white/5 border-white/10 text-white"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label className="text-white">Section</Label>
                              <Input
                                value={guidanceForm.section}
                                onChange={(e) => setGuidanceForm({ ...guidanceForm, section: e.target.value })}
                                placeholder="e.g., ICT 11-A"
                                className="bg-white/5 border-white/10 text-white"
                              />
                            </div>
                            <div>
                              <Label className="text-white">Severity</Label>
                              <Select value={guidanceForm.severity} onValueChange={(v) => setGuidanceForm({ ...guidanceForm, severity: v })}>
                                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="low">Low</SelectItem>
                                  <SelectItem value="medium">Medium</SelectItem>
                                  <SelectItem value="high">High</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <div>
                            <Label className="text-white">Date</Label>
                            <Input
                              type="date"
                              value={guidanceForm.date}
                              onChange={(e) => setGuidanceForm({ ...guidanceForm, date: e.target.value })}
                              className="bg-white/5 border-white/10 text-white"
                            />
                          </div>
                          <Button onClick={handleCreateGuidanceRecord} className="w-full bg-green-600 hover:bg-green-700 text-white">
                            Create Record
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[500px]">
                    {guidanceRecords.length === 0 ? (
                      <div className="text-center py-12 text-gray-500">
                        <AlertTriangle className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                        <p>No guidance records yet.</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {guidanceRecords.map((record: any) => (
                          <div key={record.id} className="p-3 bg-white/5 rounded-lg border border-white/10">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex gap-2">
                                <Badge className={
                                  record.severity === 'high' ? 'bg-red-600' :
                                  record.severity === 'medium' ? 'bg-yellow-600' :
                                  'bg-blue-600'
                                }>
                                  {record.severity?.toUpperCase()}
                                </Badge>
                                <Badge className={
                                  record.status === 'resolved' ? 'bg-green-600' :
                                  record.status === 'in_progress' ? 'bg-yellow-600' :
                                  'bg-gray-600'
                                }>
                                  {record.status}
                                </Badge>
                              </div>
                            </div>
                            <p className="text-white font-medium">{record.incident}</p>
                            <p className="text-sm text-gray-400">
                              Students: {record.students_involved || record.studentsInvolved} | Section: {record.section} | Date: {record.date}
                            </p>
                            <div className="flex gap-2 mt-2">
                              {record.status !== 'resolved' && (
                                <Button 
                                  size="sm"
                                  onClick={() => handleUpdateGuidanceRecord(record.id, 'resolved')}
                                  className="bg-green-600 hover:bg-green-700 text-white"
                                >
                                  Mark Resolved
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* Facilities Tab */}
          {availableTabs.includes('facilities') && (
            <TabsContent value="facilities">
              <Card className="glass-card bg-[#0a0e0d] border-[#1a472a]/30">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-white">Maintenance Issue Reporting</CardTitle>
                      <CardDescription className="text-gray-400">Track facility maintenance and repair requests</CardDescription>
                    </div>
                    <Dialog open={facilityDialogOpen} onOpenChange={(open) => {
                      setFacilityDialogOpen(open);
                      if (!open) {
                        setFacilityForm({
                          issue_category: 'electrical',
                          priority: 'low',
                          item_type: '',
                          specific_item: '',
                          location: '',
                          description: '',
                          condition: 'not_working',
                          reported_by: '',
                          date: new Date().toISOString().split('T')[0]
                        });
                      }
                    }}>
                      <DialogTrigger asChild>
                        <Button className="bg-green-600 hover:bg-green-700 gap-2 text-white">
                          <Plus className="h-4 w-4" />
                          Report Damage
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-[#0f1311] border-[#1a472a]/30 max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle className="text-white">Report Maintenance Issue</DialogTitle>
                          <DialogDescription className="text-gray-400">Record facility maintenance and repair needs</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label className="text-white">Issue Category</Label>
                            <Select value={facilityForm.issue_category} onValueChange={(v) => setFacilityForm({ ...facilityForm, issue_category: v })}>
                              <SelectTrigger className="bg-white/5 border-white/10 text-white">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="electrical">Electrical (Outlet, Switches, Bulbs)</SelectItem>
                                <SelectItem value="plumbing">Plumbing (Faucet, Toilet)</SelectItem>
                                <SelectItem value="mechanical">Mechanical</SelectItem>
                                <SelectItem value="structural">Structural</SelectItem>
                                <SelectItem value="others">Others (Lights, Windows, Chairs, Tables, Fan, TV)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label className="text-white">Priority Level</Label>
                            <Select value={facilityForm.priority} onValueChange={(v) => setFacilityForm({ ...facilityForm, priority: v })}>
                              <SelectTrigger className="bg-white/5 border-white/10 text-white">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="low">Low - Not urgent</SelectItem>
                                <SelectItem value="medium">Medium - Has some effect on the facility</SelectItem>
                                <SelectItem value="high">High - Urgent and needs immediate repair</SelectItem>
                                <SelectItem value="emergency">Emergency - Safety risk or dangerous issue</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label className="text-white">Specific Item</Label>
                            <Select value={facilityForm.specific_item} onValueChange={(v) => setFacilityForm({ ...facilityForm, specific_item: v })}>
                              <SelectTrigger className="bg-white/5 border-white/10 text-white">
                                <SelectValue placeholder="Select item" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="bulbs">Bulbs / Lights</SelectItem>
                                <SelectItem value="switches">Switches</SelectItem>
                                <SelectItem value="outlets">Outlets</SelectItem>
                                <SelectItem value="electric_fan">Electric Fan</SelectItem>
                                <SelectItem value="television">Television</SelectItem>
                                <SelectItem value="faucet">Faucet</SelectItem>
                                <SelectItem value="toilet">Toilet</SelectItem>
                                <SelectItem value="classroom_door">Classroom Door</SelectItem>
                                <SelectItem value="door_lock">Door Lock / Door Knob</SelectItem>
                                <SelectItem value="cubicle_door">Cubicle Door (CR)</SelectItem>
                                <SelectItem value="jalousie_windows">Jalousie Windows</SelectItem>
                                <SelectItem value="wall">Wall</SelectItem>
                                <SelectItem value="ceiling">Ceiling</SelectItem>
                                <SelectItem value="chairs">Chairs</SelectItem>
                                <SelectItem value="tables">Tables / Desks</SelectItem>
                                <SelectItem value="blackboard">Blackboard</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label className="text-white">Condition Status</Label>
                            <Select value={facilityForm.condition} onValueChange={(v) => setFacilityForm({ ...facilityForm, condition: v })}>
                              <SelectTrigger className="bg-white/5 border-white/10 text-white">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="not_working">Not Working</SelectItem>
                                <SelectItem value="missing">Missing</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label className="text-white">Location</Label>
                            <Input
                              value={facilityForm.location}
                              onChange={(e) => setFacilityForm({ ...facilityForm, location: e.target.value })}
                              placeholder="e.g., Classroom 101, Computer Lab"
                              className="bg-white/5 border-white/10 text-white"
                            />
                          </div>
                          <div>
                            <Label className="text-white">Description</Label>
                            <Textarea
                              value={facilityForm.description}
                              onChange={(e) => setFacilityForm({ ...facilityForm, description: e.target.value })}
                              placeholder="Additional details about the issue"
                              className="bg-white/5 border-white/10 text-white"
                            />
                          </div>
                          <div>
                            <Label className="text-white">Reported By</Label>
                            <Input
                              value={facilityForm.reported_by}
                              onChange={(e) => setFacilityForm({ ...facilityForm, reported_by: e.target.value })}
                              placeholder="Your name"
                              className="bg-white/5 border-white/10 text-white"
                            />
                          </div>
                          <div>
                            <Label className="text-white">Date</Label>
                            <Input
                              type="date"
                              value={facilityForm.date}
                              onChange={(e) => setFacilityForm({ ...facilityForm, date: e.target.value })}
                              className="bg-white/5 border-white/10 text-white"
                            />
                          </div>
                          <Button onClick={handleCreateFacilityRecord} className="w-full bg-green-600 hover:bg-green-700 text-white">
                            Report Issue
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[500px]">
                    {facilityRecords.length === 0 ? (
                      <div className="text-center py-12 text-gray-500">
                        <Wrench className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                        <p>No maintenance issues reported yet.</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {facilityRecords.map((record: any) => (
                          <div key={record.id} className="p-3 bg-white/5 rounded-lg border border-white/10">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <p className="text-white font-semibold">{record.specific_item || record.specificItem || record.facilityName}</p>
                                <Badge className={
                                  record.priority === 'emergency' ? 'bg-red-600' :
                                  record.priority === 'high' ? 'bg-orange-600' :
                                  record.priority === 'medium' ? 'bg-yellow-600' :
                                  'bg-blue-600'
                                }>
                                  {record.priority?.toUpperCase()}
                                </Badge>
                              </div>
                              <Badge className={
                                record.status === 'resolved' ? 'bg-green-600' :
                                record.status === 'in_progress' ? 'bg-yellow-600' :
                                'bg-red-600'
                              }>
                                {record.status || 'pending'}
                              </Badge>
                            </div>
                            <p className="text-xs text-gray-500 mb-1">
                              Category: {record.issue_category || record.issueCategory} | Condition: {record.condition}
                            </p>
                            <p className="text-sm text-gray-300">{record.description || record.damageDescription}</p>
                            <p className="text-sm text-gray-400 mt-1">
                              Location: {record.location || record.facilityName} | Reported by: {record.reported_by || record.reportedBy} | Date: {record.date}
                            </p>
                            <div className="flex gap-2 mt-2">
                              {record.status !== 'resolved' && (
                                <Button
                                  size="sm"
                                  onClick={() => handleUpdateFacilityRecord(record.id, 'resolved')}
                                  className="bg-green-600 hover:bg-green-700 text-white"
                                >
                                  Mark Resolved
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* Equipment Tab */}
          {availableTabs.includes('equipment') && (
            <TabsContent value="equipment">
              <Card className="glass-card bg-[#0a0e0d] border-[#1a472a]/30">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-white">Equipment Borrowing Records</CardTitle>
                      <CardDescription className="text-gray-400">
                        Track equipment loans{userCategory && ` - ${userCategory.toUpperCase()} Category`}
                      </CardDescription>
                    </div>
                    <Dialog open={equipmentDialogOpen} onOpenChange={(open) => {
                      setEquipmentDialogOpen(open);
                      if (!open) {
                        setEquipmentForm({ item_name: '', category: 'clinic', borrower_lrn: '', borrower_name: '', borrow_date: new Date().toISOString().split('T')[0], expected_return_date: '' });
                      }
                    }}>
                      <DialogTrigger asChild>
                        <Button className="bg-green-600 hover:bg-green-700 gap-2 text-white">
                          <Plus className="h-4 w-4" />
                          Record Borrow
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-[#0f1311] border-[#1a472a]/30">
                        <DialogHeader>
                          <DialogTitle className="text-white">Record Equipment Borrowing</DialogTitle>
                          <DialogDescription className="text-gray-400">Track borrowed equipment</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          {!userCategory && (
                            <div>
                              <Label className="text-white">Category</Label>
                              <Select value={equipmentForm.category} onValueChange={(v) => setEquipmentForm({ ...equipmentForm, category: v, item_name: '' })}>
                                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="clinic">CLINIC</SelectItem>
                                  <SelectItem value="comlab">COMLAB</SelectItem>
                                  <SelectItem value="science_lab">Science Lab</SelectItem>
                                  <SelectItem value="sps">SPS (Sports)</SelectItem>
                                  <SelectItem value="library">Library</SelectItem>
                                  <SelectItem value="music">Music</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          )}
                          <div>
                            <Label className="text-white">Item Name</Label>
                            <Select value={equipmentForm.item_name} onValueChange={(v) => setEquipmentForm({ ...equipmentForm, item_name: v })}>
                              <SelectTrigger className="bg-white/5 border-white/10 text-white">
                                <SelectValue placeholder="Select equipment item" />
                              </SelectTrigger>
                              <SelectContent>
                                {(userCategory || equipmentForm.category) === 'clinic' && (
                                  <>
                                    <SelectItem value="Hotcompress (1pc only)">Hotcompress (1pc only)</SelectItem>
                                    <SelectItem value="Coldcompress (2 pcs)">Coldcompress (2 pcs)</SelectItem>
                                    <SelectItem value="Emergency bag (1 Pc only)">Emergency bag (1 Pc only)</SelectItem>
                                    <SelectItem value="Bandages (6pcs)">Bandages (6pcs)</SelectItem>
                                    <SelectItem value="Nebulizer (1 pc only)">Nebulizer (1 pc only)</SelectItem>
                                  </>
                                )}
                                {(userCategory || equipmentForm.category) === 'comlab' && (
                                  <>
                                    <SelectItem value="Laptop Charger">Laptop Charger</SelectItem>
                                    <SelectItem value="Laptop">Laptop</SelectItem>
                                    <SelectItem value="Mouse">Mouse</SelectItem>
                                  </>
                                )}
                                {(userCategory || equipmentForm.category) === 'science_lab' && (
                                  <>
                                    <SelectItem value="Calculator">Calculator</SelectItem>
                                    <SelectItem value="Body System Model">Body System Model</SelectItem>
                                    <SelectItem value="Planets Model">Planets Model</SelectItem>
                                    <SelectItem value="Microscope">Microscope</SelectItem>
                                    <SelectItem value="Beaker">Beaker</SelectItem>
                                    <SelectItem value="Test tube">Test tube</SelectItem>
                                    <SelectItem value="Meter stick">Meter stick</SelectItem>
                                  </>
                                )}
                                {(userCategory || equipmentForm.category) === 'sps' && (
                                  <>
                                    <SelectItem value="Basketball ball">Basketball ball</SelectItem>
                                    <SelectItem value="Volleyball ball">Volleyball ball</SelectItem>
                                    <SelectItem value="Volleyball net">Volleyball net</SelectItem>
                                    <SelectItem value="Futsal ball">Futsal ball</SelectItem>
                                    <SelectItem value="Racket">Racket</SelectItem>
                                    <SelectItem value="Arnis stick">Arnis stick</SelectItem>
                                    <SelectItem value="Helmet">Helmet</SelectItem>
                                    <SelectItem value="Body armor/chest protector">Body armor/chest protector</SelectItem>
                                    <SelectItem value="Forearm guard">Forearm guard</SelectItem>
                                    <SelectItem value="Elbow pad">Elbow pad</SelectItem>
                                    <SelectItem value="Hand gloves">Hand gloves</SelectItem>
                                    <SelectItem value="Groin guard">Groin guard</SelectItem>
                                    <SelectItem value="Shin guard">Shin guard</SelectItem>
                                    <SelectItem value="22g soccer cones">22g soccer cones</SelectItem>
                                    <SelectItem value="Tennis ball">Tennis ball</SelectItem>
                                    <SelectItem value="Tennis racket">Tennis racket</SelectItem>
                                    <SelectItem value="Shuttlecock">Shuttlecock</SelectItem>
                                    <SelectItem value="Cone">Cone</SelectItem>
                                    <SelectItem value="Billiard cue">Billiard cue</SelectItem>
                                    <SelectItem value="Badminton net">Badminton net</SelectItem>
                                    <SelectItem value="Launcher">Launcher</SelectItem>
                                  </>
                                )}
                                {(userCategory || equipmentForm.category) === 'library' && (
                                  <>
                                    <SelectItem value="Books">Books</SelectItem>
                                    <SelectItem value="Magazines">Magazines</SelectItem>
                                  </>
                                )}
                                {(userCategory || equipmentForm.category) === 'music' && (
                                  <>
                                    <SelectItem value="Musical Instruments">Musical Instruments</SelectItem>
                                  </>
                                )}
                              </SelectContent>
                            </Select>
                            <p className="text-xs text-gray-500 mt-1">
                              {(userCategory || equipmentForm.category) === 'comlab' && 'Available only at 8am – 3pm'}
                            </p>
                          </div>
                          <div>
                            <Label className="text-white">Borrower LRN</Label>
                            <Input
                              value={equipmentForm.borrower_lrn}
                              onChange={(e) => setEquipmentForm({ ...equipmentForm, borrower_lrn: e.target.value })}
                              placeholder="LRN137000000000"
                              className="bg-white/5 border-white/10 text-white"
                            />
                          </div>
                          <div>
                            <Label className="text-white">Borrower Name</Label>
                            <Input
                              value={equipmentForm.borrower_name}
                              onChange={(e) => setEquipmentForm({ ...equipmentForm, borrower_name: e.target.value })}
                              placeholder="Student name"
                              className="bg-white/5 border-white/10 text-white"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label className="text-white">Borrow Date</Label>
                              <Input
                                type="date"
                                value={equipmentForm.borrow_date}
                                onChange={(e) => setEquipmentForm({ ...equipmentForm, borrow_date: e.target.value })}
                                className="bg-white/5 border-white/10 text-white"
                              />
                            </div>
                            <div>
                              <Label className="text-white">Expected Return</Label>
                              <Input
                                type="date"
                                value={equipmentForm.expected_return_date}
                                onChange={(e) => setEquipmentForm({ ...equipmentForm, expected_return_date: e.target.value })}
                                className="bg-white/5 border-white/10 text-white"
                              />
                            </div>
                          </div>
                          <Button onClick={handleCreateEquipmentRecord} className="w-full bg-green-600 hover:bg-green-700 text-white">
                            Record Borrowing
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[500px]">
                    {equipmentRecords.length === 0 ? (
                      <div className="text-center py-12 text-gray-500">
                        <Package className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                        <p>No equipment borrowing records yet.</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {equipmentRecords.map((record: any) => (
                          <div key={record.id} className="p-3 bg-white/5 rounded-lg border border-white/10">
                            <div className="flex items-center justify-between mb-2">
                              <p className="text-white font-semibold">{record.item_name || record.itemName}</p>
                              <Badge className={
                                record.status === 'returned' ? 'bg-green-600' :
                                record.status === 'borrowed' ? 'bg-yellow-600' :
                                'bg-gray-600'
                              }>
                                {record.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-400">
                              Borrower: {record.borrower_name || record.borrowerName} ({record.borrower_lrn || record.borrowerLrn})
                            </p>
                            <p className="text-sm text-gray-400">
                              Borrowed: {record.borrow_date || record.borrowDate} | Expected Return: {record.expected_return_date || record.expectedReturnDate}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">Category: {record.category}</p>
                            <div className="flex gap-2 mt-2">
                              {record.status === 'borrowed' && (
                                <Button 
                                  size="sm"
                                  onClick={() => handleUpdateEquipmentRecord(record.id, 'returned')}
                                  className="bg-green-600 hover:bg-green-700 text-white"
                                >
                                  Mark Returned
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>
          )}

{/* Clinic Tab */}
          {availableTabs.includes('clinic') && (
            <TabsContent value="clinic">
              <Card className="glass-card bg-[#0a0e0d] border-[#1a472a]/30">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-white">Clinic Visit Records</CardTitle>
                      <CardDescription className="text-gray-400">Track student clinic visits</CardDescription>
                    </div>
                    <Dialog open={clinicDialogOpen} onOpenChange={(open) => {
                      setClinicDialogOpen(open);
                      if (!open) {
                        setClinicForm({ student_lrn: '', student_name: '', complaint: '', diagnosis: '', treatment: '', date: new Date().toISOString().split('T')[0] });
                      }
                    }}>
                      <DialogTrigger asChild>
                        <Button className="bg-green-600 hover:bg-green-700 gap-2 text-white">
                          <Plus className="h-4 w-4" />
                          Record Visit
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-[#0f1311] border-[#1a472a]/30">
                        <DialogHeader>
                          <DialogTitle className="text-white">Record Clinic Visit</DialogTitle>
                          <DialogDescription className="text-gray-400">Document student clinic visit</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label className="text-white">Student LRN</Label>
                            <Input
                              value={clinicForm.student_lrn}
                              onChange={(e) => setClinicForm({ ...clinicForm, student_lrn: e.target.value })}
                              placeholder="LRN137000000000"
                              className="bg-white/5 border-white/10 text-white"
                            />
                          </div>
                          <div>
                            <Label className="text-white">Student Name</Label>
                            <Input
                              value={clinicForm.student_name}
                              onChange={(e) => setClinicForm({ ...clinicForm, student_name: e.target.value })}
                              placeholder="Student name"
                              className="bg-white/5 border-white/10 text-white"
                            />
                          </div>
                          <div>
                            <Label className="text-white">Complaint</Label>
                            <Textarea
                              value={clinicForm.complaint}
                              onChange={(e) => setClinicForm({ ...clinicForm, complaint: e.target.value })}
                              placeholder="Student's complaint"
                              className="bg-white/5 border-white/10 text-white"
                            />
                          </div>
                          <div>
                            <Label className="text-white">Diagnosis</Label>
                            <Input
                              value={clinicForm.diagnosis}
                              onChange={(e) => setClinicForm({ ...clinicForm, diagnosis: e.target.value })}
                              placeholder="Diagnosis"
                              className="bg-white/5 border-white/10 text-white"
                            />
                          </div>
                          <div>
                            <Label className="text-white">Treatment/Action Taken</Label>
                            <Textarea
                              value={clinicForm.treatment}
                              onChange={(e) => setClinicForm({ ...clinicForm, treatment: e.target.value })}
                              placeholder="Treatment provided"
                              className="bg-white/5 border-white/10 text-white"
                            />
                          </div>
                          <div>
                            <Label className="text-white">Date</Label>
                            <Input
                              type="date"
                              value={clinicForm.date}
                              onChange={(e) => setClinicForm({ ...clinicForm, date: e.target.value })}
                              className="bg-white/5 border-white/10 text-white"
                            />
                          </div>
                          <Button onClick={handleCreateClinicVisit} className="w-full bg-green-600 hover:bg-green-700 text-white">
                            Record Visit
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[500px]">
                    {clinicVisits.length === 0 ? (
                      <div className="text-center py-12 text-gray-500">
                        <Heart className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                        <p>No clinic visit records yet.</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {clinicVisits.map((visit: any) => (
                          <div key={visit.id} className="p-3 bg-white/5 rounded-lg border border-white/10">
                            <p className="text-white font-semibold">{visit.student_name || visit.studentName}</p>
                            <p className="text-sm text-gray-400">LRN: {visit.student_lrn || visit.studentLrn} | Date: {visit.date}</p>
                            <p className="text-sm text-gray-300 mt-2">
                              <span className="text-gray-500">Complaint:</span> {visit.complaint}
                            </p>
                            <p className="text-sm text-gray-300">
                              <span className="text-gray-500">Diagnosis:</span> {visit.diagnosis}
                            </p>
                            <p className="text-sm text-gray-300">
                              <span className="text-gray-500">Treatment:</span> {visit.treatment}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>
          )}

{/* Document Requests Tab */}
          {availableTabs.includes('documents') && (
            <TabsContent value="documents">
              <Card className="glass-card bg-[#0a0e0d] border-[#1a472a]/30">
                <CardHeader>
                  <CardTitle className="text-white">Document Requests</CardTitle>
                  <CardDescription className="text-gray-400">Manage student document requests</CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[500px]">
                    {documentRequests.length === 0 ? (
                      <div className="text-center py-12 text-gray-500">
                        <FileCheck className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                        <p>No document requests yet.</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {documentRequests.map((request: any) => (
                          <div key={request.id} className="p-3 bg-white/5 rounded-lg border border-white/10">
                            <div className="flex items-center justify-between mb-2">
                              <p className="text-white font-semibold">{request.document_type || request.documentType}</p>
                              <Badge className={
                                request.status === 'completed' ? 'bg-green-600' :
                                request.status === 'processing' ? 'bg-yellow-600' :
                                'bg-gray-600'
                              }>
                                {request.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-400">
                              Student: {request.student_name || request.studentName} | LRN: {request.student_lrn || request.studentLrn}
                            </p>
                            <p className="text-sm text-gray-400">
                              Purpose: {request.purpose}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              Requested: {new Date(request.created_at || request.createdAt || Date.now()).toLocaleDateString()}
                            </p>
                            <div className="flex gap-2 mt-2">
                              {request.status === 'pending' && (
                                <>
                                  <Button 
                                    size="sm"
                                    onClick={() => handleUpdateDocumentRequest(request.id, 'processing')}
                                    className="bg-yellow-600 hover:bg-yellow-700 text-white"
                                  >
                                    <Clock className="h-4 w-4 mr-2" />
                                    Processing
                                  </Button>
                                  <Button 
                                    size="sm"
                                    onClick={() => handleUpdateDocumentRequest(request.id, 'completed')}
                                    className="bg-green-600 hover:bg-green-700 text-white"
                                  >
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Complete
                                  </Button>
                                </>
                              )}
                              {request.status === 'processing' && (
                                <Button 
                                  size="sm"
                                  onClick={() => handleUpdateDocumentRequest(request.id, 'completed')}
                                  className="bg-green-600 hover:bg-green-700 text-white"
                                >
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Complete
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* Announcements Tab */}
          {availableTabs.includes('announcements') && (
            <TabsContent value="announcements">
              <Card className="glass-card bg-[#0a0e0d] border-[#1a472a]/30">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-white">Announcements</CardTitle>
                      <CardDescription className="text-gray-400">Post and manage school announcements</CardDescription>
                    </div>
                    <Dialog open={announcementDialogOpen} onOpenChange={(open) => {
                      setAnnouncementDialogOpen(open);
                      if (!open) {
                        setEditingAnnouncement(null);
                        setAnnouncementForm({ title: '', content: '', priority: 'normal', category: 'general' });
                      }
                    }}>
                      <DialogTrigger asChild>
                        <Button className="bg-green-600 hover:bg-green-700 gap-2 text-white">
                          <Plus className="h-4 w-4" />
                          Post Announcement
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-[#0f1311] border-[#1a472a]/30">
                        <DialogHeader>
                          <DialogTitle className="text-white">{editingAnnouncement ? 'Edit Announcement' : 'New Announcement'}</DialogTitle>
                          <DialogDescription className="text-gray-400">Share important updates</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label className="text-white">Title</Label>
                            <Input
                              value={announcementForm.title}
                              onChange={(e) => setAnnouncementForm({ ...announcementForm, title: e.target.value })}
                              placeholder="Announcement title"
                              className="bg-white/5 border-white/10 text-white"
                            />
                          </div>
                          <div>
                            <Label className="text-white">Content</Label>
                            <Textarea
                              value={announcementForm.content}
                              onChange={(e) => setAnnouncementForm({ ...announcementForm, content: e.target.value })}
                              placeholder="Announcement details"
                              className="bg-white/5 border-white/10 text-white"
                              rows={5}
                            />
                          </div>
                          <div>
                            <Label className="text-white">Priority</Label>
                            <Select value={announcementForm.priority} onValueChange={(v) => setAnnouncementForm({ ...announcementForm, priority: v })}>
                              <SelectTrigger className="bg-white/5 border-white/10 text-white">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="general">General</SelectItem>
                                <SelectItem value="normal">Normal</SelectItem>
                                <SelectItem value="important">Important</SelectItem>
                                <SelectItem value="urgent">Urgent</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <Button onClick={handleCreateAnnouncement} className="w-full bg-green-600 hover:bg-green-700 text-white">
                            {editingAnnouncement ? 'Update' : 'Post'} Announcement
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[500px]">
                    {announcements.length === 0 ? (
                      <div className="text-center py-12 text-gray-500">
                        <Megaphone className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                        <p>No announcements yet.</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {announcements.map((announcement) => (
                          <div key={announcement.id} className="p-3 bg-white/5 rounded-lg border border-white/10">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1">
                                <p className="text-white font-semibold">{announcement.title}</p>
                                <p className="text-sm text-gray-400">{new Date(announcement.date || announcement.created_at || Date.now()).toLocaleDateString()}</p>
                              </div>
                              <Badge className={
                                announcement.priority === 'urgent' ? 'bg-red-600' :
                                announcement.priority === 'important' ? 'bg-yellow-600' :
                                announcement.priority === 'event' ? 'bg-blue-600' :
                                'bg-gray-600'
                              }>
                                {announcement.priority?.toUpperCase()}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-300">{announcement.content}</p>
                            <div className="flex gap-2 mt-2">
                              <Button variant="ghost" size="sm" onClick={() => handleEditAnnouncement(announcement)} className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => handleDeleteAnnouncement(announcement.id)} className="text-red-400 hover:text-red-300 hover:bg-red-500/10">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* Resources Tab */}
          {availableTabs.includes('resources') && (
            <TabsContent value="resources">
              <Card className="glass-card bg-[#0a0e0d] border-[#1a472a]/30">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-white">Learning Resources</CardTitle>
                      <CardDescription className="text-gray-400">Share educational materials and links</CardDescription>
                    </div>
                    <Dialog open={resourceDialogOpen} onOpenChange={(open) => {
                      setResourceDialogOpen(open);
                      if (!open) {
                        setEditingResource(null);
                        setResourceForm({ title: '', description: '', category: '', file_url: '', link_url: '' });
                      }
                    }}>
                      <DialogTrigger asChild>
                        <Button className="bg-green-600 hover:bg-green-700 gap-2 text-white">
                          <Plus className="h-4 w-4" />
                          Add Resource
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-[#0f1311] border-[#1a472a]/30">
                        <DialogHeader>
                          <DialogTitle className="text-white">{editingResource ? 'Edit Resource' : 'Add Resource'}</DialogTitle>
                          <DialogDescription className="text-gray-400">Add learning materials</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label className="text-white">Resource Title</Label>
                            <Input
                              value={resourceForm.title}
                              onChange={(e) => setResourceForm({ ...resourceForm, title: e.target.value })}
                              placeholder="Resource title"
                              className="bg-white/5 border-white/10 text-white"
                            />
                          </div>
                          <div>
                            <Label className="text-white">Description</Label>
                            <Textarea
                              value={resourceForm.description}
                              onChange={(e) => setResourceForm({ ...resourceForm, description: e.target.value })}
                              placeholder="Brief description"
                              className="bg-white/5 border-white/10 text-white"
                            />
                          </div>
                          <div>
                            <Label className="text-white">Category</Label>
                            <Input
                              value={resourceForm.category}
                              onChange={(e) => setResourceForm({ ...resourceForm, category: e.target.value })}
                              placeholder="e.g., ICT, STEM, HUMSS"
                              className="bg-white/5 border-white/10 text-white"
                            />
                          </div>
                          <div>
                            <Label className="text-white">URL / Link</Label>
                            <Input
                              value={resourceForm.link_url}
                              onChange={(e) => setResourceForm({ ...resourceForm, link_url: e.target.value })}
                              placeholder="https://..."
                              className="bg-white/5 border-white/10 text-white"
                            />
                          </div>
                          <Button onClick={handleCreateResource} className="w-full bg-green-600 hover:bg-green-700 text-white">
                            {editingResource ? 'Update' : 'Add'} Resource
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[500px]">
                    {resources.length === 0 ? (
                      <div className="text-center py-12 text-gray-500">
                        <FolderOpen className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                        <p>No resources yet.</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {resources.map((resource) => (
                          <div key={resource.id} className="p-3 bg-white/5 rounded-lg border border-white/10">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <p className="text-white font-semibold">{resource.title || resource.name}</p>
                                {resource.category && (
                                  <Badge className="bg-blue-600 mt-1">{resource.category}</Badge>
                                )}
                                <p className="text-sm text-gray-400 mt-2">{resource.description}</p>
                                {(resource.link_url || resource.url) && (
                                  <a href={resource.link_url || resource.url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-400 hover:underline mt-1 block">
                                    {resource.link_url || resource.url}
                                  </a>
                                )}
                              </div>
                              <div className="flex gap-2">
                                <Button variant="ghost" size="sm" onClick={() => handleEditResource(resource)} className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10">
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => handleDeleteResource(resource.id)} className="text-red-400 hover:text-red-300 hover:bg-red-500/10">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* Gallery Tab */}
          {availableTabs.includes('gallery') && (
            <TabsContent value="gallery">
              <Card className="glass-card bg-[#0a0e0d] border-[#1a472a]/30">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-white">Gallery</CardTitle>
                      <CardDescription className="text-gray-400">Manage school photos and media</CardDescription>
                    </div>
                    <Dialog open={galleryDialogOpen} onOpenChange={(open) => {
                      setGalleryDialogOpen(open);
                      if (!open) {
                        setEditingGallery(null);
                        setGalleryForm({ image_url: '', caption: '' });
                      }
                    }}>
                      <DialogTrigger asChild>
                        <Button className="bg-green-600 hover:bg-green-700 gap-2 text-white">
                          <Plus className="h-4 w-4" />
                          Add Photo
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-[#0f1311] border-[#1a472a]/30">
                        <DialogHeader>
                          <DialogTitle className="text-white">{editingGallery ? 'Edit Photo' : 'Add Photo'}</DialogTitle>
                          <DialogDescription className="text-gray-400">Add to gallery</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label className="text-white">Image URL</Label>
                            <Input
                              value={galleryForm.image_url}
                              onChange={(e) => setGalleryForm({ ...galleryForm, image_url: e.target.value })}
                              placeholder="https://..."
                              className="bg-white/5 border-white/10 text-white"
                            />
                          </div>
                          <div>
                            <Label className="text-white">Caption / Title</Label>
                            <Input
                              value={galleryForm.caption}
                              onChange={(e) => setGalleryForm({ ...galleryForm, caption: e.target.value })}
                              placeholder="Photo caption"
                              className="bg-white/5 border-white/10 text-white"
                            />
                          </div>
                          <Button onClick={handleCreateGalleryItem} className="w-full bg-green-600 hover:bg-green-700 text-white">
                            {editingGallery ? 'Update' : 'Add'} Photo
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[500px]">
                    {gallery.length === 0 ? (
                      <div className="text-center py-12 text-gray-500">
                        <Image className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                        <p>No gallery items yet.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {gallery.map((item) => (
                          <div key={item.id} className="bg-white/5 rounded-lg overflow-hidden border border-white/10">
                            {(item.image_url || item.imageUrl) && (
                              <img src={item.image_url || item.imageUrl} alt={item.caption || item.title || "Gallery image"} className="w-full h-40 object-cover" />
                            )}
                            <div className="p-3">
                              <p className="text-white font-medium text-sm">{item.caption || item.title}</p>
                              {item.created_at && (
                                <p className="text-xs text-gray-400 mt-1">{new Date(item.created_at).toLocaleDateString()}</p>
                              )}
                              <div className="flex gap-2 mt-2">
                                <Button variant="ghost" size="sm" onClick={() => handleEditGalleryItem(item)} className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 p-2 h-8">
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => handleDeleteGalleryItem(item.id)} className="text-red-400 hover:text-red-300 hover:bg-red-500/10 p-2 h-8">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>
          )}

{/* Settings Tab */}
          {availableTabs.includes('settings') && (
            <TabsContent value="settings">
              <Card className="glass-card bg-[#0a0e0d] border-[#1a472a]/30">
                <CardHeader>
                  <CardTitle className="text-white">School Information Settings</CardTitle>
                  <CardDescription className="text-gray-400">Update school details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {schoolInfoForm && (
                    <>
                      <div>
                        <Label className="text-white">School Name</Label>
                        <Input
                          value={schoolInfoForm.name || ''}
                          onChange={(e) => setSchoolInfoForm({ ...schoolInfoForm, name: e.target.value })}
                          className="bg-white/5 border-white/10 text-white"
                        />
                      </div>
                      <div>
                        <Label className="text-white">Motto</Label>
                        <Input
                          value={schoolInfoForm.motto || ''}
                          onChange={(e) => setSchoolInfoForm({ ...schoolInfoForm, motto: e.target.value })}
                          className="bg-white/5 border-white/10 text-white"
                        />
                      </div>
                      <div>
                        <Label className="text-white">Vision</Label>
                        <Textarea
                          value={schoolInfoForm.vision || ''}
                          onChange={(e) => setSchoolInfoForm({ ...schoolInfoForm, vision: e.target.value })}
                          className="bg-white/5 border-white/10 text-white"
                        />
                      </div>
                      <div>
                        <Label className="text-white">Mission</Label>
                        <Textarea
                          value={schoolInfoForm.mission || ''}
                          onChange={(e) => setSchoolInfoForm({ ...schoolInfoForm, mission: e.target.value })}
                          className="bg-white/5 border-white/10 text-white"
                        />
                      </div>
                      <div>
                        <Label className="text-white">Address</Label>
                        <Input
                          value={schoolInfoForm.address || ''}
                          onChange={(e) => setSchoolInfoForm({ ...schoolInfoForm, address: e.target.value })}
                          className="bg-white/5 border-white/10 text-white"
                        />
                      </div>
                      <div>
                        <Label className="text-white">Email</Label>
                        <Input
                          type="email"
                          value={schoolInfoForm.email || ''}
                          onChange={(e) => setSchoolInfoForm({ ...schoolInfoForm, email: e.target.value })}
                          className="bg-white/5 border-white/10 text-white"
                        />
                      </div>
                      <div>
                        <Label className="text-white">Phone</Label>
                        <Input
                          value={schoolInfoForm.phone || ''}
                          onChange={(e) => setSchoolInfoForm({ ...schoolInfoForm, phone: e.target.value })}
                          className="bg-white/5 border-white/10 text-white"
                        />
                      </div>
                      <div>
                        <Label className="text-white">Facebook</Label>
                        <Input
                          value={schoolInfoForm.facebook || ''}
                          onChange={(e) => setSchoolInfoForm({ ...schoolInfoForm, facebook: e.target.value })}
                          className="bg-white/5 border-white/10 text-white"
                        />
                      </div>
                      <Button onClick={handleUpdateSchoolInfo} className="w-full bg-green-600 hover:bg-green-700 text-white">
                        Update School Information
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  </div>
  );
}