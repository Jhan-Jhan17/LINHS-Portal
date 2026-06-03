/// <reference types="vite/client" />

// Points to your Flask backend. Adjust in your .env if needed.
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

/**
 * Core utility for making HTTP requests to the Flask backend
 */
export async function apiRequest(
  endpoint: string,
  options: RequestInit = {}
) {
  // Ensure the endpoint starts with a slash
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${API_BASE}${cleanEndpoint}`;
  
  const headers = new Headers(options.headers);
  
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      // MANDATORY for Flask-Login to recognize the user session
      credentials: 'include', 
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || data.message || 'API request failed');
    }

    return data;
  } catch (error) {
    console.error(`API Error on ${options.method || 'GET'} ${url}:`, error);
    throw error;
  }
}

export const api = {
  // ==========================================
  // School Info
  // ==========================================
  getSchoolInfo: async () => {
    const response = await apiRequest('/school-info');
    return response.school_info || response; 
  },
  
  updateSchoolInfo: async (data: any) => {
    return apiRequest('/school-info', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // ==========================================
  // Stats
  // ==========================================
  getStats: async () => {
    const response = await apiRequest('/stats');
    return response;
  },

  // ==========================================
  // Students
  // ==========================================
  getStudents: async () => {
    const response = await apiRequest('/students');
    return response.students || [];
  },
  
  createStudent: async (data: any) => {
    return apiRequest('/students', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  
  updateStudent: async (id: string, data: any) => {
    return apiRequest(`/students/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  
  deleteStudent: async (id: string) => {
    return apiRequest(`/students/${id}`, {
      method: 'DELETE',
    });
  },

  // ==========================================
  // Classes
  // ==========================================
  getClasses: async () => {
    const response = await apiRequest('/classes');
    return response.classes || [];
  },
  
  createClass: async (data: any) => {
    return apiRequest('/classes', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  
  updateClass: async (id: string, data: any) => {
    return apiRequest(`/classes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  
  deleteClass: async (id: string) => {
    return apiRequest(`/classes/${id}`, {
      method: 'DELETE',
    });
  },

  // ==========================================
  // Announcements
  // ==========================================
  getAnnouncements: async () => {
    const response = await apiRequest('/announcements');
    return response.announcements || [];
  },
  
  createAnnouncement: async (data: any) => {
    return apiRequest('/announcements', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  
  updateAnnouncement: async (id: string, data: any) => {
    return apiRequest(`/announcements/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  
  deleteAnnouncement: async (id: string) => {
    return apiRequest(`/announcements/${id}`, {
      method: 'DELETE',
    });
  },

  // ==========================================
  // Resources
  // ==========================================
  getResources: async () => {
    const response = await apiRequest('/resources');
    return response.resources || [];
  },
  
  createResource: async (data: any) => {
    return apiRequest('/resources', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  
  updateResource: async (id: string, data: any) => {
    return apiRequest(`/resources/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  
  deleteResource: async (id: string) => {
    return apiRequest(`/resources/${id}`, {
      method: 'DELETE',
    });
  },

  // ==========================================
  // Gallery
  // ==========================================
  getGallery: async () => {
    const response = await apiRequest('/gallery');
    return response.gallery || [];
  },
  
  createGalleryItem: async (data: any) => {
    return apiRequest('/gallery', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  
  updateGalleryItem: async (id: string, data: any) => {
    return apiRequest(`/gallery/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  
  deleteGalleryItem: async (id: string) => {
    return apiRequest(`/gallery/${id}`, {
      method: 'DELETE',
    });
  },

  // ==========================================
  // Attendance & QR
  // ==========================================
  generateQRCodes: async (classId: string, students: string[]) => {
    return apiRequest('/attendance-qr', {
      method: 'POST',
      body: JSON.stringify({ classId, students }),
    });
  },
  
  recordAttendance: async (lrn: string, classId: string, date: string) => {
    return apiRequest('/attendance', {
      method: 'POST',
      body: JSON.stringify({ student_lrn: lrn, class_id: classId, date, status: 'present' }),
    });
  },
  
  getAttendance: async (classId: string) => {
    const response = await apiRequest(`/attendance?class_id=${classId}`);
    return response.attendance || [];
  },

  // ==========================================
  // Clearance
  // ==========================================
  checkClearance: async (lrn: string) => {
    const response = await apiRequest(`/clearance?lrn=${lrn}`);
    return response.clearance || null;
  },

  // ==========================================
  // Guidance, Grades, Documents
  // ==========================================
  getGuidanceRecords: async () => {
    const response = await apiRequest('/guidance');
    return response.guidance || [];
  },

  createGuidanceRecord: async (data: any) => {
    return apiRequest('/guidance', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateGuidanceRecord: async (id: string, data: any) => {
    return apiRequest(`/guidance/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  getGrades: async () => {
    const response = await apiRequest('/grades');
    return response.grades || [];
  },

  getStudentGrades: async (lrn: string) => {
    const response = await apiRequest(`/grades?lrn=${lrn}`);
    return response.grades || [];
  },

  createGrade: async (data: any) => {
    return apiRequest('/grades', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getDocumentRequests: async () => {
    const response = await apiRequest('/documents');
    return response.documents || [];
  },

  createDocumentRequest: async (data: any) => {
    return apiRequest('/documents', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateDocumentRequest: async (id: string, data: any) => {
    return apiRequest(`/documents/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // ==========================================
  // Facilities (Maintenance)
  // ==========================================
  getFacilityRecords: async () => {
    const response = await apiRequest('/facilities');
    return response.facilities || [];
  },

  createFacilityRecord: async (data: any) => {
    return apiRequest('/facilities', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateFacilityRecord: async (id: string, status: string) => {
    return apiRequest(`/facilities/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  },

  // ==========================================
  // Equipment Borrowing
  // ==========================================
  getEquipmentRecords: async () => {
    const response = await apiRequest('/equipment');
    return response.equipment || [];
  },

  createEquipmentRecord: async (data: any) => {
    return apiRequest('/equipment', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateEquipmentRecord: async (id: string, status: string) => {
    return apiRequest(`/equipment/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  },

  // ==========================================
  // Clinic
  // ==========================================
  getClinicVisits: async () => {
    const response = await apiRequest('/clinic');
    return response.clinic || [];
  },

  createClinicVisit: async (data: any) => {
    return apiRequest('/clinic', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
};

export const adminApi = {
  ...api,
};