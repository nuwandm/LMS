import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Users,
  Clock,
  DollarSign,
  Plus,
  MoreHorizontal,
  TrendingUp,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import Navbar from '../../components/common/Navbar';
import { getInstructorCourses } from '../../services/courseService';
import { getAllEnrollments, approveEnrollment, rejectEnrollment } from '../../services/enrollmentService';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';

const InstructorDashboard = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [enrollmentRequests, setEnrollmentRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isApproving, setIsApproving] = useState({});

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);

      // Fetch instructor's courses
      const coursesResponse = await getInstructorCourses();
      if (coursesResponse.success) {
        setCourses(coursesResponse.data);
      }

      // Fetch pending enrollment requests for instructor's courses
      const enrollmentsResponse = await getAllEnrollments({ status: 'pending', limit: 5 });
      if (enrollmentsResponse.success) {
        // Filter only enrollments for this instructor's courses
        const instructorEnrollments = enrollmentsResponse.data.enrollments.filter(
          (enrollment) => enrollment.course?.instructor?._id === user._id || enrollment.course?.instructor === user._id
        );
        setEnrollmentRequests(instructorEnrollments);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveEnrollment = async (enrollmentId) => {
    try {
      setIsApproving((prev) => ({ ...prev, [enrollmentId]: true }));
      const response = await approveEnrollment(enrollmentId, 'Approved by instructor');

      if (response.success) {
        toast.success('Enrollment approved successfully!');
        // Remove from pending list
        setEnrollmentRequests((prev) => prev.filter((e) => e._id !== enrollmentId));
      }
    } catch (error) {
      console.error('Error approving enrollment:', error);
      toast.error('Failed to approve enrollment');
    } finally {
      setIsApproving((prev) => ({ ...prev, [enrollmentId]: false }));
    }
  };

  const handleRejectEnrollment = async (enrollmentId) => {
    try {
      setIsApproving((prev) => ({ ...prev, [enrollmentId]: true }));
      const response = await rejectEnrollment(enrollmentId, 'Rejected by instructor');

      if (response.success) {
        toast.success('Enrollment rejected');
        // Remove from pending list
        setEnrollmentRequests((prev) => prev.filter((e) => e._id !== enrollmentId));
      }
    } catch (error) {
      console.error('Error rejecting enrollment:', error);
      toast.error('Failed to reject enrollment');
    } finally {
      setIsApproving((prev) => ({ ...prev, [enrollmentId]: false }));
    }
  };

  // Calculate stats
  const stats = {
    totalCourses: courses.length,
    publishedCourses: courses.filter((c) => c.status === 'published').length,
    totalStudents: courses.reduce((sum, course) => sum + (course.enrollmentCount || 0), 0),
    pendingApprovals: enrollmentRequests.length,
    totalRevenue: courses.reduce((sum, course) => sum + (course.price * (course.enrollmentCount || 0)), 0),
  };

  // Get status badge
  const getStatusBadge = (status) => {
    const badges = {
      published: 'bg-green-100 text-green-800',
      draft: 'bg-gray-100 text-gray-800',
      archived: 'bg-yellow-100 text-yellow-800',
    };
    return badges[status] || badges.draft;
  };

  // Format time ago
  const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    const intervals = {
      year: 31536000,
      month: 2592000,
      week: 604800,
      day: 86400,
      hour: 3600,
      minute: 60,
    };

    for (const [unit, secondsInUnit] of Object.entries(intervals)) {
      const interval = Math.floor(seconds / secondsInUnit);
      if (interval >= 1) {
        return `${interval}${unit.charAt(0)} ago`;
      }
    }
    return 'Just now';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="animate-pulse space-y-8">
            <div className="h-32 bg-gray-200 rounded-xl" />
            <div className="grid grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-xl" />
              ))}
            </div>
            <div className="h-96 bg-gray-200 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="flex-1 overflow-y-auto p-8 bg-gray-50">
        <div className="max-w-7xl mx-auto flex flex-col gap-8">
          {/* Welcome Section */}
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome back, {user?.name}! 👋
            </h1>
            <p className="text-gray-500">Here's what's happening with your courses today.</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1: Total Courses */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex flex-col gap-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
                  <BookOpen className="w-6 h-6" />
                </div>
                <span className="flex items-center text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +{stats.publishedCourses}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Total Courses</p>
                <h4 className="text-3xl font-bold text-gray-900 mt-1">{stats.totalCourses}</h4>
              </div>
            </div>

            {/* Card 2: Total Students */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex flex-col gap-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div className="p-3 bg-indigo-50 rounded-lg text-indigo-600">
                  <Users className="w-6 h-6" />
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Total Students</p>
                <h4 className="text-3xl font-bold text-gray-900 mt-1">
                  {stats.totalStudents.toLocaleString()}
                </h4>
              </div>
            </div>

            {/* Card 3: Pending Approvals */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex flex-col gap-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div className="p-3 bg-amber-50 rounded-lg text-amber-600">
                  <Clock className="w-6 h-6" />
                </div>
                {stats.pendingApprovals > 0 && (
                  <span className="flex items-center text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
                    New
                  </span>
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Pending Approvals</p>
                <h4 className="text-3xl font-bold text-gray-900 mt-1">{stats.pendingApprovals}</h4>
              </div>
            </div>

            {/* Card 4: Total Revenue */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex flex-col gap-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div className="p-3 bg-green-50 rounded-lg text-green-600">
                  <DollarSign className="w-6 h-6" />
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                <h4 className="text-3xl font-bold text-gray-900 mt-1">
                  ${stats.totalRevenue.toLocaleString()}
                </h4>
              </div>
            </div>
          </div>

          {/* Main Grid Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-8">
            {/* My Courses Table (2/3 width) */}
            <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-100 flex flex-col">
              <div className="p-6 border-b border-gray-100 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">My Courses</h3>
                  <p className="text-sm text-gray-500">Manage your active courses and drafts.</p>
                </div>
                <Link
                  to="/instructor/courses/create"
                  className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
                >
                  <Plus className="w-5 h-5" />
                  Add New Course
                </Link>
              </div>

              {courses.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                      <BookOpen className="w-8 h-8 text-gray-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2">No courses yet</h3>
                      <p className="text-gray-500 mb-6">Create your first course and start teaching!</p>
                      <Link
                        to="/instructor/courses/create"
                        className="inline-block bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
                      >
                        Create Your First Course
                      </Link>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-100">
                        <tr>
                          <th className="px-6 py-4">Course Title</th>
                          <th className="px-6 py-4 hidden sm:table-cell">Category</th>
                          <th className="px-6 py-4">Status</th>
                          <th className="px-6 py-4 text-center">Students</th>
                          <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {courses.slice(0, 5).map((course) => (
                          <tr
                            key={course._id}
                            className="hover:bg-gray-50 transition-colors group"
                          >
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="h-10 w-16 bg-gradient-to-br from-primary-400 to-primary-600 rounded overflow-hidden flex-shrink-0">
                                  {course.thumbnail ? (
                                    <img
                                      src={course.thumbnail}
                                      alt={course.title}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                      <BookOpen className="w-5 h-5 text-white" />
                                    </div>
                                  )}
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900 line-clamp-1">
                                    {course.title}
                                  </p>
                                  <p className="text-xs text-gray-500 sm:hidden">
                                    {course.category}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-gray-600 hidden sm:table-cell">
                              {course.category}
                            </td>
                            <td className="px-6 py-4">
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(
                                  course.status
                                )}`}
                              >
                                {course.status.charAt(0).toUpperCase() + course.status.slice(1)}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-center font-medium text-gray-900">
                              {course.status === 'published' ? course.enrollmentCount || 0 : '-'}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <Link
                                to={`/instructor/courses/${course._id}`}
                                className="text-gray-400 hover:text-primary-600 transition-colors"
                              >
                                <MoreHorizontal className="w-5 h-5" />
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="p-4 border-t border-gray-100 text-center">
                    <Link
                      to="/instructor/courses"
                      className="text-sm font-medium text-primary-600 hover:underline"
                    >
                      View All Courses
                    </Link>
                  </div>
                </>
              )}
            </div>

            {/* Enrollment Requests (1/3 width) */}
            <div className="lg:col-span-1 bg-white rounded-lg shadow-sm border border-gray-100 flex flex-col h-fit">
              <div className="p-6 border-b border-gray-100">
                <h3 className="text-lg font-bold text-gray-900">Recent Enrollment Requests</h3>
                <p className="text-sm text-gray-500">Review student access requests.</p>
              </div>

              {enrollmentRequests.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Clock className="w-6 h-6 text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-500">No pending requests</p>
                </div>
              ) : (
                <>
                  <div className="flex flex-col p-4 gap-4">
                    {enrollmentRequests.map((enrollment) => (
                      <div
                        key={enrollment._id}
                        className="flex flex-col gap-3 p-4 bg-gray-50 rounded-lg border border-gray-100"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                            <span className="text-primary-600 font-bold text-sm">
                              {enrollment.student?.name?.charAt(0) || '?'}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">
                              {enrollment.student?.name || 'Unknown Student'}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              {enrollment.course?.title || 'Unknown Course'}
                            </p>
                          </div>
                          <span className="text-xs text-gray-400 whitespace-nowrap">
                            {timeAgo(enrollment.createdAt)}
                          </span>
                        </div>
                        <div className="flex gap-2 mt-1">
                          <button
                            onClick={() => handleApproveEnrollment(enrollment._id)}
                            disabled={isApproving[enrollment._id]}
                            className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 bg-primary-600 hover:bg-primary-700 text-white text-xs font-medium rounded transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <CheckCircle className="w-3 h-3" />
                            Approve
                          </button>
                          <button
                            onClick={() => handleRejectEnrollment(enrollment._id)}
                            disabled={isApproving[enrollment._id]}
                            className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 border border-gray-300 text-gray-700 hover:bg-gray-100 text-xs font-medium rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <XCircle className="w-3 h-3" />
                            Reject
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="p-4 border-t border-gray-100 text-center mt-auto">
                    <button className="text-sm font-medium text-primary-600 hover:underline">
                      View All Requests
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default InstructorDashboard;
