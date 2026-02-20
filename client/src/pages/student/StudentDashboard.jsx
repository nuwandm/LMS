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

const categoryLinks = [
  { label: 'Web Dev', icon: Code, color: 'bg-blue-50 text-blue-600', to: '/courses?category=Web+Development' },
  { label: 'Design', icon: Palette, color: 'bg-purple-50 text-purple-600', to: '/courses?category=Design' },
  { label: 'Business', icon: Briefcase, color: 'bg-green-50 text-green-600', to: '/courses?category=Business' },
  { label: 'Data Science', icon: BarChart2, color: 'bg-orange-50 text-orange-600', to: '/courses?category=Data+Science' },
  { label: 'Photography', icon: Camera, color: 'bg-pink-50 text-pink-600', to: '/courses?category=Photography' },
  { label: 'Music', icon: Music, color: 'bg-red-50 text-red-600', to: '/courses?category=Music' },
  { label: 'Marketing', icon: TrendingUp, color: 'bg-yellow-50 text-yellow-600', to: '/courses?category=Marketing' },
  { label: 'Other', icon: Layers, color: 'bg-gray-50 text-gray-600', to: '/courses' },
];

const StudentDashboard = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const [enrollments, setEnrollments] = useState([]);
  const [discover, setDiscover] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [enrollRes, courseRes] = await Promise.all([
        getMyEnrollments(),
        getAllCourses({ limit: 12, sortBy: 'popular' }),
      ]);

      let enrolledData = [];
      if (enrollRes.success) {
        enrolledData = Array.isArray(enrollRes.data)
          ? enrollRes.data
          : enrollRes.data?.enrollments || [];
        setEnrollments(enrolledData);
      }

      if (courseRes.success) {
        // Filter out courses the student is already enrolled in
        const enrolledIds = new Set(
          enrolledData.map((e) => e.course?._id || e.course).filter(Boolean)
        );
        const notEnrolled = (courseRes.data.courses ?? []).filter(
          (c) => !enrolledIds.has(c._id)
        );
        setDiscover(notEnrolled.slice(0, 4));
      }
    } catch (error) {
      console.error('Dashboard fetch error:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  // Stats
  const stats = {
    enrolled: enrollments.length,
    inProgress: enrollments.filter(
      (e) => e.status === 'approved' && e.progress > 0 && e.progress < 100
    ).length,
    completed: enrollments.filter((e) => e.progress === 100).length,
    pending: enrollments.filter((e) => e.status === 'pending').length,
  };

  // Single most recently accessed approved course
  const lastCourse = enrollments
    .filter((e) => e.status === 'approved' && e.course)
    .sort((a, b) => new Date(b.lastAccessedAt || b.updatedAt || 0) - new Date(a.lastAccessedAt || a.updatedAt || 0))
    [0] || null;

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const statCards = [
    { label: 'Total Enrolled', value: stats.enrolled, icon: BookOpen, iconBg: 'bg-blue-50', iconColor: 'text-blue-600', link: '/my-learning' },
    { label: 'In Progress', value: stats.inProgress, icon: Clock, iconBg: 'bg-amber-50', iconColor: 'text-amber-600', link: '/my-learning' },
    { label: 'Completed', value: stats.completed, icon: CheckCircle2, iconBg: 'bg-green-50', iconColor: 'text-green-600', link: '/my-learning?tab=completed' },
    { label: 'Pending Approval', value: stats.pending, icon: AlertCircle, iconBg: 'bg-orange-50', iconColor: 'text-orange-500', link: '/my-learning?tab=pending' },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-28 bg-gray-200 rounded-2xl" />
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-gray-200 rounded-xl" />)}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              <div className="h-52 bg-gray-200 rounded-xl" />
              <div className="lg:col-span-2 h-52 bg-gray-200 rounded-xl" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 lg:px-8 py-8 space-y-7">

        {/* ── Welcome Banner ── */}
        <div className="bg-[#1e3a8a] rounded-2xl px-8 py-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-blue-300 text-sm font-medium mb-1">{greeting()},</p>
            <h1 className="text-white text-2xl font-bold">{user?.name || 'Student'} 👋</h1>
            <p className="text-blue-200 text-sm mt-1">
              {stats.inProgress > 0
                ? `You have ${stats.inProgress} course${stats.inProgress > 1 ? 's' : ''} in progress — keep going!`
                : stats.enrolled > 0
                ? "All caught up! Explore new topics to keep growing."
                : 'Start your learning journey — browse our courses.'}
            </p>
          </div>
          <Link
            to="/courses"
            className="flex-shrink-0 inline-flex items-center gap-2 bg-white text-[#1e3a8a] font-semibold text-sm px-5 py-2.5 rounded-xl hover:bg-blue-50 transition-colors shadow-sm"
          >
            <Compass className="w-4 h-4" />
            Browse Courses
          </Link>
        </div>

        {/* ── Stats — each card links to My Learning ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map(({ label, value, icon: Icon, iconBg, iconColor, link }) => (
            <Link
              key={label}
              to={link}
              className="bg-white rounded-xl border border-gray-100 p-5 flex items-center gap-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group"
            >
              <div className={`${iconBg} p-3 rounded-xl flex-shrink-0`}>
                <Icon className={`w-5 h-5 ${iconColor}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{value}</p>
                <p className="text-xs font-medium text-gray-500 mt-0.5 leading-tight">{label}</p>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 ml-auto transition-colors" />
            </Link>
          ))}
        </div>

        {/* ── Pick up where you left off + Browse Categories ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* Left: Single resume card */}
          <div className="lg:col-span-1">
            <h2 className="text-base font-bold text-gray-900 mb-3">Pick up where you left off</h2>
            {lastCourse ? (
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm group">
                <div className="relative h-40 bg-gradient-to-br from-primary-400 to-primary-700 overflow-hidden">
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
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3">
                    <div className="flex justify-between text-white text-xs mb-1 font-medium">
                      <span>Progress</span>
                      <span>{lastCourse.progress || 0}%</span>
                    </div>
                    <div className="h-1.5 bg-white/30 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-white rounded-full"
                        style={{ width: `${lastCourse.progress || 0}%` }}
                      />
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-sm font-bold text-gray-900 line-clamp-2 mb-1 leading-snug">
                    {lastCourse.course.title}
                  </h3>
                  <p className="text-xs text-gray-500 mb-4">
                    By {lastCourse.course.instructor?.name || 'Unknown'}
                  </p>
                  <button
                    onClick={() => navigate(`/learn/${lastCourse.course._id}`)}
                    className="w-full flex items-center justify-center gap-2 bg-[#1e3a8a] hover:bg-primary-800 text-white text-sm font-semibold py-2.5 rounded-lg transition-colors"
                  >
                    <Play className="w-3.5 h-3.5" />
                    {lastCourse.progress > 0 ? 'Continue Learning' : 'Start Course'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-dashed border-gray-300 py-12 flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                  <BookOpen className="w-6 h-6 text-gray-400" />
                </div>
                <p className="text-sm font-semibold text-gray-700 mb-1">No active courses yet</p>
                <p className="text-xs text-gray-400 mb-4">Enroll in a course to start learning</p>
                <Link
                  to="/courses"
                  className="text-xs font-semibold text-primary-600 hover:text-primary-700 underline underline-offset-2"
                >
                  Browse courses
                </Link>
              </div>
            )}
          </div>

          {/* Right: Browse by Category */}
          <div className="lg:col-span-2">
            <h2 className="text-base font-bold text-gray-900 mb-3">Browse by Category</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {categoryLinks.map(({ label, icon: Icon, color, to }) => (
                <Link
                  key={label}
                  to={to}
                  className="bg-white rounded-xl border border-gray-100 p-4 flex flex-col items-center gap-2 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group"
                >
                  <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-semibold text-gray-700 group-hover:text-primary-700 transition-colors text-center leading-tight">
                    {label}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* ── Discover — courses NOT enrolled in ── */}
        <section className="pb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-gray-900">Discover New Courses</h2>
              <p className="text-xs text-gray-500 mt-0.5">Popular courses you haven't enrolled in yet</p>
            </div>
            <Link
              to="/courses"
              className="flex items-center gap-1 text-sm font-semibold text-primary-600 hover:text-primary-700"
            >
              See all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {discover.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 py-12 flex flex-col items-center text-center shadow-sm">
              <CheckCircle2 className="w-10 h-10 text-green-400 mb-3" />
              <p className="text-sm font-semibold text-gray-900 mb-1">
                You're enrolled in all popular courses!
              </p>
              <p className="text-xs text-gray-500 mb-4">Browse the full catalog to find more</p>
              <Link to="/courses" className="text-sm font-semibold text-primary-600 hover:text-primary-700 underline underline-offset-2">
                Browse all courses
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {discover.map((course) => (
                <Link
                  key={course._id}
                  to={`/courses/${course._id}`}
                  className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group"
                >
                  <div className="h-32 bg-gradient-to-br from-primary-400 to-primary-700 overflow-hidden">
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
                  <div className="p-3">
                    <h4 className="text-sm font-semibold text-gray-900 line-clamp-2 mb-1 leading-snug">
                      {course.title}
                    </h4>
                    <p className="text-xs text-gray-400 mb-2">
                      {course.instructor?.name || 'Unknown'}
                    </p>
                    <div className="flex items-center justify-between">
                      {course.rating > 0 ? (
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-amber-400 fill-current" />
                          <span className="text-xs font-semibold text-gray-700">
                            {course.rating.toFixed(1)}
                          </span>
                        </div>
                      ) : <span />}
                      <span className="text-xs font-bold text-primary-600">
                        {course.price === 0 ? 'Free' : `$${course.price}`}
                      </span>
                    </div>
                  </div>
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
