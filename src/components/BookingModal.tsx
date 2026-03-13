import { useState } from "react";
import { useAuth, useUser, SignInButton } from "@clerk/clerk-react";
import { useNavigate } from "react-router";
import { enrollSession } from "@/lib/api";
import type { MentorDTO, SubjectDTO } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarDays, Clock, AlertCircle } from "lucide-react";

interface BookingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mentor: MentorDTO;
  preselectedSubject?: SubjectDTO | null;
}

export default function BookingModal({
  open,
  onOpenChange,
  mentor,
  preselectedSubject,
}: BookingModalProps) {
  const { getToken, isSignedIn } = useAuth();
  const { user } = useUser();
  const navigate = useNavigate();
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(
    preselectedSubject ? String(preselectedSubject.id) : ""
  );
  const [sessionDate, setSessionDate] = useState("");
  const [sessionTime, setSessionTime] = useState("");
  const [duration, setDuration] = useState("60");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const subjects = mentor.subjects ?? [];
  const availabilitySummary = (mentor.availabilities ?? [])
    .map((slot) => {
      const day = slot.dayOfWeek.slice(0, 1) + slot.dayOfWeek.slice(1).toLowerCase();
      return `${day} ${slot.startTime.slice(0, 5)}-${slot.endTime.slice(0, 5)}`;
    })
    .join(", ");

  // Get tomorrow as min date
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split("T")[0];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!selectedSubjectId) {
      setError("Please select a subject.");
      return;
    }
    if (!sessionDate || !sessionTime) {
      setError("Please select a date and time.");
      return;
    }

    const sessionAt = new Date(`${sessionDate}T${sessionTime}`);
    if (sessionAt <= new Date()) {
      setError("Session date must be in the future.");
      return;
    }

    try {
      setLoading(true);
      const token = await getToken();
      if (!token) throw new Error("Not authenticated");

      const session = await enrollSession(
        {
          mentorId: mentor.mentorId,
          subjectId: Number(selectedSubjectId),
          sessionAt: sessionAt.toISOString(),
          durationMinutes: Number(duration),
        },
        token
      );
      handleClose();
      navigate("/payment", { state: { session } });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to book session");
    } finally {
      setLoading(false);
    }
  }

  function handleClose() {
    if (!loading) {
      setError(null);
      setSessionDate("");
      setSessionTime("");
      setDuration("60");
      if (!preselectedSubject) setSelectedSubjectId("");
      onOpenChange(false);
    }
  }

  if (!isSignedIn) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Sign in required</DialogTitle>
            <DialogDescription>
              You need to sign in to book a session with {mentor.firstName}.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center pt-4">
            <SignInButton mode="modal">
              <Button onClick={handleClose}>Sign In to Continue</Button>
            </SignInButton>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Book a Session</DialogTitle>
          <DialogDescription>
            Schedule a one-on-one session with{" "}
            <span className="font-medium text-foreground">
              {mentor.firstName} {mentor.lastName}
            </span>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            {/* Subject */}
            <div className="space-y-1.5">
              <Label>Subject</Label>
              {subjects.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No subjects available for this mentor.
                </p>
              ) : (
                <Select
                  value={selectedSubjectId}
                  onValueChange={setSelectedSubjectId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map((s) => (
                      <SelectItem key={s.id} value={String(s.id)}>
                        {s.subjectName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Mentor info */}
            <div className="rounded-lg bg-muted/50 p-3 text-sm space-y-1">
              <p className="font-medium">
                {mentor.firstName} {mentor.lastName}
              </p>
              {mentor.title && (
                <p className="text-muted-foreground">{mentor.title}</p>
              )}
              {user && (
                <p className="text-muted-foreground text-xs mt-1">
                  Booking as: {user.fullName ?? user.emailAddresses[0]?.emailAddress}
                </p>
              )}
              {availabilitySummary && (
                <p className="text-muted-foreground text-xs">
                  Availability: {availabilitySummary}
                </p>
              )}
            </div>

            {/* Date */}
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5">
                <CalendarDays className="h-3.5 w-3.5" />
                Date
              </Label>
              <Input
                type="date"
                min={minDate}
                value={sessionDate}
                onChange={(e) => setSessionDate(e.target.value)}
                required
              />
            </div>

            {/* Time */}
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                Time
              </Label>
              <Input
                type="time"
                value={sessionTime}
                onChange={(e) => setSessionTime(e.target.value)}
                required
              />
            </div>

            {/* Duration */}
            <div className="space-y-1.5">
              <Label>Duration</Label>
              <Select value={duration} onValueChange={setDuration}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="60">1 hour</SelectItem>
                  <SelectItem value="90">1.5 hours</SelectItem>
                  <SelectItem value="120">2 hours</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {error && (
              <div className="flex items-start gap-2 text-sm text-destructive bg-destructive/10 rounded-lg p-3">
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="flex-1"
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={loading || subjects.length === 0}
              >
                {loading ? "Booking..." : "Continue to Payment"}
              </Button>
            </div>
          </form>
      </DialogContent>
    </Dialog>
  );
}
