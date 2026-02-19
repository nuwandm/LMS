import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactPlayer from 'react-player';
import {
  ChevronLeft, ChevronRight, CheckCircle, Circle, Play,
  FileText, Download, Lock, ChevronDown, ChevronUp
} from 'lucide-react';
import { getCourseById } from '../../services/courseService';
import { getMyEnrollments, updateProgress } from '../../services/enrollmentService';
import Spinner from '../../components/common/Spinner';
import toast from 'react-hot-toast';

export default function VideoPlayer() {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [enrollment, setEnrollment] = useState(null);
  const [currentLecture, setCurrentLecture] = useState(null);
  const [currentSection, setCurrentSection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [expandedSections, setExpandedSections] = useState({});
  const [activeTab, setActiveTab] = useState('overview'); // overview, resources, notes

  useEffect(() => {
    fetchCourseAndEnrollment();
  }, [courseId]);

  const fetchCourseAndEnrollment = async () => {
    try {
      setLoading(true);

      // Fetch course details
      const courseData = await getCourseById(courseId);
      const courseDetails = courseData.data;
      setCourse(courseDetails);

      // Fetch enrollment status
      const enrollmentData = await getMyEnrollments();
      const userEnrollment = enrollmentData.data.enrollments.find(
        e => e.course._id === courseId && e.status === 'approved'
      );

      if (!userEnrollment) {
        toast.error('You are not enrolled in this course');
        navigate(`/courses/${courseId}`);
        return;
      }

      setEnrollment(userEnrollment);

      // Set first lecture as current if available
      if (courseDetails.sections && courseDetails.sections.length > 0) {
        const firstSection = courseDetails.sections[0];
        if (firstSection.lectures && firstSection.lectures.length > 0) {
          setCurrentSection(firstSection);
          setCurrentLecture(firstSection.lectures[0]);
          setExpandedSections({ [firstSection._id]: true });
        }
      }
    } catch (error) {
      console.error('Failed to load course:', error);
      toast.error(error.response?.data?.message || 'Failed to load course');
      navigate('/my-learning');
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = (sectionId) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const handleLectureSelect = (lecture, section) => {
    setCurrentLecture(lecture);
    setCurrentSection(section);
    setPlaying(true);
  };

  const handleMarkComplete = async () => {
    if (!currentLecture || !enrollment) return;

    try {
      await updateProgress(enrollment._id, currentLecture._id);
      toast.success('Lecture marked as complete!');

      // Update local state
      setEnrollment(prev => ({
        ...prev,
        completedLectures: [...(prev.completedLectures || []), currentLecture._id]
      }));

      // Auto-play next lecture
      handleNextLecture();
    } catch (error) {
      console.error('Failed to mark complete:', error);
      toast.error(error.response?.data?.message || 'Failed to update progress');
    }
  };

  const isLectureCompleted = (lectureId) => {
    return enrollment?.completedLectures?.includes(lectureId);
  };

  const handlePreviousLecture = () => {
    if (!course || !currentLecture) return;

    let allLectures = [];
    course.sections.forEach(section => {
      section.lectures.forEach(lecture => {
        allLectures.push({ lecture, section });
      });
    });

    const currentIndex = allLectures.findIndex(
      item => item.lecture._id === currentLecture._id
    );

    if (currentIndex > 0) {
      const prev = allLectures[currentIndex - 1];
      handleLectureSelect(prev.lecture, prev.section);
    }
  };

  const handleNextLecture = () => {
    if (!course || !currentLecture) return;

    let allLectures = [];
    course.sections.forEach(section => {
      section.lectures.forEach(lecture => {
        allLectures.push({ lecture, section });
      });
    });

    const currentIndex = allLectures.findIndex(
      item => item.lecture._id === currentLecture._id
    );

    if (currentIndex < allLectures.length - 1) {
      const next = allLectures[currentIndex + 1];
      handleLectureSelect(next.lecture, next.section);
    } else {
      toast.success('Course completed! 🎉');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (!course || !currentLecture) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 text-lg mb-4">No lectures available</p>
          <button
            onClick={() => navigate('/my-learning')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to My Learning
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex">
      {/* Main Content Area - Video Player */}
      <div className="flex-1 flex flex-col">
        {/* Video Player */}
        <div className="bg-black aspect-video w-full">
          <ReactPlayer
            url={currentLecture.videoUrl}
            width="100%"
            height="100%"
            controls
            playing={playing}
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
            config={{
              file: {
                attributes: {
                  controlsList: 'nodownload',
                  disablePictureInPicture: false
                }
              }
            }}
          />
        </div>

        {/* Lecture Info & Controls */}
        <div className="bg-gray-800 text-white p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-4">
              <div className="flex-1">
                <h1 className="text-2xl font-bold mb-2">{currentLecture.title}</h1>
                <p className="text-gray-400 text-sm">{currentSection?.title}</p>
              </div>
              <button
                onClick={handleMarkComplete}
                disabled={isLectureCompleted(currentLecture._id)}
                className={`px-6 py-2 rounded-lg font-medium transition flex items-center gap-2 ${
                  isLectureCompleted(currentLecture._id)
                    ? 'bg-green-600 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {isLectureCompleted(currentLecture._id) ? (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Completed
                  </>
                ) : (
                  <>
                    <Circle className="w-5 h-5" />
                    Mark as Complete
                  </>
                )}
              </button>
            </div>

            {/* Navigation Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handlePreviousLecture}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition flex items-center gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>
              <button
                onClick={handleNextLecture}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition flex items-center gap-2"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Tabs & Content */}
        <div className="bg-gray-800 text-white flex-1">
          <div className="max-w-7xl mx-auto px-6">
            {/* Tab Headers */}
            <div className="flex border-b border-gray-700">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-6 py-3 font-medium transition ${
                  activeTab === 'overview'
                    ? 'text-blue-400 border-b-2 border-blue-400'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('resources')}
                className={`px-6 py-3 font-medium transition ${
                  activeTab === 'resources'
                    ? 'text-blue-400 border-b-2 border-blue-400'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Resources
              </button>
            </div>

            {/* Tab Content */}
            <div className="py-6">
              {activeTab === 'overview' && (
                <div className="prose prose-invert max-w-none">
                  <p className="text-gray-300">{currentLecture.description || 'No description available.'}</p>
                </div>
              )}

              {activeTab === 'resources' && (
                <div>
                  {currentLecture.resources && currentLecture.resources.length > 0 ? (
                    <div className="space-y-2">
                      {currentLecture.resources.map((resource, index) => (
                        <a
                          key={index}
                          href={resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition"
                        >
                          <FileText className="w-5 h-5 text-blue-400" />
                          <span className="flex-1">{resource.title}</span>
                          <Download className="w-4 h-4 text-gray-400" />
                        </a>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-400">No resources available for this lecture.</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar - Course Curriculum */}
      <div className="w-96 bg-gray-900 border-l border-gray-700 overflow-y-auto">
        <div className="p-4 border-b border-gray-700">
          <h2 className="text-white font-semibold text-lg">Course Content</h2>
          <p className="text-gray-400 text-sm mt-1">
            {enrollment?.progress || 0}% Complete
          </p>
          <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{ width: `${enrollment?.progress || 0}%` }}
            />
          </div>
        </div>

        <div className="p-2">
          {course.sections.map((section, sectionIndex) => (
            <div key={section._id} className="mb-2">
              {/* Section Header */}
              <button
                onClick={() => toggleSection(section._id)}
                className="w-full flex items-center justify-between p-3 bg-gray-800 hover:bg-gray-750 rounded-lg transition text-left"
              >
                <div className="flex-1">
                  <p className="text-white font-medium text-sm">
                    Section {sectionIndex + 1}: {section.title}
                  </p>
                  <p className="text-gray-400 text-xs mt-1">
                    {section.lectures?.length || 0} lectures
                  </p>
                </div>
                {expandedSections[section._id] ? (
                  <ChevronUp className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                )}
              </button>

              {/* Lectures List */}
              {expandedSections[section._id] && (
                <div className="mt-1 space-y-1 pl-2">
                  {section.lectures.map((lecture, lectureIndex) => {
                    const isCompleted = isLectureCompleted(lecture._id);
                    const isCurrent = currentLecture._id === lecture._id;

                    return (
                      <button
                        key={lecture._id}
                        onClick={() => handleLectureSelect(lecture, section)}
                        className={`w-full flex items-center gap-3 p-3 rounded-lg transition text-left ${
                          isCurrent
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-800 hover:bg-gray-750 text-gray-300'
                        }`}
                      >
                        {lecture.isPreview ? (
                          <Play className="w-4 h-4 flex-shrink-0" />
                        ) : isCompleted ? (
                          <CheckCircle className="w-4 h-4 flex-shrink-0 text-green-400" />
                        ) : (
                          <Circle className="w-4 h-4 flex-shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium truncate ${isCurrent ? 'text-white' : ''}`}>
                            {lectureIndex + 1}. {lecture.title}
                          </p>
                          <p className={`text-xs mt-0.5 ${isCurrent ? 'text-blue-100' : 'text-gray-500'}`}>
                            {Math.floor(lecture.duration / 60)}:{String(lecture.duration % 60).padStart(2, '0')}
                          </p>
                        </div>
                        {lecture.isPreview && !enrollment && (
                          <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded">
                            Preview
                          </span>
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
