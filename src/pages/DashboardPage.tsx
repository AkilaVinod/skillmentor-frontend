import { useState, useEffect } from "react";
import { useAuth, useUser } from "@clerk/clerk-react";
import { getMySessions, createReview } from "@/lib/api";
import type { SessionDTO } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Calendar,
  Clock,
  ExternalLink,
  BookOpen,
  CheckCircle,
  AlertCircle,
  Star,
} from "lucide-react";
import { Link } from "react-router";

function StatusBadge({ status }: { status: string }) {
  const variants: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-800 border-yellow-200",
    CONFIRMED: "bg-blue-100 text-blue-800 border-blue-200",
    COMPLETED: "bg-green-100 text-green-800 border-green-200",
    CANCELLED: "bg-red-100 text-red-800 border-red-200",
  };
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${
        variants[status] ?? "bg-muted text-muted-foreground"
      }`}
    >
      {status}
    </span>
  );
}

function PaymentBadge({ status }: { status: string }) {
  const variants: Record<string, string> = {
    PENDING: "bg-orange-100 text-orange-800 border-orange-200",
    SUBMITTED: "bg-blue-100 text-blue-800 border-blue-200",
    PAID: "bg-green-100 text-green-800 border-green-200",
    FAILED: "bg-red-100 text-red-800 border-red-200",
  };
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${
        variants[status] ?? "bg-muted text-muted-foreground"
      }`}
    >
      {status}
    </span>
  );
}

