import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users, BookOpen, ClipboardCheck, CheckCircle,
  TrendingUp, Clock, BarChart2,
} from 'lucide-react';
import { getDashboardStats } from '../../services/adminService';
import EmptyState from '../../components/common/EmptyState';
import toast from 'react-hot-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';

const STATUS_VARIANT = { pending: 'warning', approved: 'success', rejected: 'destructive', cancelled: 'secondary' };
const ROLE_VARIANT = { admin: 'destructive', instructor: 'default', student: 'secondary' };

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchStats(); }, []);

  const fetchStats = async () => {
    try {
      const data = await getDashboardStats();
      setStats(data.data?.stats || null);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load dashboard stats');
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Users',
      value: stats?.users?.total || 0,
      icon: Users,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      subtitle: `${stats?.users?.students || 0} students`,
    },
    {
      title: 'Total Courses',
      value: stats?.courses?.total || 0,
      icon: BookOpen,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      subtitle: `${stats?.courses?.published || 0} published`,
    },
    {
      title: 'Pending Enrollments',
      value: stats?.enrollments?.pending || 0,
      icon: Clock,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      subtitle: 'Awaiting approval',
    },
    {
      title: 'Approved Enrollments',
      value: stats?.enrollments?.approved || 0,
      icon: CheckCircle,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
      subtitle: `${stats?.enrollments?.total || 0} total requests`,
    },
  ];

  const recentEnrollments = stats?.recent?.enrollments || [];
  const recentUsers = stats?.recent?.users || [];
  const topCourses = stats?.recent?.courses || [];
  const totalUsers = stats?.users?.total || 1;

  if (loading) {
    return (
      <div className="p-8 max-w-7xl mx-auto space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-72 rounded-xl" />
          <Skeleton className="h-72 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-muted/30 min-h-full">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Manage your learning platform</p>
          </div>
          <div className="flex gap-2">
            <Button asChild size="sm">
              <Link to="/admin/enrollments">View Enrollments</Link>
            </Button>
            <Button asChild size="sm" variant="outline">
              <Link to="/admin/users">Manage Users</Link>
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((stat) => (
            <Card key={stat.title}>
              <CardContent className="p-5 flex items-center gap-3">
                <div className={`w-10 h-10 ${stat.bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium">{stat.title}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.subtitle}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Two Column */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Enrollments */}
          <Card>
            <CardHeader className="border-b py-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Recent Enrollment Requests</CardTitle>
                <Button asChild variant="ghost" size="sm" className="text-sm h-7">
                  <Link to="/admin/enrollments">View All</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-5">
              {recentEnrollments.length > 0 ? (
                <div className="space-y-3">
                  {recentEnrollments.slice(0, 5).map((enrollment) => (
                    <div key={enrollment._id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                            {enrollment.student?.name?.charAt(0) || 'S'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{enrollment.student?.name || 'Student'}</p>
                          <p className="text-xs text-muted-foreground truncate max-w-[180px]">
                            {enrollment.course?.title || 'Course'}
                          </p>
                        </div>
                      </div>
                      <Badge variant={STATUS_VARIANT[enrollment.status] || 'secondary'}>
                        {enrollment.status.charAt(0).toUpperCase() + enrollment.status.slice(1)}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState icon={ClipboardCheck} title="No enrollment requests" description="New requests will appear here" />
              )}
            </CardContent>
          </Card>

          {/* Recent Users */}
          <Card>
            <CardHeader className="border-b py-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Recently Registered Users</CardTitle>
                <Button asChild variant="ghost" size="sm" className="text-sm h-7">
                  <Link to="/admin/users">View All</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-5">
              {recentUsers.length > 0 ? (
                <div className="space-y-3">
                  {recentUsers.slice(0, 5).map((user) => (
                    <div key={user._id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarImage src={user.avatar} alt={user.name} />
                          <AvatarFallback className="bg-indigo-100 text-indigo-600 text-xs font-semibold">
                            {user.name?.charAt(0) || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{user.name}</p>
                          <p className="text-xs text-muted-foreground truncate max-w-[180px]">{user.email}</p>
                        </div>
                      </div>
                      <Badge variant={ROLE_VARIANT[user.role] || 'secondary'} className="capitalize">
                        {user.role}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState icon={Users} title="No recent users" description="Recently registered users will appear here" />
              )}
            </CardContent>
          </Card>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* User Distribution */}
          <Card>
            <CardHeader className="border-b py-4">
              <CardTitle className="text-base">User Distribution by Role</CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-5">
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: 'Students', value: stats?.users?.students || 0, color: 'text-foreground', bg: 'bg-muted' },
                  { label: 'Instructors', value: stats?.users?.instructors || 0, color: 'text-blue-600', bg: 'bg-blue-50' },
                  { label: 'Admins', value: stats?.users?.admins || 0, color: 'text-indigo-600', bg: 'bg-indigo-50' },
                ].map(({ label, value, color, bg }) => (
                  <div key={label} className={`text-center p-4 ${bg} rounded-lg`}>
                    <div className={`text-3xl font-bold ${color} mb-1`}>{value}</div>
                    <div className="text-sm font-medium text-muted-foreground">{label}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {((value / totalUsers) * 100).toFixed(1)}%
                    </div>
                  </div>
                ))}
              </div>

              <div>
                <p className="text-sm font-semibold mb-3">Enrollment Status</p>
                <div className="space-y-3">
                  {[
                    { label: 'Approved', value: stats?.enrollments?.approved || 0, color: 'bg-emerald-500' },
                    { label: 'Pending', value: stats?.enrollments?.pending || 0, color: 'bg-amber-400' },
                    { label: 'Rejected', value: stats?.enrollments?.rejected || 0, color: 'bg-destructive' },
                  ].map((item) => {
                    const t = stats?.enrollments?.total || 1;
                    const pct = Math.round((item.value / t) * 100);
                    return (
                      <div key={item.label} className="flex items-center gap-3">
                        <span className="text-xs text-muted-foreground w-16">{item.label}</span>
                        <Progress value={pct} className="flex-1 h-2" />
                        <span className="text-xs font-medium w-6 text-right">{item.value}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Top Courses */}
          <Card>
            <CardHeader className="border-b py-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Top Courses by Enrollment</CardTitle>
                <Button asChild variant="ghost" size="sm" className="text-sm h-7 gap-1">
                  <Link to="/admin/reports"><BarChart2 className="w-4 h-4" />Full Report</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-5">
              {topCourses.length > 0 ? (
                <div className="space-y-3">
                  {topCourses.slice(0, 5).map((course, idx) => (
                    <div key={course._id} className="flex items-center gap-3">
                      <span className="text-sm font-bold text-muted-foreground w-5 flex-shrink-0">{idx + 1}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{course.title}</p>
                        <p className="text-xs text-muted-foreground">{course.category}</p>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <Users className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className="text-sm font-semibold">{course.enrollmentCount}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState icon={BookOpen} title="No published courses" description="Courses ranked by enrollment will appear here" />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
