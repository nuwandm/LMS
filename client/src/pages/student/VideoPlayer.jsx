import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactPlayer from 'react-player';
import {
  ChevronLeft, ChevronRight, CheckCircle2, Circle, Play,
  FileText, Download, ChevronDown, ChevronUp, Loader2,
  BookOpen, PanelRightClose, PanelRightOpen, SkipForward, Trophy,
} from 'lucide-react';
import { getCourseById, getLectureById } from '../../services/courseService';
import { getMyEnrollments, updateProgress } from '../../services/enrollmentService';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export default function VideoPlayer() {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [enrollment, setEnrollment] = useState(null);
  const [currentLecture, setCurrentLecture] = useState(null);
  const [currentSection, setCurrentSection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [videoLoading, setVideoLoading] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [expandedSections, setExpandedSections] = useState({});
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [autoAdvanceCountdown, setAutoAdvanceCountdown] = useState(null);
  const [showCompletion, setShowCompletion] = useState(false);
  const countdownRef = useRef(null);

  useEffect(() => {
    fetchCourseAndEnrollment();
    return () => clearInterval(countdownRef.current);
  }, [courseId]);

  const loadLectureVideo = (lecture, section) => {
    clearInterval(countdownRef.current);
    setAutoAdvanceCountdown(null);
    setCurrentSection(section);
    setCurrentLecture(lecture);
    setPlaying(false);
    setVideoLoading(true);

    getLectureById(courseId, section._id, lecture._id)
      .then((data) => {
        const fullLecture = data.data?.lecture;
        if (fullLecture) setCurrentLecture(fullLecture);
        setPlaying(true);
      })
      .catch(() => toast.error('Failed to load video. Please try again.'))
      .finally(() => setVideoLoading(false));
  };

  const fetchCourseAndEnrollment = async () => {
    try {
      setLoading(true);
      const courseData = await getCourseById(courseId);
      const courseDetails = courseData.data.course;
      setCourse(courseDetails);

      const enrollmentData = await getMyEnrollments();
      const userEnrollment = enrollmentData.data.enrollments.find(
        (e) => e.course._id.toString() === courseId && e.status === 'approved'
      );

      if (!userEnrollment) {
        toast.error('You are not enrolled in this course');
        navigate(`/courses/${courseId}`);
        return;
      }

      setEnrollment(userEnrollment);

      if (courseDetails?.sections?.length > 0) {
        const firstSection = courseDetails.sections[0];
        if (firstSection.lectures?.length > 0) {
          setExpandedSections({ [firstSection._id]: true });
          loadLectureVideo(firstSection.lectures[0], firstSection);
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load course');
      navigate('/my-learning');
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = (sectionId) =>
    setExpandedSections(prev => ({ ...prev, [sectionId]: !prev[sectionId] }));

  const handleMarkComplete = async () => {
    if (!currentLecture || !enrollment || isLectureCompleted(currentLecture._id)) return;
    try {
      await updateProgress(enrollment._id, currentLecture._id);
      toast.success('Lecture marked as complete!');
      const updatedCompleted = [...(enrollment.completedLectures || []), currentLecture._id];
      const newProgress = Math.round((updatedCompleted.length / getAllLectures().length) * 100);
      setEnrollment(prev => ({ ...prev, completedLectures: updatedCompleted, progress: newProgress }));
      handleNextLecture();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update progress');
    }
  };

  const handleVideoEnded = () => {
    setPlaying(false);
    const all = getAllLectures();
    const idx = all.findIndex(item => item.lecture._id === currentLecture._id);
    if (idx < all.length - 1) {
      setAutoAdvanceCountdown(5);
      countdownRef.current = setInterval(() => {
        setAutoAdvanceCountdown(prev => {
          if (prev <= 1) {
            clearInterval(countdownRef.current);
            loadLectureVideo(all[idx + 1].lecture, all[idx + 1].section);
            return null;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      setShowCompletion(true);
    }
  };

  const cancelAutoAdvance = () => {
    clearInterval(countdownRef.current);
    setAutoAdvanceCountdown(null);
  };

  const isLectureCompleted = (lectureId) =>
    enrollment?.completedLectures?.some((id) => id === lectureId || id?.toString() === lectureId);

  const getAllLectures = () => {
    if (!course) return [];
    const all = [];
    course.sections.forEach(section =>
      section.lectures.forEach(lecture => all.push({ lecture, section }))
    );
    return all;
  };

  const handlePreviousLecture = () => {
    const all = getAllLectures();
    const idx = all.findIndex(item => item.lecture._id === currentLecture._id);
    if (idx > 0) loadLectureVideo(all[idx - 1].lecture, all[idx - 1].section);
  };

  const handleNextLecture = () => {
    const all = getAllLectures();
    const idx = all.findIndex(item => item.lecture._id === currentLecture._id);
    if (idx < all.length - 1) loadLectureVideo(all[idx + 1].lecture, all[idx + 1].section);
    else setShowCompletion(true);
  };

  const getSectionCompletedCount = (section) =>
    section.lectures.filter(l => isLectureCompleted(l._id)).length;

  const formatDuration = (seconds) => {
    if (!seconds) return '0:00';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f0f0f]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 text-white animate-spin" />
          <p className="text-slate-400 text-sm">Loading course…</p>
        </div>
      </div>
    );
  }

  if (!course || !currentLecture) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f0f0f]">
        <div className="text-center">
          <BookOpen className="w-16 h-16 text-slate-700 mx-auto mb-4" />
          <p className="text-slate-400 text-lg mb-4">No lectures available</p>
          <Button variant="secondary" onClick={() => navigate('/my-learning')}>
            Back to My Learning
          </Button>
        </div>
      </div>
    );
  }

  const allLectures = getAllLectures();
  const currentIdx = allLectures.findIndex(item => item.lecture._id === currentLecture._id);
  const completed = isLectureCompleted(currentLecture._id);
  const progress = enrollment?.progress || 0;
  const nextLecture = allLectures[currentIdx + 1];

  return (
    <div className="h-screen bg-[#0f0f0f] flex flex-col overflow-hidden">

      {/* ── Top Navigation Bar ──────────────────────────────────────────────── */}
      <header className="h-14 bg-[#1a1a1a] border-b border-white/[0.07] flex items-center px-4 gap-3 flex-shrink-0 z-10">
        {/* Back */}
        <button
          onClick={() => navigate('/my-learning')}
          className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors text-sm shrink-0 group"
        >
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          <span className="hidden sm:inline">My Learning</span>
        </button>

        <div className="w-px h-5 bg-white/10 shrink-0" />

        {/* Course title */}
        <h1 className="text-white/80 text-sm truncate flex-1 min-w-0 font-medium">
          {course.title}
        </h1>

        {/* Progress bar + % */}
        <div className="hidden md:flex items-center gap-2.5 shrink-0">
          <div className="w-32 h-1.5 bg-white/[0.08] rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-700"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-slate-500 text-xs tabular-nums">{progress}%</span>
        </div>

        <div className="w-px h-5 bg-white/10 shrink-0 hidden md:block" />

        {/* Prev / counter / Next */}
        <div className="flex items-center gap-0.5 shrink-0">
          <button
            onClick={handlePreviousLecture}
            disabled={currentIdx <= 0}
            title="Previous lecture"
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.08] disabled:opacity-25 disabled:cursor-not-allowed transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-slate-600 text-xs tabular-nums px-1 select-none">
            {currentIdx + 1} / {allLectures.length}
          </span>
          <button
            onClick={handleNextLecture}
            disabled={currentIdx >= allLectures.length - 1}
            title="Next lecture"
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.08] disabled:opacity-25 disabled:cursor-not-allowed transition-all"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Mark Complete */}
        <button
          onClick={handleMarkComplete}
          disabled={completed}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 border',
            completed
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 cursor-default'
              : 'bg-emerald-600 border-emerald-600 hover:bg-emerald-500 hover:border-emerald-500 text-white'
          )}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{completed ? 'Completed' : 'Mark Complete'}</span>
        </button>

        {/* Sidebar toggle */}
        <button
          onClick={() => setSidebarOpen(p => !p)}
          title={sidebarOpen ? 'Hide sidebar' : 'Show sidebar'}
          className="p-2 rounded-lg text-slate-500 hover:text-white hover:bg-white/[0.08] transition-all shrink-0"
        >
          {sidebarOpen
            ? <PanelRightClose className="w-4 h-4" />
            : <PanelRightOpen className="w-4 h-4" />
          }
        </button>
      </header>

      {/* ── Main Content ────────────────────────────────────────────────────── */}
      <div className="flex flex-1 min-h-0 overflow-hidden">

        {/* Left — Video + info */}
        <div className="flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden">

          {/* Video */}
          <div className="bg-black w-full relative flex-1 min-h-0">
            {videoLoading ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black gap-3">
                <Loader2 className="w-12 h-12 text-white animate-spin" />
                <p className="text-slate-500 text-sm">Loading video…</p>
              </div>
            ) : (
              <ReactPlayer
                key={currentLecture._id}
                url={currentLecture.videoUrl}
                width="100%"
                height="100%"
                controls
                playing={playing}
                onPlay={() => setPlaying(true)}
                onPause={() => setPlaying(false)}
                onEnded={handleVideoEnded}
                config={{
                  file: { attributes: { controlsList: 'nodownload', disablePictureInPicture: false } },
                }}
              />
            )}

            {/* Auto-advance overlay */}
            {autoAdvanceCountdown !== null && nextLecture && (
              <div className="absolute inset-0 bg-black/85 flex items-center justify-center p-6">
                <div className="text-center max-w-sm w-full">
                  <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <SkipForward className="w-5 h-5 text-white" />
                  </div>
                  <p className="text-slate-400 text-xs uppercase tracking-widest mb-1">Up Next</p>
                  <p className="text-white font-semibold text-base mb-5 line-clamp-2">
                    {nextLecture.lecture.title}
                  </p>
                  <div className="flex items-center gap-3 justify-center">
                    <button
                      onClick={cancelAutoAdvance}
                      className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        clearInterval(countdownRef.current);
                        setAutoAdvanceCountdown(null);
                        loadLectureVideo(nextLecture.lecture, nextLecture.section);
                      }}
                      className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium transition-all flex items-center gap-2"
                    >
                      <span>Playing in {autoAdvanceCountdown}s</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Lecture heading + Tabs — fixed height, independently scrollable */}
          <div className="flex-shrink-0 flex flex-col border-t border-white/[0.05]" style={{ height: '220px' }}>

            {/* Heading + tab bar */}
            <div className="px-6 pt-4 pb-0 flex-shrink-0">
              <p className="text-slate-600 text-[11px] uppercase tracking-widest mb-1 font-medium">
                {currentSection?.title}
              </p>
              <h2 className="text-white text-base font-semibold leading-snug truncate">
                {currentLecture.title}
              </h2>
              <div className="flex border-b border-white/[0.05] mt-3">
                {['overview', 'resources'].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={cn(
                      'px-1 py-2.5 mr-7 text-sm capitalize border-b-2 -mb-px transition-all',
                      activeTab === tab
                        ? 'text-white border-white font-medium'
                        : 'text-slate-600 border-transparent hover:text-slate-400'
                    )}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab content — scrollable */}
            <div className="flex-1 min-h-0 overflow-y-auto px-6">
            <div className="py-4 max-w-3xl">
              {activeTab === 'overview' && (
                currentLecture.description
                  ? <p className="text-slate-400 text-sm leading-relaxed">{currentLecture.description}</p>
                  : <p className="text-slate-700 text-sm italic">No description provided for this lecture.</p>
              )}

              {activeTab === 'resources' && (
                currentLecture.resources?.length > 0 ? (
                  <div className="space-y-2">
                    {currentLecture.resources.map((resource, i) => (
                      <a
                        key={i}
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-4 bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.06] rounded-xl transition-all group"
                      >
                        <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                          <FileText className="w-4 h-4 text-blue-400" />
                        </div>
                        <span className="flex-1 text-sm text-slate-300 group-hover:text-white transition-colors truncate">
                          {resource.title}
                        </span>
                        <Download className="w-4 h-4 text-slate-700 group-hover:text-slate-400 shrink-0 transition-colors" />
                      </a>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center py-12 text-center">
                    <FileText className="w-10 h-10 text-slate-800 mb-3" />
                    <p className="text-slate-600 text-sm">No resources attached to this lecture.</p>
                  </div>
                )
              )}
            </div>
            </div>  {/* end scrollable tab content */}
          </div>    {/* end info section */}
        </div>      {/* end left panel */}

        {/* ── Sidebar ───────────────────────────────────────────────────────── */}
        {sidebarOpen && (
          <aside className="w-80 bg-[#141414] border-l border-white/[0.06] flex flex-col flex-shrink-0">

            {/* Sidebar header */}
            <div className="p-4 border-b border-white/[0.06] flex-shrink-0">
              <div className="flex items-center justify-between mb-2.5">
                <h3 className="text-white font-semibold text-sm">Course Content</h3>
                <span className="text-[11px] text-slate-600 tabular-nums">
                  {enrollment?.completedLectures?.length || 0} / {allLectures.length} done
                </span>
              </div>
              <Progress value={progress} className="h-1 bg-white/[0.07]" />
            </div>

            {/* Section list */}
            <div className="overflow-y-auto flex-1 py-1">
              {course.sections.map((section, sectionIdx) => {
                const completedCount = getSectionCompletedCount(section);
                const totalCount = section.lectures?.length || 0;
                const isExpanded = !!expandedSections[section._id];
                const allDone = completedCount === totalCount && totalCount > 0;

                return (
                  <div key={section._id} className="mb-0.5">

                    {/* Section toggle */}
                    <button
                      onClick={() => toggleSection(section._id)}
                      className="w-full flex items-start gap-3 px-4 py-3.5 hover:bg-white/[0.04] transition-colors text-left"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-[11px] font-semibold leading-snug uppercase tracking-wide">
                          Section {sectionIdx + 1}
                        </p>
                        <p className="text-slate-300 text-xs mt-0.5 leading-snug truncate">
                          {section.title}
                        </p>
                        <div className="flex items-center gap-1.5 mt-1.5">
                          <div className="flex-1 h-0.5 bg-white/[0.07] rounded-full overflow-hidden">
                            <div
                              className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                              style={{ width: totalCount > 0 ? `${(completedCount / totalCount) * 100}%` : '0%' }}
                            />
                          </div>
                          <span className={cn(
                            'text-[10px] tabular-nums shrink-0',
                            allDone ? 'text-emerald-400' : 'text-slate-600'
                          )}>
                            {completedCount}/{totalCount}
                          </span>
                        </div>
                      </div>
                      {isExpanded
                        ? <ChevronUp className="w-3.5 h-3.5 text-slate-600 shrink-0 mt-0.5" />
                        : <ChevronDown className="w-3.5 h-3.5 text-slate-600 shrink-0 mt-0.5" />
                      }
                    </button>

                    {/* Lecture items */}
                    {isExpanded && (
                      <div className="pb-1">
                        {section.lectures.map((lecture, lectureIdx) => {
                          const isCompleted = isLectureCompleted(lecture._id);
                          const isCurrent = currentLecture._id === lecture._id;

                          return (
                            <button
                              key={lecture._id}
                              onClick={() => loadLectureVideo(lecture, section)}
                              className={cn(
                                'w-full flex items-start gap-3 pl-4 pr-3 py-3 transition-all text-left border-l-2',
                                isCurrent
                                  ? 'bg-white/[0.07] border-emerald-500'
                                  : 'border-transparent hover:bg-white/[0.04]'
                              )}
                            >
                              {/* Status icon */}
                              <div className="shrink-0 mt-0.5 w-4">
                                {isCompleted ? (
                                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                ) : isCurrent ? (
                                  <div className="w-4 h-4 rounded-full border-[1.5px] border-emerald-400 flex items-center justify-center">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                  </div>
                                ) : (
                                  <Circle className="w-4 h-4 text-slate-700" />
                                )}
                              </div>

                              {/* Title + meta */}
                              <div className="flex-1 min-w-0">
                                <p className={cn(
                                  'text-xs leading-snug',
                                  isCurrent
                                    ? 'text-white font-medium'
                                    : isCompleted
                                    ? 'text-slate-500'
                                    : 'text-slate-300'
                                )}>
                                  {lectureIdx + 1}. {lecture.title}
                                </p>
                                <div className="flex items-center gap-2 mt-1">
                                  {lecture.duration > 0 && (
                                    <span className="text-[10px] text-slate-700 tabular-nums flex items-center gap-1">
                                      <Play className="w-2.5 h-2.5" />
                                      {formatDuration(lecture.duration)}
                                    </span>
                                  )}
                                  {lecture.isPreview && (
                                    <Badge className="h-4 text-[10px] px-1.5 bg-blue-500/10 text-blue-400 border-0 rounded font-normal">
                                      Preview
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </aside>
        )}
      </div>

      {/* ── Course Completion Modal ──────────────────────────────────────────── */}
      {showCompletion && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-[#1c1c1c] border border-white/[0.08] rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl">
            <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-5">
              <Trophy className="w-8 h-8 text-emerald-400" />
            </div>
            <h2 className="text-white text-xl font-bold mb-2">You finished it!</h2>
            <p className="text-slate-400 text-sm mb-6 leading-relaxed">
              You've completed all lectures in{' '}
              <span className="text-white font-medium">{course.title}</span>. Amazing work!
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 border-white/10 bg-transparent text-white hover:bg-white/10 hover:text-white"
                onClick={() => setShowCompletion(false)}
              >
                Stay Here
              </Button>
              <Button
                className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white border-0"
                onClick={() => navigate('/my-learning')}
              >
                My Learning
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
