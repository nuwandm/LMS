import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus, BookOpen, Users, TrendingUp, Search,
  MoreHorizontal, Edit2, Trash2, LayoutList, Globe, Eye,
  ChevronLeft, ChevronRight,
} from 'lucide-react';
import {
  getInstructorCourses, deleteCourse, togglePublishCourse,
} from '../../services/courseService';
import Spinner from '../../components/common/Spinner';
import EmptyState from '../../components/common/EmptyState';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import toast from 'react-hot-toast';

const STATUS_TABS = [
  { id: 'all', label: 'All Courses' },
  { id: 'published', label: 'Published' },
  { id: 'draft', label: 'Draft' },
  { id: 'archived', label: 'Archived' },
];

const STATUS_BADGE = {
  published: 'bg-green-100 text-green-800',
  draft: 'bg-gray-100 text-gray-700',
  archived: 'bg-yellow-100 text-yellow-800',
};

const PAGE_SIZE = 10;

export default function MyCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [openMenuId, setOpenMenuId] = useState(null);

  // Confirm dialogs
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [publishTarget, setPublishTarget] = useState(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchCourses();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = () => setOpenMenuId(null);
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const res = await getInstructorCourses();
      const data = Array.isArray(res.data)
        ? res.data
        : res.data?.courses || [];
      setCourses(data);
    } catch {
      toast.error('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  // ── derived values ───────────────────────────────────────────────
  const filtered = courses.filter((c) => {
    const matchTab = activeTab === 'all' || c.status === activeTab;
    const matchSearch =
      !search ||
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.category?.toLowerCase().includes(search.toLowerCase());
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

  // ── handlers ─────────────────────────────────────────────────────
  const handleTabChange = (id) => {
    setActiveTab(id);
    setPage(1);
  };

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

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
    const newStatus =
      publishTarget.status === 'published' ? 'draft' : 'published';
    try {
      setProcessing(true);
      await togglePublishCourse(publishTarget._id, newStatus);
      toast.success(
        newStatus === 'published' ? 'Course published!' : 'Course unpublished'
      );
      setPublishTarget(null);
      fetchCourses();
    } catch {
      toast.error('Failed to update course status');
    } finally {
      setProcessing(false);
    }
  };

  // ── render ────────────────────────────────────────────────────────
  return (
    <div className="p-8 bg-gray-50 min-h-full">
      <div className="max-w-7xl mx-auto flex flex-col gap-8">

        {/* Page Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Courses</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Manage your courses, content, and publishing status.
            </p>
          </div>
          <Link
            to="/instructor/courses/create"
            className="flex items-center gap-2 px-4 py-2 bg-[#14396b] hover:bg-[#0f2d54] text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            New Course
          </Link>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Courses', value: stats.total, icon: BookOpen, color: 'bg-blue-50 text-blue-600' },
            { label: 'Published', value: stats.published, icon: Globe, color: 'bg-green-50 text-green-600' },
            { label: 'Drafts', value: stats.draft, icon: LayoutList, color: 'bg-gray-100 text-gray-600' },
            { label: 'Total Students', value: stats.students.toLocaleString(), icon: Users, color: 'bg-indigo-50 text-indigo-600' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4 shadow-sm">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">{label}</p>
                <p className="text-2xl font-bold text-gray-900">{value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Table Card */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">

          {/* Tabs + Search */}
          <div className="border-b border-gray-200">
            <div className="flex flex-wrap items-center justify-between gap-3 px-6 pt-4 pb-0">
              {/* Status Tabs */}
              <div className="flex gap-1">
                {STATUS_TABS.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
                      activeTab === tab.id
                        ? 'border-[#14396b] text-[#14396b]'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {tab.label}
                    <span className={`ml-2 text-xs px-1.5 py-0.5 rounded-full ${
                      activeTab === tab.id
                        ? 'bg-[#14396b]/10 text-[#14396b]'
                        : 'bg-gray-100 text-gray-500'
                    }`}>
                      {tab.id === 'all'
                        ? courses.length
                        : courses.filter((c) => c.status === tab.id).length}
                    </span>
                  </button>
                ))}
              </div>

              {/* Search */}
              <div className="relative mb-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search courses..."
                  value={search}
                  onChange={handleSearch}
                  className="pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#14396b]/20 focus:border-[#14396b] w-56"
                />
              </div>
            </div>
          </div>

          {/* Table Body */}
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Spinner />
            </div>
          ) : paginated.length === 0 ? (
            <EmptyState
              icon={BookOpen}
              title={search ? 'No courses match your search' : 'No courses yet'}
              description={
                search
                  ? 'Try a different search term or clear the filter.'
                  : 'Create your first course to start teaching!'
              }
              action={
                !search && (
                  <Link
                    to="/instructor/courses/create"
                    className="inline-flex items-center gap-2 bg-[#14396b] text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-[#0f2d54] transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Create Course
                  </Link>
                )
              }
            />
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-medium text-xs uppercase tracking-wider">
                    <tr>
                      <th className="px-6 py-4">Course</th>
                      <th className="px-6 py-4 hidden sm:table-cell">Category</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-center">Students</th>
                      <th className="px-6 py-4 text-center">Price</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {paginated.map((course) => (
                      <tr key={course._id} className="hover:bg-gray-50 transition-colors">
                        {/* Course Title + Thumbnail */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-16 rounded overflow-hidden flex-shrink-0 bg-gradient-to-br from-[#14396b]/60 to-[#0f2d54]">
                              {course.thumbnail ? (
                                <img
                                  src={course.thumbnail}
                                  alt={course.title}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <BookOpen className="w-4 h-4 text-white" />
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 line-clamp-1 max-w-[200px]">
                                {course.title}
                              </p>
                              <p className="text-xs text-gray-500 sm:hidden">{course.category}</p>
                            </div>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="px-6 py-4 text-gray-600 hidden sm:table-cell">
                          {course.category}
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_BADGE[course.status] || STATUS_BADGE.draft}`}>
                            {course.status.charAt(0).toUpperCase() + course.status.slice(1)}
                          </span>
                        </td>

                        {/* Students */}
                        <td className="px-6 py-4 text-center font-medium text-gray-900">
                          {course.status === 'published' ? (course.enrollmentCount || 0) : '—'}
                        </td>

                        {/* Price */}
                        <td className="px-6 py-4 text-center text-gray-700">
                          {course.price === 0 ? (
                            <span className="text-green-600 font-medium text-xs">Free</span>
                          ) : (
                            `$${course.price}`
                          )}
                        </td>

                        {/* Actions dropdown */}
                        <td className="px-6 py-4 text-right">
                          <div className="relative inline-block">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenMenuId(openMenuId === course._id ? null : course._id);
                              }}
                              className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                              <MoreHorizontal className="w-5 h-5" />
                            </button>

                            {openMenuId === course._id && (
                              <div
                                className="absolute right-0 mt-1 w-48 bg-white rounded-xl border border-gray-200 shadow-lg z-20 py-1"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Link
                                  to={`/instructor/courses/${course._id}/edit`}
                                  className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                  onClick={() => setOpenMenuId(null)}
                                >
                                  <Edit2 className="w-4 h-4" />
                                  Edit Details
                                </Link>
                                <Link
                                  to={`/instructor/courses/${course._id}/curriculum`}
                                  className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                  onClick={() => setOpenMenuId(null)}
                                >
                                  <LayoutList className="w-4 h-4" />
                                  Manage Curriculum
                                </Link>
                                <button
                                  onClick={() => {
                                    setPublishTarget(course);
                                    setOpenMenuId(null);
                                  }}
                                  className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors w-full text-left"
                                >
                                  {course.status === 'published' ? (
                                    <><Eye className="w-4 h-4" /> Unpublish</>
                                  ) : (
                                    <><TrendingUp className="w-4 h-4" /> Publish</>
                                  )}
                                </button>
                                <div className="border-t border-gray-100 my-1" />
                                <button
                                  onClick={() => {
                                    setDeleteTarget(course);
                                    setOpenMenuId(null);
                                  }}
                                  className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors w-full text-left"
                                >
                                  <Trash2 className="w-4 h-4" />
                                  Delete Course
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                  <p className="text-sm text-gray-500">
                    Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Course"
        message={`Are you sure you want to delete "${deleteTarget?.title}"? This action cannot be undone.`}
        confirmText="Delete Course"
        cancelText="Cancel"
        variant="danger"
        isLoading={processing}
      />

      {/* Publish/Unpublish Confirm */}
      <ConfirmDialog
        isOpen={!!publishTarget}
        onClose={() => setPublishTarget(null)}
        onConfirm={handleTogglePublish}
        title={publishTarget?.status === 'published' ? 'Unpublish Course' : 'Publish Course'}
        message={
          publishTarget?.status === 'published'
            ? `Unpublishing "${publishTarget?.title}" will hide it from students. You can re-publish at any time.`
            : `Publishing "${publishTarget?.title}" will make it visible to all students.`
        }
        confirmText={publishTarget?.status === 'published' ? 'Unpublish' : 'Publish'}
        cancelText="Cancel"
        variant="warning"
        isLoading={processing}
      />
    </div>
  );
}
