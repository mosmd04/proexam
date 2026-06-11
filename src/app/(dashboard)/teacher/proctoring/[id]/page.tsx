import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import ProctoringClient from "./ProctoringClient";

export default async function ProctoringDashboardPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: examId } = await params;
  const user = await auth();

  if (!user) {
    redirect("/login");
  }

  const exam = await prisma.exam.findUnique({
    where: { id: examId },
    include: { course: true }
  });

  if (!exam) {
    return <div className="p-10 font-bold text-center">الامتحان غير موجود</div>;
  }

  // Fetch attempts
  const attempts = await prisma.examAttempt.findMany({
    where: { examId },
    include: { student: true }
  });

  // Calculate stats
  const totalConnected = attempts.filter(a => a.status === "IN_PROGRESS").length;
  const totalFinished = attempts.filter(a => ["SUBMITTED", "GRADED", "FORCE_SUBMITTED_BY_SYSTEM", "FORCE_SUBMITTED_BY_TEACHER"].includes(a.status)).length;
  const avgProgress = 0; // We can improve this if needed

  return (
    <ProctoringClient 
      exam={exam} 
      attempts={attempts} 
      totalConnected={totalConnected} 
      totalFinished={totalFinished} 
      avgProgress={avgProgress} 
    />
  );
}
