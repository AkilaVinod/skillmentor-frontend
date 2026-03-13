import { useState, useEffect } from "react";
import { useParams, Link } from "react-router";
import { getMentorById, getMentorReviews } from "@/lib/api";
import type { MentorDTO, ReviewDTO, SubjectDTO } from "@/types";
import BookingModal from "@/components/BookingModal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  BadgeCheck,
  Briefcase,
  Building2,
  Star,
  Users,
  BookOpen,
  Calendar,
  Clock,
  ExternalLink,
} from "lucide-react";

export default function MentorProfilePage() {
  const { mentorId } = useParams<{ mentorId: string }>();
  const [mentor, setMentor] = useState<MentorDTO | null>(null);
  const [reviews, setReviews] = useState<ReviewDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<SubjectDTO | null>(null);

  useEffect(() => {
    if (!mentorId) return;
    setLoading(true);
    setError(null);

    getMentorById(Number(mentorId))
      .then((data) => {
        setMentor(data);
        return getMentorReviews(data.id);
      })
      .then(setReviews)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [mentorId]);

  function openBookingWithSubject(subject: SubjectDTO) {
    setSelectedSubject(subject);
    setBookingOpen(true);
  }

  function openBooking() {
    setSelectedSubject(null);
    setBookingOpen(true);
  }

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/4" />
          <div className="h-48 bg-muted rounded-xl" />
          <div className="grid grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !mentor) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12 text-center">
        <p className="text-destructive mb-4">{error ?? "Mentor not found"}</p>
        <Link to="/">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Mentors
          </Button>
        </Link>
      </div>
    );
  }

  const fullName = `${mentor.firstName} ${mentor.lastName}`;
  const averageRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : mentor.averageRating ?? 0;
  const availabilitySummary = (mentor.availabilities ?? []).map((slot) => {
    const day = slot.dayOfWeek.slice(0, 1) + slot.dayOfWeek.slice(1).toLowerCase();
    return `${day} ${slot.startTime.slice(0, 5)}-${slot.endTime.slice(0, 5)}`;
  });

  return (
    <div className="bg-background min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back link */}
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Mentors
        </Link>

        {/* ── Profile Header ─────────────────────────────────── */}
        <div className="bg-gradient-to-br from-primary/5 to-background border rounded-2xl p-6 sm:p-8 mb-8">
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            {/* Avatar */}
            <div className="relative shrink-0">
              {mentor.profileImageUrl ? (
                <img
                  src={mentor.profileImageUrl}
                  alt={fullName}
                  className="w-28 h-28 rounded-2xl object-cover border-2 border-border shadow-md"
                />
              ) : (
                <div className="w-28 h-28 rounded-2xl bg-primary/15 flex items-center justify-center text-primary font-bold text-4xl border-2 border-border shadow-md">
                  {mentor.firstName?.[0]}{mentor.lastName?.[0]}
                </div>
              )}
              {mentor.isCertified && (
                <div className="absolute -bottom-2 -right-2 bg-background rounded-full p-0.5 shadow">
                  <BadgeCheck className="h-6 w-6 text-primary" />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-2xl sm:text-3xl font-bold">{fullName}</h1>
                {mentor.isCertified && (
                  <Badge className="bg-primary/10 text-primary border-primary/20">
                    Certified
                  </Badge>
                )}
              </div>

              {mentor.title && (
                <p className="text-muted-foreground text-base mb-2">{mentor.title}</p>
              )}

              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                {mentor.company && (
                  <div className="flex items-center gap-1.5">
                    <Building2 className="h-4 w-4" />
                    <span>{mentor.company}</span>
                  </div>
                )}
                {mentor.profession && (
                  <div className="flex items-center gap-1.5">
                    <Briefcase className="h-4 w-4" />
                    <span>{mentor.profession}</span>
                  </div>
                )}
                {mentor.startYear && (
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4" />
                    <span>Since {mentor.startYear}</span>
                  </div>
                )}
              </div>

              {averageRating > 0 && (
                <div className="flex items-center gap-1.5 mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-4 w-4 ${
                        star <= Math.round(averageRating)
                          ? "fill-amber-400 text-amber-400"
                          : "text-muted-foreground"
                      }`}
                    />
                  ))}
                  <span className="text-sm font-medium ml-1">
                    {averageRating.toFixed(1)}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    ({mentor.totalReviews ?? reviews.length} reviews)
                  </span>
                </div>
              )}

              <Button onClick={openBooking} size="lg">
                Schedule Session
              </Button>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left column */}
          <div className="lg:col-span-2 space-y-8">
            {/* About */}
            {mentor.bio && (
              <Card>
                <CardHeader>
                  <CardTitle>About</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">{mentor.bio}</p>
                </CardContent>
              </Card>
            )}

            {availabilitySummary.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Availability</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {availabilitySummary.map((slot) => (
                      <Badge key={slot} variant="secondary">
                        {slot}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Subjects */}
            {mentor.subjects && mentor.subjects.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Subjects Taught
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {mentor.subjects.map((subject) => (
                      <div
                        key={subject.id}
                        className="border rounded-xl overflow-hidden hover:shadow-md transition-shadow"
                      >
                        {subject.courseImageUrl && (
                          <img
                            src={subject.courseImageUrl}
                            alt={subject.subjectName}
                            className="w-full h-32 object-cover"
                          />
                        )}
                        <div className="p-4">
                          <h3 className="font-semibold mb-1">{subject.subjectName}</h3>
                          {subject.description && (
                            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                              {subject.description}
                            </p>
                          )}
                          <div className="flex items-center justify-between">
                            {subject.enrollmentCount != null && (
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Users className="h-3.5 w-3.5" />
                                <span>{subject.enrollmentCount} enrolled</span>
                              </div>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openBookingWithSubject(subject)}
                              className="ml-auto"
                            >
                              Book This Subject
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Reviews */}
            {reviews.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5" />
                    Student Reviews
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {reviews.map((review, idx) => (
                    <div key={review.id}>
                      {idx > 0 && <Separator className="mb-4" />}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-sm">
                              {review.studentName ?? "Anonymous"}
                            </p>
                            {review.createdAt && (
                              <p className="text-xs text-muted-foreground">
                                {new Date(review.createdAt).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`h-3.5 w-3.5 ${
                                  star <= review.rating
                                    ? "fill-amber-400 text-amber-400"
                                    : "text-muted-foreground"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        {review.comment && (
                          <p className="text-sm text-muted-foreground">
                            {review.comment}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right sidebar */}
          <div className="space-y-6">
            {/* Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {mentor.experienceYears > 0 && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      Experience
                    </div>
                    <span className="font-semibold">
                      {mentor.experienceYears}y
                    </span>
                  </div>
                )}
                {mentor.totalEnrollments != null && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="h-4 w-4" />
                      Total Enrollments
                    </div>
                    <span className="font-semibold">{mentor.totalEnrollments}</span>
                  </div>
                )}
                {mentor.totalStudentsTaught != null && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="h-4 w-4" />
                      Students Taught
                    </div>
                    <span className="font-semibold">{mentor.totalStudentsTaught}</span>
                  </div>
                )}
                {mentor.subjects && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <BookOpen className="h-4 w-4" />
                      Subjects
                    </div>
                    <span className="font-semibold">{mentor.subjects.length}</span>
                  </div>
                )}
                {averageRating > 0 && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Star className="h-4 w-4" />
                      Rating
                    </div>
                    <span className="font-semibold">{averageRating.toFixed(1)} / 5</span>
                  </div>
                )}
                {mentor.positiveReviewPercentage != null && mentor.totalReviews ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Star className="h-4 w-4" />
                      Positive Reviews
                    </div>
                    <span className="font-semibold">{mentor.positiveReviewPercentage}%</span>
                  </div>
                ) : null}
              </CardContent>
            </Card>

            {/* Contact / Book */}
            <Card className="bg-primary text-primary-foreground">
              <CardContent className="p-6 space-y-3">
                <h3 className="font-bold text-lg">Ready to learn?</h3>
                <p className="text-primary-foreground/80 text-sm">
                  Book a personalised one-on-one session with {mentor.firstName} today.
                </p>
                <Button
                  variant="secondary"
                  className="w-full"
                  onClick={openBooking}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Schedule Session
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Booking modal */}
      {bookingOpen && (
        <BookingModal
          open={bookingOpen}
          onOpenChange={setBookingOpen}
          mentor={mentor}
          preselectedSubject={selectedSubject}
        />
      )}
    </div>
  );
}
