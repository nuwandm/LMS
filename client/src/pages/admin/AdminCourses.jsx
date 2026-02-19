import { useState, useEffect } from 'react';
import {
  Search, BookOpen, Eye, Trash2, Globe, Archive,
  FileText, MoreVertical, ChevronLeft, ChevronRight,
} from 'lucide-react';
import { getAllCoursesAdmin } from '../../services/adminService';
import { togglePublishCourse, deleteCourse } from '../../services/courseService';
import Spinner from '../../components/common/Spinner';
import toast from 'react-hot-toast';

const STATUS_TABS = [
  { label: 'All', value: '' },
  { label: 'Published', value: 'published' },
  { label: 'Draft', value: 'draft' },
  { label: 'Archived', value: 'archived' },
];

const STATUS_BADGE = {
  published: 'bg-green-50 text-green-700 border border-green-200',
  draft:     'bg-amber-50 text-amber-700 border border-amber-200',
  archived:  'bg-gray-100 text-gray-500 border border-gray-300',
};

const STATUS_DOT = {
  published: 'bg-green-500',
  draft:     'bg-amber-400',
  archived:  'bg-gray-400',
};

export default function AdminCourses() {
  const [courses, setCourses]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [activeTab, setActiveTab] = useState('');
  const [openMenu, setOpenMenu]   = useState(null);
  const [page, setPage]           = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal]         = useState(0);
  const LIMIT = 15;

  useEffect(() => {
    fetchCourses();
  }, [activeTab, page]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = () => setOpenMenu(null);
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const params = { page, limit: LIMIT };
      if (activeTab) params.status = activeTab;
      const data = await getAllCoursesAdmin(params);
      setCourses(data.data.courses || []);
      setTotal(data.data.pagination?.total || 0);
      setTotalPages(data.data.pagination?.totalPages || 1);
    } catch (error) {
      toast.error('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (val) => {
    setActiveTab(val);
    setPage(1);
  };

  const handleToggleStatus = async (course, newStatus) => {
    setOpenMenu(null);
    try {
      await togglePublishCourse(course._id, newStatus);
      toast.success(`Course ${newStatus}`);
      fetchCourses();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update status');
    }
  };

  const handleDelete = async (course) => {
    setOpenMenu(null);
    if (!window.confirm(`Delete "${course.title}"? This cannot be undone.`)) return;
    try {
      await deleteCourse(course._id);
      toast.success('Course deleted');
      fetchCourses();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete course');
    }
  };

  const filtered = courses.filter((c) =>
    c.title?.toLowerCase().includes(search.toLowerCase()) ||
    c.instructor?.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Course Management</h1>
        <p className="text-sm text-gray-500 mt-1">
          {total} course{total !== 1 ? 's' : ''} on the platform
        </p>
      </div>

      {/* Status Tabs + Search */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4 px-6 pt-4 pb-0 border-b border-gray-200">
          <div className="flex gap-1">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab.value}
                onClick={() => handleTabChange(tab.value)}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px ${
                  activeTab === tab.value
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="relative pb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search courses or instructors…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 w-64"
            />
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Spinner />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <BookOpen className="w-12 h-12 mb-3" />
            <p className="font-medium">No courses found</p>
          </div>
        ) : (
          <div className="w-full">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50">
                  <th className="px-6 py-3 text-left">Course</th>
                  <th className="px-6 py-3 text-left">Instructor</th>
                  <th className="px-6 py-3 text-left">Category</th>
                  <th className="px-6 py-3 text-left">Status</th>
                  <th className="px-6 py-3 text-right">Students</th>
                  <th className="px-6 py-3 text-right">Price</th>
                  <th className="px-6 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((course) => (
                  <tr key={course._id} className="hover:bg-gray-50 transition-colors">
                    {/* Course */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {course.thumbnail ? (
                          <img
                            src={course.thumbnail}
                            alt={course.title}
                            className="w-16 h-10 object-cover rounded-md flex-shrink-0"
                          />
                        ) : (
                          <div className="w-16 h-10 bg-gray-100 rounded-md flex items-center justify-center flex-shrink-0">
                            <BookOpen className="w-4 h-4 text-gray-400" />
                          </div>
                        )}
                        <span className="font-medium text-gray-900 line-clamp-1 max-w-xs">
                          {course.title}
                        </span>
                      </div>
                    </td>

                    {/* Instructor */}
                    <td className="px-6 py-4">
                      <span className="text-gray-700">{course.instructor?.name || '—'}</span>
                    </td>

                    {/* Category */}
                    <td className="px-6 py-4">
                      <span className="text-gray-700">{course.category || '—'}</span>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium capitalize ${STATUS_BADGE[course.status]}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[course.status]}`} />
                        {course.status}
                      </span>
                    </td>

                    {/* Students */}
                    <td className="px-6 py-4 text-right">
                      <span className="text-gray-800 font-medium">{(course.enrollmentCount || 0).toLocaleString()}</span>
                    </td>

                    {/* Price */}
                    <td className="px-6 py-4 text-right">
                      {course.price === 0 ? (
                        <span className="text-green-600 font-semibold">Free</span>
                      ) : (
                        <span className="text-gray-800 font-medium">${course.price}</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-center">
                      <div className="relative inline-block">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenMenu(openMenu === course._id ? null : course._id);
                          }}
                          className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <MoreVertical className="w-4 h-4 text-gray-500" />
                        </button>

                      {openMenu === course._id && (
                        <div
                          onClick={(e) => e.stopPropagation()}
                          className="absolute right-0 top-full z-30 mt-1 w-44 bg-white rounded-lg shadow-xl border border-gray-200 py-1"
                        >
                          {course.status !== 'published' && (
                            <button
                              onClick={() => handleToggleStatus(course, 'published')}
                              className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                            >
                              <Globe className="w-4 h-4 text-green-500" />
                              Publish
                            </button>
                          )}
                          {course.status === 'published' && (
                            <button
                              onClick={() => handleToggleStatus(course, 'draft')}
                              className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                            >
                              <FileText className="w-4 h-4 text-yellow-500" />
                              Unpublish
                            </button>
                          )}
                          {course.status !== 'archived' && (
                            <button
                              onClick={() => handleToggleStatus(course, 'archived')}
                              className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                            >
                              <Archive className="w-4 h-4 text-gray-400" />
                              Archive
                            </button>
                          )}
                          <hr className="my-1 border-gray-100" />
                          <button
                            onClick={() => handleDelete(course)}
                            className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
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
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              Page {page} of {totalPages} · {total} courses
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page === 1}
                className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                disabled={page === totalPages}
                className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
