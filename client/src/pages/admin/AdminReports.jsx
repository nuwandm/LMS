import { useState, useEffect } from 'react';
import {
  BarChart2, Users, BookOpen, ClipboardCheck,
  TrendingUp, Award
} from 'lucide-react';
import { getReportsData, getDashboardStats } from '../../services/adminService';
import Spinner from '../../components/common/Spinner';
import toast from 'react-hot-toast';

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function formatMonth(year, month) {
  return `${MONTH_NAMES[month - 1]} ${String(year).slice(2)}`;
}

function BarChart({ data, valueKey, labelKey, color = 'bg-blue-500', maxValue }) {
  const max = maxValue || Math.max(...data.map((d) => d[valueKey] || 0), 1);
  return (
    <div className="flex items-end gap-2 h-36">
      {data.map((item, i) => {
        const pct = ((item[valueKey] || 0) / max) * 100;
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1 min-w-0">
            <span className="text-xs font-medium text-gray-700">{item[valueKey] || 0}</span>
            <div className="w-full flex items-end" style={{ height: '100px' }}>
              <div
                className={`w-full ${color} rounded-t transition-all`}
                style={{ height: `${Math.max(pct, 2)}%` }}
              />
            </div>
            <span className="text-xs text-gray-400 truncate w-full text-center">{item[labelKey]}</span>
          </div>
        );
      })}
    </div>
  );
}

function StatusBar({ label, value, total, color }) {
  const pct = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-gray-600 w-20 flex-shrink-0">{label}</span>
      <div className="flex-1 bg-gray-100 rounded-full h-3">
        <div
          className={`${color} h-3 rounded-full transition-all`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-sm font-semibold text-gray-800 w-8 text-right">{value}</span>
      <span className="text-xs text-gray-400 w-10 text-right">{pct}%</span>
    </div>
  );
}

