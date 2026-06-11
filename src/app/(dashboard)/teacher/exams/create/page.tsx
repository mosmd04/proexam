import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import CreateExamClient from "./CreateExamClient";

export default async function CreateExamPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }> | { id?: string };
}) {
  const resolvedSearchParams = await searchParams;
  const examId = resolvedSearchParams?.id;
  const user = await auth();
  
  // Fetch courses assigned to this teacher
  let courses: any[] = [];
  if (user) {
    const enrollments = await prisma.courseEnrollment.findMany({
      where: { userId: user.id, role: "TEACHER" },
      include: { course: true }
    });
    courses = enrollments.map(e => e.course);
  }

  // Fallback if no auth/no courses (for testing purpose, we fetch all courses)
  if (courses.length === 0) {
    courses = await prisma.course.findMany();
  }

  // Fetch question bank questions for these courses
  let questionBank: any[] = [];
  if (user) {
    questionBank = await prisma.question.findMany({
      where: {
        courseId: { in: courses.map(c => c.id) },
        isActive: true
      },
      orderBy: { createdAt: "desc" }
    });
  }

  // Serialize and map question type & default points safely
  const serializedQuestionBank = questionBank.map(q => ({
    id: q.id,
    courseId: q.courseId,
    type: (q.questionType === "MCQ" ? "mcq" : q.questionType === "TRUE_FALSE" ? "tf" : "essay") as "mcq" | "tf" | "essay",
    text: q.text,
    points: Number(q.defaultPoints),
    options: q.choicesPayload ? JSON.parse(JSON.stringify(q.choicesPayload)) : null
  }));

  // Fetch the exam if editing/completing a draft
  let exam: any = null;
  if (examId) {
    exam = await prisma.exam.findUnique({
      where: { id: examId },
      include: {
        examQuestions: {
          orderBy: { sortOrder: "asc" }
        }
      }
    });
  }

  // Serialize the exam object safely for frontend
  let serializedExam = null;
  if (exam) {
    serializedExam = {
      id: exam.id,
      title: exam.title,
      courseId: exam.courseId,
      description: exam.description || "",
      durationMinutes: exam.durationMinutes,
      shuffleQuestions: exam.shuffleQuestions,
      enableProctoring: exam.enableProctoring,
      scheduledStart: exam.scheduledStart ? exam.scheduledStart.toISOString() : "",
      scheduledEnd: exam.scheduledEnd ? exam.scheduledEnd.toISOString() : "",
      questions: exam.examQuestions.map((eq: any, idx: number) => ({
        id: idx + 1, // Generate temporary unique numeric ID for frontend
        type: eq.questionType === "MCQ" ? "mcq" : eq.questionType === "TRUE_FALSE" ? "tf" : "essay",
        text: eq.text,
        points: Number(eq.points),
        options: eq.choicesPayload ? JSON.parse(JSON.stringify(eq.choicesPayload)) : null,
        sourceQuestionId: eq.sourceQuestionId || undefined,
        saveToBank: false
      }))
    };
  }

  return (
    <CreateExamClient 
      courses={courses} 
      questionBank={serializedQuestionBank} 
      exam={serializedExam} 
    />
  );
}
