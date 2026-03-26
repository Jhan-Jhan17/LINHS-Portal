import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js@2";
import * as kv from "./kv_store.tsx";
import QRCode from "npm:qrcode@1.5.4";

const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Initialize Supabase client for auth
const getSupabaseAdmin = () => {
  return createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  );
};

// Helper to verify teacher authentication
const verifyAuth = async (request: Request) => {
  const accessToken = request.headers.get('Authorization')?.split(' ')[1];
  if (!accessToken) {
    return null;
  }
  
  const supabase = getSupabaseAdmin();
  const { data: { user }, error } = await supabase.auth.getUser(accessToken);
  
  if (error || !user) {
    return null;
  }
  
  return user;
};

// Initialize default data
const initializeDefaultData = async () => {
  // Create default users with different roles
  const supabase = getSupabaseAdmin();
  
  const defaultUsers = [
    // Super Admins
    { email: 'admin@linhs.edu.ph', password: 'admin123', name: 'Super Administrator', role: 'super_admin' },
    
    // Teachers/Advisers
    { email: 'teacher@linhs.edu.ph', password: 'teacher123', name: 'Teacher Demo', role: 'teacher' },
    { email: 'adviser1@linhs.edu.ph', password: 'adviser123', name: 'Adviser ICT 11-A', role: 'adviser', section: 'ICT 11-A' },
    { email: 'adviser2@linhs.edu.ph', password: 'adviser123', name: 'Adviser STEM 11-A', role: 'adviser', section: 'STEM 11-A' },
    { email: 'adviser3@linhs.edu.ph', password: 'adviser123', name: 'Adviser HUMSS 11-A', role: 'adviser', section: 'HUMSS 11-A' },
    
    // Guidance Counselor
    { email: 'guidance@linhs.edu.ph', password: 'guidance123', name: 'Guidance Counselor', role: 'guidance' },
    
    // School Nurse
    { email: 'nurse@linhs.edu.ph', password: 'nurse123', name: 'School Nurse', role: 'nurse' },
    
    // Registrar
    { email: 'registrar@linhs.edu.ph', password: 'registrar123', name: 'School Registrar', role: 'registrar' },
    
    // Equipment Admins (5 categories)
    { email: 'lab.admin@linhs.edu.ph', password: 'equipment123', name: 'Lab Equipment Admin', role: 'equipment_admin', category: 'laboratory' },
    { email: 'sports.admin@linhs.edu.ph', password: 'equipment123', name: 'Sports Equipment Admin', role: 'equipment_admin', category: 'sports' },
    { email: 'library.admin@linhs.edu.ph', password: 'equipment123', name: 'Library Equipment Admin', role: 'equipment_admin', category: 'library' },
    { email: 'ict.admin@linhs.edu.ph', password: 'equipment123', name: 'ICT Equipment Admin', role: 'equipment_admin', category: 'ict' },
    { email: 'music.admin@linhs.edu.ph', password: 'equipment123', name: 'Music Equipment Admin', role: 'equipment_admin', category: 'music' },
    
    // Facilities Admin
    { email: 'facilities@linhs.edu.ph', password: 'facilities123', name: 'Facilities Admin', role: 'facilities_admin' },
  ];

  // Create users if they don't exist
  for (const user of defaultUsers) {
    try {
      const { data: existingUsers } = await supabase.auth.admin.listUsers();
      const userExists = existingUsers?.users?.some(u => u.email === user.email);
      
      if (!userExists) {
        const { data, error } = await supabase.auth.admin.createUser({
          email: user.email,
          password: user.password,
          user_metadata: { 
            name: user.name, 
            role: user.role,
            section: user.section || null,
            category: user.category || null
          },
          email_confirm: true
        });
        if (data) {
          console.log(`Created user: ${user.email} (${user.role})`);
        }
      }
    } catch (error) {
      console.log(`User might already exist: ${user.email}`);
    }
  }

  // Initialize test students with LRN codes
  const existingStudents = await kv.getByPrefix('student_lrn_');
  if (existingStudents.length === 0) {
    const sections = ['ICT 11-A', 'ICT 11-B', 'STEM 11-A', 'STEM 11-B', 'HUMSS 11-A', 'HUMSS 11-B'];
    const strands = ['ICT', 'STEM', 'HUMSS'];
    const firstNames = ['Juan', 'Maria', 'Jose', 'Ana', 'Pedro', 'Carmen', 'Luis', 'Sofia', 'Miguel', 'Isabel'];
    const lastNames = ['Cruz', 'Reyes', 'Santos', 'Garcia', 'Flores', 'Mendoza', 'Torres', 'Ramos', 'Gonzales', 'Rodriguez'];
    
    let studentCount = 0;
    
    // Create 100 test students (you can increase this to 1500)
    for (let i = 0; i < 100; i++) {
      const lrn = `LRN${(137000000000 + i).toString()}`; // LRN format: LRN137000000000
      const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
      const section = sections[Math.floor(i / (100 / sections.length))];
      const strand = section.split(' ')[0];
      const gradeLevel = section.includes('11') ? 11 : 12;
      
      const student = {
        lrn,
        firstName,
        lastName,
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@student.linhs.edu.ph`,
        password: `student${i + 1000}`, // Simple password: student1000, student1001, etc.
        section,
        strand,
        gradeLevel,
        contactNumber: `09${Math.floor(Math.random() * 1000000000).toString().padStart(9, '0')}`,
        guardianName: `Guardian of ${firstName} ${lastName}`,
        guardianContact: `09${Math.floor(Math.random() * 1000000000).toString().padStart(9, '0')}`,
        address: `Lumbang, Laguna`,
        enrollmentStatus: 'active',
        createdAt: new Date().toISOString()
      };
      
      await kv.set(`student_lrn_${lrn}`, student);
      studentCount++;
    }
    
    console.log(`Created ${studentCount} test students with LRN codes`);
  }

  const schoolInfo = await kv.get('school_info');
  if (!schoolInfo) {
    await kv.set('school_info', {
      name: 'Lumbang Integrated National High School',
      motto: 'Excellence in Education',
      vision: 'A center of excellence providing quality education for all students.',
      mission: 'To develop well-rounded individuals equipped with knowledge, skills, and values.',
      address: 'Lumbang, Philippines',
      email: 'linhs@example.com',
      phone: '+63 123 456 7890',
      facebook: 'https://facebook.com/lumbangNHS',
      totalStudents: 0,
      totalTeachers: 0,
    });
  }

  const strands = await kv.get('strands');
  if (!strands) {
    await kv.set('strands', [
      {
        id: 'ict',
        name: 'Information and Communications Technology (ICT)',
        description: 'Prepares students for careers in computer science, programming, and technology.',
        objectives: 'Develop technical skills in software development, networking, and digital media.',
        careerPaths: ['Software Developer', 'Web Designer', 'Network Administrator', 'IT Support Specialist'],
        skills: ['Programming', 'Web Development', 'Database Management', 'Computer Hardware'],
        subjects: {
          grade11: ['Computer Programming', 'Web Development', 'Computer System Servicing', 'Animation'],
          grade12: ['Mobile Application Development', 'Network Security', 'Database Management', 'Capstone Project']
        }
      },
      {
        id: 'stem',
        name: 'Science, Technology, Engineering, and Mathematics (STEM)',
        description: 'For students pursuing careers in science, technology, engineering, and mathematics.',
        objectives: 'Build strong foundations in scientific inquiry and mathematical reasoning.',
        careerPaths: ['Engineer', 'Scientist', 'Mathematician', 'Architect', 'Doctor', 'Researcher'],
        skills: ['Critical Thinking', 'Problem Solving', 'Research', 'Data Analysis'],
        subjects: {
          grade11: ['General Biology', 'General Chemistry', 'General Physics', 'Pre-Calculus'],
          grade12: ['Biology', 'Chemistry', 'Physics', 'Calculus', 'Research']
        }
      },
      {
        id: 'humss',
        name: 'Humanities and Social Sciences (HUMSS)',
        description: 'For students interested in social sciences, humanities, and communication.',
        objectives: 'Develop understanding of human behavior, society, and culture.',
        careerPaths: ['Lawyer', 'Teacher', 'Journalist', 'Psychologist', 'Social Worker', 'Diplomat'],
        skills: ['Communication', 'Critical Analysis', 'Research', 'Cultural Awareness'],
        subjects: {
          grade11: ['Creative Writing', 'World Religions', 'Philippine Politics', 'Disciplines of Social Science'],
          grade12: ['Creative Nonfiction', 'Trends and Issues', 'Community Engagement', 'Research']
        }
      }
    ]);
  }
};

// Call initialization on server start
initializeDefaultData();

// Health check endpoint
app.get("/make-server-57462cdf/health", (c) => {
  return c.json({ status: "ok" });
});

// Root health check
app.get("/make-server-57462cdf", (c) => {
  return c.json({ status: "Server is running", message: "LINHS Portal API" });
});

// ============ AUTHENTICATION ROUTES ============

// Teacher signup
app.post("/make-server-57462cdf/signup", async (c) => {
  try {
    const { email, password, name } = await c.req.json();
    
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name, role: 'teacher' },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true
    });
    
    if (error) {
      console.log('Signup error:', error);
      return c.json({ error: error.message }, 400);
    }
    
    return c.json({ success: true, user: data.user });
  } catch (error) {
    console.log('Signup error:', error);
    return c.json({ error: 'Failed to create teacher account' }, 500);
  }
});

// ============ PUBLIC ROUTES (No Auth Required) ============

// Get school info
app.get("/make-server-57462cdf/school-info", async (c) => {
  try {
    const info = await kv.get('school_info');
    return c.json(info || {});
  } catch (error) {
    console.log('Error fetching school info:', error);
    return c.json({ error: 'Failed to fetch school info' }, 500);
  }
});

// Get all strands
app.get("/make-server-57462cdf/strands", async (c) => {
  try {
    const strands = await kv.get('strands');
    return c.json(strands || []);
  } catch (error) {
    console.log('Error fetching strands:', error);
    return c.json({ error: 'Failed to fetch strands' }, 500);
  }
});

// Get all announcements
app.get("/make-server-57462cdf/announcements", async (c) => {
  try {
    const announcements = await kv.getByPrefix('announcement_');
    // Sort by date, newest first
    const sorted = announcements.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return c.json(sorted);
  } catch (error) {
    console.log('Error fetching announcements:', error);
    return c.json({ error: 'Failed to fetch announcements' }, 500);
  }
});

// Get all students (public view)
app.get("/make-server-57462cdf/students", async (c) => {
  try {
    const students = await kv.getByPrefix('student_');
    return c.json(students);
  } catch (error) {
    console.log('Error fetching students:', error);
    return c.json({ error: 'Failed to fetch students' }, 500);
  }
});

// Get all classes
app.get("/make-server-57462cdf/classes", async (c) => {
  try {
    const classes = await kv.getByPrefix('class_');
    return c.json(classes);
  } catch (error) {
    console.log('Error fetching classes:', error);
    return c.json({ error: 'Failed to fetch classes' }, 500);
  }
});

// Get gallery items
app.get("/make-server-57462cdf/gallery", async (c) => {
  try {
    const items = await kv.getByPrefix('gallery_');
    return c.json(items);
  } catch (error) {
    console.log('Error fetching gallery:', error);
    return c.json({ error: 'Failed to fetch gallery' }, 500);
  }
});

// Get resources
app.get("/make-server-57462cdf/resources", async (c) => {
  try {
    const resources = await kv.getByPrefix('resource_');
    return c.json(resources);
  } catch (error) {
    console.log('Error fetching resources:', error);
    return c.json({ error: 'Failed to fetch resources' }, 500);
  }
});

// Get statistics (public)
app.get("/make-server-57462cdf/stats", async (c) => {
  try {
    const students = await kv.getByPrefix('student_');
    const classes = await kv.getByPrefix('class_');
    
    // Count by strand
    const strandCounts = {
      ict: 0,
      stem: 0,
      humss: 0
    };
    
    students.forEach((student: any) => {
      if (student.strand && strandCounts.hasOwnProperty(student.strand)) {
        strandCounts[student.strand as keyof typeof strandCounts]++;
      }
    });
    
    return c.json({
      totalStudents: students.length,
      totalClasses: classes.length,
      strandCounts
    });
  } catch (error) {
    console.log('Error fetching stats:', error);
    return c.json({ error: 'Failed to fetch statistics' }, 500);
  }
});

// ============ PROTECTED ROUTES (Auth Required) ============

// Update school info
app.put("/make-server-57462cdf/school-info", async (c) => {
  try {
    const user = await verifyAuth(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized - Teacher login required' }, 401);
    }
    
    const data = await c.req.json();
    await kv.set('school_info', data);
    
    return c.json({ success: true, data });
  } catch (error) {
    console.log('Error updating school info:', error);
    return c.json({ error: 'Failed to update school info' }, 500);
  }
});

// Create student
app.post("/make-server-57462cdf/students", async (c) => {
  try {
    const user = await verifyAuth(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized - Teacher login required' }, 401);
    }
    
    const student = await c.req.json();
    const id = `student_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const studentData = { ...student, id, createdAt: new Date().toISOString() };
    
    await kv.set(id, studentData);
    
    return c.json({ success: true, student: studentData });
  } catch (error) {
    console.log('Error creating student:', error);
    return c.json({ error: 'Failed to create student' }, 500);
  }
});

// Update student
app.put("/make-server-57462cdf/students/:id", async (c) => {
  try {
    const user = await verifyAuth(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized - Teacher login required' }, 401);
    }
    
    const id = c.req.param('id');
    const updates = await c.req.json();
    
    const existing = await kv.get(id);
    if (!existing) {
      return c.json({ error: 'Student not found' }, 404);
    }
    
    const updated = { ...existing, ...updates, updatedAt: new Date().toISOString() };
    await kv.set(id, updated);
    
    return c.json({ success: true, student: updated });
  } catch (error) {
    console.log('Error updating student:', error);
    return c.json({ error: 'Failed to update student' }, 500);
  }
});

// Delete student
app.delete("/make-server-57462cdf/students/:id", async (c) => {
  try {
    const user = await verifyAuth(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized - Teacher login required' }, 401);
    }
    
    const id = c.req.param('id');
    await kv.del(id);
    
    return c.json({ success: true });
  } catch (error) {
    console.log('Error deleting student:', error);
    return c.json({ error: 'Failed to delete student' }, 500);
  }
});

// Create class
app.post("/make-server-57462cdf/classes", async (c) => {
  try {
    const user = await verifyAuth(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized - Teacher login required' }, 401);
    }
    
    const classData = await c.req.json();
    const id = `class_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newClass = { ...classData, id, createdAt: new Date().toISOString() };
    
    await kv.set(id, newClass);
    
    return c.json({ success: true, class: newClass });
  } catch (error) {
    console.log('Error creating class:', error);
    return c.json({ error: 'Failed to create class' }, 500);
  }
});

// Update class
app.put("/make-server-57462cdf/classes/:id", async (c) => {
  try {
    const user = await verifyAuth(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized - Teacher login required' }, 401);
    }
    
    const id = c.req.param('id');
    const updates = await c.req.json();
    
    const existing = await kv.get(id);
    if (!existing) {
      return c.json({ error: 'Class not found' }, 404);
    }
    
    const updated = { ...existing, ...updates, updatedAt: new Date().toISOString() };
    await kv.set(id, updated);
    
    return c.json({ success: true, class: updated });
  } catch (error) {
    console.log('Error updating class:', error);
    return c.json({ error: 'Failed to update class' }, 500);
  }
});

// Delete class
app.delete("/make-server-57462cdf/classes/:id", async (c) => {
  try {
    const user = await verifyAuth(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized - Teacher login required' }, 401);
    }
    
    const id = c.req.param('id');
    await kv.del(id);
    
    return c.json({ success: true });
  } catch (error) {
    console.log('Error deleting class:', error);
    return c.json({ error: 'Failed to delete class' }, 500);
  }
});

// Create announcement
app.post("/make-server-57462cdf/announcements", async (c) => {
  try {
    const user = await verifyAuth(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized - Teacher login required' }, 401);
    }
    
    const announcement = await c.req.json();
    const id = `announcement_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newAnnouncement = { 
      ...announcement, 
      id, 
      createdAt: new Date().toISOString(),
      author: user.email
    };
    
    await kv.set(id, newAnnouncement);
    
    return c.json({ success: true, announcement: newAnnouncement });
  } catch (error) {
    console.log('Error creating announcement:', error);
    return c.json({ error: 'Failed to create announcement' }, 500);
  }
});

// Update announcement
app.put("/make-server-57462cdf/announcements/:id", async (c) => {
  try {
    const user = await verifyAuth(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized - Teacher login required' }, 401);
    }
    
    const id = c.req.param('id');
    const updates = await c.req.json();
    
    const existing = await kv.get(id);
    if (!existing) {
      return c.json({ error: 'Announcement not found' }, 404);
    }
    
    const updated = { ...existing, ...updates, updatedAt: new Date().toISOString() };
    await kv.set(id, updated);
    
    return c.json({ success: true, announcement: updated });
  } catch (error) {
    console.log('Error updating announcement:', error);
    return c.json({ error: 'Failed to update announcement' }, 500);
  }
});

// Delete announcement
app.delete("/make-server-57462cdf/announcements/:id", async (c) => {
  try {
    const user = await verifyAuth(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized - Teacher login required' }, 401);
    }
    
    const id = c.req.param('id');
    await kv.del(id);
    
    return c.json({ success: true });
  } catch (error) {
    console.log('Error deleting announcement:', error);
    return c.json({ error: 'Failed to delete announcement' }, 500);
  }
});

// Create gallery item
app.post("/make-server-57462cdf/gallery", async (c) => {
  try {
    const user = await verifyAuth(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized - Teacher login required' }, 401);
    }
    
    const item = await c.req.json();
    const id = `gallery_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newItem = { ...item, id, createdAt: new Date().toISOString() };
    
    await kv.set(id, newItem);
    
    return c.json({ success: true, item: newItem });
  } catch (error) {
    console.log('Error creating gallery item:', error);
    return c.json({ error: 'Failed to create gallery item' }, 500);
  }
});

// Delete gallery item
app.delete("/make-server-57462cdf/gallery/:id", async (c) => {
  try {
    const user = await verifyAuth(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized - Teacher login required' }, 401);
    }
    
    const id = c.req.param('id');
    await kv.del(id);
    
    return c.json({ success: true });
  } catch (error) {
    console.log('Error deleting gallery item:', error);
    return c.json({ error: 'Failed to delete gallery item' }, 500);
  }
});

// Create resource
app.post("/make-server-57462cdf/resources", async (c) => {
  try {
    const user = await verifyAuth(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized - Teacher login required' }, 401);
    }
    
    const resource = await c.req.json();
    const id = `resource_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newResource = { ...resource, id, createdAt: new Date().toISOString() };
    
    await kv.set(id, newResource);
    
    return c.json({ success: true, resource: newResource });
  } catch (error) {
    console.log('Error creating resource:', error);
    return c.json({ error: 'Failed to create resource' }, 500);
  }
});

// Delete resource
app.delete("/make-server-57462cdf/resources/:id", async (c) => {
  try {
    const user = await verifyAuth(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized - Teacher login required' }, 401);
    }
    
    const id = c.req.param('id');
    await kv.del(id);
    
    return c.json({ success: true });
  } catch (error) {
    console.log('Error deleting resource:', error);
    return c.json({ error: 'Failed to delete resource' }, 500);
  }
});

// ============ CLEARANCE CHECK (PUBLIC) ============

// Check student clearance by LRN
app.get("/make-server-57462cdf/clearance/:lrn", async (c) => {
  try {
    const lrn = c.req.param('lrn');
    
    // Get student info
    const student = await kv.get(`student_lrn_${lrn}`);
    if (!student) {
      return c.json({ error: 'Student not found' }, 404);
    }
    
    // Collect all liabilities
    const liabilities = [];
    
    // Check guidance records
    const guidanceRecords = await kv.getByPrefix('guidance_');
    const studentGuidance = guidanceRecords.filter((r: any) => 
      r.studentsInvolved?.includes(lrn) && r.status !== 'resolved'
    );
    studentGuidance.forEach((r: any) => {
      liabilities.push({
        type: 'Guidance',
        description: r.incident,
        date: r.date,
        status: r.status
      });
    });
    
    // Check facilities records
    const facilitiesRecords = await kv.getByPrefix('facility_');
    const studentFacilities = facilitiesRecords.filter((r: any) => 
      r.studentsResponsible?.includes(lrn) && r.status !== 'resolved'
    );
    studentFacilities.forEach((r: any) => {
      liabilities.push({
        type: 'Facilities',
        description: `Damage to ${r.facilityName}`,
        date: r.date,
        status: r.status
      });
    });
    
    // Check equipment records
    const equipmentRecords = await kv.getByPrefix('equipment_');
    const studentEquipment = equipmentRecords.filter((r: any) => 
      r.borrowerLrn === lrn && r.status === 'borrowed'
    );
    studentEquipment.forEach((r: any) => {
      liabilities.push({
        type: 'Equipment',
        description: `Unreturned ${r.itemName}`,
        date: r.borrowDate,
        status: 'pending'
      });
    });
    
    // Check grades
    const grades = await kv.getByPrefix(`grade_${lrn}_`);
    const failedGrades = grades.filter((g: any) => g.grade < 75);
    failedGrades.forEach((g: any) => {
      liabilities.push({
        type: 'Grades',
        description: `Failed ${g.subject} - Grade: ${g.grade}`,
        date: g.date,
        status: 'pending'
      });
    });
    
    return c.json({
      student: {
        lrn: student.lrn,
        name: `${student.firstName} ${student.lastName}`,
        section: student.section,
        strand: student.strand
      },
      liabilities,
      isCleared: liabilities.length === 0
    });
  } catch (error) {
    console.log('Error checking clearance:', error);
    return c.json({ error: 'Failed to check clearance' }, 500);
  }
});

// ============ ATTENDANCE ROUTES ============

// Generate QR codes for class
app.post("/make-server-57462cdf/attendance/generate-qr", async (c) => {
  try {
    const user = await verifyAuth(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const { classId, date } = await c.req.json();
    
    // Get students in class
    const students = await kv.getByPrefix('student_lrn_');
    const classInfo = await kv.get(classId);
    
    if (!classInfo) {
      return c.json({ error: 'Class not found' }, 404);
    }
    
    const classStudents = students.filter((s: any) => s.section === classInfo.section);
    
    // Generate QR codes for each student
    const qrCodes = [];
    for (const student of classStudents) {
      const qrData = JSON.stringify({
        lrn: student.lrn,
        classId,
        date,
        timestamp: Date.now()
      });
      
      const qrCodeUrl = await QRCode.toDataURL(qrData);
      qrCodes.push({
        lrn: student.lrn,
        studentName: `${student.firstName} ${student.lastName}`,
        qrCode: qrCodeUrl
      });
    }
    
    return c.json({ success: true, qrCodes });
  } catch (error) {
    console.log('Error generating QR codes:', error);
    return c.json({ error: 'Failed to generate QR codes' }, 500);
  }
});

// Record attendance
app.post("/make-server-57462cdf/attendance/record", async (c) => {
  try {
    const user = await verifyAuth(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const { lrn, classId, date } = await c.req.json();
    
    const id = `attendance_${lrn}_${classId}_${date}`;
    const attendance = {
      id,
      lrn,
      classId,
      date,
      timestamp: new Date().toISOString(),
      recordedBy: user.email,
      status: 'present'
    };
    
    await kv.set(id, attendance);
    
    return c.json({ success: true, attendance });
  } catch (error) {
    console.log('Error recording attendance:', error);
    return c.json({ error: 'Failed to record attendance' }, 500);
  }
});

// Get attendance records
app.get("/make-server-57462cdf/attendance/:classId", async (c) => {
  try {
    const user = await verifyAuth(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const classId = c.req.param('classId');
    const allAttendance = await kv.getByPrefix('attendance_');
    const classAttendance = allAttendance.filter((a: any) => a.classId === classId);
    
    return c.json(classAttendance);
  } catch (error) {
    console.log('Error fetching attendance:', error);
    return c.json({ error: 'Failed to fetch attendance' }, 500);
  }
});

// ============ GUIDANCE RECORDS ============

// Create guidance record
app.post("/make-server-57462cdf/guidance", async (c) => {
  try {
    const user = await verifyAuth(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const record = await c.req.json();
    const id = `guidance_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const guidanceRecord = {
      ...record,
      id,
      createdAt: new Date().toISOString(),
      createdBy: user.email
    };
    
    await kv.set(id, guidanceRecord);
    
    return c.json({ success: true, record: guidanceRecord });
  } catch (error) {
    console.log('Error creating guidance record:', error);
    return c.json({ error: 'Failed to create guidance record' }, 500);
  }
});

// Get guidance records
app.get("/make-server-57462cdf/guidance", async (c) => {
  try {
    const user = await verifyAuth(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const records = await kv.getByPrefix('guidance_');
    
    // Filter based on role
    const role = user.user_metadata?.role;
    if (role === 'adviser') {
      const section = user.user_metadata?.section;
      return c.json(records.filter((r: any) => r.section === section));
    }
    
    return c.json(records);
  } catch (error) {
    console.log('Error fetching guidance records:', error);
    return c.json({ error: 'Failed to fetch guidance records' }, 500);
  }
});

// Update guidance record
app.put("/make-server-57462cdf/guidance/:id", async (c) => {
  try {
    const user = await verifyAuth(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const id = c.req.param('id');
    const updates = await c.req.json();
    
    const existing = await kv.get(id);
    if (!existing) {
      return c.json({ error: 'Record not found' }, 404);
    }
    
    const updated = { ...existing, ...updates, updatedAt: new Date().toISOString() };
    await kv.set(id, updated);
    
    return c.json({ success: true, record: updated });
  } catch (error) {
    console.log('Error updating guidance record:', error);
    return c.json({ error: 'Failed to update guidance record' }, 500);
  }
});

// ============ FACILITIES RECORDS ============

// Create facility damage record
app.post("/make-server-57462cdf/facilities", async (c) => {
  try {
    const user = await verifyAuth(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const record = await c.req.json();
    const id = `facility_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const facilityRecord = {
      ...record,
      id,
      createdAt: new Date().toISOString(),
      createdBy: user.email
    };
    
    await kv.set(id, facilityRecord);
    
    return c.json({ success: true, record: facilityRecord });
  } catch (error) {
    console.log('Error creating facility record:', error);
    return c.json({ error: 'Failed to create facility record' }, 500);
  }
});

// Get facility records
app.get("/make-server-57462cdf/facilities", async (c) => {
  try {
    const user = await verifyAuth(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const records = await kv.getByPrefix('facility_');
    
    // Filter based on role
    const role = user.user_metadata?.role;
    if (role === 'adviser') {
      const section = user.user_metadata?.section;
      return c.json(records.filter((r: any) => r.section === section));
    }
    
    return c.json(records);
  } catch (error) {
    console.log('Error fetching facility records:', error);
    return c.json({ error: 'Failed to fetch facility records' }, 500);
  }
});

// Update facility record
app.put("/make-server-57462cdf/facilities/:id", async (c) => {
  try {
    const user = await verifyAuth(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const id = c.req.param('id');
    const updates = await c.req.json();
    
    const existing = await kv.get(id);
    if (!existing) {
      return c.json({ error: 'Record not found' }, 404);
    }
    
    const updated = { ...existing, ...updates, updatedAt: new Date().toISOString() };
    await kv.set(id, updated);
    
    return c.json({ success: true, record: updated });
  } catch (error) {
    console.log('Error updating facility record:', error);
    return c.json({ error: 'Failed to update facility record' }, 500);
  }
});

// ============ EQUIPMENT RECORDS ============

// Create equipment borrowing record
app.post("/make-server-57462cdf/equipment", async (c) => {
  try {
    const user = await verifyAuth(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const record = await c.req.json();
    const id = `equipment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const equipmentRecord = {
      ...record,
      id,
      createdAt: new Date().toISOString(),
      createdBy: user.email,
      status: 'borrowed'
    };
    
    await kv.set(id, equipmentRecord);
    
    return c.json({ success: true, record: equipmentRecord });
  } catch (error) {
    console.log('Error creating equipment record:', error);
    return c.json({ error: 'Failed to create equipment record' }, 500);
  }
});

// Get equipment records
app.get("/make-server-57462cdf/equipment", async (c) => {
  try {
    const user = await verifyAuth(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const records = await kv.getByPrefix('equipment_');
    
    // Filter based on category if equipment admin
    const role = user.user_metadata?.role;
    if (role === 'equipment_admin') {
      const category = user.user_metadata?.category;
      return c.json(records.filter((r: any) => r.category === category));
    }
    
    return c.json(records);
  } catch (error) {
    console.log('Error fetching equipment records:', error);
    return c.json({ error: 'Failed to fetch equipment records' }, 500);
  }
});

// Update equipment record (mark as returned)
app.put("/make-server-57462cdf/equipment/:id", async (c) => {
  try {
    const user = await verifyAuth(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const id = c.req.param('id');
    const updates = await c.req.json();
    
    const existing = await kv.get(id);
    if (!existing) {
      return c.json({ error: 'Record not found' }, 404);
    }
    
    const updated = { 
      ...existing, 
      ...updates, 
      returnDate: updates.status === 'returned' ? new Date().toISOString() : existing.returnDate,
      updatedAt: new Date().toISOString() 
    };
    await kv.set(id, updated);
    
    return c.json({ success: true, record: updated });
  } catch (error) {
    console.log('Error updating equipment record:', error);
    return c.json({ error: 'Failed to update equipment record' }, 500);
  }
});

// ============ CLINIC VISITS ============

// Create clinic visit record
app.post("/make-server-57462cdf/clinic", async (c) => {
  try {
    const user = await verifyAuth(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    // Only nurse can create clinic records
    const role = user.user_metadata?.role;
    if (role !== 'nurse' && role !== 'super_admin') {
      return c.json({ error: 'Unauthorized - Nurse access only' }, 403);
    }
    
    const record = await c.req.json();
    const id = `clinic_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const clinicRecord = {
      ...record,
      id,
      createdAt: new Date().toISOString(),
      createdBy: user.email
    };
    
    await kv.set(id, clinicRecord);
    
    return c.json({ success: true, record: clinicRecord });
  } catch (error) {
    console.log('Error creating clinic record:', error);
    return c.json({ error: 'Failed to create clinic record' }, 500);
  }
});

// Get clinic visit records
app.get("/make-server-57462cdf/clinic", async (c) => {
  try {
    const user = await verifyAuth(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    // Only nurse can view clinic records
    const role = user.user_metadata?.role;
    if (role !== 'nurse' && role !== 'super_admin') {
      return c.json({ error: 'Unauthorized - Nurse access only' }, 403);
    }
    
    const records = await kv.getByPrefix('clinic_');
    return c.json(records);
  } catch (error) {
    console.log('Error fetching clinic records:', error);
    return c.json({ error: 'Failed to fetch clinic records' }, 500);
  }
});

// ============ GRADES MANAGEMENT ============

// Add/Update grade
app.post("/make-server-57462cdf/grades", async (c) => {
  try {
    const user = await verifyAuth(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const { lrn, subject, grade, term, schoolYear } = await c.req.json();
    
    const id = `grade_${lrn}_${subject}_${term}_${schoolYear}`;
    const gradeRecord = {
      id,
      lrn,
      subject,
      grade,
      term,
      schoolYear,
      createdAt: new Date().toISOString(),
      createdBy: user.email
    };
    
    await kv.set(id, gradeRecord);
    
    return c.json({ success: true, grade: gradeRecord });
  } catch (error) {
    console.log('Error saving grade:', error);
    return c.json({ error: 'Failed to save grade' }, 500);
  }
});

// Get grades for student
app.get("/make-server-57462cdf/grades/:lrn", async (c) => {
  try {
    const user = await verifyAuth(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const lrn = c.req.param('lrn');
    const grades = await kv.getByPrefix(`grade_${lrn}_`);
    
    return c.json(grades);
  } catch (error) {
    console.log('Error fetching grades:', error);
    return c.json({ error: 'Failed to fetch grades' }, 500);
  }
});

// Get all grades (for advisers)
app.get("/make-server-57462cdf/grades", async (c) => {
  try {
    const user = await verifyAuth(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const allGrades = await kv.getByPrefix('grade_');
    return c.json(allGrades);
  } catch (error) {
    console.log('Error fetching all grades:', error);
    return c.json({ error: 'Failed to fetch grades' }, 500);
  }
});

// ============ REGISTRAR DOCUMENT REQUESTS ============

// Submit document request
app.post("/make-server-57462cdf/document-requests", async (c) => {
  try {
    const request = await c.req.json();
    const id = `docreq_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const documentRequest = {
      ...request,
      id,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    
    await kv.set(id, documentRequest);
    
    return c.json({ success: true, request: documentRequest });
  } catch (error) {
    console.log('Error submitting document request:', error);
    return c.json({ error: 'Failed to submit document request' }, 500);
  }
});

// Get document requests (registrar only)
app.get("/make-server-57462cdf/document-requests", async (c) => {
  try {
    const user = await verifyAuth(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const role = user.user_metadata?.role;
    if (role !== 'registrar' && role !== 'super_admin') {
      return c.json({ error: 'Unauthorized - Registrar access only' }, 403);
    }
    
    const requests = await kv.getByPrefix('docreq_');
    return c.json(requests);
  } catch (error) {
    console.log('Error fetching document requests:', error);
    return c.json({ error: 'Failed to fetch document requests' }, 500);
  }
});

// Update document request status
app.put("/make-server-57462cdf/document-requests/:id", async (c) => {
  try {
    const user = await verifyAuth(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const role = user.user_metadata?.role;
    if (role !== 'registrar' && role !== 'super_admin') {
      return c.json({ error: 'Unauthorized - Registrar access only' }, 403);
    }
    
    const id = c.req.param('id');
    const updates = await c.req.json();
    
    const existing = await kv.get(id);
    if (!existing) {
      return c.json({ error: 'Request not found' }, 404);
    }
    
    const updated = { 
      ...existing, 
      ...updates, 
      processedBy: user.email,
      processedAt: new Date().toISOString() 
    };
    await kv.set(id, updated);
    
    return c.json({ success: true, request: updated });
  } catch (error) {
    console.log('Error updating document request:', error);
    return c.json({ error: 'Failed to update document request' }, 500);
  }
});

Deno.serve(app.fetch);