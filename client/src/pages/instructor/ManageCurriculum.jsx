import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Plus, Edit2, Trash2, ChevronDown, ChevronUp, Play, Upload,
  Save, X, FileVideo, Clock
} from 'lucide-react';
import { getCourseById } from '../../services/courseService';
import api from '../../services/api';
import Spinner from '../../components/common/Spinner';
import toast from 'react-hot-toast';

export default function ManageCurriculum() {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState({});

  // Section form
  const [showSectionForm, setShowSectionForm] = useState(false);
  const [editingSection, setEditingSection] = useState(null);
  const [sectionTitle, setSectionTitle] = useState('');

  // Lecture form
  const [showLectureForm, setShowLectureForm] = useState(false);
  const [editingLecture, setEditingLecture] = useState(null);
  const [currentSectionId, setCurrentSectionId] = useState(null);
  const [lectureData, setLectureData] = useState({
    title: '',
    description: '',
    isPreview: false,
    videoFile: null
  });
  const [uploadProgress, setUploadProgress] = useState(0);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchCourseData();
  }, [courseId]);

  const fetchCourseData = async () => {
    try {
      setLoading(true);
      const data = await getCourseById(courseId);
      const courseData = data.data.course;
      setCourse(courseData);
      setSections(courseData.sections || []);

      // Expand first section by default
      if (courseData.sections && courseData.sections.length > 0) {
        setExpandedSections({ [courseData.sections[0]._id]: true });
      }
    } catch (error) {
      console.error('Failed to fetch course:', error);
      toast.error(error.response?.data?.message || 'Failed to load course');
      navigate('/instructor/dashboard');
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

  // ========== SECTION OPERATIONS ==========

  const openSectionForm = (section = null) => {
    setEditingSection(section);
    setSectionTitle(section ? section.title : '');
    setShowSectionForm(true);
  };

  const closeSectionForm = () => {
    setShowSectionForm(false);
    setEditingSection(null);
    setSectionTitle('');
  };

  const handleSaveSection = async () => {
    if (!sectionTitle.trim()) {
      toast.error('Please enter a section title');
      return;
    }

    try {
      setProcessing(true);

      if (editingSection) {
        // Update existing section
        await api.put(`/courses/${courseId}/sections/${editingSection._id}`, {
          title: sectionTitle
        });
        toast.success('Section updated!');
      } else {
        // Create new section
        await api.post(`/courses/${courseId}/sections`, {
          title: sectionTitle,
          order: sections.length
        });
        toast.success('Section created!');
      }

      closeSectionForm();
      fetchCourseData();
    } catch (error) {
      console.error('Failed to save section:', error);
      toast.error(error.response?.data?.message || 'Failed to save section');
    } finally {
      setProcessing(false);
    }
  };

  const handleDeleteSection = async (sectionId) => {
    if (!window.confirm('Are you sure? This will delete all lectures in this section.')) {
      return;
    }

    try {
      await api.delete(`/courses/${courseId}/sections/${sectionId}`);
      toast.success('Section deleted');
      fetchCourseData();
    } catch (error) {
      console.error('Failed to delete section:', error);
      toast.error(error.response?.data?.message || 'Failed to delete section');
    }
  };

  // ========== LECTURE OPERATIONS ==========

  const openLectureForm = (sectionId, lecture = null) => {
    setCurrentSectionId(sectionId);
    setEditingLecture(lecture);
    setLectureData({
      title: lecture ? lecture.title : '',
      description: lecture ? lecture.description : '',
      isPreview: lecture ? lecture.isPreview : false,
      videoFile: null
    });
    setShowLectureForm(true);
    setUploadProgress(0);
  };

  const closeLectureForm = () => {
    setShowLectureForm(false);
    setEditingLecture(null);
    setCurrentSectionId(null);
    setLectureData({ title: '', description: '', isPreview: false, videoFile: null });
    setUploadProgress(0);
  };

  const handleSaveLecture = async () => {
    if (!lectureData.title.trim()) {
      toast.error('Please enter a lecture title');
      return;
    }

    if (!editingLecture && !lectureData.videoFile) {
      toast.error('Please select a video file');
      return;
    }

    try {
      setProcessing(true);

      const formData = new FormData();
      formData.append('title', lectureData.title);
      formData.append('description', lectureData.description);
      formData.append('isPreview', lectureData.isPreview);

      if (lectureData.videoFile) {
        formData.append('video', lectureData.videoFile);
      }

      if (editingLecture) {
        // Update existing lecture (without video)
        await api.put(
          `/courses/${courseId}/sections/${currentSectionId}/lectures/${editingLecture._id}`,
          {
            title: lectureData.title,
            description: lectureData.description,
            isPreview: lectureData.isPreview
          }
        );
        toast.success('Lecture updated!');
      } else {
        // Create new lecture with video upload
        await api.post(
          `/courses/${courseId}/sections/${currentSectionId}/lectures`,
          formData,
          {
            headers: { 'Content-Type': 'multipart/form-data' },
            onUploadProgress: (progressEvent) => {
              const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              setUploadProgress(progress);
            }
          }
        );
        toast.success('Lecture created!');
      }

      closeLectureForm();
      fetchCourseData();
    } catch (error) {
      console.error('Failed to save lecture:', error);
      toast.error(error.response?.data?.message || 'Failed to save lecture');
    } finally {
      setProcessing(false);
    }
  };

  const handleDeleteLecture = async (sectionId, lectureId) => {
    if (!window.confirm('Are you sure you want to delete this lecture?')) {
      return;
    }

    try {
      await api.delete(`/courses/${courseId}/sections/${sectionId}/lectures/${lectureId}`);
      toast.success('Lecture deleted');
      fetchCourseData();
    } catch (error) {
      console.error('Failed to delete lecture:', error);
      toast.error(error.response?.data?.message || 'Failed to delete lecture');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Manage Curriculum</h1>
              <p className="mt-1 text-sm text-gray-500">{course?.title}</p>
            </div>
            <button
              onClick={() => navigate(`/instructor/courses/${courseId}/edit`)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
            >
              Back to Course
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Add Section Button */}
        <button
          onClick={() => openSectionForm()}
          className="w-full mb-6 px-6 py-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition flex items-center justify-center gap-2 text-gray-600 hover:text-blue-600"
        >
          <Plus className="w-5 h-5" />
          Add New Section
        </button>

        {/* Sections List */}
        <div className="space-y-4">
          {sections.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
              <FileVideo className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-500 text-lg mb-2">No sections yet</p>
              <p className="text-gray-400 text-sm">Start by adding your first section</p>
            </div>
          ) : (
            sections.map((section, sectionIndex) => (
              <div key={section._id} className="bg-white rounded-xl shadow-sm border border-gray-200">
                {/* Section Header */}
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <button
                        onClick={() => toggleSection(section._id)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        {expandedSections[section._id] ? (
                          <ChevronUp className="w-5 h-5" />
                        ) : (
                          <ChevronDown className="w-5 h-5" />
                        )}
                      </button>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">
                          Section {sectionIndex + 1}: {section.title}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          {section.lectures?.length || 0} lectures
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => openSectionForm(section)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        title="Edit Section"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteSection(section._id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="Delete Section"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Lectures List */}
                {expandedSections[section._id] && (
                  <div className="p-6">
                    <div className="space-y-3 mb-4">
                      {section.lectures && section.lectures.length > 0 ? (
                        section.lectures.map((lecture, lectureIndex) => (
                          <div
                            key={lecture._id}
                            className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                          >
                            <Play className="w-5 h-5 text-gray-400 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-900">
                                {lectureIndex + 1}. {lecture.title}
                              </p>
                              <div className="flex items-center gap-3 mt-1">
                                <span className="text-sm text-gray-500 flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {Math.floor(lecture.duration / 60)}:{String(lecture.duration % 60).padStart(2, '0')}
                                </span>
                                {lecture.isPreview && (
                                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                                    Free Preview
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => openLectureForm(section._id, lecture)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                title="Edit Lecture"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteLecture(section._id, lecture._id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                title="Delete Lecture"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-center py-8 text-gray-500">No lectures in this section</p>
                      )}
                    </div>

                    {/* Add Lecture Button */}
                    <button
                      onClick={() => openLectureForm(section._id)}
                      className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition flex items-center justify-center gap-2 text-gray-600 hover:text-blue-600"
                    >
                      <Plus className="w-4 h-4" />
                      Add Lecture
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Section Form Modal */}
      {showSectionForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {editingSection ? 'Edit Section' : 'Add New Section'}
            </h3>
            <input
              type="text"
              value={sectionTitle}
              onChange={(e) => setSectionTitle(e.target.value)}
              placeholder="Section title (e.g., Introduction to React)"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              autoFocus
            />
            <div className="flex gap-3 mt-6">
              <button
                onClick={closeSectionForm}
                disabled={processing}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveSection}
                disabled={processing || !sectionTitle.trim()}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                {processing ? 'Saving...' : 'Save Section'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lecture Form Modal */}
      {showLectureForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 my-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingLecture ? 'Edit Lecture' : 'Add New Lecture'}
              </h3>
              <button
                onClick={closeLectureForm}
                disabled={processing}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lecture Title *
                </label>
                <input
                  type="text"
                  value={lectureData.title}
                  onChange={(e) => setLectureData({ ...lectureData, title: e.target.value })}
                  placeholder="e.g., Introduction to React Hooks"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={lectureData.description}
                  onChange={(e) => setLectureData({ ...lectureData, description: e.target.value })}
                  placeholder="Brief description of what students will learn..."
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                />
              </div>

              {!editingLecture && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Video File *
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition">
                    <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <input
                      type="file"
                      accept="video/*"
                      onChange={(e) => setLectureData({ ...lectureData, videoFile: e.target.files[0] })}
                      className="hidden"
                      id="video-upload"
                    />
                    <label
                      htmlFor="video-upload"
                      className="cursor-pointer text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Choose Video File
                    </label>
                    <p className="text-sm text-gray-500 mt-1">MP4, MOV, AVI up to 500MB</p>
                    {lectureData.videoFile && (
                      <p className="text-sm text-green-600 mt-2">
                        Selected: {lectureData.videoFile.name}
                      </p>
                    )}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isPreview"
                  checked={lectureData.isPreview}
                  onChange={(e) => setLectureData({ ...lectureData, isPreview: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <label htmlFor="isPreview" className="text-sm text-gray-700">
                  Make this a free preview lecture
                </label>
              </div>

              {uploadProgress > 0 && uploadProgress < 100 && (
                <div>
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Uploading...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={closeLectureForm}
                disabled={processing}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveLecture}
                disabled={processing || !lectureData.title.trim() || (!editingLecture && !lectureData.videoFile)}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {processing ? (
                  <>
                    <Spinner />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Lecture
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
