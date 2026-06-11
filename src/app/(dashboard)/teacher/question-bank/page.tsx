import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import TeacherQuestionBankClient from "./TeacherQuestionBankClient";

export default async function QuestionBankPage() {
    const user = await requireAuth();

    // Fetch questions created by this teacher
    const questions = await prisma.question.findMany({
        where: { createdById: user.id },
        include: {
            course: true,
        },
        orderBy: { createdAt: 'desc' }
    });

    // Group questions by course to create folders
    const coursesMap = new Map();
    questions.forEach((q) => {
        if (!coursesMap.has(q.courseId)) {
            coursesMap.set(q.courseId, {
                id: q.courseId,
                code: q.course.code,
                name: q.course.name,
                count: 0
            });
        }
        coursesMap.get(q.courseId).count += 1;
    });

    const courses = Array.from(coursesMap.values());

    const data = {
        totalQuestions: questions.length,
        courses: courses,
        questions: questions.map(q => ({
            id: q.id,
            text: q.text,
            type: q.questionType,
            points: q.defaultPoints,
            courseId: q.courseId,
            courseCode: q.course.code,
            createdAt: q.createdAt,
            difficulty: q.difficulty === 1 ? 'سهل' : q.difficulty === 5 ? 'صعب' : 'متوسط',
            choices: Array.isArray(q.choicesPayload) ? q.choicesPayload : []
        }))
    };

    return <TeacherQuestionBankClient data={data} />;
}
