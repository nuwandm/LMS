import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Upload,
  X,
  Plus,
  FileText,
  Image as ImageIcon,
  Rocket,
} from 'lucide-react';
import Navbar from '../../components/common/Navbar';
import { createCourse, uploadCourseThumbnail } from '../../services/courseService';
import toast from 'react-hot-toast';

const CreateCourse = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form data
  const [formData, setFormData] = useState({
    title: '',
    shortDescription: '',
    description: '',
    category: '',
    level: 'Beginner',
    price: 0,
    language: 'English',
    requirements: [''],
    whatYouLearn: [''],
  });

  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);

  const steps = [
    { number: 1, name: 'Basic Info', icon: FileText },
    { number: 2, name: 'Media', icon: ImageIcon },
    { number: 3, name: 'Publish', icon: Rocket },
  ];

  const categories = [
    'Web Development',
    'Mobile Development',
    'Data Science',
    'Design',
    'Business',
    'Marketing',
    'Photography',
    'Music',
    'Other',
  ];

  const levels = ['Beginner', 'Intermediate', 'Advanced'];

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle array fields (requirements, whatYouLearn)
  const handleArrayChange = (field, index, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].map((item, i) => (i === index ? value : item)),
    }));
  };

  const addArrayItem = (field) => {
    setFormData((prev) => ({
      ...prev,
      [field]: [...prev[field], ''],
    }));
  };

  const removeArrayItem = (field, index) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  // Handle thumbnail upload
  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }
      setThumbnailFile(file);
      setThumbnailPreview(URL.createObjectURL(file));
    }
  };

  const removeThumbnail = () => {
    setThumbnailFile(null);
    setThumbnailPreview(null);
  };

  // Validation
  const validateStep = (step) => {
    if (step === 1) {
      if (!formData.title.trim()) {
        toast.error('Please enter a course title');
        return false;
      }
      if (!formData.description.trim()) {
        toast.error('Please enter a course description');
        return false;
      }
      if (!formData.category) {
        toast.error('Please select a category');
        return false;
      }
    }
    return true;
  };

  // Navigation
  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 3));
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  // Submit course
  const handleSubmit = async () => {
    if (!validateStep(1)) return;

    try {
      setIsSubmitting(true);

      // Clean up array fields (remove empty strings)
      const cleanedData = {
        ...formData,
        requirements: formData.requirements.filter((r) => r.trim() !== ''),
        whatYouLearn: formData.whatYouLearn.filter((w) => w.trim() !== ''),
        price: parseFloat(formData.price) || 0,
      };

      // Create course
      const response = await createCourse(cleanedData);

      if (response.success) {
        const courseId = response.data._id;

        // Upload thumbnail if provided
        if (thumbnailFile) {
          try {
            await uploadCourseThumbnail(courseId, thumbnailFile);
          } catch (error) {
            console.error('Thumbnail upload failed:', error);
            // Don't fail the entire process if thumbnail fails
          }
        }

        toast.success('Course created successfully!');
        setTimeout(() => {
          navigate('/instructor/dashboard');
        }, 1500);
      }
    } catch (error) {
      console.error('Error creating course:', error);
      const message = error.response?.data?.message || 'Failed to create course';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="flex-1">
        {/* Header with Stepper */}
        <header className="bg-white border-b border-gray-200 px-8 py-6 sticky top-20 z-10">
          <div className="max-w-4xl mx-auto w-full">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                  Create New Course
                </h1>
                <p className="text-gray-500 text-sm">
                  Step {currentStep} of {steps.length} • {steps[currentStep - 1].name}
                </p>
              </div>
              <button
                onClick={() => navigate('/instructor/dashboard')}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
              >
                Cancel
              </button>
            </div>

            {/* Stepper */}
            <div className="flex items-center w-full max-w-2xl mx-auto">
              {steps.map((step, index) => (
                <div key={step.number} className="flex items-center flex-1">
                  {/* Step Circle */}
                  <div className="flex flex-col items-center gap-2 relative z-10">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                        currentStep > step.number
                          ? 'bg-green-500 text-white'
                          : currentStep === step.number
                          ? 'bg-primary-600 text-white ring-4 ring-primary-100'
                          : 'bg-white border-2 border-gray-300 text-gray-400'
                      }`}
                    >
                      {currentStep > step.number ? <Check className="w-5 h-5" /> : step.number}
                    </div>
                    <span
                      className={`text-xs font-medium absolute top-12 whitespace-nowrap ${
                        currentStep >= step.number ? 'text-primary-600' : 'text-gray-400'
                      }`}
                    >
                      {step.name}
                    </span>
                  </div>

                  {/* Connector Line */}
                  {index < steps.length - 1 && (
                    <div
                      className={`flex-1 h-0.5 mx-2 rounded-full transition-all ${
                        currentStep > step.number ? 'bg-green-500' : 'bg-gray-200'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </header>

        {/* Form Content */}
        <div className="flex-1 p-8">
          <div className="max-w-4xl mx-auto pb-20">
            {/* Step 1: Basic Information */}
            {currentStep === 1 && (
              <div className="space-y-6">
                {/* Course Details Card */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                  <h2 className="text-lg font-semibold text-gray-900 mb-6">Course Details</h2>
                  <div className="space-y-6">
                    {/* Title */}
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium text-gray-900">
                        Course Title <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        className="w-full rounded-lg border-gray-300 bg-gray-50 text-base py-3 px-4 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 placeholder-gray-400 transition-all"
                        placeholder="e.g., Advanced React Patterns for Senior Developers"
                      />
                    </div>

                    {/* Short Description */}
                    <div className="flex flex-col gap-2">
                      <div className="flex justify-between">
                        <label className="text-sm font-medium text-gray-900">
                          Short Description
                        </label>
                        <span className="text-xs text-gray-500">
                          {formData.shortDescription.length}/200
                        </span>
                      </div>
                      <input
                        type="text"
                        name="shortDescription"
                        value={formData.shortDescription}
                        onChange={handleChange}
                        maxLength={200}
                        className="w-full rounded-lg border-gray-300 bg-gray-50 text-base py-3 px-4 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 placeholder-gray-400 transition-all"
                        placeholder="A brief summary of your course"
                      />
                    </div>

                    {/* Full Description */}
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium text-gray-900">
                        Full Description <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows="6"
                        className="w-full rounded-lg border-gray-300 bg-gray-50 text-base py-3 px-4 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 placeholder-gray-400 transition-all resize-none"
                        placeholder="Enter a detailed description of your course..."
                      />
                    </div>
                  </div>
                </div>

                {/* Categorization & Pricing Card */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                  <h2 className="text-lg font-semibold text-gray-900 mb-6">
                    Categorization & Pricing
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Category */}
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium text-gray-900">
                        Category <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        className="w-full rounded-lg border-gray-300 bg-gray-50 text-base py-3 px-4 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                      >
                        <option value="">Select a category</option>
                        {categories.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Level */}
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium text-gray-900">Level</label>
                      <select
                        name="level"
                        value={formData.level}
                        onChange={handleChange}
                        className="w-full rounded-lg border-gray-300 bg-gray-50 text-base py-3 px-4 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                      >
                        {levels.map((level) => (
                          <option key={level} value={level}>
                            {level}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Price */}
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium text-gray-900">Price ($)</label>
                      <input
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleChange}
                        min="0"
                        step="0.01"
                        className="w-full rounded-lg border-gray-300 bg-gray-50 text-base py-3 px-4 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                        placeholder="0.00"
                      />
                    </div>

                    {/* Language */}
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium text-gray-900">Language</label>
                      <input
                        type="text"
                        name="language"
                        value={formData.language}
                        onChange={handleChange}
                        className="w-full rounded-lg border-gray-300 bg-gray-50 text-base py-3 px-4 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                        placeholder="English"
                      />
                    </div>
                  </div>
                </div>

                {/* Requirements */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                  <h2 className="text-lg font-semibold text-gray-900 mb-2">Requirements</h2>
                  <p className="text-sm text-gray-500 mb-6">
                    What skills or knowledge should students have before taking this course?
                  </p>
                  <div className="space-y-3">
                    {formData.requirements.map((req, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={req}
                          onChange={(e) =>
                            handleArrayChange('requirements', index, e.target.value)
                          }
                          className="flex-1 rounded-lg border-gray-300 bg-gray-50 text-base py-3 px-4 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                          placeholder="e.g., Basic JavaScript knowledge"
                        />
                        {formData.requirements.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeArrayItem('requirements', index)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addArrayItem('requirements')}
                      className="flex items-center gap-2 text-sm font-medium text-primary-600 hover:text-primary-700"
                    >
                      <Plus className="w-4 h-4" />
                      Add Requirement
                    </button>
                  </div>
                </div>

                {/* What You'll Learn */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                  <h2 className="text-lg font-semibold text-gray-900 mb-2">
                    What You'll Learn
                  </h2>
                  <p className="text-sm text-gray-500 mb-6">
                    List the key learning outcomes for this course
                  </p>
                  <div className="space-y-3">
                    {formData.whatYouLearn.map((item, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={item}
                          onChange={(e) =>
                            handleArrayChange('whatYouLearn', index, e.target.value)
                          }
                          className="flex-1 rounded-lg border-gray-300 bg-gray-50 text-base py-3 px-4 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                          placeholder="e.g., Build scalable React applications"
                        />
                        {formData.whatYouLearn.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeArrayItem('whatYouLearn', index)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addArrayItem('whatYouLearn')}
                      className="flex items-center gap-2 text-sm font-medium text-primary-600 hover:text-primary-700"
                    >
                      <Plus className="w-4 h-4" />
                      Add Learning Outcome
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Media */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                  <h2 className="text-lg font-semibold text-gray-900 mb-2">Course Thumbnail</h2>
                  <p className="text-sm text-gray-500 mb-6">
                    Upload a course image (16:9 aspect ratio recommended, max 5MB)
                  </p>

                  {thumbnailPreview ? (
                    <div className="relative">
                      <img
                        src={thumbnailPreview}
                        alt="Thumbnail preview"
                        className="w-full max-w-md rounded-lg border border-gray-200"
                      />
                      <button
                        onClick={removeThumbnail}
                        className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full max-w-md h-64 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary-500 transition-colors bg-gray-50">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-12 h-12 text-gray-400 mb-3" />
                        <p className="mb-2 text-sm text-gray-600">
                          <span className="font-semibold">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-gray-500">PNG, JPG or WEBP (MAX. 5MB)</p>
                      </div>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleThumbnailChange}
                      />
                    </label>
                  )}

                  <p className="text-sm text-gray-500 mt-4">
                    You can skip this step and add a thumbnail later.
                  </p>
                </div>
              </div>
            )}

            {/* Step 3: Review & Publish */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                  <h2 className="text-lg font-semibold text-gray-900 mb-6">Review Your Course</h2>
                  <div className="space-y-6">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Course Title</label>
                      <p className="text-gray-900 mt-1">{formData.title}</p>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-500">Description</label>
                      <p className="text-gray-900 mt-1 whitespace-pre-line">
                        {formData.description}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="text-sm font-medium text-gray-500">Category</label>
                        <p className="text-gray-900 mt-1">{formData.category}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Level</label>
                        <p className="text-gray-900 mt-1">{formData.level}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Price</label>
                        <p className="text-gray-900 mt-1">
                          ${parseFloat(formData.price).toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Language</label>
                        <p className="text-gray-900 mt-1">{formData.language}</p>
                      </div>
                    </div>

                    {formData.whatYouLearn.filter((w) => w.trim()).length > 0 && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          What You'll Learn
                        </label>
                        <ul className="list-disc list-inside mt-2 space-y-1">
                          {formData.whatYouLearn
                            .filter((w) => w.trim())
                            .map((item, index) => (
                              <li key={index} className="text-gray-900">
                                {item}
                              </li>
                            ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                  <p className="text-sm text-blue-900">
                    <strong>Note:</strong> Your course will be created as a draft. You can add
                    curriculum (sections and lectures) after creation, then publish when ready.
                  </p>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
              <button
                onClick={prevStep}
                disabled={currentStep === 1}
                className="flex items-center gap-2 px-6 py-3 text-sm font-medium text-gray-700 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Previous
              </button>

              {currentStep < 3 ? (
                <button
                  onClick={nextStep}
                  className="flex items-center gap-2 px-6 py-3 text-sm font-medium bg-primary-600 hover:bg-primary-700 text-white rounded-lg shadow-sm transition-all"
                >
                  Next
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-6 py-3 text-sm font-medium bg-green-600 hover:bg-green-700 text-white rounded-lg shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>Creating Course...</>
                  ) : (
                    <>
                      <Rocket className="w-4 h-4" />
                      Create Course
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CreateCourse;
