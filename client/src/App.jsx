import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import useAuthStore from './store/authStore';

// Layout components
import AdminLayout from './layouts/AdminLayout';
import InstructorLayout from './layouts/InstructorLayout';

// Import components
import ProtectedRoute from './components/common/ProtectedRoute';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';

// Student Pages
import Home from './pages/student/Home';
import CourseList from './pages/student/CourseList';
import CourseDetail from './pages/student/CourseDetail';
import MyLearning from './pages/student/MyLearning';
import VideoPlayer from './pages/student/VideoPlayer';

// Instructor Pages
import InstructorDashboard from './pages/instructor/InstructorDashboard';
import CreateCourse from './pages/instructor/CreateCourse';
import MyCourses from './pages/instructor/MyCourses';
import ManageCurriculum from './pages/instructor/ManageCurriculum';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import EnrollmentApprovals from './pages/admin/EnrollmentApprovals';
import UserManagement from './pages/admin/UserManagement';
import AdminCourses from './pages/admin/AdminCourses';

function App() {
  const { isAuthenticated, user } = useAuthStore();

  return (
    <Router>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: { primary: '#4ade80', secondary: '#fff' },
          },
          error: {
            duration: 4000,
            iconTheme: { primary: '#ef4444', secondary: '#fff' },
          },
        }}
      />

      <div className="min-h-screen">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/courses" element={<CourseList />} />
          <Route path="/courses/:id" element={<CourseDetail />} />

          {/* Auth Routes - redirect if already logged in */}
          <Route
            path="/login"
            element={
              isAuthenticated ? (
                user?.role === 'instructor' ? (
                  <Navigate to="/instructor/dashboard" replace />
                ) : user?.role === 'admin' ? (
                  <Navigate to="/admin/dashboard" replace />
                ) : (
                  <Navigate to="/" replace />
                )
              ) : (
                <Login />
              )
            }
          />
          <Route
            path="/register"
            element={isAuthenticated ? <Navigate to="/" replace /> : <Register />}
          />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />

          {/* Student Routes */}
          <Route
            path="/my-learning"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <MyLearning />
              </ProtectedRoute>
            }
          />
          <Route
            path="/learn/:courseId"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <VideoPlayer />
              </ProtectedRoute>
            }
          />

          {/* Instructor Routes — wrapped in InstructorLayout */}
          <Route
            element={
              <ProtectedRoute allowedRoles={['instructor', 'admin']}>
                <InstructorLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/instructor/dashboard" element={<InstructorDashboard />} />
            <Route path="/instructor/courses" element={<MyCourses />} />
            <Route path="/instructor/courses/create" element={<CreateCourse />} />
            <Route path="/instructor/courses/:courseId/curriculum" element={<ManageCurriculum />} />
            <Route path="/instructor/courses/:courseId/edit" element={<CreateCourse />} />
          </Route>

          {/* Admin Routes — wrapped in AdminLayout */}
          <Route
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/courses" element={<AdminCourses />} />
            <Route path="/admin/enrollments" element={<EnrollmentApprovals />} />
            <Route path="/admin/users" element={<UserManagement />} />
            <Route path="/admin/reports" element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="/admin/settings" element={<Navigate to="/admin/dashboard" replace />} />
          </Route>

          {/* 404 */}
          <Route
            path="*"
            element={
              <div className="p-8">
                <h1 className="text-4xl font-bold">404 - Page Not Found</h1>
              </div>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
