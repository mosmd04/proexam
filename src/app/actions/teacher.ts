"use server";
import { prisma } from "@/lib/prisma";

export async function getActiveExamId() {
  const exam = await prisma.exam.findFirst({
    where: { status: 'ACTIVE' },
    select: { id: true }
  });
  return exam?.id || null;
}
