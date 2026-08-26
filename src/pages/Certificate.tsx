import { useParams, useNavigate } from "react-router";
import { Award, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import Layout from "@/components/Layout";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";

export default function Certificate() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  useAuth({ redirectOnUnauthenticated: true });

  const { data, isLoading, error } = trpc.lms.certificate.useQuery(
    { courseId: Number(courseId) },
    { enabled: Number.isFinite(Number(courseId)), retry: false },
  );

  if (isLoading) {
    return (
      <Layout>
        <div className="mx-auto max-w-3xl px-4 py-24">
          <div className="h-96 animate-pulse rounded-xl bg-muted" />
        </div>
      </Layout>
    );
  }

  if (error || !data) {
    return (
      <Layout>
        <div className="mx-auto max-w-3xl px-4 py-24 text-center">
          <h1 className="text-2xl font-bold">Certificate not found</h1>
          <Button className="mt-6" onClick={() => navigate("/dashboard")}>Back to My Learning</Button>
        </div>
      </Layout>
    );
  }

  const { course, user } = data;

  return (
    <Layout>
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
        <div className="mb-6 flex justify-end print:hidden">
          <Button variant="outline" onClick={() => window.print()}>
            <Printer className="mr-2 h-4 w-4" /> Print / Save as PDF
          </Button>
        </div>
        <div className="relative overflow-hidden rounded-2xl border-8 border-double border-primary/30 bg-card p-10 text-center sm:p-16">
          <div className="pointer-events-none absolute -left-16 -top-16 h-48 w-48 rounded-full bg-primary/5" />
          <div className="pointer-events-none absolute -bottom-16 -right-16 h-48 w-48 rounded-full bg-primary/5" />
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/10 text-amber-600">
            <Award className="h-8 w-8" />
          </span>
          <p className="mt-6 text-sm font-medium uppercase tracking-[0.3em] text-muted-foreground">Certificate of Completion</p>
          <p className="mt-8 text-sm text-muted-foreground">This certifies that</p>
          <h1 className="mt-2 text-4xl font-extrabold tracking-tight">{user?.name ?? "Learner"}</h1>
          <p className="mt-8 text-sm text-muted-foreground">has successfully completed the course</p>
          <h2 className="mx-auto mt-2 max-w-xl text-2xl font-bold text-primary">{course.title}</h2>
          <div className="mx-auto mt-12 flex max-w-md items-end justify-between text-sm">
            <div>
              <p className="border-t border-foreground/30 pt-2 font-medium">{course.instructor?.name ?? "LearnHub"}</p>
              <p className="text-xs text-muted-foreground">Instructor</p>
            </div>
            <div>
              <p className="border-t border-foreground/30 pt-2 font-medium">
                {new Date(data.issuedAt).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}
              </p>
              <p className="text-xs text-muted-foreground">Date issued</p>
            </div>
          </div>
          <p className="mt-10 text-xs text-muted-foreground">Certificate ID: LH-{String(data.id).padStart(6, "0")} · LearnHub</p>
        </div>
      </div>
    </Layout>
  );
}