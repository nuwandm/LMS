import { Course, Section } from '../models/index.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

// ============================================================================
// @route   GET /api/courses/:courseId/sections
// @desc    Get all sections in a course
// @access  Public (for published courses)
// ============================================================================
export const getSectionsInCourse = async (req, res) => {
  try {
    const { courseId } = req.params;

    const course = await Course.findById(courseId);
    if (!course) {
      return errorResponse(res, 'Course not found', 404);
    }

    const sections = await Section.find({ course: courseId })
      .populate('lectures', 'title duration isPreview order')
      .sort({ order: 1 });

    return successResponse(res, { sections }, 'Sections retrieved successfully');
  } catch (error) {
    console.error('GetSectionsInCourse error:', error);
    return errorResponse(res, 'Failed to fetch sections', 500);
  }
};

// ============================================================================
// @route   POST /api/courses/:courseId/sections
// @desc    Create new section
// @access  Private (Instructor/Owner + Admin)
// ============================================================================
export const createSection = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { title, order } = req.body;

    if (!title) {
      return errorResponse(res, 'Section title is required', 400);
    }

    // Check course ownership
    const course = await Course.findById(courseId);
    if (!course) {
      return errorResponse(res, 'Course not found', 404);
    }

    // Handle both populated and non-populated instructor field
    const instructorId = course.instructor._id || course.instructor;
    if (instructorId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return errorResponse(res, 'You do not have permission to add sections to this course', 403);
    }

    // Create section
    const section = await Section.create({
      title,
      course: courseId,
      order: order || course.sections.length,
    });

    // Add section to course
    course.sections.push(section._id);
    await course.save();

    return successResponse(res, { section }, 'Section created successfully', 201);
  } catch (error) {
    console.error('CreateSection error:', error);
    return errorResponse(res, 'Failed to create section', 500);
  }
};

// ============================================================================
// @route   PUT /api/courses/:courseId/sections/:sectionId
// @desc    Update section
// @access  Private (Instructor/Owner + Admin)
// ============================================================================
export const updateSection = async (req, res) => {
  try {
    const { courseId, sectionId } = req.params;
    const { title, order } = req.body;

    const section = await Section.findOne({ _id: sectionId, course: courseId });

    if (!section) {
      return errorResponse(res, 'Section not found', 404);
    }

    // Check course ownership
    const course = await Course.findById(courseId);
    const instructorId = course.instructor._id || course.instructor;
    if (instructorId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return errorResponse(res, 'You do not have permission to edit this section', 403);
    }

    // Update fields
    if (title !== undefined) section.title = title;
    if (order !== undefined) section.order = order;

    await section.save();

    return successResponse(res, { section }, 'Section updated successfully');
  } catch (error) {
    console.error('UpdateSection error:', error);
    return errorResponse(res, 'Failed to update section', 500);
  }
};

// ============================================================================
// @route   DELETE /api/courses/:courseId/sections/:sectionId
// @desc    Delete section (and all lectures in it)
// @access  Private (Instructor/Owner + Admin)
// ============================================================================
export const deleteSection = async (req, res) => {
  try {
    const { courseId, sectionId } = req.params;

    const section = await Section.findOne({ _id: sectionId, course: courseId });

    if (!section) {
      return errorResponse(res, 'Section not found', 404);
    }

    // Check course ownership
    const course = await Course.findById(courseId);
    const instructorId = course.instructor._id || course.instructor;
    if (instructorId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return errorResponse(res, 'You do not have permission to delete this section', 403);
    }

    // Delete section (will cascade delete lectures via middleware)
    await section.deleteOne();

    // Remove section from course
    course.sections = course.sections.filter(s => s.toString() !== sectionId);
    await course.save();

    return successResponse(res, null, 'Section deleted successfully');
  } catch (error) {
    console.error('DeleteSection error:', error);
    return errorResponse(res, 'Failed to delete section', 500);
  }
};
