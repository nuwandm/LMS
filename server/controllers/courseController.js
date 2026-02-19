import { Course, Section, Lecture } from '../models/index.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';
import { deleteImage } from '../services/cloudinaryService.js';

// ============================================================================
// @route   GET /api/courses
// @desc    Get all published courses with search, filter, pagination
// @access  Public
// ============================================================================
export const getAllCourses = async (req, res) => {
  try {
    const {
      search,
      category,
      level,
      minPrice,
      maxPrice,
      page = 1,
      limit = 12,
      sortBy = 'newest'
    } = req.query;

    // Build query
    const query = { status: 'published' };

    // Text search
    if (search) {
      query.$text = { $search: search };
    }

    // Category filter
    if (category) {
      query.category = category;
    }

    // Level filter
    if (level) {
      query.level = level;
    }

    // Price filter
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Pagination
    const skip = (page - 1) * limit;

    // Sort options
    const sortOptions = {
      'newest': { createdAt: -1 },
      'oldest': { createdAt: 1 },
      'popular': { enrollmentCount: -1 },
      'rating': { rating: -1 },
      'price-low': { price: 1 },
      'price-high': { price: -1 },
    };

    // Execute query
    const [courses, total] = await Promise.all([
      Course.find(query)
        .populate('instructor', 'name avatar bio')
        .sort(sortOptions[sortBy] || { createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .select('-sections'), // Don't include sections in list view
      Course.countDocuments(query),
    ]);

    return successResponse(res, {
      courses,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit),
      },
    }, 'Courses retrieved successfully');
  } catch (error) {
    console.error('GetAllCourses error:', error);
    return errorResponse(res, 'Failed to fetch courses', 500);
  }
};

// ============================================================================
// @route   GET /api/courses/:id
// @desc    Get single course by ID with full details
// @access  Public
// ============================================================================
export const getCourseById = async (req, res) => {
  try {
    const { id } = req.params;

    const course = await Course.findById(id)
      .populate('instructor', 'name avatar bio')
      .populate({
        path: 'sections',
        populate: {
          path: 'lectures',
          select: 'title duration isPreview order',
        },
        options: { sort: { order: 1 } },
      });

    if (!course) {
      return errorResponse(res, 'Course not found', 404);
    }

    // If course is draft, only instructor or admin can view
    if (course.status === 'draft') {
      if (!req.user || (req.user._id.toString() !== course.instructor._id.toString() && req.user.role !== 'admin')) {
        return errorResponse(res, 'Course not found', 404);
      }
    }

    return successResponse(res, { course }, 'Course retrieved successfully');
  } catch (error) {
    console.error('GetCourseById error:', error);
    return errorResponse(res, 'Failed to fetch course', 500);
  }
};

// ============================================================================
// @route   POST /api/courses
// @desc    Create new course (instructor only)
// @access  Private (Instructor, Admin)
// ============================================================================
export const createCourse = async (req, res) => {
  try {
    const {
      title,
      description,
      shortDescription,
      category,
      level,
      language,
      price,
      tags,
      requirements,
      whatYouLearn,
    } = req.body;

    // Validation
    if (!title || !description || !category) {
      return errorResponse(res, 'Please provide title, description, and category', 400);
    }

    // Create course
    const course = await Course.create({
      title,
      description,
      shortDescription,
      instructor: req.user._id,
      category,
      level: level || 'Beginner',
      language: language || 'English',
      price: price || 0,
      tags: tags || [],
      requirements: requirements || [],
      whatYouLearn: whatYouLearn || [],
      status: 'draft', // All new courses start as draft
    });

    // Add course to instructor's createdCourses
    req.user.createdCourses.push(course._id);
    await req.user.save();

    return successResponse(res, { course }, 'Course created successfully', 201);
  } catch (error) {
    console.error('CreateCourse error:', error);
    return errorResponse(res, error.message || 'Failed to create course', 500);
  }
};

// ============================================================================
// @route   PUT /api/courses/:id
// @desc    Update course (instructor/owner only)
// @access  Private (Owner, Admin)
// ============================================================================
export const updateCourse = async (req, res) => {
  try {
    const { id } = req.params;

    const course = await Course.findById(id);

    if (!course) {
      return errorResponse(res, 'Course not found', 404);
    }

    // Check ownership (allow admins to edit any course)
    if ((course.instructor._id || course.instructor).toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return errorResponse(res, 'You do not have permission to edit this course', 403);
    }

    // Update fields
    const allowedFields = [
      'title', 'description', 'shortDescription', 'category', 'level',
      'language', 'price', 'tags', 'requirements', 'whatYouLearn'
    ];

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        course[field] = req.body[field];
      }
    });

    await course.save();

    return successResponse(res, { course }, 'Course updated successfully');
  } catch (error) {
    console.error('UpdateCourse error:', error);
    return errorResponse(res, 'Failed to update course', 500);
  }
};

