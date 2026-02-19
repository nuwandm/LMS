import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Users,
  DollarSign,
  Plus,
  MoreHorizontal,
  TrendingUp,
  Edit,
  Eye,
} from 'lucide-react';
import EmptyState from '../../components/common/EmptyState';
import { getInstructorCourses } from '../../services/courseService';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';

const InstructorDashboard = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);

      // Fetch instructor's courses
      const coursesResponse = await getInstructorCourses();

      // Safely handle different response formats
      if (coursesResponse.success) {
        const coursesData = Array.isArray(coursesResponse.data)
          ? coursesResponse.data
          : coursesResponse.data?.courses || [];
        setCourses(coursesData);
      } else {
        setCourses([]);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load courses');
      setCourses([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate stats
  const stats = {
    totalCourses: Array.isArray(courses) ? courses.length : 0,
    publishedCourses: Array.isArray(courses) ? courses.filter((c) => c.status === 'published').length : 0,
    totalStudents: Array.isArray(courses) ? courses.reduce((sum, course) => sum + (course.enrollmentCount || 0), 0) : 0,
    totalRevenue: Array.isArray(courses) ? courses.reduce((sum, course) => sum + (course.price * (course.enrollmentCount || 0)), 0) : 0,
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

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-8 max-w-7xl mx-auto">
          <div className="h-12 bg-gray-200 rounded-xl w-64" />
          <div className="grid grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-xl" />
            ))}
          </div>
          <div className="h-96 bg-gray-200 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <main className="p-8 bg-gray-50">
        <div className="max-w-7xl mx-auto flex flex-col gap-8">
          {/* Welcome Section */}
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome back, {user?.name}! 👋
            </h1>
            <p className="text-gray-500">Here's what's happening with your courses today.</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Card 1: Total Courses */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex flex-col gap-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
                  <BookOpen className="w-6 h-6" />
                </div>
                <span className="flex items-center text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  {stats.publishedCourses} Published
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

            {/* Card 3: Total Revenue */}
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

          {/* My Courses Table */}
          <div className="pb-8">
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 flex flex-col">
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
                <EmptyState
                  icon={BookOpen}
                  title="No courses yet"
                  description="Create your first course and start teaching!"
                  action={
                    <Link
                      to="/instructor/courses/create"
                      className="inline-block bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
                    >
                      Create Your First Course
                    </Link>
                  }
                />
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
          </div>
        </div>
      </main>
  );
};

export default InstructorDashboard;
