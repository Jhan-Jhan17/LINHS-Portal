# Lumbang Integrated National High School - Student-Teacher Portal

A modern React-based web application for managing student information, classes, announcements, and resources at Lumbang Integrated National High School.

## 🎉 NEW: Supabase-Free Version!

This application is now **completely independent** from Supabase! It uses a local mock storage system and is ready for integration with your own database backend.

### What Changed?
- ✅ **Removed all Supabase dependencies**
- ✅ **Uses localStorage for mock data**
- ✅ **Zero external services required**
- ✅ **Ready for your own database**

See [`/SUPABASE_REMOVAL_SUMMARY.md`](./SUPABASE_REMOVAL_SUMMARY.md) for details.

## Quick Start

```bash
# Install dependencies (if not already installed)
npm install

# Start the application
npm run dev

# Visit http://localhost:5173
```

**That's it!** No database setup, no API keys, no configuration required.

## Features

### Public Features (No Login Required)
- 🏫 View school information (vision, mission, contact details)
- 📚 Browse available classes and resources
- 📢 Read announcements
- 🖼️ View photo gallery
- ✅ Check student clearance status
- 📄 Request official documents

### Teacher Portal Features (Login Required)
- 👨‍🎓 **Student Management**: Add, edit, and delete student records
- 📝 **Class Management**: Manage classes and schedules
- 📢 **Announcements**: Create and manage announcements
- 📊 **Grade Management**: Enter and view student grades
- 📱 **QR Attendance**: Generate QR codes and track attendance
- ⚙️ **Settings**: Manage account settings

### Admin Features (Admin Login Required)
- All teacher features plus:
- 🔧 Edit school information
- 🖼️ Manage gallery images
- 👥 Full administrative access to all content
- 📋 View document requests
- 🏥 Manage clinic visits, guidance, facilities, and equipment records

## Default Login Credentials

| Role | Email | Password |
|------|-------|----------|
| **Super Admin** | admin@linhs.edu.ph | admin123 |
| **Teacher** | teacher@linhs.edu.ph | teacher123 |
| **Adviser** | adviser@linhs.edu.ph | adviser123 |
| **Guidance** | guidance@linhs.edu.ph | guidance123 |
| **Nurse** | nurse@linhs.edu.ph | nurse123 |
| **Registrar** | registrar@linhs.edu.ph | registrar123 |
| **Equipment Admin** | equipment@linhs.edu.ph | equipment123 |
| **Facilities Admin** | facilities@linhs.edu.ph | facilities123 |

See [`/LOGIN_CREDENTIALS.md`](./LOGIN_CREDENTIALS.md) for full details.

## Technology Stack

- **Frontend**: React 18 with TypeScript
- **Routing**: React Router v7
- **Styling**: Tailwind CSS v4 with dark theme and glassmorphism
- **UI Components**: Radix UI primitives
- **Icons**: Lucide React
- **Data Storage**: localStorage (mock) - ready for backend integration
- **Authentication**: Local mock authentication with role-based access

## Installation

### Prerequisites
- Node.js 16+ and npm

### Setup Instructions

1. **Clone or download the project**
   ```bash
   git clone <repository-url>
   cd linhs-portal
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   ```
   http://localhost:5173
   ```

## Project Structure

```
/src
  /app
    /components        # Reusable UI components
      /ui             # Radix UI component wrappers
    /contexts         # React contexts (Auth)
    /pages            # Page components
      /teacher        # Teacher-specific pages
    /utils            # Utilities (API layer)
    App.tsx           # Main app component
    routes.ts         # Route configuration
  /styles             # CSS and theme files
  main.tsx            # App entry point
```

## Data Storage

Currently uses **localStorage** for mock data storage:

- **Key**: `linhs_portal_data`
- **Structure**: JSON object with all app data
- **Persistence**: Data persists across page refreshes

### View Data

Open browser console (F12):
```javascript
// View all data
console.log(JSON.parse(localStorage.getItem('linhs_portal_data')));

