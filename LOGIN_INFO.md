# 🔐 Login Information - LINHS Portal System

## Complete List of Test Accounts

All accounts are ready to use for testing the Student-Teacher Portal System.

---

## 🎯 All User Roles (14 Total Accounts)

### 1. Super Admin
**Full system access - Can manage everything**
- **Email:** `admin@linhs.edu.ph`
- **Password:** `admin123`
- **Access:** Complete administrative control over all features

---

### 2. Teacher
**General teaching account**
- **Email:** `teacher@linhs.edu.ph`
- **Password:** `teacher123`
- **Access:** Student management, class management, grades, attendance

---

### 3-5. Class Advisers (3 Sections)
**Section-specific advisers**

#### ICT 11-A Adviser
- **Email:** `adviser1@linhs.edu.ph`
- **Password:** `adviser123`
- **Section:** ICT 11-A
- **Access:** Manage grades, guidance, and facilities for ICT 11-A only

#### STEM 11-A Adviser
- **Email:** `adviser2@linhs.edu.ph`
- **Password:** `adviser123`
- **Section:** STEM 11-A
- **Access:** Manage grades, guidance, and facilities for STEM 11-A only

#### HUMSS 11-A Adviser
- **Email:** `adviser3@linhs.edu.ph`
- **Password:** `adviser123`
- **Section:** HUMSS 11-A
- **Access:** Manage grades, guidance, and facilities for HUMSS 11-A only

---

### 6. Guidance Counselor
**Behavioral management**
- **Email:** `guidance@linhs.edu.ph`
- **Password:** `guidance123`
- **Access:** Full access to all guidance records (behavioral incidents, discipline)

---

### 7. School Nurse
**Medical records management**
- **Email:** `nurse@linhs.edu.ph`
- **Password:** `nurse123`
- **Access:** Exclusive access to clinic visit records

---

### 8. Registrar
**Document processing**
- **Email:** `registrar@linhs.edu.ph`
- **Password:** `registrar123`
- **Access:** Manage document requests (Form 137, certificates, transcripts)

---

### 9-13. Equipment Admins (5 Categories)
**Equipment borrowing management by category**

#### Laboratory Equipment Admin
- **Email:** `lab.admin@linhs.edu.ph`
- **Password:** `equipment123`
- **Category:** Laboratory Equipment

#### Sports Equipment Admin
- **Email:** `sports.admin@linhs.edu.ph`
- **Password:** `equipment123`
- **Category:** Sports Equipment

#### Library Equipment Admin
- **Email:** `library.admin@linhs.edu.ph`
- **Password:** `equipment123`
- **Category:** Library Equipment

#### ICT Equipment Admin
- **Email:** `ict.admin@linhs.edu.ph`
- **Password:** `equipment123`
- **Category:** ICT Equipment

#### Music Equipment Admin
- **Email:** `music.admin@linhs.edu.ph`
- **Password:** `equipment123`
- **Category:** Music Equipment

---

### 14. Facilities Admin
**Facilities and damage management**
- **Email:** `facilities@linhs.edu.ph`
- **Password:** `facilities123`
- **Access:** Full access to all facility damage records

---

## 🎓 Student Test Accounts

**100 test students with LRN codes**
- LRN Range: `LRN137000000000` to `LRN137000000099`
- Distributed across 6 sections:
  - ICT 11-A
  - ICT 11-B
  - STEM 11-A
  - STEM 11-B
  - HUMSS 11-A
  - HUMSS 11-B

**Student Passwords:**
- Format: `student1000` to `student1099`
- Example: Student with LRN137000000001 uses password `student1001`

---

## 📊 Quick Reference Table

