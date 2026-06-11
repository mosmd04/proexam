import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import TeacherAnalyticsClient from "./TeacherAnalyticsClient";

export default async function TeacherAnalyticsPage() {
    const user = await requireAuth();

    // Fetch exams by this teacher
    const exams = await prisma.exam.findMany({
        where: { createdById: user.id },
        include: { course: true }
    });

    const examIds = exams.map(e => e.id);

    // Fetch attempts
    const attempts = await prisma.examAttempt.findMany({
        where: { examId: { in: examIds }, status: 'GRADED' },
        include: { exam: true }
    });

    // Calculate overall stats
    const totalStudents = new Set(attempts.map(a => a.studentId)).size;
    let totalScoreSum = 0;
    let passedCount = 0;

    const examStatsMap = new Map();

    exams.forEach(ex => {
        examStatsMap.set(ex.id, {
            id: ex.id,
            title: ex.title,
            courseName: ex.course.name,
            courseCode: ex.course.code,
            attempts: 0,
            maxScore: 0,
            minScore: 100,
            totalScore: 0,
            passed: 0
        });
    });

    attempts.forEach(attempt => {
        const scorePercentage = (attempt.score || 0) / attempt.exam.totalPoints * 100;
        totalScoreSum += scorePercentage;
        
        const passingScore = attempt.exam.passingScore || 50;
        if (scorePercentage >= passingScore) {
            passedCount++;
        }

        const eStat = examStatsMap.get(attempt.examId);
        if (eStat) {
            eStat.attempts += 1;
            eStat.totalScore += scorePercentage;
            if (scorePercentage > eStat.maxScore) eStat.maxScore = scorePercentage;
            if (scorePercentage < eStat.minScore) eStat.minScore = scorePercentage;
            if (scorePercentage >= passingScore) eStat.passed += 1;
        }
    });

    const overallAverage = attempts.length > 0 ? (totalScoreSum / attempts.length).toFixed(1) : 0;
    const overallPassRate = attempts.length > 0 ? ((passedCount / attempts.length) * 100).toFixed(1) : 0;

    const recentExams = Array.from(examStatsMap.values()).filter(e => e.attempts > 0).map(e => ({
        ...e,
        average: (e.totalScore / e.attempts).toFixed(1),
        passRate: ((e.passed / e.attempts) * 100).toFixed(1)
    }));

    const data = {
        overallAverage,
        totalStudents,
        overallPassRate,
        completedExamsCount: Array.from(examStatsMap.values()).filter(e => e.attempts > 0).length,
        recentExams
    };

    return <TeacherAnalyticsClient data={data} />;
}
