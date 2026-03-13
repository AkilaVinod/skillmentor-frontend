import { Navigate, Route, Routes } from "react-router";
import { SignedIn, SignedOut, RedirectToSignIn, useUser } from "@clerk/clerk-react";
import { useUserRole } from "@/contexts/UserRoleContext";
import Layout from "./Layout";
import AdminLayout from "./components/AdminLayout";

// Student pages
import HomePage from "./pages/HomePage";
import DashboardPage from "./pages/DashboardPage";
import MentorProfilePage from "./pages/MentorProfilePage";
import PaymentPage from "./pages/PaymentPage";

// Admin pages
import AdminOverviewPage from "./pages/admin/AdminOverviewPage";
import ManageSubjectsPage from "./pages/admin/ManageSubjectsPage";
import CreateSubjectPage from "./pages/admin/CreateSubjectPage";
import CreateMentorPage from "./pages/admin/CreateMentorPage";
import ManageBookingsPage from "./pages/admin/ManageBookingsPage";

/** Wraps a route: must be signed in while the backend profile is loading. */
function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const { loading } = useUserRole();

  return (
    <>
      <SignedIn>
        {loading ? (
          <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
          </div>
        ) : (
          children
        )}
      </SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
}

function AdminRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoaded, user } = useUser();
  const { loading } = useUserRole();
  const isAdmin = user?.publicMetadata?.role === "admin";

  return (
    <>
      <SignedIn>
        {!isLoaded || loading ? (
          <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
          </div>
        ) : isAdmin ? (
          children
        ) : (
          <Navigate to="/dashboard" replace />
        )}
      </SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
}

function App() {
  return (
    <Routes>
      {/* ── Public + Student routes ─────────────────────────────────── */}
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="mentors/:mentorId" element={<MentorProfilePage />} />

        <Route
          path="dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="payment"
          element={
            <ProtectedRoute>
              <PaymentPage />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* ── Admin routes ──────────────────────────────────────────────── */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }
      >
        <Route index element={<AdminOverviewPage />} />
        <Route path="subjects" element={<ManageSubjectsPage />} />
        <Route path="subjects/create" element={<CreateSubjectPage />} />
        <Route path="mentors/create" element={<CreateMentorPage />} />
        <Route path="bookings" element={<ManageBookingsPage />} />
      </Route>

      {/* ── 404 ───────────────────────────────────────────────────────── */}
      <Route
        path="*"
        element={
          <div className="flex flex-col items-center justify-center min-h-screen gap-4">
            <h1 className="text-6xl font-bold text-muted-foreground">404</h1>
            <p className="text-muted-foreground">Page not found</p>
            <a href="/" className="text-primary underline">
              Go home
            </a>
          </div>
        }
      />
    </Routes>
  );
}

export default App;
