import { getDb } from "../api/queries/connection";
import {
  users,
  courses,
  lessons,
  quizzes,
  quizQuestions,
} from "./schema";
import { eq } from "drizzle-orm";

const SEED_INSTRUCTORS = [
  {
    unionId: "seed-instructor-ada",
    name: "Dr. Ada Nakamura",
    email: "ada@learnhub.example",
  },
  {
    unionId: "seed-instructor-marco",
    name: "Marco Reyes",
    email: "marco@learnhub.example",
  },
];

type SeedLesson = { title: string; content: string; durationMin: number; videoUrl?: string };
type SeedQuiz = { title: string; passScore: number; questions: { question: string; options: string[]; correctIndex: number }[] };
type SeedCourse = {
  title: string;
  subtitle: string;
  description: string;
  category: string;
  level: "beginner" | "intermediate" | "advanced";
  priceCents: number;
  thumbnail: string;
  instructorIdx: number;
  lessons: SeedLesson[];
  quiz: SeedQuiz;
};

const thumb = (seed: string) =>
  `https://picsum.photos/seed/${seed}/640/360`;

const SEED_COURSES: SeedCourse[] = [
  {
    title: "Modern React from Zero to Hero",
    subtitle: "Build production-grade React apps with hooks, routing, and state management",
    description:
      "A complete, hands-on path through modern React. You will start with components and JSX, master hooks and state, learn data fetching patterns, and finish by shipping a real project with routing, forms, and authentication. Every lesson includes practical exercises.",
    category: "Web Development",
    level: "beginner",
    priceCents: 4900,
    thumbnail: thumb("react-course"),
    instructorIdx: 1,
    lessons: [
      {
        title: "Welcome & Course Setup",
        content:
          "What you will build in this course, how the curriculum is structured, and how to set up Node.js, VS Code, and your first Vite project.\n\nBy the end of this lesson you will have a running React dev server and know how to create and render your first component.",
        durationMin: 12,
      },
      {
        title: "Components, JSX & Props",
        content:
          "React apps are trees of components. In this lesson you learn how JSX compiles to function calls, how to pass data with props, and how to compose small components into larger interfaces.\n\nKey takeaways:\n- JSX syntax rules and expressions\n- Props and children\n- Component composition patterns",
        durationMin: 25,
      },
      {
        title: "State & Events with useState",
        content:
          "State makes interfaces interactive. You will learn how useState works, why state updates are asynchronous, and how to handle user events like clicks, typing, and form submissions.\n\nYou will build a counter, a toggle, and a controlled input from scratch.",
        durationMin: 30,
      },
      {
        title: "Side Effects & Data Fetching with useEffect",
        content:
          "Most real apps fetch data. This lesson covers the useEffect mental model, dependency arrays, cleanup functions, and a robust pattern for loading, error, and success states when calling APIs.",
        durationMin: 35,
      },
      {
        title: "Routing with React Router",
        content:
          "Single-page apps still need URLs. Learn how to define routes, dynamic segments, nested layouts, and programmatic navigation with React Router.",
        durationMin: 28,
      },
      {
        title: "Capstone: Build & Ship a Course Catalog",
        content:
          "Put everything together: a searchable, filterable catalog with detail pages, loading states, and a clean component architecture. Includes a deployment checklist.",
        durationMin: 45,
      },
    ],
    quiz: {
      title: "React Fundamentals Final Quiz",
      passScore: 70,
      questions: [
        {
          question: "What is JSX?",
          options: [
            "A template language that compiles to HTML",
            "A syntax extension that lets you write HTML-like code in JavaScript",
            "A CSS-in-JS library",
            "A browser API for rendering components",
          ],
          correctIndex: 1,
        },
        {
          question: "Which hook is used to manage local component state?",
          options: ["useEffect", "useContext", "useState", "useRef"],
          correctIndex: 2,
        },
        {
          question: "When does a useEffect callback with an empty dependency array run?",
          options: [
            "On every render",
            "Only once after the initial render",
            "Only when the component unmounts",
            "Never",
          ],
          correctIndex: 1,
        },
        {
          question: "How do you pass data from a parent component to a child?",
          options: ["Via props", "Via state", "Via refs", "Via effects"],
          correctIndex: 0,
        },
        {
          question: "What is the purpose of a key prop when rendering lists?",
          options: [
            "It styles the list items",
            "It helps React identify which items changed, were added, or removed",
            "It sorts the list",
            "It is required for accessibility",
          ],
          correctIndex: 1,
        },
      ],
    },
  },
  {
    title: "Python for Data Science",
    subtitle: "From notebooks to insights: pandas, visualization, and real datasets",
    description:
      "Learn the practical core of Python data science: Jupyter workflows, NumPy arrays, pandas DataFrames, data cleaning, and visualization with matplotlib. You will analyze real-world datasets and finish with an exploratory data analysis project.",
    category: "Data Science",
    level: "beginner",
    priceCents: 5900,
    thumbnail: thumb("python-data"),
    instructorIdx: 0,
    lessons: [
      {
        title: "Your Data Science Environment",
        content:
          "Set up Python, Jupyter, and the core scientific stack. Learn notebook workflows: cells, markdown, and reproducible analysis habits.",
        durationMin: 15,
      },
      {
        title: "NumPy Arrays & Vectorized Thinking",
        content:
          "Why NumPy is fast, how arrays differ from lists, broadcasting, and the vectorized operations that underpin all of pandas.",
        durationMin: 30,
      },
      {
        title: "pandas DataFrames I: Loading & Selecting",
        content:
          "Read CSVs, inspect data with head/info/describe, select columns and rows with loc/iloc, and filter with boolean masks.",
        durationMin: 35,
      },
      {
        title: "pandas DataFrames II: Cleaning & Transforming",
        content:
          "Handle missing values, fix dtypes, create derived columns, group and aggregate with groupby, and merge datasets.",
        durationMin: 40,
      },
      {
        title: "Visualization that Tells a Story",
        content:
          "Choose the right chart, build line/bar/scatter/histogram plots with matplotlib, and format figures for presentation.",
        durationMin: 30,
      },
      {
        title: "Project: Exploratory Data Analysis",
        content:
          "A guided end-to-end EDA on a real dataset: ask questions, clean, visualize, and communicate findings in a notebook report.",
        durationMin: 50,
      },
    ],
    quiz: {
      title: "Python Data Science Final Quiz",
      passScore: 70,
      questions: [
        {
          question: "Which pandas method shows the first rows of a DataFrame?",
          options: ["show()", "head()", "first()", "top()"],
          correctIndex: 1,
        },
        {
          question: "What does vectorization in NumPy help you avoid?",
          options: [
            "Using functions",
            "Writing explicit Python loops over elements",
            "Importing libraries",
            "Creating arrays",
          ],
          correctIndex: 1,
        },
        {
          question: "Which method groups rows and applies aggregations?",
          options: ["merge()", "pivot()", "groupby()", "concat()"],
          correctIndex: 2,
        },
        {
          question: "What is the typical way to handle missing numeric values before analysis?",
          options: [
            "Ignore them",
            "Drop or impute them deliberately",
            "Convert everything to strings",
            "Restart the notebook",
          ],
          correctIndex: 1,
        },
        {
          question: "Which chart is best for showing the distribution of a numeric variable?",
          options: ["Pie chart", "Histogram", "Stacked bar", "Table"],
          correctIndex: 1,
        },
      ],
    },
  },
  {
    title: "UI Design Foundations",
    subtitle: "Typography, color, layout, and design systems for digital products",
    description:
      "A practical foundation in visual interface design. Learn the principles behind clean, usable interfaces: hierarchy, spacing, typography, color, and components — then apply them in a redesign exercise.",
    category: "Design",
    level: "beginner",
    priceCents: 0,
    thumbnail: thumb("ui-design"),
    instructorIdx: 1,
    lessons: [
      {
        title: "Visual Hierarchy & Layout",
        content:
          "How users scan screens, the role of contrast and proximity, grids, and spacing systems that make interfaces feel ordered.",
        durationMin: 25,
      },
      {
        title: "Typography for Interfaces",
        content:
          "Choosing typefaces, setting a modular scale, line length and line height, and pairing fonts without chaos.",
        durationMin: 30,
      },
      {
        title: "Color Systems",
        content:
          "Building a palette: primary, neutrals, semantic colors, contrast ratios for accessibility, and dark mode considerations.",
        durationMin: 30,
      },
      {
        title: "Components & Design Systems",
        content:
          "Buttons, inputs, cards, and states. Why design systems exist, and how tokens keep products consistent at scale.",
        durationMin: 35,
      },
      {
        title: "Exercise: Redesign a Landing Page",
        content:
          "Apply everything: critique a cluttered page and redesign it with hierarchy, spacing, type, and color principles.",
        durationMin: 40,
      },
    ],
    quiz: {
      title: "UI Design Final Quiz",
      passScore: 70,
      questions: [
        {
          question: "What does visual hierarchy control?",
          options: [
            "The order in which users notice elements",
            "The file size of images",
            "The number of pages",
            "The font loading speed",
          ],
          correctIndex: 0,
        },
        {
          question: "What is a comfortable line length for body text?",
          options: ["20-30 characters", "45-75 characters", "100-140 characters", "Any length"],
          correctIndex: 1,
        },
        {
          question: "Why do semantic colors (success, warning, error) matter?",
          options: [
            "They look nice",
            "They communicate meaning consistently across the product",
            "They reduce CSS size",
            "They are required by browsers",
          ],
          correctIndex: 1,
        },
        {
          question: "What is a design token?",
          options: [
            "A password for design tools",
            "A named, reusable design decision like a color or spacing value",
            "A type of component",
            "A file format",
          ],
          correctIndex: 1,
        },
        {
          question: "What is the WCAG minimum contrast ratio for normal body text?",
          options: ["2:1", "3:1", "4.5:1", "10:1"],
          correctIndex: 2,
        },
      ],
    },
  },
  {
    title: "Machine Learning Essentials",
    subtitle: "Core ML concepts, model evaluation, and when (not) to use ML",
    description:
      "A concept-first introduction to machine learning: supervised vs unsupervised learning, overfitting, train/test splits, evaluation metrics, and a tour of classic algorithms. No heavy math — just solid intuition and practical judgment.",
    category: "AI & Machine Learning",
    level: "intermediate",
    priceCents: 7900,
    thumbnail: thumb("ml-essentials"),
    instructorIdx: 0,
    lessons: [
      {
        title: "What Machine Learning Actually Is",
        content:
          "From rules to learned patterns. Supervised, unsupervised, and reinforcement learning with real examples of each.",
        durationMin: 25,
      },
      {
        title: "The Modeling Workflow",
        content:
          "Framing the problem, collecting data, splitting train/validation/test, and why data leakage ruins models.",
        durationMin: 30,
      },
      {
        title: "Overfitting, Underfitting & Regularization",
        content:
          "The bias-variance tradeoff, learning curves, and practical techniques to make models generalize.",
        durationMin: 35,
      },
      {
        title: "Evaluation Metrics that Matter",
        content:
          "Accuracy vs precision/recall, ROC-AUC, and choosing metrics that match the business cost of errors.",
        durationMin: 30,
      },
      {
        title: "A Tour of Classic Algorithms",
        content:
          "Linear/logistic regression, decision trees, random forests, gradient boosting, and k-means — strengths and failure modes.",
        durationMin: 40,
      },
      {
        title: "When NOT to Use Machine Learning",
        content:
          "Rules, heuristics, and simple statistics often win. A decision framework for choosing the simplest thing that works.",
        durationMin: 25,
      },
    ],
    quiz: {
      title: "ML Essentials Final Quiz",
      passScore: 70,
      questions: [
        {
          question: "What is overfitting?",
          options: [
            "When a model is too simple",
            "When a model memorizes training data and fails on new data",
            "When training takes too long",
            "When the dataset is too small to load",
          ],
          correctIndex: 1,
        },
        {
          question: "Why do we keep a separate test set?",
          options: [
            "To train faster",
            "To estimate performance on unseen data honestly",
            "To make the dataset bigger",
            "To visualize results",
          ],
          correctIndex: 1,
        },
        {
          question: "High precision means:",
          options: [
            "Few false positives among predicted positives",
            "Few false negatives",
            "The model is fast",
            "The model uses less memory",
          ],
          correctIndex: 0,
        },
        {
          question: "Which algorithm is ensemble-based?",
          options: ["Linear regression", "Random forest", "k-means", "Naive Bayes"],
          correctIndex: 1,
        },
        {
          question: "Data leakage is dangerous because it:",
          options: [
            "Slows training",
            "Gives falsely optimistic evaluation results",
            "Deletes data",
            "Requires more storage",
          ],
          correctIndex: 1,
        },
      ],
    },
  },
  {
    title: "Startup Finance for Founders",
    subtitle: "Runway, unit economics, and reading your numbers like a CFO",
    description:
      "Financial literacy for builders: burn rate and runway, revenue models, unit economics (CAC, LTV, margins), and how to build a simple financial model investors respect.",
    category: "Business",
    level: "intermediate",
    priceCents: 6900,
    thumbnail: thumb("startup-finance"),
    instructorIdx: 1,
    lessons: [
      {
        title: "Burn Rate & Runway",
        content:
          "The two numbers that decide if your company lives. Gross vs net burn, calculating runway, and planning scenarios.",
        durationMin: 25,
      },
      {
        title: "Revenue Models & Pricing",
        content:
          "Subscription, usage, marketplace take rates, and one-time sales. How pricing structure shapes growth and cash flow.",
        durationMin: 30,
      },
      {
        title: "Unit Economics: CAC, LTV & Margins",
        content:
          "What you pay to acquire a customer vs what they are worth. Contribution margin, payback period, and healthy ratios.",
        durationMin: 35,
      },
      {
        title: "Building a Simple Financial Model",
        content:
          "A driver-based model in a spreadsheet: revenue build, cost structure, hiring plan, and cash forecast.",
        durationMin: 45,
      },
      {
        title: "Fundraising Numbers Investors Ask For",
        content:
          "ARR/MRR, growth rate, retention, burn multiple, and how to present your metrics credibly.",
        durationMin: 30,
      },
    ],
    quiz: {
      title: "Startup Finance Final Quiz",
      passScore: 70,
      questions: [
        {
          question: "Runway is calculated as:",
          options: [
            "Revenue divided by expenses",
            "Cash balance divided by net monthly burn",
            "Profit multiplied by 12",
            "Valuation divided by funding",
          ],
          correctIndex: 1,
        },
        {
          question: "CAC stands for:",
          options: [
            "Customer Acquisition Cost",
            "Capital Allocation Cost",
            "Cumulative Annual Cash",
            "Customer Account Credit",
          ],
          correctIndex: 0,
        },
        {
          question: "A commonly cited healthy LTV:CAC ratio is:",
          options: ["1:1 or lower", "3:1 or higher", "10:1 minimum", "Ratios do not matter"],
          correctIndex: 1,
        },
        {
          question: "Net burn equals:",
          options: [
            "All expenses",
            "Expenses minus revenue",
            "Revenue minus expenses",
            "Cash raised",
          ],
          correctIndex: 1,
        },
        {
          question: "MRR stands for:",
          options: [
            "Monthly Recurring Revenue",
            "Maximum Revenue Rate",
            "Marginal Return Ratio",
            "Monthly Run Rate",
          ],
          correctIndex: 0,
        },
      ],
    },
  },
  {
    title: "TypeScript Advanced Patterns",
    subtitle: "Generics, type-level programming, and bulletproof architectures",
    description:
      "Go beyond the basics: generics done right, conditional types, template literal types, discriminated unions, and patterns for type-safe APIs and state machines. For developers who already ship TypeScript.",
    category: "Web Development",
    level: "advanced",
    priceCents: 8900,
    thumbnail: thumb("ts-advanced"),
    instructorIdx: 0,
    lessons: [
      {
        title: "Generics Done Right",
        content:
          "Constraints, inference, variance intuition, and when generics clarify vs when they obfuscate.",
        durationMin: 35,
      },
      {
        title: "Discriminated Unions & Exhaustiveness",
        content:
          "Modeling state with tagged unions, the never trick for exhaustive switches, and eliminating impossible states.",
        durationMin: 30,
      },
      {
        title: "Conditional Types & infer",
        content:
          "Type-level logic: extracting types with infer, distributivity, and building utility types from scratch.",
        durationMin: 40,
      },
      {
        title: "Template Literal Types",
        content:
          "String types with superpowers: event maps, route builders, and type-safe i18n keys.",
        durationMin: 30,
      },
      {
        title: "Type-Safe API Layers",
        content:
          "End-to-end types from server to client, schema validation with Zod, and deriving types instead of duplicating them.",
        durationMin: 40,
      },
      {
        title: "Project: A Typed State Machine",
        content:
          "Build a fully typed finite state machine for a checkout flow — compile errors instead of runtime bugs.",
        durationMin: 50,
      },
    ],
    quiz: {
      title: "TypeScript Advanced Final Quiz",
      passScore: 70,
      questions: [
        {
          question: "A discriminated union requires:",
          options: [
            "A common literal tag field on each variant",
            "Classes with inheritance",
            "At least three variants",
            "Generic type parameters",
          ],
          correctIndex: 0,
        },
        {
          question: "The infer keyword is used to:",
          options: [
            "Import types",
            "Extract a type within a conditional type",
            "Create runtime values",
            "Narrow string types",
          ],
          correctIndex: 1,
        },
        {
          question: "Template literal types operate on:",
          options: ["Numbers", "Strings", "Objects", "Functions"],
          correctIndex: 1,
        },
        {
          question: "Why derive types from schemas (e.g., Zod) instead of writing them twice?",
          options: [
            "It is faster to type",
            "Single source of truth — types cannot drift from validation",
            "It uses less memory",
            "It is required by the compiler",
          ],
          correctIndex: 1,
        },
        {
          question: "Exhaustiveness checking with never helps you:",
          options: [
            "Delete unused code",
            "Get a compile error when a union variant is unhandled",
            "Speed up builds",
            "Avoid using enums",
          ],
          correctIndex: 1,
        },
      ],
    },
  },
];

