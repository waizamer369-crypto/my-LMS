import { Link, useNavigate } from "react-router";
import { ArrowRight, Award, BookOpen, Users, Sparkles, TrendingUp, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import { motion, useScroll, useTransform } from "framer-motion";
import { useEffect, useRef } from "react";
import { AnimatedCounter } from "@/lib/animations";

/* ---------- Scroll-reveal primitives ---------- */

function Reveal({
  children,
  delay = 0,
  y = 28,
}: {
  children: React.ReactNode;
  delay?: number;
  y?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
    >
      {children}
    </motion.div>
  );
}

function RevealStagger({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-80px" }}
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: 0.1 } },
      }}
    >
      {children}
    </motion.div>
  );
}

function RevealItem({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 24 },
        show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.21, 0.47, 0.32, 0.98] } },
      }}
    >
      {children}
    </motion.div>
  );
}

/* ---------- Minimal public nav (no sidebar, no account menu) ---------- */

function LandingNav() {
  return (
    <header className="sticky top-0 z-30 border-b bg-white/70 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6">
        <Link to="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-sky-500 text-white">
            <GraduationCap className="h-5 w-5" />
          </span>
          <span className="text-lg font-bold">LearnHub</span>
        </Link>
        <div className="flex items-center gap-2">
          <Link to="/login">
            <Button variant="ghost">Sign in</Button>
          </Link>
          <Link to="/signup">
            <Button className="bg-gradient-to-r from-indigo-600 to-sky-500 hover:opacity-90">
              Get started
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}

export default function Landing() {
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();

  // If someone's already logged in, this page isn't for them — send them in.
  useEffect(() => {
    if (!isLoading && user) {
      navigate("/dashboard", { replace: true });
    }
  }, [isLoading, user, navigate]);

  const { data: stats } = trpc.lms.stats.useQuery();
  const { data: courses, isLoading: coursesLoading } = trpc.lms.courses.useQuery({});
  const { data: categories } = trpc.lms.categories.useQuery();

  const featured = courses?.slice(0, 6) ?? [];

  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  // ZOOM-OUT CONCEPT: the mockup starts large/close (like the camera is zoomed
  // in), then continuously scales down and drifts downward as you scroll —
  // one continuous "pull back and scroll down" motion, not a pop-then-shrink.
  // Text arrives in staggered stages tied to that same progress. The stats
  // section only starts entering once this settle is basically done (~0.85+).
  // Header block: shrinks continuously as you scroll, capped at a floor
  // (0.55) so it never gets illegibly tiny — it just settles small. Stays
  // fully opaque while shrinking, only fading out right at the tail end.
  const openTextScale = useTransform(scrollYProgress, [0, 0.3], [1, 0.55]);
  const openTextOpacity = useTransform(scrollYProgress, [0.24, 0.34], [1, 0]);
  const openTextY = useTransform(scrollYProgress, [0, 0.3], [0, -20]);

  // Mockup zoom-out + side text now pick up right after the header finishes
  // shrinking (~0.3) instead of overlapping with it.
  const artOpacity = useTransform(scrollYProgress, [0.28, 0.4], [0, 1]);
  // Starts big & close (1.35 = zoomed in), continuously pulls back to 0.8.
  const artScale = useTransform(scrollYProgress, [0.3, 0.85], [1.35, 0.8]);
  const artX = useTransform(scrollYProgress, [0.5, 0.85], ["0%", "26%"]);
  // Continuous downward drift across the *entire* zoom-out — sells
  // "scrolling down" alongside "zooming out".
  const artY = useTransform(scrollYProgress, [0.3, 0.85], ["-8%", "18%"]);
  const artRadius = useTransform(scrollYProgress, [0.5, 0.85], [0, 24]);

  // Feature copy arrives in three staggered beats as the mockup docks —
  // badge first, then heading, then paragraph.
  const featureBadgeOpacity = useTransform(scrollYProgress, [0.55, 0.65], [0, 1]);
  const featureBadgeX = useTransform(scrollYProgress, [0.55, 0.65], [-24, 0]);
  const featureHeadingOpacity = useTransform(scrollYProgress, [0.62, 0.74], [0, 1]);
  const featureHeadingX = useTransform(scrollYProgress, [0.62, 0.74], [-24, 0]);
  const featureParaOpacity = useTransform(scrollYProgress, [0.69, 0.81], [0, 1]);
  const featureParaX = useTransform(scrollYProgress, [0.69, 0.81], [-24, 0]);


  const glowOpacity = useTransform(scrollYProgress, [0, 0.4], [1, 0.3]);

  // Don't flash the landing page for a split second while we check auth.
  if (isLoading || user) {
    return <div className="min-h-screen bg-white" />;
  }

  return (
    <div className="min-h-screen bg-white">
      <LandingNav />

      {/* ---------- Hero → feature morph (pinned for a long scroll range) ---------- */}
      <section ref={heroRef} className="relative bg-gradient-to-b from-sky-50 via-white to-white" style={{ height: "190vh" }}>
        <div className="sticky top-0 h-screen overflow-hidden">
          <motion.div
            style={{ opacity: glowOpacity }}
            className="pointer-events-none absolute inset-0"
          >
            <div className="absolute -top-32 left-1/2 h-[520px] w-[820px] -translate-x-1/2 rounded-full bg-gradient-to-br from-indigo-500/20 via-sky-400/20 to-transparent blur-3xl" />
          </motion.div>

          {/* Opening headline, centered, fades out first */}
          <motion.div
            style={{ opacity: openTextOpacity, y: openTextY, scale: openTextScale }}
            className="pointer-events-none absolute inset-x-0 top-[8%] z-10 mx-auto max-w-3xl px-4 text-center sm:px-6"
          >
            <Badge variant="secondary" className="mb-5 border-sky-200 bg-sky-50 text-sky-700">
              <Sparkles className="mr-1 h-3 w-3" /> New courses added weekly
            </Badge>
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
              Learn skills that
              <span className="bg-gradient-to-r from-indigo-600 to-sky-500 bg-clip-text text-transparent">
                {" "}move your career{" "}
              </span>
              forward
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
              Hands-on courses taught by practitioners. Track your progress, pass
              quizzes, and earn certificates that prove what you know.
            </p>
            <div className="pointer-events-auto mt-8 flex flex-wrap items-center justify-center gap-3">
              <Button
                size="lg"
                className="bg-gradient-to-r from-indigo-600 to-sky-500 hover:opacity-90"
                onClick={() => navigate("/signup")}
              >
                Create free account <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate("/login")}>
                Sign in
              </Button>
            </div>
          </motion.div>

          {/* Incoming feature copy — arrives in three staggered beats as the zoom-out settles */}
          <div
            className="pointer-events-none absolute inset-y-0 left-0 z-10 flex w-full max-w-xl flex-col justify-center px-6 sm:px-12 lg:px-20"
          >
            <motion.div style={{ opacity: featureBadgeOpacity, x: featureBadgeX }}>
              <Badge variant="outline" className="mb-4 w-fit border-indigo-200 text-indigo-600">
                Built for progress
              </Badge>
            </motion.div>
            <motion.h2
              style={{ opacity: featureHeadingOpacity, x: featureHeadingX }}
              className="text-3xl font-bold tracking-tight sm:text-4xl"
            >
              See every course, quiz, and certificate in one place
            </motion.h2>
            <motion.p
              style={{ opacity: featureParaOpacity, x: featureParaX }}
              className="mt-4 max-w-md text-muted-foreground"
            >
              Your dashboard tracks lessons completed, quizzes passed, and
              certificates earned — so you always know exactly where you left off.
            </motion.p>
          </div>

          {/* The morphing mockup: hidden at top, fades/grows in, then shrinks into a framed card on the right */}
          <motion.div
            style={{ opacity: artOpacity, scale: artScale, x: artX, y: artY, borderRadius: artRadius }}
            className="absolute inset-0 m-auto h-[70vh] w-[92vw] max-w-5xl overflow-hidden border-2 border-indigo-100 bg-white shadow-[0_30px_80px_-20px_rgba(79,70,229,0.35)] sm:h-[75vh]"
          >
            <div className="flex h-9 items-center gap-1.5 border-b bg-slate-100 px-4">
              <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
              <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
            </div>
            <div className="grid h-[calc(100%-2.25rem)] grid-cols-[200px_1fr]">
              <div className="hidden flex-col gap-3 border-r bg-gradient-to-b from-indigo-100 to-sky-100 p-5 sm:flex">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-600 to-sky-500 text-white">
                  <GraduationCap className="h-4 w-4" />
                </div>
                <div className="mt-2 space-y-2.5">
                  <div className="h-2.5 w-4/5 rounded-full bg-indigo-400/70" />
                  <div className="h-2.5 w-3/5 rounded-full bg-slate-300" />
                  <div className="h-2.5 w-full rounded-full bg-slate-300" />
                  <div className="h-2.5 w-2/3 rounded-full bg-slate-300" />
                </div>
              </div>
              <div className="space-y-4 overflow-hidden p-6">
                <div className="h-6 w-1/3 rounded bg-gradient-to-r from-indigo-200 to-sky-200" />
                <div className="grid grid-cols-3 gap-4">
                  {[62, 100, 30].map((v, i) => (
                    <div key={i} className="rounded-xl border bg-card p-4">
                      <div className="mb-3 h-3 w-2/3 rounded bg-muted" />
                      <div className="h-2 w-full rounded-full bg-muted">
                        <div
                          className="h-2 rounded-full bg-gradient-to-r from-indigo-500 to-sky-400"
                          style={{ width: `${v}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="h-28 rounded-xl bg-gradient-to-br from-indigo-50 to-sky-50" />
                  <div className="h-28 rounded-xl bg-gradient-to-br from-sky-50 to-indigo-50" />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ---------- Stats (own section right after the pinned hero) ---------- */}
      <section className="relative z-10 mx-auto max-w-7xl bg-white px-4 py-10 sm:px-6">
        <RevealStagger className="mx-auto grid max-w-3xl grid-cols-2 gap-4 sm:flex sm:flex-wrap sm:justify-center sm:gap-8">
          {[
            { icon: BookOpen, value: stats?.courses ?? 0, label: "Courses" },
            { icon: Users, value: stats?.learners ?? 0, label: "Learners" },
            { icon: Award, value: stats?.certificates ?? 0, label: "Certificates" },
          ].map((s) => (
            <RevealItem key={s.label}>
              <motion.div whileHover={{ y: -3 }} transition={{ duration: 0.2 }}>
                <Card className="border-0 bg-gradient-to-br from-indigo-50 to-sky-50 shadow-none">
                  <CardContent className="flex items-center gap-3 p-4">
                    <motion.span
                      initial={{ scale: 0.6, opacity: 0 }}
                      whileInView={{ scale: 1, opacity: 1 }}
                      viewport={{ once: true, margin: "-80px" }}
                      transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.1 }}
                      className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-indigo-600 shadow-sm"
                    >
                      <s.icon className="h-5 w-5" />
                    </motion.span>
                    <div>
                      <p className="text-2xl font-bold">
                        <AnimatedCounter value={s.value} />
                      </p>
                      <p className="text-sm text-muted-foreground">{s.label}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </RevealItem>
          ))}
        </RevealStagger>
      </section>

      {/* ---------- Categories ---------- */}
      {categories && categories.length > 0 && (
        <section className="relative z-10 mx-auto max-w-7xl bg-white px-4 pt-6 sm:px-6">
          <Reveal>
            <div className="flex flex-wrap justify-center gap-2">
              {categories.map((c) => (
                <Badge
                  key={c}
                  variant="outline"
                  className="px-4 py-1.5 text-sm"
                >
                  {c}
                </Badge>
              ))}
            </div>
          </Reveal>
        </section>
      )}

      {/* ---------- Featured courses ---------- */}
      <section className="relative z-10 mx-auto max-w-7xl bg-white px-4 py-16 sm:px-6">
        <Reveal>
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold sm:text-3xl">Featured courses</h2>
            <p className="mt-1 text-muted-foreground">Start with our most popular picks</p>
          </div>
        </Reveal>

        {coursesLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-72 animate-pulse rounded-xl bg-muted" />
            ))}
          </div>
        ) : (
          <RevealStagger className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((c) => (
              <RevealItem key={c.id}>
                <motion.div
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.2 }}
                  onClick={() => navigate("/signup")}
                  className="cursor-pointer rounded-xl border bg-card p-5 transition-shadow hover:shadow-lg"
                >
                  {c.thumbnail && (
                    <img
                      src={c.thumbnail}
                      alt={c.title}
                      className="mb-4 aspect-video w-full rounded-lg object-cover"
                      loading="lazy"
                    />
                  )}
                  <h3 className="font-semibold leading-snug line-clamp-2">{c.title}</h3>
                </motion.div>
              </RevealItem>
            ))}
          </RevealStagger>
        )}
      </section>

      {/* ---------- How it works ---------- */}
      <section className="relative overflow-hidden border-t bg-gradient-to-b from-indigo-50/60 via-sky-50/40 to-transparent">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
          <Reveal>
            <h2 className="text-center text-2xl font-bold sm:text-3xl">How LearnHub works</h2>
          </Reveal>

          <RevealStagger className="mt-12 grid gap-6 sm:grid-cols-3">
            {[
              { icon: BookOpen, step: "01", title: "Enroll & learn", text: "Pick a course and work through bite-size lessons at your own pace." },
              { icon: TrendingUp, step: "02", title: "Prove it with quizzes", text: "Complete every lesson to unlock the final quiz and test your knowledge." },
              { icon: Award, step: "03", title: "Earn a certificate", text: "Pass the quiz and get a shareable certificate of completion instantly." },
            ].map((s) => (
              <RevealItem key={s.title}>
                <motion.div
                  whileHover={{ y: -4 }}
                  className="relative overflow-hidden rounded-2xl border bg-card p-6 transition-shadow hover:shadow-lg"
                >
                  <span className="absolute right-4 top-3 font-mono text-4xl font-bold text-indigo-50 select-none">
                    {s.step}
                  </span>
                  <span className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-sky-400 text-white">
                    <s.icon className="h-5 w-5" />
                  </span>
                  <h3 className="relative mt-4 font-semibold">{s.title}</h3>
                  <p className="relative mt-2 text-sm text-muted-foreground">{s.text}</p>
                </motion.div>
              </RevealItem>
            ))}
          </RevealStagger>
        </div>
      </section>

      {/* ---------- CTA ---------- */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <Reveal>
          <motion.div
            whileHover={{ scale: 1.01 }}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-indigo-500 to-sky-500 px-8 py-16 text-center text-white sm:px-16"
          >
            <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
            <div className="pointer-events-none absolute -bottom-20 -left-10 h-64 w-64 rounded-full bg-sky-300/20 blur-2xl" />
            <div className="relative z-10">
              <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-white/15">
                <GraduationCap className="h-6 w-6" />
              </div>
              <h2 className="text-2xl font-bold sm:text-3xl">Ready to start learning?</h2>
              <p className="mx-auto mt-3 max-w-lg text-white/85">
                Join thousands of learners and start building skills that matter today.
              </p>
              <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
                <Button size="lg" variant="secondary" onClick={() => navigate("/signup")}>
                  Create free account <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/40 bg-transparent text-white hover:bg-white/10 hover:text-white"
                  onClick={() => navigate("/login")}
                >
                  Sign in
                </Button>
              </div>
            </div>
          </motion.div>
        </Reveal>
      </section>

      <footer className="border-t py-8 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} LearnHub. All rights reserved.
      </footer>
    </div>
  );
}