// ============================================================================
// @route   DELETE /api/courses/:id
// @desc    Delete course (instructor/owner only)
// @access  Private (Owner, Admin)
// ============================================================================
export const deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;

    const course = await Course.findById(id);

    if (!course) {
      return errorResponse(res, 'Course not found', 404);
    }

    // Check ownership
    if ((course.instructor._id || course.instructor).toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return errorResponse(res, 'You do not have permission to delete this course', 403);
    }

    // Delete thumbnail from Cloudinary if exists
    if (course.thumbnailPublicId) {
      await deleteImage(course.thumbnailPublicId).catch(err =>
        console.error('Failed to delete thumbnail:', err)
      );
    }

    // Delete course (will cascade delete sections and lectures via middleware)
    await course.deleteOne();

    return successResponse(res, null, 'Course deleted successfully');
  } catch (error) {
    console.error('DeleteCourse error:', error);
    return errorResponse(res, 'Failed to delete course', 500);
  }
};

// ============================================================================
// @route   PUT /api/courses/:id/publish
// @desc    Publish or unpublish course
// @access  Private (Owner, Admin)
// ============================================================================
export const togglePublishCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'published', 'draft', or 'archived'

    if (!['published', 'draft', 'archived'].includes(status)) {
      return errorResponse(res, 'Invalid status. Must be: published, draft, or archived', 400);
    }

    const course = await Course.findById(id);

    if (!course) {
      return errorResponse(res, 'Course not found', 404);
    }

    // Check ownership
    if ((course.instructor._id || course.instructor).toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return errorResponse(res, 'You do not have permission to modify this course', 403);
    }

    // Validate course is ready to publish
    if (status === 'published') {
      if (!course.thumbnail) {
        return errorResponse(res, 'Please add a course thumbnail before publishing', 400);
      }
      if (course.totalLectures === 0) {
        return errorResponse(res, 'Please add at least one lecture before publishing', 400);
      }
    }

    course.status = status;
    await course.save();

    return successResponse(res, { course }, `Course ${status} successfully`);
  } catch (error) {
    console.error('TogglePublishCourse error:', error);
    return errorResponse(res, 'Failed to update course status', 500);
  }
};

// ============================================================================
// @route   POST /api/courses/:id/thumbnail
// @desc    Upload course thumbnail
// @access  Private (Owner, Admin)
// ============================================================================
export const uploadCourseThumbnail = async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.file) {
      return errorResponse(res, 'Please upload an image file', 400);
    }

    const course = await Course.findById(id);

    if (!course) {
      return errorResponse(res, 'Course not found', 404);
    }

    // Check ownership
    if ((course.instructor._id || course.instructor).toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return errorResponse(res, 'You do not have permission to modify this course', 403);
    }

    // Delete old thumbnail if exists
    if (course.thumbnailPublicId) {
      await deleteImage(course.thumbnailPublicId).catch(err =>
        console.error('Failed to delete old thumbnail:', err)
      );
    }

    // Update course with new thumbnail
    course.thumbnail = req.file.path; // Cloudinary URL
    course.thumbnailPublicId = req.file.filename; // Cloudinary public ID

    await course.save();

    return successResponse(res, {
      course,
      thumbnail: {
        url: req.file.path,
        publicId: req.file.filename,
      }
    }, 'Thumbnail uploaded successfully');
  } catch (error) {
    console.error('UploadCourseThumbnail error:', error);
    return errorResponse(res, 'Failed to upload thumbnail', 500);
  }
};

// ============================================================================
// @route   GET /api/courses/instructor/my-courses
// @desc    Get all courses created by logged-in instructor
// @access  Private (Instructor, Admin)
// ============================================================================
export const getInstructorCourses = async (req, res) => {
  try {
    const courses = await Course.find({ instructor: req.user._id })
      .populate('sections')
      .sort({ createdAt: -1 });

    return successResponse(res, { courses }, 'Instructor courses retrieved successfully');
  } catch (error) {
    console.error('GetInstructorCourses error:', error);
    return errorResponse(res, 'Failed to fetch instructor courses', 500);
  }
};
