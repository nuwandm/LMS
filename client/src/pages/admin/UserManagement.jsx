import { useState, useEffect } from 'react';
import {
  Search, Shield, GraduationCap, Users as UsersIcon,
  Edit2, Ban, CheckCircle, XCircle, Loader2,
} from 'lucide-react';
import { getAllUsers, updateUserRole, toggleUserStatus } from '../../services/adminService';
import EmptyState from '../../components/common/EmptyState';
import toast from 'react-hot-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const ROLE_VARIANT = { admin: 'destructive', instructor: 'default', student: 'secondary' };
const ROLE_META = {
  student: { icon: UsersIcon, desc: 'Can enroll in courses' },
  instructor: { icon: GraduationCap, desc: 'Can create and manage courses' },
  admin: { icon: Shield, desc: 'Full platform access' },
};

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showDrawer, setShowDrawer] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editRole, setEditRole] = useState('');
  const [processing, setProcessing] = useState(false);
  const [toggleStatusId, setToggleStatusId] = useState(null);

  useEffect(() => { fetchUsers(); }, [currentPage, searchTerm, roleFilter, statusFilter]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        limit: 20,
        role: roleFilter !== 'all' ? roleFilter : undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        search: searchTerm || undefined,
      };
      const data = await getAllUsers(params);
      setUsers(data.data.users || []);
      setTotalPages(data.data.pagination?.totalPages || 1);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const openDrawer = (user) => { setSelectedUser(user); setEditRole(user.role); setShowDrawer(true); };
  const closeDrawer = () => { setShowDrawer(false); setSelectedUser(null); setEditRole(''); };

  const handleUpdateRole = async () => {
    if (!editRole || editRole === selectedUser.role) { toast.error('Please select a different role'); return; }
    try {
      setProcessing(true);
      await updateUserRole(selectedUser._id, editRole);
      toast.success('User role updated successfully');
      closeDrawer();
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update user role');
    } finally {
      setProcessing(false);
    }
  };

  const handleToggleStatus = async (userId, currentIsActive) => {
    try {
      setToggleStatusId(userId);
      await toggleUserStatus(userId, !currentIsActive);
      toast.success(`User ${!currentIsActive ? 'activated' : 'deactivated'} successfully`);
      fetchUsers();
      // Also refresh drawer if open
      if (selectedUser?._id === userId) {
        setSelectedUser((u) => u ? { ...u, isActive: !currentIsActive } : u);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update user status');
    } finally {
      setToggleStatusId(null);
    }
  };

  const stats = {
    total: users.length,
    students: users.filter((u) => u.role === 'student').length,
    instructors: users.filter((u) => u.role === 'instructor').length,
    admins: users.filter((u) => u.role === 'admin').length,
  };

  return (
    <div className="p-8 bg-muted/30 min-h-full">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold">User Management</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage user accounts and roles</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Users', value: stats.total, icon: UsersIcon, color: 'text-indigo-600', bg: 'bg-indigo-50' },
            { label: 'Students', value: stats.students, icon: UsersIcon, color: 'text-slate-600', bg: 'bg-muted' },
            { label: 'Instructors', value: stats.instructors, icon: GraduationCap, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Admins', value: stats.admins, icon: Shield, color: 'text-red-600', bg: 'bg-red-50' },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <Card key={label}>
              <CardContent className="p-5 flex items-center gap-3">
                <div className={`w-10 h-10 ${bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium">{label}</p>
                  <p className="text-2xl font-bold">{value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Table Card */}
        <Card className="overflow-hidden">
          {/* Filters */}
          <div className="p-4 border-b flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                className="pl-9"
              />
            </div>
            <select
              value={roleFilter}
              onChange={(e) => { setRoleFilter(e.target.value); setCurrentPage(1); }}
              className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="all">All Roles</option>
              <option value="student">Students</option>
              <option value="instructor">Instructors</option>
              <option value="admin">Admins</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
              className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {/* Table */}
          {loading ? (
            <div className="p-6 space-y-3">
              {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-14 rounded-lg" />)}
            </div>
          ) : users.length === 0 ? (
            <EmptyState
              icon={UsersIcon}
              title="No users found"
              description={
                searchTerm || roleFilter !== 'all' || statusFilter !== 'all'
                  ? 'Try adjusting your search or filter criteria'
                  : 'No users registered yet'
              }
            />
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user._id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9">
                              <AvatarImage src={user.avatar} alt={user.name} />
                              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-500 text-white text-xs font-semibold">
                                {user.name?.charAt(0) || 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <p className="font-medium text-sm">{user.name}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">{user.email}</TableCell>
                        <TableCell>
                          <Badge variant={ROLE_VARIANT[user.role] || 'secondary'} className="capitalize">
                            {user.role}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {user.isActive ? (
                            <span className="flex items-center gap-1 text-emerald-600 text-sm font-medium">
                              <CheckCircle className="w-4 h-4" />Active
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-destructive text-sm font-medium">
                              <XCircle className="w-4 h-4" />Inactive
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="icon" onClick={() => openDrawer(user)}>
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              disabled={toggleStatusId === user._id}
                              onClick={() => handleToggleStatus(user._id, user.isActive)}
                              title={user.isActive ? 'Deactivate' : 'Activate'}
                            >
                              {toggleStatusId === user._id
                                ? <Loader2 className="w-4 h-4 animate-spin" />
                                : <Ban className="w-4 h-4" />}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {totalPages > 1 && (
                <div className="px-6 py-4 border-t flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">Page {currentPage} of {totalPages}</p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="icon" onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}>
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </Card>
      </div>

      {/* Edit User Drawer */}
      <Sheet open={showDrawer} onOpenChange={(open) => { if (!open) closeDrawer(); }}>
        <SheetContent className="w-full max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Edit User</SheetTitle>
          </SheetHeader>

          {selectedUser && (
            <div className="mt-6 space-y-6">
              {/* User Info */}
              <div className="text-center">
                <Avatar className="h-20 w-20 mx-auto mb-3">
                  <AvatarImage src={selectedUser.avatar} alt={selectedUser.name} />
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-500 text-white text-2xl font-bold">
                    {selectedUser.name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <h3 className="text-lg font-semibold">{selectedUser.name}</h3>
                <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Joined {new Date(selectedUser.createdAt).toLocaleDateString()}
                </p>
              </div>

              <Separator />

              {/* Role Selection */}
              <div>
                <p className="text-sm font-semibold mb-3">User Role</p>
                <div className="space-y-2">
                  {['student', 'instructor', 'admin'].map((role) => {
                    const { icon: Icon, desc } = ROLE_META[role];
                    return (
                      <label
                        key={role}
                        className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition ${
                          editRole === role
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-border/80'
                        }`}
                      >
                        <input
                          type="radio"
                          name="role"
                          value={role}
                          checked={editRole === role}
                          onChange={(e) => setEditRole(e.target.value)}
                          className="w-4 h-4"
                        />
                        <div className="flex-1">
                          <p className="font-medium text-sm capitalize">{role}</p>
                          <p className="text-xs text-muted-foreground">{desc}</p>
                        </div>
                        <Icon className="w-4 h-4 text-muted-foreground" />
                      </label>
                    );
                  })}
                </div>
              </div>

              <Separator />

              {/* Account Status */}
              <div>
                <p className="text-sm font-semibold mb-3">Account Status</p>
                <div className={`p-4 rounded-lg border ${selectedUser.isActive ? 'bg-emerald-50 border-emerald-200' : 'bg-destructive/5 border-destructive/20'}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">{selectedUser.isActive ? 'Active' : 'Inactive'}</p>
                      <p className="text-xs text-muted-foreground">
                        {selectedUser.isActive ? 'User can access the platform' : 'User cannot access the platform'}
                      </p>
                    </div>
                    <Button
                      variant={selectedUser.isActive ? 'destructive' : 'default'}
                      size="sm"
                      disabled={toggleStatusId === selectedUser._id}
                      onClick={() => handleToggleStatus(selectedUser._id, selectedUser.isActive)}
                      className="gap-2"
                    >
                      {toggleStatusId === selectedUser._id
                        ? <><Loader2 className="w-4 h-4 animate-spin" />Processing...</>
                        : selectedUser.isActive ? 'Deactivate' : 'Activate'}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button variant="outline" onClick={closeDrawer} disabled={processing} className="flex-1">
                  Cancel
                </Button>
                <Button
                  onClick={handleUpdateRole}
                  disabled={processing || editRole === selectedUser.role}
                  className="flex-1 gap-2"
                >
                  {processing && <Loader2 className="w-4 h-4 animate-spin" />}
                  {processing ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
