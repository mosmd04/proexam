"use client";

import React from "react";

export default function StudentRecordsClient({ data }: { data: any }) {
  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50/50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex flex-col sm:flex-row items-center justify-between shrink-0 shadow-sm z-10 gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">السجل الأكاديمي</h1>
          <p className="text-sm text-slate-500 mt-1">عرض جميع الدرجات والنتائج السابقة</p>
        </div>
        <button
          onClick={() => alert("الطباعة قريبا")}
          className="px-4 py-2 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-xl text-sm font-bold shadow-sm transition-colors flex items-center gap-2"
        >
          <i className="fas fa-download"></i> تحميل السجل (PDF)
        </button>
      </header>

      <main className="flex-1 overflow-y-auto p-6">
        <div className="max-w-5xl mx-auto space-y-6">
          
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <h2 className="font-bold text-slate-800">السجل الشامل</h2>
              <span className="text-xs font-bold text-slate-500">المعدل التقريبي: {data.gpa} / 4.0</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-right whitespace-nowrap">
                <thead className="bg-white border-b border-slate-100 text-slate-500 text-xs uppercase font-bold tracking-wider">
                  <tr>
                    <th className="p-4">المقرر</th>
                    <th className="p-4">نوع الامتحان</th>
                    <th className="p-4">التاريخ</th>
                    <th className="p-4">الدرجة</th>
                    <th className="p-4">الحالة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-sm font-medium text-slate-700">
                  {data.records.length === 0 ? (
                      <tr>
                          <td colSpan={5} className="text-center py-8 text-slate-500">لا توجد سجلات متاحة حالياً.</td>
                      </tr>
                  ) : (
                    data.records.map((record: any) => (
                      <tr key={record.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-4 font-bold text-slate-900">{record.courseName} ({record.courseCode})</td>
                        <td className="p-4 text-slate-500">{record.examTitle}</td>
                        <td className="p-4 text-slate-500">
                            {record.submittedAt ? new Intl.DateTimeFormat('ar-EG', { dateStyle: 'long' }).format(new Date(record.submittedAt)) : 'غير متوفر'}
                        </td>
                        <td className="p-4" dir="ltr">{record.score} / {record.maxScore}</td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded text-xs font-bold border ${record.status === 'رسوب' ? 'bg-red-50 text-danger border-red-100' : record.status === 'اجتياز بتفوق' ? 'bg-green-50 text-success border-green-100' : 'bg-blue-50 text-info border-blue-100'}`}>
                            {record.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
