"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { reviewAppeal } from "@/app/actions/appealActions";

interface Appeal {
  id: string;
  reason: string;
  status: string; // PENDING, APPROVED, REJECTED
  pointsAdded: number;
  teacherNotes: string;
  createdAt: string;
  studentName: string;
  studentEmail: string;
  examTitle: string;
  courseName: string;
  courseCode: string;
  attemptScore: number;
  attemptMaxScore: number;
  attemptId: string;
}

export default function TeacherAppealsClient({ appeals }: { appeals: Appeal[] }) {
  const router = useRouter();
  const [filterStatus, setFilterStatus] = useState<"ALL" | "PENDING" | "APPROVED" | "REJECTED">("PENDING");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAppeal, setSelectedAppeal] = useState<Appeal | null>(null);
  
  // Review form states
  const [reviewStatus, setReviewStatus] = useState<"APPROVED" | "REJECTED">("APPROVED");
  const [pointsAdded, setPointsAdded] = useState(1.0);
  const [teacherNotes, setTeacherNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpenReview = (appeal: Appeal) => {
    setSelectedAppeal(appeal);
    setReviewStatus("APPROVED");
    setPointsAdded(1.0);
    setTeacherNotes(appeal.teacherNotes || "");
  };

  const handleCloseReview = () => {
    setSelectedAppeal(null);
    setTeacherNotes("");
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppeal) return;
    
    if (reviewStatus === "APPROVED" && (pointsAdded <= 0 || isNaN(pointsAdded))) {
      alert("الرجاء تحديد درجات إضافية صحيحة أكبر من صفر للقبول.");
      return;
    }

    const maxAddable = selectedAppeal.attemptMaxScore - selectedAppeal.attemptScore;
    if (reviewStatus === "APPROVED" && pointsAdded > maxAddable) {
      alert(`الدرجة الإضافية تتعدى الحد الأقصى المسموح به للامتحان. الدرجات المتبقية الممكن إضافتها هي: ${maxAddable.toFixed(1)} درجة.`);
      return;
    }

    try {
      setIsSubmitting(true);
      await reviewAppeal(
        selectedAppeal.id,
        reviewStatus,
        reviewStatus === "APPROVED" ? pointsAdded : 0.0,
        teacherNotes
      );
      alert("تم تسجيل القرار وتحديث درجات الطالب وسجله بنجاح!");
      router.refresh();
      handleCloseReview();
    } catch (err: any) {
      console.error(err);
      alert(err.message || "حدث خطأ أثناء حفظ القرار.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter and search
  const filteredAppeals = appeals.filter(app => {
    const matchesStatus = filterStatus === "ALL" || app.status === filterStatus;
    const matchesSearch = 
      app.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.courseName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.examTitle.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50/50 text-right font-sans" dir="rtl">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex flex-col sm:flex-row items-center justify-between shrink-0 shadow-sm z-10 gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <i className="fas fa-balance-scale text-primary"></i> إدارة تظلمات الطلاب
          </h1>
          <p className="text-sm text-slate-500 mt-1">راجع التظلمات والالتماسات المقدمة على درجات الامتحانات والبت فيها</p>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          
          {/* Filters Bar */}
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Search */}
            <div className="relative w-full md:w-80">
              <i className="fas fa-search absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
              <input 
                type="text" 
                placeholder="ابحث باسم الطالب، المقرر، أو الامتحان..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-4 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all text-right font-semibold text-slate-700" 
              />
            </div>

            {/* Status tabs */}
            <div className="flex bg-slate-100 p-0.5 rounded-xl border border-slate-200 text-xs font-bold w-full md:w-auto">
              <button 
                onClick={() => setFilterStatus("PENDING")}
                className={`flex-1 md:flex-none px-4 py-2 rounded-lg transition-colors ${filterStatus === "PENDING" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
              >
                قيد الانتظار ({appeals.filter(a=>a.status==='PENDING').length})
              </button>
              <button 
                onClick={() => setFilterStatus("APPROVED")}
                className={`flex-1 md:flex-none px-4 py-2 rounded-lg transition-colors ${filterStatus === "APPROVED" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
              >
                المقبولة ({appeals.filter(a=>a.status==='APPROVED').length})
              </button>
              <button 
                onClick={() => setFilterStatus("REJECTED")}
                className={`flex-1 md:flex-none px-4 py-2 rounded-lg transition-colors ${filterStatus === "REJECTED" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
              >
                المرفوضة ({appeals.filter(a=>a.status==='REJECTED').length})
              </button>
              <button 
                onClick={() => setFilterStatus("ALL")}
                className={`flex-1 md:flex-none px-4 py-2 rounded-lg transition-colors ${filterStatus === "ALL" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
              >
                الكل
              </button>
            </div>
          </div>

          {/* Appeals List Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-right whitespace-nowrap border-collapse text-sm">
                <thead className="bg-slate-50/50 border-b border-slate-100 text-slate-500 text-xs font-bold uppercase tracking-wider">
                  <tr>
                    <th className="p-4">اسم الطالب</th>
                    <th className="p-4">المقرر الدراسي</th>
                    <th className="p-4">الامتحان والدرجة</th>
                    <th className="p-4">تاريخ التقديم</th>
                    <th className="p-4">حالة الطلب</th>
                    <th className="p-4 text-center">الإجراء</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {filteredAppeals.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-12 text-slate-400">
                        <i className="fas fa-inbox text-3xl mb-2.5 opacity-30 block"></i>
                        لا توجد طلبات تظلم مطابقة للفرز الحالي.
                      </td>
                    </tr>
                  ) : (
                    filteredAppeals.map((appeal) => (
                      <tr key={appeal.id} className="hover:bg-slate-50 transition-colors">
                        {/* Student Name */}
                        <td className="p-4">
                          <div>
                            <p className="font-extrabold text-slate-900">{appeal.studentName}</p>
                            <p className="text-[10px] text-slate-400 font-normal">{appeal.studentEmail}</p>
                          </div>
                        </td>
                        
                        {/* Course Name */}
                        <td className="p-4">
                          <p className="font-bold text-slate-800">{appeal.courseName}</p>
                          <p className="text-[10px] text-slate-400 font-normal">{appeal.courseCode}</p>
                        </td>

                        {/* Exam Title & Score */}
                        <td className="p-4">
                          <p className="text-slate-800 font-bold">{appeal.examTitle}</p>
                          <p className="text-xs font-semibold text-slate-500" dir="ltr">
                            {appeal.attemptScore.toFixed(1)} / {appeal.attemptMaxScore}
                          </p>
                        </td>

                        {/* Submitted Date */}
                        <td className="p-4 text-slate-500 text-xs">
                          {new Intl.DateTimeFormat("ar-EG", { dateStyle: "long", timeStyle: "short" }).format(new Date(appeal.createdAt))}
                        </td>

                        {/* Status Badge */}
                        <td className="p-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                            appeal.status === 'PENDING' 
                              ? 'bg-amber-50 text-amber-600 border-amber-200' 
                              : appeal.status === 'APPROVED' 
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-250' 
                              : 'bg-rose-50 text-rose-800 border-rose-250'
                          }`}>
                            {appeal.status === 'PENDING' ? 'قيد الانتظار' : appeal.status === 'APPROVED' ? 'تم القبول' : 'تم الرفض'}
                          </span>
                        </td>

                        {/* Action button */}
                        <td className="p-4 text-center">
                          <button
                            onClick={() => handleOpenReview(appeal)}
                            className="px-3.5 py-1.5 bg-primary/10 hover:bg-primary hover:text-white text-primary rounded-xl text-xs font-extrabold transition-all"
                          >
                            {appeal.status === 'PENDING' ? 'مراجعة واتخاذ قرار' : 'عرض وتفاصيل القرار'}
                          </button>
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

      {/* REVIEW APPEAL MODAL */}
      {selectedAppeal && (
        <div className="fixed inset-0 z-55 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl border border-slate-200 flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <h3 className="font-extrabold text-slate-800 text-md flex items-center gap-2">
                <i className="fas fa-balance-scale text-primary"></i> مراجعة طلب التماس درجة
              </h3>
              <button 
                onClick={handleCloseReview} 
                className="w-8 h-8 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmitReview} className="flex-1 overflow-y-auto p-6 space-y-5 text-right">
              {/* Info grid */}
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs">
                <div>
                  <span className="block text-slate-400 font-bold mb-0.5">الطالب المتظلم:</span>
                  <span className="font-extrabold text-slate-800 block">{selectedAppeal.studentName}</span>
                </div>
                <div>
                  <span className="block text-slate-400 font-bold mb-0.5">المقرر الدراسي:</span>
                  <span className="font-extrabold text-slate-800 block">{selectedAppeal.courseName}</span>
                </div>
                <div>
                  <span className="block text-slate-400 font-bold mb-0.5">الامتحان والدرجة الكلية:</span>
                  <span className="font-extrabold text-slate-800 block">{selectedAppeal.examTitle}</span>
                </div>
                <div>
                  <span className="block text-slate-400 font-bold mb-0.5">الدرجة الحالية للطالب:</span>
                  <span className="font-extrabold text-indigo-600 block" dir="ltr">
                    {selectedAppeal.attemptScore.toFixed(1)} / {selectedAppeal.attemptMaxScore}
                  </span>
                </div>
              </div>

              {/* Student Reason */}
              <div className="space-y-1.5">
                <label className="block text-sm font-bold text-slate-700">سبب الالتماس المكتوب من الطالب:</label>
                <div className="p-4 bg-amber-50/30 border border-amber-100 rounded-xl text-xs font-semibold text-slate-700 leading-relaxed">
                  {selectedAppeal.reason}
                </div>
              </div>

              {/* Decide form only if pending */}
              {selectedAppeal.status === "PENDING" ? (
                <div className="space-y-4 border-t border-slate-100 pt-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-slate-750">القرار الأكاديمي للأستاذ:</label>
                    <div className="flex gap-4">
                      <button
                        type="button"
                        onClick={() => setReviewStatus("APPROVED")}
                        className={`flex-1 py-3.5 rounded-xl font-extrabold border-2 transition-all flex items-center justify-center gap-2 shadow-sm text-sm ${
                          reviewStatus === "APPROVED"
                            ? "bg-emerald-500 text-white border-emerald-600 shadow-emerald-500/10"
                            : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        <i className="fas fa-check-circle"></i> قبول الالتماس وإضافة درجات
                      </button>
                      <button
                        type="button"
                        onClick={() => setReviewStatus("REJECTED")}
                        className={`flex-1 py-3.5 rounded-xl font-extrabold border-2 transition-all flex items-center justify-center gap-2 shadow-sm text-sm ${
                          reviewStatus === "REJECTED"
                            ? "bg-rose-500 text-white border-rose-600 shadow-rose-500/10"
                            : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        <i className="fas fa-times-circle"></i> رفض الالتماس
                      </button>
                    </div>
                  </div>

                  {/* If approved, show point input */}
                  {reviewStatus === "APPROVED" && (
                    <div className="space-y-1.5 animate-fadeIn">
                      <label className="block text-sm font-bold text-slate-700">الدرجات المراد إضافتها لدرجة الطالب الحالية:</label>
                      <div className="relative w-44">
                        <input
                          type="number"
                          step="0.5"
                          min="0.5"
                          max={selectedAppeal.attemptMaxScore - selectedAppeal.attemptScore}
                          value={pointsAdded}
                          onChange={(e) => setPointsAdded(Math.max(0.5, Number(e.target.value)))}
                          className="w-full border border-slate-200 bg-slate-50/50 p-2.5 pr-10 rounded-xl focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all font-bold text-slate-800 text-center"
                        />
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs pointer-events-none">
                          درجة إضافية
                        </div>
                      </div>
                      <span className="text-[10px] text-slate-400 font-normal">
                        متاح إضافة حتى: {(selectedAppeal.attemptMaxScore - selectedAppeal.attemptScore).toFixed(1)} درجة كحد أقصى.
                      </span>
                    </div>
                  )}

                  {/* Teacher notes */}
                  <div className="space-y-1.5">
                    <label className="block text-sm font-bold text-slate-700">تعليق ومبرر القرار للأستاذ:</label>
                    <textarea
                      rows={3}
                      value={teacherNotes}
                      onChange={(e) => setTeacherNotes(e.target.value)}
                      className="w-full border border-slate-200 bg-slate-50/50 p-3 rounded-xl focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all font-semibold text-slate-800 text-xs text-right"
                      placeholder="اكتب هنا تعليقاً يبرر قبول أو رفض طلب الالتماس (سيظهر للطالب فور الحفظ)..."
                    ></textarea>
                  </div>
                </div>
              ) : (
                // Read-only view for already resolved appeals
                <div className="space-y-4 border-t border-slate-100 pt-4 text-right">
                  <div>
                    <span className="block text-xs font-bold text-slate-400 mb-1">القرار الأكاديمي المتخذ:</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold border ${
                      selectedAppeal.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-800 border-emerald-100' : 'bg-rose-50 text-rose-800 border-rose-100'
                    }`}>
                      {selectedAppeal.status === 'APPROVED' ? 'تم قبول التظلم' : 'تم رفض التظلم'}
                    </span>
                    {selectedAppeal.status === 'APPROVED' && (
                      <span className="block text-xs text-emerald-600 font-extrabold mt-1.5">
                        <i className="fas fa-plus-circle"></i> تم تعديل درجات الطالب بإضافة +{selectedAppeal.pointsAdded} درجات.
                      </span>
                    )}
                  </div>
                  {selectedAppeal.teacherNotes && (
                    <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl">
                      <span className="block text-[10px] font-bold text-slate-400 mb-1">تعليق وملاحظات المعلم:</span>
                      <p className="text-xs font-semibold text-slate-700 leading-relaxed">{selectedAppeal.teacherNotes}</p>
                    </div>
                  )}
                </div>
              )}
            </form>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 flex justify-end gap-2 bg-slate-50">
              <button
                onClick={handleCloseReview}
                className="px-5 py-2.5 border border-slate-200 hover:bg-slate-150 rounded-xl font-bold text-sm text-slate-650 transition-colors"
              >
                {selectedAppeal.status === "PENDING" ? "إلغاء" : "إغلاق"}
              </button>
              {selectedAppeal.status === "PENDING" && (
                <button
                  onClick={handleSubmitReview}
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-primary hover:bg-indigo-700 text-white rounded-xl font-bold text-sm transition-all shadow-md shadow-primary/10 disabled:opacity-50"
                >
                  {isSubmitting ? "جاري الحفظ..." : "حفظ واعتماد القرار"}
                </button>
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
