import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus, BookOpen, Users, Globe, LayoutList, Search,
  Edit2, Trash2, Eye, TrendingUp, ChevronLeft, ChevronRight, MoreHorizontal,
} from 'lucide-react';
import { getInstructorCourses, deleteCourse, togglePublishCourse } from '../../services/courseService';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import EmptyState from '../../components/common/EmptyState';
import toast from 'react-hot-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const STATUS_TABS = [
  { id: 'all', label: 'All Courses' },
  { id: 'published', label: 'Published' },
  { id: 'draft', label: 'Draft' },
  { id: 'archived', label: 'Archived' },
];

const STATUS_VARIANT = { published: 'success', draft: 'secondary', archived: 'warning' };
const PAGE_SIZE = 10;

export default function MyCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [publishTarget, setPublishTarget] = useState(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => { fetchCourses(); }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const res = await getInstructorCourses();
      setCourses(Array.isArray(res.data) ? res.data : res.data?.courses || []);
    } catch {
      toast.error('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  const filtered = courses.filter((c) => {
    const matchTab = activeTab === 'all' || c.status === activeTab;
    const matchSearch = !search || c.title.toLowerCase().includes(search.toLowerCase()) || c.category?.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const stats = {
    total: courses.length,
    published: courses.filter((c) => c.status === 'published').length,
    draft: courses.filter((c) => c.status === 'draft').length,
    students: courses.reduce((s, c) => s + (c.enrollmentCount || 0), 0),
  };

  const handleTabChange = (id) => { setActiveTab(id); setPage(1); };
  const handleSearch = (e) => { setSearch(e.target.value); setPage(1); };

  const handleDelete = async () => {
    try {
      setProcessing(true);
      await deleteCourse(deleteTarget._id);
      toast.success('Course deleted');
      setDeleteTarget(null);
      fetchCourses();
    } catch {
      toast.error('Failed to delete course');
    } finally {
      setProcessing(false);
    }
  };

  const handleTogglePublish = async () => {
    const newStatus = publishTarget.status === 'published' ? 'draft' : 'published';
    try {
      setProcessing(true);
      await togglePublishCourse(publishTarget._id, newStatus);
      toast.success(newStatus === 'published' ? 'Course published!' : 'Course unpublished');
      setPublishTarget(null);
      fetchCourses();
    } catch {
      toast.error('Failed to update course status');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="p-8 bg-muted/30 min-h-full">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">My Courses</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Manage your courses, content, and publishing status.</p>
          </div>
          <Button asChild size="sm" className="gap-2">
            <Link to="/instructor/courses/create"><Plus className="w-4 h-4" />New Course</Link>
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Courses', value: stats.total, icon: BookOpen, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Published', value: stats.published, icon: Globe, color: 'text-emerald-600', bg: 'bg-emerald-50' },
            { label: 'Drafts', value: stats.draft, icon: LayoutList, color: 'text-slate-600', bg: 'bg-muted' },
            { label: 'Total Students', value: stats.students.toLocaleString(), icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <Card key={label}>
              <CardContent className="p-5 flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${bg}`}>
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
          <div className="border-b">
            <div className="flex flex-wrap items-center justify-between gap-3 px-6 pt-4 pb-0">
              <div className="flex gap-1 overflow-x-auto">
                {STATUS_TABS.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px whitespace-nowrap ${
                      activeTab === tab.id ? 'border-foreground text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {tab.label}
                    <span className={`ml-2 text-xs px-1.5 py-0.5 rounded-full ${activeTab === tab.id ? 'bg-foreground/10 text-foreground' : 'bg-muted text-muted-foreground'}`}>
                      {tab.id === 'all' ? courses.length : courses.filter((c) => c.status === tab.id).length}
                    </span>
                  </button>
                ))}
              </div>
              <div className="relative mb-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Search courses..." value={search} onChange={handleSearch} className="pl-9 w-56" />
              </div>
            </div>
          </div>

          {loading ? (
            <div className="p-6 space-y-3">
              {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-14 rounded-lg" />)}
            </div>
          ) : paginated.length === 0 ? (
            <EmptyState
              icon={BookOpen}
              title={search ? 'No courses match your search' : 'No courses yet'}
              description={search ? 'Try a different search term.' : 'Create your first course to start teaching!'}
              action={!search && (
                <Button asChild size="sm" className="gap-2">
                  <Link to="/instructor/courses/create"><Plus className="w-4 h-4" />Create Course</Link>
                </Button>
              )}
            />
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Course</TableHead>
                      <TableHead className="hidden sm:table-cell">Category</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-center">Students</TableHead>
                      <TableHead className="text-center">Price</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginated.map((course) => (
                      <TableRow key={course._id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-16 rounded overflow-hidden flex-shrink-0 bg-slate-700">
                              {course.thumbnail ? (
                                <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center"><BookOpen className="w-4 h-4 text-white" /></div>
                              )}
                            </div>
                            <div>
                              <p className="font-medium line-clamp-1 max-w-[200px]">{course.title}</p>
                              <p className="text-xs text-muted-foreground sm:hidden">{course.category}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground hidden sm:table-cell">{course.category}</TableCell>
                        <TableCell>
                          <Badge variant={STATUS_VARIANT[course.status] || 'secondary'}>
                            {course.status.charAt(0).toUpperCase() + course.status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center font-medium">
                          {course.status === 'published' ? (course.enrollmentCount || 0) : '—'}
                        </TableCell>
                        <TableCell className="text-center">
                          {course.price === 0
                            ? <span className="text-emerald-600 font-medium text-xs">Free</span>
                            : `$${course.price}`
                          }
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon"><MoreHorizontal className="w-4 h-4" /></Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuItem asChild>
                                <Link to={`/instructor/courses/${course._id}/edit`} className="flex items-center gap-2 cursor-pointer">
                                  <Edit2 className="w-4 h-4" />Edit Details
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link to={`/instructor/courses/${course._id}/curriculum`} className="flex items-center gap-2 cursor-pointer">
                                  <LayoutList className="w-4 h-4" />Manage Curriculum
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => setPublishTarget(course)} className="flex items-center gap-2 cursor-pointer">
                                {course.status === 'published'
                                  ? <><Eye className="w-4 h-4" />Unpublish</>
                                  : <><TrendingUp className="w-4 h-4" />Publish</>
                                }
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => setDeleteTarget(course)}
                                className="text-destructive focus:text-destructive flex items-center gap-2 cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4" />Delete Course
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {totalPages > 1 && (
                <div className="px-6 py-4 border-t flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
                  </p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="icon" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </Card>
      </div>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Course"
        message={`Are you sure you want to delete "${deleteTarget?.title}"? This action cannot be undone.`}
        confirmText="Delete Course"
        variant="danger"
        isLoading={processing}
      />

      <ConfirmDialog
        isOpen={!!publishTarget}
        onClose={() => setPublishTarget(null)}
        onConfirm={handleTogglePublish}
        title={publishTarget?.status === 'published' ? 'Unpublish Course' : 'Publish Course'}
        message={
          publishTarget?.status === 'published'
            ? `Unpublishing "${publishTarget?.title}" will hide it from students.`
            : `Publishing "${publishTarget?.title}" will make it visible to all students.`
        }
        confirmText={publishTarget?.status === 'published' ? 'Unpublish' : 'Publish'}
        variant="warning"
        isLoading={processing}
      />
    </div>
  );
}
