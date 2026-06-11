"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { forceEndExamAction } from '@/app/actions/teacherExamActions';

export default function ProctoringClient({ exam, attempts, totalConnected, totalFinished, avgProgress }: { exam: any, attempts: any[], totalConnected: number, totalFinished: number, avgProgress: number }) {
  const router = useRouter();
  const [activeModal, setActiveModal] = useState<"none" | "endExam" | "stream">("none");
  const [streamType, setStreamType] = useState<"camera" | "desktop">("camera");
  const [selectedStudent, setSelectedStudent] = useState<string>("");
  
  // Real logs could be passed or fetched via polling. For now, use empty list to show clean state since we didn't implement real WebSockets for logs yet.
  const [displayLogs, setDisplayLogs] = useState<any[]>([]);

  const openStream = (type: "camera" | "desktop", student: string) => {
    setStreamType(type);
    setSelectedStudent(student);
    setActiveModal("stream");
  };

  const removeLog = (id: string) => {
    setDisplayLogs(prev => prev.filter(log => log.id !== id));
  };

  const closeModal = () => setActiveModal("none");

  const [isEnding, setIsEnding] = useState(false);

  const handleForceEnd = async () => {
    try {
      setIsEnding(true);
      await forceEndExamAction(exam.id);
      closeModal();
      router.refresh();
      router.push('/teacher/exams'); // redirect back to exams list
    } catch (e) {
      alert("حدث خطأ أثناء إنهاء الامتحان");
      setIsEnding(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-black text-gray-800">المراقبة الحية - {exam.title}</h1>
            <span className="bg-red-50 text-danger text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider border border-red-100 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-danger animate-pulse"></span> مباشر
            </span>
          </div>
          <p className="text-sm text-gray-500">امتحان منتصف الفصل الدراسي ({exam.course.name})</p>
        </div>

        <div className="flex items-center gap-4">
          <button onClick={() => setActiveModal("endExam")} className="px-4 py-2 bg-white border border-gray-200 text-gray-700 hover:text-danger hover:border-red-200 hover:bg-red-50 rounded-xl text-sm font-bold transition-colors flex items-center gap-2">
            <i className="fas fa-stop-circle"></i> إنهاء الامتحان
          </button>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-info flex items-center justify-center text-xl shrink-0">
            <i className="fas fa-users"></i>
          </div>
          <div>
            <p className="text-gray-500 text-xs font-bold mb-1">متصل الآن</p>
            <p className="text-2xl font-black text-gray-800">{totalConnected}</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-green-50 text-success flex items-center justify-center text-xl shrink-0">
            <i className="fas fa-check-circle"></i>
          </div>
          <div>
            <p className="text-gray-500 text-xs font-bold mb-1">سلموا الامتحان</p>
            <p className="text-2xl font-black text-gray-800">{totalFinished}</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-red-50 text-danger flex items-center justify-center text-xl shrink-0">
            <i className="fas fa-exclamation-triangle"></i>
          </div>
          <div>
            <p className="text-gray-500 text-xs font-bold mb-1">تنبيهات نشطة</p>
            <p className="text-2xl font-black text-gray-800">{displayLogs.length}</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center text-xl shrink-0">
            <i className="fas fa-chart-line"></i>
          </div>
          <div>
            <p className="text-gray-500 text-xs font-bold mb-1">متوسط الإنجاز</p>
            <p className="text-2xl font-black text-gray-800" dir="ltr">{avgProgress}%</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Students Grid */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="font-bold text-gray-800 text-lg">سجل الطلاب</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {attempts.map((attempt) => {
              const isSubmitted = ["SUBMITTED", "GRADED", "FORCE_SUBMITTED_BY_SYSTEM", "FORCE_SUBMITTED_BY_TEACHER"].includes(attempt.status);

              return (
                <div key={attempt.id} className={`bg-white rounded-2xl p-5 border transition-all ${isSubmitted ? 'border-gray-200 opacity-60' : 'border-gray-200 hover:border-indigo-200 hover:shadow-md'}`}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${isSubmitted ? 'bg-gray-100 text-gray-400' : 'bg-indigo-50 text-primary'}`}>
                          {attempt.student.name[0]}
                        </div>
                        <span className={`absolute bottom-0 right-0 w-3 h-3 border-2 border-white rounded-full ${isSubmitted ? 'bg-gray-400' : 'bg-success'}`}></span>
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-gray-800">{attempt.student.name}</h3>
                        <p className="text-xs text-gray-500 mt-0.5">{isSubmitted ? 'تم التسليم' : 'جاري الحل'}</p>
                      </div>
                    </div>
                  </div>

                  {!isSubmitted && (
                    <div className="mt-4 pt-4 border-t border-gray-100 flex gap-2">
                      <button onClick={() => openStream("camera", attempt.student.name)} className="flex-1 py-2 bg-gray-50 hover:bg-indigo-50 hover:text-primary text-gray-600 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-2">
                        <i className="fas fa-video"></i> كاميرا
                      </button>
                      <button onClick={() => openStream("desktop", attempt.student.name)} className="flex-1 py-2 bg-gray-50 hover:bg-indigo-50 hover:text-primary text-gray-600 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-2">
                        <i className="fas fa-desktop"></i> شاشة
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
            {attempts.length === 0 && <p className="text-gray-400">لا يوجد طلاب متصلين.</p>}
          </div>
        </div>

        {/* Anti-cheat Feed */}
        <div className="space-y-4">
          <h2 className="font-bold text-gray-800 text-lg flex items-center justify-between">
            سجل المراقبة الآلية
            <span className="text-[10px] bg-red-50 text-danger px-2 py-1 rounded font-bold">{displayLogs.length} أحداث</span>
          </h2>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-1 flex flex-col gap-1 overflow-hidden">
            {displayLogs.length === 0 ? (
              <div className="p-8 text-center text-gray-400">
                <i className="fas fa-check-circle text-4xl mb-3 text-success/50"></i>
                <p className="font-bold text-sm">السجل نظيف</p>
                <p className="text-xs mt-1">لا توجد أي تحذيرات حتى الآن.</p>
              </div>
            ) : (
              displayLogs.map((log) => (
                <div key={log.id} className="p-4 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100 animate-in fade-in">
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${log.severity === 'CRITICAL' ? 'bg-red-100 text-danger' : log.severity === 'HIGH' ? 'bg-orange-100 text-warning' : 'bg-yellow-50 text-yellow-600'}`}>
                      <i className={`fas ${log.violationType === 'TAB_SWITCH' ? 'fa-external-link-alt' : log.violationType === 'FACE_NOT_DETECTED' ? 'fa-user-slash' : 'fa-eye-slash'} text-xs`}></i>
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-bold text-gray-800 mb-0.5">{log.studentName}</p>
                      <p className="text-xs text-gray-500">{log.violationType}</p>
                      <div className="flex gap-2 mt-3">
                        <button onClick={() => removeLog(log.id)} className="flex-1 py-1.5 bg-red-50 text-danger hover:bg-red-100 rounded text-[10px] font-bold transition-colors">توجيه إنذار</button>
                        <button onClick={() => removeLog(log.id)} className="flex-1 py-1.5 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded text-[10px] font-bold transition-colors">تجاهل</button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* End Exam Modal */}
      {activeModal === "endExam" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 text-center">
              <div className="w-16 h-16 rounded-full bg-red-100 text-danger flex items-center justify-center text-3xl mx-auto mb-4">
                <i className="fas fa-hand-paper"></i>
              </div>
              <h2 className="font-black text-xl text-gray-800 mb-2">تأكيد إنهاء الامتحان للجميع</h2>
              <p className="text-gray-500 text-sm mb-6 leading-relaxed">
                هل أنت متأكد من رغبتك في إيقاف الامتحان؟ سيتم سحب إجابات جميع الطلاب.
              </p>
              <div className="flex justify-center gap-3">
                <button onClick={closeModal} disabled={isEnding} className="px-5 py-2.5 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200">إلغاء</button>
                <button onClick={handleForceEnd} disabled={isEnding} className="px-5 py-2.5 rounded-xl font-bold text-white bg-danger hover:bg-red-600 shadow-lg shadow-red-200">{isEnding ? "جاري الإنهاء..." : "نعم، أنهِ الامتحان"}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stream Modal */}
      {activeModal === "stream" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-slate-900 rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-slate-700">
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
              <h2 className="font-bold text-lg text-white flex items-center gap-2">
                <i className={`fas ${streamType === 'camera' ? 'fa-video' : 'fa-desktop'} text-primary`}></i>
                بث مباشر: {selectedStudent}
              </h2>
              <button onClick={closeModal} className="text-slate-400 hover:text-white p-1 transition-colors">
                <i className="fas fa-times text-lg"></i>
              </button>
            </div>
            <div className="aspect-video bg-black flex items-center justify-center relative group">
              <div className="absolute inset-0 flex items-center justify-center z-0">
                <i className={`fas ${streamType === 'camera' ? 'fa-user' : 'fa-window-maximize'} text-slate-800 text-9xl`}></i>
              </div>
              <div className="absolute top-4 right-4 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded flex items-center gap-2 z-10">
                <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span> LIVE
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
