import { useState, useEffect } from "react";
import { getMentors } from "@/lib/api";
import type { MentorDTO, PageResponse } from "@/types";
import MentorCard from "@/components/MentorCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, GraduationCap, Users, Star, BookOpen } from "lucide-react";

export default function HomePage() {
  const [mentors, setMentors] = useState<MentorDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    getMentors(page, 12, search || undefined)
      .then((data: PageResponse<MentorDTO>) => {
        if (!cancelled) {
          setMentors(data.content);
          setTotalPages(data.totalPages);
        }
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [search, page]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setPage(0);
    setSearch(searchInput);
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary/5 via-background to-background border-b py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-1.5 text-sm font-medium mb-6">
            <GraduationCap className="h-4 w-4" />
            Online Mentoring Platform
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
            Learn from the{" "}
            <span className="text-primary">best mentors</span>
          </h1>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Connect with expert mentors for personalised one-on-one sessions.
            Browse profiles, book sessions, and accelerate your learning journey.
          </p>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-8 mb-10 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Users className="h-4 w-4 text-primary" />
              <span>Expert Mentors</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <BookOpen className="h-4 w-4 text-primary" />
              <span>Specialised Subjects</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Star className="h-4 w-4 text-primary" />
              <span>Verified Reviews</span>
            </div>
          </div>

          {/* Search */}
          <form onSubmit={handleSearch} className="max-w-md mx-auto flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search mentors by name..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button type="submit">Search</Button>
          </form>
        </div>
      </section>

      {/* Mentors grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold">
              {search ? `Results for "${search}"` : "Available Mentors"}
            </h2>
            {!loading && (
              <p className="text-muted-foreground text-sm mt-1">
                {mentors.length} mentor{mentors.length !== 1 ? "s" : ""} found
              </p>
            )}
          </div>
          {search && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => { setSearch(""); setSearchInput(""); setPage(0); }}
            >
              Clear search
            </Button>
          )}
        </div>

        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="h-64 rounded-xl bg-muted animate-pulse"
              />
            ))}
          </div>
        )}

        {error && (
          <div className="text-center py-16">
            <p className="text-destructive mb-4">Failed to load mentors: {error}</p>
            <Button onClick={() => setSearch(search)}>Retry</Button>
          </div>
        )}

        {!loading && !error && mentors.length === 0 && (
          <div className="text-center py-16">
            <GraduationCap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground text-lg">No mentors found</p>
            {search && (
              <Button
                variant="ghost"
                className="mt-2"
                onClick={() => { setSearch(""); setSearchInput(""); }}
              >
                Show all mentors
              </Button>
            )}
          </div>
        )}

        {!loading && !error && mentors.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {mentors.map((mentor) => (
              <MentorCard key={mentor.id} mentor={mentor} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-10">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 0}
              onClick={() => setPage((p) => p - 1)}
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
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        )}
      </section>
    </div>
  );
}
