import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Plus, Edit2, Trash2, ChevronDown, ChevronUp, Play,
  Upload, Save, FileVideo, Clock, Loader2,
} from 'lucide-react';
import { getCourseById } from '../../services/courseService';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import EmptyState from '../../components/common/EmptyState';

export default function ManageCurriculum() {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState({});

  // Section dialog
  const [showSectionDialog, setShowSectionDialog] = useState(false);
  const [editingSection, setEditingSection] = useState(null);
  const [sectionTitle, setSectionTitle] = useState('');

  // Lecture dialog
  const [showLectureDialog, setShowLectureDialog] = useState(false);
  const [editingLecture, setEditingLecture] = useState(null);
  const [currentSectionId, setCurrentSectionId] = useState(null);
  const [lectureData, setLectureData] = useState({ title: '', description: '', isPreview: false, videoFile: null });
  const [uploadProgress, setUploadProgress] = useState(0);
  const [processing, setProcessing] = useState(false);

  // Delete confirmations
  const [deleteSection, setDeleteSection] = useState(null);
  const [deleteLecture, setDeleteLecture] = useState(null);

  useEffect(() => { fetchCourseData(); }, [courseId]);

  const fetchCourseData = async () => {
    try {
      setLoading(true);
      const data = await getCourseById(courseId);
      const courseData = data.data.course;
      setCourse(courseData);
      setSections(courseData.sections || []);
      if (courseData.sections?.length > 0) {
        setExpandedSections({ [courseData.sections[0]._id]: true });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load course');
      navigate('/instructor/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = (sectionId) =>
    setExpandedSections((prev) => ({ ...prev, [sectionId]: !prev[sectionId] }));

  // ── Section operations ──────────────────────────────────────────────────────

  const openSectionDialog = (section = null) => {
    setEditingSection(section);
    setSectionTitle(section ? section.title : '');
    setShowSectionDialog(true);
  };

  const closeSectionDialog = () => {
    setShowSectionDialog(false);
    setEditingSection(null);
    setSectionTitle('');
  };

  const handleSaveSection = async () => {
    if (!sectionTitle.trim()) { toast.error('Please enter a section title'); return; }
    try {
      setProcessing(true);
      if (editingSection) {
        await api.put(`/courses/${courseId}/sections/${editingSection._id}`, { title: sectionTitle });
        toast.success('Section updated!');
      } else {
        await api.post(`/courses/${courseId}/sections`, { title: sectionTitle, order: sections.length });
        toast.success('Section created!');
      }
      closeSectionDialog();
      fetchCourseData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save section');
    } finally {
      setProcessing(false);
    }
  };

  const handleDeleteSection = async () => {
    try {
      await api.delete(`/courses/${courseId}/sections/${deleteSection._id}`);
      toast.success('Section deleted');
      setDeleteSection(null);
      fetchCourseData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete section');
    }
  };

  // ── Lecture operations ──────────────────────────────────────────────────────

  const openLectureDialog = (sectionId, lecture = null) => {
    setCurrentSectionId(sectionId);
    setEditingLecture(lecture);
    setLectureData({
      title: lecture?.title || '',
      description: lecture?.description || '',
      isPreview: lecture?.isPreview || false,
      videoFile: null,
    });
    setUploadProgress(0);
    setShowLectureDialog(true);
  };

  const closeLectureDialog = () => {
    setShowLectureDialog(false);
    setEditingLecture(null);
    setCurrentSectionId(null);
    setLectureData({ title: '', description: '', isPreview: false, videoFile: null });
    setUploadProgress(0);
  };

  const handleSaveLecture = async () => {
    if (!lectureData.title.trim()) { toast.error('Please enter a lecture title'); return; }
    if (!editingLecture && !lectureData.videoFile) { toast.error('Please select a video file'); return; }
    try {
      setProcessing(true);
      if (editingLecture) {
        await api.put(
          `/courses/${courseId}/sections/${currentSectionId}/lectures/${editingLecture._id}`,
          { title: lectureData.title, description: lectureData.description, isPreview: lectureData.isPreview }
        );
        toast.success('Lecture updated!');
      } else {
        const formData = new FormData();
        formData.append('title', lectureData.title);
        formData.append('description', lectureData.description);
        formData.append('isPreview', lectureData.isPreview);
        formData.append('video', lectureData.videoFile);
        await api.post(
          `/courses/${courseId}/sections/${currentSectionId}/lectures`,
          formData,
          {
            headers: { 'Content-Type': 'multipart/form-data' },
            onUploadProgress: (e) => setUploadProgress(Math.round((e.loaded * 100) / e.total)),
          }
        );
        toast.success('Lecture created!');
      }
      closeLectureDialog();
      fetchCourseData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save lecture');
    } finally {
      setProcessing(false);
    }
  };

  const handleDeleteLecture = async () => {
    try {
      await api.delete(`/courses/${courseId}/sections/${deleteLecture.sectionId}/lectures/${deleteLecture.lectureId}`);
      toast.success('Lecture deleted');
      setDeleteLecture(null);
      fetchCourseData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete lecture');
    }
  };

  if (loading) {
    return (
      <div className="p-8 max-w-4xl mx-auto space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-14 rounded-lg" />
        {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-24 rounded-lg" />)}
      </div>
    );
  }

  return (
    <div className="p-8 bg-muted/30 min-h-full">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Manage Curriculum</h1>
            <p className="text-sm text-muted-foreground mt-0.5">{course?.title}</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => navigate(`/instructor/courses/${courseId}/edit`)}>
            Back to Course
          </Button>
        </div>

        {/* Add Section */}
        <button
          onClick={() => openSectionDialog()}
          className="w-full px-6 py-4 border-2 border-dashed border-border rounded-lg hover:border-primary hover:bg-primary/5 transition flex items-center justify-center gap-2 text-muted-foreground hover:text-primary"
        >
          <Plus className="w-5 h-5" />
          Add New Section
        </button>

        {/* Sections List */}
        <div className="space-y-4">
          {sections.length === 0 ? (
            <EmptyState
              icon={FileVideo}
              title="No sections yet"
              description="Start by adding your first section above"
            />
          ) : (
            sections.map((section, sectionIndex) => (
              <div key={section._id} className="bg-card rounded-xl border shadow-sm">
                {/* Section Header */}
                <div className="px-6 py-4 border-b flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <button
                      onClick={() => toggleSection(section._id)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      {expandedSections[section._id]
                        ? <ChevronUp className="w-5 h-5" />
                        : <ChevronDown className="w-5 h-5" />}
                    </button>
                    <div className="flex-1">
                      <h3 className="font-semibold">
                        Section {sectionIndex + 1}: {section.title}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {section.lectures?.length || 0} lecture{section.lectures?.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openSectionDialog(section)}>
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive"
                      onClick={() => setDeleteSection(section)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Lectures */}
                {expandedSections[section._id] && (
                  <div className="p-6">
                    <div className="space-y-2 mb-4">
                      {section.lectures?.length > 0 ? (
                        section.lectures.map((lecture, li) => (
                          <div
                            key={lecture._id}
                            className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg hover:bg-muted transition"
                          >
                            <Play className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium">{li + 1}. {lecture.title}</p>
                              <div className="flex items-center gap-3 mt-0.5">
                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {Math.floor(lecture.duration / 60)}:{String(lecture.duration % 60).padStart(2, '0')}
                                </span>
                                {lecture.isPreview && (
                                  <Badge variant="secondary" className="text-xs py-0">Free Preview</Badge>
                                )}
                              </div>
                            </div>
                            <div className="flex gap-1">
                              <Button variant="ghost" size="icon" onClick={() => openLectureDialog(section._id, lecture)}>
                                <Edit2 className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-destructive hover:text-destructive"
                                onClick={() => setDeleteLecture({ sectionId: section._id, lectureId: lecture._id, title: lecture.title })}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground text-center py-6">No lectures in this section</p>
                      )}
                    </div>
                    <button
                      onClick={() => openLectureDialog(section._id)}
                      className="w-full px-4 py-2.5 border-2 border-dashed border-border rounded-lg hover:border-primary hover:bg-primary/5 transition flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-primary"
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

      {/* Section Dialog */}
      <Dialog open={showSectionDialog} onOpenChange={(open) => !open && closeSectionDialog()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingSection ? 'Edit Section' : 'Add New Section'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-2">
              <Label htmlFor="sectionTitle">Section Title</Label>
              <Input
                id="sectionTitle"
                value={sectionTitle}
                onChange={(e) => setSectionTitle(e.target.value)}
                placeholder="e.g., Introduction to React"
                onKeyDown={(e) => e.key === 'Enter' && handleSaveSection()}
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeSectionDialog} disabled={processing}>Cancel</Button>
            <Button onClick={handleSaveSection} disabled={processing || !sectionTitle.trim()} className="gap-2">
              {processing && <Loader2 className="w-4 h-4 animate-spin" />}
              <Save className="w-4 h-4" />
              {processing ? 'Saving...' : 'Save Section'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Lecture Dialog */}
      <Dialog open={showLectureDialog} onOpenChange={(open) => !open && !processing && closeLectureDialog()}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingLecture ? 'Edit Lecture' : 'Add New Lecture'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="lectureTitle">Lecture Title <span className="text-destructive">*</span></Label>
              <Input
                id="lectureTitle"
                value={lectureData.title}
                onChange={(e) => setLectureData({ ...lectureData, title: e.target.value })}
                placeholder="e.g., Introduction to React Hooks"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lectureDesc">Description</Label>
              <Textarea
                id="lectureDesc"
                value={lectureData.description}
                onChange={(e) => setLectureData({ ...lectureData, description: e.target.value })}
                placeholder="Brief description of what students will learn..."
                rows={3}
              />
            </div>

            {!editingLecture && (
              <div className="space-y-2">
                <Label>Video File <span className="text-destructive">*</span></Label>
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary transition">
                  <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                  <input
                    type="file"
                    accept="video/*"
                    onChange={(e) => setLectureData({ ...lectureData, videoFile: e.target.files[0] })}
                    className="hidden"
                    id="video-upload"
                  />
                  <label htmlFor="video-upload" className="cursor-pointer text-primary hover:underline font-medium text-sm">
                    Choose Video File
                  </label>
                  <p className="text-xs text-muted-foreground mt-1">MP4, MOV, AVI up to 500MB</p>
                  {lectureData.videoFile && (
                    <p className="text-xs text-emerald-600 mt-2 font-medium">
                      Selected: {lectureData.videoFile.name}
                    </p>
                  )}
                </div>
              </div>
            )}

            <div className="flex items-center gap-3">
              <Checkbox
                id="isPreview"
                checked={lectureData.isPreview}
                onCheckedChange={(checked) => setLectureData({ ...lectureData, isPreview: checked })}
              />
              <Label htmlFor="isPreview" className="font-normal cursor-pointer">
                Make this a free preview lecture
              </Label>
            </div>

            {uploadProgress > 0 && uploadProgress < 100 && (
              <div className="space-y-1.5">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Uploading...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeLectureDialog} disabled={processing}>Cancel</Button>
            <Button
              onClick={handleSaveLecture}
              disabled={processing || !lectureData.title.trim() || (!editingLecture && !lectureData.videoFile)}
              className="gap-2"
            >
              {processing
                ? <><Loader2 className="w-4 h-4 animate-spin" />Uploading...</>
                : <><Save className="w-4 h-4" />Save Lecture</>
              }
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Section Confirm */}
      <ConfirmDialog
        isOpen={!!deleteSection}
        onClose={() => setDeleteSection(null)}
        onConfirm={handleDeleteSection}
        title="Delete Section"
        message={`Delete section "${deleteSection?.title}"? This will also delete all lectures inside it. This cannot be undone.`}
        confirmText="Delete Section"
        variant="danger"
      />

      {/* Delete Lecture Confirm */}
      <ConfirmDialog
        isOpen={!!deleteLecture}
        onClose={() => setDeleteLecture(null)}
        onConfirm={handleDeleteLecture}
        title="Delete Lecture"
        message={`Delete lecture "${deleteLecture?.title}"? This cannot be undone.`}
        confirmText="Delete Lecture"
        variant="danger"
      />
    </div>
  );
}
