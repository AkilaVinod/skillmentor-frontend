import { useEffect, useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import { Link } from "react-router";
import { getSubjects } from "@/lib/api";
import type { PageResponse, SubjectDTO } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { BookOpen, Plus, RefreshCw } from "lucide-react";

export default function ManageSubjectsPage() {
  const { getToken } = useAuth();
  const [subjects, setSubjects] = useState<SubjectDTO[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let mounted = true;

    async function loadSubjects() {
      try {
        setLoading(true);
        setError(null);
        const token = await getToken();
        if (!token) throw new Error("Not authenticated");

        const data: PageResponse<SubjectDTO> = await getSubjects(token, page, 10);
        if (!mounted) return;
        setSubjects(data.content);
        setTotalPages(data.totalPages);
      } catch (err: unknown) {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : "Failed to load subjects");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadSubjects();

    return () => {
      mounted = false;
    };
  }, [getToken, page, refreshKey]);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <BookOpen className="h-6 w-6 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">Subjects</h1>
            <p className="text-sm text-muted-foreground">
              Review existing subjects and the mentors assigned to them
            </p>
          </div>
        </div>

        <Link to="/admin/subjects/create">
          <Button>
            <Plus className="h-4 w-4 mr-1.5" />
            New Subject
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Subject Catalogue</CardTitle>
          <Button variant="outline" size="sm" onClick={() => setRefreshKey((current) => current + 1)}>
            <RefreshCw className="h-4 w-4 mr-1.5" />
            Refresh
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Mentor</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Enrolled</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading && (
                  <TableRow>
                    <TableCell colSpan={4} className="py-12 text-center text-muted-foreground">
                      Loading subjects...
                    </TableCell>
                  </TableRow>
                )}
                {!loading && error && (
                  <TableRow>
                    <TableCell colSpan={4} className="py-12 text-center text-destructive">
                      {error}
                    </TableCell>
                  </TableRow>
                )}
                {!loading && !error && subjects.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="py-12 text-center text-muted-foreground">
                      No subjects found
                    </TableCell>
                  </TableRow>
                )}
                {!loading &&
                  !error &&
                  subjects.map((subject) => (
                    <TableRow key={subject.id}>
                      <TableCell className="font-medium">{subject.subjectName}</TableCell>
                      <TableCell>{subject.mentorName ?? "—"}</TableCell>
                      <TableCell className="max-w-md truncate text-muted-foreground">
                        {subject.description ?? "—"}
                      </TableCell>
                      <TableCell>{subject.enrollmentCount ?? 0}</TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {totalPages > 1 && (
        <div className="mt-6 flex justify-center gap-2">
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
    </div>
  );
}
