import { useState, useEffect, useCallback } from 'react';
import { Users, Search, BookOpen, Filter, Mail } from 'lucide-react';
import { getInstructorStudents } from '../../services/courseService';
import EmptyState from '../../components/common/EmptyState';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const InstructorStudents = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchStudents = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = { page, limit: 20 };
      if (search) params.search = search;
      if (selectedCourse) params.courseId = selectedCourse;

      const res = await getInstructorStudents(params);
      if (res.success) {
        setEnrollments(res.data.students || []);
        setCourses(res.data.courses || []);
        setTotal(res.data.total || 0);
        setTotalPages(res.data.totalPages || 1);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load students');
    } finally {
      setIsLoading(false);
    }
  }, [page, search, selectedCourse]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [search, selectedCourse]);

  const getInitials = (name = '') =>
    name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="p-8 bg-gray-50 min-h-full">
      <div className="max-w-7xl mx-auto flex flex-col gap-6">

        {/* Header */}
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-gray-900">Students</h1>
          <p className="text-gray-500">
            {total} student{total !== 1 ? 's' : ''} enrolled across your courses
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 flex flex-wrap gap-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={selectedCourse}
              onChange={e => setSelectedCourse(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Courses</option>
              {courses.map(c => (
                <option key={c._id} value={c._id}>{c.title}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {isLoading ? (
            <div className="p-8">
              <div className="animate-pulse space-y-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-14 bg-gray-100 rounded-lg" />
                ))}
              </div>
            </div>
          ) : enrollments.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No students yet"
              description={
                search || selectedCourse
                  ? 'No students match your filters.'
                  : 'Students will appear here once they enroll in your courses.'
              }
            />
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 font-medium">
                    <tr>
                      <th className="px-6 py-4">Student</th>
                      <th className="px-6 py-4">Course</th>
                      <th className="px-6 py-4 hidden md:table-cell">Enrolled</th>
                      <th className="px-6 py-4 text-center">Progress</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {enrollments.map(enrollment => (
                      <tr key={enrollment._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                              {enrollment.student?.avatar ? (
                                <img
                                  src={enrollment.student.avatar}
                                  alt={enrollment.student.name}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <span className="text-blue-600 font-semibold text-xs">
                                  {getInitials(enrollment.student?.name)}
                                </span>
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{enrollment.student?.name}</p>
                              <p className="text-xs text-gray-500 flex items-center gap-1">
                                <Mail className="w-3 h-3" />
                                {enrollment.student?.email}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-12 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                              {enrollment.course?.thumbnail ? (
                                <img
                                  src={enrollment.course.thumbnail}
                                  alt={enrollment.course.title}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="h-full w-full flex items-center justify-center">
                                  <BookOpen className="w-4 h-4 text-gray-400" />
                                </div>
                              )}
                            </div>
                            <span className="text-gray-700 line-clamp-1">{enrollment.course?.title}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-500 hidden md:table-cell">
                          {enrollment.createdAt
                            ? format(new Date(enrollment.createdAt), 'MMM d, yyyy')
                            : '—'}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-blue-500 rounded-full transition-all"
                                style={{ width: `${enrollment.progress || 0}%` }}
                              />
                            </div>
                            <span className="text-xs text-gray-500 w-8 text-right">
                              {enrollment.progress || 0}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                  <p className="text-sm text-gray-500">Page {page} of {totalPages}</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default InstructorStudents;
