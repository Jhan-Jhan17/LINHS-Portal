# 🔐 LINHS Portal - All Login Credentials

## Quick Reference Card

---

### 👨‍💼 SUPER ADMINISTRATOR
**Email:** `admin@linhs.edu.ph`  
**Password:** `admin123`  
**Role:** super_admin  
**Access:** Full system access - all modules, all students, all records

---

### 👨‍🏫 REGULAR TEACHER
**Email:** `teacher@linhs.edu.ph`  
**Password:** `teacher123`  
**Role:** teacher  
**Access:** Class management, student management, announcements

---

### 👥 ADVISERS (Section-Specific)

#### ICT 11-A Adviser
**Email:** `adviser1@linhs.edu.ph`  
**Password:** `adviser123`  
**Role:** adviser  
**Section:** ICT 11-A  
**Access:** Their section students, grades, guidance records

#### STEM 11-A Adviser
**Email:** `adviser2@linhs.edu.ph`  
**Password:** `adviser123`  
**Role:** adviser  
**Section:** STEM 11-A  
**Access:** Their section students, grades, guidance records

#### HUMSS 11-A Adviser
**Email:** `adviser3@linhs.edu.ph`  
**Password:** `adviser123`  
**Role:** adviser  
**Section:** HUMSS 11-A  
**Access:** Their section students, grades, guidance records

---

### 🧠 GUIDANCE COUNSELOR
**Email:** `guidance@linhs.edu.ph`  
**Password:** `guidance123`  
**Role:** guidance  
**Access:** All guidance records, all student behavioral issues

---

### ⚕️ SCHOOL NURSE
**Email:** `nurse@linhs.edu.ph`  
**Password:** `nurse123`  
**Role:** nurse  
**Access:** Clinic visit records only (does not affect clearance)

---

### 📄 SCHOOL REGISTRAR
**Email:** `registrar@linhs.edu.ph`  
**Password:** `registrar123`  
**Role:** registrar  
**Access:** Document request management (Form 137, certificates, etc.)

---

### 🔬 LABORATORY EQUIPMENT ADMIN
**Email:** `lab.admin@linhs.edu.ph`  
**Password:** `equipment123`  
**Role:** equipment_admin  
**Category:** laboratory  
**Access:** Lab equipment borrowing records only

---

### ⚽ SPORTS EQUIPMENT ADMIN
**Email:** `sports.admin@linhs.edu.ph`  
**Password:** `equipment123`  
**Role:** equipment_admin  
**Category:** sports  
**Access:** Sports equipment borrowing records only

---

### 📚 LIBRARY EQUIPMENT ADMIN
**Email:** `library.admin@linhs.edu.ph`  
**Password:** `equipment123`  
**Role:** equipment_admin  
**Category:** library  
**Access:** Library equipment borrowing records only

---

### 💻 ICT EQUIPMENT ADMIN
**Email:** `ict.admin@linhs.edu.ph`  
**Password:** `equipment123`  
**Role:** equipment_admin  
**Category:** ict  
**Access:** ICT equipment borrowing records only

---

### 🎵 MUSIC EQUIPMENT ADMIN
**Email:** `music.admin@linhs.edu.ph`  
**Password:** `equipment123`  
**Role:** equipment_admin  
**Category:** music  
**Access:** Music equipment borrowing records only

---

### 🏢 FACILITIES ADMIN
**Email:** `facilities@linhs.edu.ph`  
**Password:** `facilities123`  
**Role:** facilities_admin  
**Access:** All facility damage records, all sections

---

## 🎓 Test Student Credentials

### Sample Students (for clearance testing)
**LRN Range:** LRN137000000000 to LRN137000000099  
**Total:** 100 test students  
**Sections:** ICT 11-A, ICT 11-B, STEM 11-A, STEM 11-B, HUMSS 11-A, HUMSS 11-B

### Quick Test LRNs:
```
LRN137000000000  (First student)
LRN137000000010  
LRN137000000020  
LRN137000000050  
LRN137000000099  (Last student)
```

---

## 📊 Access Matrix

| Feature | Super Admin | Teacher | Adviser | Guidance | Nurse | Registrar | Equipment | Facilities |
|---------|:-----------:|:-------:|:-------:|:--------:|:-----:|:---------:|:---------:|:----------:|
| School Info Edit | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| All Students | ✅ | ✅ | 📋 | ❌ | ❌ | ❌ | ❌ | ❌ |
| All Classes | ✅ | ✅ | 📋 | ❌ | ❌ | ❌ | ❌ | ❌ |
| Attendance | ✅ | ✅ | 📋 | ❌ | ❌ | ❌ | ❌ | ❌ |
| Grades | ✅ | ❌ | 📋 | ❌ | ❌ | ❌ | ❌ | ❌ |
| Guidance Records | ✅ | ❌ | 📋 | ✅ | ❌ | ❌ | ❌ | ❌ |
| Facility Records | ✅ | ❌ | 📋 | ❌ | ❌ | ❌ | ❌ | ✅ |
| Equipment Records | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | 📋 | ❌ |
| Clinic Visits | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ |
| Document Requests | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ |

**Legend:**
- ✅ Full Access
- 📋 Limited Access (their section/category only)
- ❌ No Access

---

## 🚀 Quick Login URLs

**Teacher/Staff Login Page:**  
`http://localhost:5173/teacher/login`

**After Login (Dashboard):**  
`http://localhost:5173/teacher/dashboard`

---

## 💡 Testing Tips

### To Test Different Roles:
1. **Logout** from current account
2. **Go to** `/teacher/login`
3. **Enter** credentials for desired role
4. **Observe** different dashboard modules based on role

### To Test Student Services:
1. **No login required!**
2. **Go to** `/clearance` (enter any LRN)
3. **Go to** `/document-request` (fill and submit)

---

## 🔒 Security Notes

- All passwords are simple for testing purposes (`admin123`, `teacher123`, etc.)
- In production, enforce strong passwords
- Email confirmation is auto-enabled for development
- JWT tokens expire based on Supabase settings
- Service role key is server-side only (never exposed to frontend)

---

## 📝 Password Pattern Reference

For easy memorization:
- **Super Admin:** `admin123`
- **Teacher:** `teacher123`
- **Advisers:** `adviser123`
- **Guidance:** `guidance123`
- **Nurse:** `nurse123`
- **Registrar:** `registrar123`
- **Equipment Admins:** `equipment123`
- **Facilities:** `facilities123`

---

## 🎯 Recommended Testing Order

1. **Start with Super Admin** - See everything
2. **Try an Adviser** - See section-limited access
3. **Try Guidance** - See guidance-only access
4. **Try Nurse** - See clinic-only access
5. **Try Registrar** - See document requests
6. **Try Equipment Admin** - See category-limited equipment records

---

## 📞 Need Help?

Refer to:
- `QUICK_START_GUIDE.md` - Step-by-step testing
- `PORTAL_SYSTEM_GUIDE.md` - Complete system documentation
- `IMPLEMENTATION_SUMMARY.md` - Technical details

---

**Last Updated:** March 1, 2026  
**System Version:** 2.0  
**Total Accounts:** 14 staff + 100 students
