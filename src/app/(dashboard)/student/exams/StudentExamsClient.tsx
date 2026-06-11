"use client";

import React from "react";
import Link from "next/link";

export default function StudentExamsClient({ data }: { data: any }) {
  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50/50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex flex-col sm:flex-row items-center justify-between shrink-0 shadow-sm z-10 gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">امتحاناتي</h1>
          <p className="text-sm text-slate-500 mt-1">عرض جميع الامتحانات الحالية والمجدولة والسابقة</p>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-6">
        <div className="max-w-7xl mx-auto space-y-8">
          
          {/* Active Exams */}
          <div>
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <i className="fas fa-bolt text-warning"></i> امتحانات جارية الآن
            </h2>
            {data.activeExams.length === 0 ? (
                <div className="bg-white rounded-2xl p-6 text-center text-slate-500 shadow-sm border border-slate-100">
                    <i className="fas fa-coffee text-3xl mb-2 text-slate-300"></i>
                    <p>لا توجد امتحانات جارية حالياً.</p>
                </div>
            ) : (
                data.activeExams.map((exam: any) => (
                    <div key={exam.id} className="bg-white rounded-2xl p-6 shadow-sm border-l-4 border-l-danger border-y border-r border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-md transition-shadow relative overflow-hidden mb-4">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-red-50 rounded-full filter blur-3xl opacity-50 -z-10"></div>

                      <div className="flex items-start gap-4">
                        <div className="w-14 h-14 rounded-xl bg-red-50 text-danger flex items-center justify-center text-2xl shrink-0 border border-red-100">
                          <i className="fas fa-laptop-code"></i>
                        </div>
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="font-bold text-slate-800 text-xl">{exam.title} - {exam.courseName}</h3>
                            <span className="bg-danger text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider animate-pulse flex items-center gap-1">
                              <i className="fas fa-circle text-[6px]"></i> متاح الآن
                            </span>
                          </div>
                          <p className="text-slate-500 font-medium text-sm">
                            {exam.description || `امتحان لمقرر ${exam.courseName}`}
                          </p>
                          <div className="flex items-center gap-4 mt-3 text-xs text-slate-600 font-bold">
                            <span className="flex items-center gap-1.5">
                              <i className="far fa-clock text-slate-400 ml-1"></i> المدة: {exam.durationMinutes} دقيقة
                            </span>
                            <span className="flex items-center gap-1.5 text-danger">
                              <i className="fas fa-lock text-danger ml-1"></i> متصفح آمن مطلوب
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="shrink-0 w-full md:w-auto text-center">
                        {exam.canTake ? (
                            <Link
                              href={`/exam/${exam.id}/live`}
                              className="w-full md:w-auto bg-danger hover:bg-red-600 text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-red-200 transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                            >
                              دخول الامتحان <i className="fas fa-arrow-left mr-1"></i>
                            </Link>
                        ) : (
                            <div className="bg-gray-100 text-gray-500 font-bold py-3 px-8 rounded-xl border border-gray-200 cursor-not-allowed">
                                تم إنجاز الامتحان أو استنفاد المحاولات
                            </div>
                        )}
                        {exam.scheduledStart && (
                            <p className="text-[10px] text-slate-400 mt-2">
                                بدأ في: {new Intl.DateTimeFormat('ar-EG', { timeStyle: 'short' }).format(new Date(exam.scheduledStart))}
                            </p>
                        )}
                      </div>
                    </div>
                ))
            )}
          </div>

          {/* Scheduled Exams */}
          <div>
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <i className="far fa-calendar-alt text-primary"></i> امتحانات مجدولة
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.scheduledExams.length === 0 ? (
                  <div className="col-span-full bg-white rounded-2xl p-6 text-center text-slate-500 shadow-sm border border-slate-100">
                    <p>لا توجد امتحانات مجدولة قادمة.</p>
                  </div>
              ) : (
                data.scheduledExams.map((exam: any) => (
                  <div key={exam.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:-translate-y-1 transition-transform hover:shadow-md hover:border-primary">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 text-primary flex items-center justify-center text-lg shrink-0 border border-indigo-100">
                        <i className="far fa-calendar-check"></i>
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-800 text-sm">{exam.courseName} ({exam.courseCode})</h3>
                        <p className="text-xs text-slate-500">{exam.title}</p>
                      </div>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-3 text-xs space-y-2 font-medium text-slate-600">
                      <div className="flex items-center gap-2">
                          <i className="far fa-calendar-alt text-slate-400"></i>
                          {exam.scheduledStart ? new Intl.DateTimeFormat('ar-EG', { dateStyle: 'full' }).format(new Date(exam.scheduledStart)) : 'غير محدد'}
                      </div>
                      <div className="flex items-center gap-2">
                          <i className="far fa-clock text-slate-400"></i>
                          {exam.scheduledStart ? new Intl.DateTimeFormat('ar-EG', { timeStyle: 'short' }).format(new Date(exam.scheduledStart)) : 'غير محدد'}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
