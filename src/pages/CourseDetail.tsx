import { useNavigate, useParams } from "react-router";
import { ArrowRight, Award, BookOpen, CheckCircle2, Clock, Users, PlayCircle, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Layout from "@/components/Layout";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import { formatPrice, LEVEL_LABELS } from "@/lib/format";
import { toast } from "sonner";

export default function CourseDetail() {
  const { id } = useParams<{ id: string }>();
  const courseId = Number(id);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const utils = trpc.useUtils();

  const { data: course, isLoading } = trpc.lms.course.useQuery(
    { id: courseId },
    { enabled: Number.isFinite(courseId) },
  );

  const enroll = trpc.lms.enroll.useMutation({
    onSuccess: async () => {
      await utils.lms.course.invalidate({ id: courseId });
      toast.success("Enrolled! Happy learning.");
      navigate(`/learn/${courseId}`);
    },
    onError: (e) => toast.error(e.message),
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="mx-auto max-w-5xl px-4 py-12">
          <div className="h-8 w-2/3 animate-pulse rounded bg-muted" />
          <div className="mt-4 h-64 animate-pulse rounded-xl bg-muted" />
        </div>
      </Layout>
    );
  }

  if (!course) {
    return (
      <Layout>
        <div className="mx-auto max-w-5xl px-4 py-24 text-center">
          <h1 className="text-2xl font-bold">Course not found</h1>
          <Button className="mt-6" onClick={() => navigate("/courses")}>Back to catalog</Button>
        </div>
      </Layout>
    );
  }

  const totalMinutes = course.lessons.reduce((s, l) => s + l.durationMin, 0);

  const handleEnroll = () => {
    if (!isAuthenticated) { navigate("/login"); return; }
    enroll.mutate({ courseId });
  };

  return (
    <Layout>
      <div className="border-b bg-muted/30">
        <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
          <div className="flex flex-wrap gap-2">
            <Badge>{course.category}</Badge>
            <Badge variant="outline">{LEVEL_LABELS[course.level] ?? course.level}</Badge>
          </div>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">{course.title}</h1>
          {course.subtitle && <p className="mt-3 max-w-2xl text-lg text-muted-foreground">{course.subtitle}</p>}
          <div className="mt-5 flex flex-wrap items-center gap-5 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5"><Users className="h-4 w-4" /> {course.enrollmentCount} enrolled</span>
            <span className="flex items-center gap-1.5"><BookOpen className="h-4 w-4" /> {course.lessons.length} lessons</span>
            <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" /> ~{Math.round(totalMinutes / 60)}h {totalMinutes % 60 > 0 ? `${totalMinutes % 60}m` : ""}</span>
            {course.quiz && <span className="flex items-center gap-1.5"><Award className="h-4 w-4" /> Certificate included</span>}
          </div>
          <p className="mt-4 text-sm">Taught by <span className="font-medium">{course.instructor?.name ?? "LearnHub Team"}</span></p>
        </div>
      </div>

      <div className="mx-auto grid max-w-5xl gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_320px]">
        <div>
          {course.thumbnail && <img src={course.thumbnail} alt={course.title} className="mb-8 aspect-video w-full rounded-xl object-cover" />}
          <h2 className="text-xl font-bold">About this course</h2>
          <p className="mt-3 whitespace-pre-line leading-relaxed text-muted-foreground">{course.description}</p>

          <h2 className="mt-10 text-xl font-bold">Curriculum</h2>
          <Card className="mt-4">
            <CardContent className="divide-y p-0">
              {course.lessons.map((lesson, i) => (
                <div key={lesson.id} className="flex items-center gap-4 px-5 py-4">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">{i + 1}</span>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium leading-snug">{lesson.title}</p>
                    <p className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                      {lesson.videoUrl ? <PlayCircle className="h-3.5 w-3.5" /> : <FileText className="h-3.5 w-3.5" />}
                      {lesson.durationMin} min
                    </p>
                  </div>
                </div>
              ))}
              {course.quiz && (
                <div className="flex items-center gap-4 px-5 py-4">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-500/10 text-amber-600"><Award className="h-4 w-4" /></span>
                  <div>
                    <p className="font-medium">{course.quiz.title}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{course.quiz.questionCount} questions · pass at {course.quiz.passScore}%</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <aside>
          <Card className="sticky top-24">
            <CardContent className="p-6">
              <p className="text-3xl font-extrabold">{formatPrice(course.priceCents)}</p>
              <p className="mt-1 text-sm text-muted-foreground">Full lifetime access</p>
              <Separator className="my-5" />
              {course.enrolled ? (
                <Button className="w-full" size="lg" onClick={() => navigate(`/learn/${course.id}`)}>Continue learning <ArrowRight className="ml-2 h-4 w-4" /></Button>
              ) : (
                <Button className="w-full" size="lg" disabled={enroll.isPending} onClick={handleEnroll}>{enroll.isPending ? "Enrolling..." : "Enroll now"}</Button>
              )}
              <ul className="mt-5 space-y-2.5 text-sm text-muted-foreground">
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-600" /> {course.lessons.length} self-paced lessons</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-600" /> Progress tracking</li>
                {course.quiz && <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-600" /> Certificate on completion</li>}
              </ul>
            </CardContent>
          </Card>
        </aside>
      </div>
    </Layout>
  );
}