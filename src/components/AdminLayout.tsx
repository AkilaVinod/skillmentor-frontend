import { Outlet, NavLink } from "react-router";
import { useUser } from "@clerk/clerk-react";
import {
  LayoutDashboard,
  BookOpen,
  Users,
  CalendarCheck,
  GraduationCap,
  Menu,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const navItems = [
  {
    to: "/admin",
    end: true,
    icon: LayoutDashboard,
    label: "Overview",
  },
  {
    to: "/admin/subjects",
    end: true,
    icon: BookOpen,
    label: "Subjects",
  },
  {
    to: "/admin/subjects/create",
    icon: BookOpen,
    label: "Create Subject",
  },
  {
    to: "/admin/mentors/create",
    icon: Users,
    label: "Create Mentor",
  },
  {
    to: "/admin/bookings",
    icon: CalendarCheck,
    label: "Manage Bookings",
  },
  {
    to: "/",
    icon: GraduationCap,
    label: "Dashboard",
  },
];

export default function AdminLayout() {
  const { user } = useUser();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar (desktop) */}
      <aside className="hidden md:flex w-60 flex-col border-r bg-card">
        <div className="p-5 border-b flex items-center gap-2 font-bold">
          <GraduationCap className="h-5 w-5 text-primary" />
          <span>Admin Panel</span>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map(({ to, end, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`
              }
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t">
          <p className="text-xs text-muted-foreground">
            Signed in as{" "}
            <span className="font-medium text-foreground">{user?.firstName}</span>
          </p>
        </div>
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-60 flex flex-col border-r bg-card transform transition-transform md:hidden ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-5 border-b flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold">
            <GraduationCap className="h-5 w-5 text-primary" />
            <span>Admin Panel</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(false)}
          >
            ✕
          </Button>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map(({ to, end, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`
              }
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        <div className="md:hidden flex items-center gap-3 px-4 py-3 border-b bg-card">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <span className="font-semibold text-sm">Admin Panel</span>
        </div>
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