export default function AdminReports() {
  const [reports, setReports] = useState(null);
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [reportsData, statsData] = await Promise.all([
        getReportsData(),
        getDashboardStats(),
      ]);
      setReports(reportsData.data);
      setOverview(statsData.data?.stats);
    } catch (error) {
      console.error('Failed to fetch reports:', error);
      toast.error(error.response?.data?.message || 'Failed to load reports data');
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

  // Enrollment status data
  const enrollmentStatus = reports?.enrollments?.byStatus || {};
  const totalEnrollments =
    (enrollmentStatus.pending || 0) +
    (enrollmentStatus.approved || 0) +
    (enrollmentStatus.rejected || 0) +
    (enrollmentStatus.cancelled || 0);

  // Course status data
  const courseStatus = reports?.courses?.byStatus || {};
  const totalCourses =
    (courseStatus.published || 0) + (courseStatus.draft || 0) + (courseStatus.archived || 0);

  // User role data
  const userRoles = reports?.users?.byRole || {};
  const totalUsers = (userRoles.student || 0) + (userRoles.instructor || 0) + (userRoles.admin || 0);

  // Monthly enrollment data
  const enrollmentsByMonth = (reports?.enrollments?.byMonth || []).map((m) => ({
    label: formatMonth(m._id.year, m._id.month),
    total: m.total,
    approved: m.approved,
    pending: m.pending,
  }));

  // Monthly user data
  const usersByMonth = (reports?.users?.byMonth || []).map((m) => ({
    label: formatMonth(m._id.year, m._id.month),
    count: m.count,
  }));

  // Top courses
  const topCourses = reports?.courses?.top || [];

  // Category breakdown
  const categoryData = reports?.courses?.byCategory || [];

  const maxCategoryCount = Math.max(...categoryData.map((c) => c.count), 1);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <BarChart2 className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
              <p className="mt-0.5 text-sm text-gray-500">
                Platform-wide statistics and trends
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Overview Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              label: 'Total Users',
              value: overview?.users?.total || 0,
              sub: `${overview?.users?.students || 0} students`,
              icon: Users,
              color: 'text-blue-600',
              bg: 'bg-blue-50',
            },
            {
              label: 'Total Courses',
              value: overview?.courses?.total || 0,
              sub: `${overview?.courses?.published || 0} published`,
              icon: BookOpen,
              color: 'text-green-600',
              bg: 'bg-green-50',
            },
            {
              label: 'Total Enrollments',
              value: overview?.enrollments?.total || 0,
              sub: `${overview?.enrollments?.approved || 0} approved`,
              icon: ClipboardCheck,
              color: 'text-purple-600',
              bg: 'bg-purple-50',
            },
            {
              label: 'Pending Approvals',
              value: overview?.enrollments?.pending || 0,
              sub: 'Awaiting review',
              icon: TrendingUp,
              color: 'text-yellow-600',
              bg: 'bg-yellow-50',
            },
          ].map((card) => (
            <div key={card.label} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <div className={`w-10 h-10 ${card.bg} rounded-lg flex items-center justify-center mb-3`}>
                <card.icon className={`w-5 h-5 ${card.color}`} />
              </div>
              <p className="text-2xl font-bold text-gray-900">{card.value}</p>
              <p className="text-sm font-medium text-gray-600 mt-0.5">{card.label}</p>
              <p className="text-xs text-gray-400 mt-0.5">{card.sub}</p>
            </div>
          ))}
        </div>

        {/* Enrollment & User Trends */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Enrollment Trends */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-1">Enrollment Trends</h2>
            <p className="text-xs text-gray-400 mb-5">New enrollment requests — last 6 months</p>
            {enrollmentsByMonth.length > 0 ? (
              <>
                <BarChart
                  data={enrollmentsByMonth}
                  valueKey="total"
                  labelKey="label"
                  color="bg-blue-500"
                />
                <div className="mt-4 flex items-center gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1.5">
                    <span className="inline-block w-3 h-3 rounded bg-blue-500" />
                    Total requests
                  </span>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-36 text-gray-400 text-sm">
                No enrollment data for the last 6 months
              </div>
            )}
          </div>

          {/* New User Registrations */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-1">New Registrations</h2>
            <p className="text-xs text-gray-400 mb-5">New users registered — last 6 months</p>
            {usersByMonth.length > 0 ? (
              <>
                <BarChart
                  data={usersByMonth}
                  valueKey="count"
                  labelKey="label"
                  color="bg-purple-500"
                />
                <div className="mt-4 flex items-center gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1.5">
                    <span className="inline-block w-3 h-3 rounded bg-purple-500" />
                    New users
                  </span>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-36 text-gray-400 text-sm">
                No registration data for the last 6 months
              </div>
            )}
          </div>
        </div>

        {/* Status Breakdowns */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Enrollment Status */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-1">Enrollment Status</h2>
            <p className="text-xs text-gray-400 mb-5">Breakdown by approval status</p>
            <div className="space-y-3">
              <StatusBar label="Approved" value={enrollmentStatus.approved || 0} total={totalEnrollments} color="bg-green-500" />
              <StatusBar label="Pending" value={enrollmentStatus.pending || 0} total={totalEnrollments} color="bg-yellow-400" />
              <StatusBar label="Rejected" value={enrollmentStatus.rejected || 0} total={totalEnrollments} color="bg-red-500" />
              <StatusBar label="Cancelled" value={enrollmentStatus.cancelled || 0} total={totalEnrollments} color="bg-gray-400" />
            </div>
            <div className="mt-5 pt-4 border-t border-gray-100">
              <p className="text-2xl font-bold text-gray-900">{totalEnrollments}</p>
              <p className="text-xs text-gray-400">Total enrollment requests</p>
            </div>
          </div>

          {/* Course Status */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-1">Course Status</h2>
            <p className="text-xs text-gray-400 mb-5">Breakdown by publication status</p>
            <div className="space-y-3">
              <StatusBar label="Published" value={courseStatus.published || 0} total={totalCourses} color="bg-green-500" />
              <StatusBar label="Draft" value={courseStatus.draft || 0} total={totalCourses} color="bg-gray-400" />
              <StatusBar label="Archived" value={courseStatus.archived || 0} total={totalCourses} color="bg-orange-400" />
            </div>
            <div className="mt-5 pt-4 border-t border-gray-100">
              <p className="text-2xl font-bold text-gray-900">{totalCourses}</p>
              <p className="text-xs text-gray-400">Total courses on platform</p>
            </div>
          </div>

          {/* User Role Breakdown */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-1">User Roles</h2>
            <p className="text-xs text-gray-400 mb-5">Breakdown by account type</p>
            <div className="space-y-3">
              <StatusBar label="Students" value={userRoles.student || 0} total={totalUsers} color="bg-blue-500" />
              <StatusBar label="Instructors" value={userRoles.instructor || 0} total={totalUsers} color="bg-indigo-500" />
              <StatusBar label="Admins" value={userRoles.admin || 0} total={totalUsers} color="bg-red-500" />
            </div>
            <div className="mt-5 pt-4 border-t border-gray-100">
              <p className="text-2xl font-bold text-gray-900">{totalUsers}</p>
              <p className="text-xs text-gray-400">Total registered users</p>
            </div>
          </div>
        </div>

        {/* Top Courses + Category Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top 10 Courses */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-5">
              <Award className="w-5 h-5 text-yellow-500" />
              <h2 className="text-base font-semibold text-gray-900">Top Courses by Enrollment</h2>
            </div>
            {topCourses.length > 0 ? (
              <div className="space-y-3">
                {topCourses.map((course, idx) => {
                  const maxEnrollment = topCourses[0]?.enrollmentCount || 1;
                  const pct = ((course.enrollmentCount || 0) / maxEnrollment) * 100;
                  return (
                    <div key={course._id} className="flex items-center gap-3">
                      <span className={`text-sm font-bold w-5 flex-shrink-0 ${
                        idx === 0 ? 'text-yellow-500' : idx === 1 ? 'text-gray-400' : idx === 2 ? 'text-orange-400' : 'text-gray-300'
                      }`}>
                        {idx + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{course.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                            <div
                              className="bg-blue-500 h-1.5 rounded-full"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-500 flex-shrink-0">
                            {course.enrollmentCount} enrolled
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
                No published courses yet
              </div>
            )}
          </div>

          {/* Courses by Category */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-5">
              <BookOpen className="w-5 h-5 text-green-500" />
              <h2 className="text-base font-semibold text-gray-900">Courses by Category</h2>
            </div>
            {categoryData.length > 0 ? (
              <div className="space-y-3">
                {categoryData.map((cat) => (
                  <div key={cat._id} className="flex items-center gap-3">
                    <span className="text-sm text-gray-600 w-32 flex-shrink-0 truncate">{cat._id}</span>
                    <div className="flex-1 bg-gray-100 rounded-full h-2.5">
                      <div
                        className="bg-green-500 h-2.5 rounded-full"
                        style={{ width: `${((cat.count / maxCategoryCount) * 100).toFixed(0)}%` }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-gray-700 w-6 text-right">{cat.count}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
                No course data available
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
