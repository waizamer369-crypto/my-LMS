import { getDb } from "./connection.js";
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
} from "../../db/schema.js";
import { and, desc, eq, like, or, sql, asc, inArray } from "drizzle-orm";

// ---------- Courses ----------

export async function listPublishedCourses(filter?: {
  category?: string;
  search?: string;
}) {
  const db = getDb();
  const conditions = [eq(courses.published, true)];
  if (filter?.category && filter.category !== "All") {
    conditions.push(eq(courses.category, filter.category));
  }
  if (filter?.search) {
    const q = `%${filter.search}%`;
    conditions.push(
      or(like(courses.title, q), like(courses.description, q))!,
    );
  }
  const rows = await db
    .select({
      course: courses,
      instructorName: users.name,
      lessonCount: sql<number>`(select count(*) from ${lessons} where ${lessons.courseId} = ${courses.id})`,
      enrollmentCount: sql<number>`(select count(*) from ${enrollments} where ${enrollments.courseId} = ${courses.id})`,
    })
    .from(courses)
    .leftJoin(users, eq(courses.instructorId, users.id))
    .where(and(...conditions))
    .orderBy(desc(courses.createdAt));
  return rows.map((r) => ({
    ...r.course,
    instructorName: r.instructorName,
    lessonCount: Number(r.lessonCount),
    enrollmentCount: Number(r.enrollmentCount),
  }));
}

export async function listCategories() {
  const db = getDb();
  const rows = await db
    .selectDistinct({ category: courses.category })
    .from(courses)
    .where(eq(courses.published, true));
  return rows.map((r) => r.category);
}

export async function getCourseById(id: number) {
  const db = getDb();
  const row = await db.query.courses.findFirst({
    where: eq(courses.id, id),
    with: { instructor: true, lessons: { orderBy: asc(lessons.orderIndex) } },
  });
  if (!row) return null;
  const enrollmentCount = await db
    .select({ count: sql<number>`count(*)` })
    .from(enrollments)
    .where(eq(enrollments.courseId, id));
  const quiz = await db.query.quizzes.findFirst({
    where: eq(quizzes.courseId, id),
    with: { questions: { orderBy: asc(quizQuestions.orderIndex) } },
  });
  return {
    ...row,
    enrollmentCount: Number(enrollmentCount[0]?.count ?? 0),
    quiz: quiz ?? null,
  };
}

// ---------- Enrollments & progress ----------

export async function enroll(userId: number, courseId: number) {
  const db = getDb();
  await db
    .insert(enrollments)
    .values({ userId, courseId })
    .onDuplicateKeyUpdate({ set: { userId } });
}

export async function isEnrolled(userId: number, courseId: number) {
  const db = getDb();
  const row = await db.query.enrollments.findFirst({
    where: and(
      eq(enrollments.userId, userId),
      eq(enrollments.courseId, courseId),
    ),
  });
  return !!row;
}

export async function getMyCourses(userId: number) {
  const db = getDb();
  const rows = await db
    .select()
    .from(enrollments)
    .innerJoin(courses, eq(enrollments.courseId, courses.id))
    .leftJoin(users, eq(courses.instructorId, users.id))
    .where(eq(enrollments.userId, userId))
    .orderBy(desc(enrollments.createdAt));

  return Promise.all(
    rows.map(async (r) => {
      const total = await db
        .select({ count: sql<number>`count(*)` })
        .from(lessons)
        .where(eq(lessons.courseId, r.courses.id));
      const done = await db
        .select({ count: sql<number>`count(*)` })
        .from(lessonProgress)
        .where(
          and(
            eq(lessonProgress.userId, userId),
            eq(lessonProgress.courseId, r.courses.id),
          ),
        );
      const cert = await db.query.certificates.findFirst({
        where: and(
          eq(certificates.userId, userId),
          eq(certificates.courseId, r.courses.id),
        ),
      });
      const totalCount = Number(total[0]?.count ?? 0);
      const doneCount = Number(done[0]?.count ?? 0);
      return {
        enrollment: r.enrollments,
        course: r.courses,
        instructorName: r.users?.name ?? null,
        totalLessons: totalCount,
        completedLessons: doneCount,
        progress: totalCount === 0 ? 0 : Math.round((doneCount / totalCount) * 100),
        certificate: cert ?? null,
      };
    }),
  );
}

