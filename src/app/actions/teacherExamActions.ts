"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { submitExamAction } from "./submitExam";

export async function forceEndExamAction(examId: string) {
  const user = await auth();
  if (!user) throw new Error("Unauthorized");

  // Verify the user is the creator of the exam
  const exam = await prisma.exam.findFirst({
    where: { id: examId, createdById: user.id },
    include: {
      examAttempts: {
        where: { status: "IN_PROGRESS" },
        include: { exam: { include: { examQuestions: true } } }
      }
    }
  });

  if (!exam) throw new Error("Exam not found or you are not authorized");

  // For every attempt that is still IN_PROGRESS, auto-submit it
  for (const attempt of exam.examAttempts) {
    let score = 0;
    
    // Auto-grade existing answers or assume 0
    const answers = await prisma.studentAnswer.findMany({
      where: { attemptId: attempt.id }
    });

    for (const q of attempt.exam.examQuestions) {
        const studentAnswerRec = answers.find(a => a.examQuestionId === q.id);
        const studentAnswer = studentAnswerRec ? String(studentAnswerRec.answerPayload) : null;
        let isCorrect = false;

        if (studentAnswer && (q.questionType === "MCQ" || q.questionType === "TRUE_FALSE")) {
            const payload: any = q.choicesPayload;
            if (q.questionType === "MCQ" && payload && payload.options) {
                const correctOpt = payload.options.find((o: any) => o.isCorrect);
                if (correctOpt && correctOpt.text === studentAnswer) {
                    isCorrect = true;
                    score += q.points;
                }
            } else if (q.questionType === "TRUE_FALSE" && payload) {
                const studentBool = studentAnswer === 'TRUE';
                if (studentBool === payload.correctAnswer) {
                    isCorrect = true;
                    score += q.points;
                }
            }
        }

        // We only upsert if they hadn't saved an answer yet, or update the points.
        await prisma.studentAnswer.upsert({
            where: {
                attemptId_examQuestionId: {
                    attemptId: attempt.id,
                    examQuestionId: q.id
                }
            },
            update: {
                pointsAwarded: isCorrect ? q.points : 0
            },
            create: {
                attemptId: attempt.id,
                examQuestionId: q.id,
                answerPayload: studentAnswer || "",
                pointsAwarded: isCorrect ? q.points : 0
            }
        });
    }

    // Finalize attempt
    await prisma.examAttempt.update({
      where: { id: attempt.id },
      data: {
        status: "FORCE_SUBMITTED_BY_TEACHER",
        submittedAt: new Date(),
        score: score
      }
    });
  }

  // Update exam status to COMPLETED
  await prisma.exam.update({
    where: { id: exam.id },
    data: { status: "COMPLETED" }
  });

  return true;
}
