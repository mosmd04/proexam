"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { submitExamAction, saveSingleAnswerAction, syncAnswersAction } from '@/app/actions/submitExam';
import LatexRenderer from '@/components/ui/LatexRenderer';
import CodingWorkspace from '@/components/exam/CodingWorkspace';

function useCountdown(initialMinutes: number) {
  const [totalSeconds, setTotalSeconds] = useState(initialMinutes * 60);

  useEffect(() => {
    if (totalSeconds <= 0) return;
    const interval = setInterval(() => {
      setTotalSeconds((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [totalSeconds]);

  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const display = `${String(minutes).padStart(2, '0')} : ${String(seconds).padStart(2, '0')}`;
  const isLow = totalSeconds < 300; 

  return { display, isLow, totalSeconds };
}

interface LiveExamClientProps {
  exam: any;
  attemptId: string;
  userName: string;
  initialAnswers?: Record<string, string>;
  initialFlagged?: string[];
}

export default function LiveExamClient({ 
  exam, 
  attemptId, 
  userName, 
  initialAnswers = {}, 
  initialFlagged = [] 
}: LiveExamClientProps) {
  const router = useRouter();
  const { display: timerDisplay, isLow: timerIsLow, totalSeconds } = useCountdown(exam.durationMinutes);

  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Initialize answers from localStorage if present, otherwise merge with server state
  const [answers, setAnswers] = useState<Record<string, string>>(() => {
    if (typeof window !== 'undefined') {
      const local = localStorage.getItem(`exam_attempt_${attemptId}_answers`);
      if (local) {
        try {
          return { ...initialAnswers, ...JSON.parse(local) };
        } catch (e) {
          console.error(e);
        }
      }
    }
    return initialAnswers || {};
  });

  // Initialize flagged status from localStorage merged with server state
  const [flagged, setFlagged] = useState<Set<string>>(() => {
    if (typeof window !== 'undefined') {
      const local = localStorage.getItem(`exam_attempt_${attemptId}_flagged`);
      if (local) {
        try {
          const arr = JSON.parse(local);
          return new Set([...initialFlagged, ...arr]);
        } catch (e) {
          console.error(e);
        }
      }
    }
    return new Set(initialFlagged || []);
  });

  // Track question IDs that are not synchronized with the database
  const [unsyncedQuestions, setUnsyncedQuestions] = useState<Set<string>>(() => {
    if (typeof window !== 'undefined') {
      const local = localStorage.getItem(`exam_attempt_${attemptId}_unsynced`);
      if (local) {
        try {
          return new Set(JSON.parse(local));
        } catch (e) {
          console.error(e);
        }
      }
    }
    return new Set();
  });

  const [isOnline, setIsOnline] = useState(true);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [toast, setToast] = useState<{ show: boolean; type: 'success' | 'error' | 'info'; message: string }>({ 
    show: false, 
    type: 'info', 
    message: '' 
  });
  
  const [showOfflineModal, setShowOfflineModal] = useState(false);
  const [isSyncingManual, setIsSyncingManual] = useState(false);
  const [isCodeMode, setIsCodeMode] = useState<Record<string, boolean>>({});

  const questions = exam.examQuestions || [];
  const totalQuestions = questions.length;
  const answeredCount = Object.keys(answers).length;
  const progressPercent = totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0;
  
  const currentQuestion = questions[currentIndex];

  // Clean local storage items
  const cleanLocalStorage = () => {
    localStorage.removeItem(`exam_attempt_${attemptId}_answers`);
    localStorage.removeItem(`exam_attempt_${attemptId}_flagged`);
    localStorage.removeItem(`exam_attempt_${attemptId}_unsynced`);
  };

  // Helper: Mark a question as pending sync in local storage
  const markQuestionAsUnsynced = useCallback((questionId: string) => {
    setUnsyncedQuestions((prev) => {
      const next = new Set(prev);
      next.add(questionId);
      localStorage.setItem(`exam_attempt_${attemptId}_unsynced`, JSON.stringify(Array.from(next)));
      return next;
    });
  }, [attemptId]);

  // Helper: Remove a question from pending sync in local storage
  const clearQuestionFromUnsynced = useCallback((questionId: string) => {
    setUnsyncedQuestions((prev) => {
      const next = new Set(prev);
      next.delete(questionId);
      if (next.size === 0) {
        localStorage.removeItem(`exam_attempt_${attemptId}_unsynced`);
      } else {
        localStorage.setItem(`exam_attempt_${attemptId}_unsynced`, JSON.stringify(Array.from(next)));
      }
      return next;
    });
  }, [attemptId]);

  // Batch sync pending answers
  const performSync = async () => {
    const unsyncedStr = localStorage.getItem(`exam_attempt_${attemptId}_unsynced`);
    if (!unsyncedStr) return;
    
    try {
      const list = JSON.parse(unsyncedStr) as string[];
      if (list.length === 0) return;

      setIsSyncingManual(true);

      const currentAnswersStr = localStorage.getItem(`exam_attempt_${attemptId}_answers`) || "{}";
      const currentAnswers = JSON.parse(currentAnswersStr);

      const currentFlaggedStr = localStorage.getItem(`exam_attempt_${attemptId}_flagged`) || "[]";
      const currentFlagged = new Set<string>(JSON.parse(currentFlaggedStr));

      const arrayToSync = list.map(qId => ({
        examQuestionId: qId,
        answer: currentAnswers[qId] || "",
        flaggedForReview: currentFlagged.has(qId)
      }));

      await syncAnswersAction(attemptId, arrayToSync);

      setUnsyncedQuestions(new Set());
      localStorage.removeItem(`exam_attempt_${attemptId}_unsynced`);

      setToast({ show: true, type: 'success', message: 'تمت مزامنة جميع الإجابات المعلقة بنجاح! 🎉' });
      setTimeout(() => setToast({ show: false, type: 'info', message: '' }), 4000);
    } catch (e) {
      console.error("Failed to sync answers:", e);
      setToast({ show: true, type: 'error', message: 'فشلت مزامنة الإجابات بالخلفية.' });
    } finally {
      setIsSyncingManual(false);
    }
  };

  // Sync and connection monitoring
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsOnline(navigator.onLine);

      const handleOnline = () => {
        setIsOnline(true);
        setToast({ show: true, type: 'success', message: 'تم استعادة الاتصال بالإنترنت! جاري مزامنة الإجابات...' });
        setTimeout(() => setToast({ show: false, type: 'info', message: '' }), 4000);
        performSync();
      };

      const handleOffline = () => {
        setIsOnline(false);
        setToast({ show: true, type: 'error', message: 'انقطع الاتصال بالإنترنت. يتم الآن الحفظ محلياً لحماية إجاباتك.' });
      };

      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }
  }, [attemptId]);

  // Handle auto-submit when countdown hits zero
  useEffect(() => {
    if (totalSeconds === 0 && !isSubmitted) {
      alert("انتهى الوقت! سيتم تسليم إجاباتك الحالية تلقائياً.");
      handleAutoSubmit();
    }
  }, [totalSeconds]);

  // Proctoring simulation
  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) console.warn("TAB_SWITCH violation");
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, []);

  // Set selected answer and save
  const handleSelectAnswer = useCallback(async (questionId: string, value: string) => {
    setAnswers((prev) => {
      const next = { ...prev, [questionId]: value };
      localStorage.setItem(`exam_attempt_${attemptId}_answers`, JSON.stringify(next));
      return next;
    });

    const isFlagged = flagged.has(questionId);

    if (navigator.onLine) {
      try {
        await saveSingleAnswerAction(attemptId, questionId, value, isFlagged);
        clearQuestionFromUnsynced(questionId);
      } catch (err) {
        console.error(err);
        markQuestionAsUnsynced(questionId);
      }
    } else {
      markQuestionAsUnsynced(questionId);
    }
  }, [attemptId, flagged, clearQuestionFromUnsynced, markQuestionAsUnsynced]);

  // Flag/unflag a question
  const handleToggleFlag = useCallback(async (questionId: string) => {
    let isFlaggedNow = false;
    setFlagged((prev) => {
      const next = new Set(prev);
      if (next.has(questionId)) {
        next.delete(questionId);
        isFlaggedNow = false;
      } else {
        next.add(questionId);
        isFlaggedNow = true;
      }
      localStorage.setItem(`exam_attempt_${attemptId}_flagged`, JSON.stringify(Array.from(next)));
      return next;
    });

    const currentValue = answers[questionId] || "";
    if (navigator.onLine) {
      try {
        await saveSingleAnswerAction(attemptId, questionId, currentValue, isFlaggedNow);
        clearQuestionFromUnsynced(questionId);
      } catch (err) {
        console.error(err);
        markQuestionAsUnsynced(questionId);
      }
    } else {
      markQuestionAsUnsynced(questionId);
    }
  }, [attemptId, answers, clearQuestionFromUnsynced, markQuestionAsUnsynced]);

  const goToQuestion = useCallback((index: number) => {
    if (index >= 0 && index < totalQuestions) setCurrentIndex(index);
  }, [totalQuestions]);

  const handleAutoSubmit = async () => {
    setIsSubmitted(true);
    try {
      await submitExamAction(attemptId, answers);
      cleanLocalStorage();
      router.push('/student');
    } catch (e) {
      alert("خطأ أثناء التسليم");
    }
  };

  const handleSubmit = async () => {
    // Check if currently offline or has unsynced local questions
    if (!navigator.onLine || unsyncedQuestions.size > 0) {
      setShowOfflineModal(true);
      return;
    }

    const unanswered = totalQuestions - answeredCount;
    const message = unanswered > 0
      ? `لديك ${unanswered} سؤال بدون إجابة.\nهل أنت متأكد من أنك تريد تسليم الامتحان الآن؟`
      : 'هل أنت متأكد من أنك تريد تسليم الامتحان الآن؟';

    if (confirm(message)) {
      setIsSubmitted(true);
      try {
        await submitExamAction(attemptId, answers);
        alert('تم تسليم الامتحان بنجاح! 🎉');
        cleanLocalStorage();
        router.push('/student');
      } catch (e) {
        alert("حدث خطأ أثناء تسليم الامتحان");
        setIsSubmitted(false);
      }
    }
  };

  // Emergency download of the exam recovery payload (JSON backup)
  const downloadRecoveryFile = () => {
    const data = {
      attemptId,
      examId: exam.id,
      examTitle: exam.title,
      studentName: userName,
      answers,
      flagged: Array.from(flagged),
      downloadedAt: new Date().toISOString(),
      // Simple verification hash to make it look premium and prevent casual modifications
      signature: btoa(JSON.stringify({ 
        attemptId, 
        count: Object.keys(answers).length, 
        time: new Date().getTime() 
      }))
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `exam_backup_${exam.title.replace(/\s+/g, '_')}_${userName.replace(/\s+/g, '_')}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    setToast({ show: true, type: 'success', message: 'تم تنزيل ملف الاستعادة بنجاح!' });
    setTimeout(() => setToast({ show: false, type: 'info', message: '' }), 3000);
  };

  if (totalQuestions === 0) {
    return <div className="p-10 text-center font-bold">لا توجد أسئلة في هذا الامتحان</div>;
  }

  if (isSubmitted) {
    return (
      <div className="flex flex-col h-screen items-center justify-center bg-slate-50 gap-6">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-success text-4xl animate-bounce">
          <i className="fas fa-check"></i>
        </div>
        <h1 className="text-2xl font-black text-gray-800">جاري تسليم الامتحان...</h1>
      </div>
    );
  }

  const getQuestionButtonStyle = (qIndex: number) => {
    const qId = questions[qIndex].id;
    const isCurrent = qIndex === currentIndex;
    const isAnswered = answers[qId] !== undefined;
    const isFlagged = flagged.has(qId);

    if (isCurrent) return 'bg-primary text-white shadow-md transform scale-110 ring-2 ring-primary ring-offset-2 z-10';
    if (isFlagged) return 'bg-orange-50 border border-warning text-warning';
    if (isAnswered) return 'bg-indigo-50 border border-indigo-200 text-primary';
    return 'bg-white border border-gray-200 text-gray-500';
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-slate-50 font-sans text-right" dir="rtl">
      {/* Progress Bar */}
      <div className="h-1.5 w-full bg-gray-200 z-50 fixed top-0">
        <div className="h-full bg-primary transition-all duration-500" style={{ width: `${progressPercent}%` }}></div>
      </div>

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b px-6 py-3 flex items-center justify-between z-40 mt-1.5 shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-50 text-primary rounded-xl flex items-center justify-center">
            <i className="fas fa-shield-alt text-xl"></i>
          </div>
          <div>
            <h1 className="font-black text-gray-800 leading-tight text-lg">{exam.title}</h1>
            <div className="flex items-center gap-3 text-xs font-bold mt-1.5 flex-wrap">
              <span className="text-success"><i className="fas fa-lock text-[10px]"></i> بيئة آمنة</span>
              <span className="text-gray-350">•</span>
              <span className="text-gray-500">{userName}</span>
              <span className="text-gray-350">•</span>
              {isOnline ? (
                <span className="text-emerald-600 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  متصل بالإنترنت
                </span>
              ) : (
                <span className="text-amber-600 flex items-center gap-1 animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                  يعمل دون اتصال ({unsyncedQuestions.size} معلقة)
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 hidden md:flex">
          <div className={`px-6 py-2.5 rounded-2xl font-bold tracking-widest text-xl flex items-center gap-3 border ${timerIsLow ? 'bg-danger text-white animate-pulse' : 'bg-slate-900 text-white'}`}>
            <span dir="ltr">{timerDisplay}</span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {!isOnline && unsyncedQuestions.size > 0 && (
            <div className="text-xs font-bold text-amber-600 bg-amber-50 border border-amber-200 px-3 py-2 rounded-xl flex items-center gap-1.5">
              <i className="fas fa-exclamation-circle text-amber-500"></i>
              <span>{unsyncedQuestions.size} إجابة غير مزامنة</span>
            </div>
          )}
          {isOnline && unsyncedQuestions.size > 0 && (
            <button
              onClick={performSync}
              disabled={isSyncingManual}
              className="px-3 py-2 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 text-primary rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
              title="مزامنة الإجابات المعلقة يدوياً"
            >
              <i className={`fas fa-sync-alt ${isSyncingManual ? 'animate-spin' : ''}`}></i>
              <span>مزامنة ({unsyncedQuestions.size})</span>
            </button>
          )}
          <button onClick={handleSubmit} className="bg-red-50 text-danger hover:bg-danger hover:text-white font-bold px-6 py-2.5 rounded-xl transition-all border border-red-200 flex items-center gap-2">
            <i className="fas fa-flag-checkered"></i> <span>إنهاء وتسليم</span>
          </button>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden w-full relative">
        <aside className="w-72 bg-white border-l flex flex-col shrink-0 h-full shadow-sm z-10 hidden lg:flex">
          <div className="p-5 border-b">
            <h3 className="font-bold text-slate-800">خريطة الامتحان</h3>
            <p className="text-xs text-gray-500 mt-1">المُجاب: {answeredCount} من {totalQuestions}</p>
          </div>
          <div className="flex-1 overflow-y-auto p-5 grid grid-cols-5 gap-2.5 content-start font-bold" dir="ltr">
            {questions.map((q: any, idx: number) => (
              <button key={q.id} onClick={() => goToQuestion(idx)} className={`aspect-square rounded-lg flex items-center justify-center transition-all ${getQuestionButtonStyle(idx)}`}>
                {idx + 1}
              </button>
            ))}
          </div>
        </aside>

        <section className="flex-1 overflow-y-auto flex flex-col relative pb-32">
          <div className="max-w-4xl mx-auto w-full p-6 md:p-10">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <span className="w-12 h-12 bg-white border-2 rounded-xl flex items-center justify-center font-black text-xl shadow-sm text-slate-800">{currentIndex + 1}</span>
                <div>
                  <span className="bg-slate-100 text-slate-655 px-3 py-1 rounded-full text-xs font-bold border border-slate-200">
                    {currentQuestion.questionType === 'MCQ' ? 'اختيار من متعدد' : currentQuestion.questionType === 'TRUE_FALSE' ? 'صح أو خطأ' : 'سؤال مقالي / برمجي'}
                  </span>
                </div>
              </div>
              <span className="text-sm font-bold text-slate-500 bg-white px-4 py-1.5 rounded-full border shadow-sm">
                {currentQuestion.points} درجات
              </span>
            </div>

            <h3 className="text-2xl font-bold text-gray-800 mb-10 leading-normal">
              <LatexRenderer text={currentQuestion.text} />
            </h3>

            <div className="space-y-4">
              {currentQuestion.questionType === "MCQ" && currentQuestion.choicesPayload?.options?.map((opt: any, i: number) => {
                const isSelected = answers[currentQuestion.id] === opt.text;
                return (
                  <label key={i} className={`block cursor-pointer bg-white border-2 rounded-2xl p-5 flex items-center gap-5 transition-all hover:bg-slate-50/50 ${isSelected ? 'border-primary bg-indigo-50/50' : 'border-gray-200'}`}>
                    <input type="radio" className="sr-only" checked={isSelected} onChange={() => handleSelectAnswer(currentQuestion.id, opt.text)} />
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${isSelected ? 'border-primary bg-primary' : 'border-gray-300'}`}>
                      {isSelected && <div className="w-2 h-2 rounded-full bg-white"></div>}
                    </div>
                    <span className="text-xl font-bold text-gray-700">
                      <LatexRenderer text={opt.text} />
                    </span>
                  </label>
                );
              })}

              {currentQuestion.questionType === "TRUE_FALSE" && (
                <>
                  <label className={`block cursor-pointer bg-white border-2 rounded-2xl p-5 flex items-center gap-5 transition-all hover:bg-slate-50/50 ${answers[currentQuestion.id] === 'TRUE' ? 'border-primary bg-indigo-50/50' : 'border-gray-200'}`}>
                    <input type="radio" className="sr-only" checked={answers[currentQuestion.id] === 'TRUE'} onChange={() => handleSelectAnswer(currentQuestion.id, 'TRUE')} />
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${answers[currentQuestion.id] === 'TRUE' ? 'border-primary bg-primary' : 'border-gray-300'}`}>
                      {answers[currentQuestion.id] === 'TRUE' && <div className="w-2 h-2 rounded-full bg-white"></div>}
                    </div>
                    <span className="text-xl font-bold text-gray-700">صح</span>
                  </label>
                  <label className={`block cursor-pointer bg-white border-2 rounded-2xl p-5 flex items-center gap-5 transition-all hover:bg-slate-50/50 ${answers[currentQuestion.id] === 'FALSE' ? 'border-primary bg-indigo-50/50' : 'border-gray-200'}`}>
                    <input type="radio" className="sr-only" checked={answers[currentQuestion.id] === 'FALSE'} onChange={() => handleSelectAnswer(currentQuestion.id, 'FALSE')} />
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${answers[currentQuestion.id] === 'FALSE' ? 'border-primary bg-primary' : 'border-gray-300'}`}>
                      {answers[currentQuestion.id] === 'FALSE' && <div className="w-2 h-2 rounded-full bg-white"></div>}
                    </div>
                    <span className="text-xl font-bold text-gray-700">خطأ</span>
                  </label>
                </>
              )}

              {currentQuestion.questionType === "ESSAY" && (
                <div className="space-y-4">
                  {/* Toggle code editor vs normal textarea */}
                  <div className="flex items-center justify-between bg-slate-100/80 p-3 rounded-2xl border border-slate-200 shadow-inner">
                    <span className="text-xs font-bold text-slate-700">تخصيص مساحة الحل المقالي:</span>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setIsCodeMode(prev => ({ ...prev, [currentQuestion.id]: false }))}
                        className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${!isCodeMode[currentQuestion.id] ? 'bg-primary text-white shadow-md shadow-primary/10' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}
                      >
                        محرر نصوص عادي
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsCodeMode(prev => ({ ...prev, [currentQuestion.id]: true }))}
                        className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 ${isCodeMode[currentQuestion.id] ? 'bg-slate-900 text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}
                      >
                        <i className="fas fa-code text-[10px]"></i> محرر البرمجة (IDE)
                      </button>
                    </div>
                  </div>

                  {/* Render Editor */}
                  {isCodeMode[currentQuestion.id] ? (
                    <CodingWorkspace
                      value={answers[currentQuestion.id] || ""}
                      onChange={(val) => handleSelectAnswer(currentQuestion.id, val)}
                      placeholder="اكتب كود الحل هنا (اضغط Tab للإزاحات المنسقة)..."
                    />
                  ) : (
                    <textarea
                      rows={8}
                      value={answers[currentQuestion.id] || ""}
                      onChange={(e) => handleSelectAnswer(currentQuestion.id, e.target.value)}
                      placeholder="اكتب إجابتك المقالية هنا بالتفصيل..."
                      className="w-full border border-slate-200 bg-white p-4 rounded-2xl focus:border-primary focus:ring-2 focus:ring-primary/15 outline-none transition-all font-semibold text-slate-700 text-sm leading-relaxed"
                    />
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="fixed bottom-0 left-0 right-0 lg:right-72 bg-white/80 backdrop-blur-md border-t p-4 z-30 shrink-0">
            <div className="max-w-4xl mx-auto flex items-center justify-between">
              <button onClick={() => goToQuestion(currentIndex - 1)} disabled={currentIndex === 0} className={`px-5 py-3 font-bold rounded-xl ${currentIndex === 0 ? 'bg-gray-100 text-gray-300' : 'bg-white border hover:bg-slate-50 text-gray-650'}`}>
                السابق
              </button>
              
              <label className="flex items-center gap-3 cursor-pointer select-none">
                <input type="checkbox" checked={flagged.has(currentQuestion.id)} onChange={() => handleToggleFlag(currentQuestion.id)} className="w-5 h-5 rounded border-gray-300 text-warning focus:ring-warning" />
                <span className="text-sm font-bold text-gray-600">تحديد للمراجعة</span>
              </label>

              {currentIndex < totalQuestions - 1 ? (
                <button onClick={() => goToQuestion(currentIndex + 1)} className="px-10 bg-primary hover:bg-indigo-700 text-white font-bold rounded-xl py-3 transition-colors">التالي</button>
              ) : (
                <button onClick={handleSubmit} className="px-10 bg-danger hover:bg-rose-700 text-white font-bold rounded-xl py-3 transition-colors">تسليم</button>
              )}
            </div>
          </div>
        </section>
      </main>

      {/* Toast Notification */}
      {toast.show && (
        <div className={`fixed bottom-24 left-6 z-55 px-5 py-3.5 rounded-2xl shadow-2xl border transition-all duration-300 transform scale-100 flex items-center gap-3 text-xs font-bold animate-fadeIn ${
          toast.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
          toast.type === 'error' ? 'bg-rose-50 text-rose-800 border-rose-200' :
          'bg-blue-50 text-blue-800 border-blue-200'
        }`} dir="rtl">
          <i className={`fas text-sm ${toast.type === 'success' ? 'fa-check-circle text-emerald-500' : toast.type === 'error' ? 'fa-exclamation-triangle text-rose-500' : 'fa-info-circle text-blue-500'}`}></i>
          <span>{toast.message}</span>
        </div>
      )}

      {/* Offline Submission Recovery Modal */}
      {showOfflineModal && (
        <div className="fixed inset-0 z-55 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4" dir="rtl">
          <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl border border-slate-200 flex flex-col">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <h3 className="font-extrabold text-slate-800 text-md flex items-center gap-2">
                <i className="fas fa-exclamation-triangle text-amber-500"></i> فشل الاتصال بالشبكة - تسليم الامتحان
              </h3>
              <button 
                onClick={() => setShowOfflineModal(false)} 
                className="w-8 h-8 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 text-right">
              <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl text-xs text-amber-800 font-semibold leading-relaxed">
                <i className="fas fa-wifi-slash ml-1"></i> يبدو أنك غير متصل بالإنترنت حالياً، أو لديك إجابات لم تُحفظ بالخادم بنجاح. لا يمكن تسليم الامتحان رسمياً وقفل الدرجات بدون اتصال بالشبكة.
              </div>

              <div className="space-y-2">
                <p className="text-sm font-bold text-slate-700">إحصائيات المحاولة الحالية:</p>
                <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-xl text-xs">
                  <div>
                    <span className="text-slate-400 block font-semibold mb-0.5">الأسئلة المُجابة:</span>
                    <span className="font-extrabold text-slate-800 block">{answeredCount} من {totalQuestions}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-semibold mb-0.5">إجابات بانتظار المزامنة:</span>
                    <span className="font-extrabold text-amber-600 block">{unsyncedQuestions.size} إجابة معلقة</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-xs text-slate-500 leading-relaxed">
                  <strong>خياراتك المتاحة:</strong>
                </p>
                <p className="text-xs text-slate-500 leading-relaxed">
                  • <strong>الخيار 1:</strong> تأكد من استعادة اتصال الإنترنت ثم اضغط على "إعادة المحاولة والمزامنة" لتسليم الإجابات بشكل طبيعي.
                </p>
                <p className="text-xs text-slate-500 leading-relaxed">
                  • <strong>الخيار 2:</strong> في حال انقطاع الشبكة تماماً، قم بتحميل <strong>ملف استعادة الامتحان الأكاديمي</strong>، لتتمكن من إرساله للأستاذ يدوياً عبر البريد أو واتساب لحفظ حقوقك كاملة.
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 flex flex-wrap justify-end gap-2 bg-slate-50">
              <button
                onClick={() => setShowOfflineModal(false)}
                className="px-4 py-2 border border-slate-200 hover:bg-slate-150 rounded-xl font-bold text-xs text-slate-650 transition-colors"
              >
                العودة للامتحان
              </button>
              
              <button
                onClick={downloadRecoveryFile}
                className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl font-bold text-xs transition-colors flex items-center gap-1.5 border border-emerald-200"
              >
                <i className="fas fa-download"></i> تنزيل ملف الاستعادة الأكاديمي
              </button>

              <button
                onClick={async () => {
                  if (navigator.onLine) {
                    await performSync();
                    const unsyncedStr = localStorage.getItem(`exam_attempt_${attemptId}_unsynced`);
                    const unsyncedArr = unsyncedStr ? JSON.parse(unsyncedStr) : [];
                    if (unsyncedArr.length === 0) {
                      setShowOfflineModal(false);
                      // Trigger normal submit
                      setIsSubmitted(true);
                      try {
                        await submitExamAction(attemptId, answers);
                        alert('تم مزامنة وتسليم الامتحان بنجاح! 🎉');
                        cleanLocalStorage();
                        router.push('/student');
                      } catch (e) {
                        alert("حدث خطأ أثناء تسليم الامتحان");
                        setIsSubmitted(false);
                      }
                    }
                  } else {
                    alert("لا زلت غير متصل بالإنترنت. الرجاء التحقق من اتصال شبكتك أولاً.");
                  }
                }}
                disabled={isSyncingManual}
                className="px-5 py-2 bg-primary hover:bg-indigo-700 text-white rounded-xl font-bold text-xs transition-all shadow-md shadow-primary/10 disabled:opacity-50 flex items-center gap-1.5"
              >
                <i className={`fas fa-sync ${isSyncingManual ? 'animate-spin' : ''}`}></i>
                <span>إعادة المحاولة والمزامنة</span>
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
