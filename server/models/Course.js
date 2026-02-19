import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Course title is required'],
    trim: true,
    minlength: [5, 'Title must be at least 5 characters'],
    maxlength: [100, 'Title cannot exceed 100 characters'],
  },
  description: {
    type: String,
    required: [true, 'Course description is required'],
    minlength: [20, 'Description must be at least 20 characters'],
  },
  shortDescription: {
    type: String,
    maxlength: [200, 'Short description cannot exceed 200 characters'],
  },
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Instructor is required'],
    index: true,
  },
  category: {
    type: String,
    enum: {
      values: [
        'Web Development',
        'Mobile Development',
        'Data Science',
        'Design',
        'Business',
        'Marketing',
        'Photography',
        'Music',
        'Other'
      ],
      message: '{VALUE} is not a valid category',
    },
    required: [true, 'Category is required'],
    index: true,
  },
  level: {
    type: String,
    enum: {
      values: ['Beginner', 'Intermediate', 'Advanced'],
      message: '{VALUE} is not a valid level',
    },
    default: 'Beginner',
  },
  language: {
    type: String,
    default: 'English',
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    default: 0,
    min: [0, 'Price cannot be negative'],
  },
  thumbnail: {
    type: String,
    default: '',
  },
  thumbnailPublicId: {
    type: String, // Cloudinary public ID for deletion
  },
  sections: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Section',
  }],
  status: {
    type: String,
    enum: {
      values: ['draft', 'published', 'archived'],
      message: '{VALUE} is not a valid status',
    },
    default: 'draft',
    index: true,
  },
  totalDuration: {
    type: Number, // Total course duration in seconds
    default: 0,
  },
  totalLectures: {
    type: Number,
    default: 0,
  },
  enrollmentCount: {
    type: Number,
    default: 0,
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  },
  reviewCount: {
    type: Number,
    default: 0,
  },
  tags: [{
    type: String,
    trim: true,
  }],
  requirements: [{
    type: String,
    trim: true,
  }],
  whatYouLearn: [{
    type: String,
    trim: true,
  }],
}, {
  timestamps: true,
});

// ============================================================================
// INDEXES
// ============================================================================

// Text search index for title, description, and tags
courseSchema.index({
  title: 'text',
  description: 'text',
  tags: 'text',
});

// Compound indexes for common queries
courseSchema.index({ status: 1, category: 1 });
courseSchema.index({ status: 1, createdAt: -1 });
courseSchema.index({ instructor: 1, status: 1 });

// ============================================================================
// VIRTUAL FIELDS
// ============================================================================

/**
 * Get formatted duration (hours and minutes)
 */
courseSchema.virtual('formattedDuration').get(function() {
  const hours = Math.floor(this.totalDuration / 3600);
  const minutes = Math.floor((this.totalDuration % 3600) / 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
});

// ============================================================================
// INSTANCE METHODS
// ============================================================================

/**
 * Calculate and update total duration and lecture count
 */
courseSchema.methods.updateStats = async function() {
  const Section = mongoose.model('Section');
  const Lecture = mongoose.model('Lecture');

  const sections = await Section.find({ course: this._id });

  let totalDuration = 0;
  let totalLectures = 0;

  for (const section of sections) {
    const lectures = await Lecture.find({ section: section._id });
    totalLectures += lectures.length;
    totalDuration += lectures.reduce((sum, lecture) => sum + (lecture.duration || 0), 0);
  }

  this.totalDuration = totalDuration;
  this.totalLectures = totalLectures;

  await this.save();
};

/**
 * Check if user is the instructor of this course
 */
courseSchema.methods.isInstructor = function(userId) {
  return this.instructor.toString() === userId.toString();
};

// ============================================================================
// MIDDLEWARE
// ============================================================================

/**
 * Pre-remove hook: Delete all associated sections and lectures
 */
courseSchema.pre('deleteOne', { document: true, query: false }, async function(next) {
  try {
    const Section = mongoose.model('Section');
    const Lecture = mongoose.model('Lecture');

    // Find all sections
    const sections = await Section.find({ course: this._id });

    // Delete all lectures in those sections
    for (const section of sections) {
      await Lecture.deleteMany({ section: section._id });
    }

    // Delete all sections
    await Section.deleteMany({ course: this._id });

    next();
  } catch (error) {
    next(error);
  }
});

/**
 * Populate instructor on find queries
 */
courseSchema.pre(/^find/, function(next) {
  // Only populate if not already populated
  if (!this.options.skipPopulate) {
    this.populate({
      path: 'instructor',
      select: 'name email avatar bio',
    });
  }
  next();
});

const Course = mongoose.model('Course', courseSchema);

export default Course;
