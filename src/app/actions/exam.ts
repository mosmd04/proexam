"use server"

import { prisma } from "@/lib/prisma";

export async function saveStudentAnswer(
  attemptId: string,
  examQuestionId: string,
  answerPayload: any
) {
  try {
    const answer = await prisma.studentAnswer.upsert({
      where: {
        attemptId_examQuestionId: {
          attemptId,
          examQuestionId,
        },
      },
      update: {
        answerPayload,
        updatedAt: new Date(),
      },
      create: {
        attemptId,
        examQuestionId,
        answerPayload,
      },
    });

    // Update last auto-save on the attempt
    await prisma.examAttempt.update({
      where: { id: attemptId },
      data: { lastAutoSaveAt: new Date() },
    });

    return { success: true, answerId: answer.id };
  } catch (error) {
    console.error("Failed to save student answer:", error);
    return { success: false, error: "Failed to auto-save answer" };
  }
}
