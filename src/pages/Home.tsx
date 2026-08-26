import { Link, useNavigate } from "react-router";
import { ArrowRight, Award, BookOpen, Users, Sparkles, Play, TrendingUp, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import Layout from "@/components/Layout";
import CourseCard from "@/components/CourseCard";
import { trpc } from "@/providers/trpc";
import { motion } from "framer-motion";
import { FadeIn, StaggerContainer, StaggerItem, AnimatedCounter } from "@/lib/animations";

export default function Home() {
  const navigate = useNavigate();
  const { data: stats } = trpc.lms.stats.useQuery();
  const { data: courses, isLoading } = trpc.lms.courses.useQuery({});
  const { data: categories } = trpc.lms.categories.useQuery();

  const featured = courses?.slice(0, 6) ?? [];

  return (
    <Layout>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/8 via-background to-background" />
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24">
          <FadeIn>
            <Badge variant="secondary" className="mb-4">
              <Sparkles className="mr-1 h-3 w-3" /> New courses added weekly
            </Badge>
          </FadeIn>
          <FadeIn delay={0.1}>
            <h1 className="max-w-3xl text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
              Learn skills that
              <span className="text-primary"> move your career</span> forward
            </h1>
          </FadeIn>
          <FadeIn delay={0.2}>
            <p className="mt-6 max-w-xl text-lg text-muted-foreground">
              Hands-on courses taught by practitioners. Track your progress, pass
              quizzes, and earn certificates that prove what you know.
            </p>
          </FadeIn>
          <FadeIn delay={0.3}>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button size="lg" onClick={() => navigate("/courses")}>
                Browse courses <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate("/teach")}>
                Become an instructor
              </Button>
            </div>
          </FadeIn>

          {/* Stats */}
          <FadeIn delay={0.4}>
            <div className="mt-12 grid grid-cols-2 gap-4 sm:flex sm:flex-wrap sm:gap-8">
              {[
                { icon: BookOpen, value: stats?.courses ?? 0, label: "Courses" },
                { icon: Users, value: stats?.learners ?? 0, label: "Learners" },
                { icon: Award, value: stats?.certificates ?? 0, label: "Certificates" },
              ].map((s) => (
                <Card key={s.label} className="border-0 bg-primary/5 shadow-none">
                  <CardContent className="flex items-center gap-3 p-4">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <s.icon className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="text-2xl font-bold">
                        <AnimatedCounter value={s.value} />
                      </p>
                      <p className="text-sm text-muted-foreground">{s.label}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Categories */}
      {categories && categories.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 pt-6 sm:px-6">
          <FadeIn>
            <div className="flex flex-wrap gap-2">
              {categories.map((c) => (
                <Link key={c} to={`/courses?category=${encodeURIComponent(c)}`}>
                  <Badge
                    variant="outline"
                    className="cursor-pointer px-4 py-1.5 text-sm hover:bg-primary hover:text-primary-foreground transition-colors"
                  >
                    {c}
                  </Badge>
                </Link>
              ))}
            </div>
          </FadeIn>
        </section>
      )}

      {/* Featured */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <FadeIn>
          <div className="mb-8 flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-bold sm:text-3xl">Featured courses</h2>
              <p className="mt-1 text-muted-foreground">Start with our most popular picks</p>
            </div>
            <Button variant="ghost" onClick={() => navigate("/courses")}>
              View all <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </FadeIn>
        {isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-72 animate-pulse rounded-xl bg-muted" />
            ))}
          </div>
        ) : (
          <StaggerContainer className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((c) => (
              <StaggerItem key={c.id}>
                <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
                  <CourseCard course={c} />
                </motion.div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        )}
      </section>

      {/* How it works */}
      <section className="border-t bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <FadeIn>
            <h2 className="text-center text-2xl font-bold sm:text-3xl">How LearnHub works</h2>
          </FadeIn>
          <StaggerContainer className="mt-10 grid gap-6 sm:grid-cols-3">
            {[
              { icon: BookOpen, title: "Enroll & learn", text: "Pick a course and work through bite-size lessons at your own pace." },
              { icon: TrendingUp, title: "Prove it with quizzes", text: "Complete every lesson to unlock the final quiz and test your knowledge." },
              { icon: Award, title: "Earn a certificate", text: "Pass the quiz and get a shareable certificate of completion instantly." },
            ].map((s) => (
              <StaggerItem key={s.title}>
                <motion.div whileHover={{ y: -4 }} className="rounded-2xl border bg-card p-6 transition-shadow hover:shadow-md">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <s.icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-4 font-semibold">{s.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{s.text}</p>
                </motion.div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <FadeIn>
          <motion.div
            whileHover={{ scale: 1.01 }}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-primary/80 px-8 py-14 text-center text-primary-foreground sm:px-16"
          >
            <div className="relative z-10">
              <h2 className="text-2xl font-bold sm:text-3xl">Ready to start learning?</h2>
              <p className="mx-auto mt-3 max-w-lg text-primary-foreground/80">
                Join thousands of learners and start building skills that matter today.
              </p>
              <Button
                size="lg"
                variant="secondary"
                className="mt-6"
                onClick={() => navigate("/courses")}
              >
                Explore all courses <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        </FadeIn>
      </section>
    </Layout>
  );
}
