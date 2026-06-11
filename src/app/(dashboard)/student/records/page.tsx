import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import StudentRecordsClient from "./StudentRecordsClient";

export default async function StudentRecordsPage() {
    const user = await requireAuth();

    // Fetch all graded attempts for the student
    const attempts = await prisma.examAttempt.findMany({
        where: { studentId: user.id, status: 'GRADED' },
        include: {
            exam: {
                include: { course: true }
            }
        },
        orderBy: { submittedAt: 'desc' }
    });

    let totalPoints = 0;
    let earnedPoints = 0;

    const records = attempts.map(attempt => {
        const score = attempt.score || 0;
        const maxScore = attempt.exam.totalPoints;
        totalPoints += maxScore;
        earnedPoints += score;

        const passingScore = attempt.exam.passingScore || 50;
        const scorePercentage = (score / maxScore) * 100;
        
        let status = 'رسوب';
        if (scorePercentage >= passingScore) {
            status = scorePercentage >= 85 ? 'اجتياز بتفوق' : 'اجتياز';
        }

        return {
            id: attempt.id,
            courseName: attempt.exam.course.name,
            courseCode: attempt.exam.course.code,
            examTitle: attempt.exam.title,
            submittedAt: attempt.submittedAt,
            score: score,
            maxScore: maxScore,
            status: status
        };
    });

    let gpa = 0.0;
    if (totalPoints > 0) {
        // Simple GPA calculation (percentage scaled to 4.0)
        gpa = (earnedPoints / totalPoints) * 4.0;
    }

    const data = {
        gpa: gpa.toFixed(2),
        records
    };

    return <StudentRecordsClient data={data} />;
}
