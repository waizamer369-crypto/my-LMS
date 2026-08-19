import { and, eq, ilike, or, desc, sql as sqlExpr } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { db } from "@db/client";
import {
  courses,
  lessons,
  enrollments,
  lessonProgress,
  quizzes,
  quizQuestions,
  quizAttempts,
  certificates,
  users,
  type InsertCourse,
} from "@db/schema";

// ---------- Public catalog ----------

export async function getPlatformStats() {
  const [[courseCount], [userCount], [certCount]] = await Promise.all([
    db.select({ count: sqlExpr<number>`count(*)::int` }).from(courses).where(eq(courses.published, true)),
    db.select({ count: sqlExpr<number>`count(*)::int` }).from(users),
    db.select({ count: sqlExpr<number>`count(*)::int` }).from(certificates),
  ]);
  return {
    courses: courseCount?.count ?? 0,
    learners: userCount?.count ?? 0,
    certificates: certCount?.count ?? 0,
  };
}

export async function listCategories() {
  const rows = await db
    .selectDistinct({ category: courses.category })
    .from(courses)
    .where(eq(courses.published, true));
  return rows.map((r) => r.category);
}

export async function listPublishedCourses(input?: {
  category?: string;
  search?: string;
}) {
  const conditions = [eq(courses.published, true)];
  if (input?.category) conditions.push(eq(courses.category, input.category));
  if (input?.search) {
    conditions.push(
      or(
        ilike(courses.title, `%${input.search}%`),
        ilike(courses.description, `%${input.search}%`),
      )!,
    );
  }
  return db
    .select()
    .from(courses)
    .where(and(...conditions))
    .orderBy(desc(courses.createdAt));
}

export async function getCourseById(id: number) {
  return db.query.courses.findFirst({
    where: eq(courses.id, id),
    with: {
      lessons: { orderBy: (l, { asc }) => [asc(l.orderIndex)] },
      quiz: { with: { questions: { orderBy: (q, { asc }) => [asc(q.orderIndex)] } } },
    },
  });
}

// ---------- Enrollment & learning ----------

export async function isEnrolled(userId: number, courseId: number) {
  const [row] = await db
    .select({ id: enrollments.id })
    .from(enrollments)
    .where(and(eq(enrollments.userId, userId), eq(enrollments.courseId, courseId)))
    .limit(1);
  return !!row;
}

export async function enroll(userId: number, courseId: number) {
  await db
    .insert(enrollments)
    .values({ userId, courseId })
    .onConflictDoNothing();
}

export async function getMyCourses(userId: number) {
  const rows = await db
    .select({ course: courses, enrolledAt: enrollments.createdAt })
    .from(enrollments)
    .innerJoin(courses, eq(enrollments.courseId, courses.id))
    .where(eq(enrollments.userId, userId))
    .orderBy(desc(enrollments.createdAt));

  const results = [];
  for (const row of rows) {
    const [totalLessons] = await db
      .select({ count: sqlExpr<number>`count(*)::int` })
      .from(lessons)
      .where(eq(lessons.courseId, row.course.id));
    const [completed] = await db
      .select({ count: sqlExpr<number>`count(*)::int` })
      .from(lessonProgress)
      .where(and(eq(lessonProgress.userId, userId), eq(lessonProgress.courseId, row.course.id)));
    results.push({
      ...row.course,
      enrolledAt: row.enrolledAt,
      totalLessons: totalLessons?.count ?? 0,
      completedLessons: completed?.count ?? 0,
    });
  }
  return results;
}

export async function getLearningState(userId: number, courseId: number) {
  const courseLessons = await db
    .select()
    .from(lessons)
    .where(eq(lessons.courseId, courseId))
    .orderBy(lessons.orderIndex);

  const progress = await db
    .select({ lessonId: lessonProgress.lessonId })
    .from(lessonProgress)
    .where(and(eq(lessonProgress.userId, userId), eq(lessonProgress.courseId, courseId)));

  const completedIds = new Set(progress.map((p) => p.lessonId));

  const quiz = await db.query.quizzes.findFirst({ where: eq(quizzes.courseId, courseId) });

  let quizAttempted = false;
  let quizPassed = false;
  if (quiz) {
    const attempts = await db
      .select()
      .from(quizAttempts)
      .where(and(eq(quizAttempts.userId, userId), eq(quizAttempts.quizId, quiz.id)));
    quizAttempted = attempts.length > 0;
    quizPassed = attempts.some((a) => a.passed);
  }

  return {
    lessons: courseLessons.map((l) => ({ ...l, completed: completedIds.has(l.id) })),
    hasQuiz: !!quiz,
    quizAttempted,
    quizPassed,
  };
}

export async function completeLesson(userId: number, lessonId: number, courseId: number) {
  await db
    .insert(lessonProgress)
    .values({ userId, lessonId, courseId })
    .onConflictDoNothing();
}

export async function uncompleteLesson(userId: number, lessonId: number) {
  await db
    .delete(lessonProgress)
    .where(and(eq(lessonProgress.userId, userId), eq(lessonProgress.lessonId, lessonId)));
}

// ---------- Quiz ----------

export async function getQuizForTaking(_userId: number, courseId: number) {
  const quiz = await db.query.quizzes.findFirst({
    where: eq(quizzes.courseId, courseId),
    with: { questions: { orderBy: (q, { asc }) => [asc(q.orderIndex)] } },
  });
  if (!quiz) throw new TRPCError({ code: "NOT_FOUND", message: "This course has no quiz" });

  return {
    id: quiz.id,
    title: quiz.title,
    passScore: quiz.passScore,
    questions: quiz.questions.map((q) => ({
      id: q.id,
      question: q.question,
      options: q.options,
    })),
  };
}

