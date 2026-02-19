import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Eye, EyeOff, School, BookOpen, GraduationCap, Check } from 'lucide-react';
import { register as registerUser } from '../../services/authService';
import useAuthStore from '../../store/authStore';

const Register = () => {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState('student');

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      role: 'student',
    },
  });

  const password = watch('password', '');

  // Password strength calculator
  const getPasswordStrength = (pwd) => {
    if (!pwd) return { strength: 0, label: '', color: '' };

    let strength = 0;
    if (pwd.length >= 6) strength++;
    if (pwd.length >= 10) strength++;
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) strength++;
    if (/\d/.test(pwd)) strength++;
    if (/[^a-zA-Z\d]/.test(pwd)) strength++;

    if (strength <= 2) return { strength, label: 'Weak', color: 'bg-red-500' };
    if (strength === 3) return { strength, label: 'Fair', color: 'bg-orange-500' };
    if (strength === 4) return { strength, label: 'Good', color: 'bg-yellow-500' };
    return { strength, label: 'Strong', color: 'bg-green-500' };
  };

  const passwordStrength = getPasswordStrength(password);

  const onSubmit = async (data) => {
    try {
      setIsLoading(true);
      const response = await registerUser({
        name: data.name,
        email: data.email,
        password: data.password,
        role: selectedRole,
      });

      if (response.success) {
        const { user, token } = response.data;
        setAuth(user, token);

        toast.success(`Welcome to LearnHub, ${user.name}!`);

        // Redirect based on role
        if (user.role === 'instructor') {
          navigate('/instructor/dashboard');
        } else {
          navigate('/');
        }
      }
    } catch (error) {
      console.error('Registration error:', error);
      const message = error.response?.data?.message || 'Registration failed. Please try again.';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 w-full max-w-[500px] rounded-xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="px-8 pt-8 pb-4 text-center">
          {/* Logo */}
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center text-white">
              <School className="w-6 h-6" />
            </div>
            <span className="text-primary-600 dark:text-white text-xl font-black tracking-tight">
              LearnHub
            </span>
          </div>
          <h1 className="text-gray-900 dark:text-white text-3xl font-black leading-tight mb-2">
            Create your account
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm font-normal">
            Join thousands of learners and instructors today
          </p>
        </div>

        {/* Form */}
        <div className="px-8 pb-8">
          {/* Role Selector */}
          <div className="flex gap-3 w-full mb-6">
            {/* Learn Option */}
            <label className="flex-1 cursor-pointer group">
              <input
                type="radio"
                name="role"
                value="student"
                checked={selectedRole === 'student'}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="hidden"
              />
              <div
                className={`border-2 rounded-lg p-4 flex flex-col items-center justify-center text-center transition-all duration-200 h-full relative ${
                  selectedRole === 'student'
                    ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 hover:border-primary-300'
                }`}
              >
                {selectedRole === 'student' && (
                  <div className="absolute top-2 right-2">
                    <Check className="w-5 h-5 text-primary-600" />
                  </div>
                )}
                <BookOpen className={`w-8 h-8 mb-2 ${selectedRole === 'student' ? 'text-primary-600' : 'text-gray-500'}`} />
                <p className="text-gray-900 dark:text-white text-sm font-bold">
                  I want to Learn
                </p>
                <p className="text-gray-500 dark:text-gray-300 text-xs mt-1">
                  Access courses
                </p>
              </div>
            </label>

            {/* Teach Option */}
            <label className="flex-1 cursor-pointer group">
              <input
                type="radio"
                name="role"
                value="instructor"
                checked={selectedRole === 'instructor'}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="hidden"
              />
              <div
                className={`border-2 rounded-lg p-4 flex flex-col items-center justify-center text-center transition-all duration-200 h-full relative ${
                  selectedRole === 'instructor'
                    ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 hover:border-primary-300'
                }`}
              >
                {selectedRole === 'instructor' && (
                  <div className="absolute top-2 right-2">
                    <Check className="w-5 h-5 text-primary-600" />
                  </div>
                )}
                <GraduationCap className={`w-8 h-8 mb-2 ${selectedRole === 'instructor' ? 'text-primary-600' : 'text-gray-500'}`} />
                <p className="text-gray-900 dark:text-white text-sm font-bold">
                  I want to Teach
                </p>
                <p className="text-gray-500 dark:text-gray-300 text-xs mt-1">
                  Create courses
                </p>
              </div>
            </label>
          </div>

          {/* Registration Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            {/* Name Input */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="name"
                className="text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Full Name
              </label>
              <input
                {...register('name', {
                  required: 'Name is required',
                  minLength: {
                    value: 2,
                    message: 'Name must be at least 2 characters',
                  },
                })}
                id="name"
                type="text"
                placeholder="Enter your full name"
                className={`w-full px-4 py-3 rounded-lg border ${
                  errors.name
                    ? 'border-red-500'
                    : 'border-gray-200 dark:border-gray-600'
                } bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 placeholder:text-gray-400 text-sm transition-all`}
              />
              {errors.name && (
                <p className="text-red-500 text-xs font-medium">
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Email Input */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="email"
                className="text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Email Address
              </label>
              <input
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address',
                  },
                })}
                id="email"
                type="email"
                placeholder="Enter your email"
                className={`w-full px-4 py-3 rounded-lg border ${
                  errors.email
                    ? 'border-red-500'
                    : 'border-gray-200 dark:border-gray-600'
                } bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 placeholder:text-gray-400 text-sm transition-all`}
              />
              {errors.email && (
                <p className="text-red-500 text-xs font-medium">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password Input */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="password"
                className="text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Password
              </label>
              <div className="relative">
                <input
                  {...register('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters',
                    },
                  })}
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create a strong password"
                  className={`w-full px-4 py-3 rounded-lg border ${
                    errors.password
                      ? 'border-red-500'
                      : 'border-gray-200 dark:border-gray-600'
                  } bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 placeholder:text-gray-400 text-sm transition-all pr-10`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-xs font-medium">
                  {errors.password.message}
                </p>
              )}
              {/* Password Strength Indicator */}
              {password && (
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${passwordStrength.color} transition-all duration-300`}
                      style={{ width: `${(passwordStrength.strength / 5) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    {passwordStrength.label}
                  </span>
                </div>
              )}
            </div>

            {/* Terms Checkbox */}
            <label className="flex items-start gap-2 cursor-pointer group">
              <input
                {...register('terms', {
                  required: 'You must accept the terms and conditions',
                })}
                type="checkbox"
                className="mt-0.5 w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500/20 cursor-pointer"
              />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                I agree to the{' '}
                <Link to="/terms" className="text-primary-600 hover:text-primary-700 font-medium">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link to="/privacy" className="text-primary-600 hover:text-primary-700 font-medium">
                  Privacy Policy
                </Link>
              </span>
            </label>
            {errors.terms && (
              <p className="text-red-500 text-xs font-medium -mt-2">
                {errors.terms.message}
              </p>
            )}

            {/* Create Account Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white font-medium py-3 px-4 rounded-lg transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Creating account...' : 'Create Account'}
            </button>

            {/* Divider */}
            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-gray-200 dark:border-gray-600"></div>
              <span className="flex-shrink-0 mx-4 text-xs font-medium text-gray-400 uppercase tracking-wider">
                OR
              </span>
              <div className="flex-grow border-t border-gray-200 dark:border-gray-600"></div>
            </div>

            {/* Google Sign Up */}
            <button
              type="button"
              className="w-full bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-white font-medium py-3 px-4 rounded-lg transition-all flex items-center justify-center gap-3"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Continue with Google
            </button>
          </form>

          {/* Sign In Link */}
          <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-6">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-medium text-primary-600 hover:text-primary-700 transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
