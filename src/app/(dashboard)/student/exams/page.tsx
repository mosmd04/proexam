import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import StudentExamsClient from "./StudentExamsClient";

export default async function StudentExamsPage() {
    const user = await requireAuth();

    // Fetch courses student is enrolled in
    const enrollments = await prisma.courseEnrollment.findMany({
        where: { userId: user.id, role: 'STUDENT' },
        select: { courseId: true, course: { select: { code: true, name: true } } }
    });

    const courseIds = enrollments.map(e => e.courseId);

    // Fetch exams for these courses that are either ACTIVE or PUBLISHED
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

    // Check if the student has already taken the exam or maxed out attempts
    const processedExams = exams.map(exam => {
        const attemptsCount = exam.examAttempts.length;
        const hasFinished = exam.examAttempts.some(a => a.status === 'SUBMITTED' || a.status === 'GRADED');
        const canTake = !hasFinished && attemptsCount < exam.maxAttempts;

        return {
            id: exam.id,
            title: exam.title,
            courseName: exam.course.name,
            courseCode: exam.course.code,
            description: exam.description,
            durationMinutes: exam.durationMinutes,
            scheduledStart: exam.scheduledStart,
            status: exam.status,
            canTake: canTake,
            attemptsCount: attemptsCount,
            maxAttempts: exam.maxAttempts
        };
    });

    const activeExams = processedExams.filter(e => e.status === 'ACTIVE');
    const scheduledExams = processedExams.filter(e => e.status === 'PUBLISHED');

    const data = {
        activeExams,
        scheduledExams
    };

    return <StudentExamsClient data={data} />;
}
