import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import CreateExamClient from "./CreateExamClient";

export default async function CreateExamPage() {
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

  return <CreateExamClient courses={courses} questionBank={serializedQuestionBank} />;
}
