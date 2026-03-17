import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, ArrowRight, Check, Upload, X, Plus,
  FileText, Image as ImageIcon, Rocket,
} from 'lucide-react';
import { createCourse, uploadCourseThumbnail } from '../../services/courseService';
import toast from 'react-hot-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

const categories = [
  'Web Development', 'Mobile Development', 'Data Science', 'Design',
  'Business', 'Marketing', 'Photography', 'Music', 'Other',
];
const levels = ['Beginner', 'Intermediate', 'Advanced'];

const steps = [
  { number: 1, name: 'Basic Info', icon: FileText },
  { number: 2, name: 'Media', icon: ImageIcon },
  { number: 3, name: 'Publish', icon: Rocket },
];

const CreateCourse = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: '', shortDescription: '', description: '',
    category: '', level: 'Beginner', price: 0,
    language: 'English', requirements: [''], whatYouLearn: [''],
  });

  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [errors, setErrors] = useState({ title: '', description: '', category: '' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleArrayChange = (field, index, value) => {
    setFormData((prev) => ({ ...prev, [field]: prev[field].map((item, i) => (i === index ? value : item)) }));
  };

  const addArrayItem = (field) => setFormData((prev) => ({ ...prev, [field]: [...prev[field], ''] }));
  const removeArrayItem = (field, index) => setFormData((prev) => ({ ...prev, [field]: prev[field].filter((_, i) => i !== index) }));

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { toast.error('Image size should be less than 5MB'); return; }
      setThumbnailFile(file);
      setThumbnailPreview(URL.createObjectURL(file));
    }
  };

  const validateStep = (step) => {
    if (step !== 1) return true;
    const newErrors = { title: '', description: '', category: '' };
    let isValid = true;
    if (!formData.title.trim()) { newErrors.title = 'Course title is required'; isValid = false; }
    else if (formData.title.trim().length < 5) { newErrors.title = 'Title must be at least 5 characters'; isValid = false; }
    if (!formData.description.trim()) { newErrors.description = 'Course description is required'; isValid = false; }
    else if (formData.description.trim().length < 20) { newErrors.description = 'Description must be at least 20 characters'; isValid = false; }
    if (!formData.category) { newErrors.category = 'Please select a category'; isValid = false; }
    setErrors(newErrors);
    if (!isValid) toast.error('Please fix the errors before continuing');
    return isValid;
  };

  const nextStep = () => { if (validateStep(currentStep)) setCurrentStep((prev) => Math.min(prev + 1, 3)); };
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  const handleSubmit = async () => {
    if (!validateStep(1)) return;
    try {
      setIsSubmitting(true);
      const cleanedData = {
        ...formData,
        requirements: formData.requirements.filter((r) => r.trim() !== ''),
        whatYouLearn: formData.whatYouLearn.filter((w) => w.trim() !== ''),
        price: parseFloat(formData.price) || 0,
      };
      const response = await createCourse(cleanedData);
      if (response.success) {
        const courseId = response.data.course?._id || response.data._id;
        if (thumbnailFile && courseId) {
          try { await uploadCourseThumbnail(courseId, thumbnailFile); toast.success('Course created! Now add your curriculum.'); }
          catch { toast.success('Course created! Thumbnail failed — add it later.'); }
        } else {
          toast.success('Course created! Now add your curriculum.');
        }
        setTimeout(() => navigate(courseId ? `/instructor/courses/${courseId}/curriculum` : '/instructor/courses'), 1500);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create course');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Sticky Header */}
      <header className="bg-background border-b px-8 py-6 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Create New Course</h1>
              <p className="text-sm text-muted-foreground">Step {currentStep} of {steps.length} • {steps[currentStep - 1].name}</p>
            </div>
            <Button variant="ghost" onClick={() => navigate('/instructor/dashboard')}>Cancel</Button>
          </div>

          {/* Stepper */}
          <div className="flex items-center w-full max-w-2xl mx-auto">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center flex-1">
                <div className="flex flex-col items-center gap-2 relative z-10">
                  <div className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all',
                    currentStep > step.number ? 'bg-emerald-500 text-white'
                      : currentStep === step.number ? 'bg-primary text-primary-foreground ring-4 ring-primary/20'
                      : 'bg-background border-2 border-border text-muted-foreground'
                  )}>
                    {currentStep > step.number ? <Check className="w-5 h-5" /> : step.number}
                  </div>
                  <span className={cn(
                    'text-xs font-medium absolute top-12 whitespace-nowrap',
                    currentStep >= step.number ? 'text-foreground' : 'text-muted-foreground'
                  )}>
                    {step.name}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className={cn('flex-1 h-0.5 mx-2 rounded-full transition-all', currentStep > step.number ? 'bg-emerald-500' : 'bg-border')} />
                )}
              </div>
            ))}
          </div>
        </div>
      </header>

      <div className="p-8">
        <div className="max-w-4xl mx-auto pb-20">

          {/* Step 1 */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <Card>
                <CardHeader><CardTitle className="text-base">Course Details</CardTitle></CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="title">Course Title <span className="text-destructive">*</span></Label>
                      <span className={cn('text-xs', formData.title.length < 5 ? 'text-destructive' : 'text-muted-foreground')}>{formData.title.length}/5 min</span>
                    </div>
                    <Input id="title" name="title" value={formData.title} onChange={handleChange} placeholder="e.g., Advanced React Patterns for Senior Developers" className={errors.title ? 'border-destructive' : ''} />
                    {errors.title && <p className="text-xs text-destructive">{errors.title}</p>}
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label htmlFor="shortDescription">Short Description</Label>
                      <span className="text-xs text-muted-foreground">{formData.shortDescription.length}/200</span>
                    </div>
                    <Input id="shortDescription" name="shortDescription" value={formData.shortDescription} onChange={handleChange} maxLength={200} placeholder="A brief summary of your course" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="description">Full Description <span className="text-destructive">*</span></Label>
                      <span className={cn('text-xs', formData.description.length < 20 ? 'text-destructive' : 'text-muted-foreground')}>{formData.description.length}/20 min</span>
                    </div>
                    <Textarea id="description" name="description" value={formData.description} onChange={handleChange} rows={6} placeholder="Enter a detailed description of your course..." className={errors.description ? 'border-destructive' : ''} />
                    {errors.description && <p className="text-xs text-destructive">{errors.description}</p>}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="text-base">Categorization & Pricing</CardTitle></CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="category">Category <span className="text-destructive">*</span></Label>
                      <select
                        id="category" name="category" value={formData.category} onChange={handleChange}
                        className={cn('w-full rounded-md border px-3 py-2 text-sm focus:ring-2 focus:ring-ring focus:outline-none bg-background', errors.category ? 'border-destructive' : 'border-input')}
                      >
                        <option value="">Select a category</option>
                        {categories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
                      </select>
                      {errors.category && <p className="text-xs text-destructive">{errors.category}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="level">Level</Label>
                      <select id="level" name="level" value={formData.level} onChange={handleChange} className="w-full rounded-md border border-input px-3 py-2 text-sm focus:ring-2 focus:ring-ring focus:outline-none bg-background">
                        {levels.map((l) => <option key={l} value={l}>{l}</option>)}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="price">Price ($)</Label>
                      <Input id="price" type="number" name="price" value={formData.price} onChange={handleChange} min="0" step="0.01" placeholder="0.00" />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="language">Language</Label>
                      <Input id="language" type="text" name="language" value={formData.language} onChange={handleChange} placeholder="English" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Requirements</CardTitle>
                  <CardDescription>What skills should students have before taking this course?</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {formData.requirements.map((req, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input value={req} onChange={(e) => handleArrayChange('requirements', index, e.target.value)} placeholder="e.g., Basic JavaScript knowledge" />
                      {formData.requirements.length > 1 && (
                        <Button type="button" variant="ghost" size="icon" onClick={() => removeArrayItem('requirements', index)} className="text-destructive hover:text-destructive flex-shrink-0">
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button type="button" variant="ghost" size="sm" onClick={() => addArrayItem('requirements')} className="gap-2">
                    <Plus className="w-4 h-4" />Add Requirement
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">What You'll Learn</CardTitle>
                  <CardDescription>List the key learning outcomes for this course</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {formData.whatYouLearn.map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input value={item} onChange={(e) => handleArrayChange('whatYouLearn', index, e.target.value)} placeholder="e.g., Build scalable React applications" />
                      {formData.whatYouLearn.length > 1 && (
                        <Button type="button" variant="ghost" size="icon" onClick={() => removeArrayItem('whatYouLearn', index)} className="text-destructive hover:text-destructive flex-shrink-0">
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button type="button" variant="ghost" size="sm" onClick={() => addArrayItem('whatYouLearn')} className="gap-2">
                    <Plus className="w-4 h-4" />Add Learning Outcome
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Step 2 */}
          {currentStep === 2 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Course Thumbnail</CardTitle>
                <CardDescription>Upload a course image (16:9 aspect ratio recommended, max 5MB)</CardDescription>
              </CardHeader>
              <CardContent>
                {thumbnailPreview ? (
                  <div className="relative inline-block">
                    <img src={thumbnailPreview} alt="Preview" className="w-full max-w-md rounded-lg border" />
                    <Button variant="destructive" size="icon" onClick={() => { setThumbnailFile(null); setThumbnailPreview(null); }} className="absolute top-2 right-2 w-7 h-7">
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full max-w-md h-64 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary transition-colors bg-muted/50">
                    <Upload className="w-12 h-12 text-muted-foreground mb-3" />
                    <p className="mb-1 text-sm"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                    <p className="text-xs text-muted-foreground">PNG, JPG or WEBP (MAX. 5MB)</p>
                    <input type="file" className="hidden" accept="image/*" onChange={handleThumbnailChange} />
                  </label>
                )}
                <p className="text-sm text-muted-foreground mt-4">You can skip this step and add a thumbnail later.</p>
              </CardContent>
            </Card>
          )}

          {/* Step 3 */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <Card>
                <CardHeader><CardTitle className="text-base">Review Your Course</CardTitle></CardHeader>
                <CardContent className="space-y-5">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Course Title</p>
                    <p className="mt-1">{formData.title}</p>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Description</p>
                    <p className="mt-1 text-sm whitespace-pre-line">{formData.description}</p>
                  </div>
                  <Separator />
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { label: 'Category', value: formData.category },
                      { label: 'Level', value: formData.level },
                      { label: 'Price', value: `$${parseFloat(formData.price).toFixed(2)}` },
                      { label: 'Language', value: formData.language },
                    ].map(({ label, value }) => (
                      <div key={label}>
                        <p className="text-sm font-medium text-muted-foreground">{label}</p>
                        <p className="mt-1 text-sm">{value}</p>
                      </div>
                    ))}
                  </div>
                  {formData.whatYouLearn.filter((w) => w.trim()).length > 0 && (
                    <>
                      <Separator />
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">What You'll Learn</p>
                        <ul className="list-disc list-inside mt-2 space-y-1">
                          {formData.whatYouLearn.filter((w) => w.trim()).map((item, index) => (
                            <li key={index} className="text-sm">{item}</li>
                          ))}
                        </ul>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-900">
                  <strong>Note:</strong> Your course will be created as a draft. Add curriculum after creation, then publish when ready.
                </p>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t">
            <Button variant="ghost" onClick={prevStep} disabled={currentStep === 1} className="gap-2">
              <ArrowLeft className="w-4 h-4" />Previous
            </Button>
            {currentStep < 3 ? (
              <Button onClick={nextStep} className="gap-2">
                Next<ArrowRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={isSubmitting} className="gap-2 bg-emerald-600 hover:bg-emerald-700">
                <Rocket className="w-4 h-4" />
                {isSubmitting ? 'Creating Course...' : 'Create Course'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateCourse;
