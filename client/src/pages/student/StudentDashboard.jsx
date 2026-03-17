import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  BookOpen, Clock, CheckCircle2, AlertCircle, ArrowRight,
  Play, Star, Compass, Code, Palette, TrendingUp, Briefcase,
  Camera, Music, BarChart2, Layers,
} from 'lucide-react';
import Navbar from '../../components/common/Navbar';
import { getMyEnrollments } from '../../services/enrollmentService';
import { getAllCourses } from '../../services/courseService';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';

const categoryLinks = [
  { label: 'Web Dev', icon: Code, color: 'bg-blue-50 text-blue-600', to: '/courses?category=Web+Development' },
  { label: 'Design', icon: Palette, color: 'bg-purple-50 text-purple-600', to: '/courses?category=Design' },
  { label: 'Business', icon: Briefcase, color: 'bg-emerald-50 text-emerald-600', to: '/courses?category=Business' },
  { label: 'Data Science', icon: BarChart2, color: 'bg-orange-50 text-orange-600', to: '/courses?category=Data+Science' },
  { label: 'Photography', icon: Camera, color: 'bg-pink-50 text-pink-600', to: '/courses?category=Photography' },
  { label: 'Music', icon: Music, color: 'bg-red-50 text-red-600', to: '/courses?category=Music' },
  { label: 'Marketing', icon: TrendingUp, color: 'bg-amber-50 text-amber-600', to: '/courses?category=Marketing' },
  { label: 'Other', icon: Layers, color: 'bg-muted text-muted-foreground', to: '/courses' },
];

const greeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
};

