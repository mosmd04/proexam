"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function submitExamAction(attemptId: string, answers: Record<string, string>) {
  const user = await auth();
  if (!user) throw new Error("Unauthorized");

  const attempt = await prisma.examAttempt.findFirst({
    where: { id: attemptId, studentId: user.id },
    include: { exam: { include: { examQuestions: true } } }
  });

  if (!attempt) throw new Error("Attempt not found");
  if (attempt.status !== "IN_PROGRESS") throw new Error("Exam already submitted");

  let score = 0;

  // Grade the answers automatically where possible (MCQ / TRUE_FALSE)
  for (const q of attempt.exam.examQuestions) {
    const studentAnswer = answers[q.id];
    let isCorrect = false;

    if (q.questionType === "MCQ" || q.questionType === "TRUE_FALSE") {
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

    // Save answer
    await prisma.studentAnswer.upsert({
      where: {
        attemptId_examQuestionId: {
          attemptId: attempt.id,
          examQuestionId: q.id
        }
      },
      update: {
        answerPayload: studentAnswer || "",
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
      status: "SUBMITTED",
      submittedAt: new Date(),
      score: score
    }
  });

  return true;
}

export async function gradeEssayAnswer(answerId: string, points: number, feedback: string) {
  const user = await auth();
  if (!user) throw new Error("Unauthorized");

  await prisma.studentAnswer.update({
    where: { id: answerId },
    data: {
      pointsAwarded: points,
      feedback: feedback
    }
  });
  return true;
}

export async function finalizeAttemptGrade(attemptId: string) {
  const user = await auth();
  if (!user) throw new Error("Unauthorized");

  const answers = await prisma.studentAnswer.findMany({
    where: { attemptId }
  });

  const totalScore = answers.reduce((sum, a) => sum + (a.pointsAwarded || 0), 0);

  await prisma.examAttempt.update({
    where: { id: attemptId },
    data: {
      score: totalScore,
      status: "GRADED"
    }
  });

  return true;
}

/**
 * Saves a single student answer incrementally during the exam
 */
export async function saveSingleAnswerAction(
  attemptId: string,
  examQuestionId: string,
  answer: string,
  flaggedForReview: boolean
) {
  const user = await auth();
  if (!user) throw new Error("Unauthorized");

  const attempt = await prisma.examAttempt.findFirst({
    where: { id: attemptId, studentId: user.id }
  });

  if (!attempt) throw new Error("Attempt not found");
  if (attempt.status !== "IN_PROGRESS") throw new Error("Exam already submitted");

  await prisma.studentAnswer.upsert({
    where: {
      attemptId_examQuestionId: {
        attemptId,
        examQuestionId
      }
    },
    update: {
      answerPayload: answer,
      flaggedForReview
    },
    create: {
      attemptId,
      examQuestionId,
      answerPayload: answer,
      flaggedForReview
    }
  });

  return { success: true };
}

/**
 * Synchronizes multiple unsynced answers queued offline
 */
export async function syncAnswersAction(
  attemptId: string,
  answers: Array<{ examQuestionId: string; answer: string; flaggedForReview: boolean }>
) {
  const user = await auth();
  if (!user) throw new Error("Unauthorized");

  const attempt = await prisma.examAttempt.findFirst({
    where: { id: attemptId, studentId: user.id }
  });

  if (!attempt) throw new Error("Attempt not found");
  if (attempt.status !== "IN_PROGRESS") throw new Error("Exam already submitted");

  // Perform bulk upserts inside a transaction
  await prisma.$transaction(
    answers.map((ans) =>
      prisma.studentAnswer.upsert({
        where: {
          attemptId_examQuestionId: {
            attemptId,
            examQuestionId: ans.examQuestionId
          }
        },
        update: {
          answerPayload: ans.answer,
          flaggedForReview: ans.flaggedForReview
        },
        create: {
          attemptId,
          examQuestionId: ans.examQuestionId,
          answerPayload: ans.answer,
          flaggedForReview: ans.flaggedForReview
        }
      })
    )
  );

  return { success: true };
}
