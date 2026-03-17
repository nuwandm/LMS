import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Star, Clock, Users, Globe, Calendar, ChevronDown, Play,
  Check, Video, FileText, Download, Monitor, Award, Share2,
  Gift, Tag, Heart,
} from 'lucide-react';
import Navbar from '../../components/common/Navbar';
import { getCourseById, getSections } from '../../services/courseService';
import { requestEnrollment, getMyEnrollments } from '../../services/enrollmentService';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';

const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();

  const [course, setCourse] = useState(null);
  const [sections, setSections] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [expandedSections, setExpandedSections] = useState(new Set([0]));
  const [activeTab, setActiveTab] = useState('overview');
  const [enrollmentStatus, setEnrollmentStatus] = useState(null);
  const [enrollmentChecked, setEnrollmentChecked] = useState(false);

  useEffect(() => {
    fetchCourseDetails();
    fetchCourseSections();
  }, [id]);

  useEffect(() => {
    if (isAuthenticated && user?.role === 'student') {
      checkEnrollmentStatus();
    } else {
      setEnrollmentChecked(true);
    }
  }, [id, isAuthenticated]);

  const fetchCourseDetails = async () => {
    try {
      const response = await getCourseById(id);
      if (response.success) setCourse(response.data.course);
    } catch (error) {
      toast.error('Failed to load course details');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCourseSections = async () => {
    try {
      const response = await getSections(id);
      if (response.success) {
        setSections(Array.isArray(response.data) ? response.data : response.data?.sections || []);
      }
    } catch {
      setSections([]);
    }
  };

  const checkEnrollmentStatus = async () => {
    try {
      const response = await getMyEnrollments();
      const enrollment = response.data?.enrollments?.find(
        (e) => e.course._id === id || e.course._id?.toString() === id
      );
      setEnrollmentStatus(enrollment?.status || null);
    } catch {
      // silently fail
    } finally {
      setEnrollmentChecked(true);
    }
  };

  const handleEnrollment = async () => {
    if (!isAuthenticated) { navigate('/login'); return; }
    if (user.role !== 'student') { toast.error('Only students can enroll in courses'); return; }
    try {
      setIsEnrolling(true);
      await requestEnrollment(id);
      toast.success('Enrollment request submitted! Admin will review it shortly.');
      setEnrollmentStatus('pending');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to request enrollment. Please try again.');
    } finally {
      setIsEnrolling(false);
    }
  };

  const toggleSection = (index) => {
    setExpandedSections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(index)) newSet.delete(index);
      else newSet.add(index);
      return newSet;
    });
  };

  const expandAllSections = () => {
    if (Array.isArray(sections)) setExpandedSections(new Set(sections.map((_, i) => i)));
  };

  const collapseAllSections = () => setExpandedSections(new Set());

  const formatDuration = (seconds) => {
    if (!seconds) return '0h';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  };

  const renderEnrollButton = (fullWidth = true) => {
    const cls = fullWidth ? 'w-full h-12 text-base' : 'h-12 text-base flex-1';

    if (!isAuthenticated) {
      return (
        <Button className={cls} onClick={() => navigate('/login')}>
          Login to Enroll
        </Button>
      );
    }

    if (user?.role !== 'student') return null;

    if (!enrollmentChecked || isEnrolling) {
      return (
        <Button className={cls} disabled>
          {isEnrolling ? 'Processing...' : 'Checking...'}
        </Button>
      );
    }

    if (enrollmentStatus === 'approved') {
      return (
        <Button className={cls} onClick={() => navigate(`/learn/${id}`)}>
          Go to Course →
        </Button>
      );
    }

    if (enrollmentStatus === 'pending') {
      return (
        <Button className={`${cls} bg-amber-500 hover:bg-amber-500 cursor-not-allowed`} disabled>
          Pending Approval
        </Button>
      );
    }

    if (enrollmentStatus === 'rejected') {
      return (
        <Button variant="outline" className={`${cls} border-destructive text-destructive cursor-not-allowed`} disabled>
          Enrollment Rejected
        </Button>
      );
    }

    return (
      <Button className={`${cls} bg-emerald-600 hover:bg-emerald-700`} onClick={handleEnrollment} disabled={isEnrolling}>
        Request Enrollment
      </Button>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-7xl mx-auto px-6 py-12 space-y-6">
          <Skeleton className="h-64 w-full rounded-xl" />
          <Skeleton className="h-96 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-7xl mx-auto px-6 py-20 text-center">
          <h1 className="text-3xl font-bold mb-4">Course Not Found</h1>
          <p className="text-muted-foreground mb-6">The course you're looking for doesn't exist.</p>
          <Button asChild><Link to="/courses">Browse All Courses</Link></Button>
        </div>
      </div>
    );
  }

  const tabs = ['overview', 'curriculum', 'instructor'];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <div className="bg-slate-900 text-white pt-8 pb-12">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 flex flex-col lg:flex-row gap-10">
          <div className="lg:w-[65%] flex flex-col gap-4">
            <div className="flex flex-wrap gap-2 text-slate-400 text-sm font-medium">
              <Link to="/" className="hover:text-white transition-colors">Home</Link>
              <span className="opacity-50">/</span>
              <Link to="/courses" className="hover:text-white transition-colors">Courses</Link>
              <span className="opacity-50">/</span>
              <span className="text-white">{course.category}</span>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold leading-tight tracking-tight mt-2">
              {course.title}
            </h1>

            <p className="text-lg text-white/80 font-light max-w-2xl mt-2 leading-relaxed">
              {course.shortDescription || course.description}
            </p>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2 text-sm">
              {course.status === 'published' && (
                <Badge className="bg-amber-400 text-slate-900 hover:bg-amber-400">Published</Badge>
              )}
              <div className="flex items-center gap-1">
                <span className="font-bold text-base mr-1">{course.rating?.toFixed(1) || '4.5'}</span>
                {[...Array(Math.floor(course.rating || 4))].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current text-amber-400" />
                ))}
              </div>
              <span className="text-slate-400">({course.enrollmentCount || 0} students)</span>
            </div>

            <div className="flex flex-wrap items-center gap-6 mt-2 text-sm text-white/80">
              <div className="flex items-center gap-2">
                <span>Created by</span>
                <span className="text-slate-300 font-semibold">{course.instructor?.name}</span>
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
      <div className="sticky top-[64px] z-40 bg-background border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <nav className="flex gap-8 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 border-b-2 whitespace-nowrap text-sm font-medium transition-colors capitalize ${
                  activeTab === tab
                    ? 'border-foreground text-foreground'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-10 flex flex-col lg:flex-row gap-10 relative">
        {/* Left Content */}
        <div className="lg:w-[65%] flex flex-col gap-6">
          {course.whatYouLearn && course.whatYouLearn.length > 0 && (
            <Card>
              <CardContent className="pt-6">
                <h2 className="text-lg font-bold mb-5">What you'll learn</h2>
                <div className="grid md:grid-cols-2 gap-x-6 gap-y-3">
                  {course.whatYouLearn.map((item, index) => (
                    <div key={index} className="flex gap-3 items-start">
                      <Check className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-muted-foreground leading-relaxed">{item}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardContent className="pt-6">
              <h2 className="text-lg font-bold mb-4">Course Description</h2>
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                {course.description}
              </p>
            </CardContent>
          </Card>

          {course.requirements && course.requirements.length > 0 && (
            <Card>
              <CardContent className="pt-6">
                <h2 className="text-lg font-bold mb-4">Requirements</h2>
                <ul className="space-y-2">
                  {course.requirements.map((req, index) => (
                    <li key={index} className="flex gap-3 items-start text-sm text-muted-foreground">
                      <span className="mt-1">•</span>
                      {req}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Curriculum */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Course Content</h2>
              {Array.isArray(sections) && sections.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={expandedSections.size === sections.length ? collapseAllSections : expandAllSections}
                >
                  {expandedSections.size === sections.length ? 'Collapse all' : 'Expand all'}
                </Button>
              )}
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              {Array.isArray(sections) ? sections.length : 0} sections • {course.totalLectures || 0} lectures • {formatDuration(course.totalDuration)} total
            </p>

            <div className="border rounded-lg overflow-hidden divide-y">
              {Array.isArray(sections) && sections.length > 0 ? sections.map((section, index) => (
                <div key={section._id} className="bg-background">
                  <button
                    onClick={() => toggleSection(index)}
                    className="flex justify-between items-center p-4 cursor-pointer w-full bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <ChevronDown className={`w-4 h-4 transition-transform ${expandedSections.has(index) ? 'rotate-180' : ''}`} />
                      <span className="font-semibold text-left">{section.title}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">{section.lectures?.length || 0} lectures</span>
                  </button>

                  {expandedSections.has(index) && (
                    <div className="p-4 flex flex-col gap-3">
                      {section.lectures && section.lectures.length > 0 ? (
                        section.lectures.map((lecture) => (
                          <div key={lecture._id} className="flex justify-between items-center text-sm">
                            <div className="flex items-center gap-3">
                              <Play className="w-4 h-4 text-muted-foreground" />
                              <span className="text-muted-foreground">{lecture.title}</span>
                            </div>
                            <div className="flex items-center gap-4">
                              {lecture.isPreview && (
                                <span className="text-primary font-semibold text-xs">Preview</span>
                              )}
                              <span className="text-muted-foreground w-12 text-right">
                                {formatDuration(lecture.duration)}
                              </span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground">No lectures yet.</p>
                      )}
                    </div>
                  )}
                </div>
              )) : (
                <div className="text-center py-8 text-muted-foreground">
                  No curriculum available yet.
                </div>
              )}
            </div>
          </div>

          {/* Instructor */}
          {course.instructor && (
            <div>
              <h2 className="text-xl font-bold mb-4">Instructor</h2>
              <Card>
                <CardContent className="pt-6 flex flex-col gap-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={course.instructor.avatar} alt={course.instructor.name} />
                      <AvatarFallback className="bg-primary text-primary-foreground text-xl font-bold">
                        {course.instructor.name?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-lg font-bold">{course.instructor.name}</h3>
                      <p className="text-sm text-muted-foreground">Instructor</p>
                    </div>
                  </div>
                  {course.instructor.bio && (
                    <p className="text-sm text-muted-foreground leading-relaxed">{course.instructor.bio}</p>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Desktop Sticky Sidebar */}
        <div className="hidden lg:block lg:w-[35%] relative">
          <div className="sticky top-24">
            <Card className="overflow-hidden shadow-lg">
              <div className="relative w-full aspect-video bg-slate-800 cursor-pointer group">
                {course.thumbnail ? (
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-full h-full object-cover opacity-80 group-hover:opacity-60 transition-opacity"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Video className="w-16 h-16 text-white opacity-30" />
                  </div>
                )}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <Play className="w-7 h-7 text-slate-900 ml-1" />
                  </div>
                </div>
                <div className="absolute bottom-4 left-0 w-full text-center text-white text-sm font-medium">
                  Preview this course
                </div>
              </div>

              <CardContent className="p-6">
                <div className="mb-5">
                  <span className="text-3xl font-bold">
                    {(course.price === 0 || !course.price) ? 'Free' : `$${(course.price || 0).toFixed(2)}`}
                  </span>
                </div>

                <div className="flex flex-col gap-3">
                  {renderEnrollButton(true)}
                  {(!enrollmentStatus && isAuthenticated && user?.role === 'student') && (
                    <Button variant="outline" className="w-full gap-2">
                      <Heart className="w-4 h-4" />
                      Add to Wishlist
                    </Button>
                  )}
                </div>

                <div className="mt-6">
                  <p className="font-semibold text-sm mb-3">This course includes:</p>
                  <ul className="flex flex-col gap-2.5">
                    {[
                      { icon: Video, text: `${formatDuration(course.totalDuration)} on-demand video` },
                      { icon: FileText, text: `${course.totalLectures || 0} lectures` },
                      { icon: Download, text: 'Full lifetime access' },
                      { icon: Monitor, text: 'Access on mobile and TV' },
                      { icon: Award, text: 'Certificate of completion' },
                    ].map(({ icon: Icon, text }) => (
                      <li key={text} className="flex items-center gap-3 text-sm text-muted-foreground">
                        <Icon className="w-4 h-4 flex-shrink-0" />
                        <span>{text}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Separator className="my-5" />
                <div className="flex justify-between items-center text-sm font-medium">
                  <button className="flex items-center gap-1 text-muted-foreground hover:text-foreground">
                    <Share2 className="w-4 h-4" />Share
                  </button>
                  <button className="flex items-center gap-1 text-muted-foreground hover:text-foreground">
                    <Gift className="w-4 h-4" />Gift
                  </button>
                  <button className="flex items-center gap-1 text-muted-foreground hover:text-foreground">
                    <Tag className="w-4 h-4" />Coupon
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Mobile Sticky Bottom */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-background border-t p-4 shadow-lg">
          <div className="flex items-center justify-between gap-4">
            <span className="text-xl font-bold">
              {(course.price === 0 || !course.price) ? 'Free' : `$${(course.price || 0).toFixed(2)}`}
            </span>
            {renderEnrollButton(false)}
          </div>
        </div>
      </div>

      <footer className="bg-slate-950 text-slate-400 py-10 mt-10 pb-24 lg:pb-10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <span className="text-lg font-bold text-white">LearnHub</span>
          <span className="text-sm">© 2026 LearnHub, Inc. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
};

export default CourseDetail;
