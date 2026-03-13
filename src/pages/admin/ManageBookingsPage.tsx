import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@clerk/clerk-react";
import {
  getAdminSessions,
  confirmPayment,
  markSessionComplete,
  addMeetingLink,
  openPaymentProof,
} from "@/lib/api";
import type { PageResponse, SessionDTO } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertCircle,
  ArrowUpDown,
  CalendarCheck,
  CheckCircle2,
  ExternalLink,
  RefreshCw,
  Search,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-800 border-yellow-200",
    CONFIRMED: "bg-blue-100 text-blue-800 border-blue-200",
    COMPLETED: "bg-green-100 text-green-800 border-green-200",
    CANCELLED: "bg-red-100 text-red-800 border-red-200",
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${
        map[status] ?? "bg-muted text-muted-foreground"
      }`}
    >
      {status}
    </span>
  );
}

function PaymentBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    PENDING: "bg-orange-100 text-orange-800 border-orange-200",
    SUBMITTED: "bg-blue-100 text-blue-800 border-blue-200",
    PAID: "bg-green-100 text-green-800 border-green-200",
    FAILED: "bg-red-100 text-red-800 border-red-200",
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${
        map[status] ?? "bg-muted text-muted-foreground"
      }`}
    >
      {status}
    </span>
  );
}

