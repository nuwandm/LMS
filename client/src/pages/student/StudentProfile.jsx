import { useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  User, Mail, Shield, Calendar, Camera,
  Eye, EyeOff, Save, Lock, CheckCircle2,
} from 'lucide-react';
import Navbar from '../../components/common/Navbar';
import { updateProfile, changePassword } from '../../services/authService';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';

const StudentProfile = () => {
  const { user, updateUser } = useAuthStore();
  const [showCurrentPwd, setShowCurrentPwd] = useState(false);
  const [showNewPwd, setShowNewPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  // Profile form
  const {
    register: regProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors, isDirty: profileDirty },
  } = useForm({
    defaultValues: {
      name: user?.name || '',
      bio: user?.bio || '',
    },
  });

  // Password form
  const {
    register: regPwd,
    handleSubmit: handlePwdSubmit,
    reset: resetPwd,
    watch,
    formState: { errors: pwdErrors },
  } = useForm();

  const newPassword = watch('newPassword');

  const onSaveProfile = async (data) => {
    try {
      setIsSavingProfile(true);
      const response = await updateProfile({ name: data.name, bio: data.bio });
      if (response.success) {
        updateUser(response.data);
        toast.success('Profile updated successfully');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const onChangePassword = async (data) => {
    try {
      setIsSavingPassword(true);
      const response = await changePassword(data.currentPassword, data.newPassword);
      if (response.success) {
        toast.success('Password changed successfully');
        resetPwd();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to change password');
    } finally {
      setIsSavingPassword(false);
    }
  };

  const joinedDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
      })
    : 'N/A';

  const avatarLetter = user?.name?.charAt(0)?.toUpperCase() || 'S';

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-5xl mx-auto px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-7">
          <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your personal information and account security</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── Left: Identity Card ── */}
          <div className="lg:col-span-1 space-y-4">
            {/* Avatar Card */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 flex flex-col items-center text-center">
              <div className="relative mb-4">
                <div className="w-24 h-24 rounded-full bg-primary-600 flex items-center justify-center overflow-hidden border-4 border-primary-100 shadow-md">
                  {user?.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-white text-3xl font-bold">{avatarLetter}</span>
                  )}
                </div>
                <button
                  className="absolute bottom-0 right-0 w-7 h-7 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-sm hover:bg-gray-50 transition-colors"
                  title="Change photo (coming soon)"
                >
                  <Camera className="w-3.5 h-3.5 text-gray-600" />
                </button>
              </div>

              <h2 className="text-lg font-bold text-gray-900">{user?.name}</h2>
              <span className="mt-1 inline-flex items-center gap-1 bg-primary-50 text-primary-700 text-xs font-semibold px-2.5 py-1 rounded-full border border-primary-100">
                <Shield className="w-3 h-3" />
                Student
              </span>
            </div>

            {/* Info Card */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-4">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Account Info
              </h3>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                  <Mail className="w-4 h-4 text-gray-500" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-gray-400 font-medium">Email</p>
                  <p className="text-sm font-semibold text-gray-900 truncate">{user?.email}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-gray-500" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-medium">Role</p>
                  <p className="text-sm font-semibold text-gray-900 capitalize">{user?.role}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-4 h-4 text-gray-500" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-medium">Member Since</p>
                  <p className="text-sm font-semibold text-gray-900">{joinedDate}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-4 h-4 text-gray-500" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-medium">Account Status</p>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-700">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                    Active
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ── Right: Forms ── */}
          <div className="lg:col-span-2 space-y-5">

            {/* Edit Profile Form */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="px-6 py-4 border-b border-gray-100">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <User className="w-4 h-4 text-primary-600" />
                  Edit Profile
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">Update your display name and bio</p>
              </div>

              <form onSubmit={handleProfileSubmit(onSaveProfile)} className="p-6 space-y-5">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    {...regProfile('name', {
                      required: 'Name is required',
                      minLength: { value: 2, message: 'Name must be at least 2 characters' },
                    })}
                    className={`w-full px-3.5 py-2.5 rounded-lg border text-sm text-gray-900 bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 ${
                      profileErrors.name ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="Your full name"
                  />
                  {profileErrors.name && (
                    <p className="mt-1.5 text-xs text-red-600">{profileErrors.name.message}</p>
                  )}
                </div>

                {/* Email (read-only) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={user?.email || ''}
                      readOnly
                      className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-500 bg-gray-50 cursor-not-allowed"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-medium">
                      Read-only
                    </span>
                  </div>
                  <p className="mt-1.5 text-xs text-gray-400">Contact support to change your email</p>
                </div>

                {/* Bio */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Bio
                    <span className="ml-1 text-xs text-gray-400 font-normal">(optional)</span>
                  </label>
                  <textarea
                    {...regProfile('bio', {
                      maxLength: { value: 300, message: 'Bio must be under 300 characters' },
                    })}
                    rows={3}
                    className={`w-full px-3.5 py-2.5 rounded-lg border text-sm text-gray-900 bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 resize-none ${
                      profileErrors.bio ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="Tell us a bit about yourself..."
                  />
                  {profileErrors.bio && (
                    <p className="mt-1.5 text-xs text-red-600">{profileErrors.bio.message}</p>
                  )}
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="submit"
                    disabled={isSavingProfile || !profileDirty}
                    className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    {isSavingProfile ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>

            {/* Change Password Form */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="px-6 py-4 border-b border-gray-100">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-primary-600" />
                  Change Password
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">Use a strong password with at least 6 characters</p>
              </div>

              <form onSubmit={handlePwdSubmit(onChangePassword)} className="p-6 space-y-5">
                {/* Current Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Current Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPwd ? 'text' : 'password'}
                      {...regPwd('currentPassword', { required: 'Current password is required' })}
                      className={`w-full px-3.5 py-2.5 pr-10 rounded-lg border text-sm text-gray-900 bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 ${
                        pwdErrors.currentPassword ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="Enter current password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPwd((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showCurrentPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {pwdErrors.currentPassword && (
                    <p className="mt-1.5 text-xs text-red-600">{pwdErrors.currentPassword.message}</p>
                  )}
                </div>

                {/* New Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    New Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPwd ? 'text' : 'password'}
                      {...regPwd('newPassword', {
                        required: 'New password is required',
                        minLength: { value: 6, message: 'Password must be at least 6 characters' },
                      })}
                      className={`w-full px-3.5 py-2.5 pr-10 rounded-lg border text-sm text-gray-900 bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 ${
                        pwdErrors.newPassword ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="Enter new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPwd((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showNewPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {pwdErrors.newPassword && (
                    <p className="mt-1.5 text-xs text-red-600">{pwdErrors.newPassword.message}</p>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Confirm New Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPwd ? 'text' : 'password'}
                      {...regPwd('confirmPassword', {
                        required: 'Please confirm your new password',
                        validate: (value) => value === newPassword || 'Passwords do not match',
                      })}
                      className={`w-full px-3.5 py-2.5 pr-10 rounded-lg border text-sm text-gray-900 bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 ${
                        pwdErrors.confirmPassword ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="Confirm new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPwd((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {pwdErrors.confirmPassword && (
                    <p className="mt-1.5 text-xs text-red-600">{pwdErrors.confirmPassword.message}</p>
                  )}
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="submit"
                    disabled={isSavingPassword}
                    className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors"
                  >
                    <Lock className="w-4 h-4" />
                    {isSavingPassword ? 'Updating...' : 'Update Password'}
                  </button>
                </div>
              </form>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
};

export default StudentProfile;
