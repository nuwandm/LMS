import { useState, useEffect } from 'react';
import {
  BarChart2, Users, BookOpen, ClipboardCheck,
  TrendingUp, Award,
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';
import { getReportsData, getDashboardStats } from '../../services/adminService';
import toast from 'react-hot-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function formatMonth(year, month) {
  return `${MONTH_NAMES[month - 1]} ${String(year).slice(2)}`;
}

const chartTooltipStyle = {
  backgroundColor: 'hsl(0 0% 100%)',
  border: '1px solid hsl(243 30% 90%)',
  borderRadius: '8px',
  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
  fontSize: '12px',
  color: 'hsl(243 47% 11%)',
};

function DonutChart({ data, total, label }) {
  const filled = data.filter((d) => d.value > 0);
  const display = filled.length > 0 ? filled : [{ name: 'None', value: 1, color: 'hsl(152 20% 88%)' }];
  return (
    <div className="flex flex-col items-center pt-2">
      <div className="relative w-[140px] h-[140px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={display}
              cx="50%"
              cy="50%"
              innerRadius={46}
              outerRadius={65}
              paddingAngle={display.length > 1 ? 3 : 0}
              dataKey="value"
              startAngle={90}
              endAngle={-270}
              strokeWidth={0}
            >
              {display.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={chartTooltipStyle}
              formatter={(val, name) => [val, name]}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-2xl font-bold leading-none">{total}</span>
          <span className="text-[10px] text-muted-foreground mt-0.5">{label}</span>
        </div>
      </div>
      <div className="mt-4 w-full space-y-2">
        {data.map((item, i) => (
          <div key={i} className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-2">
              <span className="inline-block w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
              <span className="text-muted-foreground">{item.name}</span>
            </span>
            <div className="flex items-center gap-2">
              <span className="font-semibold">{item.value}</span>
              <span className="text-muted-foreground w-10 text-right">
                {total > 0 ? `${((item.value / total) * 100).toFixed(0)}%` : '0%'}
              </span>
            </div>
          </div>
        ))}
      </div>
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
          {/* Enrollment Trends — Area Chart */}
          <Card>
            <CardHeader className="border-b py-4">
              <CardTitle className="text-base">Enrollment Trends</CardTitle>
              <p className="text-xs text-muted-foreground">New enrollment requests — last 6 months</p>
            </CardHeader>
            <CardContent className="pt-6 pr-4 pb-4 pl-2">
              {enrollmentsByMonth.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={enrollmentsByMonth} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="enrollGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(243,75%,59%)" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="hsl(243,75%,59%)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(243 30% 92%)" vertical={false} />
                    <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'hsl(243 20% 48%)' }} axisLine={false} tickLine={false} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: 'hsl(243 20% 48%)' }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={chartTooltipStyle} cursor={{ stroke: 'hsl(243,75%,59%)', strokeWidth: 1, strokeDasharray: '4 4' }} />
                    <Area
                      type="monotone"
                      dataKey="total"
                      name="Enrollments"
                      stroke="hsl(243,75%,59%)"
                      strokeWidth={2.5}
                      fill="url(#enrollGrad)"
                      dot={{ r: 4, fill: 'hsl(243,75%,59%)', strokeWidth: 0 }}
                      activeDot={{ r: 6, fill: 'hsl(243,75%,59%)', strokeWidth: 2, stroke: '#fff' }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">
                  No enrollment data for the last 6 months
                </div>
              )}
            </CardContent>
          </Card>

          {/* New Registrations — Bar Chart */}
          <Card>
            <CardHeader className="border-b py-4">
              <CardTitle className="text-base">New Registrations</CardTitle>
              <p className="text-xs text-muted-foreground">New users registered — last 6 months</p>
            </CardHeader>
            <CardContent className="pt-6 pr-4 pb-4 pl-2">
              {usersByMonth.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={usersByMonth} margin={{ top: 5, right: 10, left: -20, bottom: 0 }} barSize={32}>
                    <defs>
                      <linearGradient id="regGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(38,92%,50%)" stopOpacity={1} />
                        <stop offset="100%" stopColor="hsl(38,92%,65%)" stopOpacity={0.8} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(243 30% 92%)" vertical={false} />
                    <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'hsl(243 20% 48%)' }} axisLine={false} tickLine={false} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: 'hsl(243 20% 48%)' }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={chartTooltipStyle} cursor={{ fill: 'hsl(243 30% 96%)' }} />
                    <Bar dataKey="count" name="New Users" fill="url(#regGrad)" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">
                  No registration data for the last 6 months
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Status Breakdowns — Donut Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="border-b py-4">
              <CardTitle className="text-base">Enrollment Status</CardTitle>
              <p className="text-xs text-muted-foreground">Breakdown by approval status</p>
            </CardHeader>
            <CardContent className="px-6 pb-6">
              <DonutChart
                total={totalEnrollments}
                label="total"
                data={[
                  { name: 'Approved',  value: enrollmentStatus.approved  || 0, color: '#10B981' },
                  { name: 'Pending',   value: enrollmentStatus.pending   || 0, color: '#F59E0B' },
                  { name: 'Rejected',  value: enrollmentStatus.rejected  || 0, color: '#EF4444' },
                  { name: 'Cancelled', value: enrollmentStatus.cancelled || 0, color: '#94A3B8' },
                ]}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="border-b py-4">
              <CardTitle className="text-base">Course Status</CardTitle>
              <p className="text-xs text-muted-foreground">Breakdown by publication status</p>
            </CardHeader>
            <CardContent className="px-6 pb-6">
              <DonutChart
                total={totalCourses}
                label="courses"
                data={[
                  { name: 'Published', value: courseStatus.published || 0, color: '#10B981' },
                  { name: 'Draft',     value: courseStatus.draft     || 0, color: '#94A3B8' },
                  { name: 'Archived',  value: courseStatus.archived  || 0, color: '#F59E0B' },
                ]}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="border-b py-4">
              <CardTitle className="text-base">User Roles</CardTitle>
              <p className="text-xs text-muted-foreground">Breakdown by account type</p>
            </CardHeader>
            <CardContent className="px-6 pb-6">
              <DonutChart
                total={totalUsers}
                label="users"
                data={[
                  { name: 'Students',    value: userRoles.student    || 0, color: 'hsl(243,75%,59%)' },
                  { name: 'Instructors', value: userRoles.instructor || 0, color: '#7C3AED' },
                  { name: 'Admins',      value: userRoles.admin      || 0, color: '#EF4444' },
                ]}
              />
            </CardContent>
          </Card>
        </div>

        {/* Top Courses + Category — Horizontal Bar Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-8">
          <Card>
            <CardHeader className="border-b py-4">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-500" />
                <CardTitle className="text-base">Top Courses by Enrollment</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-6 pr-4 pb-4 pl-2">
              {topCourses.length > 0 ? (
                <ResponsiveContainer width="100%" height={Math.max(topCourses.length * 48, 160)}>
                  <BarChart
                    layout="vertical"
                    data={topCourses.map((c) => ({ name: c.title, enrolled: c.enrollmentCount || 0 }))}
                    margin={{ top: 0, right: 40, left: 0, bottom: 0 }}
                    barSize={20}
                  >
                    <defs>
                      <linearGradient id="topCourseGrad" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="hsl(38,92%,50%)" />
                        <stop offset="100%" stopColor="hsl(38,92%,68%)" />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(243 30% 92%)" horizontal={false} />
                    <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: 'hsl(243 20% 48%)' }} axisLine={false} tickLine={false} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: 'hsl(243 20% 48%)' }} axisLine={false} tickLine={false} width={120} />
                    <Tooltip contentStyle={chartTooltipStyle} cursor={{ fill: 'hsl(243 30% 96%)' }} formatter={(v) => [v, 'Enrolled']} />
                    <Bar dataKey="enrolled" fill="url(#topCourseGrad)" radius={[0, 6, 6, 0]} label={{ position: 'right', fontSize: 11, fill: 'hsl(243 20% 48%)' }} />
                  </BarChart>
                </ResponsiveContainer>
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
            <CardContent className="pt-6 pr-4 pb-4 pl-2">
              {categoryData.length > 0 ? (
                <ResponsiveContainer width="100%" height={Math.max(categoryData.length * 48, 160)}>
                  <BarChart
                    layout="vertical"
                    data={categoryData.map((c) => ({ name: c._id, count: c.count }))}
                    margin={{ top: 0, right: 40, left: 0, bottom: 0 }}
                    barSize={20}
                  >
                    <defs>
                      <linearGradient id="catGrad" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="hsl(243,75%,59%)" />
                        <stop offset="100%" stopColor="hsl(243,75%,72%)" />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(243 30% 92%)" horizontal={false} />
                    <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: 'hsl(243 20% 48%)' }} axisLine={false} tickLine={false} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: 'hsl(243 20% 48%)' }} axisLine={false} tickLine={false} width={110} />
                    <Tooltip contentStyle={chartTooltipStyle} cursor={{ fill: 'hsl(243 30% 96%)' }} formatter={(v) => [v, 'Courses']} />
                    <Bar dataKey="count" fill="url(#catGrad)" radius={[0, 6, 6, 0]} label={{ position: 'right', fontSize: 11, fill: 'hsl(243 20% 48%)' }} />
                  </BarChart>
                </ResponsiveContainer>
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
