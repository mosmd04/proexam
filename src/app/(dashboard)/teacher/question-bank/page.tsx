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

    // Fetch all courses in the system so the teacher can select them for imports/AI generation
    const allCourses = await prisma.course.findMany({
        orderBy: { code: 'asc' }
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
        allCourses: allCourses.map(c => ({ id: c.id, code: c.code, name: c.name })),
        questions: questions.map(q => {
            let choices: any[] = [];
            if (q.choicesPayload && typeof q.choicesPayload === 'object') {
                if (Array.isArray(q.choicesPayload)) {
                    choices = q.choicesPayload;
                } else if ('options' in (q.choicesPayload as any) && Array.isArray((q.choicesPayload as any).options)) {
                    choices = (q.choicesPayload as any).options;
                }
            }

            return {
                id: q.id,
                text: q.text,
                type: q.questionType,
                points: q.defaultPoints,
                courseId: q.courseId,
                courseCode: q.course.code,
                createdAt: q.createdAt,
                difficulty: q.difficulty === 1 ? 'سهل' : q.difficulty === 5 ? 'صعب' : 'متوسط',
                choices: choices
            };
        })
    };

    return <TeacherQuestionBankClient data={data} />;
}
