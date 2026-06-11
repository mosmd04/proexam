import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import TeacherAppealsClient from "./TeacherAppealsClient";

export default async function TeacherAppealsPage() {
  const user = await requireAuth();
  
  // Fetch appeals for exams created by this teacher
  const appeals = await prisma.examAppeal.findMany({
    where: {
      attempt: {
        exam: {
          createdById: user.id
        }
      }
    },
    include: {
      attempt: {
        include: {
          exam: {
            include: { course: true }
          },
          student: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  const serializedAppeals = appeals.map(app => ({
    id: app.id,
    reason: app.reason,
    status: app.status,
    pointsAdded: app.pointsAdded,
    teacherNotes: app.teacherNotes || "",
    createdAt: app.createdAt.toISOString(),
    studentName: app.attempt.student.name,
    studentEmail: app.attempt.student.email,
    examTitle: app.attempt.exam.title,
    courseName: app.attempt.exam.course.name,
    courseCode: app.attempt.exam.course.code,
    attemptScore: app.attempt.score || 0,
    attemptMaxScore: app.attempt.exam.totalPoints,
    attemptId: app.attemptId
  }));

  return <TeacherAppealsClient appeals={serializedAppeals} />;
}
