import { Course, Section, Lecture, Enrollment } from '../models/index.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';
import { deleteVideo } from '../services/cloudinaryService.js';

// ============================================================================
// @route   GET /api/courses/:courseId/sections/:sectionId/lectures
// @desc    Get all lectures in a section
// @access  Private (Enrolled students + Instructor + Admin)
// ============================================================================
export const getLecturesInSection = async (req, res) => {
  try {
    const { courseId, sectionId } = req.params;

    // Check if section belongs to course
    const section = await Section.findOne({ _id: sectionId, course: courseId })
      .populate({
        path: 'lectures',
        options: { sort: { order: 1 } }
      });

    if (!section) {
      return errorResponse(res, 'Section not found', 404);
    }

    const course = await Course.findById(courseId);

    // Check access
    const isInstructor = (course.instructor._id || course.instructor).toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isInstructor && !isAdmin) {
      // Check if student is enrolled
      const enrollment = await Enrollment.findOne({
        student: req.user._id,
        course: courseId,
        status: 'approved'
      });

      if (!enrollment) {
        // Only return preview lectures for non-enrolled students
        section.lectures = section.lectures.filter(lecture => lecture.isPreview);
      }
    }

    return successResponse(res, { section }, 'Lectures retrieved successfully');
  } catch (error) {
    console.error('GetLecturesInSection error:', error);
    return errorResponse(res, 'Failed to fetch lectures', 500);
  }
};

// ============================================================================
// @route   POST /api/courses/:courseId/sections/:sectionId/lectures
// @desc    Create new lecture with video upload
// @access  Private (Instructor/Owner + Admin)
// ============================================================================
export const createLecture = async (req, res) => {
  try {
    const { courseId, sectionId } = req.params;
    const { title, description, isPreview, order } = req.body;

    // Validation
    if (!title) {
      return errorResponse(res, 'Lecture title is required', 400);
    }

    if (!req.file) {
      return errorResponse(res, 'Please upload a video file', 400);
    }

    // Check course ownership
    const course = await Course.findById(courseId);
    if (!course) {
      return errorResponse(res, 'Course not found', 404);
    }

    if ((course.instructor._id || course.instructor).toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return errorResponse(res, 'You do not have permission to add lectures to this course', 403);
    }

    // Check section exists
    const section = await Section.findOne({ _id: sectionId, course: courseId });
    if (!section) {
      return errorResponse(res, 'Section not found', 404);
    }

    // Create lecture with video URL from Cloudinary upload
    const lecture = await Lecture.create({
      title,
      description: description || '',
      course: courseId,
      section: sectionId,
      videoUrl: req.file.path, // Cloudinary URL
      videoPublicId: req.file.filename, // Cloudinary public ID
      duration: Math.round(req.file.duration || 0), // Video duration in seconds
      isPreview: isPreview === 'true' || isPreview === true,
      order: order || section.lectures.length,
    });

    // Lecture will be added to section via post-save middleware
    // Course stats will be updated via post-save middleware

    return successResponse(res, { lecture }, 'Lecture created successfully', 201);
  } catch (error) {
    console.error('CreateLecture error:', error);
    return errorResponse(res, error.message || 'Failed to create lecture', 500);
  }
};

// ============================================================================
// @route   PUT /api/courses/:courseId/sections/:sectionId/lectures/:lectureId
// @desc    Update lecture details
// @access  Private (Instructor/Owner + Admin)
// ============================================================================
export const updateLecture = async (req, res) => {
  try {
    const { courseId, lectureId } = req.params;
    const { title, description, isPreview, order } = req.body;

    const lecture = await Lecture.findOne({ _id: lectureId, course: courseId });

    if (!lecture) {
      return errorResponse(res, 'Lecture not found', 404);
    }

    // Check course ownership
    const course = await Course.findById(courseId);
    if ((course.instructor._id || course.instructor).toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return errorResponse(res, 'You do not have permission to edit this lecture', 403);
    }

    // Update fields
    if (title !== undefined) lecture.title = title;
    if (description !== undefined) lecture.description = description;
    if (isPreview !== undefined) lecture.isPreview = isPreview;
    if (order !== undefined) lecture.order = order;

    await lecture.save();

    return successResponse(res, { lecture }, 'Lecture updated successfully');
  } catch (error) {
    console.error('UpdateLecture error:', error);
    return errorResponse(res, 'Failed to update lecture', 500);
  }
};

// ============================================================================
// @route   DELETE /api/courses/:courseId/sections/:sectionId/lectures/:lectureId
// @desc    Delete lecture and remove video from Cloudinary
// @access  Private (Instructor/Owner + Admin)
// ============================================================================
export const deleteLecture = async (req, res) => {
  try {
    const { courseId, lectureId } = req.params;

    const lecture = await Lecture.findOne({ _id: lectureId, course: courseId });

    if (!lecture) {
      return errorResponse(res, 'Lecture not found', 404);
    }

    // Check course ownership
    const course = await Course.findById(courseId);
    if ((course.instructor._id || course.instructor).toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return errorResponse(res, 'You do not have permission to delete this lecture', 403);
    }

    // Delete video from Cloudinary
    if (lecture.videoPublicId) {
      await deleteVideo(lecture.videoPublicId).catch(err =>
        console.error('Failed to delete video from Cloudinary:', err)
      );
    }

    // Delete lecture (will update section and course via middleware)
    await lecture.deleteOne();

    return successResponse(res, null, 'Lecture deleted successfully');
  } catch (error) {
    console.error('DeleteLecture error:', error);
    return errorResponse(res, 'Failed to delete lecture', 500);
  }
};

// ============================================================================
// @route   GET /api/courses/:courseId/sections/:sectionId/lectures/:lectureId
// @desc    Get single lecture details (with access check)
// @access  Private (Enrolled + Instructor + Admin)
// ============================================================================
export const getLectureById = async (req, res) => {
  try {
    const { courseId, lectureId } = req.params;

    const lecture = await Lecture.findOne({ _id: lectureId, course: courseId });

    if (!lecture) {
      return errorResponse(res, 'Lecture not found', 404);
    }

    const course = await Course.findById(courseId);

    // Check access
    const isInstructor = (course.instructor._id || course.instructor).toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isInstructor && !isAdmin && !lecture.isPreview) {
      // Check enrollment
      const enrollment = await Enrollment.findOne({
        student: req.user._id,
        course: courseId,
        status: 'approved'
      });

      if (!enrollment) {
        return errorResponse(res, 'You must be enrolled in this course to access this lecture', 403);
      }
    }

    return successResponse(res, { lecture }, 'Lecture retrieved successfully');
  } catch (error) {
    console.error('GetLectureById error:', error);
    return errorResponse(res, 'Failed to fetch lecture', 500);
  }
};
