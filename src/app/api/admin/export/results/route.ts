import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const examId = searchParams.get('examId');

    if (!examId) {
      return NextResponse.json({ error: "Missing examId parameter" }, { status: 400 });
    }

    // Security Note: In a true production pipeline, we would inject the auth middleware 
    // here to verify session role against SUPER_ADMIN or UNIVERSITY_ADMIN permissions.

    const attempts = await prisma.examAttempt.findMany({
      where: { examId, status: 'GRADED' },
      include: {
        student: {
          include: {
            institutionUsers: true
          }
        },
        exam: true
      },
      orderBy: { scorePercent: 'desc' }
    });

    // CSV Header Definition
    let csvData = "Student Name,Student ID,Email,Exam Title,Score,Score Percent,Status\n";

    // STRICT DATA CLEANLINESS RULE: Remove apostrophes from numerical IDs and scores
    const sanitizeNumerical = (val: string | number | null | undefined): string => {
      if (val === null || val === undefined) return "";
      return String(val).replace(/'/g, "");
    };

    // Sanitize general strings to prevent CSV breaking
    const sanitizeString = (val: string | null | undefined): string => {
      if (!val) return "";
      return String(val).replace(/,/g, " ").replace(/\n/g, " ");
    };

    attempts.forEach(a => {
      const studentName = sanitizeString(a.student.name);
      
      // Extrapolate university student ID, fallback to system UUID
      const rawStudentId = a.student.institutionUsers?.[0]?.studentId || a.student.id;
      const studentId = sanitizeNumerical(rawStudentId); // Strict enforcement
      
      const email = sanitizeString(a.student.email);
      const examTitle = sanitizeString(a.exam.title);
      const score = sanitizeNumerical(a.score);
      const scorePercent = sanitizeNumerical(a.scorePercent);
      const passFail = (a.scorePercent || 0) >= (a.exam.passingScore || 50) ? "PASS" : "FAIL";

      // Append row to CSV
      csvData += `${studentName},${studentId},${email},${examTitle},${score},${scorePercent},${passFail}\n`;
    });

    // Return the response as a downloadable attachment
    return new NextResponse(csvData, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="export_results_${examId}.csv"`
      }
    });

  } catch (error) {
    console.error("Data Export API error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
