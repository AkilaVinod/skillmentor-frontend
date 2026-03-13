import { Link } from "react-router";
import type { MentorDTO } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Star, BadgeCheck, Briefcase, BookOpen, Users } from "lucide-react";

interface MentorCardProps {
  mentor: MentorDTO;
}

export default function MentorCard({ mentor }: MentorCardProps) {
  const fullName = `${mentor.firstName} ${mentor.lastName}`;
  const subjectCount = mentor.subjects?.length ?? 0;

  return (
    <Card className="flex flex-col overflow-hidden hover:shadow-lg transition-shadow duration-200 group">
      <CardHeader className="p-0">
        <div className="relative bg-gradient-to-br from-primary/10 to-primary/5 p-6 flex items-start gap-4">
          <div className="relative shrink-0">
            {mentor.profileImageUrl ? (
              <img
                src={mentor.profileImageUrl}
                alt={fullName}
                className="w-16 h-16 rounded-full object-cover border-2 border-background shadow-sm"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xl border-2 border-background shadow-sm">
                {mentor.firstName?.[0]}
                {mentor.lastName?.[0]}
              </div>
            )}
            {mentor.isCertified && (
              <BadgeCheck className="absolute -bottom-1 -right-1 h-5 w-5 text-primary fill-background" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-base leading-tight group-hover:text-primary transition-colors">
              {fullName}
            </h3>
            {mentor.title && (
              <p className="text-sm text-muted-foreground mt-0.5 truncate">{mentor.title}</p>
            )}
            {mentor.company && (
              <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                <Briefcase className="h-3 w-3 shrink-0" />
                <span className="truncate">{mentor.company}</span>
              </div>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 p-4 space-y-3">
        {mentor.bio && (
          <p className="text-sm text-muted-foreground line-clamp-2">{mentor.bio}</p>
        )}

        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
          {mentor.averageRating && mentor.averageRating > 0 ? (
            <div className="flex items-center gap-1">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              <span className="font-medium text-foreground">{mentor.averageRating.toFixed(1)}</span>
              {mentor.totalReviews && (
                <span>({mentor.totalReviews} reviews)</span>
              )}
            </div>
          ) : null}

          {mentor.experienceYears > 0 && (
            <div className="flex items-center gap-1">
              <span>{mentor.experienceYears}y exp</span>
            </div>
          )}
        </div>

        {subjectCount > 0 && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <BookOpen className="h-3.5 w-3.5 shrink-0" />
            <span>{subjectCount} subject{subjectCount !== 1 ? "s" : ""}</span>
          </div>
        )}

        {mentor.totalEnrollments != null && mentor.totalEnrollments > 0 && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Users className="h-3.5 w-3.5 shrink-0" />
            <span>{mentor.totalEnrollments} students taught</span>
          </div>
        )}

        {mentor.subjects && mentor.subjects.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {mentor.subjects.slice(0, 3).map((s) => (
              <Badge key={s.id} variant="secondary" className="text-xs">
                {s.subjectName}
              </Badge>
            ))}
            {mentor.subjects.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{mentor.subjects.length - 3} more
              </Badge>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Link to={`/mentors/${mentor.id}`} className="w-full">
          <Button className="w-full" size="sm">
            View Profile
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
