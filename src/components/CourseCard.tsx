import { Link } from "react-router";
import { Users, BookOpen } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatPrice, LEVEL_LABELS } from "@/lib/format";

export type CourseCardData = {
  id: number;
  title: string;
  subtitle?: string | null;
  category: string;
  level: string;
  priceCents: number;
  thumbnail?: string | null;
  instructorName?: string | null;
  lessonCount?: number;
  enrollmentCount?: number;
};

export default function CourseCard({ course }: { course: CourseCardData }) {
  return (
    <Link to={`/courses/${course.id}`} className="group block">
      <Card className="h-full overflow-hidden transition-all hover:shadow-lg hover:-translate-y-0.5">
        <div className="relative aspect-video overflow-hidden bg-muted">
          {course.thumbnail ? (
            <img
              src={course.thumbnail}
              alt={course.title}
              className="h-full w-full object-cover transition-transform group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <BookOpen className="h-10 w-10 text-muted-foreground/40" />
            </div>
          )}
          <Badge className="absolute left-3 top-3" variant="secondary">
            {course.category}
          </Badge>
        </div>
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold leading-snug line-clamp-2 group-hover:text-primary">
              {course.title}
            </h3>
          </div>
          {course.subtitle && (
            <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
              {course.subtitle}
            </p>
          )}
          <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
            <Badge variant="outline">{LEVEL_LABELS[course.level] ?? course.level}</Badge>
            {typeof course.lessonCount === "number" && (
              <span className="flex items-center gap-1">
                <BookOpen className="h-3.5 w-3.5" /> {course.lessonCount} lessons
              </span>
            )}
            {typeof course.enrollmentCount === "number" && (
              <span className="flex items-center gap-1">
                <Users className="h-3.5 w-3.5" /> {course.enrollmentCount}
              </span>
            )}
          </div>
          <div className="mt-3 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {course.instructorName ?? "LearnHub Team"}
            </span>
            <span className={`font-bold ${course.priceCents === 0 ? "text-green-600" : ""}`}>
              {formatPrice(course.priceCents)}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
