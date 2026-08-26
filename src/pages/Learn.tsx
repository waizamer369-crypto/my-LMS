import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { Award, CheckCircle2, ChevronLeft, ChevronRight, Circle, PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import Layout from "@/components/Layout";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import { toEmbedUrl } from "@/lib/format";
import { toast } from "sonner";

export default function Learn() {
  const { id } = useParams<{ id: string }>();
  const courseId = Number(id);
  const navigate = useNavigate();
  useAuth({ redirectOnUnauthenticated: true });
  const utils = trpc.useUtils();

  const { data, isLoading, error } = trpc.lms.learn.useQuery(
    { courseId },
    { enabled: Number.isFinite(courseId), retry: false },
  );

  const [lessonIndex, setLessonIndex] = useState(0);
  const completeMutation = trpc.lms.completeLesson.useMutation({
    onSuccess: () => utils.lms.learn.invalidate({ courseId }),
    onError: (e) => toast.error(e.message),
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="mx-auto max-w-7xl px-4 py-10">
          <div className="h-8 w-1/2 animate-pulse rounded bg-muted" />
          <div className="mt-6 h-96 animate-pulse rounded-xl bg-muted" />
        </div>
      </Layout>
    );
  }

  if (error || !data) {
    return (
      <Layout>
        <div className="mx-auto max-w-3xl px-4 py-24 text-center">
          <h1 className="text-2xl font-bold">{error?.message ?? "Course not available"}</h1>
          <Button className="mt-6" onClick={() => navigate(`/courses/${courseId}`)}>Go to course page</Button>
        </div>
      </Layout>
    );
  }

  const lessons = data.lessons ?? [];
  const currentLesson = lessons[lessonIndex];
  const completedCount = lessons.filter((l) => l.completed).length;
  const progress = lessons.length === 0 ? 0 : Math.round((completedCount / lessons.length) * 100);
  const embedUrl = currentLesson ? toEmbedUrl(currentLesson.videoUrl) : null;

  return (
    <Layout>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <button className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground" onClick={() => navigate(`/courses/${courseId}`)}>
              <ChevronLeft className="h-4 w-4" /> {data.course.title}
            </button>
            <h1 className="mt-1 text-2xl font-bold">{currentLesson?.title}</h1>
          </div>
          <div className="w-40">
            <div className="mb-1 flex justify-between text-xs text-muted-foreground">
              <span>Progress</span><span>{progress}%</span>
            </div>
            <Progress value={progress} />
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[300px_1fr]">
          <aside className="space-y-1.5">
            {lessons.map((lesson, i) => (
              <button
                key={lesson.id}
                onClick={() => setLessonIndex(i)}
                className={`flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left text-sm transition-colors ${i === lessonIndex ? "border-primary bg-primary/5" : "hover:bg-muted"}`}
              >
                {lesson.completed ? <CheckCircle2 className="h-4 w-4 shrink-0 text-green-600" /> : <Circle className="h-4 w-4 shrink-0 text-muted-foreground/50" />}
                <span className="min-w-0 flex-1 truncate font-medium">{lesson.title}</span>
                {lesson.videoUrl ? <PlayCircle className="h-3.5 w-3.5 shrink-0 text-muted-foreground" /> : null}
              </button>
            ))}
            {data.quiz && (
              <button
                onClick={() => { if (progress < 100) { toast.info("Complete all lessons first"); return; } navigate(`/courses/${courseId}`); }}
                className="flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left text-sm hover:bg-muted"
              >
                <Award className="h-4 w-4 shrink-0 text-muted-foreground/50" />
                <span className="flex-1 truncate font-medium">{data.quiz.title}</span>
                {progress < 100 && <Badge variant="outline" className="text-[10px]">Locked</Badge>}
              </button>
            )}
          </aside>

          <div>
            {currentLesson && (
              <Card>
                <CardContent className="p-6">
                  {embedUrl && (
                    <div className="mb-6 aspect-video overflow-hidden rounded-lg bg-black">
                      <iframe src={embedUrl} className="h-full w-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen title={currentLesson.title} />
                    </div>
                  )}
                  <Badge variant="outline">Lesson {lessonIndex + 1}</Badge>
                  <span className="ml-2 text-xs text-muted-foreground">{currentLesson.durationMin} min</span>
                  <div className="prose-sm mt-4 max-w-none whitespace-pre-line leading-relaxed text-foreground/90">{currentLesson.content}</div>
                  <div className="mt-8 flex items-center justify-between border-t pt-5">
                    <Button variant="outline" disabled={lessonIndex === 0} onClick={() => setLessonIndex(lessonIndex - 1)}><ChevronLeft className="mr-1 h-4 w-4" /> Previous</Button>
                    <Button variant={currentLesson.completed ? "outline" : "default"} disabled={completeMutation.isPending} onClick={() => completeMutation.mutate({ lessonId: currentLesson.id, courseId, completed: !currentLesson.completed })}>
                      {currentLesson.completed ? <><CheckCircle2 className="mr-2 h-4 w-4 text-green-600" /> Completed</> : "Mark as complete"}
                    </Button>
                    <Button variant="outline" disabled={lessonIndex >= lessons.length - 1} onClick={() => setLessonIndex(lessonIndex + 1)}>Next <ChevronRight className="ml-1 h-4 w-4" /></Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}