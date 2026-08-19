import {
  pgTable,
  pgEnum,
  serial,
  varchar,
  text,
  integer,
  bigint,
  boolean,
  json,
  timestamp,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", ["user", "admin"]);
export const levelEnum = pgEnum("level", [
  "beginner",
  "intermediate",
  "advanced",
]);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  unionId: varchar("unionId", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 320 }),
  passwordHash: text("passwordHash"),
  avatar: text("avatar"),
  role: roleEnum("role").default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
  lastSignInAt: timestamp("lastSignInAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ---------- LMS tables ----------

export const courses = pgTable(
  "courses",
  {
    id: serial("id").primaryKey(),
    title: varchar("title", { length: 255 }).notNull(),
    subtitle: varchar("subtitle", { length: 255 }),
    description: text("description"),
    category: varchar("category", { length: 100 }).notNull(),
    level: levelEnum("level").default("beginner").notNull(),
    priceCents: integer("priceCents").default(0).notNull(),
    thumbnail: text("thumbnail"),
    instructorId: bigint("instructorId", { mode: "number" }).notNull(),
    published: boolean("published").default(true).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt")
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    categoryIdx: index("category_idx").on(table.category),
    instructorIdx: index("instructor_idx").on(table.instructorId),
  }),
);
export type Course = typeof courses.$inferSelect;
export type InsertCourse = typeof courses.$inferInsert;

export const lessons = pgTable(
  "lessons",
  {
    id: serial("id").primaryKey(),
    courseId: bigint("courseId", { mode: "number" }).notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    content: text("content"),
    videoUrl: varchar("videoUrl", { length: 512 }),
    durationMin: integer("durationMin").default(10).notNull(),
    orderIndex: integer("orderIndex").default(0).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    courseIdx: index("lesson_course_idx").on(table.courseId),
  }),
);
export type Lesson = typeof lessons.$inferSelect;
export type InsertLesson = typeof lessons.$inferInsert;

export const enrollments = pgTable(
  "enrollments",
  {
    id: serial("id").primaryKey(),
    userId: bigint("userId", { mode: "number" }).notNull(),
    courseId: bigint("courseId", { mode: "number" }).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    uniq: uniqueIndex("enrollment_user_course_uniq").on(
      table.userId,
      table.courseId,
    ),
    courseIdx: index("enrollment_course_idx").on(table.courseId),
  }),
);
export type Enrollment = typeof enrollments.$inferSelect;

export const lessonProgress = pgTable(
  "lesson_progress",
  {
    id: serial("id").primaryKey(),
    userId: bigint("userId", { mode: "number" }).notNull(),
    lessonId: bigint("lessonId", { mode: "number" }).notNull(),
    courseId: bigint("courseId", { mode: "number" }).notNull(),
    completedAt: timestamp("completedAt").defaultNow().notNull(),
  },
  (table) => ({
    uniq: uniqueIndex("progress_user_lesson_uniq").on(
      table.userId,
      table.lessonId,
    ),
    userCourseIdx: index("progress_user_course_idx").on(
      table.userId,
      table.courseId,
    ),
  }),
);
export type LessonProgress = typeof lessonProgress.$inferSelect;

export const quizzes = pgTable("quizzes", {
  id: serial("id").primaryKey(),
  courseId: bigint("courseId", { mode: "number" }).notNull().unique(),
  title: varchar("title", { length: 255 }).notNull(),
  passScore: integer("passScore").default(70).notNull(), // percent
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type Quiz = typeof quizzes.$inferSelect;
export type InsertQuiz = typeof quizzes.$inferInsert;

export const quizQuestions = pgTable(
  "quiz_questions",
  {
    id: serial("id").primaryKey(),
    quizId: bigint("quizId", { mode: "number" }).notNull(),
    question: text("question").notNull(),
    options: json("options").$type<string[]>().notNull(),
    correctIndex: integer("correctIndex").notNull(),
    orderIndex: integer("orderIndex").default(0).notNull(),
  },
  (table) => ({
    quizIdx: index("question_quiz_idx").on(table.quizId),
  }),
);
export type QuizQuestion = typeof quizQuestions.$inferSelect;

export const quizAttempts = pgTable(
  "quiz_attempts",
  {
    id: serial("id").primaryKey(),
    userId: bigint("userId", { mode: "number" }).notNull(),
    quizId: bigint("quizId", { mode: "number" }).notNull(),
    score: integer("score").notNull(),
    total: integer("total").notNull(),
    passed: boolean("passed").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    userQuizIdx: index("attempt_user_quiz_idx").on(table.userId, table.quizId),
  }),
);
export type QuizAttempt = typeof quizAttempts.$inferSelect;

export const certificates = pgTable(
  "certificates",
  {
    id: serial("id").primaryKey(),
    userId: bigint("userId", { mode: "number" }).notNull(),
    courseId: bigint("courseId", { mode: "number" }).notNull(),
    issuedAt: timestamp("issuedAt").defaultNow().notNull(),
  },
  (table) => ({
    uniq: uniqueIndex("certificate_user_course_uniq").on(
      table.userId,
      table.courseId,
    ),
  }),
);
export type Certificate = typeof certificates.$inferSelect;