import { useNavigate } from "react-router";
import type { HTMLAttributes } from "react";
import { ArrowRight, Award, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Layout from "@/components/Layout";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import {
  FadeIn,
  StaggerContainer,
  StaggerItem,
  AnimatedProgress,
  AnimatedCard,
  FloatingParticles,
  AnimatePresence,
} from "@/lib/animations";
import { motion } from "framer-motion";

function Card({ className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={`rounded-lg border bg-card text-card-foreground shadow-sm ${className}`} {...props} />;
}

function CardContent({ className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={className} {...props} />;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth({ redirectOnUnauthenticated: true });
  const { data: myCourses, isLoading } = trpc.lms.myCourses.useQuery();
  const { data: certificates } = trpc.lms.myCertificates.useQuery();

  return (
    <Layout>
      <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <FloatingParticles />

        <div className="relative">
          <FadeIn>
            <h1 className="text-3xl font-bold">
              Welcome back{user?.name ? `, ${user.name.split(" ")[0]}` : ""}
            </h1>
          </FadeIn>
          <FadeIn delay={0.1}>
            <p className="mt-2 text-muted-foreground">Pick up where you left off.</p>
          </FadeIn>

          <Tabs defaultValue="courses" className="mt-8">
            <FadeIn delay={0.2}>
              <TabsList>
                <TabsTrigger value="courses">
                  My courses ({myCourses?.length ?? 0})
                </TabsTrigger>
                <TabsTrigger value="certificates">
                  Certificates ({certificates?.length ?? 0})
                </TabsTrigger>
              </TabsList>
            </FadeIn>

            <AnimatePresence mode="wait">
              <TabsContent value="courses" className="mt-6">
                <motion.div
                  key="courses"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  {isLoading ? (
                    <StaggerContainer className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <StaggerItem key={i}>
                          <div className="h-56 animate-pulse rounded-xl bg-muted" />
                        </StaggerItem>
                      ))}
                    </StaggerContainer>
                  ) : myCourses && myCourses.length > 0 ? (
                    <StaggerContainer className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                      {myCourses.map(
                        (
                          { course, progress, completedLessons, totalLessons, certificate },
                          index
                        ) => (
                          <StaggerItem key={course.id}>
                            <AnimatedCard index={index}>
                              <Card className="overflow-hidden transition-shadow hover:shadow-lg">
                                {course.thumbnail && (
                                  <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    transition={{ duration: 0.3 }}
                                    className="overflow-hidden"
                                  >
                                    <img
                                      src={course.thumbnail}
                                      alt={course.title}
                                      className="aspect-video w-full object-cover"
                                      loading="lazy"
                                    />
                                  </motion.div>
                                )}
                                <CardContent className="p-5">
                                  <div className="flex items-start justify-between gap-2">
                                    <h3 className="font-semibold leading-snug line-clamp-2">
                                      {course.title}
                                    </h3>
                                    {certificate && (
                                      <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{
                                          type: "spring",
                                          stiffness: 500,
                                          damping: 25,
                                          delay: 0.5 + index * 0.1,
                                        }}
                                      >
                                        <span className="inline-flex shrink-0 items-center rounded-md bg-amber-500/10 px-2.5 py-0.5 text-xs font-semibold text-amber-600 hover:bg-amber-500/10">
                                          <Award className="mr-1 h-3 w-3" /> Certified
                                        </span>
                                      </motion.div>
                                    )}
                                  </div>
                                  <div className="mt-4">
                                    <div className="mb-1.5 flex justify-between text-xs text-muted-foreground">
                                      <span>
                                        {completedLessons}/{totalLessons} lessons
                                      </span>
                                      <motion.span
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.8 + index * 0.1 }}
                                      >
                                        {progress}%
                                      </motion.span>
                                    </div>
                                    <AnimatedProgress value={progress} />
                                  </div>
                                  <div className="mt-4 flex gap-2">
                                    <motion.div className="flex-1" whileTap={{ scale: 0.97 }}>
                                      <Button
                                        className="w-full"
                                        size="sm"
                                        onClick={() => navigate(`/learn/${course.id}`)}
                                      >
                                        {progress === 0
                                          ? "Start"
                                          : progress === 100
                                          ? "Review"
                                          : "Continue"}
                                        <ArrowRight className="ml-1 h-3.5 w-3.5" />
                                      </Button>
                                    </motion.div>
                                    {certificate && (
                                      <motion.div whileTap={{ scale: 0.97 }}>
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => navigate(`/certificate/${course.id}`)}
                                        >
                                          <Award className="h-4 w-4" />
                                        </Button>
                                      </motion.div>
                                    )}
                                  </div>
                                </CardContent>
                              </Card>
                            </AnimatedCard>
                          </StaggerItem>
                        )
                      )}
                    </StaggerContainer>
                  ) : (
                    <FadeIn>
                      <motion.div
                        className="rounded-xl border border-dashed py-16 text-center"
                        whileHover={{ borderColor: "rgba(99, 102, 241, 0.3)" }}
                      >
                        <motion.div
                          animate={{ y: [0, -8, 0] }}
                          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        >
                          <BookOpen className="mx-auto h-10 w-10 text-muted-foreground/40" />
                        </motion.div>
                        <p className="mt-4 font-medium">No courses yet</p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          Enroll in a course to start learning.
                        </p>
                        <Button className="mt-6" onClick={() => navigate("/courses")}>
                          Browse catalog
                        </Button>
                      </motion.div>
                    </FadeIn>
                  )}
                </motion.div>
              </TabsContent>

              <TabsContent value="certificates" className="mt-6">
                <motion.div
                  key="certificates"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  {certificates && certificates.length > 0 ? (
                    <StaggerContainer className="grid gap-4 sm:grid-cols-2">
                      {certificates.map(({ certificate, course }, index) => (
                        <StaggerItem key={certificate.id}>
                          <AnimatedCard index={index}>
                            <Card className="transition-shadow hover:shadow-md">
                              <CardContent className="flex items-center gap-4 p-5">
                                <motion.span
                                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600"
                                  whileHover={{ rotate: 15, scale: 1.1 }}
                                  transition={{ type: "spring", stiffness: 400 }}
                                >
                                  <Award className="h-6 w-6" />
                                </motion.span>
                                <div className="min-w-0 flex-1">
                                  <p className="truncate font-semibold">{course.title}</p>
                                  <p className="text-sm text-muted-foreground">
                                    Issued {new Date(certificate.issuedAt).toLocaleDateString()}
                                  </p>
                                </div>
                                <motion.div whileTap={{ scale: 0.95 }}>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => navigate(`/certificate/${course.id}`)}
                                  >
                                    View
                                  </Button>
                                </motion.div>
                              </CardContent>
                            </Card>
                          </AnimatedCard>
                        </StaggerItem>
                      ))}
                    </StaggerContainer>
                  ) : (
                    <FadeIn>
                      <motion.div
                        className="rounded-xl border border-dashed py-16 text-center"
                        whileHover={{ borderColor: "rgba(99, 102, 241, 0.3)" }}
                      >
                        <motion.div
                          animate={{ rotate: [0, 10, -10, 0] }}
                          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                        >
                          <Award className="mx-auto h-10 w-10 text-muted-foreground/40" />
                        </motion.div>
                        <p className="mt-4 font-medium">No certificates yet</p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          Complete a course and pass its quiz to earn one.
                        </p>
                      </motion.div>
                    </FadeIn>
                  )}
                </motion.div>
              </TabsContent>
            </AnimatePresence>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
}