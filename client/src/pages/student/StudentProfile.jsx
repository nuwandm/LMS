import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { User, Mail, Shield, Calendar, Camera, Eye, EyeOff, Save, Lock, CheckCircle2, Loader2 } from 'lucide-react';
import Navbar from '../../components/common/Navbar';
import { updateProfile, changePassword, uploadAvatar } from '../../services/authService';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

const StudentProfile = () => {
  const { user, updateUser } = useAuthStore();
  const [showCurrentPwd, setShowCurrentPwd] = useState(false);
  const [showNewPwd, setShowNewPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const fileInputRef = useRef(null);

  const { register: regProfile, handleSubmit: handleProfileSubmit, formState: { errors: profileErrors, isDirty: profileDirty } } = useForm({
    defaultValues: { name: user?.name || '', bio: user?.bio || '' },
  });

  const { register: regPwd, handleSubmit: handlePwdSubmit, reset: resetPwd, watch, formState: { errors: pwdErrors } } = useForm();
  const newPassword = watch('newPassword');

  const onSaveProfile = async (data) => {
    try {
      setIsSavingProfile(true);
      const response = await updateProfile({ name: data.name, bio: data.bio });
      if (response.success) { updateUser(response.data); toast.success('Profile updated successfully'); }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally { setIsSavingProfile(false); }
  };

  const onChangePassword = async (data) => {
    try {
      setIsSavingPassword(true);
      const response = await changePassword(data.currentPassword, data.newPassword);
      if (response.success) { toast.success('Password changed successfully'); resetPwd(); }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to change password');
    } finally { setIsSavingPassword(false); }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast.error('Please select an image file'); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error('Image must be smaller than 5MB'); return; }
    setAvatarPreview(URL.createObjectURL(file));
    try {
      setIsUploadingAvatar(true);
      const response = await uploadAvatar(file);
      if (response.success) { updateUser(response.data.user); toast.success('Profile picture updated'); }
    } catch (error) {
      setAvatarPreview(null);
      toast.error(error.response?.data?.message || 'Failed to upload photo');
    } finally { setIsUploadingAvatar(false); e.target.value = ''; }
  };

  const joinedDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : 'N/A';
  const avatarLetter = user?.name?.charAt(0)?.toUpperCase() || 'S';

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-5xl mx-auto px-6 lg:px-8 py-8">
        <div className="mb-7">
          <h1 className="text-2xl font-bold">My Profile</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your personal information and account security</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Identity */}
          <div className="lg:col-span-1 space-y-4">
            <Card>
              <CardContent className="pt-6 flex flex-col items-center text-center">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
                <div className="relative mb-4">
                  <Avatar className="h-24 w-24 border-4 border-background shadow-md">
                    {isUploadingAvatar ? (
                      <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center z-10">
                        <Loader2 className="w-6 h-6 text-white animate-spin" />
                      </div>
                    ) : null}
                    <AvatarImage src={avatarPreview || user?.avatar} alt={user?.name} />
                    <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-bold">
                      {avatarLetter}
                    </AvatarFallback>
                  </Avatar>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingAvatar}
                    className="absolute bottom-0 right-0 w-7 h-7 bg-background border border-border rounded-full flex items-center justify-center shadow-sm hover:bg-muted transition-colors disabled:opacity-50"
                  >
                    <Camera className="w-3.5 h-3.5 text-muted-foreground" />
                  </button>
                </div>
                <h2 className="text-lg font-bold">{user?.name}</h2>
                <Badge variant="secondary" className="mt-2 gap-1">
                  <Shield className="w-3 h-3" />Student
                </Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Account Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-0">
                {[
                  { icon: Mail, label: 'Email', value: user?.email },
                  { icon: User, label: 'Role', value: user?.role, capitalize: true },
                  { icon: Calendar, label: 'Member Since', value: joinedDate },
                  { icon: CheckCircle2, label: 'Status', value: 'Active', color: 'text-emerald-600' },
                ].map(({ icon: Icon, label, value, capitalize, color }) => (
                  <div key={label} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                      <Icon className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground">{label}</p>
                      <p className={`text-sm font-semibold truncate ${capitalize ? 'capitalize' : ''} ${color || ''}`}>
                        {value}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Right: Forms */}
          <div className="lg:col-span-2 space-y-5">
            <Card>
              <CardHeader className="border-b">
                <CardTitle className="flex items-center gap-2 text-base">
                  <User className="w-4 h-4" />Edit Profile
                </CardTitle>
                <CardDescription>Update your display name and bio</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <form onSubmit={handleProfileSubmit(onSaveProfile)} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name <span className="text-destructive">*</span></Label>
                    <Input
                      id="name"
                      type="text"
                      {...regProfile('name', { required: 'Name is required', minLength: { value: 2, message: 'Name must be at least 2 characters' } })}
                      placeholder="Your full name"
                      className={profileErrors.name ? 'border-destructive' : ''}
                    />
                    {profileErrors.name && <p className="text-xs text-destructive">{profileErrors.name.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label>Email Address</Label>
                    <div className="relative">
                      <Input type="email" value={user?.email || ''} readOnly className="bg-muted cursor-not-allowed pr-20" />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">Read-only</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Contact support to change your email</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio <span className="text-xs text-muted-foreground font-normal">(optional)</span></Label>
                    <Textarea
                      id="bio"
                      {...regProfile('bio', { maxLength: { value: 300, message: 'Bio must be under 300 characters' } })}
                      rows={3}
                      placeholder="Tell us a bit about yourself..."
                      className={profileErrors.bio ? 'border-destructive' : ''}
                    />
                    {profileErrors.bio && <p className="text-xs text-destructive">{profileErrors.bio.message}</p>}
                  </div>

                  <div className="flex justify-end">
                    <Button type="submit" disabled={isSavingProfile || !profileDirty} className="gap-2">
                      <Save className="w-4 h-4" />
                      {isSavingProfile ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="border-b">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Lock className="w-4 h-4" />Change Password
                </CardTitle>
                <CardDescription>Use a strong password with at least 6 characters</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <form onSubmit={handlePwdSubmit(onChangePassword)} className="space-y-5">
                  {[
                    { id: 'currentPassword', label: 'Current Password', show: showCurrentPwd, toggle: () => setShowCurrentPwd((v) => !v), rules: { required: 'Current password is required' }, error: pwdErrors.currentPassword },
                    { id: 'newPassword', label: 'New Password', show: showNewPwd, toggle: () => setShowNewPwd((v) => !v), rules: { required: 'New password is required', minLength: { value: 6, message: 'At least 6 characters' } }, error: pwdErrors.newPassword },
                    { id: 'confirmPassword', label: 'Confirm New Password', show: showConfirmPwd, toggle: () => setShowConfirmPwd((v) => !v), rules: { required: 'Please confirm your password', validate: (v) => v === newPassword || 'Passwords do not match' }, error: pwdErrors.confirmPassword },
                  ].map(({ id, label, show, toggle, rules, error }) => (
                    <div key={id} className="space-y-2">
                      <Label htmlFor={id}>{label} <span className="text-destructive">*</span></Label>
                      <div className="relative">
                        <Input
                          id={id}
                          type={show ? 'text' : 'password'}
                          {...regPwd(id, rules)}
                          placeholder={`Enter ${label.toLowerCase()}`}
                          className={`pr-10 ${error ? 'border-destructive' : ''}`}
                        />
                        <button type="button" onClick={toggle} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {error && <p className="text-xs text-destructive">{error.message}</p>}
                    </div>
                  ))}

                  <div className="flex justify-end">
                    <Button type="submit" variant="secondary" disabled={isSavingPassword} className="gap-2">
                      <Lock className="w-4 h-4" />
                      {isSavingPassword ? 'Updating...' : 'Update Password'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default StudentProfile;
