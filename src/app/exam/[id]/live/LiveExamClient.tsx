"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { submitExamAction } from '@/app/actions/submitExam';

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

export default function LiveExamClient({ exam, attemptId, userName }: { exam: any, attemptId: string, userName: string }) {
  const router = useRouter();
  const { display: timerDisplay, isLow: timerIsLow, totalSeconds } = useCountdown(exam.durationMinutes);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [flagged, setFlagged] = useState<Set<string>>(new Set());
  const [isSubmitted, setIsSubmitted] = useState(false);

  const questions = exam.examQuestions || [];
  const totalQuestions = questions.length;
  const answeredCount = Object.keys(answers).length;
  const progressPercent = totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0;
  
  const currentQuestion = questions[currentIndex];

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

  const handleSelectAnswer = useCallback((questionId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  }, []);

  const handleToggleFlag = useCallback((questionId: string) => {
    setFlagged((prev) => {
      const next = new Set(prev);
      if (next.has(questionId)) next.delete(questionId);
      else next.add(questionId);
      return next;
    });
  }, []);

  const goToQuestion = useCallback((index: number) => {
    if (index >= 0 && index < totalQuestions) setCurrentIndex(index);
  }, [totalQuestions]);

  const handleAutoSubmit = async () => {
    setIsSubmitted(true);
    try {
      await submitExamAction(attemptId, answers);
      router.push('/student');
    } catch (e) {
      alert("خطأ أثناء التسليم");
    }
  };

  const handleSubmit = async () => {
    const unanswered = totalQuestions - answeredCount;
    const message = unanswered > 0
      ? `لديك ${unanswered} سؤال بدون إجابة.\nهل أنت متأكد من أنك تريد تسليم الامتحان الآن؟`
      : 'هل أنت متأكد من أنك تريد تسليم الامتحان الآن؟';

    if (confirm(message)) {
      setIsSubmitted(true);
      try {
        await submitExamAction(attemptId, answers);
        alert('تم تسليم الامتحان بنجاح! 🎉');
        router.push('/student');
      } catch (e) {
        alert("حدث خطأ أثناء تسليم الامتحان");
        setIsSubmitted(false);
      }
    }
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
    <div className="flex flex-col h-screen overflow-hidden bg-slate-50 font-sans">
      {/* Progress Bar */}
      <div className="h-1.5 w-full bg-gray-200 z-50 fixed top-0">
        <div className="h-full bg-primary transition-all duration-500" style={{ width: `${progressPercent}%` }}></div>
      </div>

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b px-6 py-3 flex items-center justify-between z-40 mt-1.5">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-50 text-primary rounded-xl flex items-center justify-center">
            <i className="fas fa-shield-alt text-xl"></i>
          </div>
          <div>
            <h1 className="font-black text-gray-800 leading-tight text-lg">{exam.title}</h1>
            <div className="flex items-center gap-2 text-xs font-bold">
              <span className="text-success"><i className="fas fa-lock text-[10px]"></i> بيئة آمنة</span>
              <span className="text-gray-300">•</span>
              <span className="text-gray-500">{userName}</span>
            </div>
          </div>
        </div>

        <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 hidden md:flex">
          <div className={`px-6 py-2.5 rounded-2xl font-bold tracking-widest text-xl flex items-center gap-3 border ${timerIsLow ? 'bg-danger text-white animate-pulse' : 'bg-slate-900 text-white'}`}>
            <span dir="ltr">{timerDisplay}</span>
          </div>
        </div>

        <button onClick={handleSubmit} className="bg-red-50 text-danger hover:bg-danger hover:text-white font-bold px-6 py-2.5 rounded-xl transition-all border border-red-200 flex items-center gap-2">
          <i className="fas fa-flag-checkered"></i> <span className="hidden sm:inline">إنهاء وتسليم</span>
        </button>
      </header>

      <main className="flex-1 flex overflow-hidden w-full relative">
        <aside className="w-72 bg-white border-l flex flex-col shrink-0 h-full shadow-sm z-10 hidden lg:flex">
          <div className="p-5 border-b">
            <h3 className="font-bold">خريطة الامتحان</h3>
            <p className="text-xs text-gray-500">المُجاب: {answeredCount} من {totalQuestions}</p>
          </div>
          <div className="flex-1 overflow-y-auto p-5 grid grid-cols-5 gap-2.5 content-start font-bold" dir="ltr">
            {questions.map((q: any, idx: number) => (
              <button key={q.id} onClick={() => goToQuestion(idx)} className={`aspect-square rounded-lg flex items-center justify-center ${getQuestionButtonStyle(idx)}`}>
                {idx + 1}
              </button>
            ))}
          </div>
        </aside>

        <section className="flex-1 overflow-y-auto flex flex-col relative pb-32">
          <div className="max-w-4xl mx-auto w-full p-6 md:p-10">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <span className="w-12 h-12 bg-white border-2 rounded-xl flex items-center justify-center font-black text-xl shadow-sm">{currentIndex + 1}</span>
                <div>
                  <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-bold border">
                    {currentQuestion.questionType === 'MCQ' ? 'اختيار من متعدد' : 'صح أو خطأ'}
                  </span>
                </div>
              </div>
              <span className="text-sm font-bold text-gray-500 bg-white px-4 py-1.5 rounded-full border shadow-sm">
                {currentQuestion.points} درجات
              </span>
            </div>

            <h3 className="text-2xl font-bold text-gray-800 mb-10 leading-normal">{currentQuestion.text}</h3>

            <div className="space-y-4">
              {currentQuestion.questionType === "MCQ" && currentQuestion.choicesPayload?.options?.map((opt: any, i: number) => {
                const isSelected = answers[currentQuestion.id] === opt.text;
                return (
                  <label key={i} className={`block cursor-pointer bg-white border-2 rounded-2xl p-5 flex items-center gap-5 transition-all ${isSelected ? 'border-primary bg-indigo-50' : 'border-gray-200'}`}>
                    <input type="radio" className="sr-only" checked={isSelected} onChange={() => handleSelectAnswer(currentQuestion.id, opt.text)} />
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${isSelected ? 'border-primary bg-primary' : 'border-gray-300'}`}>
                      {isSelected && <div className="w-2 h-2 rounded-full bg-white"></div>}
                    </div>
                    <span className="text-xl font-bold text-gray-700">{opt.text}</span>
                  </label>
                );
              })}

              {currentQuestion.questionType === "TRUE_FALSE" && (
                <>
                  <label className={`block cursor-pointer bg-white border-2 rounded-2xl p-5 flex items-center gap-5 transition-all ${answers[currentQuestion.id] === 'TRUE' ? 'border-primary bg-indigo-50' : 'border-gray-200'}`}>
                    <input type="radio" className="sr-only" checked={answers[currentQuestion.id] === 'TRUE'} onChange={() => handleSelectAnswer(currentQuestion.id, 'TRUE')} />
                    <span className="text-xl font-bold text-gray-700">صح</span>
                  </label>
                  <label className={`block cursor-pointer bg-white border-2 rounded-2xl p-5 flex items-center gap-5 transition-all ${answers[currentQuestion.id] === 'FALSE' ? 'border-primary bg-indigo-50' : 'border-gray-200'}`}>
                    <input type="radio" className="sr-only" checked={answers[currentQuestion.id] === 'FALSE'} onChange={() => handleSelectAnswer(currentQuestion.id, 'FALSE')} />
                    <span className="text-xl font-bold text-gray-700">خطأ</span>
                  </label>
                </>
              )}
            </div>
          </div>

          <div className="fixed bottom-0 left-0 right-0 lg:right-72 bg-white/80 backdrop-blur-md border-t p-4 z-30">
            <div className="max-w-4xl mx-auto flex items-center justify-between">
              <button onClick={() => goToQuestion(currentIndex - 1)} disabled={currentIndex === 0} className={`px-5 py-3 font-bold rounded-xl ${currentIndex === 0 ? 'bg-gray-100 text-gray-300' : 'bg-white border text-gray-600'}`}>
                السابق
              </button>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={flagged.has(currentQuestion.id)} onChange={() => handleToggleFlag(currentQuestion.id)} className="w-5 h-5 rounded border-gray-300 text-warning" />
                <span className="text-sm font-bold text-gray-600">تحديد للمراجعة</span>
              </label>
              {currentIndex < totalQuestions - 1 ? (
                <button onClick={() => goToQuestion(currentIndex + 1)} className="px-10 bg-primary text-white font-bold rounded-xl py-3">التالي</button>
              ) : (
                <button onClick={handleSubmit} className="px-10 bg-danger text-white font-bold rounded-xl py-3">تسليم</button>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
