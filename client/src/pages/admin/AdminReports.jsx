import { useState, useEffect } from 'react';
import {
  BarChart2, Users, BookOpen, ClipboardCheck,
  TrendingUp, Award,
} from 'lucide-react';
import { getReportsData, getDashboardStats } from '../../services/adminService';
import toast from 'react-hot-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function formatMonth(year, month) {
  return `${MONTH_NAMES[month - 1]} ${String(year).slice(2)}`;
}

function BarChart({ data, valueKey, labelKey, color = 'bg-primary' }) {
  const max = Math.max(...data.map((d) => d[valueKey] || 0), 1);
  return (
    <div className="flex items-end gap-2 h-36">
      {data.map((item, i) => {
        const pct = ((item[valueKey] || 0) / max) * 100;
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1 min-w-0">
            <span className="text-xs font-medium text-foreground">{item[valueKey] || 0}</span>
            <div className="w-full flex items-end" style={{ height: '100px' }}>
              <div className={`w-full ${color} rounded-t transition-all`} style={{ height: `${Math.max(pct, 2)}%` }} />
            </div>
            <span className="text-xs text-muted-foreground truncate w-full text-center">{item[labelKey]}</span>
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
      <span className="text-sm text-muted-foreground w-20 flex-shrink-0">{label}</span>
      <Progress value={Number(pct)} className="flex-1 h-3" />
      <span className="text-sm font-semibold w-8 text-right">{value}</span>
      <span className="text-xs text-muted-foreground w-10 text-right">{pct}%</span>
    </div>
  );
}

export default function AdminReports() {
  const [reports, setReports] = useState(null);
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [reportsData, statsData] = await Promise.all([
        getReportsData(),
        getDashboardStats(),
      ]);
      setReports(reportsData.data);
      setOverview(statsData.data?.stats);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load reports data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 max-w-7xl mx-auto space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </div>
    );
  }

  const enrollmentStatus = reports?.enrollments?.byStatus || {};
  const totalEnrollments =
    (enrollmentStatus.pending || 0) + (enrollmentStatus.approved || 0) +
    (enrollmentStatus.rejected || 0) + (enrollmentStatus.cancelled || 0);

  const courseStatus = reports?.courses?.byStatus || {};
  const totalCourses = (courseStatus.published || 0) + (courseStatus.draft || 0) + (courseStatus.archived || 0);

  const userRoles = reports?.users?.byRole || {};
  const totalUsers = (userRoles.student || 0) + (userRoles.instructor || 0) + (userRoles.admin || 0);

  const enrollmentsByMonth = (reports?.enrollments?.byMonth || []).map((m) => ({
    label: formatMonth(m._id.year, m._id.month),
    total: m.total,
  }));

  const usersByMonth = (reports?.users?.byMonth || []).map((m) => ({
    label: formatMonth(m._id.year, m._id.month),
    count: m.count,
  }));

  const topCourses = reports?.courses?.top || [];
  const categoryData = reports?.courses?.byCategory || [];
  const maxCategoryCount = Math.max(...categoryData.map((c) => c.count), 1);

  const overviewCards = [
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
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
    {
      label: 'Total Enrollments',
      value: overview?.enrollments?.total || 0,
      sub: `${overview?.enrollments?.approved || 0} approved`,
      icon: ClipboardCheck,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
    },
    {
      label: 'Pending Approvals',
      value: overview?.enrollments?.pending || 0,
      sub: 'Awaiting review',
      icon: TrendingUp,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
    },
  ];

  return (
    <div className="p-8 bg-muted/30 min-h-full">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <BarChart2 className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Reports & Analytics</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Platform-wide statistics and trends</p>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {overviewCards.map((card) => (
            <Card key={card.label}>
              <CardContent className="p-5">
                <div className={`w-10 h-10 ${card.bg} rounded-lg flex items-center justify-center mb-3`}>
                  <card.icon className={`w-5 h-5 ${card.color}`} />
                </div>
                <p className="text-2xl font-bold">{card.value}</p>
                <p className="text-sm font-medium text-muted-foreground mt-0.5">{card.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{card.sub}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Trend Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="border-b py-4">
              <CardTitle className="text-base">Enrollment Trends</CardTitle>
              <p className="text-xs text-muted-foreground">New enrollment requests — last 6 months</p>
            </CardHeader>
            <CardContent className="p-6">
              {enrollmentsByMonth.length > 0 ? (
                <>
                  <BarChart data={enrollmentsByMonth} valueKey="total" labelKey="label" color="bg-primary" />
                  <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <span className="inline-block w-3 h-3 rounded bg-primary" />
                      Total requests
                    </span>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-36 text-muted-foreground text-sm">
                  No enrollment data for the last 6 months
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="border-b py-4">
              <CardTitle className="text-base">New Registrations</CardTitle>
              <p className="text-xs text-muted-foreground">New users registered — last 6 months</p>
            </CardHeader>
            <CardContent className="p-6">
              {usersByMonth.length > 0 ? (
                <>
                  <BarChart data={usersByMonth} valueKey="count" labelKey="label" color="bg-indigo-500" />
                  <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <span className="inline-block w-3 h-3 rounded bg-indigo-500" />
                      New users
                    </span>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-36 text-muted-foreground text-sm">
                  No registration data for the last 6 months
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Status Breakdowns */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="border-b py-4">
              <CardTitle className="text-base">Enrollment Status</CardTitle>
              <p className="text-xs text-muted-foreground">Breakdown by approval status</p>
            </CardHeader>
            <CardContent className="p-6 space-y-3">
              <StatusBar label="Approved" value={enrollmentStatus.approved || 0} total={totalEnrollments} color="bg-emerald-500" />
              <StatusBar label="Pending" value={enrollmentStatus.pending || 0} total={totalEnrollments} color="bg-amber-400" />
              <StatusBar label="Rejected" value={enrollmentStatus.rejected || 0} total={totalEnrollments} color="bg-destructive" />
              <StatusBar label="Cancelled" value={enrollmentStatus.cancelled || 0} total={totalEnrollments} color="bg-muted-foreground" />
              <div className="pt-4 border-t">
                <p className="text-2xl font-bold">{totalEnrollments}</p>
                <p className="text-xs text-muted-foreground">Total enrollment requests</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="border-b py-4">
              <CardTitle className="text-base">Course Status</CardTitle>
              <p className="text-xs text-muted-foreground">Breakdown by publication status</p>
            </CardHeader>
            <CardContent className="p-6 space-y-3">
              <StatusBar label="Published" value={courseStatus.published || 0} total={totalCourses} color="bg-emerald-500" />
              <StatusBar label="Draft" value={courseStatus.draft || 0} total={totalCourses} color="bg-muted-foreground" />
              <StatusBar label="Archived" value={courseStatus.archived || 0} total={totalCourses} color="bg-amber-400" />
              <div className="pt-4 border-t">
                <p className="text-2xl font-bold">{totalCourses}</p>
                <p className="text-xs text-muted-foreground">Total courses on platform</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="border-b py-4">
              <CardTitle className="text-base">User Roles</CardTitle>
              <p className="text-xs text-muted-foreground">Breakdown by account type</p>
            </CardHeader>
            <CardContent className="p-6 space-y-3">
              <StatusBar label="Students" value={userRoles.student || 0} total={totalUsers} color="bg-primary" />
              <StatusBar label="Instructors" value={userRoles.instructor || 0} total={totalUsers} color="bg-indigo-500" />
              <StatusBar label="Admins" value={userRoles.admin || 0} total={totalUsers} color="bg-destructive" />
              <div className="pt-4 border-t">
                <p className="text-2xl font-bold">{totalUsers}</p>
                <p className="text-xs text-muted-foreground">Total registered users</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Top Courses + Category */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-8">
          <Card>
            <CardHeader className="border-b py-4">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-500" />
                <CardTitle className="text-base">Top Courses by Enrollment</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {topCourses.length > 0 ? (
                <div className="space-y-3">
                  {topCourses.map((course, idx) => {
                    const maxEnrollment = topCourses[0]?.enrollmentCount || 1;
                    const pct = ((course.enrollmentCount || 0) / maxEnrollment) * 100;
                    return (
                      <div key={course._id} className="flex items-center gap-3">
                        <span className={`text-sm font-bold w-5 flex-shrink-0 ${
                          idx === 0 ? 'text-amber-500' : idx === 1 ? 'text-slate-400' : idx === 2 ? 'text-orange-400' : 'text-muted-foreground'
                        }`}>
                          {idx + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{course.title}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Progress value={pct} className="flex-1 h-1.5" />
                            <span className="text-xs text-muted-foreground flex-shrink-0">{course.enrollmentCount} enrolled</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">
                  No published courses yet
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="border-b py-4">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-emerald-500" />
                <CardTitle className="text-base">Courses by Category</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {categoryData.length > 0 ? (
                <div className="space-y-3">
                  {categoryData.map((cat) => (
                    <div key={cat._id} className="flex items-center gap-3">
                      <span className="text-sm text-muted-foreground w-32 flex-shrink-0 truncate">{cat._id}</span>
                      <Progress
                        value={Math.round((cat.count / maxCategoryCount) * 100)}
                        className="flex-1 h-2.5"
                      />
                      <span className="text-sm font-semibold w-6 text-right">{cat.count}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">
                  No course data available
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