const StudentDashboard = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [enrollments, setEnrollments] = useState([]);
  const [discover, setDiscover] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [enrollRes, courseRes] = await Promise.all([
          getMyEnrollments(),
          getAllCourses({ limit: 12, sortBy: 'popular' }),
        ]);
        let enrolledData = [];
        if (enrollRes.success) {
          enrolledData = Array.isArray(enrollRes.data) ? enrollRes.data : enrollRes.data?.enrollments || [];
          setEnrollments(enrolledData);
        }
        if (courseRes.success) {
          const enrolledIds = new Set(enrolledData.map((e) => e.course?._id || e.course).filter(Boolean));
          setDiscover((courseRes.data.courses ?? []).filter((c) => !enrolledIds.has(c._id)).slice(0, 4));
        }
      } catch {
        toast.error('Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const stats = {
    enrolled: enrollments.length,
    inProgress: enrollments.filter((e) => e.status === 'approved' && e.progress > 0 && e.progress < 100).length,
    completed: enrollments.filter((e) => e.progress === 100).length,
    pending: enrollments.filter((e) => e.status === 'pending').length,
  };

  const lastCourse = enrollments
    .filter((e) => e.status === 'approved' && e.course)
    .sort((a, b) => new Date(b.lastAccessedAt || b.updatedAt || 0) - new Date(a.lastAccessedAt || a.updatedAt || 0))[0] || null;

  const statCards = [
    { label: 'Total Enrolled', value: stats.enrolled, icon: BookOpen, color: 'text-blue-600', bg: 'bg-blue-50', link: '/my-learning' },
    { label: 'In Progress', value: stats.inProgress, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50', link: '/my-learning' },
    { label: 'Completed', value: stats.completed, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50', link: '/my-learning' },
    { label: 'Pending Approval', value: stats.pending, icon: AlertCircle, color: 'text-orange-600', bg: 'bg-orange-50', link: '/my-learning' },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="max-w-7xl mx-auto px-6 lg:px-8 py-8 space-y-6">
          <Skeleton className="h-28 w-full rounded-xl" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-7xl mx-auto px-6 lg:px-8 py-8 space-y-7">

        {/* Welcome Banner */}
        <div className="bg-slate-900 rounded-xl px-8 py-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-slate-400 text-sm font-medium mb-1">{greeting()},</p>
            <h1 className="text-white text-2xl font-bold">{user?.name || 'Student'}</h1>
            <p className="text-slate-300 text-sm mt-1">
              {stats.inProgress > 0
                ? `You have ${stats.inProgress} course${stats.inProgress > 1 ? 's' : ''} in progress — keep going!`
                : stats.enrolled > 0
                ? 'All caught up! Explore new topics to keep growing.'
                : 'Start your learning journey — browse our courses.'}
            </p>
          </div>
          <Button className="flex-shrink-0 bg-white text-slate-900 hover:bg-slate-100 font-semibold gap-2" asChild>
            <Link to="/courses"><Compass className="w-4 h-4" />Browse Courses</Link>
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map(({ label, value, icon: Icon, color, bg, link }) => (
            <Link key={label} to={link}>
              <Card className="hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer">
                <CardContent className="p-5 flex items-center gap-4">
                  <div className={`${bg} p-3 rounded-xl flex-shrink-0`}>
                    <Icon className={`w-5 h-5 ${color}`} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-2xl font-bold">{value}</p>
                    <p className="text-xs text-muted-foreground leading-tight">{label}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground ml-auto flex-shrink-0" />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Resume + Categories */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div>
            <h2 className="text-base font-bold mb-3">Pick up where you left off</h2>
            {lastCourse ? (
              <Card className="overflow-hidden group">
                <div className="relative h-40 bg-gradient-to-br from-slate-600 to-slate-800 overflow-hidden">
                  {lastCourse.course.thumbnail ? (
                    <img
                      src={lastCourse.course.thumbnail}
                      alt={lastCourse.course.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Play className="w-12 h-12 text-white opacity-30" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3">
                    <div className="flex justify-between text-white text-xs mb-1">
                      <span>Progress</span><span>{lastCourse.progress || 0}%</span>
                    </div>
                    <div className="h-1.5 bg-white/30 rounded-full overflow-hidden">
                      <div className="h-full bg-white rounded-full" style={{ width: `${lastCourse.progress || 0}%` }} />
                    </div>
                  </div>
                </div>
                <CardContent className="p-4">
                  <h3 className="text-sm font-bold line-clamp-2 mb-1">{lastCourse.course.title}</h3>
                  <p className="text-xs text-muted-foreground mb-3">By {lastCourse.course.instructor?.name || 'Unknown'}</p>
                  <Button className="w-full gap-2" size="sm" onClick={() => navigate(`/learn/${lastCourse.course._id}`)}>
                    <Play className="w-3.5 h-3.5" />
                    {lastCourse.progress > 0 ? 'Continue Learning' : 'Start Course'}
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-dashed">
                <CardContent className="py-12 flex flex-col items-center text-center">
                  <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-3">
                    <BookOpen className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-semibold mb-1">No active courses yet</p>
                  <p className="text-xs text-muted-foreground mb-4">Enroll in a course to start learning</p>
                  <Button variant="link" size="sm" asChild><Link to="/courses">Browse courses</Link></Button>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="lg:col-span-2">
            <h2 className="text-base font-bold mb-3">Browse by Category</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {categoryLinks.map(({ label, icon: Icon, color, to }) => (
                <Link key={label} to={to}>
                  <Card className="hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer">
                    <CardContent className="p-4 flex flex-col items-center gap-2">
                      <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-semibold text-center leading-tight">{label}</span>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Discover */}
        <section className="pb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold">Discover New Courses</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Popular courses you haven't enrolled in yet</p>
            </div>
            <Button variant="ghost" size="sm" className="gap-1" asChild>
              <Link to="/courses">See all <ArrowRight className="w-4 h-4" /></Link>
            </Button>
          </div>

          {discover.length === 0 ? (
            <Card>
              <CardContent className="py-12 flex flex-col items-center text-center">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mb-3" />
                <p className="text-sm font-semibold mb-1">You're enrolled in all popular courses!</p>
                <Button variant="link" size="sm" asChild><Link to="/courses">Browse all courses</Link></Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {discover.map((course) => (
                <Link key={course._id} to={`/courses/${course._id}`}>
                  <Card className="overflow-hidden group hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
                    <div className="h-32 bg-gradient-to-br from-slate-600 to-slate-800 overflow-hidden">
                      {course.thumbnail ? (
                        <img
                          src={course.thumbnail}
                          alt={course.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <BookOpen className="w-8 h-8 text-white opacity-30" />
                        </div>
                      )}
                    </div>
                    <CardContent className="p-3">
                      <h4 className="text-sm font-semibold line-clamp-2 mb-1">{course.title}</h4>
                      <p className="text-xs text-muted-foreground mb-2">{course.instructor?.name || 'Unknown'}</p>
                      <div className="flex items-center justify-between">
                        {course.rating > 0 && (
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 text-amber-400 fill-current" />
                            <span className="text-xs font-semibold">{course.rating.toFixed(1)}</span>
                          </div>
                        )}
                        <span className="text-xs font-bold ml-auto">
                          {course.price === 0 ? <span className="text-emerald-600">Free</span> : `$${course.price}`}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default StudentDashboard;
