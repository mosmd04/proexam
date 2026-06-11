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

    // Create the question in the question bank
    const sourceQuestion = await prisma.question.create({
      data: {
        courseId,
        createdById: user.id,
        questionType: q.type === "mcq" ? "MCQ" : q.type === "tf" ? "TRUE_FALSE" : "ESSAY",
        text: q.text,
        choicesPayload: q.options || q.choicesPayload,
        defaultPoints: q.points,
      }
    });

    // Create the snapshot for the exam
    await prisma.examQuestion.create({
      data: {
        examId: exam.id,
        sourceQuestionId: sourceQuestion.id,
        questionType: sourceQuestion.questionType,
        text: sourceQuestion.text,
        choicesPayload: sourceQuestion.choicesPayload ? JSON.parse(JSON.stringify(sourceQuestion.choicesPayload)) : undefined,
        points: q.points,
        sortOrder: i,
      }
    });
  }

  revalidatePath("/teacher/exams");
  return exam.id;
}
