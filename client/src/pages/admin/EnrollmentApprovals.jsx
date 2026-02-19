import { useState, useEffect } from 'react';
import {
  Search, CheckCircle, XCircle, Clock, Filter,
  ChevronLeft, ChevronRight, Eye
} from 'lucide-react';
import { getAllEnrollments, approveEnrollment, rejectEnrollment } from '../../services/adminService';
import Spinner from '../../components/common/Spinner';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import EmptyState from '../../components/common/EmptyState';
import toast from 'react-hot-toast';

export default function EnrollmentApprovals() {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); // all, pending, approved, rejected
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showApproveConfirm, setShowApproveConfirm] = useState(false);
  const [selectedEnrollment, setSelectedEnrollment] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    fetchEnrollments();
  }, [activeTab, currentPage, searchTerm]);

  const fetchEnrollments = async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        limit: 10,
        status: activeTab !== 'all' ? activeTab : undefined,
        search: searchTerm || undefined,
      };

      const data = await getAllEnrollments(params);
      setEnrollments(data.data.enrollments || []);
      setTotalPages(data.data.totalPages || 1);
    } catch (error) {
      console.error('Failed to fetch enrollments:', error);
      toast.error(error.response?.data?.message || 'Failed to load enrollments');
    } finally {
      setLoading(false);
    }
  };

  const openApproveConfirm = (enrollment) => {
    setSelectedEnrollment(enrollment);
    setShowApproveConfirm(true);
  };

  const handleApprove = async () => {
    if (processingId || !selectedEnrollment) return;

    try {
      setProcessingId(selectedEnrollment._id);
      await approveEnrollment(selectedEnrollment._id);
      toast.success('Enrollment approved successfully!');
      setShowApproveConfirm(false);
      setSelectedEnrollment(null);
      fetchEnrollments();
    } catch (error) {
      console.error('Failed to approve enrollment:', error);
      toast.error(error.response?.data?.message || 'Failed to approve enrollment');
    } finally {
      setProcessingId(null);
    }
  };

  const openRejectModal = (enrollment) => {
    setSelectedEnrollment(enrollment);
    setShowRejectModal(true);
    setRejectReason('');
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }

    try {
      setProcessingId(selectedEnrollment._id);
      await rejectEnrollment(selectedEnrollment._id, rejectReason);
      toast.success('Enrollment rejected');
      setShowRejectModal(false);
      setSelectedEnrollment(null);
      setRejectReason('');
      fetchEnrollments();
    } catch (error) {
      console.error('Failed to reject enrollment:', error);
      toast.error(error.response?.data?.message || 'Failed to reject enrollment');
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-800',
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${styles[status] || styles.pending}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const tabs = [
    { id: 'all', label: 'All Enrollments' },
    { id: 'pending', label: 'Pending' },
    { id: 'approved', label: 'Approved' },
    { id: 'rejected', label: 'Rejected' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Enrollment Approvals</h1>
          <p className="mt-1 text-sm text-gray-500">
            Review and manage enrollment requests
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="bg-white rounded-t-xl shadow-sm border border-gray-200 border-b-0">
          <div className="flex border-b border-gray-200">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setCurrentPage(1);
                }}
                className={`px-6 py-3 text-sm font-medium transition ${
                  activeTab === tab.id
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search and Filters */}
          <div className="p-4 bg-gray-50 border-b border-gray-200">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by student name, course title..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <button
                onClick={fetchEnrollments}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
              >
                <Filter className="w-4 h-4" />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Enrollments Table */}
        <div className="bg-white rounded-b-xl shadow-sm border border-gray-200">
          {loading ? (
            <div className="flex justify-center items-center py-16">
              <Spinner />
            </div>
          ) : enrollments.length === 0 ? (
            <EmptyState
              icon={Clock}
              title="No enrollments found"
              description={
                searchTerm
                  ? 'Try adjusting your search criteria or filters'
                  : activeTab === 'pending'
                  ? 'No pending enrollment requests at the moment'
                  : `No ${activeTab === 'all' ? '' : activeTab} enrollment requests yet`
              }
            />
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Student
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Course
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Requested
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {enrollments.map((enrollment) => (
                      <tr key={enrollment._id} className="hover:bg-gray-50 transition">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-blue-600 font-semibold text-sm">
                                {enrollment.student?.name?.charAt(0) || 'S'}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{enrollment.student?.name || 'Unknown'}</p>
                              <p className="text-sm text-gray-500">{enrollment.student?.email || ''}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-medium text-gray-900">{enrollment.course?.title || 'Unknown Course'}</p>
                          <p className="text-sm text-gray-500">${enrollment.course?.price || 0}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-gray-900">
                            {new Date(enrollment.createdAt).toLocaleDateString()}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(enrollment.createdAt).toLocaleTimeString()}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          {getStatusBadge(enrollment.status)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            {enrollment.status === 'pending' ? (
                              <>
                                <button
                                  onClick={() => openApproveConfirm(enrollment)}
                                  disabled={processingId === enrollment._id}
                                  className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition disabled:opacity-50"
                                  title="Approve"
                                >
                                  <CheckCircle className="w-5 h-5" />
                                </button>
                                <button
                                  onClick={() => openRejectModal(enrollment)}
                                  disabled={processingId === enrollment._id}
                                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
                                  title="Reject"
                                >
                                  <XCircle className="w-5 h-5" />
                                </button>
                              </>
                            ) : (
                              <button
                                className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition"
                                title="View Details"
                              >
                                <Eye className="w-5 h-5" />
                              </button>
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
                  <div className="text-sm text-gray-500">
                    Page {currentPage} of {totalPages}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Approve Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showApproveConfirm}
        onClose={() => {
          setShowApproveConfirm(false);
          setSelectedEnrollment(null);
        }}
        onConfirm={handleApprove}
        title="Approve Enrollment"
        message={`Are you sure you want to approve enrollment for ${selectedEnrollment?.student?.name} in "${selectedEnrollment?.course?.title}"? This will grant the student immediate access to the course.`}
        confirmText="Approve Enrollment"
        cancelText="Cancel"
        variant="warning"
        isLoading={processingId === selectedEnrollment?._id}
      />

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Reject Enrollment Request</h3>
            <p className="text-sm text-gray-600 mb-4">
              Student: <span className="font-medium">{selectedEnrollment?.student?.name}</span>
              <br />
              Course: <span className="font-medium">{selectedEnrollment?.course?.title}</span>
            </p>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason for Rejection *
            </label>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Provide a clear reason for rejecting this enrollment request..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none"
              rows="4"
            />
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setSelectedEnrollment(null);
                  setRejectReason('');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                disabled={processingId}
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={!rejectReason.trim() || processingId}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {processingId ? 'Rejecting...' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