// Clear data
localStorage.removeItem('linhs_portal_data');
```

## Database Integration

Ready to connect to your own database? See:

- **[`/DATABASE_INTEGRATION_GUIDE.md`](./DATABASE_INTEGRATION_GUIDE.md)** - Comprehensive integration guide
- **[`/DATABASE_MIGRATION_CHECKLIST.md`](./DATABASE_MIGRATION_CHECKLIST.md)** - Step-by-step checklist

Supports any backend:
- REST API (Express, Django, Laravel, etc.)
- Firebase
- PostgreSQL, MySQL, MongoDB
- GraphQL
- And more!

## Documentation

### Quick Start Guides
- 📘 **[QUICK_START_NO_SUPABASE.md](./QUICK_START_NO_SUPABASE.md)** - Get started immediately
- 📗 **[LOGIN_CREDENTIALS.md](./LOGIN_CREDENTIALS.md)** - All test accounts

### Technical Documentation
- 📙 **[SUPABASE_REMOVAL_SUMMARY.md](./SUPABASE_REMOVAL_SUMMARY.md)** - What changed
- 📕 **[DATABASE_INTEGRATION_GUIDE.md](./DATABASE_INTEGRATION_GUIDE.md)** - Backend integration
- 📓 **[DATABASE_MIGRATION_CHECKLIST.md](./DATABASE_MIGRATION_CHECKLIST.md)** - Migration steps

### Legacy Documentation
- 📔 **[PORTAL_SYSTEM_GUIDE.md](./PORTAL_SYSTEM_GUIDE.md)** - Original system guide
- 📔 **[FEATURES_IMPLEMENTED.md](./FEATURES_IMPLEMENTED.md)** - Feature list

## Building for Production

```bash
# Create production build
npm run build

# Output will be in /dist directory
```

Deploy the `/dist` folder to any static hosting:
- Vercel
- Netlify
- GitHub Pages
- AWS S3
- Any web server

## Features Implemented

✅ **Authentication & Authorization**
- Role-based access control
- Session management
- Protected routes

✅ **Student Management**
- CRUD operations
- Search and filter
- Import/export (ready for implementation)

✅ **Class Management**
- Create and manage classes
- Assign teachers
- Track schedules

✅ **Grade Management**
- Enter grades by subject
- View student transcripts
- Grade analytics

✅ **Announcements**
- Create and publish
- Rich text support (ready)
- Category filtering

✅ **Attendance System**
- QR code generation
- Scan to record attendance
- Attendance reports

✅ **Clearance System**
- Check student clearance
- Track liabilities
- Department-wise clearance

✅ **Document Requests**
- Online request submission
- Status tracking
- Request management

✅ **Resource Management**
- Upload and share resources
- Category organization
- Access control

✅ **Gallery**
- Photo uploads
- Album organization
- Responsive masonry layout

✅ **Responsive Design**
- Mobile-friendly
- Tablet optimized
- Desktop enhanced

## Theme & Design

- **Color Scheme**: Dark theme with purple/blue gradients
- **Effects**: Glassmorphism, backdrop blur, smooth animations
- **Typography**: Modern, clean, accessible
- **Icons**: Lucide React icon set
- **Layout**: Responsive grid system

## Browser Support

- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile browsers

## Security Notes

### Current Setup (Mock Data)
- Data stored in browser localStorage
- No server-side validation
- Mock authentication only
- **Not suitable for production with sensitive data**

### For Production
When integrating with a real database:
- ✅ Implement server-side authentication
- ✅ Use HTTPS
- ✅ Add input validation
- ✅ Implement rate limiting
- ✅ Use environment variables for secrets
- ✅ Enable CORS properly
- ✅ Hash passwords (bcrypt)
- ✅ Use JWT or session tokens

See [DATABASE_INTEGRATION_GUIDE.md](./DATABASE_INTEGRATION_GUIDE.md) for security checklist.

## Development

### Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Adding New Features

1. Create component in `/src/app/components` or `/src/app/pages`
2. Add route in `/src/app/routes.ts` (if needed)
3. Update API in `/src/app/utils/api.ts` (if data operations needed)
4. Test with mock data
5. Document in relevant .md files

## Troubleshooting

### App not loading?
- Clear browser cache
- Clear localStorage: `localStorage.clear()`
- Check console for errors (F12)

### Data not persisting?
- Check if localStorage is enabled
- Not in incognito/private mode
- Check storage quota

### Login not working?
- Use exact credentials from table above
- Clear localStorage and try again
- Check browser console for errors

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is created for Lumbang Integrated National High School.

## Support

For questions or issues:
- Check documentation in `/` directory
- Review code comments
- Check browser console for errors
- Refer to [DATABASE_INTEGRATION_GUIDE.md](./DATABASE_INTEGRATION_GUIDE.md)

## Roadmap

### Completed ✅
- Student management
- Class management
- Grade management
- Announcements
- Resources
- Gallery
- Attendance (QR-based)
- Clearance checking
- Document requests
- Mobile responsive design
- Supabase removal

### Future Enhancements 🚀
- Real-time notifications
- Email integration
- SMS notifications
- Advanced analytics
- Report generation (PDF)
- Calendar integration
- Parent portal
- Alumni portal
- Online payments
- Chat/messaging system

---

**Made with ❤️ for Lumbang Integrated National High School**

🎓 Empowering education through technology
