import mongoose from 'mongoose';

const sectionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Section title is required'],
    trim: true,
    minlength: [3, 'Section title must be at least 3 characters'],
    maxlength: [100, 'Section title cannot exceed 100 characters'],
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: [true, 'Course reference is required'],
    index: true,
  },
  lectures: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lecture',
  }],
  order: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

// ============================================================================
// INDEXES
// ============================================================================
sectionSchema.index({ course: 1, order: 1 });

// ============================================================================
// VIRTUAL FIELDS
// ============================================================================

/**
 * Get total duration of all lectures in this section
 */
sectionSchema.virtual('totalDuration').get(function() {
  if (!this.lectures || !this.populated('lectures')) {
    return 0;
  }
  return this.lectures.reduce((total, lecture) => total + (lecture.duration || 0), 0);
});

/**
 * Get formatted duration
 */
sectionSchema.virtual('formattedDuration').get(function() {
  const duration = this.totalDuration;
  const hours = Math.floor(duration / 3600);
  const minutes = Math.floor((duration % 3600) / 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
});

// ============================================================================
// INSTANCE METHODS
// ============================================================================

/**
 * Get lecture count
 */
sectionSchema.methods.getLectureCount = function() {
  return this.lectures.length;
};

// ============================================================================
// MIDDLEWARE
// ============================================================================

/**
 * Pre-remove hook: Delete all associated lectures
 */
sectionSchema.pre('deleteOne', { document: true, query: false }, async function(next) {
  try {
    const Lecture = mongoose.model('Lecture');
    await Lecture.deleteMany({ section: this._id });
    next();
  } catch (error) {
    next(error);
  }
});

/**
 * Post-save hook: Update course stats
 */
sectionSchema.post('save', async function() {
  const Course = mongoose.model('Course');
  const course = await Course.findById(this.course);
  if (course) {
    await course.updateStats();
  }
});

/**
 * Post-remove hook: Update course stats
 */
sectionSchema.post('deleteOne', async function() {
  const Course = mongoose.model('Course');
  const course = await Course.findById(this.course);
  if (course) {
    await course.updateStats();
  }
});

const Section = mongoose.model('Section', sectionSchema);

export default Section;
