import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import TeacherStudentsClient from "./TeacherStudentsClient";

export default async function TeacherStudentsPage() {
    const user = await requireAuth();

    // Find courses where this teacher teaches
    const teacherEnrollments = await prisma.courseEnrollment.findMany({
        where: { userId: user.id, role: 'TEACHER' },
        select: { courseId: true, course: { select: { name: true, code: true } } }
    });

    const teacherCourseIds = teacherEnrollments.map(te => te.courseId);
    
    const courses = teacherEnrollments.map(te => ({
        id: te.courseId,
        name: te.course.name,
        code: te.course.code
    }));

    // Find all students in these courses
    const studentEnrollments = await prisma.courseEnrollment.findMany({
        where: {
            courseId: { in: teacherCourseIds },
            role: 'STUDENT'
        },
        include: {
            user: true,
            course: true
        }
    });

    // Find exams created by this teacher
    const exams = await prisma.exam.findMany({
        where: { createdById: user.id }
    });
    
    const examIds = exams.map(e => e.id);

    // Fetch exam attempts for these students on teacher's exams
    const attempts = await prisma.examAttempt.findMany({
        where: {
            examId: { in: examIds },
        },
        include: { exam: true }
    });

    // Calculate students stats
    let totalScoreSum = 0;
    let gradedAttemptsCount = 0;
    let atRiskCount = 0;

    const studentsMap = new Map();

    studentEnrollments.forEach(en => {
        const studentId = en.userId;
        if (!studentsMap.has(studentId)) {
            studentsMap.set(studentId, {
                id: studentId,
                name: en.user.name,
                email: en.user.email,
                enrollments: [],
                attempts: [],
                totalScore: 0,
                maxScore: 0,
                completedExams: 0,
                atRisk: false
            });
        }
        studentsMap.get(studentId).enrollments.push(en.course.code);
    });

    attempts.forEach(attempt => {
        if (studentsMap.has(attempt.studentId) && attempt.status === 'GRADED') {
            const student = studentsMap.get(attempt.studentId);
            student.attempts.push(attempt);
            student.totalScore += (attempt.score || 0);
            student.maxScore += attempt.exam.totalPoints;
            student.completedExams += 1;

            totalScoreSum += ((attempt.score || 0) / attempt.exam.totalPoints) * 100;
            gradedAttemptsCount += 1;
        }
    });

    const studentsList = Array.from(studentsMap.values()).map(student => {
        let avgScore = 0;
        if (student.maxScore > 0) {
            avgScore = (student.totalScore / student.maxScore) * 100;
        }
        if (avgScore < 50 && student.completedExams > 0) {
            student.atRisk = true;
            atRiskCount += 1;
        }
        return {
            ...student,
            avgScore: avgScore.toFixed(1)
        };
    });

    const classAverage = gradedAttemptsCount > 0 ? (totalScoreSum / gradedAttemptsCount).toFixed(1) : 0;

    const data = {
        courses,
        totalStudents: studentsList.length,
        classAverage,
        atRiskCount,
        students: studentsList
    };

    return <TeacherStudentsClient data={data} />;
}
