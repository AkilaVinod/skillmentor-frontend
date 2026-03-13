import { BookOpen, Users, CalendarCheck, GraduationCap } from "lucide-react";
import { Link } from "react-router";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const quickActions = [
  {
    icon: BookOpen,
    title: "Create Subject",
    description: "Add a new subject and assign it to a mentor.",
    to: "/admin/subjects/create",
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    icon: Users,
    title: "Create Mentor",
    description: "Onboard a new mentor with their full profile.",
    to: "/admin/mentors/create",
    color: "text-purple-600",
    bg: "bg-purple-50",
  },
  {
    icon: CalendarCheck,
    title: "Manage Bookings",
    description: "Review sessions, confirm payments and mark completions.",
    to: "/admin/bookings",
    color: "text-green-600",
    bg: "bg-green-50",
  },
];

export default function AdminOverviewPage() {
  return (
    <div>
      <div className="mb-8 flex items-center gap-3">
        <GraduationCap className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground text-sm">
            Manage the SkillMentor platform
          </p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {quickActions.map(({ icon: Icon, title, description, to, color, bg }) => (
          <Card key={to} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className={`h-10 w-10 rounded-xl ${bg} flex items-center justify-center mb-2`}>
                <Icon className={`h-5 w-5 ${color}`} />
              </div>
              <CardTitle className="text-base">{title}</CardTitle>
              <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Link to={to}>
                <Button variant="outline" size="sm">
                  Go to {title}
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
