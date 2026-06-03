import { createBrowserRouter } from "react-router-dom";
import Root from "./pages/Root";
import PublicLayout from "./pages/PublicLayout";
import AuthenticatedLayout from "./pages/AuthenticatedLayout";
import Home from "./pages/Home";
import SchoolInfo from "./pages/SchoolInfo";
import Announcements from "./pages/Announcements";
import Resources from "./pages/Resources";
import Gallery from "./pages/Gallery";
import TeacherLogin from "./pages/TeacherLogin";
import TeacherDashboard from "./pages/TeacherDashboard";
import Students from "./pages/teacher/Students";
import Classes from "./pages/teacher/Classes";
import Grades from "./pages/teacher/Grades";
import TeacherAnnouncements from "./pages/teacher/TeacherAnnouncements";
import Settings from "./pages/teacher/Settings";
import ClearanceCheck from "./pages/ClearanceCheck";
import DocumentRequest from "./pages/DocumentRequest";
import NotFound from "./pages/NotFound";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      // Public routes with navigation and footer
      {
        Component: PublicLayout,
        children: [
          { index: true, Component: Home },
          { path: "school-info", Component: SchoolInfo },
          { path: "announcements", Component: Announcements },
          { path: "resources", Component: Resources },
          { path: "gallery", Component: Gallery },
          { path: "clearance", Component: ClearanceCheck },
          { path: "document-request", Component: DocumentRequest },
          { path: "teacher/login", Component: TeacherLogin },
        ],
      },
      // Authenticated routes with sidebar navigation
      {
        path: "teacher",
        Component: AuthenticatedLayout,
        children: [
          { path: "dashboard", Component: TeacherDashboard },
          { path: "students", Component: Students },
          { path: "classes", Component: Classes },
          { path: "grades", Component: Grades },
          { path: "announcements", Component: TeacherAnnouncements },
          { path: "settings", Component: Settings },
        ],
      },
      // 404
      { path: "*", Component: NotFound },
    ],
  },
]);