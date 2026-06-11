"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

/**
 * Submits a grade appeal for a completed exam attempt
 */
export async function submitAppeal(attemptId: string, reason: string) {
  const user = await auth();
  if (!user) throw new Error("Unauthorized");

  if (!reason.trim()) {
    throw new Error("الرجاء كتابة سبب الالتماس");
  }

  // Verify the attempt exists and belongs to the user
  const attempt = await prisma.examAttempt.findUnique({
    where: { id: attemptId },
    include: { exam: true }
  });

  if (!attempt) {
    throw new Error("لم يتم العثور على محاولة الامتحان المحددة");
  }

  if (attempt.studentId !== user.id) {
    throw new Error("غير مسموح لك بتقديم التماس لمحاولة طالب آخر");
  }

  // Check if an appeal already exists for this attempt
  const existingAppeal = await prisma.examAppeal.findFirst({
    where: { attemptId }
  });

  if (existingAppeal) {
    throw new Error("لقد قمت بتقديم التماس لهذه المحاولة مسبقاً");
  }

  // Create the appeal
  const appeal = await prisma.examAppeal.create({
    data: {
      attemptId,
      studentId: user.id,
      reason: reason.trim(),
      status: "PENDING"
    }
  });

  revalidatePath("/student/records");
  return appeal.id;
}

/**
 * Reviews a student's grade appeal (Approve or Reject)
 * If approved, updates the attempt's score with the extra points
 */
export async function reviewAppeal(
  appealId: string, 
  status: "APPROVED" | "REJECTED", 
  pointsAdded: number, 
  teacherNotes: string
) {
  const user = await auth();
  if (!user) throw new Error("Unauthorized");

  const appeal = await prisma.examAppeal.findUnique({
    where: { id: appealId },
    include: { 
      attempt: { 
        include: { 
          exam: true 
        } 
      } 
    }
  });

  if (!appeal) {
    throw new Error("لم يتم العثور على طلب الالتماس المحدد");
  }

  // Update the appeal
  await prisma.examAppeal.update({
    where: { id: appealId },
    data: {
      status,
      pointsAdded: status === "APPROVED" ? pointsAdded : 0.0,
      teacherNotes: teacherNotes.trim() || null
    }
  });

  // If approved, update student's score
  if (status === "APPROVED" && pointsAdded > 0) {
    const currentScore = appeal.attempt.score || 0;
    const examTotalPoints = appeal.attempt.exam.totalPoints || 1;
    const newScore = Math.min(examTotalPoints, currentScore + pointsAdded);
    const newPercent = (newScore / examTotalPoints) * 100;

    await prisma.examAttempt.update({
      where: { id: appeal.attemptId },
      data: {
        score: newScore,
        scorePercent: newPercent,
        gradedById: user.id,
        gradedAt: new Date()
      }
    });
  }

  revalidatePath("/teacher/appeals");
  revalidatePath("/student/records");
  return appeal.id;
}
