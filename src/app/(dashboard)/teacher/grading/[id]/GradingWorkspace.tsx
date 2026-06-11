"use client";

import React, { useState, useTransition } from 'react';
import { gradeEssayAnswer, finalizeAttemptGrade } from '@/app/actions/submitExam';
import { useRouter } from 'next/navigation';

export default function GradingWorkspace({ exam, attempts }: { exam: any, attempts: any[] }) {
  const router = useRouter();
  const [selectedAttemptId, setSelectedAttemptId] = useState<string | null>(attempts[0]?.id || null);
  
  // Local state to manage edits before saving
  const [grades, setGrades] = useState<Record<string, { points: string, feedback: string }>>({});
  const [isPending, startTransition] = useTransition();

  const selectedAttempt = attempts.find(a => a.id === selectedAttemptId);

  // Initialize grades state when attempt changes
  React.useEffect(() => {
      if (selectedAttempt) {
          const initialGrades: Record<string, { points: string, feedback: string }> = {};
          selectedAttempt.answers.forEach((ans: any) => {
              initialGrades[ans.id] = {
                  points: ans.pointsAwarded !== null ? ans.pointsAwarded.toString() : '',
                  feedback: ans.feedback || ''
              };
          });
          setGrades(initialGrades);
      }
  }, [selectedAttemptId, selectedAttempt]);

  const totalGraded = attempts.filter(a => a.status === 'GRADED').length;
  const progressPercent = attempts.length > 0 ? (totalGraded / attempts.length) * 100 : 0;

  const handleSaveGrade = () => {
    if (!selectedAttempt) return;
    
    startTransition(async () => {
      // Save all edited answers
      for (const ans of selectedAttempt.answers) {
          const edited = grades[ans.id];
          if (edited) {
              const numPoints = parseFloat(edited.points) || 0;
              await gradeEssayAnswer(ans.id, numPoints, edited.feedback);
          }
      }

      await finalizeAttemptGrade(selectedAttempt.id);
      router.refresh();
      
      // Auto advance
      const currentIndex = attempts.findIndex(a => a.id === selectedAttempt.id);
      if (currentIndex < attempts.length - 1) {
        setSelectedAttemptId(attempts[currentIndex + 1].id);
      }
    });
  };

  const handleGradeChange = (answerId: string, field: 'points' | 'feedback', value: string) => {
      setGrades(prev => ({
          ...prev,
          [answerId]: {
              ...prev[answerId],
              [field]: value
          }
      }));
  };

  const examTitle = exam?.title || "هياكل البيانات (CS301)";

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] overflow-hidden bg-slate-50 -mx-6 -mt-6">
      
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0 shadow-sm z-10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-indigo-50 text-primary px-2 py-0.5 rounded text-[10px] font-bold border border-indigo-100">مراجعة الإجابات واعتماد النتيجة</span>
            <h1 className="text-xl font-bold text-gray-800">{examTitle}</h1>
          </div>
          <p className="text-sm text-gray-500">راجع التصحيح التلقائي وقم بتقييم الأسئلة المقالية</p>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="flex-1 overflow-hidden flex flex-col lg:flex-row scroll-smooth">
        
        {/* Right Column: Students List */}
        <aside className="w-full lg:w-80 bg-white border-l border-gray-200 flex flex-col shrink-0 h-1/3 lg:h-full z-0 shadow-[4px_0_10px_rgba(0,0,0,0.02)]">
          <div className="p-4 border-b border-gray-100 bg-gray-50/50">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-bold text-gray-700">تقدم المراجعة</span>
              <span className="text-sm font-bold text-primary" dir="ltr">{totalGraded} / {attempts.length}</span>
            </div>
            <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
              <div className="bg-primary h-full rounded-full transition-all" style={{ width: `${progressPercent}%` }}></div>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {attempts.map(attempt => {
              const isGraded = attempt.status === 'GRADED';
              const isActive = attempt.id === selectedAttemptId;
              
              return (
                <div 
                  key={attempt.id} 
                  onClick={() => setSelectedAttemptId(attempt.id)}
                  className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 bg-white transition-all duration-200 ${isActive ? 'border-r-4 border-r-primary bg-indigo-50/30' : 'border-r-4 border-r-transparent'}`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center text-xs font-bold">
                        {attempt.student.name.substring(0, 2)}
                      </div>
                      <div>
                        <h4 className={`text-sm font-bold ${isActive ? 'text-primary' : 'text-gray-800'}`}>{attempt.student.name}</h4>
                      </div>
                    </div>
                    {isGraded ? (
                      <span className="bg-green-100 text-success px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1">
                        <i className="fas fa-check-double"></i> معتمد
                      </span>
                    ) : (
                      <span className="bg-yellow-100 text-warning px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1">
                        <i className="fas fa-circle text-[6px]"></i> بانتظار
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </aside>

        {/* Left Column: Grading Area */}
        {selectedAttempt ? (
          <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50 relative">
            
            <div className="bg-white px-6 py-4 border-b border-gray-200 flex justify-between items-center shadow-sm z-10 shrink-0">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 text-primary flex items-center justify-center text-lg font-bold shadow-sm border border-indigo-200">
                        {selectedAttempt.student.name.substring(0, 2)}
                    </div>
                    <div>
                        <h4 className="text-base font-bold text-gray-800">إجابة الطالب: {selectedAttempt.student.name}</h4>
                        <p className="text-xs text-gray-500">تم التسليم: {new Intl.DateTimeFormat('ar-EG', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(selectedAttempt.submittedAt || new Date()))}</p>
                    </div>
                </div>
                <div className="text-left bg-gray-50 px-4 py-2 rounded-xl border border-gray-200">
                    <span className="text-xs text-gray-500 font-bold block mb-1">الدرجة الإجمالية المحسوبة</span>
                    <span className="text-xl font-black text-primary" dir="ltr">
                        {Object.values(grades).reduce((sum, g) => sum + (parseFloat(g.points) || 0), 0)} / {exam.totalPoints}
                    </span>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 pb-24">
              
              {selectedAttempt.answers.map((ans: any, index: number) => {
                  const q = ans.examQuestion;
                  const isEssay = q.questionType === 'ESSAY';
                  const studentAnswerText = typeof ans.answerPayload === 'string' ? ans.answerPayload : JSON.stringify(ans.answerPayload);

                  return (
                      <div key={ans.id} className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                        <div className="bg-gray-50 p-4 border-b border-gray-200 flex justify-between items-start">
                          <div>
                            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                                السؤال {index + 1}
                                {isEssay ? <span className="bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded text-[10px]">مقال (يحتاج مراجعة)</span> : <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-[10px]">تصحيح تلقائي</span>}
                            </h3>
                            <p className="text-gray-800 font-bold text-lg leading-relaxed">
                                {q.text}
                            </p>
                          </div>
                        </div>
                        
                        <div className="p-6 relative">
                          <div className="mb-6 border-b border-gray-100 pb-6">
                            <h4 className="text-sm font-bold text-gray-600 mb-2">إجابة الطالب:</h4>
                            <div className="bg-blue-50/30 border border-blue-100 p-4 rounded-xl text-gray-800 font-medium text-base leading-loose">
                                {studentAnswerText || "لا توجد إجابة مسجلة."}
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                            {/* Points Input */}
                            <div className="md:col-span-1 bg-gray-50 p-4 rounded-xl border border-gray-200 text-center flex flex-col justify-center h-full">
                              <label className="block text-sm font-bold text-gray-600 mb-2">الدرجة</label>
                              <div className="flex items-center justify-center text-3xl font-black text-gray-800 dir-ltr">
                                <input 
                                  type="number" 
                                  max={q.points || 1} 
                                  min="0" 
                                  step="0.5" 
                                  value={grades[ans.id]?.points || ''}
                                  onChange={(e) => handleGradeChange(ans.id, 'points', e.target.value)}
                                  className={`w-20 bg-white border-2 ${isEssay ? 'border-warning focus:ring-yellow-100' : 'border-primary focus:ring-indigo-100'} rounded-lg text-center focus:outline-none focus:ring-4 py-1.5 shadow-sm text-2xl`} 
                                  placeholder="-" 
                                  dir="ltr" 
                                />
                                <span className="text-gray-400 mx-2 text-2xl">/</span>
                                <span className="text-gray-500 text-2xl">{q.points}</span>
                              </div>
                            </div>

                            {/* Feedback */}
                            <div className="md:col-span-2">
                              <label className="block text-sm font-bold text-gray-700 mb-2">ملاحظات (اختياري)</label>
                              <textarea 
                                rows={2} 
                                value={grades[ans.id]?.feedback || ''}
                                onChange={(e) => handleGradeChange(ans.id, 'feedback', e.target.value)}
                                placeholder="اكتب ملاحظاتك على هذه الإجابة..." 
                                className="w-full bg-white border border-gray-300 rounded-xl p-3 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary shadow-sm resize-y"
                              ></textarea>
                            </div>
                          </div>
                        </div>
                      </div>
                  );
              })}

            </div>

            {/* Actions Footer */}
            <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-4 flex items-center justify-end shadow-[0_-4px_10px_-1px_rgba(0,0,0,0.05)] z-20">
              <button 
                onClick={handleSaveGrade}
                disabled={isPending}
                className="px-8 py-2.5 bg-primary hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-sm font-bold shadow-md shadow-indigo-200 transition-colors flex items-center gap-2"
              >
                {isPending ? "جاري الحفظ..." : selectedAttempt.status === 'GRADED' ? "تحديث النتيجة" : "اعتماد النتيجة والانتقال للتالي"} <i className="fas fa-check-double"></i>
              </button>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400 font-bold bg-slate-50">
            <div className="text-center">
                <i className="fas fa-tasks text-6xl text-gray-200 mb-4 block"></i>
                <p>اختر طالباً من القائمة للبدء بمراجعة إجاباته واعتمادها</p>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
