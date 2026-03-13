export interface CardElement {
  title: string;
  description: string;
}

export interface SubjectDTO {
  id: number;
  subjectName: string;
  description: string;
  courseImageUrl?: string;
  mentorId?: string;
  mentorName?: string;
  enrollmentCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface MentorAvailabilityDTO {
  dayOfWeek:
    | "MONDAY"
    | "TUESDAY"
    | "WEDNESDAY"
    | "THURSDAY"
    | "FRIDAY"
    | "SATURDAY"
    | "SUNDAY";
  startTime: string;
  endTime: string;
}

export interface MentorDTO {
  id: number;
  mentorId: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  title?: string;
  profession?: string;
  company?: string;
  experienceYears: number;
  bio?: string;
  profileImageUrl?: string;
  averageRating?: number;
  totalReviews?: number;
  totalEnrollments?: number;
  totalStudentsTaught?: number;
  positiveReviewPercentage?: number;
  isCertified?: boolean;
  startYear?: string;
  subjects?: SubjectDTO[];
  availabilities?: MentorAvailabilityDTO[];
  createdAt?: string;
  updatedAt?: string;
}

export interface SessionDTO {
  id: number;
  studentName?: string;
  mentorId?: number;
  mentorClerkUserId?: string;
  mentorName?: string;
  mentorProfileImageUrl?: string;
  subjectId?: number;
  subjectName?: string;
  sessionAt: string;
  durationMinutes?: number;
  sessionStatus: "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED";
  paymentStatus: "PENDING" | "SUBMITTED" | "PAID" | "FAILED";
  paymentMethod?: string;
  paymentReference?: string;
  paymentNotes?: string;
  paymentProofFileName?: string;
  hasPaymentProof?: boolean;
  paymentSubmittedAt?: string;
  meetingLink?: string;
  sessionNotes?: string;
  reviewId?: number;
  reviewSubmitted?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ReviewDTO {
  id: number;
  rating: number;
  comment?: string;
  sessionId?: number;
  mentorId?: number;
  studentId?: number;
  studentName?: string;
  createdAt?: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export interface ApiError {
  message: string;
  status?: number;
}

export interface EnrollRequest {
  mentorId: string;
  subjectId: number;
  sessionAt: string;
  durationMinutes?: number;
}

export interface UploadPaymentProofRequest {
  sessionId: number;
  paymentMethod: string;
  paymentReference?: string;
  paymentNotes?: string;
  file: File;
}

export interface CreateMentorRequest {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  title?: string;
  profession?: string;
  company?: string;
  experienceYears?: number;
  bio?: string;
  profileImageUrl?: string;
  isCertified?: boolean;
  startYear?: string;
}

export interface MentorProvisionResponse {
  mentor: MentorDTO;
  clerkUserId: string;
  loginEmail: string;
  temporaryPassword: string;
}

export interface CreateSubjectRequest {
  subjectName: string;
  description?: string;
  courseImageUrl?: string;
  mentorId: string;
}

export interface CreateReviewRequest {
  sessionId: number;
  rating: number;
  comment?: string;
}

// ─── User Profile ─────────────────────────────────────────────────────────────

export type AppUserRole = "STUDENT" | "MENTOR" | "ADMIN";

export interface UserProfileDTO {
  id?: number;
  clerkUserId: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  role: AppUserRole | null;
  isNewUser: boolean;
  newUser?: boolean;
  createdAt?: string;
}
