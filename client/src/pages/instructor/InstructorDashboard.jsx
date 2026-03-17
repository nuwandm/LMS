import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Users, DollarSign, Plus, TrendingUp, MoreHorizontal } from 'lucide-react';
import EmptyState from '../../components/common/EmptyState';
import { getInstructorCourses } from '../../services/courseService';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';

const STATUS_VARIANT = {
  published: 'success',
  draft: 'secondary',
  archived: 'warning',
};

const InstructorDashboard = () => {
  const { user } = useAuthStore();
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const res = await getInstructorCourses();
      if (res.success) {
        setCourses(Array.isArray(res.data) ? res.data : res.data?.courses || []);
      }
    } catch {
      toast.error('Failed to load courses');
      setCourses([]);
    } finally {
      setIsLoading(false);
    }
  };

  const stats = {
    totalCourses: courses.length,
    publishedCourses: courses.filter((c) => c.status === 'published').length,
    totalStudents: courses.reduce((sum, c) => sum + (c.enrollmentCount || 0), 0),
    totalRevenue: courses.reduce((sum, c) => sum + (c.price * (c.enrollmentCount || 0)), 0),
  };

  const statCards = [
    {
      label: 'Total Courses',
      value: stats.totalCourses,
      icon: BookOpen,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      badge: `${stats.publishedCourses} Published`,
    },
    {
      label: 'Total Students',
      value: stats.totalStudents.toLocaleString(),
      icon: Users,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
    },
    {
      label: 'Total Revenue',
      value: `$${stats.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
  ];

  if (isLoading) {
    return (
      <div className="p-8 space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)}
        </div>
        <Skeleton className="h-96 rounded-xl" />
      </div>
    );
  }

  return (
    <main className="p-8 bg-muted/30 min-h-full">
      <div className="max-w-7xl mx-auto space-y-7">

        {/* Welcome */}
        <div>
          <h1 className="text-2xl font-bold">Welcome back, {user?.name}!</h1>
          <p className="text-muted-foreground mt-1">Here's what's happening with your courses today.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {statCards.map(({ label, value, icon: Icon, color, bg, badge }) => (
            <Card key={label} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6 flex flex-col gap-4">
                <div className="flex justify-between items-start">
                  <div className={`${bg} p-3 rounded-lg`}>
                    <Icon className={`w-6 h-6 ${color}`} />
                  </div>
                  {badge && (
                    <span className="flex items-center text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                      <TrendingUp className="w-3 h-3 mr-1" />{badge}
                    </span>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{label}</p>
                  <p className="text-3xl font-bold mt-1">{value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Courses Table */}
        <div className="pb-8">
          <Card>
            <CardHeader className="border-b flex flex-row items-start justify-between">
              <div>
                <CardTitle className="text-base">My Courses</CardTitle>
                <CardDescription>Manage your active courses and drafts.</CardDescription>
              </div>
              <Button asChild size="sm" className="gap-2">
                <Link to="/instructor/courses/create">
                  <Plus className="w-4 h-4" />New Course
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              {courses.length === 0 ? (
                <EmptyState
                  icon={BookOpen}
                  title="No courses yet"
                  description="Create your first course and start teaching!"
                  action={
                    <Button asChild>
                      <Link to="/instructor/courses/create">Create Your First Course</Link>
                    </Button>
                  }
                />
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Course Title</TableHead>
                          <TableHead className="hidden sm:table-cell">Category</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-center">Students</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {courses.slice(0, 5).map((course) => (
                          <TableRow key={course._id}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <div className="h-10 w-16 bg-slate-700 rounded overflow-hidden flex-shrink-0">
                                  {course.thumbnail ? (
                                    <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                      <BookOpen className="w-4 h-4 text-white" />
                                    </div>
                                  )}
                                </div>
                                <div>
                                  <p className="font-medium line-clamp-1">{course.title}</p>
                                  <p className="text-xs text-muted-foreground sm:hidden">{course.category}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="text-muted-foreground hidden sm:table-cell">
                              {course.category}
                            </TableCell>
                            <TableCell>
                              <Badge variant={STATUS_VARIANT[course.status] || 'secondary'}>
                                {course.status.charAt(0).toUpperCase() + course.status.slice(1)}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-center font-medium">
                              {course.status === 'published' ? course.enrollmentCount || 0 : '—'}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="icon" asChild>
                                <Link to={`/instructor/courses/${course._id}`}>
                                  <MoreHorizontal className="w-4 h-4" />
                                </Link>
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  {courses.length > 5 && (
                    <div className="p-4 border-t text-center">
                      <Button variant="link" size="sm" asChild>
                        <Link to="/instructor/courses">View All Courses</Link>
                      </Button>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
};

export default InstructorDashboard;
