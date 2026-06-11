import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import LiveExamClient from "./LiveExamClient";

export default async function LiveExamPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: examId } = await params;
  const user = await auth();

  if (!user) {
    redirect("/login");
  }

  const exam = await prisma.exam.findUnique({
    where: { id: examId },
    include: {
      course: true,
      examQuestions: {
        orderBy: { sortOrder: 'asc' }
      }
    }
  });

  if (!exam) {
    return <div className="p-10 text-center text-xl font-bold">الامتحان غير موجود</div>;
  }

  // Security Check: Is student enrolled?
  const enrollment = await prisma.courseEnrollment.findFirst({
    where: { courseId: exam.courseId, userId: user.id }
  });

  if (!enrollment) {
    return <div className="p-10 text-center text-xl text-danger font-bold">غير مصرح لك بدخول هذا الامتحان</div>;
  }

  // Time Validation
  const now = new Date();
  if (exam.scheduledStart && now < exam.scheduledStart) {
    return <div className="p-10 text-center text-xl text-warning font-bold">الامتحان لم يبدأ بعد. موعد البدء: {exam.scheduledStart.toLocaleString('ar-EG')}</div>;
  }

  if (exam.scheduledEnd && now > exam.scheduledEnd) {
    return <div className="p-10 text-center text-xl text-danger font-bold">عذراً، لقد انتهى وقت هذا الامتحان في {exam.scheduledEnd.toLocaleString('ar-EG')}</div>;
  }

  // Attempt Check/Create
  let attempt = await prisma.examAttempt.findUnique({
    where: {
      examId_studentId_attemptNumber: {
        examId: exam.id,
        studentId: user.id,
        attemptNumber: 1
      }
    }
  });

  if (!attempt) {
    attempt = await prisma.examAttempt.create({
      data: {
        examId: exam.id,
        studentId: user.id,
        status: "IN_PROGRESS",
        startedAt: now,
        expiresAt: new Date(now.getTime() + exam.durationMinutes * 60000)
      }
    });
  } else if (attempt.status !== "IN_PROGRESS") {
    return <div className="p-10 text-center text-xl text-success font-bold">لقد قمت بتسليم هذا الامتحان مسبقاً.</div>;
  }

  return <LiveExamClient exam={exam} attemptId={attempt.id} userName={user.name} />;
}
