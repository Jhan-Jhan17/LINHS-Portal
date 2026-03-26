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
  const { user, accessToken, loading: authLoading, logout } = useAuth();
  
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

  // Form states
  const [studentForm, setStudentForm] = useState({ name: '', gradeLevel: '', section: '', classId: '' });
  const [classForm, setClassForm] = useState({ name: '', gradeLevel: '', teacher: '', schedule: '' });
  const [announcementForm, setAnnouncementForm] = useState({ title: '', content: '', type: 'general', category: '', date: new Date().toISOString().split('T')[0] });
  const [resourceForm, setResourceForm] = useState({ name: '', description: '', category: '', url: '' });
  const [galleryForm, setGalleryForm] = useState({ title: '', description: '', imageUrl: '', category: '', date: new Date().toISOString().split('T')[0] });
  const [schoolInfoForm, setSchoolInfoForm] = useState<any>(null);
  const [selectedClass, setSelectedClass] = useState('');
  const [guidanceForm, setGuidanceForm] = useState({ incident: '', studentsInvolved: '', section: '', severity: 'low', status: 'pending', date: new Date().toISOString().split('T')[0] });
  const [facilityForm, setFacilityForm] = useState({
    issueCategory: 'electrical',
    priority: 'low',
    itemType: '',
    specificItem: '',
    location: '',
    description: '',
    condition: 'not_working',
    reportedBy: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [equipmentForm, setEquipmentForm] = useState({ itemName: '', category: 'clinic', borrowerLrn: '', borrowerName: '', borrowDate: new Date().toISOString().split('T')[0], expectedReturnDate: '' });
  const [clinicForm, setClinicForm] = useState({ studentLrn: '', studentName: '', complaint: '', diagnosis: '', treatment: '', date: new Date().toISOString().split('T')[0] });
  const [gradeForm, setGradeForm] = useState({ lrn: '', subject: '', grade: '', term: '1st Quarter', schoolYear: '2025-2026' });

  // Edit states
  const [editingStudent, setEditingStudent] = useState<any>(null);
  const [editingClass, setEditingClass] = useState<any>(null);
  const [editingAnnouncement, setEditingAnnouncement] = useState<any>(null);
  const [editingResource, setEditingResource] = useState<any>(null);
  const [editingGallery, setEditingGallery] = useState<any>(null);

  const userRole = user?.role;
  const userSection = user?.section;
  const userCategory = user?.category;

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/teacher/login');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user && accessToken) {
      fetchData();
    }
  }, [user, accessToken]);

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

      // Fetch based on role
      if (accessToken) {
        if (userRole === 'guidance' || userRole === 'adviser' || userRole === 'super_admin' || userRole === 'teacher') {
          promises.push(adminApi.getGuidanceRecords(accessToken));
        }
        if (userRole === 'facilities_admin' || userRole === 'adviser' || userRole === 'super_admin' || userRole === 'teacher') {
          promises.push(adminApi.getFacilityRecords(accessToken));
        }
        if (userRole === 'equipment_admin' || userRole === 'super_admin' || userRole === 'teacher') {
          promises.push(adminApi.getEquipmentRecords(accessToken));
        }
        if (userRole === 'nurse' || userRole === 'super_admin') {
          promises.push(adminApi.getClinicVisits(accessToken));
        }
        if (userRole === 'adviser' || userRole === 'super_admin' || userRole === 'teacher') {
          promises.push(adminApi.getGrades(accessToken));
        }
        if (userRole === 'registrar' || userRole === 'super_admin') {
          promises.push(adminApi.getDocumentRequests(accessToken));
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
      // Error is already logged by API utility, just show user-friendly message
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // Student Management
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
      setStudentDialogOpen(false);
      setStudentForm({ name: '', gradeLevel: '', section: '', classId: '' });
      fetchData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save student');
    }
  };

  const handleEditStudent = (student: any) => {
    setEditingStudent(student);
    setStudentForm({
      name: student.name,
      gradeLevel: student.gradeLevel,
      section: student.section,
      classId: student.classId || ''
    });
    setStudentDialogOpen(true);
  };

  const handleDeleteStudent = async (id: string) => {
    if (!accessToken || !confirm('Are you sure you want to delete this student?')) return;
    try {
      await adminApi.deleteStudent(id, accessToken);
      toast.success('Student deleted successfully');
      fetchData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete student');
    }
  };

  // Class Management
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
      setClassDialogOpen(false);
      setClassForm({ name: '', gradeLevel: '', teacher: '', schedule: '' });
      fetchData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save class');
    }
  };

  const handleEditClass = (cls: any) => {
    setEditingClass(cls);
    setClassForm({
      name: cls.name,
      gradeLevel: cls.gradeLevel,
      teacher: cls.teacher || '',
      schedule: cls.schedule || ''
    });
    setClassDialogOpen(true);
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

  // Announcement Management
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
      setAnnouncementDialogOpen(false);
      setAnnouncementForm({ title: '', content: '', type: 'general', category: '', date: new Date().toISOString().split('T')[0] });
      fetchData();
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
      date: announcement.date
    });
    setAnnouncementDialogOpen(true);
  };

  const handleDeleteAnnouncement = async (id: string) => {
    if (!accessToken || !confirm('Are you sure you want to delete this announcement?')) return;
    try {
      await adminApi.deleteAnnouncement(id, accessToken);
      toast.success('Announcement deleted successfully');
      fetchData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete announcement');
    }
  };

  // Resource Management
  const handleCreateResource = async () => {
    if (!accessToken) return;
    try {
      if (editingResource) {
        await adminApi.updateResource(editingResource.id, resourceForm, accessToken);
        toast.success('Resource updated successfully');
        setEditingResource(null);
      } else {
        await adminApi.createResource(resourceForm, accessToken);
        toast.success('Resource added successfully');
      }
      setResourceDialogOpen(false);
      setResourceForm({ name: '', description: '', category: '', url: '' });
      fetchData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save resource');
    }
  };

  const handleEditResource = (resource: any) => {
    setEditingResource(resource);
    setResourceForm({
      name: resource.name,
      description: resource.description || '',
      category: resource.category || '',
      url: resource.url || ''
    });
    setResourceDialogOpen(true);
  };

  const handleDeleteResource = async (id: string) => {
    if (!accessToken || !confirm('Are you sure you want to delete this resource?')) return;
    try {
      await adminApi.deleteResource(id, accessToken);
      toast.success('Resource deleted successfully');
      fetchData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete resource');
    }
  };

  // Gallery Management
  const handleCreateGalleryItem = async () => {
    if (!accessToken) return;
    try {
      if (editingGallery) {
        await adminApi.updateGalleryItem(editingGallery.id, galleryForm, accessToken);
        toast.success('Gallery item updated successfully');
        setEditingGallery(null);
      } else {
        await adminApi.createGalleryItem(galleryForm, accessToken);
        toast.success('Gallery item added successfully');
      }
      setGalleryDialogOpen(false);
      setGalleryForm({ title: '', description: '', imageUrl: '', category: '', date: new Date().toISOString().split('T')[0] });
      fetchData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save gallery item');
    }
  };

  const handleEditGalleryItem = (item: any) => {
    setEditingGallery(item);
    setGalleryForm({
      title: item.title,
      description: item.description || '',
      imageUrl: item.imageUrl || '',
      category: item.category || '',
      date: item.date
    });
    setGalleryDialogOpen(true);
  };

  const handleDeleteGalleryItem = async (id: string) => {
    if (!accessToken || !confirm('Are you sure you want to delete this gallery item?')) return;
    try {
      await adminApi.deleteGalleryItem(id, accessToken);
      toast.success('Gallery item deleted successfully');
      fetchData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete gallery item');
    }
  };

  // School Info Management
  const handleUpdateSchoolInfo = async () => {
    if (!accessToken) return;
    try {
      await adminApi.updateSchoolInfo(schoolInfoForm, accessToken);
      toast.success('School information updated successfully');
      setSchoolInfoDialogOpen(false);
      fetchData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update school information');
    }
  };

  // QR Code Generation for Attendance
  const handleGenerateQRCodes = async () => {
    if (!selectedClass || !accessToken) {
      toast.error('Please select a class');
      return;
    }

    try {
      // Get students in selected class
      const classStudents = students.filter((s: any) => 
        s.classId === selectedClass || s.section === selectedClass
      );

      if (classStudents.length === 0) {
        toast.error('No students found in this class');
        return;
      }

      const qrCodesList: { lrn: string; qrCode: string; name: string }[] = [];

      for (const student of classStudents) {
        if (student.lrn) {
          try {
            const qrCodeDataUrl = await QRCode.toDataURL(student.lrn);
            qrCodesList.push({
              lrn: student.lrn,
              qrCode: qrCodeDataUrl,
              name: student.firstName + ' ' + student.lastName
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
    if (!selectedClass || !accessToken) {
      toast.error('Please select a class first');
      return;
    }

    try {
      const today = new Date().toISOString().split('T')[0];
      await adminApi.recordAttendance(decodedText, selectedClass, today, accessToken);
      toast.success(`Attendance recorded for LRN: ${decodedText}`);
      
      // Fetch updated attendance
      const attendance = await adminApi.getAttendance(selectedClass, accessToken);
      setAttendanceRecords(attendance);
    } catch (error: any) {
      toast.error(error.message || 'Failed to record attendance');
    }
  };

  // Guidance Record Management
  const handleCreateGuidanceRecord = async () => {
    if (!accessToken) return;
    try {
      await adminApi.createGuidanceRecord(guidanceForm, accessToken);
      toast.success('Guidance record created successfully');
      setGuidanceDialogOpen(false);
      setGuidanceForm({ incident: '', studentsInvolved: '', section: '', severity: 'low', status: 'pending', date: new Date().toISOString().split('T')[0] });
      fetchData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to create guidance record');
    }
  };

  const handleUpdateGuidanceRecord = async (id: string, status: string) => {
    if (!accessToken) return;
    try {
      await adminApi.updateGuidanceRecord(id, { status }, accessToken);
      toast.success('Guidance record updated');
      fetchData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update record');
    }
  };

  // Facility Record Management
  const handleCreateFacilityRecord = async () => {
    if (!accessToken) return;
    try {
      await adminApi.createFacilityRecord(facilityForm, accessToken);
      toast.success('Maintenance issue reported successfully');
      setFacilityDialogOpen(false);
      setFacilityForm({
        issueCategory: 'electrical',
        priority: 'low',
        itemType: '',
        specificItem: '',
        location: '',
        description: '',
        condition: 'not_working',
        reportedBy: '',
        date: new Date().toISOString().split('T')[0]
      });
      setFacilityForm({ facilityName: '', damageDescription: '', studentsResponsible: '', section: '', estimatedCost: '', status: 'pending', date: new Date().toISOString().split('T')[0] });
      fetchData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to create facility record');
    }
  };

  const handleUpdateFacilityRecord = async (id: string, status: string) => {
    if (!accessToken) return;
    try {
      await adminApi.updateFacilityRecord(id, { status }, accessToken);
      toast.success('Facility record updated');
      fetchData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update record');
    }
  };

  // Equipment Record Management
  const handleCreateEquipmentRecord = async () => {
    if (!accessToken) return;
    try {
      await adminApi.createEquipmentRecord({ ...equipmentForm, category: userCategory || equipmentForm.category }, accessToken);
      toast.success('Equipment borrowing record created successfully');
      setEquipmentDialogOpen(false);
      setEquipmentForm({ itemName: '', category: 'clinic', borrowerLrn: '', borrowerName: '', borrowDate: new Date().toISOString().split('T')[0], expectedReturnDate: '' });
      fetchData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to create equipment record');
    }
  };

  const handleUpdateEquipmentRecord = async (id: string, status: string) => {
    if (!accessToken) return;
    try {
      await adminApi.updateEquipmentRecord(id, { status }, accessToken);
      toast.success('Equipment record updated');
      fetchData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update record');
    }
  };

  // Clinic Visit Management
  const handleCreateClinicVisit = async () => {
    if (!accessToken) return;
    try {
      await adminApi.createClinicVisit(clinicForm, accessToken);
      toast.success('Clinic visit recorded successfully');
      setClinicDialogOpen(false);
      setClinicForm({ studentLrn: '', studentName: '', complaint: '', diagnosis: '', treatment: '', date: new Date().toISOString().split('T')[0] });
      fetchData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to record clinic visit');
    }
  };

  // Grade Management
  const handleCreateGrade = async () => {
    if (!accessToken) return;
    try {
      await adminApi.createGrade(gradeForm, accessToken);
      toast.success('Grade recorded successfully');
      setGradeDialogOpen(false);
      setGradeForm({ lrn: '', subject: '', grade: '', term: '1st Quarter', schoolYear: '2025-2026' });
      fetchData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to record grade');
    }
  };

  // Document Request Management
  const handleUpdateDocumentRequest = async (id: string, status: string) => {
    if (!accessToken) return;
    try {
      await adminApi.updateDocumentRequest(id, { status }, accessToken);
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
    return roleColors[userRole] || 'bg-gray-600';
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
    return roleNames[userRole] || userRole;
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
              <Card className="glass-card">
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
                        setStudentForm({ name: '', gradeLevel: '', section: '', classId: '' });
                      }
                    }}>
                      <DialogTrigger asChild>
                        <Button className="bg-green-600 hover:bg-green-700 gap-2">
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
                            <Label className="text-white">Name</Label>
                            <Input
                              value={studentForm.name}
                              onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })}
                              placeholder="Student Name"
                              className="bg-white/5 border-white/10 text-white"
                            />
                          </div>
                          <div>
                            <Label className="text-white">Grade Level</Label>
                            <Select value={studentForm.gradeLevel} onValueChange={(v) => setStudentForm({ ...studentForm, gradeLevel: v })}>
                              <SelectTrigger className="bg-white/5 border-white/10 text-white">
                                <SelectValue placeholder="Select grade" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Grade 11">Grade 11</SelectItem>
                                <SelectItem value="Grade 12">Grade 12</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label className="text-white">Section</Label>
                            <Input
                              value={studentForm.section}
                              onChange={(e) => setStudentForm({ ...studentForm, section: e.target.value })}
                              placeholder="Section"
                              className="bg-white/5 border-white/10 text-white"
                            />
                          </div>
                          <div>
                            <Label className="text-white">Class (Optional)</Label>
                            <Select value={studentForm.classId} onValueChange={(v) => setStudentForm({ ...studentForm, classId: v })}>
                              <SelectTrigger className="bg-white/5 border-white/10 text-white">
                                <SelectValue placeholder="Select class" />
                              </SelectTrigger>
                              <SelectContent>
                                {classes.map((cls) => (
                                  <SelectItem key={cls.id} value={cls.id}>{cls.name}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <Button onClick={handleCreateStudent} className="w-full bg-green-600 hover:bg-green-700">
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
                              <p className="font-semibold text-white">{student.name || `${student.firstName} ${student.lastName}`}</p>
                              <p className="text-sm text-gray-400">
                                {student.lrn && `LRN: ${student.lrn} | `}
                                {student.gradeLevel || `Grade ${student.gradeLevel}`} - {student.section}
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
              <Card className="glass-card">
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
                        setClassForm({ name: '', gradeLevel: '', teacher: '', schedule: '' });
                      }
                    }}>
                      <DialogTrigger asChild>
                        <Button className="bg-green-600 hover:bg-green-700 gap-2">
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
                          <div>
                            <Label className="text-white">Grade Level</Label>
                            <Select value={classForm.gradeLevel} onValueChange={(v) => setClassForm({ ...classForm, gradeLevel: v })}>
                              <SelectTrigger className="bg-white/5 border-white/10 text-white">
                                <SelectValue placeholder="Select grade" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Grade 11">Grade 11</SelectItem>
                                <SelectItem value="Grade 12">Grade 12</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label className="text-white">Teacher (Optional)</Label>
                            <Input
                              value={classForm.teacher}
                              onChange={(e) => setClassForm({ ...classForm, teacher: e.target.value })}
                              placeholder="Teacher name"
                              className="bg-white/5 border-white/10 text-white"
                            />
                          </div>
                          <div>
                            <Label className="text-white">Schedule (Optional)</Label>
                            <Input
                              value={classForm.schedule}
                              onChange={(e) => setClassForm({ ...classForm, schedule: e.target.value })}
                              placeholder="e.g., Mon-Fri 8:00-10:00 AM"
                              className="bg-white/5 border-white/10 text-white"
                            />
                          </div>
                          <Button onClick={handleCreateClass} className="w-full bg-green-600 hover:bg-green-700">
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
                                {cls.gradeLevel}
                                {cls.teacher && ` | Teacher: ${cls.teacher}`}
                                {cls.schedule && ` | ${cls.schedule}`}
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
              <Card className="glass-card">
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
                          <SelectItem key={cls.id} value={cls.id}>{cls.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <Button 
                      onClick={handleGenerateQRCodes} 
                      disabled={!selectedClass}
                      className="bg-blue-600 hover:bg-blue-700 gap-2"
                    >
                      <QrCode className="h-4 w-4" />
                      Generate QR Codes
                    </Button>
                    
                    <Dialog open={scanDialogOpen} onOpenChange={setScanDialogOpen}>
                      <DialogTrigger asChild>
                        <Button 
                          disabled={!selectedClass}
                          className="bg-green-600 hover:bg-green-700 gap-2"
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
                          onScanSuccess={handleQRScan}
                          onScanError={(error) => toast.error(error)}
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
                            <div key={record.id} className="p-3 bg-white/5 rounded-lg border border-white/10">
                              <p className="text-white font-medium">LRN: {record.lrn}</p>
                              <p className="text-sm text-gray-400">
                                {new Date(record.timestamp).toLocaleString()} | Status: {record.status}
                              </p>
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
                      className="bg-green-600 hover:bg-green-700 gap-2"
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
              <Card className="glass-card">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-white">Grades Management</CardTitle>
                      <CardDescription className="text-gray-400">Record and manage student grades</CardDescription>
                    </div>
                    <Dialog open={gradeDialogOpen} onOpenChange={setGradeDialogOpen}>
                      <DialogTrigger asChild>
                        <Button className="bg-green-600 hover:bg-green-700 gap-2">
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
                          <div>
                            <Label className="text-white">School Year</Label>
                            <Input
                              value={gradeForm.schoolYear}
                              onChange={(e) => setGradeForm({ ...gradeForm, schoolYear: e.target.value })}
                              placeholder="2025-2026"
                              className="bg-white/5 border-white/10 text-white"
                            />
                          </div>
                          <Button onClick={handleCreateGrade} className="w-full bg-green-600 hover:bg-green-700">
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
                                  LRN: {grade.lrn} | Grade: <span className={grade.grade < 75 ? 'text-red-400' : 'text-green-400'}>{grade.grade}</span> | SY: {grade.schoolYear}
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
              <Card className="glass-card">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-white">Guidance Records</CardTitle>
                      <CardDescription className="text-gray-400">Track student behavioral incidents and counseling</CardDescription>
                    </div>
                    <Dialog open={guidanceDialogOpen} onOpenChange={setGuidanceDialogOpen}>
                      <DialogTrigger asChild>
                        <Button className="bg-green-600 hover:bg-green-700 gap-2">
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
                              value={guidanceForm.studentsInvolved}
                              onChange={(e) => setGuidanceForm({ ...guidanceForm, studentsInvolved: e.target.value })}
                              placeholder="LRN137000000001,LRN137000000002"
                              className="bg-white/5 border-white/10 text-white"
                            />
                          </div>
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
                          <div>
                            <Label className="text-white">Date</Label>
                            <Input
                              type="date"
                              value={guidanceForm.date}
                              onChange={(e) => setGuidanceForm({ ...guidanceForm, date: e.target.value })}
                              className="bg-white/5 border-white/10 text-white"
                            />
                          </div>
                          <Button onClick={handleCreateGuidanceRecord} className="w-full bg-green-600 hover:bg-green-700">
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
                            <p className="text-white font-medium">{record.incident}</p>
                            <p className="text-sm text-gray-400">
                              Students: {record.studentsInvolved} | Section: {record.section} | Date: {record.date}
                            </p>
                            <div className="flex gap-2 mt-2">
                              {record.status !== 'resolved' && (
                                <Button 
                                  size="sm"
                                  onClick={() => handleUpdateGuidanceRecord(record.id, 'resolved')}
                                  className="bg-green-600 hover:bg-green-700"
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
              <Card className="glass-card">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-white">Maintenance Issue Reporting</CardTitle>
                      <CardDescription className="text-gray-400">Track facility maintenance and repair requests</CardDescription>
                    </div>
                    <Dialog open={facilityDialogOpen} onOpenChange={setFacilityDialogOpen}>
                      <DialogTrigger asChild>
                        <Button className="bg-green-600 hover:bg-green-700 gap-2">
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
                            <Select value={facilityForm.issueCategory} onValueChange={(v) => setFacilityForm({ ...facilityForm, issueCategory: v })}>
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
                            <Select value={facilityForm.specificItem} onValueChange={(v) => setFacilityForm({ ...facilityForm, specificItem: v })}>
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
                              value={facilityForm.reportedBy}
                              onChange={(e) => setFacilityForm({ ...facilityForm, reportedBy: e.target.value })}
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
                          <Button onClick={handleCreateFacilityRecord} className="w-full bg-green-600 hover:bg-green-700">
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
                                <p className="text-white font-semibold">{record.specificItem || record.facilityName}</p>
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
                              Category: {record.issueCategory} | Condition: {record.condition}
                            </p>
                            <p className="text-sm text-gray-300">{record.description || record.damageDescription}</p>
                            <p className="text-sm text-gray-400 mt-1">
                              Location: {record.location || record.facilityName} | Reported by: {record.reportedBy} | Date: {record.date}
                            </p>
                            <div className="flex gap-2 mt-2">
                              {record.status !== 'resolved' && (
                                <Button
                                  size="sm"
                                  onClick={() => handleUpdateFacilityRecord(record.id, 'resolved')}
                                  className="bg-green-600 hover:bg-green-700"
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
              <Card className="glass-card">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-white">Equipment Borrowing Records</CardTitle>
                      <CardDescription className="text-gray-400">
                        Track equipment loans{userCategory && ` - ${userCategory.toUpperCase()} Category`}
                      </CardDescription>
                    </div>
                    <Dialog open={equipmentDialogOpen} onOpenChange={setEquipmentDialogOpen}>
                      <DialogTrigger asChild>
                        <Button className="bg-green-600 hover:bg-green-700 gap-2">
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
                              <Select value={equipmentForm.category} onValueChange={(v) => setEquipmentForm({ ...equipmentForm, category: v, itemName: '' })}>
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
                            <Select value={equipmentForm.itemName} onValueChange={(v) => setEquipmentForm({ ...equipmentForm, itemName: v })}>
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
                              value={equipmentForm.borrowerLrn}
                              onChange={(e) => setEquipmentForm({ ...equipmentForm, borrowerLrn: e.target.value })}
                              placeholder="LRN137000000000"
                              className="bg-white/5 border-white/10 text-white"
                            />
                          </div>
                          <div>
                            <Label className="text-white">Borrower Name</Label>
                            <Input
                              value={equipmentForm.borrowerName}
                              onChange={(e) => setEquipmentForm({ ...equipmentForm, borrowerName: e.target.value })}
                              placeholder="Student name"
                              className="bg-white/5 border-white/10 text-white"
                            />
                          </div>
                          <div>
                            <Label className="text-white">Borrow Date</Label>
                            <Input
                              type="date"
                              value={equipmentForm.borrowDate}
                              onChange={(e) => setEquipmentForm({ ...equipmentForm, borrowDate: e.target.value })}
                              className="bg-white/5 border-white/10 text-white"
                            />
                          </div>
                          <div>
                            <Label className="text-white">Expected Return Date</Label>
                            <Input
                              type="date"
                              value={equipmentForm.expectedReturnDate}
                              onChange={(e) => setEquipmentForm({ ...equipmentForm, expectedReturnDate: e.target.value })}
                              className="bg-white/5 border-white/10 text-white"
                            />
                          </div>
                          <Button onClick={handleCreateEquipmentRecord} className="w-full bg-green-600 hover:bg-green-700">
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
                              <p className="text-white font-semibold">{record.itemName}</p>
                              <Badge className={
                                record.status === 'returned' ? 'bg-green-600' :
                                record.status === 'borrowed' ? 'bg-yellow-600' :
                                'bg-gray-600'
                              }>
                                {record.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-400">
                              Borrower: {record.borrowerName} ({record.borrowerLrn})
                            </p>
                            <p className="text-sm text-gray-400">
                              Borrowed: {record.borrowDate} | Expected Return: {record.expectedReturnDate}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">Category: {record.category}</p>
                            <div className="flex gap-2 mt-2">
                              {record.status === 'borrowed' && (
                                <Button 
                                  size="sm"
                                  onClick={() => handleUpdateEquipmentRecord(record.id, 'returned')}
                                  className="bg-green-600 hover:bg-green-700"
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
              <Card className="glass-card">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-white">Clinic Visit Records</CardTitle>
                      <CardDescription className="text-gray-400">Track student clinic visits</CardDescription>
                    </div>
                    <Dialog open={clinicDialogOpen} onOpenChange={setClinicDialogOpen}>
                      <DialogTrigger asChild>
                        <Button className="bg-green-600 hover:bg-green-700 gap-2">
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
                              value={clinicForm.studentLrn}
                              onChange={(e) => setClinicForm({ ...clinicForm, studentLrn: e.target.value })}
                              placeholder="LRN137000000000"
                              className="bg-white/5 border-white/10 text-white"
                            />
                          </div>
                          <div>
                            <Label className="text-white">Student Name</Label>
                            <Input
                              value={clinicForm.studentName}
                              onChange={(e) => setClinicForm({ ...clinicForm, studentName: e.target.value })}
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
                          <Button onClick={handleCreateClinicVisit} className="w-full bg-green-600 hover:bg-green-700">
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
                        <p>No clinic visit records yet.</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {clinicVisits.map((visit: any) => (
                          <div key={visit.id} className="p-3 bg-white/5 rounded-lg border border-white/10">
                            <p className="text-white font-semibold">{visit.studentName}</p>
                            <p className="text-sm text-gray-400">LRN: {visit.studentLrn} | Date: {visit.date}</p>
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
              <Card className="glass-card">
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
                              <p className="text-white font-semibold">{request.documentType}</p>
                              <Badge className={
                                request.status === 'completed' ? 'bg-green-600' :
                                request.status === 'processing' ? 'bg-yellow-600' :
                                'bg-gray-600'
                              }>
                                {request.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-400">
                              Student: {request.studentName} | LRN: {request.studentLrn}
                            </p>
                            <p className="text-sm text-gray-400">
                              Purpose: {request.purpose}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              Requested: {new Date(request.createdAt).toLocaleDateString()}
                            </p>
                            <div className="flex gap-2 mt-2">
                              {request.status === 'pending' && (
                                <>
                                  <Button 
                                    size="sm"
                                    onClick={() => handleUpdateDocumentRequest(request.id, 'processing')}
                                    className="bg-yellow-600 hover:bg-yellow-700"
                                  >
                                    <Clock className="h-4 w-4 mr-2" />
                                    Processing
                                  </Button>
                                  <Button 
                                    size="sm"
                                    onClick={() => handleUpdateDocumentRequest(request.id, 'completed')}
                                    className="bg-green-600 hover:bg-green-700"
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
                                  className="bg-green-600 hover:bg-green-700"
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
              <Card className="glass-card">
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
                        setAnnouncementForm({ title: '', content: '', type: 'general', category: '', date: new Date().toISOString().split('T')[0] });
                      }
                    }}>
                      <DialogTrigger asChild>
                        <Button className="bg-green-600 hover:bg-green-700 gap-2">
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
                            <Label className="text-white">Type</Label>
                            <Select value={announcementForm.type} onValueChange={(v) => setAnnouncementForm({ ...announcementForm, type: v })}>
                              <SelectTrigger className="bg-white/5 border-white/10 text-white">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="general">General</SelectItem>
                                <SelectItem value="event">Event</SelectItem>
                                <SelectItem value="important">Important</SelectItem>
                                <SelectItem value="urgent">Urgent</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label className="text-white">Date</Label>
                            <Input
                              type="date"
                              value={announcementForm.date}
                              onChange={(e) => setAnnouncementForm({ ...announcementForm, date: e.target.value })}
                              className="bg-white/5 border-white/10 text-white"
                            />
                          </div>
                          <Button onClick={handleCreateAnnouncement} className="w-full bg-green-600 hover:bg-green-700">
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
                                <p className="text-sm text-gray-400">{announcement.date}</p>
                              </div>
                              <Badge className={
                                announcement.type === 'urgent' ? 'bg-red-600' :
                                announcement.type === 'important' ? 'bg-yellow-600' :
                                announcement.type === 'event' ? 'bg-blue-600' :
                                'bg-gray-600'
                              }>
                                {announcement.type}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-300">{announcement.content}</p>
                            <div className="flex gap-2 mt-2">
                              <Button variant="ghost" size="sm" onClick={() => handleEditAnnouncement(announcement)} className="text-blue-400">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => handleDeleteAnnouncement(announcement.id)} className="text-red-400">
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
              <Card className="glass-card">
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
                        setResourceForm({ name: '', description: '', category: '', url: '' });
                      }
                    }}>
                      <DialogTrigger asChild>
                        <Button className="bg-green-600 hover:bg-green-700 gap-2">
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
                            <Label className="text-white">Resource Name</Label>
                            <Input
                              value={resourceForm.name}
                              onChange={(e) => setResourceForm({ ...resourceForm, name: e.target.value })}
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
                            <Label className="text-white">URL</Label>
                            <Input
                              value={resourceForm.url}
                              onChange={(e) => setResourceForm({ ...resourceForm, url: e.target.value })}
                              placeholder="https://..."
                              className="bg-white/5 border-white/10 text-white"
                            />
                          </div>
                          <Button onClick={handleCreateResource} className="w-full bg-green-600 hover:bg-green-700">
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
                                <p className="text-white font-semibold">{resource.name}</p>
                                {resource.category && (
                                  <Badge className="bg-blue-600 mt-1">{resource.category}</Badge>
                                )}
                                <p className="text-sm text-gray-400 mt-2">{resource.description}</p>
                                {resource.url && (
                                  <a href={resource.url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-400 hover:underline mt-1 block">
                                    {resource.url}
                                  </a>
                                )}
                              </div>
                              <div className="flex gap-2">
                                <Button variant="ghost" size="sm" onClick={() => handleEditResource(resource)} className="text-blue-400">
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => handleDeleteResource(resource.id)} className="text-red-400">
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
              <Card className="glass-card">
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
                        setGalleryForm({ title: '', description: '', imageUrl: '', category: '', date: new Date().toISOString().split('T')[0] });
                      }
                    }}>
                      <DialogTrigger asChild>
                        <Button className="bg-green-600 hover:bg-green-700 gap-2">
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
                            <Label className="text-white">Title</Label>
                            <Input
                              value={galleryForm.title}
                              onChange={(e) => setGalleryForm({ ...galleryForm, title: e.target.value })}
                              placeholder="Photo title"
                              className="bg-white/5 border-white/10 text-white"
                            />
                          </div>
                          <div>
                            <Label className="text-white">Description</Label>
                            <Textarea
                              value={galleryForm.description}
                              onChange={(e) => setGalleryForm({ ...galleryForm, description: e.target.value })}
                              placeholder="Photo description"
                              className="bg-white/5 border-white/10 text-white"
                            />
                          </div>
                          <div>
                            <Label className="text-white">Image URL</Label>
                            <Input
                              value={galleryForm.imageUrl}
                              onChange={(e) => setGalleryForm({ ...galleryForm, imageUrl: e.target.value })}
                              placeholder="https://..."
                              className="bg-white/5 border-white/10 text-white"
                            />
                          </div>
                          <div>
                            <Label className="text-white">Category</Label>
                            <Input
                              value={galleryForm.category}
                              onChange={(e) => setGalleryForm({ ...galleryForm, category: e.target.value })}
                              placeholder="e.g., Events, Activities"
                              className="bg-white/5 border-white/10 text-white"
                            />
                          </div>
                          <div>
                            <Label className="text-white">Date</Label>
                            <Input
                              type="date"
                              value={galleryForm.date}
                              onChange={(e) => setGalleryForm({ ...galleryForm, date: e.target.value })}
                              className="bg-white/5 border-white/10 text-white"
                            />
                          </div>
                          <Button onClick={handleCreateGalleryItem} className="w-full bg-green-600 hover:bg-green-700">
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
                            {item.imageUrl && (
                              <img src={item.imageUrl} alt={item.title} className="w-full h-40 object-cover" />
                            )}
                            <div className="p-3">
                              <p className="text-white font-medium text-sm">{item.title}</p>
                              <p className="text-xs text-gray-400 mt-1">{item.date}</p>
                              <div className="flex gap-2 mt-2">
                                <Button variant="ghost" size="sm" onClick={() => handleEditGalleryItem(item)} className="text-blue-400">
                                  <Edit className="h-3 w-3" />
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => handleDeleteGalleryItem(item.id)} className="text-red-400">
                                  <Trash2 className="h-3 w-3" />
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
              <Card className="glass-card">
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
                      <Button onClick={handleUpdateSchoolInfo} className="w-full bg-green-600 hover:bg-green-700">
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
