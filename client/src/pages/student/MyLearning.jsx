import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  CheckCircle2,
  Clock,
  Star,
  ArrowRight,
  Lock,
  Play,
} from 'lucide-react';
import Navbar from '../../components/common/Navbar';
import { getMyEnrollments } from '../../services/enrollmentService';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';

const MyLearning = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const [enrollments, setEnrollments] = useState([]);
  const [filteredEnrollments, setFilteredEnrollments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); // all, in-progress, completed, pending

  useEffect(() => {
    fetchMyEnrollments();
  }, []);

  useEffect(() => {
    filterEnrollments();
  }, [activeTab, enrollments]);

  const fetchMyEnrollments = async () => {
    try {
      const response = await getMyEnrollments();
      if (response.success) {
        setEnrollments(response.data);
      }
    } catch (error) {
      console.error('Error fetching enrollments:', error);
      toast.error('Failed to load your courses');
    } finally {
      setIsLoading(false);
    }
  };

  const filterEnrollments = () => {
    let filtered = enrollments;

    switch (activeTab) {
      case 'in-progress':
        filtered = enrollments.filter(
          (e) => e.status === 'approved' && e.progress > 0 && e.progress < 100
        );
        break;
      case 'completed':
        filtered = enrollments.filter((e) => e.progress === 100);
        break;
      case 'pending':
        filtered = enrollments.filter((e) => e.status === 'pending');
        break;
      default:
        filtered = enrollments;
    }

    setFilteredEnrollments(filtered);
  };

  // Calculate stats
  const stats = {
    enrolled: enrollments.length,
    completed: enrollments.filter((e) => e.progress === 100).length,
    inProgress: enrollments.filter(
      (e) => e.status === 'approved' && e.progress > 0 && e.progress < 100
    ).length,
  };

  // Category color mapping
  const getCategoryColor = (category) => {
    const colors = {
      'Web Development': 'bg-cyan-100 text-cyan-700',
      'Mobile Development': 'bg-indigo-100 text-indigo-700',
      'Data Science': 'bg-purple-100 text-purple-700',
      'Design': 'bg-blue-100 text-blue-700',
      'Business': 'bg-green-100 text-green-700',
      'Marketing': 'bg-orange-100 text-orange-700',
      'Photography': 'bg-yellow-100 text-yellow-700',
      'Music': 'bg-red-100 text-red-700',
      'Other': 'bg-gray-100 text-gray-700',
    };
    return colors[category] || 'bg-gray-100 text-gray-700';
  };

  const handleContinueLearning = (courseId) => {
    // Navigate to video player (to be built later)
    navigate(`/learn/${courseId}`);
  };

  const tabs = [
    { id: 'all', label: 'All Courses', count: enrollments.length },
    { id: 'in-progress', label: 'In Progress', count: stats.inProgress },
    { id: 'completed', label: 'Completed', count: stats.completed },
    { id: 'pending', label: 'Pending Approval', count: enrollments.filter((e) => e.status === 'pending').length },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="animate-pulse space-y-8">
            <div className="h-32 bg-gray-200 rounded-xl" />
            <div className="grid grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-xl" />
              ))}
            </div>
            <div className="h-96 bg-gray-200 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="flex-1 flex justify-center py-8 px-4 sm:px-8 lg:px-40">
        <div className="max-w-[1200px] w-full flex flex-col gap-8">
          {/* Greeting & Stats Section */}
          <section className="flex flex-col gap-6">
            <div>
              <h1 className="text-gray-900 tracking-tight text-[32px] font-bold leading-tight">
                Hi, {user?.name}! 👋
              </h1>
              <p className="text-gray-500 text-lg font-medium leading-tight mt-2">
                Let's learn something new today.
              </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Card 1: Enrolled */}
              <div className="flex flex-col gap-3 rounded-xl p-6 bg-white shadow-sm border border-gray-100 transition-transform hover:-translate-y-1 duration-300">
                <div className="flex justify-between items-start">
                  <div className="bg-blue-50 text-blue-600 p-2 rounded-lg">
                    <BookOpen className="w-6 h-6" />
                  </div>
                </div>
                <div>
                  <p className="text-gray-500 text-sm font-medium uppercase tracking-wider">
                    Enrolled
                  </p>
                  <p className="text-gray-900 text-3xl font-bold mt-1">{stats.enrolled}</p>
                </div>
              </div>

              {/* Card 2: Completed */}
              <div className="flex flex-col gap-3 rounded-xl p-6 bg-white shadow-sm border border-gray-100 transition-transform hover:-translate-y-1 duration-300">
                <div className="flex justify-between items-start">
                  <div className="bg-green-50 text-green-600 p-2 rounded-lg">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                </div>
                <div>
                  <p className="text-gray-500 text-sm font-medium uppercase tracking-wider">
                    Completed
                  </p>
                  <p className="text-gray-900 text-3xl font-bold mt-1">{stats.completed}</p>
                </div>
              </div>

              {/* Card 3: In Progress */}
              <div className="flex flex-col gap-3 rounded-xl p-6 bg-white shadow-sm border border-gray-100 transition-transform hover:-translate-y-1 duration-300">
                <div className="flex justify-between items-start">
                  <div className="bg-purple-50 text-purple-600 p-2 rounded-lg">
                    <Clock className="w-6 h-6" />
                  </div>
                </div>
                <div>
                  <p className="text-gray-500 text-sm font-medium uppercase tracking-wider">
                    In Progress
                  </p>
                  <p className="text-gray-900 text-3xl font-bold mt-1">{stats.inProgress}</p>
                </div>
              </div>
            </div>
          </section>

          {/* Course Navigation Tabs */}
          <div className="border-b border-gray-200">
            <div className="flex gap-8 overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative flex flex-col items-center justify-center pb-4 pt-2 group cursor-pointer whitespace-nowrap ${
                    activeTab === tab.id ? 'text-primary-600' : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  <p
                    className={`font-medium text-sm tracking-wide ${
                      activeTab === tab.id ? 'font-bold' : ''
                    }`}
                  >
                    {tab.label}
                    {tab.count > 0 && (
                      <span className="ml-2 bg-gray-200 text-gray-700 text-xs px-2 py-0.5 rounded-full">
                        {tab.count}
                      </span>
                    )}
                  </p>
                  <div
                    className={`absolute bottom-0 h-0.5 w-full rounded-t-full transition-colors ${
                      activeTab === tab.id ? 'bg-primary-600' : 'bg-transparent'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Course Grid */}
          {filteredEnrollments.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                  <BookOpen className="w-8 h-8 text-gray-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {activeTab === 'pending'
                      ? 'No pending enrollments'
                      : activeTab === 'completed'
                      ? 'No completed courses yet'
                      : activeTab === 'in-progress'
                      ? 'No courses in progress'
                      : 'No enrolled courses yet'}
                  </h3>
                  <p className="text-gray-500 mb-6">
                    {activeTab === 'all'
                      ? 'Start learning by enrolling in a course'
                      : 'Complete your current courses to see them here'}
                  </p>
                  {activeTab === 'all' && (
                    <Link
                      to="/courses"
                      className="inline-block bg-primary-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary-700 transition-colors"
                    >
                      Browse Courses
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-12">
              {filteredEnrollments.map((enrollment) => {
                const course = enrollment.course;
                const isPending = enrollment.status === 'pending';
                const isRejected = enrollment.status === 'rejected';

                return (
                  <div
                    key={enrollment._id}
                    className={`group flex flex-col bg-white rounded-xl overflow-hidden shadow-sm transition-all duration-300 ${
                      isPending
                        ? 'border-2 border-amber-300 hover:shadow-lg'
                        : isRejected
                        ? 'border-2 border-red-300'
                        : 'border border-gray-200 hover:shadow-lg'
                    } relative`}
                  >
                    {/* Pending/Rejected Badge */}
                    {isPending && (
                      <div className="absolute top-4 left-4 z-10">
                        <span className="bg-amber-100 text-amber-800 text-xs font-bold px-3 py-1.5 rounded-full border border-amber-200 shadow-sm flex items-center gap-1">
                          <Lock className="w-3 h-3" />
                          Pending Approval
                        </span>
                      </div>
                    )}
                    {isRejected && (
                      <div className="absolute top-4 left-4 z-10">
                        <span className="bg-red-100 text-red-800 text-xs font-bold px-3 py-1.5 rounded-full border border-red-200 shadow-sm">
                          Rejected
                        </span>
                      </div>
                    )}

                    {/* Thumbnail */}
                    <div
                      className={`relative h-48 w-full bg-gradient-to-br from-primary-400 to-primary-600 overflow-hidden ${
                        isPending || isRejected ? 'opacity-90' : ''
                      }`}
                    >
                      {isPending || isRejected ? (
                        <div className="absolute inset-0 bg-slate-900/10 z-0" />
                      ) : null}
                      {course.thumbnail ? (
                        <img
                          src={course.thumbnail}
                          alt={course.title}
                          className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${
                            isPending ? 'grayscale-[20%]' : ''
                          }`}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Play className="w-16 h-16 text-white opacity-50" />
                        </div>
                      )}
                      {!isPending && !isRejected && course.rating && (
                        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md text-xs font-bold text-gray-900 flex items-center gap-1 shadow-sm">
                          <Star className="w-3 h-3 text-amber-500 fill-current" />
                          {course.rating.toFixed(1)}
                        </div>
                      )}
                    </div>

                    <div className="p-5 flex flex-col flex-1 gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span
                            className={`${getCategoryColor(
                              course.category
                            )} text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider`}
                          >
                            {course.category}
                          </span>
                        </div>
                        <h3 className="text-gray-900 text-lg font-bold leading-snug mb-1 line-clamp-2">
                          {course.title}
                        </h3>
                        <p className="text-gray-500 text-sm">
                          By{' '}
                          <span className="text-gray-900 font-medium">
                            {course.instructor?.name || 'Unknown'}
                          </span>
                        </p>
                      </div>

                      {/* Progress Bar */}
                      <div
                        className={`flex flex-col gap-2 ${
                          isPending || isRejected ? 'opacity-60' : ''
                        }`}
                      >
                        <div className="flex justify-between text-xs font-medium text-gray-500">
                          <span>
                            {isPending
                              ? 'Not Started'
                              : isRejected
                              ? 'Rejected'
                              : 'Progress'}
                          </span>
                          {!isPending && !isRejected && (
                            <span>{enrollment.progress || 0}%</span>
                          )}
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              isPending || isRejected ? 'bg-slate-400' : 'bg-primary-600'
                            }`}
                            style={{ width: `${enrollment.progress || 0}%` }}
                          />
                        </div>
                      </div>

                      {/* CTA Button */}
                      {isPending ? (
                        <button
                          disabled
                          className="w-full mt-2 py-2.5 px-4 bg-slate-100 text-slate-400 rounded-lg font-medium text-sm cursor-not-allowed flex items-center justify-center gap-2 border border-slate-200"
                        >
                          <span>Awaiting Approval</span>
                          <Lock className="w-4 h-4" />
                        </button>
                      ) : isRejected ? (
                        <div className="w-full mt-2">
                          <p className="text-xs text-red-600 mb-2">
                            {enrollment.rejectedReason || 'Enrollment was not approved'}
                          </p>
                          <Link
                            to="/courses"
                            className="w-full py-2.5 px-4 bg-gray-100 text-gray-700 rounded-lg font-medium text-sm hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                          >
                            Browse Other Courses
                          </Link>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleContinueLearning(course._id)}
                          className="w-full mt-2 py-2.5 px-4 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2"
                        >
                          <span>
                            {enrollment.progress > 0 ? 'Continue Learning' : 'Start Learning'}
                          </span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default MyLearning;
