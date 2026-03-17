import express from 'express';
import {
  getAllCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  togglePublishCourse,
  uploadCourseThumbnail,
  getInstructorCourses,
  getInstructorStudents,
} from '../controllers/courseController.js';
import {
  getSectionsInCourse,
  createSection,
  updateSection,
  deleteSection,
} from '../controllers/sectionController.js';
import {
  getLecturesInSection,
  createLecture,
  updateLecture,
  deleteLecture,
  getLectureById,
} from '../controllers/lectureController.js';
import { verifyToken, optionalAuth } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';
import { uploadThumbnail, uploadVideo } from '../config/cloudinary.js';

const router = express.Router();

// ============================================================================
// COURSE ROUTES
// ============================================================================

/**
 * @route   GET /api/courses
 * @desc    Get all published courses with filters
 * @access  Public
 */
router.get('/', getAllCourses);

/**
 * @route   GET /api/courses/instructor/my-courses
 * @desc    Get instructor's own courses
 * @access  Private (Instructor, Admin)
 */
router.get('/instructor/my-courses', verifyToken, requireRole('instructor', 'admin'), getInstructorCourses);

/**
 * @route   GET /api/courses/instructor/students
 * @desc    Get all students enrolled in instructor's courses
 * @access  Private (Instructor, Admin)
 */
router.get('/instructor/students', verifyToken, requireRole('instructor', 'admin'), getInstructorStudents);

/**
 * @route   GET /api/courses/:id
 * @desc    Get single course by ID
 * @access  Public (but draft courses only visible to owner/admin)
 */
router.get('/:id', optionalAuth, getCourseById);

/**
 * @route   POST /api/courses
 * @desc    Create new course
 * @access  Private (Instructor, Admin)
 */
router.post('/', verifyToken, requireRole('instructor', 'admin'), createCourse);

/**
 * @route   PUT /api/courses/:id
 * @desc    Update course
 * @access  Private (Owner, Admin)
 */
router.put('/:id', verifyToken, requireRole('instructor', 'admin'), updateCourse);

/**
 * @route   DELETE /api/courses/:id
 * @desc    Delete course
 * @access  Private (Owner, Admin)
 */
router.delete('/:id', verifyToken, requireRole('instructor', 'admin'), deleteCourse);

/**
 * @route   PUT /api/courses/:id/publish
 * @desc    Publish/unpublish/archive course
 * @access  Private (Owner, Admin)
 */
router.put('/:id/publish', verifyToken, requireRole('instructor', 'admin'), togglePublishCourse);

/**
 * @route   POST /api/courses/:id/thumbnail
 * @desc    Upload course thumbnail
 * @access  Private (Owner, Admin)
 */
router.post(
  '/:id/thumbnail',
  verifyToken,
  requireRole('instructor', 'admin'),
  (req, res, next) => {
    uploadThumbnail.single('thumbnail')(req, res, (err) => {
      if (err) {
        console.error('Thumbnail upload middleware error:', err);
        return res.status(400).json({
          success: false,
          message: err.message || 'File upload failed',
        });
      }
      next();
    });
  },
  uploadCourseThumbnail
);

// ============================================================================
// SECTION ROUTES
// ============================================================================

/**
 * @route   GET /api/courses/:courseId/sections
 * @desc    Get all sections in a course
 * @access  Public
 */
router.get('/:courseId/sections', getSectionsInCourse);

/**
 * @route   POST /api/courses/:courseId/sections
 * @desc    Create new section
 * @access  Private (Instructor/Owner, Admin)
 */
router.post('/:courseId/sections', verifyToken, requireRole('instructor', 'admin'), createSection);

/**
 * @route   PUT /api/courses/:courseId/sections/:sectionId
 * @desc    Update section
 * @access  Private (Instructor/Owner, Admin)
 */
router.put('/:courseId/sections/:sectionId', verifyToken, requireRole('instructor', 'admin'), updateSection);

/**
 * @route   DELETE /api/courses/:courseId/sections/:sectionId
 * @desc    Delete section
 * @access  Private (Instructor/Owner, Admin)
 */
router.delete('/:courseId/sections/:sectionId', verifyToken, requireRole('instructor', 'admin'), deleteSection);

// ============================================================================
// LECTURE ROUTES
// ============================================================================

/**
 * @route   GET /api/courses/:courseId/sections/:sectionId/lectures
 * @desc    Get all lectures in a section
 * @access  Private (Enrolled, Instructor, Admin)
 */
router.get('/:courseId/sections/:sectionId/lectures', verifyToken, getLecturesInSection);

/**
 * @route   POST /api/courses/:courseId/sections/:sectionId/lectures
 * @desc    Create new lecture with video upload
 * @access  Private (Instructor/Owner, Admin)
 */
router.post(
  '/:courseId/sections/:sectionId/lectures',
  verifyToken,
  requireRole('instructor', 'admin'),
  uploadVideo.single('video'),
  createLecture
);

/**
 * @route   GET /api/courses/:courseId/sections/:sectionId/lectures/:lectureId
 * @desc    Get single lecture
 * @access  Private (Enrolled, Instructor, Admin)
 */
router.get('/:courseId/sections/:sectionId/lectures/:lectureId', verifyToken, getLectureById);

/**
 * @route   PUT /api/courses/:courseId/sections/:sectionId/lectures/:lectureId
 * @desc    Update lecture
 * @access  Private (Instructor/Owner, Admin)
 */
router.put(
  '/:courseId/sections/:sectionId/lectures/:lectureId',
  verifyToken,
  requireRole('instructor', 'admin'),
  updateLecture
);

/**
 * @route   DELETE /api/courses/:courseId/sections/:sectionId/lectures/:lectureId
 * @desc    Delete lecture
 * @access  Private (Instructor/Owner, Admin)
 */
router.delete(
  '/:courseId/sections/:sectionId/lectures/:lectureId',
  verifyToken,
  requireRole('instructor', 'admin'),
  deleteLecture
);

export default router;
