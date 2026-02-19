import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Star,
  Clock,
  Users,
  Globe,
  Calendar,
  ChevronDown,
  Play,
  CheckCircle2,
  Check,
  Video,
  Code,
  FileText,
  Download,
  Monitor,
  Award,
  Share2,
  Gift,
  Tag,
  Heart,
} from 'lucide-react';
import Navbar from '../../components/common/Navbar';
import { getCourseById, getSections } from '../../services/courseService';
import { requestEnrollment } from '../../services/enrollmentService';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';

const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();

  const [course, setCourse] = useState(null);
  const [sections, setSections] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [expandedSections, setExpandedSections] = useState(new Set([0])); // First section expanded by default
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchCourseDetails();
    fetchCourseSections();
  }, [id]);

  const fetchCourseDetails = async () => {
    try {
      const response = await getCourseById(id);
      if (response.success) {
        setCourse(response.data);
      }
    } catch (error) {
      console.error('Error fetching course:', error);
      toast.error('Failed to load course details');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCourseSections = async () => {
    try {
      const response = await getSections(id);
      if (response.success) {
        setSections(response.data);
      }
    } catch (error) {
      console.error('Error fetching sections:', error);
    }
  };

  const handleEnrollment = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to enroll in this course');
      navigate('/login');
      return;
    }

    if (user.role !== 'student') {
      toast.error('Only students can enroll in courses');
      return;
    }

    try {
      setIsEnrolling(true);
      const response = await requestEnrollment(id);

      if (response.success) {
        toast.success('Enrollment request submitted! Admin will review it shortly.');
        // Optionally redirect to My Learning
        setTimeout(() => navigate('/my-learning'), 2000);
      }
    } catch (error) {
      console.error('Enrollment error:', error);
      const message =
        error.response?.data?.message || 'Failed to request enrollment. Please try again.';
      toast.error(message);
    } finally {
      setIsEnrolling(false);
    }
  };

  const toggleSection = (index) => {
    setExpandedSections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const expandAllSections = () => {
    setExpandedSections(new Set(sections.map((_, i) => i)));
  };

  const collapseAllSections = () => {
    setExpandedSections(new Set());
  };

  // Calculate total duration in readable format
  const formatDuration = (seconds) => {
    if (!seconds) return '0h';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  };

  // Render stars based on rating
  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const stars = [];

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} className="w-4 h-4 fill-current text-yellow-400" />);
    }
    if (hasHalfStar) {
      stars.push(<Star key="half" className="w-4 h-4 fill-current text-yellow-400 opacity-50" />);
    }
    return stars;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="animate-pulse space-y-8">
            <div className="h-64 bg-gray-200 rounded-xl" />
            <div className="h-96 bg-gray-200 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-6 py-12 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Course Not Found</h1>
          <p className="text-gray-500 mb-6">The course you're looking for doesn't exist.</p>
          <Link
            to="/courses"
            className="inline-block bg-primary-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary-700 transition-colors"
          >
            Browse All Courses
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary-700 to-primary-900 text-white pt-8 pb-12">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 flex flex-col lg:flex-row gap-10">
          {/* Left Content */}
          <div className="lg:w-[65%] flex flex-col gap-4">
            {/* Breadcrumbs */}
            <div className="flex flex-wrap gap-2 text-blue-200 text-sm font-medium">
              <Link to="/" className="hover:text-white transition-colors">
                Home
              </Link>
              <span className="opacity-50">/</span>
              <Link to="/courses" className="hover:text-white transition-colors">
                Courses
              </Link>
              <span className="opacity-50">/</span>
              <span className="text-white">{course.category}</span>
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-bold leading-tight tracking-tight mt-2">
              {course.title}
            </h1>

            {/* Description */}
            <p className="text-lg text-white/90 font-light max-w-2xl mt-2 leading-relaxed">
              {course.shortDescription || course.description}
            </p>

            {/* Rating & Stats */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-4 text-sm">
              {course.status === 'published' && (
                <div className="flex items-center gap-1 bg-yellow-400 text-gray-900 px-2 py-0.5 rounded font-bold text-xs">
                  Published
                </div>
              )}
              <div className="flex items-center gap-1">
                <span className="font-bold text-base mr-1">{course.rating?.toFixed(1) || '4.5'}</span>
                <div className="flex">{renderStars(course.rating || 4.5)}</div>
              </div>
              <span className="text-blue-200">({course.enrollmentCount || 0} students)</span>
            </div>

            {/* Instructor & Language */}
            <div className="flex flex-wrap items-center gap-6 mt-2 text-sm text-white/90">
              <div className="flex items-center gap-2">
                <span>Created by</span>
                <span className="text-blue-200 font-semibold">{course.instructor?.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>Updated {new Date(course.updatedAt).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4" />
                <span>{course.language || 'English'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Tab Navigation */}
      <div className="sticky top-[80px] z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <nav className="flex gap-8 overflow-x-auto">
            {['overview', 'curriculum', 'instructor', 'reviews'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 border-b-2 whitespace-nowrap text-sm font-medium transition-colors ${
                  activeTab === tab
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-900'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-10 flex flex-col lg:flex-row gap-10 relative">
        {/* Main Content Area (Left) */}
        <div className="lg:w-[65%] flex flex-col gap-10">
          {/* What you'll learn Box */}
          {course.whatYouLearn && course.whatYouLearn.length > 0 && (
            <div className="border border-gray-200 rounded-2xl p-6 bg-white" id="overview">
              <h2 className="text-xl font-bold mb-6 text-gray-900">What you'll learn</h2>
              <div className="grid md:grid-cols-2 gap-x-6 gap-y-3">
                {course.whatYouLearn.map((item, index) => (
                  <div key={index} className="flex gap-3 items-start">
                    <Check className="w-5 h-5 text-gray-900 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-gray-600 leading-relaxed">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Course Description */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <h2 className="text-xl font-bold mb-4 text-gray-900">Course Description</h2>
            <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
              {course.description}
            </p>
          </div>

          {/* Requirements */}
          {course.requirements && course.requirements.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <h2 className="text-xl font-bold mb-4 text-gray-900">Requirements</h2>
              <ul className="space-y-2">
                {course.requirements.map((req, index) => (
                  <li key={index} className="flex gap-3 items-start text-sm text-gray-600">
                    <span className="text-gray-400 mt-1">•</span>
                    {req}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Course Content Accordion */}
          <div id="curriculum">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">Course Content</h2>
            <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
              <p>
                {sections.length} sections • {course.totalLectures || 0} lectures •{' '}
                {formatDuration(course.totalDuration)} total length
              </p>
              <button
                onClick={expandedSections.size === sections.length ? collapseAllSections : expandAllSections}
                className="text-primary-600 font-bold hover:underline"
              >
                {expandedSections.size === sections.length ? 'Collapse all' : 'Expand all'}
              </button>
            </div>

            <div className="border border-gray-200 rounded-xl overflow-hidden divide-y divide-gray-200">
              {sections.map((section, index) => (
                <div key={section._id} className="bg-white">
                  <button
                    onClick={() => toggleSection(index)}
                    className="flex justify-between items-center p-4 cursor-pointer w-full bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <ChevronDown
                        className={`w-5 h-5 text-gray-900 transition-transform ${
                          expandedSections.has(index) ? 'rotate-180' : ''
                        }`}
                      />
                      <h3 className="font-bold text-gray-900 text-left">{section.title}</h3>
                    </div>
                    <span className="text-sm text-gray-500">
                      {section.lectures?.length || 0} lectures
                    </span>
                  </button>

                  {expandedSections.has(index) && (
                    <div className="bg-white p-4 flex flex-col gap-3">
                      {section.lectures && section.lectures.length > 0 ? (
                        section.lectures.map((lecture) => (
                          <div key={lecture._id} className="flex justify-between items-center text-sm">
                            <div className="flex items-center gap-3">
                              <Play className="w-4 h-4 text-gray-500" />
                              <span className="text-gray-700">{lecture.title}</span>
                            </div>
                            <div className="flex items-center gap-4">
                              {lecture.isPreview && (
                                <span className="text-primary-600 font-semibold text-xs cursor-pointer hover:underline">
                                  Preview
                                </span>
                              )}
                              <span className="text-gray-500 w-12 text-right">
                                {formatDuration(lecture.duration)}
                              </span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-gray-500">No lectures yet.</p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Instructor */}
          {course.instructor && (
            <div id="instructor">
              <h2 className="text-2xl font-bold mb-6 text-gray-900">Instructor</h2>
              <div className="flex flex-col gap-4 bg-white border border-gray-200 rounded-2xl p-6">
                <div className="flex items-center gap-4">
                  {course.instructor.avatar ? (
                    <img
                      src={course.instructor.avatar}
                      alt={course.instructor.name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center">
                      <span className="text-primary-600 font-bold text-xl">
                        {course.instructor.name.charAt(0)}
                      </span>
                    </div>
                  )}
                  <div>
                    <h3 className="text-primary-600 text-xl font-bold">
                      {course.instructor.name}
                    </h3>
                    <p className="text-gray-500 font-medium">Instructor</p>
                  </div>
                </div>

                {course.instructor.bio && (
                  <p className="text-sm text-gray-600 leading-relaxed">{course.instructor.bio}</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Sticky Right Sidebar (Desktop) */}
        <div className="hidden lg:block lg:w-[35%] relative">
          <div className="sticky top-24 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden flex flex-col">
            {/* Video Preview Area */}
            <div className="relative w-full aspect-video bg-gradient-to-br from-primary-400 to-primary-600 cursor-pointer group">
              {course.thumbnail ? (
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className="w-full h-full object-cover opacity-80 group-hover:opacity-60 transition-opacity"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Video className="w-16 h-16 text-white opacity-50" />
                </div>
              )}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <Play className="w-8 h-8 text-gray-900 ml-1" />
                </div>
              </div>
              <div className="absolute bottom-4 left-0 w-full text-center text-white font-bold text-sm">
                Preview this course
              </div>
            </div>

            <div className="p-6">
              {/* Price */}
              <div className="flex items-end gap-3 mb-4">
                <span className="text-3xl font-bold text-gray-900">
                  {course.price === 0 ? 'Free' : `$${course.price.toFixed(2)}`}
                </span>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col gap-3">
                <button
                  onClick={handleEnrollment}
                  disabled={isEnrolling}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-bold h-12 rounded-xl transition-colors shadow-sm text-base disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isEnrolling ? 'Processing...' : 'Request Enrollment'}
                </button>
                <button className="w-full bg-white border-2 border-gray-900 hover:bg-gray-50 text-gray-900 font-bold h-12 rounded-xl transition-colors text-base flex items-center justify-center gap-2">
                  <Heart className="w-5 h-5" />
                  Add to Wishlist
                </button>
              </div>

              {/* Course Includes */}
              <div className="mt-6">
                <p className="font-bold text-gray-900 mb-3 text-sm">This course includes:</p>
                <ul className="flex flex-col gap-2.5">
                  <li className="flex items-center gap-3 text-sm text-gray-600">
                    <Video className="w-4 h-4 text-gray-500" />
                    <span>{formatDuration(course.totalDuration)} on-demand video</span>
                  </li>
                  <li className="flex items-center gap-3 text-sm text-gray-600">
                    <FileText className="w-4 h-4 text-gray-500" />
                    <span>{course.totalLectures || 0} lectures</span>
                  </li>
                  <li className="flex items-center gap-3 text-sm text-gray-600">
                    <Download className="w-4 h-4 text-gray-500" />
                    <span>Full lifetime access</span>
                  </li>
                  <li className="flex items-center gap-3 text-sm text-gray-600">
                    <Monitor className="w-4 h-4 text-gray-500" />
                    <span>Access on mobile and TV</span>
                  </li>
                  <li className="flex items-center gap-3 text-sm text-gray-600">
                    <Award className="w-4 h-4 text-gray-500" />
                    <span>Certificate of completion</span>
                  </li>
                </ul>
              </div>

              {/* Share Links */}
              <div className="mt-6 pt-4 border-t border-gray-200 flex justify-between items-center text-sm font-medium">
                <button className="text-gray-900 hover:text-primary-600 flex items-center gap-1">
                  <Share2 className="w-4 h-4" />
                  Share
                </button>
                <button className="text-gray-900 hover:text-primary-600 flex items-center gap-1">
                  <Gift className="w-4 h-4" />
                  Gift
                </button>
                <button className="text-gray-900 hover:text-primary-600 flex items-center gap-1">
                  <Tag className="w-4 h-4" />
                  Coupon
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Sticky Bottom Bar */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
          <div className="flex items-center justify-between gap-4">
            <div className="flex flex-col">
              <span className="text-xl font-bold text-gray-900">
                {course.price === 0 ? 'Free' : `$${course.price.toFixed(2)}`}
              </span>
            </div>
            <button
              onClick={handleEnrollment}
              disabled={isEnrolling}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold h-12 rounded-xl transition-colors shadow-sm text-base disabled:opacity-50"
            >
              {isEnrolling ? 'Processing...' : 'Enroll Now'}
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 mt-12 pb-24 lg:pb-12">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-white">LearnHub</span>
          </div>
          <div className="text-sm">© 2026 LearnHub, Inc. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
};

export default CourseDetail;
