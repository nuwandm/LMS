import { useState, useEffect } from 'react';
import {
  Search, BookOpen, Globe, Archive,
  FileText, MoreHorizontal, ChevronLeft, ChevronRight, Trash2,
} from 'lucide-react';
import { getAllCoursesAdmin } from '../../services/adminService';
import { togglePublishCourse, deleteCourse } from '../../services/courseService';
import toast from 'react-hot-toast';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import EmptyState from '../../components/common/EmptyState';

const STATUS_TABS = [
  { label: 'All', value: '' },
  { label: 'Published', value: 'published' },
  { label: 'Draft', value: 'draft' },
  { label: 'Archived', value: 'archived' },
];

const STATUS_VARIANT = { published: 'success', draft: 'secondary', archived: 'warning' };
const LIMIT = 15;

export default function AdminCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => { fetchCourses(); }, [activeTab, page]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const params = { page, limit: LIMIT };
      if (activeTab) params.status = activeTab;
      const data = await getAllCoursesAdmin(params);
      setCourses(data.data.courses || []);
      setTotal(data.data.pagination?.total || 0);
      setTotalPages(data.data.pagination?.totalPages || 1);
    } catch {
      toast.error('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (val) => { setActiveTab(val); setPage(1); };

  const handleToggleStatus = async (course, newStatus) => {
    try {
      await togglePublishCourse(course._id, newStatus);
      toast.success(`Course ${newStatus}`);
      fetchCourses();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update status');
    }
  };

  const handleDelete = async () => {
    try {
      setProcessing(true);
      await deleteCourse(deleteTarget._id);
      toast.success('Course deleted');
      setDeleteTarget(null);
      fetchCourses();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete course');
    } finally {
      setProcessing(false);
    }
  };

  const filtered = courses.filter((c) =>
    c.title?.toLowerCase().includes(search.toLowerCase()) ||
    c.instructor?.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8 bg-muted/30 min-h-full">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold">Course Management</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {total} course{total !== 1 ? 's' : ''} on the platform
          </p>
        </div>

        {/* Table Card */}
        <Card className="overflow-hidden">
          {/* Tabs + Search */}
          <div className="border-b">
            <div className="flex flex-wrap items-center justify-between gap-3 px-6 pt-4 pb-0">
              <div className="flex gap-1 overflow-x-auto scrollbar-none">
                {STATUS_TABS.map((tab) => (
                  <button
                    key={tab.value}
                    onClick={() => handleTabChange(tab.value)}
                    className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px whitespace-nowrap ${
                      activeTab === tab.value
                        ? 'border-foreground text-foreground'
                        : 'border-transparent text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
              <div className="relative mb-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search courses or instructors..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 w-64"
                />
              </div>
            </div>
          </div>

          {/* Content */}
          {loading ? (
            <div className="p-6 space-y-3">
              {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-14 rounded-lg" />)}
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState icon={BookOpen} title="No courses found" description="Try adjusting your search or filter" />
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Course</TableHead>
                      <TableHead>Instructor</TableHead>
                      <TableHead className="hidden lg:table-cell">Category</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Students</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                      <TableHead className="text-center">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((course) => (
                      <TableRow key={course._id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-16 rounded overflow-hidden flex-shrink-0 bg-slate-700">
                              {course.thumbnail ? (
                                <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <BookOpen className="w-4 h-4 text-white" />
                                </div>
                              )}
                            </div>
                            <span className="font-medium text-sm line-clamp-1 max-w-[200px]">{course.title}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">{course.instructor?.name || '—'}</TableCell>
                        <TableCell className="text-sm text-muted-foreground hidden lg:table-cell">{course.category || '—'}</TableCell>
                        <TableCell>
                          <Badge variant={STATUS_VARIANT[course.status] || 'secondary'}>
                            {course.status.charAt(0).toUpperCase() + course.status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-medium text-sm">
                          {(course.enrollmentCount || 0).toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right text-sm">
                          {course.price === 0
                            ? <span className="text-emerald-600 font-medium">Free</span>
                            : `$${course.price}`}
                        </TableCell>
                        <TableCell className="text-center">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-44">
                              {course.status !== 'published' && (
                                <DropdownMenuItem
                                  className="flex items-center gap-2 cursor-pointer"
                                  onClick={() => handleToggleStatus(course, 'published')}
                                >
                                  <Globe className="w-4 h-4 text-emerald-500" />Publish
                                </DropdownMenuItem>
                              )}
                              {course.status === 'published' && (
                                <DropdownMenuItem
                                  className="flex items-center gap-2 cursor-pointer"
                                  onClick={() => handleToggleStatus(course, 'draft')}
                                >
                                  <FileText className="w-4 h-4 text-amber-500" />Unpublish
                                </DropdownMenuItem>
                              )}
                              {course.status !== 'archived' && (
                                <DropdownMenuItem
                                  className="flex items-center gap-2 cursor-pointer"
                                  onClick={() => handleToggleStatus(course, 'archived')}
                                >
                                  <Archive className="w-4 h-4 text-muted-foreground" />Archive
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="flex items-center gap-2 cursor-pointer text-destructive focus:text-destructive"
                                onClick={() => setDeleteTarget(course)}
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
                    Page {page} of {totalPages} · {total} courses
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
        message={`Delete "${deleteTarget?.title}"? This cannot be undone.`}
        confirmText="Delete Course"
        variant="danger"
        isLoading={processing}
      />
    </div>
  );
}
