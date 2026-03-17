import { useState, useEffect } from 'react';
import {
  Search, CheckCircle, XCircle, Clock, Filter,
  ChevronLeft, ChevronRight,
} from 'lucide-react';
import { getAllEnrollments, approveEnrollment, rejectEnrollment } from '../../services/adminService';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import EmptyState from '../../components/common/EmptyState';
import toast from 'react-hot-toast';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';

const STATUS_TABS = [
  { id: 'all', label: 'All Enrollments' },
  { id: 'pending', label: 'Pending' },
  { id: 'approved', label: 'Approved' },
  { id: 'rejected', label: 'Rejected' },
];

const STATUS_VARIANT = { pending: 'warning', approved: 'success', rejected: 'destructive', cancelled: 'secondary' };

export default function EnrollmentApprovals() {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showApproveConfirm, setShowApproveConfirm] = useState(false);
  const [selectedEnrollment, setSelectedEnrollment] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => { fetchEnrollments(); }, [activeTab, currentPage, searchTerm]);

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
      toast.error(error.response?.data?.message || 'Failed to load enrollments');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (processingId || !selectedEnrollment) return;
    try {
      setProcessingId(selectedEnrollment._id);
      await approveEnrollment(selectedEnrollment._id);
      toast.success('Enrollment approved!');
      setShowApproveConfirm(false);
      setSelectedEnrollment(null);
      fetchEnrollments();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to approve enrollment');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) { toast.error('Please provide a reason for rejection'); return; }
    try {
      setProcessingId(selectedEnrollment._id);
      await rejectEnrollment(selectedEnrollment._id, rejectReason);
      toast.success('Enrollment rejected');
      setShowRejectDialog(false);
      setSelectedEnrollment(null);
      setRejectReason('');
      fetchEnrollments();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reject enrollment');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="p-8 bg-muted/30 min-h-full">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold">Enrollment Approvals</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Review and manage enrollment requests</p>
        </div>

        {/* Table Card */}
        <Card className="overflow-hidden">
          {/* Tabs + Search */}
          <div className="border-b">
            <div className="flex flex-wrap items-center justify-between gap-3 px-6 pt-4 pb-0">
              <div className="flex gap-1 overflow-x-auto">
                {STATUS_TABS.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => { setActiveTab(tab.id); setCurrentPage(1); }}
                    className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'border-foreground text-foreground'
                        : 'border-transparent text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
              <div className="flex gap-2 mb-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by student or course..."
                    value={searchTerm}
                    onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                    className="pl-9 w-60"
                  />
                </div>
                <Button variant="outline" size="sm" onClick={fetchEnrollments} className="gap-1">
                  <Filter className="w-4 h-4" />Refresh
                </Button>
              </div>
            </div>
          </div>

          {/* Content */}
          {loading ? (
            <div className="p-6 space-y-3">
              {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16 rounded-lg" />)}
            </div>
          ) : enrollments.length === 0 ? (
            <EmptyState
              icon={Clock}
              title="No enrollments found"
              description={
                searchTerm
                  ? 'Try adjusting your search criteria'
                  : activeTab === 'pending'
                  ? 'No pending enrollment requests at the moment'
                  : `No ${activeTab === 'all' ? '' : activeTab} enrollment requests yet`
              }
            />
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Course</TableHead>
                      <TableHead>Requested</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {enrollments.map((enrollment) => (
                      <TableRow key={enrollment._id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9">
                              <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                                {enrollment.student?.name?.charAt(0) || 'S'}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-sm">{enrollment.student?.name || 'Unknown'}</p>
                              <p className="text-xs text-muted-foreground">{enrollment.student?.email || ''}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <p className="font-medium text-sm">{enrollment.course?.title || 'Unknown Course'}</p>
                          <p className="text-xs text-muted-foreground">${enrollment.course?.price || 0}</p>
                        </TableCell>
                        <TableCell>
                          <p className="text-sm">{new Date(enrollment.createdAt).toLocaleDateString()}</p>
                          <p className="text-xs text-muted-foreground">{new Date(enrollment.createdAt).toLocaleTimeString()}</p>
                        </TableCell>
                        <TableCell>
                          <Badge variant={STATUS_VARIANT[enrollment.status] || 'secondary'}>
                            {enrollment.status.charAt(0).toUpperCase() + enrollment.status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {enrollment.status === 'pending' ? (
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-emerald-600 hover:text-emerald-600 hover:bg-emerald-50"
                                disabled={processingId === enrollment._id}
                                onClick={() => { setSelectedEnrollment(enrollment); setShowApproveConfirm(true); }}
                                title="Approve"
                              >
                                <CheckCircle className="w-5 h-5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                disabled={processingId === enrollment._id}
                                onClick={() => { setSelectedEnrollment(enrollment); setRejectReason(''); setShowRejectDialog(true); }}
                                title="Reject"
                              >
                                <XCircle className="w-5 h-5" />
                              </Button>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
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

      {/* Approve Confirm */}
      <ConfirmDialog
        isOpen={showApproveConfirm}
        onClose={() => { setShowApproveConfirm(false); setSelectedEnrollment(null); }}
        onConfirm={handleApprove}
        title="Approve Enrollment"
        message={`Approve enrollment for ${selectedEnrollment?.student?.name} in "${selectedEnrollment?.course?.title}"? This grants the student immediate course access.`}
        confirmText="Approve Enrollment"
        variant="warning"
        isLoading={processingId === selectedEnrollment?._id}
      />

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={(open) => { if (!open && !processingId) { setShowRejectDialog(false); setSelectedEnrollment(null); setRejectReason(''); } }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reject Enrollment Request</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="text-sm text-muted-foreground space-y-0.5">
              <p>Student: <span className="font-medium text-foreground">{selectedEnrollment?.student?.name}</span></p>
              <p>Course: <span className="font-medium text-foreground">{selectedEnrollment?.course?.title}</span></p>
            </div>
            <div className="space-y-2">
              <Label>Reason for Rejection <span className="text-destructive">*</span></Label>
              <Textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Provide a clear reason for rejecting this enrollment request..."
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => { setShowRejectDialog(false); setSelectedEnrollment(null); setRejectReason(''); }}
              disabled={!!processingId}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={!rejectReason.trim() || !!processingId}
            >
              {processingId ? 'Rejecting...' : 'Confirm Rejection'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
