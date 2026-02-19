import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import useAuthStore from './store/authStore';

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
import ManageCurriculum from './pages/instructor/ManageCurriculum';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import EnrollmentApprovals from './pages/admin/EnrollmentApprovals';
import UserManagement from './pages/admin/UserManagement';

function App() {
  const { isAuthenticated, user } = useAuthStore();

  return (
    <Router>
      {/* Toast Notifications */}
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
            iconTheme: {
              primary: '#4ade80',
              secondary: '#fff',
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
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

          {/* Instructor Routes */}
          <Route
            path="/instructor/dashboard"
            element={
              <ProtectedRoute allowedRoles={['instructor', 'admin']}>
                <InstructorDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/instructor/courses/create"
            element={
              <ProtectedRoute allowedRoles={['instructor', 'admin']}>
                <CreateCourse />
              </ProtectedRoute>
            }
          />
          <Route
            path="/instructor/courses/:courseId/curriculum"
            element={
              <ProtectedRoute allowedRoles={['instructor', 'admin']}>
                <ManageCurriculum />
              </ProtectedRoute>
            }
          />
          <Route
            path="/instructor/courses/:courseId/edit"
            element={
              <ProtectedRoute allowedRoles={['instructor', 'admin']}>
                <CreateCourse />
              </ProtectedRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/enrollments"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <EnrollmentApprovals />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <UserManagement />
              </ProtectedRoute>
            }
          />

          {/* 404 - Not Found */}
          <Route path="*" element={<div className="p-8"><h1 className="text-4xl font-bold">404 - Page Not Found</h1></div>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App
