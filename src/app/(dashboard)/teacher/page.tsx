import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import TeacherDashboardClient from "./TeacherDashboardClient";

export default async function TeacherDashboard() {
  const user = await requireAuth();

  // Find all courses this teacher is associated with (if any)
  // Or just find exams created by this teacher
  const activeExamsCount = await prisma.exam.count({
    where: { 
      createdById: user.id,
      status: 'ACTIVE'
    }
  });

  const allExamsCount = await prisma.exam.count({
    where: { 
      createdById: user.id
    }
  });

  const questionBankCount = await prisma.question.count({
    where: {
      createdById: user.id
    }
  });

  // Ungraded attempts for teacher's exams
  const ungradedAttemptsCount = await prisma.examAttempt.count({
    where: {
      exam: {
        createdById: user.id
      },
      status: {
        in: ['SUBMITTED', 'FORCE_SUBMITTED_BY_SYSTEM', 'FORCE_SUBMITTED_BY_TEACHER']
      }
    }
  });

  // Calculate Average Pass Rate for teacher's graded attempts
  // A student passes if their score >= exam's passingScore
  // We fetch graded attempts
  const gradedAttempts = await prisma.examAttempt.findMany({
    where: {
      exam: { createdById: user.id },
      status: 'GRADED'
    },
    include: { exam: true }
  });

  let passRate = 0;
  if (gradedAttempts.length > 0) {
    const passedCount = gradedAttempts.filter(a => (a.score || 0) >= (a.exam.passingScore || 50)).length;
    passRate = (passedCount / gradedAttempts.length) * 100;
  }

  // Upcoming exams for this teacher
  const upcomingExams = await prisma.exam.findMany({
    where: {
      createdById: user.id,
      status: 'PUBLISHED',
      scheduledStart: { gt: new Date() }
    },
    orderBy: { scheduledStart: 'asc' },
    take: 5
  });

  const currentDateStr = new Intl.DateTimeFormat('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }).format(new Date());

  const activeExam = await prisma.exam.findFirst({
    where: { status: 'ACTIVE', createdById: user.id },
    select: { id: true, title: true }
  });

  const data = {
    teacherName: user.name,
    currentDateStr,
    activeExamsCount,
    allExamsCount,
    questionBankCount,
    ungradedAttemptsCount,
    passRate: passRate.toFixed(1),
    upcomingExams: upcomingExams.map(ex => ({
      id: ex.id,
      title: ex.title,
      startTime: ex.scheduledStart,
    })),
    activeExamId: activeExam?.id || null,
    activeExamTitle: activeExam?.title || null
  };

  return <TeacherDashboardClient data={data} />;
}