export async function submitQuiz(
  userId: number,
  courseId: number,
  answers: Record<number, number>,
) {
  const quiz = await db.query.quizzes.findFirst({
    where: eq(quizzes.courseId, courseId),
    with: { questions: true },
  });
  if (!quiz) throw new TRPCError({ code: "NOT_FOUND", message: "This course has no quiz" });

  let correct = 0;
  for (const q of quiz.questions) {
    if (answers[q.id] === q.correctIndex) correct += 1;
  }
  const total = quiz.questions.length;
  const score = total > 0 ? Math.round((correct / total) * 100) : 0;
  const passed = score >= quiz.passScore;

  await db.insert(quizAttempts).values({ userId, quizId: quiz.id, score, total, passed });

  if (passed) {
    await db
      .insert(certificates)
      .values({ userId, courseId })
      .onConflictDoNothing();
  }

  return { score, total, correct, passed };
}

// ---------- Certificates ----------

export async function getMyCertificates(userId: number) {
  return db
    .select({ certificate: certificates, course: courses })
    .from(certificates)
    .innerJoin(courses, eq(certificates.courseId, courses.id))
    .where(eq(certificates.userId, userId))
    .orderBy(desc(certificates.issuedAt));
}

export async function getCertificate(userId: number, courseId: number) {
  return db.query.certificates.findFirst({
    where: and(eq(certificates.userId, userId), eq(certificates.courseId, courseId)),
    with: { course: true, user: true },
  });
}

// ---------- Instructor ----------

async function assertOwnsCourse(courseId: number, instructorId: number) {
  const [course] = await db
    .select({ id: courses.id })
    .from(courses)
    .where(and(eq(courses.id, courseId), eq(courses.instructorId, instructorId)))
    .limit(1);
  if (!course) {
    throw new TRPCError({ code: "FORBIDDEN", message: "You don't own this course" });
  }
}

export async function getInstructorCourses(instructorId: number) {
  return db
    .select()
    .from(courses)
    .where(eq(courses.instructorId, instructorId))
    .orderBy(desc(courses.createdAt));
}

export async function getInstructorCourseDetail(id: number, instructorId: number) {
  const course = await db.query.courses.findFirst({
    where: and(eq(courses.id, id), eq(courses.instructorId, instructorId)),
    with: {
      lessons: { orderBy: (l, { asc }) => [asc(l.orderIndex)] },
      quiz: { with: { questions: { orderBy: (q, { asc }) => [asc(q.orderIndex)] } } },
    },
  });
  return course;
}

export async function createCourse(
  instructorId: number,
  data: Omit<InsertCourse, "id" | "instructorId" | "createdAt" | "updatedAt" | "published">,
) {
  const [course] = await db
    .insert(courses)
    .values({ ...data, instructorId })
    .returning();
  return course;
}

export async function updateCourse(
  id: number,
  instructorId: number,
  data: Partial<Omit<InsertCourse, "id" | "instructorId">>,
) {
  await assertOwnsCourse(id, instructorId);
  await db.update(courses).set(data).where(eq(courses.id, id));
}

export async function deleteCourse(id: number, instructorId: number) {
  await assertOwnsCourse(id, instructorId);
  await db.delete(courses).where(eq(courses.id, id));
}

export async function upsertLesson(
  instructorId: number,
  input: {
    id?: number;
    courseId: number;
    title: string;
    content?: string;
    videoUrl?: string;
    durationMin: number;
    orderIndex: number;
  },
) {
  await assertOwnsCourse(input.courseId, instructorId);
  if (input.id) {
    const { id, ...rest } = input;
    await db.update(lessons).set(rest).where(eq(lessons.id, id));
    return { id };
  }
  const [lesson] = await db.insert(lessons).values(input).returning();
  return lesson;
}

export async function deleteLesson(instructorId: number, id: number) {
  const [lesson] = await db.select().from(lessons).where(eq(lessons.id, id)).limit(1);
  if (!lesson) throw new TRPCError({ code: "NOT_FOUND" });
  await assertOwnsCourse(lesson.courseId, instructorId);
  await db.delete(lessons).where(eq(lessons.id, id));
}

export async function saveQuiz(
  instructorId: number,
  input: {
    courseId: number;
    title: string;
    passScore: number;
    questions: { question: string; options: string[]; correctIndex: number }[];
  },
) {
  await assertOwnsCourse(input.courseId, instructorId);

  const existing = await db.query.quizzes.findFirst({
    where: eq(quizzes.courseId, input.courseId),
  });

  const quizId = await db.transaction(async (tx) => {
    let id: number;
    if (existing) {
      await tx
        .update(quizzes)
        .set({ title: input.title, passScore: input.passScore })
        .where(eq(quizzes.id, existing.id));
      id = existing.id;
      await tx.delete(quizQuestions).where(eq(quizQuestions.quizId, id));
    } else {
      const [created] = await tx
        .insert(quizzes)
        .values({ courseId: input.courseId, title: input.title, passScore: input.passScore })
        .returning();
      id = created.id;
    }

    if (input.questions.length > 0) {
      await tx.insert(quizQuestions).values(
        input.questions.map((q, i) => ({
          quizId: id,
          question: q.question,
          options: q.options,
          correctIndex: q.correctIndex,
          orderIndex: i,
        })),
      );
    }

    return id;
  });

  return { ok: true, quizId };
}
