import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createRouter, publicQuery, authedQuery } from "./middleware";
import {
  listPublishedCourses,
  listCategories,
  getCourseById,
  enroll,
  isEnrolled,
  getMyCourses,
  getLearningState,
  completeLesson,
  uncompleteLesson,
  getQuizForTaking,
  submitQuiz,
  getMyCertificates,
  getCertificate,
  getInstructorCourses,
  createCourse,
  updateCourse,
  deleteCourse,
  getInstructorCourseDetail,
  upsertLesson,
  deleteLesson,
  saveQuiz,
  getPlatformStats,
} from "./queries/lms";

export const lmsRouter = createRouter({
  stats: publicQuery.query(() => getPlatformStats()),

  categories: publicQuery.query(() => listCategories()),

  courses: publicQuery
    .input(
      z
        .object({
          category: z.string().optional(),
          search: z.string().optional(),
        })
        .optional(),
    )
    .query(({ input }) => listPublishedCourses(input)),

  course: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input, ctx }) => {
      const course = await getCourseById(input.id);
      if (!course || (!course.published && course.instructorId !== ctx.user?.id)) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Course not found" });
      }
      const enrolled = ctx.user
        ? await isEnrolled(ctx.user.id, input.id)
        : false;
      // Strip quiz answers from public payload
      const quiz = course.quiz
        ? {
            id: course.quiz.id,
            title: course.quiz.title,
            passScore: course.quiz.passScore,
            questionCount: course.quiz.questions.length,
          }
        : null;
      const { quiz: _q, ...rest } = course;
      return { ...rest, quiz, enrolled };
    }),

  enroll: authedQuery
    .input(z.object({ courseId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const course = await getCourseById(input.courseId);
      if (!course || !course.published) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Course not found" });
      }
      await enroll(ctx.user.id, input.courseId);
      return { ok: true };
    }),

  myCourses: authedQuery.query(({ ctx }) => getMyCourses(ctx.user.id)),

  learn: authedQuery
    .input(z.object({ courseId: z.number() }))
    .query(async ({ ctx, input }) => {
      const enrolled = await isEnrolled(ctx.user.id, input.courseId);
      if (!enrolled) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You are not enrolled in this course",
        });
      }
      const course = await getCourseById(input.courseId);
      if (!course) throw new TRPCError({ code: "NOT_FOUND" });
      const state = await getLearningState(ctx.user.id, input.courseId);
      return {
        course: {
          id: course.id,
          title: course.title,
          category: course.category,
          level: course.level,
        },
        ...state,
      };
    }),

  completeLesson: authedQuery
    .input(
      z.object({
        lessonId: z.number(),
        courseId: z.number(),
        completed: z.boolean(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (input.completed) {
        await completeLesson(ctx.user.id, input.lessonId, input.courseId);
      } else {
        await uncompleteLesson(ctx.user.id, input.lessonId);
      }
      return { ok: true };
    }),

  quiz: authedQuery
    .input(z.object({ courseId: z.number() }))
    .query(async ({ ctx, input }) => {
      const enrolled = await isEnrolled(ctx.user.id, input.courseId);
      if (!enrolled) throw new TRPCError({ code: "FORBIDDEN" });
      return getQuizForTaking(ctx.user.id, input.courseId);
    }),

  submitQuiz: authedQuery
    .input(
      z.object({
        courseId: z.number(),
        answers: z.record(z.number(), z.number()),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const enrolled = await isEnrolled(ctx.user.id, input.courseId);
      if (!enrolled) throw new TRPCError({ code: "FORBIDDEN" });
      return submitQuiz(ctx.user.id, input.courseId, input.answers);
    }),

  myCertificates: authedQuery.query(({ ctx }) =>
    getMyCertificates(ctx.user.id),
  ),

  certificate: authedQuery
    .input(z.object({ courseId: z.number() }))
    .query(async ({ ctx, input }) => {
      const cert = await getCertificate(ctx.user.id, input.courseId);
      if (!cert) throw new TRPCError({ code: "NOT_FOUND" });
      return cert;
    }),

  // ---------- Instructor ----------

  instructorCourses: authedQuery.query(({ ctx }) =>
    getInstructorCourses(ctx.user.id),
  ),

  instructorCourse: authedQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const course = await getInstructorCourseDetail(input.id, ctx.user.id);
      if (!course) throw new TRPCError({ code: "NOT_FOUND" });
      return course;
    }),

  createCourse: authedQuery
    .input(
      z.object({
        title: z.string().min(3),
        subtitle: z.string().optional(),
        description: z.string().optional(),
        category: z.string().min(1),
        level: z.enum(["beginner", "intermediate", "advanced"]),
        priceCents: z.number().int().min(0),
        thumbnail: z.string().optional(),
      }),
    )
    .mutation(({ ctx, input }) => createCourse(ctx.user.id, input)),

  updateCourse: authedQuery
    .input(
      z.object({
        id: z.number(),
        title: z.string().min(3).optional(),
        subtitle: z.string().optional(),
        description: z.string().optional(),
        category: z.string().optional(),
        level: z.enum(["beginner", "intermediate", "advanced"]).optional(),
        priceCents: z.number().int().min(0).optional(),
        thumbnail: z.string().optional(),
        published: z.boolean().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      await updateCourse(id, ctx.user.id, data);
      return { ok: true };
    }),

  deleteCourse: authedQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await deleteCourse(input.id, ctx.user.id);
      return { ok: true };
    }),

  saveLesson: authedQuery
    .input(
      z.object({
        id: z.number().optional(),
        courseId: z.number(),
        title: z.string().min(1),
        content: z.string().optional(),
        videoUrl: z.string().optional(),
        durationMin: z.number().int().min(1),
        orderIndex: z.number().int(),
      }),
    )
    .mutation(({ ctx, input }) => upsertLesson(ctx.user.id, input)),

  deleteLesson: authedQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await deleteLesson(ctx.user.id, input.id);
      return { ok: true };
    }),

  saveQuiz: authedQuery
    .input(
      z.object({
        courseId: z.number(),
        title: z.string().min(1),
        passScore: z.number().int().min(0).max(100),
        questions: z.array(
          z.object({
            question: z.string().min(1),
            options: z.array(z.string().min(1)).min(2).max(6),
            correctIndex: z.number().int().min(0),
          }),
        ),
      }),
    )
    .mutation(({ ctx, input }) => saveQuiz(ctx.user.id, input)),
});
