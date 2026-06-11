import React from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export default async function StudentDashboard() {
  const user = await auth();
  if (!user) return null;

  const now = new Date();

  // Get enrolled courses
  const enrollments = await prisma.courseEnrollment.findMany({
    where: { userId: user.id, role: "STUDENT" },
    select: { courseId: true }
  });
  const courseIds = enrollments.map(e => e.courseId);

  // Fetch all exams for these courses
  const allExams = await prisma.exam.findMany({
    where: { 
      courseId: { in: courseIds },
      status: "PUBLISHED"
    },
    include: { course: true }
  });

  // Get student's attempts
  const attempts = await prisma.examAttempt.findMany({
    where: { studentId: user.id },
    include: { exam: true }
  });
  
  const inProgressAttempt = attempts.find(a => a.status === "IN_PROGRESS");
  
  // Categorize exams
  let availableExams: typeof allExams = [];
  let upcomingExams: typeof allExams = [];
  let completedAttempts = attempts.filter(a => ["SUBMITTED", "GRADED", "FORCE_SUBMITTED_BY_SYSTEM", "FORCE_SUBMITTED_BY_TEACHER"].includes(a.status));

  allExams.forEach(exam => {
    // If student already has an attempt for this exam (that isn't IN_PROGRESS), skip
    const attempt = attempts.find(a => a.examId === exam.id);
    if (attempt && attempt.status !== "IN_PROGRESS") return;

    if (exam.scheduledStart && exam.scheduledEnd) {
      if (exam.scheduledStart <= now && exam.scheduledEnd >= now) {
        availableExams.push(exam);
      } else if (exam.scheduledStart > now) {
        upcomingExams.push(exam);
      }
    } else {
      // If no schedule, it's immediately available
      availableExams.push(exam);
    }
  });

  return (
    <main className="flex-1 overflow-y-auto p-6 scroll-smooth">
      <div className="max-w-6xl mx-auto space-y-6 pb-24">
        {/* 1. Hero Banner */}
        <div className="bg-gradient-to-r from-primary to-indigo-900 rounded-3xl p-8 sm:p-10 relative overflow-hidden shadow-lg shadow-indigo-200">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full filter blur-3xl transform translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-400 opacity-20 rounded-full filter blur-3xl transform -translate-x-1/2 translate-y-1/2 pointer-events-none"></div>

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="text-white">
              <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold mb-3 border border-white/20 text-indigo-50">
                لوحة الطالب
              </span>
              <h1 className="text-3xl sm:text-4xl font-black mb-2">
                مرحباً بك مجدداً، {user.name.split(" ")[0]}! 🚀
              </h1>
              <p className="text-indigo-100 text-sm sm:text-base max-w-lg leading-relaxed">
                استعد جيداً، لديك {availableExams.length} امتحانات متاحة الآن، و {upcomingExams.length} امتحانات مجدولة.
              </p>
            </div>
          </div>
        </div>

        {/* 2. Active / Available Exams */}
        <div>
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-4">
            <i className="fas fa-bolt text-warning ml-1"></i> امتحانات متاحة الآن
          </h2>

          <div className="grid grid-cols-1 gap-4">
            {inProgressAttempt && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border-l-4 border-l-danger border-y border-r border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-red-50 rounded-full filter blur-3xl opacity-50 -z-10"></div>
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-xl bg-red-50 text-danger flex items-center justify-center text-2xl shrink-0 border border-red-100">
                    <i className="fas fa-laptop-code"></i>
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-bold text-gray-800 text-xl">امتحان قيد الإنجاز!</h3>
                      <span className="bg-danger text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider animate-pulse">مستمر الآن</span>
                    </div>
                    <p className="text-gray-500 font-medium text-sm">لديك امتحان بدأت به ولم تنهه بعد.</p>
                  </div>
                </div>
                <div className="shrink-0 w-full md:w-auto">
                  <Link href={`/exam/${inProgressAttempt.examId}/live`} className="w-full md:w-auto bg-danger hover:bg-red-600 text-white font-bold py-3 px-8 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2">
                    العودة للامتحان <i className="fas fa-arrow-left mr-1"></i>
                  </Link>
                </div>
              </div>
            )}

            {!inProgressAttempt && availableExams.map(exam => (
              <div key={exam.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-xl bg-indigo-50 text-primary flex items-center justify-center text-2xl shrink-0 border border-indigo-100">
                    <i className="fas fa-file-alt"></i>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 text-xl">{exam.title}</h3>
                    <p className="text-gray-500 font-medium text-sm">{exam.course.name}</p>
                    <div className="flex items-center gap-4 mt-3 text-xs text-gray-600 font-bold">
                      <span className="flex items-center gap-1.5"><i className="far fa-clock text-gray-400"></i> المدة: {exam.durationMinutes} دقيقة</span>
                      <span className="flex items-center gap-1.5"><i className="fas fa-bullseye text-gray-400"></i> الدرجة: {exam.totalPoints}</span>
                    </div>
                  </div>
                </div>
                <div className="shrink-0 w-full md:w-auto">
                  <Link href={`/exam/${exam.id}/live`} className="w-full md:w-auto bg-primary hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-xl shadow-md transition-all flex items-center justify-center gap-2">
                    بدء الامتحان <i className="fas fa-play mr-1"></i>
                  </Link>
                </div>
              </div>
            ))}

            {!inProgressAttempt && availableExams.length === 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center text-gray-500">
                لا توجد امتحانات متاحة حالياً.
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 grid-flow-row xl:grid-cols-2 gap-6">
          {/* 3. Upcoming Exams */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-gray-800 mb-2">الامتحانات القادمة (مجدولة)</h2>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-2">
              {upcomingExams.map(exam => (
                <div key={exam.id} className="p-4 border-b border-gray-50 flex items-center gap-4">
                  <div className="w-14 h-16 rounded-xl bg-gray-50 border border-gray-100 flex flex-col items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-primary">{exam.scheduledStart?.toLocaleDateString('ar-EG', { month: 'short' })}</span>
                    <span className="text-xl font-black text-gray-800 leading-none mt-1">{exam.scheduledStart?.getDate()}</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-800">{exam.title}</h4>
                    <p className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                      <i className="far fa-clock ml-1"></i> يبدأ في: {exam.scheduledStart?.toLocaleTimeString('ar-EG')}
                    </p>
                  </div>
                  <div className="shrink-0 text-left">
                    <span className="bg-blue-50 text-blue-600 border border-blue-100 px-3 py-1 rounded-lg text-xs font-bold">
                      مجدول
                    </span>
                  </div>
                </div>
              ))}
              {upcomingExams.length === 0 && <p className="text-center p-4 text-gray-400">لا توجد امتحانات مجدولة.</p>}
            </div>
          </div>

          {/* 4. Completed */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-gray-800 mb-2">آخر النتائج والتسليمات</h2>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <div className="space-y-4">
                {completedAttempts.map(att => (
                  <div key={att.id}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-green-50 text-success flex items-center justify-center text-sm shrink-0 border border-green-100">
                          <i className="fas fa-check"></i>
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-800 text-sm">{att.exam.title}</h4>
                          <p className="text-[10px] text-gray-500">{att.status === "GRADED" ? "تم التصحيح" : "بانتظار النتيجة"}</p>
                        </div>
                      </div>
                      <div className="text-left">
                        {att.status === "GRADED" ? (
                          <span className="block font-black text-gray-800" dir="ltr">
                            {att.score} <span className="text-xs text-gray-400 font-medium">%</span>
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">-</span>
                        )}
                      </div>
                    </div>
                    <hr className="border-gray-50 my-2" />
                  </div>
                ))}
                {completedAttempts.length === 0 && <p className="text-center text-gray-400">لم تقم بتسليم أي امتحان بعد.</p>}
              </div>
            </div>
          </div>
        </div>

      </div>
    </main>
  );
}
