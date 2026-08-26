import {
  mysqlTable,
  mysqlEnum,
  serial,
  varchar,
  text,
  int,
  bigint,
  boolean,
  json,
  timestamp,
  uniqueIndex,
  index,
} from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: serial("id").primaryKey(),
  unionId: varchar("unionId", { length: 255 }).unique(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 320 }).unique(),
  avatar: text("avatar"),
  passwordHash: varchar("passwordHash", { length: 255 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
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

export const courses = mysqlTable(
  "courses",
  {
    id: serial("id").primaryKey(),
    title: varchar("title", { length: 255 }).notNull(),
    subtitle: varchar("subtitle", { length: 255 }),
    description: text("description"),
    category: varchar("category", { length: 100 }).notNull(),
    level: mysqlEnum("level", ["beginner", "intermediate", "advanced"])
      .default("beginner")
      .notNull(),
    priceCents: int("priceCents").default(0).notNull(),
    thumbnail: text("thumbnail"),
    instructorId: bigint("instructorId", { mode: "number", unsigned: true })
      .notNull(),
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

export const lessons = mysqlTable(
  "lessons",
  {
    id: serial("id").primaryKey(),
    courseId: bigint("courseId", { mode: "number", unsigned: true }).notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    content: text("content"),
    videoUrl: varchar("videoUrl", { length: 512 }),
    durationMin: int("durationMin").default(10).notNull(),
    orderIndex: int("orderIndex").default(0).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    courseIdx: index("lesson_course_idx").on(table.courseId),
  }),
);
export type Lesson = typeof lessons.$inferSelect;
export type InsertLesson = typeof lessons.$inferInsert;

export const enrollments = mysqlTable(
  "enrollments",
  {
    id: serial("id").primaryKey(),
    userId: bigint("userId", { mode: "number", unsigned: true }).notNull(),
    courseId: bigint("courseId", { mode: "number", unsigned: true }).notNull(),
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

export const lessonProgress = mysqlTable(
  "lesson_progress",
  {
    id: serial("id").primaryKey(),
    userId: bigint("userId", { mode: "number", unsigned: true }).notNull(),
    lessonId: bigint("lessonId", { mode: "number", unsigned: true }).notNull(),
    courseId: bigint("courseId", { mode: "number", unsigned: true }).notNull(),
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

export const quizzes = mysqlTable(
  "quizzes",
  {
    id: serial("id").primaryKey(),
    courseId: bigint("courseId", { mode: "number", unsigned: true })
      .notNull()
      .unique(),
    title: varchar("title", { length: 255 }).notNull(),
    passScore: int("passScore").default(70).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
);
export type Quiz = typeof quizzes.$inferSelect;
export type InsertQuiz = typeof quizzes.$inferInsert;

export const quizQuestions = mysqlTable(
  "quiz_questions",
  {
    id: serial("id").primaryKey(),
    quizId: bigint("quizId", { mode: "number", unsigned: true }).notNull(),
    question: text("question").notNull(),
    options: json("options").$type<string[]>().notNull(),
    correctIndex: int("correctIndex").notNull(),
    orderIndex: int("orderIndex").default(0).notNull(),
  },
  (table) => ({
    quizIdx: index("question_quiz_idx").on(table.quizId),
  }),
);
export type QuizQuestion = typeof quizQuestions.$inferSelect;

export const quizAttempts = mysqlTable(
  "quiz_attempts",
  {
    id: serial("id").primaryKey(),
    userId: bigint("userId", { mode: "number", unsigned: true }).notNull(),
    quizId: bigint("quizId", { mode: "number", unsigned: true }).notNull(),
    score: int("score").notNull(),
    total: int("total").notNull(),
    passed: boolean("passed").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    userQuizIdx: index("attempt_user_quiz_idx").on(table.userId, table.quizId),
  }),
);
export type QuizAttempt = typeof quizAttempts.$inferSelect;

export const certificates = mysqlTable(
  "certificates",
  {
    id: serial("id").primaryKey(),
    userId: bigint("userId", { mode: "number", unsigned: true }).notNull(),
    courseId: bigint("courseId", { mode: "number", unsigned: true }).notNull(),
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