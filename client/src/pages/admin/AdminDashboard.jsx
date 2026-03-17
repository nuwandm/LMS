import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users, BookOpen, ClipboardCheck, CheckCircle,
  TrendingUp, Clock, BarChart2
} from 'lucide-react';
import { getDashboardStats } from '../../services/adminService';
import Spinner from '../../components/common/Spinner';
import EmptyState from '../../components/common/EmptyState';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const data = await getDashboardStats();
      setStats(data.data?.stats || null);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
      toast.error(error.response?.data?.message || 'Failed to load dashboard stats');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Users',
      value: stats?.users?.total || 0,
      icon: Users,
      color: 'bg-blue-500',
      subtitle: `${stats?.users?.students || 0} students`,
    },
    {
      title: 'Total Courses',
      value: stats?.courses?.total || 0,
      icon: BookOpen,
      color: 'bg-green-500',
      subtitle: `${stats?.courses?.published || 0} published`,
    },
    {
      title: 'Pending Enrollments',
      value: stats?.enrollments?.pending || 0,
      icon: Clock,
      color: 'bg-yellow-500',
      subtitle: 'Awaiting approval',
    },
    {
      title: 'Approved Enrollments',
      value: stats?.enrollments?.approved || 0,
      icon: CheckCircle,
      color: 'bg-purple-500',
      subtitle: `${stats?.enrollments?.total || 0} total requests`,
    },
  ];

  const recentEnrollments = stats?.recent?.enrollments || [];
  const recentUsers = stats?.recent?.users || [];
  const topCourses = stats?.recent?.courses || [];

  const totalUsers = stats?.users?.total || 1;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="mt-1 text-sm text-gray-500">
                Manage your learning platform
              </p>
            </div>
            <div className="flex gap-3">
              <Link
                to="/admin/enrollments"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                View Enrollments
              </Link>
              <Link
                to="/admin/users"
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              >
                Manage Users
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`${stat.color} w-12 h-12 rounded-lg flex items-center justify-center`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                {stat.trend && (
                  <span className="text-green-600 text-sm font-medium flex items-center">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    {stat.trend}
                  </span>
                )}
              </div>
              <h3 className="text-gray-500 text-sm font-medium mb-1">{stat.title}</h3>
              <p className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</p>
              <p className="text-gray-400 text-sm">{stat.subtitle}</p>
            </div>
          ))}
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Enrollments */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Recent Enrollment Requests</h2>
                <Link
                  to="/admin/enrollments"
                  className="text-blue-600 text-sm font-medium hover:text-blue-700"
                >
                  View All
                </Link>
              </div>
            </div>
            <div className="p-6">
              {recentEnrollments.length > 0 ? (
                <div className="space-y-4">
                  {recentEnrollments.slice(0, 5).map((enrollment) => (
                    <div
                      key={enrollment._id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-blue-600 font-semibold text-sm">
                            {enrollment.student?.name?.charAt(0) || 'S'}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{enrollment.student?.name || 'Student'}</p>
                          <p className="text-sm text-gray-500 truncate max-w-[180px]">{enrollment.course?.title || 'Course'}</p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium flex-shrink-0 ${
                        enrollment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        enrollment.status === 'approved' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {enrollment.status}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={ClipboardCheck}
                  title="No enrollment requests"
                  description="New enrollment requests will appear here"
                />
              )}
            </div>
          </div>

          {/* Recent Users */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Recently Registered Users</h2>
                <Link
                  to="/admin/users"
                  className="text-blue-600 text-sm font-medium hover:text-blue-700"
                >
                  View All
                </Link>
              </div>
            </div>
            <div className="p-6">
              {recentUsers.length > 0 ? (
                <div className="space-y-4">
                  {recentUsers.slice(0, 5).map((user) => (
                    <div
                      key={user._id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                          {user.avatar ? (
                            <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" />
                          ) : (
                            <span className="text-purple-600 font-semibold text-sm">
                              {user.name?.charAt(0) || 'U'}
                            </span>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{user.name}</p>
                          <p className="text-sm text-gray-500 truncate max-w-[180px]">{user.email}</p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium flex-shrink-0 ${
                        user.role === 'admin' ? 'bg-red-100 text-red-800' :
                        user.role === 'instructor' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {user.role}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={Users}
                  title="No recent users"
                  description="Recently registered users will appear here"
                />
              )}
            </div>
          </div>
        </div>

        {/* Bottom Row: Role Distribution + Top Courses */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* User Distribution */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">User Distribution by Role</h2>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-3xl font-bold text-gray-900 mb-1">
                  {stats?.users?.students || 0}
                </div>
                <div className="text-sm text-gray-600 font-medium">Students</div>
                <div className="text-xs text-gray-400 mt-1">
                  {((stats?.users?.students || 0) / totalUsers * 100).toFixed(1)}%
                </div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-3xl font-bold text-blue-600 mb-1">
                  {stats?.users?.instructors || 0}
                </div>
                <div className="text-sm text-gray-600 font-medium">Instructors</div>
                <div className="text-xs text-gray-400 mt-1">
                  {((stats?.users?.instructors || 0) / totalUsers * 100).toFixed(1)}%
                </div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-3xl font-bold text-purple-600 mb-1">
                  {stats?.users?.admins || 0}
                </div>
                <div className="text-sm text-gray-600 font-medium">Admins</div>
                <div className="text-xs text-gray-400 mt-1">
                  {((stats?.users?.admins || 0) / totalUsers * 100).toFixed(1)}%
                </div>
              </div>
            </div>

            {/* Enrollment status breakdown */}
            <div className="mt-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Enrollment Status</h3>
              <div className="space-y-2">
                {[
                  { label: 'Approved', value: stats?.enrollments?.approved || 0, color: 'bg-green-500' },
                  { label: 'Pending', value: stats?.enrollments?.pending || 0, color: 'bg-yellow-500' },
                  { label: 'Rejected', value: stats?.enrollments?.rejected || 0, color: 'bg-red-500' },
                ].map((item) => {
                  const total = stats?.enrollments?.total || 1;
                  const pct = ((item.value / total) * 100).toFixed(0);
                  return (
                    <div key={item.label} className="flex items-center gap-3">
                      <span className="text-xs text-gray-500 w-16">{item.label}</span>
                      <div className="flex-1 bg-gray-100 rounded-full h-2">
                        <div
                          className={`${item.color} h-2 rounded-full transition-all`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium text-gray-700 w-8 text-right">{item.value}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Top Courses */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Top Courses by Enrollment</h2>
              <Link
                to="/admin/reports"
                className="text-blue-600 text-sm font-medium hover:text-blue-700 flex items-center gap-1"
              >
                <BarChart2 className="w-4 h-4" />
                Full Report
              </Link>
            </div>
            {topCourses.length > 0 ? (
              <div className="space-y-3">
                {topCourses.slice(0, 5).map((course, idx) => (
                  <div key={course._id} className="flex items-center gap-3">
                    <span className="text-sm font-bold text-gray-400 w-5 flex-shrink-0">
                      {idx + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{course.title}</p>
                      <p className="text-xs text-gray-400">{course.category}</p>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <Users className="w-3.5 h-3.5 text-gray-400" />
                      <span className="text-sm font-semibold text-gray-700">{course.enrollmentCount}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={BookOpen}
                title="No published courses"
                description="Published courses will appear here ranked by enrollment"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
