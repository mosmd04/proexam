import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import StudentCalendarClient from "./StudentCalendarClient";

export default async function StudentCalendarPage() {
    const user = await requireAuth();

    // Fetch courses student is enrolled in
    const enrollments = await prisma.courseEnrollment.findMany({
        where: { userId: user.id, role: 'STUDENT' },
        select: { courseId: true, course: { select: { code: true, name: true } } }
    });

    const courseIds = enrollments.map(e => e.courseId);

    // Fetch exams for these courses that are ACTIVE or PUBLISHED
    const exams = await prisma.exam.findMany({
        where: {
            courseId: { in: courseIds },
            status: { in: ['ACTIVE', 'PUBLISHED'] }
        },
        include: {
            course: true,
            examAttempts: {
                where: { studentId: user.id }
            }
        },
        orderBy: { scheduledStart: 'asc' }
    });

    const scheduledExams = exams.map(exam => {
        const attemptsCount = exam.examAttempts.length;
        const hasFinished = exam.examAttempts.some(a => a.status === 'SUBMITTED' || a.status === 'GRADED');
        
        return {
            id: exam.id,
            title: exam.title,
            courseName: exam.course.name,
            courseCode: exam.course.code,
            description: exam.description,
            durationMinutes: exam.durationMinutes,
            scheduledStart: exam.scheduledStart,
            status: exam.status,
            hasFinished: hasFinished
        };
    });

    const data = {
        scheduledExams
    };

    return <StudentCalendarClient data={data} />;
}
