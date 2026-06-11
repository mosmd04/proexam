"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function saveExam(examData: any) {
  const user = await auth();
  if (!user) throw new Error("Unauthorized");

  const { title, courseId, description, scheduledStart, scheduledEnd, durationMinutes, shuffleQuestions, enableProctoring, questions, status } = examData;

  const totalPoints = questions.reduce((sum: number, q: any) => sum + q.points, 0);

  // Create the exam
  const exam = await prisma.exam.create({
    data: {
      title,
      courseId,
      createdById: user.id,
      description,
      status: status || "PUBLISHED",
      durationMinutes: parseInt(durationMinutes),
      scheduledStart: scheduledStart ? new Date(scheduledStart) : null,
      scheduledEnd: scheduledEnd ? new Date(scheduledEnd) : null,
      totalPoints,
      shuffleQuestions,
      enableProctoring,
    }
  });

  // Create questions and their snapshots
  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];

    let sourceQuestionId: string | null = q.sourceQuestionId || null;
    const questionTypeDb = q.type === "mcq" ? "MCQ" : q.type === "tf" ? "TRUE_FALSE" : "ESSAY";
    const choicesPayloadDb = q.options || q.choicesPayload;

    // Save to question bank only if it's new and user toggled saveToBank: true
    if (!sourceQuestionId && q.saveToBank) {
      const sourceQuestion = await prisma.question.create({
        data: {
          courseId,
          createdById: user.id,
          questionType: questionTypeDb,
          text: q.text,
          choicesPayload: choicesPayloadDb,
          defaultPoints: q.points,
        }
      });
      sourceQuestionId = sourceQuestion.id;
    }

    // Create the snapshot for the exam
    await prisma.examQuestion.create({
      data: {
        examId: exam.id,
        sourceQuestionId: sourceQuestionId,
        questionType: questionTypeDb,
        text: q.text,
        choicesPayload: choicesPayloadDb ? JSON.parse(JSON.stringify(choicesPayloadDb)) : undefined,
        points: q.points,
        sortOrder: i,
      }
    });
  }

  revalidatePath("/teacher/exams");
  return exam.id;
}