export async function getLearningState(userId: number, courseId: number) {
  const db = getDb();
  const lessonRows = await db
    .select()
    .from(lessons)
    .where(eq(lessons.courseId, courseId))
    .orderBy(asc(lessons.orderIndex));
  const progressRows = await db
    .select()
    .from(lessonProgress)
    .where(
      and(
        eq(lessonProgress.userId, userId),
        eq(lessonProgress.courseId, courseId),
      ),
    );
  const doneIds = new Set(progressRows.map((p) => p.lessonId));
  const quiz = await db.query.quizzes.findFirst({
    where: eq(quizzes.courseId, courseId),
    with: { questions: { orderBy: asc(quizQuestions.orderIndex) } },
  });
  const attempts = quiz
    ? await db
        .select()
        .from(quizAttempts)
        .where(
          and(
            eq(quizAttempts.userId, userId),
            eq(quizAttempts.quizId, quiz.id),
          ),
        )
        .orderBy(desc(quizAttempts.createdAt))
    : [];
  const cert = await db.query.certificates.findFirst({
    where: and(
      eq(certificates.userId, userId),
      eq(certificates.courseId, courseId),
    ),
  });
  return {
    lessons: lessonRows.map((l) => ({ ...l, completed: doneIds.has(l.id) })),
    quiz: quiz
      ? {
          id: quiz.id,
          title: quiz.title,
          passScore: quiz.passScore,
          questionCount: quiz.questions.length,
        }
      : null,
    bestAttempt: attempts[0] ?? null,
    passed: attempts.some((a) => a.passed),
    certificate: cert ?? null,
  };
}

export async function completeLesson(userId: number, lessonId: number, courseId: number) {
  const db = getDb();
  await db
    .insert(lessonProgress)
    .values({ userId, lessonId, courseId })
    .onDuplicateKeyUpdate({ set: { userId } });
}

export async function uncompleteLesson(userId: number, lessonId: number) {
  const db = getDb();
  await db
    .delete(lessonProgress)
    .where(
      and(
        eq(lessonProgress.userId, userId),
        eq(lessonProgress.lessonId, lessonId),
      ),
    );
}

// ---------- Quiz ----------

export async function getQuizForTaking(_userId: number, courseId: number) {
  const db = getDb();
  const quiz = await db.query.quizzes.findFirst({
    where: eq(quizzes.courseId, courseId),
    with: { questions: { orderBy: asc(quizQuestions.orderIndex) } },
  });
  if (!quiz) return null;
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
  const db = getDb();
  const quiz = await db.query.quizzes.findFirst({
    where: eq(quizzes.courseId, courseId),
    with: { questions: true },
  });
  if (!quiz) throw new Error("Quiz not found");
  const total = quiz.questions.length;
  if (total === 0) throw new Error("Quiz has no questions");
  const score = quiz.questions.filter(
    (q) => answers[q.id] === q.correctIndex,
  ).length;
  const percent = Math.round((score / total) * 100);
  const passed = percent >= quiz.passScore;
  await db.insert(quizAttempts).values({
    userId,
    quizId: quiz.id,
    score: percent,
    total: 100,
    passed,
  });
  let certificate = null;
  if (passed) {
    await db
      .insert(certificates)
      .values({ userId, courseId })
      .onDuplicateKeyUpdate({ set: { userId } });
    certificate = await db.query.certificates.findFirst({
      where: and(
        eq(certificates.userId, userId),
        eq(certificates.courseId, courseId),
      ),
    });
  }
  return {
    score: percent,
    passed,
    passScore: quiz.passScore,
    correctCount: score,
    totalQuestions: total,
    certificate,
  };
}

// ---------- Certificates ----------

