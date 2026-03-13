const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8080";

type BackendUserProfileDTO = Omit<import("@/types").UserProfileDTO, "isNewUser"> & {
  isNewUser?: boolean;
  newUser?: boolean;
};

async function request<T>(
  path: string,
  options: RequestInit = {},
  token?: string | null
): Promise<T> {
  const isFormData = typeof FormData !== "undefined" && options.body instanceof FormData;
  const headers: Record<string, string> = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let message = `HTTP ${response.status}`;
    try {
      const body = await response.json();
      message = body.message || body.error || message;
    } catch {
      // ignore parse errors
    }
    throw new Error(message);
  }

  // Handle empty body (204)
  if (response.status === 204) return undefined as T;

  return response.json();
}

// ─── Mentors ────────────────────────────────────────────────────────────────

export const getMentors = (page = 0, size = 20, name?: string) => {
  const params = new URLSearchParams({ page: String(page), size: String(size) });
  if (name) params.set("name", name);
  return request<import("@/types").PageResponse<import("@/types").MentorDTO>>(
    `/api/v1/mentors?${params}`
  );
};

export const getMentorById = (id: number) =>
  request<import("@/types").MentorDTO>(`/api/v1/mentors/${id}`);

// ─── Subjects ────────────────────────────────────────────────────────────────

export const getSubjectsByMentor = (mentorId: string, token: string) =>
  request<import("@/types").SubjectDTO[]>(
    `/api/v1/subjects/mentor/${mentorId}`,
    {},
    token
  );

export const getSubjects = (token: string, page = 0, size = 20) =>
  request<import("@/types").PageResponse<import("@/types").SubjectDTO>>(
    `/api/v1/subjects?page=${page}&size=${size}`,
    {},
    token
  );

export const createSubject = (
  data: import("@/types").CreateSubjectRequest,
  token: string
) =>
  request<import("@/types").SubjectDTO>(
    "/api/v1/subjects",
    { method: "POST", body: JSON.stringify(data) },
    token
  );

// ─── Sessions ────────────────────────────────────────────────────────────────

export const getMySessions = (token: string) =>
  request<import("@/types").SessionDTO[]>("/api/v1/sessions/my-sessions", {}, token);

export const getAllSessions = (token: string, page = 0, size = 20) =>
  request<import("@/types").PageResponse<import("@/types").SessionDTO>>(
    `/api/v1/sessions?page=${page}&size=${size}`,
    {},
    token
  );

export const getAdminSessions = (
  token: string,
  options: {
    page?: number;
    size?: number;
    status?: string;
    search?: string;
    startDate?: string;
    endDate?: string;
    sortField?: string;
    sortDirection?: "asc" | "desc";
  } = {}
) => {
  const params = new URLSearchParams({
    page: String(options.page ?? 0),
    size: String(options.size ?? 20),
  });

  if (options.status && options.status !== "ALL") params.set("status", options.status);
  if (options.search) params.set("search", options.search);
  if (options.startDate) params.set("startDate", options.startDate);
  if (options.endDate) params.set("endDate", options.endDate);
  if (options.sortField) {
    params.append("sort", `${options.sortField},${options.sortDirection ?? "asc"}`);
  }

  return request<import("@/types").PageResponse<import("@/types").SessionDTO>>(
    `/api/v1/sessions?${params.toString()}`,
    {},
    token
  );
};

export const enrollSession = (
  data: import("@/types").EnrollRequest,
  token: string
) =>
  request<import("@/types").SessionDTO>(
    "/api/v1/sessions/enroll",
    { method: "POST", body: JSON.stringify(data) },
    token
  );

export const uploadPaymentProof = async (
  data: import("@/types").UploadPaymentProofRequest,
  token: string
) => {
  const formData = new FormData();
  formData.append("file", data.file);
  formData.append("paymentMethod", data.paymentMethod);
  if (data.paymentReference) formData.append("paymentReference", data.paymentReference);
  if (data.paymentNotes) formData.append("paymentNotes", data.paymentNotes);

  return request<import("@/types").SessionDTO>(
    `/api/v1/sessions/${data.sessionId}/payment-proof`,
    { method: "POST", body: formData },
    token
  );
};

export const confirmPayment = (sessionId: number, token: string) =>
  request<import("@/types").SessionDTO>(
    `/api/v1/sessions/${sessionId}/confirm-payment`,
    { method: "PATCH" },
    token
  );

export const openPaymentProof = async (sessionId: number, token: string) => {
  const response = await fetch(`${API_BASE}/api/v1/sessions/${sessionId}/payment-proof`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    let message = `HTTP ${response.status}`;
    try {
      const body = await response.json();
      message = body.message || body.error || message;
    } catch {
      // ignore parse errors
    }
    throw new Error(message);
  }

  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);
  window.open(objectUrl, "_blank", "noopener,noreferrer");
  setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);
};

export const markSessionComplete = (sessionId: number, token: string) =>
  request<import("@/types").SessionDTO>(
    `/api/v1/sessions/${sessionId}/complete`,
    { method: "PATCH" },
    token
  );

export const addMeetingLink = (
  sessionId: number,
  meetingLink: string,
  token: string
) =>
  request<import("@/types").SessionDTO>(
    `/api/v1/sessions/${sessionId}/meeting-link`,
    { method: "PATCH", body: JSON.stringify({ meetingLink }) },
    token
  );

// ─── Reviews ────────────────────────────────────────────────────────────────

export const getMentorReviews = (mentorId: number) =>
  request<import("@/types").ReviewDTO[]>(`/api/reviews/mentor/${mentorId}`);

export const createReview = (
  data: import("@/types").CreateReviewRequest,
  token: string
) =>
  request<import("@/types").ReviewDTO>(
    "/api/reviews",
    { method: "POST", body: JSON.stringify(data) },
    token
  );

// ─── User Profile ─────────────────────────────────────────────────────────────

export const getUserProfile = (token: string) =>
  request<BackendUserProfileDTO>("/api/v1/users/me", {}, token).then((profile) => ({
    ...profile,
    isNewUser: profile.isNewUser ?? profile.newUser ?? false,
  }));

export const setupUserRole = (
  role: "STUDENT" | "MENTOR",
  token: string
) =>
  request<BackendUserProfileDTO>(
    "/api/v1/users/setup",
    { method: "POST", body: JSON.stringify({ role }) },
    token
  ).then((profile) => ({
    ...profile,
    isNewUser: profile.isNewUser ?? profile.newUser ?? false,
  }));

// ─── Mentors (admin) ─────────────────────────────────────────────────────────

export const createMentor = (
  data: import("@/types").CreateMentorRequest,
  token: string
) =>
  request<import("@/types").MentorProvisionResponse>(
    "/api/v1/mentors",
    { method: "POST", body: JSON.stringify(data) },
    token
  );
