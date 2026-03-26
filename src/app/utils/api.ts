// Mock API base URL - can be replaced with your own backend API
const API_BASE = '/api';

// Mock data storage using localStorage
const STORAGE_KEY = 'linhs_portal_data';

// Initialize mock data in localStorage
const initializeStorage = () => {
  const existing = localStorage.getItem(STORAGE_KEY);
  if (!existing) {
    const initialData = {
      students: [],
      classes: [],
      announcements: [],
      resources: [],
      gallery: [],
      attendance: {},
      guidanceRecords: [],
      facilityRecords: [],
      equipmentRecords: [],
      clinicVisits: [],
      grades: [],
      documentRequests: [],
      clearanceRecords: {},
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialData));
  }
};

// Get all data from storage
const getStorage = () => {
  initializeStorage();
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : {};
};

// Update storage
const setStorage = (data: any) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

// Generate unique ID
const generateId = () => `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// Simulate API request delay
const delay = (ms: number = 300) => new Promise(resolve => setTimeout(resolve, ms));

export async function apiRequest(
  endpoint: string,
  options: RequestInit = {},
  requiresAuth: boolean = false,
  accessToken: string | null = null
) {
  await delay();

  // In a real application, you would make actual HTTP requests here
  // For now, we'll simulate the API with localStorage

  const method = options.method || 'GET';
  const url = `${API_BASE}${endpoint}`;

  // Simulate authentication check
  if (requiresAuth && !accessToken) {
    throw new Error('Authentication required');
  }

  // Mock response - you can replace this with actual fetch calls to your backend
  console.log(`Mock API: ${method} ${url}`, options);
  
  return { success: true, data: null };
}

// API methods
export const api = {
  // School Info
  getSchoolInfo: async () => {
    await delay();
    return {
      name: 'Lumbang Integrated National High School',
      motto: 'Excellence in Education',
      vision: 'We dream of Filipinos who passionately love their country and whose values and competencies enable them to realize their full potential and contribute meaningfully to building the nation.\n\nAs a learner-centered public institution, the Department of Education continuously improves itself to better serve its stakeholders.',
      mission: 'To protect and promote the right of every Filipino to quality, equitable, culture-based, and complete basic education where:\n\n• Students learn in a child-friendly, gender-sensitive, safe, and motivating environment.\n• Teachers facilitate learning and constantly nurture every learner.\n• Administrators and staff, as stewards of the institution, ensure an enabling and supportive environment for effective learning to happen.\n• Family, community, and other stakeholders are actively engaged and share responsibility for developing life-long learners.',
      coreValues: ['Maka-Diyos', 'Maka-tao', 'Makakalikasan', 'Makabansa'],
      address: 'Lumbang, Lipa City, Batangas',
      phone: '(043) 784 3462',
      email: '301495@deped.gov.ph',
      facebook: 'https://www.facebook.com/DepedTayoLINHS301495',
      principalName: 'Dr. Maria Santos',
    };
  },
  
  updateSchoolInfo: async (data: any, token: string) => {
    await delay();
    // In real app, update backend
    return { success: true };
  },

  // Stats
  getStats: async () => {
    await delay();
    const storage = getStorage();
    return {
      totalStudents: storage.students?.length || 0,
      totalClasses: storage.classes?.length || 0,
      totalAnnouncements: storage.announcements?.length || 0,
    };
  },

  // Strands
  getStrands: () => Promise.resolve([]),
  updateStrand: (id: string, data: any, token: string) => Promise.resolve({}),

  // Students
  getStudents: async () => {
    await delay();
    const storage = getStorage();
    return storage.students || [];
  },
  
  createStudent: async (data: any, token: string) => {
    await delay();
    const storage = getStorage();
    const newStudent = { ...data, id: generateId() };
    storage.students = [...(storage.students || []), newStudent];
    setStorage(storage);
    return newStudent;
  },
  
  updateStudent: async (id: string, data: any, token: string) => {
    await delay();
    const storage = getStorage();
    storage.students = (storage.students || []).map((s: any) => 
      s.id === id ? { ...s, ...data } : s
    );
    setStorage(storage);
    return { success: true };
  },
  
  deleteStudent: async (id: string, token: string) => {
    await delay();
    const storage = getStorage();
    storage.students = (storage.students || []).filter((s: any) => s.id !== id);
    setStorage(storage);
    return { success: true };
  },

  // Classes
  getClasses: async () => {
    await delay();
    const storage = getStorage();
    return storage.classes || [];
  },
  
  createClass: async (data: any, token: string) => {
    await delay();
    const storage = getStorage();
    const newClass = { ...data, id: generateId() };
    storage.classes = [...(storage.classes || []), newClass];
    setStorage(storage);
    return newClass;
  },
  
  updateClass: async (id: string, data: any, token: string) => {
    await delay();
    const storage = getStorage();
    storage.classes = (storage.classes || []).map((c: any) => 
      c.id === id ? { ...c, ...data } : c
    );
    setStorage(storage);
    return { success: true };
  },
  
  deleteClass: async (id: string, token: string) => {
    await delay();
    const storage = getStorage();
    storage.classes = (storage.classes || []).filter((c: any) => c.id !== id);
    setStorage(storage);
    return { success: true };
  },

  // Announcements
  getAnnouncements: async () => {
    await delay();
    const storage = getStorage();
    return storage.announcements || [];
  },
  
  createAnnouncement: async (data: any, token: string) => {
    await delay();
    const storage = getStorage();
    const newAnnouncement = { ...data, id: generateId(), createdAt: new Date().toISOString() };
    storage.announcements = [...(storage.announcements || []), newAnnouncement];
    setStorage(storage);
    return newAnnouncement;
  },
  
  updateAnnouncement: async (id: string, data: any, token: string) => {
    await delay();
    const storage = getStorage();
    storage.announcements = (storage.announcements || []).map((a: any) => 
      a.id === id ? { ...a, ...data } : a
    );
    setStorage(storage);
    return { success: true };
  },
  
  deleteAnnouncement: async (id: string, token: string) => {
    await delay();
    const storage = getStorage();
    storage.announcements = (storage.announcements || []).filter((a: any) => a.id !== id);
    setStorage(storage);
    return { success: true };
  },

  // Resources
  getResources: async () => {
    await delay();
    const storage = getStorage();
    return storage.resources || [];
  },
  
  createResource: async (data: any, token: string) => {
    await delay();
    const storage = getStorage();
    const newResource = { ...data, id: generateId() };
    storage.resources = [...(storage.resources || []), newResource];
    setStorage(storage);
    return newResource;
  },
  
  updateResource: async (id: string, data: any, token: string) => {
    await delay();
    const storage = getStorage();
    storage.resources = (storage.resources || []).map((r: any) => 
      r.id === id ? { ...r, ...data } : r
    );
    setStorage(storage);
    return { success: true };
  },
  
  deleteResource: async (id: string, token: string) => {
    await delay();
    const storage = getStorage();
    storage.resources = (storage.resources || []).filter((r: any) => r.id !== id);
    setStorage(storage);
    return { success: true };
  },

  // Gallery
  getGallery: async () => {
    await delay();
    const storage = getStorage();
    return storage.gallery || [];
  },
  
  createGalleryItem: async (data: any, token: string) => {
    await delay();
    const storage = getStorage();
    const newItem = { ...data, id: generateId() };
    storage.gallery = [...(storage.gallery || []), newItem];
    setStorage(storage);
    return newItem;
  },
  
  updateGalleryItem: async (id: string, data: any, token: string) => {
    await delay();
    const storage = getStorage();
    storage.gallery = (storage.gallery || []).map((g: any) => 
      g.id === id ? { ...g, ...data } : g
    );
    setStorage(storage);
    return { success: true };
  },
  
  deleteGalleryItem: async (id: string, token: string) => {
    await delay();
    const storage = getStorage();
    storage.gallery = (storage.gallery || []).filter((g: any) => g.id !== id);
    setStorage(storage);
    return { success: true };
  },

  // Clearance Check
  checkClearance: async (lrn: string) => {
    await delay();
    const storage = getStorage();
    const clearanceStatus = storage.clearanceRecords?.[lrn] || {
      status: 'pending',
      items: {
        library: Math.random() > 0.5,
        registrar: Math.random() > 0.5,
        guidance: Math.random() > 0.5,
        cashier: Math.random() > 0.5,
      }
    };
    return clearanceStatus;
  },

  // Attendance
  generateQRCodes: async (classId: string, students: string[], token: string) => {
    await delay();
    // Return mock QR codes
    return students.map(lrn => ({
      lrn,
      qrCode: `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==`
    }));
  },
  
  recordAttendance: async (lrn: string, classId: string, date: string, token: string) => {
    await delay();
    const storage = getStorage();
    if (!storage.attendance[classId]) {
      storage.attendance[classId] = {};
    }
    if (!storage.attendance[classId][date]) {
      storage.attendance[classId][date] = [];
    }
    storage.attendance[classId][date].push({ lrn, timestamp: new Date().toISOString() });
    setStorage(storage);
    return { success: true };
  },
  
  getAttendance: async (classId: string, token: string) => {
    await delay();
    const storage = getStorage();
    return storage.attendance[classId] || {};
  },

  // Guidance Records
  createGuidanceRecord: async (data: any, token: string) => {
    await delay();
    const storage = getStorage();
    const newRecord = { ...data, id: generateId(), createdAt: new Date().toISOString() };
    storage.guidanceRecords = [...(storage.guidanceRecords || []), newRecord];
    setStorage(storage);
    return newRecord;
  },
  
  getGuidanceRecords: async (token: string) => {
    await delay();
    const storage = getStorage();
    return storage.guidanceRecords || [];
  },
  
  updateGuidanceRecord: async (id: string, data: any, token: string) => {
    await delay();
    const storage = getStorage();
    storage.guidanceRecords = (storage.guidanceRecords || []).map((r: any) => 
      r.id === id ? { ...r, ...data } : r
    );
    setStorage(storage);
    return { success: true };
  },

  // Facilities Records
  createFacilityRecord: async (data: any, token: string) => {
    await delay();
    const storage = getStorage();
    const newRecord = { ...data, id: generateId(), createdAt: new Date().toISOString() };
    storage.facilityRecords = [...(storage.facilityRecords || []), newRecord];
    setStorage(storage);
    return newRecord;
  },
  
  getFacilityRecords: async (token: string) => {
    await delay();
    const storage = getStorage();
    return storage.facilityRecords || [];
  },
  
  updateFacilityRecord: async (id: string, data: any, token: string) => {
    await delay();
    const storage = getStorage();
    storage.facilityRecords = (storage.facilityRecords || []).map((r: any) => 
      r.id === id ? { ...r, ...data } : r
    );
    setStorage(storage);
    return { success: true };
  },

  // Equipment Records
  createEquipmentRecord: async (data: any, token: string) => {
    await delay();
    const storage = getStorage();
    const newRecord = { ...data, id: generateId(), createdAt: new Date().toISOString() };
    storage.equipmentRecords = [...(storage.equipmentRecords || []), newRecord];
    setStorage(storage);
    return newRecord;
  },
  
  getEquipmentRecords: async (token: string) => {
    await delay();
    const storage = getStorage();
    return storage.equipmentRecords || [];
  },
  
  updateEquipmentRecord: async (id: string, data: any, token: string) => {
    await delay();
    const storage = getStorage();
    storage.equipmentRecords = (storage.equipmentRecords || []).map((r: any) => 
      r.id === id ? { ...r, ...data } : r
    );
    setStorage(storage);
    return { success: true };
  },

  // Clinic Visits
  createClinicVisit: async (data: any, token: string) => {
    await delay();
    const storage = getStorage();
    const newVisit = { ...data, id: generateId(), createdAt: new Date().toISOString() };
    storage.clinicVisits = [...(storage.clinicVisits || []), newVisit];
    setStorage(storage);
    return newVisit;
  },
  
  getClinicVisits: async (token: string) => {
    await delay();
    const storage = getStorage();
    return storage.clinicVisits || [];
  },

  // Grades
  createGrade: async (data: any, token: string) => {
    await delay();
    const storage = getStorage();
    const newGrade = { ...data, id: generateId() };
    storage.grades = [...(storage.grades || []), newGrade];
    setStorage(storage);
    return newGrade;
  },
  
  getGrades: async (token: string) => {
    await delay();
    const storage = getStorage();
    return storage.grades || [];
  },
  
  getStudentGrades: async (lrn: string, token: string) => {
    await delay();
    const storage = getStorage();
    return (storage.grades || []).filter((g: any) => g.lrn === lrn);
  },

  // Document Requests
  createDocumentRequest: async (data: any) => {
    await delay();
    const storage = getStorage();
    const newRequest = { 
      ...data, 
      id: generateId(), 
      status: 'pending',
      createdAt: new Date().toISOString() 
    };
    storage.documentRequests = [...(storage.documentRequests || []), newRequest];
    setStorage(storage);
    return newRequest;
  },
  
  getDocumentRequests: async (token: string) => {
    await delay();
    const storage = getStorage();
    return storage.documentRequests || [];
  },
  
  updateDocumentRequest: async (id: string, data: any, token: string) => {
    await delay();
    const storage = getStorage();
    storage.documentRequests = (storage.documentRequests || []).map((r: any) => 
      r.id === id ? { ...r, ...data } : r
    );
    setStorage(storage);
    return { success: true };
  },
};

// Admin API methods (alias for authenticated operations)
export const adminApi = {
  // All admin operations use the same api methods
  ...api,
};
