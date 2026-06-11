import React from 'react';
import { prisma } from '@/lib/prisma';
import GradingWorkspace from './GradingWorkspace';

export default async function ManualGradingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: examId } = await params;

  // Fetch exam with all questions
  const exam = await prisma.exam.findUnique({
    where: { id: examId },
    include: {
      course: true,
      examQuestions: true
    }
  });

  // Fetch attempts that have been submitted or graded
  const attempts = await prisma.examAttempt.findMany({
    where: { 
      examId,
      status: { in: ['SUBMITTED', 'GRADED', 'FORCE_SUBMITTED_BY_SYSTEM', 'FORCE_SUBMITTED_BY_TEACHER'] }
    },
    include: {
      student: true,
      answers: {
        include: { examQuestion: true }
      }
    }
  });

  return <GradingWorkspace exam={exam} attempts={attempts} />;
}
