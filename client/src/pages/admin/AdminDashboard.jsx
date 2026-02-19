import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users, BookOpen, ClipboardCheck, DollarSign,
  TrendingUp, AlertCircle, CheckCircle, Clock
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
      setStats(data.data);
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
      value: stats?.totalUsers || 0,
      icon: Users,
      color: 'bg-blue-500',
      change: '+12%',
      subtitle: `${stats?.activeUsers || 0} active users`,
    },
    {
      title: 'Total Courses',
      value: stats?.totalCourses || 0,
      icon: BookOpen,
      color: 'bg-green-500',
      change: '+8%',
      subtitle: `${stats?.publishedCourses || 0} published`,
    },
    {
      title: 'Pending Enrollments',
      value: stats?.pendingEnrollments || 0,
      icon: Clock,
      color: 'bg-yellow-500',
      change: '',
      subtitle: 'Awaiting approval',
    },
    {
      title: 'Total Revenue',
      value: `$${stats?.totalRevenue || 0}`,
      icon: DollarSign,
      color: 'bg-purple-500',
      change: '+15%',
      subtitle: 'This month',
    },
  ];

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
                {stat.change && (
                  <span className="text-green-600 text-sm font-medium flex items-center">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    {stat.change}
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
              {stats?.recentEnrollments && stats.recentEnrollments.length > 0 ? (
                <div className="space-y-4">
                  {stats.recentEnrollments.slice(0, 5).map((enrollment) => (
                    <div
                      key={enrollment._id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-semibold text-sm">
                            {enrollment.student?.name?.charAt(0) || 'S'}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{enrollment.student?.name || 'Student'}</p>
                          <p className="text-sm text-gray-500">{enrollment.course?.title || 'Course'}</p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
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
              {stats?.recentUsers && stats.recentUsers.length > 0 ? (
                <div className="space-y-4">
                  {stats.recentUsers.slice(0, 5).map((user) => (
                    <div
                      key={user._id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                          <span className="text-purple-600 font-semibold text-sm">
                            {user.name?.charAt(0) || 'U'}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{user.name}</p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
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

        {/* Role Distribution */}
        <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">User Distribution by Role</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-gray-50 rounded-lg">
              <div className="text-3xl font-bold text-gray-900 mb-2">
                {stats?.studentCount || 0}
              </div>
              <div className="text-gray-600">Students</div>
              <div className="text-sm text-gray-400 mt-1">
                {((stats?.studentCount || 0) / (stats?.totalUsers || 1) * 100).toFixed(1)}% of total
              </div>
            </div>
            <div className="text-center p-6 bg-blue-50 rounded-lg">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {stats?.instructorCount || 0}
              </div>
              <div className="text-gray-600">Instructors</div>
              <div className="text-sm text-gray-400 mt-1">
                {((stats?.instructorCount || 0) / (stats?.totalUsers || 1) * 100).toFixed(1)}% of total
              </div>
            </div>
            <div className="text-center p-6 bg-purple-50 rounded-lg">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {stats?.adminCount || 0}
              </div>
              <div className="text-gray-600">Admins</div>
              <div className="text-sm text-gray-400 mt-1">
                {((stats?.adminCount || 0) / (stats?.totalUsers || 1) * 100).toFixed(1)}% of total
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