| Role | Email | Password | Section/Category |
|------|-------|----------|------------------|
| **Super Admin** | admin@linhs.edu.ph | admin123 | All Access |
| **Teacher** | teacher@linhs.edu.ph | teacher123 | - |
| **ICT Adviser** | adviser1@linhs.edu.ph | adviser123 | ICT 11-A |
| **STEM Adviser** | adviser2@linhs.edu.ph | adviser123 | STEM 11-A |
| **HUMSS Adviser** | adviser3@linhs.edu.ph | adviser123 | HUMSS 11-A |
| **Guidance** | guidance@linhs.edu.ph | guidance123 | Counseling |
| **Nurse** | nurse@linhs.edu.ph | nurse123 | Health Services |
| **Registrar** | registrar@linhs.edu.ph | registrar123 | Records |
| **Lab Admin** | lab.admin@linhs.edu.ph | equipment123 | Laboratory |
| **Sports Admin** | sports.admin@linhs.edu.ph | equipment123 | Sports |
| **Library Admin** | library.admin@linhs.edu.ph | equipment123 | Library |
| **ICT Admin** | ict.admin@linhs.edu.ph | equipment123 | ICT |
| **Music Admin** | music.admin@linhs.edu.ph | equipment123 | Music |
| **Facilities** | facilities@linhs.edu.ph | facilities123 | Facilities |

---

## 🚀 How to Login

1. **Go to the login page:** http://localhost:5173/teacher/login
2. **Click on any demo credential button** to auto-fill the email and password
3. **Click "Login to Dashboard"**
4. **You'll be redirected** to the appropriate dashboard based on your role

---

## 🔑 Access Permissions by Role

### Super Admin Can Access:
- ✅ All features
- ✅ Students, Classes, Attendance, Grades
- ✅ Guidance, Facilities, Equipment
- ✅ Clinic, Documents, Announcements
- ✅ Resources, Gallery, Settings

### Teacher Can Access:
- ✅ Students, Classes, Attendance, Grades
- ✅ Guidance, Facilities, Equipment
- ✅ Announcements, Resources, Gallery, Settings

### Adviser Can Access:
- ✅ Students (their section only)
- ✅ Classes, Attendance, Grades (their section only)
- ✅ Guidance, Facilities (their section only)
- ✅ Settings

### Guidance Can Access:
- ✅ Guidance Records (all students)
- ✅ Settings

### Nurse Can Access:
- ✅ Clinic Visits (all students)
- ✅ Settings

### Registrar Can Access:
- ✅ Document Requests
- ✅ Settings

### Equipment Admin Can Access:
- ✅ Equipment Records (their category only)
- ✅ Settings

### Facilities Admin Can Access:
- ✅ Facility Damage Records (all)
- ✅ Settings

---

## 📝 Notes

- **All passwords are for testing only** - never use these in production
- **Data is stored in localStorage** - clear browser storage to reset data
- **Each role sees different dashboard tabs** based on their permissions
- **Advisers can only manage their assigned section**
- **Equipment admins can only manage their category**

---

## 🧪 Testing Different Roles

**To test role-based access:**

1. Login with Super Admin account
2. Logout (click logout in sidebar)
3. Login with different role (e.g., Guidance)
4. Notice the different dashboard tabs and access levels
5. Repeat for other roles to see full functionality

---

## 🎯 Common Test Scenarios

### Test Attendance:
- Login as: **Teacher or Adviser**
- Generate QR codes for a class
- Scan QR codes to mark attendance

### Test Guidance Records:
- Login as: **Guidance Counselor**
- Create behavioral incident records
- Update record status

### Test Equipment Borrowing:
- Login as: **Lab Admin**
- Record equipment borrowing
- Mark equipment as returned

### Test Document Requests:
- Go to public portal (no login)
- Submit a document request
- Login as: **Registrar**
- Process the request

### Test Clearance Check:
- Go to public portal (no login)
- Enter student LRN (e.g., LRN137000000001)
- View clearance status and liabilities

---

## ⚠️ Important Notes

1. **Data Persistence:** Data is stored in localStorage and persists across page refreshes
2. **No Backend:** The system uses mock data storage, not a real database
3. **Mock Data:** All API calls work with localStorage data
4. **Authentication:** Login sessions are stored in localStorage
5. **Production Ready:** To deploy to production, integrate a real backend database

---

## 🔧 Technical Details

- **Authentication:** Local authentication with 14 predefined user accounts
- **Data Storage:** localStorage (persists across page refreshes)
- **Session Management:** localStorage for maintaining login sessions
- **API Layer:** `/src/app/utils/api.ts` - All mock API functions
- **Auth Context:** `/src/app/contexts/AuthContext.tsx` - Authentication logic

---

**Made with ❤️ for LINHS**

*Empowering education through technology!*
