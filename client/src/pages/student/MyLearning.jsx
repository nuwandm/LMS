import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, CheckCircle2, Clock, Star, ArrowRight, Lock, Play } from 'lucide-react';
import Navbar from '../../components/common/Navbar';
import EmptyState from '../../components/common/EmptyState';
import { getMyEnrollments } from '../../services/enrollmentService';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';

const categoryColors = {
  'Web Development': 'bg-blue-100 text-blue-700',
  'Data Science': 'bg-purple-100 text-purple-700',
  'Design': 'bg-pink-100 text-pink-700',
  'Business': 'bg-emerald-100 text-emerald-700',
  'Marketing': 'bg-orange-100 text-orange-700',
  'Other': 'bg-muted text-muted-foreground',
};

const MyLearning = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [enrollments, setEnrollments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getMyEnrollments()
      .then((res) => {
        if (res.success) {
          setEnrollments(Array.isArray(res.data) ? res.data : res.data?.enrollments || []);
        }
      })
      .catch(() => toast.error('Failed to load your courses'))
      .finally(() => setIsLoading(false));
  }, []);

  const stats = {
    enrolled: enrollments.length,
    completed: enrollments.filter((e) => e.progress === 100).length,
    inProgress: enrollments.filter((e) => e.status === 'approved' && e.progress > 0 && e.progress < 100).length,
  };

  const tabData = {
    all: enrollments,
    'in-progress': enrollments.filter((e) => e.status === 'approved' && e.progress > 0 && e.progress < 100),
    completed: enrollments.filter((e) => e.progress === 100),
    pending: enrollments.filter((e) => e.status === 'pending'),
  };

  const EnrollmentCard = ({ enrollment }) => {
    const course = enrollment.course;
    const isPending = enrollment.status === 'pending';
    const isRejected = enrollment.status === 'rejected';

    return (
      <Card className={`overflow-hidden group transition-all ${isPending ? 'border-amber-300' : isRejected ? 'border-destructive/40' : ''}`}>
        <div className="relative h-44 bg-gradient-to-br from-slate-600 to-slate-800 overflow-hidden">
          {isPending && (
            <div className="absolute top-3 left-3 z-10">
              <Badge variant="warning" className="gap-1">
                <Lock className="w-2.5 h-2.5" />Pending
              </Badge>
            </div>
          )}
          {isRejected && (
            <div className="absolute top-3 left-3 z-10">
              <Badge variant="destructive">Rejected</Badge>
            </div>
          )}
          {course.thumbnail ? (
            <img
              src={course.thumbnail}
              alt={course.title}
              className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${isPending || isRejected ? 'opacity-80' : ''}`}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Play className="w-14 h-14 text-white opacity-30" />
            </div>
          )}
          {!isPending && !isRejected && course.rating > 0 && (
            <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md text-xs font-bold flex items-center gap-1 shadow-sm">
              <Star className="w-3 h-3 text-amber-500 fill-current" />{course.rating.toFixed(1)}
            </div>
          )}
        </div>

        <CardContent className="p-5 flex flex-col gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className={`${categoryColors[course.category] || 'bg-muted text-muted-foreground'} text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide`}>
                {course.category}
              </span>
            </div>
            <h3 className="font-bold text-base leading-snug mb-1 line-clamp-2">{course.title}</h3>
            <p className="text-sm text-muted-foreground">By {course.instructor?.name || 'Unknown'}</p>
          </div>

          <div className={isPending || isRejected ? 'opacity-60' : ''}>
            <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
              <span>{isPending ? 'Not Started' : isRejected ? 'Rejected' : 'Progress'}</span>
              {!isPending && !isRejected && <span>{enrollment.progress || 0}%</span>}
            </div>
            <Progress value={enrollment.progress || 0} className="h-2" />
          </div>

          {isPending ? (
            <Button disabled variant="outline" className="gap-2">
              Awaiting Approval <Lock className="w-4 h-4" />
            </Button>
          ) : isRejected ? (
            <div>
              {enrollment.rejectedReason && (
                <p className="text-xs text-destructive mb-2">{enrollment.rejectedReason}</p>
              )}
              <Button variant="outline" className="w-full" asChild>
                <Link to="/courses">Browse Other Courses</Link>
              </Button>
            </div>
          ) : (
            <Button className="gap-2" onClick={() => navigate(`/learn/${course._id}`)}>
              {enrollment.progress > 0 ? 'Continue Learning' : 'Start Learning'}
              <ArrowRight className="w-4 h-4" />
            </Button>
          )}
        </CardContent>
      </Card>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="max-w-7xl mx-auto px-6 py-8 space-y-6">
          <Skeleton className="h-10 w-48" />
          <div className="grid grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-72 rounded-xl" />)}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-7xl mx-auto px-6 lg:px-8 py-8 space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Hi, {user?.name}!</h1>
          <p className="text-muted-foreground text-lg mt-1">Let's learn something new today.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: 'Enrolled', value: stats.enrolled, icon: BookOpen, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Completed', value: stats.completed, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
            { label: 'In Progress', value: stats.inProgress, icon: Clock, color: 'text-purple-600', bg: 'bg-purple-50' },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <Card key={label} className="hover:-translate-y-0.5 transition-transform">
              <CardContent className="p-6 flex items-center gap-4">
                <div className={`${bg} p-3 rounded-xl`}>
                  <Icon className={`w-6 h-6 ${color}`} />
                </div>
                <div>
                  <p className="text-3xl font-bold">{value}</p>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="all">
          <TabsList className="mb-6">
            {[
              { id: 'all', label: 'All Courses', count: tabData.all.length },
              { id: 'in-progress', label: 'In Progress', count: tabData['in-progress'].length },
              { id: 'completed', label: 'Completed', count: tabData.completed.length },
              { id: 'pending', label: 'Pending', count: tabData.pending.length },
            ].map(({ id, label, count }) => (
              <TabsTrigger key={id} value={id} className="gap-2">
                {label}
                {count > 0 && (
                  <Badge variant="secondary" className="h-5 min-w-5 px-1 text-[10px]">{count}</Badge>
                )}
              </TabsTrigger>
            ))}
          </TabsList>

          {Object.entries(tabData).map(([tab, items]) => (
            <TabsContent key={tab} value={tab}>
              {items.length === 0 ? (
                <Card>
                  <EmptyState
                    icon={BookOpen}
                    title={tab === 'all' ? 'No enrolled courses yet' : `No ${tab.replace('-', ' ')} courses`}
                    description={tab === 'all' ? 'Start learning by enrolling in a course' : 'Complete your current courses to see them here'}
                    action={tab === 'all' && <Button asChild><Link to="/courses">Browse Courses</Link></Button>}
                  />
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-8">
                  {items.map((enrollment) => (
                    <EnrollmentCard key={enrollment._id} enrollment={enrollment} />
                  ))}
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </main>
    </div>
  );
};

export default MyLearning;
