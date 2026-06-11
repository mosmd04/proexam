"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { submitAppeal } from "@/app/actions/appealActions";

interface Record {
  id: string;
  courseName: string;
  courseCode: string;
  examTitle: string;
  submittedAt: string | null;
  score: number;
  maxScore: number;
  status: string;
  appeal: {
    id: string;
    reason: string;
    status: string; // PENDING, APPROVED, REJECTED
    pointsAdded: number;
    teacherNotes: string;
  } | null;
}

export default function StudentRecordsClient({ data }: { data: { gpa: string; records: Record[] } }) {
  const router = useRouter();
  const [appealAttemptId, setAppealAttemptId] = useState<string | null>(null);
  const [appealReason, setAppealReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showNotesAppeal, setShowNotesAppeal] = useState<Record | null>(null);

  const handleOpenAppeal = (attemptId: string) => {
    setAppealAttemptId(attemptId);
    setAppealReason("");
  };

  const handleCloseAppeal = () => {
    setAppealAttemptId(null);
    setAppealReason("");
  };

  const handleSubmitAppeal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appealAttemptId) return;
    if (!appealReason.trim()) {
      alert("الرجاء كتابة سبب التظلم بالتفصيل.");
      return;
    }

    try {
      setIsSubmitting(true);
      await submitAppeal(appealAttemptId, appealReason);
      alert("تم تقديم التماس الدرجة بنجاح! سيقوم الأستاذ بمراجعته قريباً.");
      router.refresh();
      handleCloseAppeal();
    } catch (err: any) {
      console.error(err);
      alert(err.message || "حدث خطأ أثناء تقديم الالتماس.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50/50 text-right" dir="rtl">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex flex-col sm:flex-row items-center justify-between shrink-0 shadow-sm z-10 gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">السجل الأكاديمي</h1>
          <p className="text-sm text-slate-500 mt-1">عرض جميع الدرجات والنتائج السابقة مع إمكانية تقديم الالتماسات</p>
        </div>
        <button
          onClick={() => window.print()}
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
                    <th className="p-4 text-center">الالتماس والمراجعة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-sm font-medium text-slate-700">
                  {data.records.length === 0 ? (
                      <tr>
                          <td colSpan={6} className="text-center py-8 text-slate-500">لا توجد سجلات متاحة حالياً.</td>
                      </tr>
                  ) : (
                    data.records.map((record: Record) => (
                      <tr key={record.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-4 font-bold text-slate-900">{record.courseName} ({record.courseCode})</td>
                        <td className="p-4 text-slate-500">{record.examTitle}</td>
                        <td className="p-4 text-slate-500">
                            {record.submittedAt ? new Intl.DateTimeFormat('ar-EG', { dateStyle: 'long' }).format(new Date(record.submittedAt)) : 'غير متوفر'}
                        </td>
                        <td className="p-4" dir="ltr">{record.score.toFixed(1)} / {record.maxScore}</td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded text-xs font-bold border ${record.status === 'رسوب' ? 'bg-red-50 text-danger border-red-100' : record.status === 'اجتياز بتفوق' ? 'bg-green-50 text-success border-green-100' : 'bg-blue-50 text-info border-blue-100'}`}>
                            {record.status}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          {record.appeal ? (
                            <div className="flex items-center justify-center gap-2">
                              {record.appeal.status === "PENDING" && (
                                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-600 border border-amber-200">
                                  <i className="fas fa-spinner animate-spin text-[10px] ml-1"></i> قيد المراجعة
                                </span>
                              )}
                              {record.appeal.status === "APPROVED" && (
                                <button 
                                  onClick={() => setShowNotesAppeal(record)}
                                  className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-100 transition-colors flex items-center gap-1.5"
                                  title="عرض ملاحظات الأستاذ"
                                >
                                  <i className="fas fa-check-circle"></i> تم القبول (+{record.appeal.pointsAdded} د)
                                </button>
                              )}
                              {record.appeal.status === "REJECTED" && (
                                <button 
                                  onClick={() => setShowNotesAppeal(record)}
                                  className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100 transition-colors flex items-center gap-1.5"
                                  title="عرض سبب الرفض"
                                >
                                  <i className="fas fa-times-circle"></i> تم الرفض
                                </button>
                              )}
                            </div>
                          ) : (
                            <button
                              onClick={() => handleOpenAppeal(record.id)}
                              className="px-3 py-1.5 bg-primary/10 hover:bg-primary hover:text-white text-primary rounded-xl text-xs font-bold transition-all shadow-inner flex items-center gap-1.5 mx-auto"
                            >
                              <i className="fas fa-edit text-[10px]"></i> تقديم التماس
                            </button>
                          )}
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

      {/* SUBMIT APPEAL MODAL */}
      {appealAttemptId && (
        <div className="fixed inset-0 z-55 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl border border-slate-200 flex flex-col">
            <div className="p-5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <h3 className="font-extrabold text-slate-800 text-md flex items-center gap-2">
                <i className="fas fa-edit text-primary"></i> تقديم تظلم / التماس درجة
              </h3>
              <button 
                onClick={handleCloseAppeal} 
                className="w-8 h-8 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <form onSubmit={handleSubmitAppeal} className="p-6 space-y-4">
              <div className="space-y-1.5 text-right">
                <label className="block text-sm font-bold text-slate-700">السبب الأكاديمي للالتماس <span className="text-danger">*</span></label>
                <textarea
                  required
                  rows={4}
                  value={appealReason}
                  onChange={e => setAppealReason(e.target.value)}
                  className="w-full border border-slate-200 bg-slate-50/50 p-3 rounded-xl focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all font-medium text-slate-800 text-sm text-right"
                  placeholder="الرجاء توضيح سبب التظلم بالتفصيل (مثلاً: هناك خطأ في تصحيح السؤال الثاني المقالي، أو قمت بالإجابة الصحيحة ولم تحتسب)..."
                ></textarea>
              </div>
              
              <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl text-xs text-slate-500 leading-relaxed text-right flex items-start gap-2.5">
                <i className="fas fa-info-circle text-primary text-sm mt-0.5"></i>
                <div>
                  يتم إرسال هذا الالتماس مباشرة للأستاذ مصحح المادة. في حال موافقة الأستاذ على التماسك، سيتم إضافة الدرجة المناسبة وتعديل معدلك تلقائياً.
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleCloseAppeal}
                  className="px-5 py-2.5 border border-slate-200 hover:bg-slate-150 rounded-xl font-bold text-sm text-slate-650 transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-primary hover:bg-indigo-700 text-white rounded-xl font-bold text-sm transition-all shadow-md shadow-primary/10 disabled:opacity-50"
                >
                  {isSubmitting ? "جاري الإرسال..." : "إرسال الطلب للأستاذ"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW NOTES MODAL */}
      {showNotesAppeal && showNotesAppeal.appeal && (
        <div className="fixed inset-0 z-55 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl border border-slate-200 flex flex-col">
            <div className="p-5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <h3 className="font-extrabold text-slate-800 text-md flex items-center gap-2">
                <i className="fas fa-comment-dots text-primary"></i> تفاصيل التقييم وملاحظات الأستاذ
              </h3>
              <button 
                onClick={() => setShowNotesAppeal(null)} 
                className="w-8 h-8 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="p-6 space-y-4 text-right">
              <div>
                <span className="block text-xs font-bold text-slate-400 mb-1">تاريخ تقديم التظلم:</span>
                <span className="text-sm font-bold text-slate-800">{showNotesAppeal.courseName} - {showNotesAppeal.examTitle}</span>
              </div>
              <div className="bg-slate-50 border border-slate-100 p-3.5 rounded-xl">
                <span className="block text-[10px] font-bold text-slate-400 mb-1">سبب التماس الطالب:</span>
                <p className="text-xs font-semibold text-slate-700 leading-relaxed">{showNotesAppeal.appeal.reason}</p>
              </div>
              <div className="border-t border-slate-100 pt-3">
                <span className="block text-xs font-bold text-slate-400 mb-1">موقف الأستاذ:</span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold border ${
                  showNotesAppeal.appeal.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-800 border-emerald-100' : 'bg-rose-50 text-rose-800 border-rose-100'
                }`}>
                  {showNotesAppeal.appeal.status === 'APPROVED' ? 'تم القبول والاعتماد' : 'تم الرفض'}
                </span>
                {showNotesAppeal.appeal.status === 'APPROVED' && (
                  <span className="block text-xs text-emerald-600 font-extrabold mt-1.5">
                    <i className="fas fa-plus-circle"></i> تم تعديل الدرجة وإضافة {showNotesAppeal.appeal.pointsAdded} درجات.
                  </span>
                )}
              </div>
              {showNotesAppeal.appeal.teacherNotes && (
                <div className="bg-slate-50 border border-slate-100 p-3.5 rounded-xl">
                  <span className="block text-[10px] font-bold text-slate-400 mb-1">ملاحظات وتعليق الأستاذ:</span>
                  <p className="text-xs font-semibold text-slate-700 leading-relaxed">{showNotesAppeal.appeal.teacherNotes}</p>
                </div>
              )}
            </div>
            <div className="p-4 border-t border-slate-100 flex justify-end bg-slate-50">
              <button
                onClick={() => setShowNotesAppeal(null)}
                className="px-5 py-2 bg-slate-200 hover:bg-slate-300 rounded-xl font-bold text-sm text-slate-700 transition-colors"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
