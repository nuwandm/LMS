import mongoose from 'mongoose';

const enrollmentSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Student reference is required'],
    index: true,
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: [true, 'Course reference is required'],
    index: true,
  },
  status: {
    type: String,
    enum: {
      values: ['pending', 'approved', 'rejected', 'cancelled'],
      message: '{VALUE} is not a valid enrollment status',
    },
    default: 'pending',
    index: true,
  },
  paymentMethod: {
    type: String,
    default: 'offline', // MVP only supports offline payment
  },
  paymentNote: {
    type: String,
    default: '', // Admin can add notes about offline payment verification
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Admin who approved
  },
  approvedAt: {
    type: Date,
  },
  rejectedReason: {
    type: String,
  },
  rejectedAt: {
    type: Date,
  },
  completedLectures: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lecture',
  }],
  progress: {
    type: Number,
    default: 0, // Percentage 0-100
    min: 0,
    max: 100,
  },
  lastAccessedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true, // createdAt, updatedAt
});

// ============================================================================
// INDEXES
// ============================================================================

// Prevent duplicate enrollments (one student per course)
enrollmentSchema.index({ student: 1, course: 1 }, { unique: true });

// Query optimization
enrollmentSchema.index({ status: 1, createdAt: -1 });
enrollmentSchema.index({ student: 1, status: 1 });

// ============================================================================
// VIRTUAL FIELDS
// ============================================================================

/**
 * Get formatted progress
 */
enrollmentSchema.virtual('formattedProgress').get(function() {
  return `${this.progress}%`;
});

/**
 * Check if enrollment is active
 */
enrollmentSchema.virtual('isActive').get(function() {
  return this.status === 'approved';
});

// ============================================================================
// INSTANCE METHODS
// ============================================================================

/**
 * Mark a lecture as completed and update progress
 * @param {ObjectId} lectureId - Lecture ID
 */
enrollmentSchema.methods.completeLecture = async function(lectureId) {
  // Check if lecture already completed
  if (this.completedLectures.includes(lectureId)) {
    return this;
  }

  // Add to completed lectures
  this.completedLectures.push(lectureId);

  // Update lastAccessedAt
  this.lastAccessedAt = new Date();

  // Calculate progress
  await this.calculateProgress();

  await this.save();
  return this;
};

/**
 * Calculate and update progress percentage
 */
enrollmentSchema.methods.calculateProgress = async function() {
  const Course = mongoose.model('Course');
  const course = await Course.findById(this.course);

  if (!course || course.totalLectures === 0) {
    this.progress = 0;
    return;
  }

  this.progress = Math.round((this.completedLectures.length / course.totalLectures) * 100);
};

/**
 * Approve enrollment
 * @param {ObjectId} adminId - Admin who is approving
 */
enrollmentSchema.methods.approve = async function(adminId) {
  this.status = 'approved';
  this.approvedBy = adminId;
  this.approvedAt = new Date();

  // Increment course enrollment count
  const Course = mongoose.model('Course');
  await Course.findByIdAndUpdate(this.course, {
    $inc: { enrollmentCount: 1 },
  });

  await this.save();
  return this;
};

/**
 * Reject enrollment
 * @param {String} reason - Reason for rejection
 */
enrollmentSchema.methods.reject = async function(reason) {
  this.status = 'rejected';
  this.rejectedReason = reason;
  this.rejectedAt = new Date();

  await this.save();
  return this;
};

/**
 * Cancel enrollment
 */
enrollmentSchema.methods.cancel = async function() {
  this.status = 'cancelled';

  // Decrement course enrollment count if was approved
  if (this.status === 'approved') {
    const Course = mongoose.model('Course');
    await Course.findByIdAndUpdate(this.course, {
      $inc: { enrollmentCount: -1 },
    });
  }

  await this.save();
  return this;
};

// ============================================================================
// MIDDLEWARE
// ============================================================================

/**
 * Populate student and course on find queries
 */
enrollmentSchema.pre(/^find/, function(next) {
  if (!this.options.skipPopulate) {
    this.populate({
      path: 'student',
      select: 'name email avatar',
    }).populate({
      path: 'course',
      select: 'title thumbnail instructor category price',
    });
  }
  next();
});

/**
 * Post-save hook: Update user's enrolledCourses array
 */
enrollmentSchema.post('save', async function() {
  try {
    const User = mongoose.model('User');
    const user = await User.findById(this.student);

    if (user && !user.enrolledCourses.includes(this._id)) {
      user.enrolledCourses.push(this._id);
      await user.save();
    }
  } catch (error) {
    console.error('Error updating user enrolledCourses:', error);
  }
});

const Enrollment = mongoose.model('Enrollment', enrollmentSchema);

export default Enrollment;
