import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactPlayer from 'react-player';
import {
  ChevronLeft, ChevronRight, CheckCircle, Circle, Play,
  FileText, Download, Lock, ChevronDown, ChevronUp, Loader2,
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

  useEffect(() => {
    fetchCourseAndEnrollment();
  }, [courseId]);

  const loadLectureVideo = (lecture, section) => {
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
      .catch(() => {
        toast.error('Failed to load video. Please try again.');
      })
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

  const toggleSection = (sectionId) => {
    setExpandedSections(prev => ({ ...prev, [sectionId]: !prev[sectionId] }));
  };

  const handleMarkComplete = async () => {
    if (!currentLecture || !enrollment) return;
    try {
      await updateProgress(enrollment._id, currentLecture._id);
      toast.success('Lecture marked as complete!');
      setEnrollment(prev => ({
        ...prev,
        completedLectures: [...(prev.completedLectures || []), currentLecture._id],
      }));
      handleNextLecture();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update progress');
    }
  };

  const isLectureCompleted = (lectureId) =>
    enrollment?.completedLectures?.some((id) => id === lectureId || id?.toString() === lectureId);

  const getAllLectures = () => {
    if (!course) return [];
    const all = [];
    course.sections.forEach(section => {
      section.lectures.forEach(lecture => all.push({ lecture, section }));
    });
    return all;
  };

  const handlePreviousLecture = () => {
    if (!currentLecture) return;
    const all = getAllLectures();
    const idx = all.findIndex(item => item.lecture._id === currentLecture._id);
    if (idx > 0) loadLectureVideo(all[idx - 1].lecture, all[idx - 1].section);
  };

  const handleNextLecture = () => {
    if (!currentLecture) return;
    const all = getAllLectures();
    const idx = all.findIndex(item => item.lecture._id === currentLecture._id);
    if (idx < all.length - 1) {
      loadLectureVideo(all[idx + 1].lecture, all[idx + 1].section);
    } else {
      toast.success('Course completed!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <Loader2 className="w-10 h-10 text-white animate-spin" />
      </div>
    );
  }

  if (!course || !currentLecture) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="text-center">
          <p className="text-slate-400 text-lg mb-4">No lectures available</p>
          <Button variant="secondary" onClick={() => navigate('/my-learning')}>
            Back to My Learning
          </Button>
        </div>
      </div>
    );
  }

  const completed = isLectureCompleted(currentLecture._id);

  return (
    <div className="min-h-screen bg-slate-950 flex">
      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Video Player */}
        <div className="bg-black aspect-video w-full relative">
          {videoLoading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-black">
              <Loader2 className="w-10 h-10 text-white animate-spin" />
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
              config={{ file: { attributes: { controlsList: 'nodownload', disablePictureInPicture: false } } }}
            />
          )}
        </div>

        {/* Lecture Info & Controls */}
        <div className="bg-slate-900 text-white px-6 py-5 border-b border-slate-800">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex-1 min-w-0">
                <h1 className="text-xl font-bold truncate">{currentLecture.title}</h1>
                <p className="text-slate-400 text-sm mt-0.5">{currentSection?.title}</p>
              </div>
              <Button
                onClick={handleMarkComplete}
                disabled={completed}
                variant={completed ? 'secondary' : 'default'}
                className={completed ? 'bg-emerald-600 hover:bg-emerald-600 text-white' : ''}
              >
                {completed ? (
                  <><CheckCircle className="w-4 h-4 mr-2" />Completed</>
                ) : (
                  <><Circle className="w-4 h-4 mr-2" />Mark as Complete</>
                )}
              </Button>
            </div>

            <div className="flex gap-2">
              <Button variant="secondary" size="sm" onClick={handlePreviousLecture} className="bg-slate-800 hover:bg-slate-700 text-white border-0 gap-1">
                <ChevronLeft className="w-4 h-4" />Previous
              </Button>
              <Button variant="secondary" size="sm" onClick={handleNextLecture} className="bg-slate-800 hover:bg-slate-700 text-white border-0 gap-1">
                Next<ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-slate-900 text-white flex-1">
          <div className="max-w-4xl mx-auto px-6">
            <div className="flex border-b border-slate-800">
              {['overview', 'resources'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    'px-6 py-3 font-medium transition capitalize text-sm',
                    activeTab === tab
                      ? 'text-white border-b-2 border-white'
                      : 'text-slate-400 hover:text-white'
                  )}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="py-6">
              {activeTab === 'overview' && (
                <p className="text-slate-300 text-sm leading-relaxed">
                  {currentLecture.description || 'No description available.'}
                </p>
              )}
              {activeTab === 'resources' && (
                <div>
                  {currentLecture.resources?.length > 0 ? (
                    <div className="space-y-2">
                      {currentLecture.resources.map((resource, i) => (
                        <a
                          key={i}
                          href={resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 p-4 bg-slate-800 rounded-lg hover:bg-slate-700 transition"
                        >
                          <FileText className="w-5 h-5 text-blue-400" />
                          <span className="flex-1 text-sm">{resource.title}</span>
                          <Download className="w-4 h-4 text-slate-400" />
                        </a>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-400 text-sm">No resources available for this lecture.</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div className="w-80 bg-slate-900 border-l border-slate-800 overflow-y-auto flex-shrink-0">
        <div className="p-4 border-b border-slate-800">
          <h2 className="text-white font-semibold">Course Content</h2>
          <div className="flex items-center justify-between text-sm text-slate-400 mt-1 mb-2">
            <span>{enrollment?.progress || 0}% Complete</span>
          </div>
          <Progress value={enrollment?.progress || 0} className="h-1.5 bg-slate-700" />
        </div>

        <div className="p-2">
          {course.sections.map((section, sectionIndex) => (
            <div key={section._id} className="mb-1">
              <button
                onClick={() => toggleSection(section._id)}
                className="w-full flex items-center justify-between p-3 bg-slate-800 hover:bg-slate-750 rounded-lg transition text-left"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium text-sm truncate">
                    Section {sectionIndex + 1}: {section.title}
                  </p>
                  <p className="text-slate-400 text-xs mt-0.5">
                    {section.lectures?.length || 0} lectures
                  </p>
                </div>
                {expandedSections[section._id]
                  ? <ChevronUp className="w-4 h-4 text-slate-400 flex-shrink-0 ml-2" />
                  : <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0 ml-2" />
                }
              </button>

              {expandedSections[section._id] && (
                <div className="mt-1 space-y-0.5 pl-2">
                  {section.lectures.map((lecture, lectureIndex) => {
                    const isCompleted = isLectureCompleted(lecture._id);
                    const isCurrent = currentLecture._id === lecture._id;

                    return (
                      <button
                        key={lecture._id}
                        onClick={() => loadLectureVideo(lecture, section)}
                        className={cn(
                          'w-full flex items-center gap-3 p-3 rounded-lg transition text-left',
                          isCurrent
                            ? 'bg-primary text-primary-foreground'
                            : 'text-slate-300 hover:bg-slate-800'
                        )}
                      >
                        {isCompleted ? (
                          <CheckCircle className="w-4 h-4 flex-shrink-0 text-emerald-400" />
                        ) : (
                          <Circle className="w-4 h-4 flex-shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium truncate">
                            {lectureIndex + 1}. {lecture.title}
                          </p>
                          <p className={cn('text-xs mt-0.5', isCurrent ? 'opacity-75' : 'text-slate-500')}>
                            {Math.floor((lecture.duration || 0) / 60)}:{String((lecture.duration || 0) % 60).padStart(2, '0')}
                          </p>
                        </div>
                        {lecture.isPreview && (
                          <Badge variant="secondary" className="text-xs flex-shrink-0">Preview</Badge>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