export async function getMyCertificates(userId: number) {
  const db = getDb();
  const rows = await db
    .select()
    .from(certificates)
    .innerJoin(courses, eq(certificates.courseId, courses.id))
    .where(eq(certificates.userId, userId))
    .orderBy(desc(certificates.issuedAt));
  return rows.map((r) => ({ certificate: r.certificates, course: r.courses }));
}

export async function getCertificate(userId: number, courseId: number) {
  const db = getDb();
  const cert = await db.query.certificates.findFirst({
    where: and(
      eq(certificates.userId, userId),
      eq(certificates.courseId, courseId),
    ),
    with: { course: { with: { instructor: true } }, user: true },
  });
  return cert ?? null;
}

// ---------- Instructor ----------

export async function getInstructorCourses(instructorId: number) {
  const db = getDb();
  const rows = await db
    .select()
    .from(courses)
    .where(eq(courses.instructorId, instructorId))
    .orderBy(desc(courses.createdAt));
  return Promise.all(
    rows.map(async (c) => {
      const [enrollCount] = await db
        .select({ count: sql<number>`count(*)` })
        .from(enrollments)
        .where(eq(enrollments.courseId, c.id));
      const [lessonCount] = await db
        .select({ count: sql<number>`count(*)` })
        .from(lessons)
        .where(eq(lessons.courseId, c.id));
      const [certCount] = await db
        .select({ count: sql<number>`count(*)` })
        .from(certificates)
        .where(eq(certificates.courseId, c.id));
      const quiz = await db.query.quizzes.findFirst({
        where: eq(quizzes.courseId, c.id),
        with: { questions: true },
      });
      return {
        ...c,
        enrollmentCount: Number(enrollCount?.count ?? 0),
        lessonCount: Number(lessonCount?.count ?? 0),
        certificateCount: Number(certCount?.count ?? 0),
        quizQuestionCount: quiz?.questions.length ?? 0,
      };
    }),
  );
}

export async function createCourse(
  instructorId: number,
  data: {
    title: string;
    subtitle?: string;
    description?: string;
    category: string;
    level: "beginner" | "intermediate" | "advanced";
    priceCents: number;
    thumbnail?: string;
  },
) {
  const db = getDb();
  const [{ id }] = await db
    .insert(courses)
    .values({ ...data, instructorId })
    .$returningId();
  return id;
}

export async function updateCourse(
  id: number,
  instructorId: number,
  data: Partial<{
    title: string;
    subtitle: string;
    description: string;
    category: string;
    level: "beginner" | "intermediate" | "advanced";
    priceCents: number;
    thumbnail: string;
    published: boolean;
  }>,
) {
  const db = getDb();
  await db
    .update(courses)
    .set(data)
    .where(and(eq(courses.id, id), eq(courses.instructorId, instructorId)));
}

export async function deleteCourse(id: number, instructorId: number) {
  const db = getDb();
  const course = await db.query.courses.findFirst({
    where: and(eq(courses.id, id), eq(courses.instructorId, instructorId)),
  });
  if (!course) throw new Error("Course not found");
  const lessonRows = await db
    .select({ id: lessons.id })
    .from(lessons)
    .where(eq(lessons.courseId, id));
  const lessonIds = lessonRows.map((l) => l.id);
  const quiz = await db.query.quizzes.findFirst({
    where: eq(quizzes.courseId, id),
  });
  if (quiz) {
    await db.delete(quizAttempts).where(eq(quizAttempts.quizId, quiz.id));
    await db.delete(quizQuestions).where(eq(quizQuestions.quizId, quiz.id));
    await db.delete(quizzes).where(eq(quizzes.id, quiz.id));
  }
  if (lessonIds.length > 0) {
    await db.delete(lessonProgress).where(inArray(lessonProgress.lessonId, lessonIds));
  }
  await db.delete(lessonProgress).where(eq(lessonProgress.courseId, id));
  await db.delete(certificates).where(eq(certificates.courseId, id));
  await db.delete(enrollments).where(eq(enrollments.courseId, id));
  await db.delete(lessons).where(eq(lessons.courseId, id));
  await db.delete(courses).where(eq(courses.id, id));
}

