import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import TeacherExamsClient from "./TeacherExamsClient";

export default async function TeacherExamsPage() {
  const user = await requireAuth();
  const now = new Date();

  // First, let's do a quick pass to auto-update exam statuses based on time
  const examsToUpdate = await prisma.exam.findMany({
    where: { 
      createdById: user.id,
      status: { in: ['PUBLISHED', 'ACTIVE'] } 
    }
  });

  for (const exam of examsToUpdate) {
    if (exam.status === 'PUBLISHED' && exam.scheduledStart && exam.scheduledStart <= now) {
      await prisma.exam.update({ where: { id: exam.id }, data: { status: 'ACTIVE' } });
    }
    if (exam.status === 'ACTIVE' && exam.scheduledEnd && exam.scheduledEnd <= now) {
      // Auto complete expired exams
      await prisma.exam.update({ where: { id: exam.id }, data: { status: 'COMPLETED' } });
      
      // Also auto-submit any IN_PROGRESS attempts for this exam
      const pendingAttempts = await prisma.examAttempt.findMany({
        where: { examId: exam.id, status: 'IN_PROGRESS' },
        include: { exam: { include: { examQuestions: true } } }
      });
      
      for (const attempt of pendingAttempts) {
        // Simple auto-submit without calculating score yet (teacher will do it in grading)
        await prisma.examAttempt.update({
          where: { id: attempt.id },
          data: { status: 'FORCE_SUBMITTED_BY_SYSTEM', submittedAt: new Date() }
        });
      }
    }
  }

  // Fetch updated exams
  const exams = await prisma.exam.findMany({
    where: { createdById: user.id },
    include: {
      course: true,
      _count: {
        select: { examAttempts: true, examQuestions: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  // Calculate statistics
  const totalExams = exams.length;
  const activeExams = exams.filter(e => e.status === 'ACTIVE').length;
  const scheduledExams = exams.filter(e => e.status === 'PUBLISHED' && e.scheduledStart && e.scheduledStart > new Date()).length;
  const completedExams = exams.filter(e => e.status === 'COMPLETED').length;

  const data = {
    exams: exams.map(e => ({
      id: e.id,
      title: e.title,
      status: e.status,
      courseCode: e.course.code,
      courseName: e.course.name,
      scheduledStart: e.scheduledStart,
      durationMinutes: e.durationMinutes,
      questionsCount: e._count.examQuestions,
      attemptsCount: e._count.examAttempts,
      updatedAt: e.updatedAt
    })),
    stats: {
      total: totalExams,
      active: activeExams,
      scheduled: scheduledExams,
      completed: completedExams
    }
  };

  return <TeacherExamsClient data={data} />;
}