interface ReviewDialogProps {
  session: SessionDTO;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

function ReviewDialog({ session, open, onOpenChange, onSuccess }: ReviewDialogProps) {
  const { getToken } = useAuth();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      setLoading(true);
      const token = await getToken();
      if (!token) throw new Error("Not authenticated");
      await createReview(
        { sessionId: session.id, rating, comment },
        token
      );
      onSuccess();
      onOpenChange(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to submit review");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Write a Review</DialogTitle>
          <DialogDescription>
            Share your experience with {session.mentorName}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label>Rating</Label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="focus:outline-none"
                >
                  <Star
                    className={`h-6 w-6 transition-colors ${
                      star <= rating
                        ? "fill-amber-400 text-amber-400"
                        : "text-muted-foreground hover:text-amber-300"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Comment (optional)</Label>
            <Textarea
              placeholder="Share your experience..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
            />
          </div>
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? "Submitting..." : "Submit Review"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function DashboardPage() {
  const { getToken } = useAuth();
  const { user } = useUser();
  const [sessions, setSessions] = useState<SessionDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reviewSession, setReviewSession] = useState<SessionDTO | null>(null);

  async function fetchSessions() {
    try {
      setLoading(true);
      const token = await getToken();
      if (!token) throw new Error("Not authenticated");
      const data = await getMySessions(token);
      setSessions(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load sessions");
    } finally {
      setLoading(false);
    }
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchSessions(); }, []);

  const upcomingSessions = sessions.filter(
    (s) => s.sessionStatus !== "COMPLETED" && s.sessionStatus !== "CANCELLED"
  );
  const completedSessions = sessions.filter(
    (s) => s.sessionStatus === "COMPLETED"
  );

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">
          Welcome back, {user?.firstName ?? "Student"}!
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage your mentoring sessions and track your progress.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Sessions", value: sessions.length, icon: BookOpen },
          { label: "Upcoming", value: upcomingSessions.length, icon: Calendar },
          { label: "Completed", value: completedSessions.length, icon: CheckCircle },
          {
            label: "Pending Payment",
            value: sessions.filter((s) => s.paymentStatus === "PENDING" || s.paymentStatus === "SUBMITTED").length,
            icon: AlertCircle,
          },
        ].map(({ label, value, icon: Icon }) => (
          <Card key={label}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Icon className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{value}</p>
                <p className="text-xs text-muted-foreground">{label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Book a session CTA */}
      <Card className="mb-8 bg-primary/5 border-primary/20">
        <CardContent className="p-5 flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="font-semibold">Ready to learn something new?</p>
            <p className="text-sm text-muted-foreground">
              Browse available mentors and book your next session.
            </p>
          </div>
          <Link to="/">
            <Button>Browse Mentors</Button>
          </Link>
        </CardContent>
      </Card>

      {loading && (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-28 bg-muted rounded-xl animate-pulse" />
          ))}
        </div>
      )}

      {error && (
        <div className="text-center py-10 text-destructive">
          <p>{error}</p>
          <Button variant="outline" className="mt-4" onClick={fetchSessions}>
            Retry
          </Button>
        </div>
      )}

      {!loading && !error && sessions.length === 0 && (
        <div className="text-center py-16">
          <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No sessions yet</h3>
          <p className="text-muted-foreground mb-6">
            Book your first mentoring session to get started.
          </p>
          <Link to="/">
            <Button>Find a Mentor</Button>
          </Link>
        </div>
      )}

      {/* Upcoming Sessions */}
      {!loading && upcomingSessions.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4">Upcoming Sessions</h2>
          <div className="space-y-4">
            {upcomingSessions.map((session) => (
              <SessionCard
                key={session.id}
                session={session}
                onReview={() => setReviewSession(session)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Completed Sessions */}
      {!loading && completedSessions.length > 0 && (
        <section>
          <h2 className="text-xl font-bold mb-4">Completed Sessions</h2>
          <div className="space-y-4">
            {completedSessions.map((session) => (
              <SessionCard
                key={session.id}
                session={session}
                onReview={() => setReviewSession(session)}
                showReviewButton
              />
            ))}
          </div>
        </section>
      )}

      {/* Review Dialog */}
      {reviewSession && (
        <ReviewDialog
          session={reviewSession}
          open={!!reviewSession}
          onOpenChange={(open) => { if (!open) setReviewSession(null); }}
          onSuccess={fetchSessions}
        />
      )}
    </div>
  );
}

function SessionCard({
  session,
  onReview,
  showReviewButton = false,
}: {
  session: SessionDTO;
  onReview: () => void;
  showReviewButton?: boolean;
}) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-5">
        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
          {/* Mentor avatar */}
          <div className="shrink-0">
            {session.mentorProfileImageUrl ? (
              <img
                src={session.mentorProfileImageUrl}
                alt={session.mentorName}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                {session.mentorName?.[0] ?? "M"}
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <h3 className="font-semibold">{session.mentorName}</h3>
                <p className="text-sm text-muted-foreground">{session.subjectName}</p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                <StatusBadge status={session.sessionStatus} />
                <PaymentBadge status={session.paymentStatus} />
              </div>
            </div>

            <div className="flex flex-wrap gap-4 mt-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                <span>
                  {new Date(session.sessionAt).toLocaleDateString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                <span>
                  {new Date(session.sessionAt).toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                  {session.durationMinutes ? ` (${session.durationMinutes}min)` : ""}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-2 mt-3">
              {(session.paymentStatus === "PENDING" || session.paymentStatus === "FAILED") && (
                <Link to="/payment" state={{ session }}>
                  <Button size="sm" variant="outline">
                    <AlertCircle className="h-3.5 w-3.5 mr-1.5 text-orange-500" />
                    Upload Payment
                  </Button>
                </Link>
              )}
              {session.paymentStatus === "SUBMITTED" && (
                <Button size="sm" variant="outline" disabled>
                  <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
                  Payment Under Review
                </Button>
              )}
              {session.meetingLink && session.sessionStatus === "CONFIRMED" && (
                <a href={session.meetingLink} target="_blank" rel="noreferrer">
                  <Button size="sm">
                    <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                    Join Session
                  </Button>
                </a>
              )}
              {showReviewButton && session.sessionStatus === "COMPLETED" && (
                session.reviewSubmitted ? (
                  <Button size="sm" variant="outline" disabled>
                    <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
                    Review Submitted
                  </Button>
                ) : (
                  <Button size="sm" variant="outline" onClick={onReview}>
                    <Star className="h-3.5 w-3.5 mr-1.5" />
                    Write Review
                  </Button>
                )
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