export async function getInstructorCourseDetail(id: number, instructorId: number) {
  const db = getDb();
  const course = await db.query.courses.findFirst({
    where: and(eq(courses.id, id), eq(courses.instructorId, instructorId)),
    with: { lessons: { orderBy: asc(lessons.orderIndex) } },
  });
  if (!course) return null;
  const quiz = await db.query.quizzes.findFirst({
    where: eq(quizzes.courseId, id),
    with: { questions: { orderBy: asc(quizQuestions.orderIndex) } },
  });
  return { ...course, quiz: quiz ?? null };
}

export async function upsertLesson(
  instructorId: number,
  data: {
    id?: number;
    courseId: number;
    title: string;
    content?: string;
    videoUrl?: string;
    durationMin: number;
    orderIndex: number;
  },
) {
  const db = getDb();
  const course = await db.query.courses.findFirst({
    where: and(
      eq(courses.id, data.courseId),
      eq(courses.instructorId, instructorId),
    ),
  });
  if (!course) throw new Error("Course not found");
  if (data.id) {
    await db
      .update(lessons)
      .set({
        title: data.title,
        content: data.content,
        videoUrl: data.videoUrl,
        durationMin: data.durationMin,
        orderIndex: data.orderIndex,
      })
      .where(eq(lessons.id, data.id));
    return data.id;
  }
  const [{ id }] = await db
    .insert(lessons)
    .values({
      courseId: data.courseId,
      title: data.title,
      content: data.content,
      videoUrl: data.videoUrl,
      durationMin: data.durationMin,
      orderIndex: data.orderIndex,
    })
    .$returningId();
  return id;
}

export async function deleteLesson(instructorId: number, lessonId: number) {
  const db = getDb();
  const lesson = await db.query.lessons.findFirst({
    where: eq(lessons.id, lessonId),
    with: { course: true },
  });
  if (!lesson || lesson.course.instructorId !== instructorId) {
    throw new Error("Lesson not found");
  }
  await db.delete(lessonProgress).where(eq(lessonProgress.lessonId, lessonId));
  await db.delete(lessons).where(eq(lessons.id, lessonId));
}

export async function saveQuiz(
  instructorId: number,
  data: {
    courseId: number;
    title: string;
    passScore: number;
    questions: {
      question: string;
      options: string[];
      correctIndex: number;
    }[];
  },
) {
  const db = getDb();
  const course = await db.query.courses.findFirst({
    where: and(
      eq(courses.id, data.courseId),
      eq(courses.instructorId, instructorId),
    ),
  });
  if (!course) throw new Error("Course not found");
  const existing = await db.query.quizzes.findFirst({
    where: eq(quizzes.courseId, data.courseId),
  });
  let quizId: number;
  if (existing) {
    quizId = existing.id;
    await db
      .update(quizzes)
      .set({ title: data.title, passScore: data.passScore })
      .where(eq(quizzes.id, quizId));
    await db.delete(quizAttempts).where(eq(quizAttempts.quizId, quizId));
    await db.delete(quizQuestions).where(eq(quizQuestions.quizId, quizId));
  } else {
    const [{ id }] = await db
      .insert(quizzes)
      .values({
        courseId: data.courseId,
        title: data.title,
        passScore: data.passScore,
      })
      .$returningId();
    quizId = id;
  }
  if (data.questions.length > 0) {
    await db.insert(quizQuestions).values(
      data.questions.map((q, i) => ({
        quizId,
        question: q.question,
        options: q.options,
        correctIndex: q.correctIndex,
        orderIndex: i,
      })),
    );
  }
  return quizId;
}

// ---------- Stats ----------

export async function getPlatformStats() {
  const db = getDb();
  const [courseCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(courses)
    .where(eq(courses.published, true));
  const [learnerCount] = await db
    .select({ count: sql<number>`count(distinct ${enrollments.userId})` })
    .from(enrollments);
  const [certCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(certificates);
  return {
    courses: Number(courseCount?.count ?? 0),
    learners: Number(learnerCount?.count ?? 0),
    certificates: Number(certCount?.count ?? 0),
  };
}