async function seed() {
  const db = getDb();
  console.log("Seeding LearnHub database...");

  // Instructors (upsert)
  const instructorIds: number[] = [];
  for (const inst of SEED_INSTRUCTORS) {
    await db
      .insert(users)
      .values(inst)
      .onDuplicateKeyUpdate({ set: { name: inst.name } });
    const row = await db.query.users.findFirst({
      where: eq(users.unionId, inst.unionId),
    });
    instructorIds.push(row!.id);
  }

  // Courses
  for (const c of SEED_COURSES) {
    const existing = await db.query.courses.findFirst({
      where: eq(courses.title, c.title),
    });
    let courseId: number;
    if (existing) {
      courseId = existing.id;
      console.log(`Course exists, refreshing content: ${c.title}`);
      // Clear old content for idempotent re-seed
      const oldQuiz = await db.query.quizzes.findFirst({
        where: eq(quizzes.courseId, courseId),
      });
      if (oldQuiz) {
        await db.delete(quizQuestions).where(eq(quizQuestions.quizId, oldQuiz.id));
        await db.delete(quizzes).where(eq(quizzes.id, oldQuiz.id));
      }
      await db.delete(lessons).where(eq(lessons.courseId, courseId));
    } else {
      const [{ id }] = await db
        .insert(courses)
        .values({
          title: c.title,
          subtitle: c.subtitle,
          description: c.description,
          category: c.category,
          level: c.level,
          priceCents: c.priceCents,
          thumbnail: c.thumbnail,
          instructorId: instructorIds[c.instructorIdx],
          published: true,
        })
        .$returningId();
      courseId = id;
      console.log(`Created course: ${c.title}`);
    }

    await db.insert(lessons).values(
      c.lessons.map((l, i) => ({
        courseId,
        title: l.title,
        content: l.content,
        videoUrl: l.videoUrl,
        durationMin: l.durationMin,
        orderIndex: i,
      })),
    );

    const [{ id: quizId }] = await db
      .insert(quizzes)
      .values({
        courseId,
        title: c.quiz.title,
        passScore: c.quiz.passScore,
      })
      .$returningId();
    await db.insert(quizQuestions).values(
      c.quiz.questions.map((q, i) => ({
        quizId,
        question: q.question,
        options: q.options,
        correctIndex: q.correctIndex,
        orderIndex: i,
      })),
    );
  }

  console.log("Done.");
  process.exit(0);
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