export default function ManageBookingsPage() {
  const { getToken } = useAuth();
  const [sessions, setSessions] = useState<SessionDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [sortField, setSortField] = useState("sessionAt");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [meetingLinkDialog, setMeetingLinkDialog] = useState<SessionDTO | null>(null);
  const [meetingLinkValue, setMeetingLinkValue] = useState("");
  const [meetingLinkError, setMeetingLinkError] = useState<string | null>(null);

  const fetchSessions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const token = await getToken();
      if (!token) throw new Error("Not authenticated");

      const data: PageResponse<SessionDTO> = await getAdminSessions(token, {
        page,
        size: 20,
        status: statusFilter,
        search: search.trim() || undefined,
        startDate: startDate ? new Date(`${startDate}T00:00:00`).toISOString() : undefined,
        endDate: endDate ? new Date(`${endDate}T23:59:59`).toISOString() : undefined,
        sortField,
        sortDirection,
      });

      setSessions(data.content);
      setTotalPages(data.totalPages);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load sessions");
    } finally {
      setLoading(false);
    }
  }, [getToken, page, statusFilter, search, startDate, endDate, sortField, sortDirection]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  async function handleConfirmPayment(session: SessionDTO) {
    setActionLoading(session.id);
    setError(null);
    setNotice(null);

    try {
      const token = await getToken();
      if (!token) return;

      const updated = await confirmPayment(session.id, token);
      setSessions((prev) => prev.map((current) => (current.id === updated.id ? updated : current)));
      setNotice(`Payment confirmed for session #${session.id}.`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error confirming payment");
    } finally {
      setActionLoading(null);
    }
  }

  async function handleMarkComplete(session: SessionDTO) {
    setActionLoading(session.id);
    setError(null);
    setNotice(null);

    try {
      const token = await getToken();
      if (!token) return;

      const updated = await markSessionComplete(session.id, token);
      setSessions((prev) => prev.map((current) => (current.id === updated.id ? updated : current)));
      setNotice(`Session #${session.id} marked as completed.`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error marking complete");
    } finally {
      setActionLoading(null);
    }
  }

  async function handleViewProof(session: SessionDTO) {
    setActionLoading(session.id);
    setError(null);

    try {
      const token = await getToken();
      if (!token) return;
      await openPaymentProof(session.id, token);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to open payment proof");
    } finally {
      setActionLoading(null);
    }
  }

  async function handleAddMeetingLink() {
    if (!meetingLinkDialog) return;

    setMeetingLinkError(null);
    setNotice(null);

    if (!meetingLinkValue.trim()) {
      setMeetingLinkError("Please enter a meeting link");
      return;
    }

    try {
      const token = await getToken();
      if (!token) return;

      const updated = await addMeetingLink(meetingLinkDialog.id, meetingLinkValue, token);
      setSessions((prev) => prev.map((current) => (current.id === updated.id ? updated : current)));
      setNotice(`Meeting link saved for session #${meetingLinkDialog.id}.`);
      setMeetingLinkDialog(null);
      setMeetingLinkValue("");
    } catch (err: unknown) {
      setMeetingLinkError(err instanceof Error ? err.message : "Failed to add meeting link");
    }
  }

  function handleSort(field: string) {
    setPage(0);
    if (sortField === field) {
      setSortDirection((current) => (current === "asc" ? "desc" : "asc"));
      return;
    }

    setSortField(field);
    setSortDirection("asc");
  }

  function renderSortableHeader(label: string, field: string) {
    const isActive = sortField === field;

    return (
      <button
        type="button"
        onClick={() => handleSort(field)}
        className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
      >
        <span>{label}</span>
        <ArrowUpDown className={`h-3.5 w-3.5 ${isActive ? "text-foreground" : "text-muted-foreground"}`} />
      </button>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <CalendarCheck className="h-6 w-6 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">Manage Bookings</h1>
          <p className="text-muted-foreground text-sm">
            Review, confirm, and manage all student sessions
          </p>
        </div>
      </div>

      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-3 items-center">
            <div className="relative flex-1 min-w-56">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by student or mentor..."
                value={search}
                onChange={(e) => {
                  setPage(0);
                  setSearch(e.target.value);
                }}
                className="pl-8"
              />
            </div>

            <Select
              value={statusFilter}
              onValueChange={(value) => {
                setPage(0);
                setStatusFilter(value);
              }}
            >
              <SelectTrigger className="w-44">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Status</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            <Input
              type="date"
              value={startDate}
              onChange={(e) => {
                setPage(0);
                setStartDate(e.target.value);
              }}
              className="w-40"
            />

            <Input
              type="date"
              value={endDate}
              onChange={(e) => {
                setPage(0);
                setEndDate(e.target.value);
              }}
              className="w-40"
            />

            <Button variant="outline" size="sm" onClick={fetchSessions} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-1.5 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setPage(0);
                setSearch("");
                setStatusFilter("ALL");
                setStartDate("");
                setEndDate("");
                setSortField("sessionAt");
                setSortDirection("desc");
              }}
            >
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      {notice && (
        <div className="flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg p-3 mb-4">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          {notice}
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 rounded-lg p-3 mb-4">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Sessions</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">{renderSortableHeader("ID", "id")}</TableHead>
                  <TableHead>{renderSortableHeader("Student", "student.firstName")}</TableHead>
                  <TableHead>{renderSortableHeader("Mentor", "mentor.firstName")}</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>{renderSortableHeader("Date", "sessionAt")}</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>{renderSortableHeader("Payment", "paymentStatus")}</TableHead>
                  <TableHead>{renderSortableHeader("Status", "sessionStatus")}</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading && (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-12 text-muted-foreground">
                      <RefreshCw className="h-5 w-5 animate-spin mx-auto mb-2" />
                      Loading sessions...
                    </TableCell>
                  </TableRow>
                )}

                {!loading && sessions.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-12 text-muted-foreground">
                      No sessions found
                    </TableCell>
                  </TableRow>
                )}

                {!loading &&
                  sessions.map((session) => (
                    <TableRow key={session.id}>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        #{session.id}
                      </TableCell>
                      <TableCell className="font-medium whitespace-nowrap">
                        {session.studentName ?? "—"}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">{session.mentorName ?? "—"}</TableCell>
                      <TableCell className="max-w-40 truncate">{session.subjectName ?? "—"}</TableCell>
                      <TableCell className="whitespace-nowrap text-sm">
                        {new Date(session.sessionAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                        <br />
                        <span className="text-xs text-muted-foreground">
                          {new Date(session.sessionAt).toLocaleTimeString("en-US", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {session.durationMinutes ?? "—"} min
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <PaymentBadge status={session.paymentStatus} />
                          {session.paymentMethod && (
                            <p className="text-xs text-muted-foreground">{session.paymentMethod.replaceAll("_", " ")}</p>
                          )}
                          {session.paymentReference && (
                            <p className="text-xs text-muted-foreground">Ref: {session.paymentReference}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={session.sessionStatus} />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5 flex-wrap">
                          {session.hasPaymentProof && (
                            <Button
                              size="xs"
                              variant="ghost"
                              disabled={actionLoading === session.id}
                              onClick={() => handleViewProof(session)}
                            >
                              View Proof
                            </Button>
                          )}

                          {session.paymentStatus === "SUBMITTED" && (
                            <Button
                              size="xs"
                              variant="outline"
                              disabled={actionLoading === session.id}
                              onClick={() => handleConfirmPayment(session)}
                            >
                              Confirm Payment
                            </Button>
                          )}

                          {session.sessionStatus === "CONFIRMED" && (
                            <Button
                              size="xs"
                              variant="outline"
                              disabled={actionLoading === session.id}
                              onClick={() => handleMarkComplete(session)}
                            >
                              Mark Complete
                            </Button>
                          )}

                          <Button
                            size="xs"
                            variant="ghost"
                            onClick={() => {
                              setMeetingLinkDialog(session);
                              setMeetingLinkValue(session.meetingLink ?? "");
                              setMeetingLinkError(null);
                            }}
                          >
                            <ExternalLink className="h-3.5 w-3.5 mr-1" />
                            Meeting Link
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <Button
            variant="outline"
            size="sm"
            disabled={page === 0}
            onClick={() => setPage((current) => current - 1)}
          >
            Previous
          </Button>
          <span className="flex items-center px-3 text-sm text-muted-foreground">
            Page {page + 1} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages - 1}
            onClick={() => setPage((current) => current + 1)}
          >
            Next
          </Button>
        </div>
      )}

      <Dialog
        open={!!meetingLinkDialog}
        onOpenChange={(open) => {
          if (!open) {
            setMeetingLinkDialog(null);
            setMeetingLinkValue("");
            setMeetingLinkError(null);
          }
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Meeting Link</DialogTitle>
            <DialogDescription>
              Provide a video call link for session #{meetingLinkDialog?.id}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label>Meeting URL</Label>
              <Input
                placeholder="https://meet.google.com/xxx-xxxx-xxx"
                value={meetingLinkValue}
                onChange={(e) => setMeetingLinkValue(e.target.value)}
              />
            </div>

            {meetingLinkError && <p className="text-sm text-destructive">{meetingLinkError}</p>}

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setMeetingLinkDialog(null);
                  setMeetingLinkValue("");
                  setMeetingLinkError(null);
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button onClick={handleAddMeetingLink} className="flex-1">
                Save Link
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
