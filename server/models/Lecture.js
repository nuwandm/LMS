import mongoose from 'mongoose';

const lectureSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Lecture title is required'],
    trim: true,
    minlength: [3, 'Lecture title must be at least 3 characters'],
    maxlength: [150, 'Lecture title cannot exceed 150 characters'],
  },
  description: {
    type: String,
    default: '',
    maxlength: [1000, 'Description cannot exceed 1000 characters'],
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: [true, 'Course reference is required'],
    index: true,
  },
  section: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Section',
    required: [true, 'Section reference is required'],
    index: true,
  },
  videoUrl: {
    type: String,
    required: [true, 'Video URL is required'],
  },
  videoPublicId: {
    type: String,
    required: [true, 'Video public ID is required'], // For Cloudinary deletion
  },
  duration: {
    type: Number, // Duration in seconds
    default: 0,
  },
  isPreview: {
    type: Boolean,
    default: false, // Free preview for non-enrolled students
  },
  order: {
    type: Number,
    default: 0,
  },
  resources: [{
    title: {
      type: String,
      trim: true,
    },
    url: {
      type: String,
      trim: true,
    },
  }],
}, {
  timestamps: true,
});

// ============================================================================
// INDEXES
// ============================================================================
lectureSchema.index({ course: 1 });
lectureSchema.index({ section: 1, order: 1 });
lectureSchema.index({ isPreview: 1 });

// ============================================================================
// VIRTUAL FIELDS
// ============================================================================

/**
 * Get formatted duration
 */
lectureSchema.virtual('formattedDuration').get(function() {
  if (!this.duration) return '0:00';

  const hours = Math.floor(this.duration / 3600);
  const minutes = Math.floor((this.duration % 3600) / 60);
  const seconds = this.duration % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
});

// ============================================================================
// INSTANCE METHODS
// ============================================================================

/**
 * Check if user has access to this lecture
 * @param {ObjectId} userId - User ID
 * @param {Boolean} isEnrolled - Whether user is enrolled
 * @returns {Boolean}
 */
lectureSchema.methods.hasAccess = function(userId, isEnrolled) {
  // Allow access if lecture is a free preview OR user is enrolled
  return this.isPreview || isEnrolled;
};

// ============================================================================
// MIDDLEWARE
// ============================================================================

/**
 * Post-save hook: Update section lectures array and course stats
 */
lectureSchema.post('save', async function() {
  try {
    const Section = mongoose.model('Section');
    const Course = mongoose.model('Course');

    // Update section's lectures array if not already included
    const section = await Section.findById(this.section);
    if (section && !section.lectures.includes(this._id)) {
      section.lectures.push(this._id);
      await section.save();
    }

    // Update course stats
    const course = await Course.findById(this.course);
    if (course) {
      await course.updateStats();
    }
  } catch (error) {
    console.error('Error updating section/course after lecture save:', error);
  }
});

/**
 * Post-remove hook: Remove from section's lectures array and update course stats
 */
lectureSchema.post('deleteOne', { document: true, query: false }, async function() {
  try {
    const Section = mongoose.model('Section');
    const Course = mongoose.model('Course');

    // Remove from section's lectures array
    const section = await Section.findById(this.section);
    if (section) {
      section.lectures = section.lectures.filter(
        lectureId => lectureId.toString() !== this._id.toString()
      );
      await section.save();
    }

    // Update course stats
    const course = await Course.findById(this.course);
    if (course) {
      await course.updateStats();
    }
  } catch (error) {
    console.error('Error updating section/course after lecture deletion:', error);
  }
});

const Lecture = mongoose.model('Lecture', lectureSchema);

export default Lecture;
