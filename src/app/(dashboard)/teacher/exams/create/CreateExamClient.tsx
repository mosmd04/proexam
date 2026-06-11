"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { saveExam } from "@/app/actions/teacherExam";

export default function CreateExamClient({ courses }: { courses: any[] }) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Exam Settings State
  const [title, setTitle] = useState("");
  const [courseId, setCourseId] = useState("");
  const [description, setDescription] = useState("");
  const [scheduledStart, setScheduledStart] = useState("");
  const [scheduledEnd, setScheduledEnd] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [shuffleQuestions, setShuffleQuestions] = useState(true);
  const [enableProctoring, setEnableProctoring] = useState(true);

  // Questions State
  const [questions, setQuestions] = useState<any[]>([]);
  const [showModal, setShowModal] = useState<"none" | "mcq" | "tf">("none");
  const [editingQuestion, setEditingQuestion] = useState<any>(null);

  // Form handling
  const handleNext = () => {
    if (currentStep === 1) {
      if (!title || !courseId || !scheduledStart || !scheduledEnd || !durationMinutes) {
        alert("يرجى تعبئة جميع الحقول الإلزامية (العنوان، المقرر، توقيت البدء والنهاية).");
        return;
      }
    }
    if (currentStep === 2 && questions.length === 0) {
      alert("يرجى إضافة سؤال واحد على الأقل.");
      return;
    }
    if (currentStep < 3) setCurrentStep(prev => (prev + 1) as 1 | 2 | 3);
  };

  const handlePublish = async (status = "PUBLISHED") => {
    try {
      setIsSubmitting(true);
      await saveExam({
        title, courseId, description, scheduledStart, scheduledEnd, durationMinutes, shuffleQuestions, enableProctoring, questions, status
      });
      alert(`تم ${status === "PUBLISHED" ? "نشر" : "حفظ"} الامتحان بنجاح!`);
      router.push("/teacher/exams");
    } catch (e) {
      console.error(e);
      alert("حدث خطأ أثناء الحفظ");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Question Form
  const [qText, setQText] = useState("");
  const [qPoints, setQPoints] = useState(1);
  const [mcqOptions, setMcqOptions] = useState([{ id: 1, text: "", isCorrect: true }, { id: 2, text: "", isCorrect: false }]);
  const [tfAnswer, setTfAnswer] = useState(true);

  const resetQuestionForm = () => {
    setQText(""); setQPoints(1);
    setMcqOptions([{ id: 1, text: "", isCorrect: true }, { id: 2, text: "", isCorrect: false }]);
    setTfAnswer(true);
  };

  const saveQuestion = () => {
    if (!qText) return alert("الرجاء كتابة نص السؤال");
    
    let formattedQuestion: any = {
      id: Date.now(),
      type: showModal,
      text: qText,
      points: qPoints
    };

    if (showModal === "mcq") {
      const validOptions = mcqOptions.filter(o => o.text.trim() !== "");
      if (validOptions.length < 2) return alert("يجب إضافة خيارين على الأقل");
      if (!validOptions.some(o => o.isCorrect)) return alert("يجب تحديد إجابة صحيحة واحدة على الأقل");
      formattedQuestion.options = { options: validOptions.map(o => ({ text: o.text, isCorrect: o.isCorrect })) };
    } else if (showModal === "tf") {
      formattedQuestion.options = { correctAnswer: tfAnswer };
    }

    setQuestions([...questions, formattedQuestion]);
    setShowModal("none");
    resetQuestionForm();
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50 relative">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shrink-0 shadow-sm z-20">
        <div>
          <h1 className="text-xl font-bold text-gray-800">إنشاء امتحان جديد</h1>
          <p className="text-sm text-gray-500 mt-0.5">جهز امتحانك بشكل احترافي ومحكم</p>
        </div>
      </header>

      {/* Stepper */}
      <div className="bg-white border-b border-gray-100 px-6 py-4 shrink-0 shadow-sm z-10">
        <div className="flex items-center justify-center gap-10">
          <div className={`font-bold ${currentStep >= 1 ? "text-primary" : "text-gray-400"}`}>1. الإعدادات</div>
          <div className={`font-bold ${currentStep >= 2 ? "text-primary" : "text-gray-400"}`}>2. الأسئلة</div>
          <div className={`font-bold ${currentStep === 3 ? "text-primary" : "text-gray-400"}`}>3. النشر</div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 pb-24">
        {currentStep === 1 && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold mb-4">المعلومات الأساسية والتوقيت</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">عنوان الامتحان *</label>
                  <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full border p-2 rounded-lg" placeholder="امتحان منتصف الفصل" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">المقرر الدراسي *</label>
                  <select value={courseId} onChange={e => setCourseId(e.target.value)} className="w-full border p-2 rounded-lg">
                    <option value="">اختر المقرر...</option>
                    {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">وصف أو تعليمات للطلاب</label>
                  <textarea value={description} onChange={e => setDescription(e.target.value)} className="w-full border p-2 rounded-lg" rows={3}></textarea>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">تاريخ ووقت البدء *</label>
                    <input type="datetime-local" value={scheduledStart} onChange={e => setScheduledStart(e.target.value)} className="w-full border p-2 rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">تاريخ ووقت الإغلاق النهائي *</label>
                    <input type="datetime-local" value={scheduledEnd} onChange={e => setScheduledEnd(e.target.value)} className="w-full border p-2 rounded-lg" />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">المدة المسموحة (بالدقائق) *</label>
                  <input type="number" min="5" value={durationMinutes} onChange={e => setDurationMinutes(Number(e.target.value))} className="w-full border p-2 rounded-lg" />
                </div>
              </div>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="flex gap-6 h-full">
            <aside className="w-64 shrink-0 space-y-3">
              <button onClick={() => {setShowModal("mcq"); resetQuestionForm();}} className="w-full p-4 bg-white border border-gray-200 rounded-xl font-bold text-primary hover:bg-indigo-50 transition-colors shadow-sm">+ إضافة خيارات متعددة</button>
              <button onClick={() => {setShowModal("tf"); resetQuestionForm();}} className="w-full p-4 bg-white border border-gray-200 rounded-xl font-bold text-emerald-600 hover:bg-emerald-50 transition-colors shadow-sm">+ إضافة صح أو خطأ</button>
            </aside>
            <div className="flex-1 bg-white rounded-2xl border border-gray-200 p-6 overflow-y-auto">
              <h3 className="font-bold mb-4">الأسئلة المُضافة ({questions.length})</h3>
              <div className="space-y-4">
                {questions.map((q, i) => (
                  <div key={q.id} className="border p-4 rounded-lg bg-slate-50">
                    <p className="font-bold">{i+1}. {q.text} <span className="text-sm text-gray-500">({q.points} درجات)</span></p>
                    <p className="text-xs text-primary mt-1">{q.type === 'mcq' ? 'خيارات متعددة' : 'صح أو خطأ'}</p>
                  </div>
                ))}
                {questions.length === 0 && <p className="text-gray-400">لا توجد أسئلة بعد.</p>}
              </div>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center">
              <i className="fas fa-check-circle text-5xl text-success mb-4"></i>
              <h2 className="text-2xl font-bold mb-2">مراجعة الامتحان قبل النشر</h2>
              <p className="text-gray-600 mb-6">يحتوي هذا الامتحان على {questions.length} أسئلة بمجموع درجات {questions.reduce((a,c)=>a+c.points,0)}.</p>
              
              <div className="text-right bg-slate-50 p-4 rounded-xl space-y-2 mb-6">
                <p><strong>العنوان:</strong> {title}</p>
                <p><strong>يفتح في:</strong> {new Date(scheduledStart).toLocaleString('ar-EG')}</p>
                <p><strong>يغلق في:</strong> {new Date(scheduledEnd).toLocaleString('ar-EG')}</p>
                <p><strong>المدة:</strong> {durationMinutes} دقيقة</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 bg-white border-t px-6 py-4 flex justify-between shadow-sm z-30">
        {currentStep > 1 ? (
          <button onClick={() => setCurrentStep(prev => prev-1 as 1|2|3)} className="px-6 py-2 border rounded-xl font-bold">السابق</button>
        ) : <div></div>}
        <div className="flex gap-3">
          {currentStep < 3 ? (
            <button onClick={handleNext} className="px-8 py-2 bg-primary text-white rounded-xl font-bold">التالي</button>
          ) : (
            <button disabled={isSubmitting} onClick={() => handlePublish("PUBLISHED")} className="px-8 py-2 bg-success text-white rounded-xl font-bold flex gap-2">
              {isSubmitting ? "جاري النشر..." : "اعتماد ونشر"}
            </button>
          )}
        </div>
      </div>

      {/* Add Question Modal */}
      {showModal !== "none" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl">
            <div className="p-4 border-b bg-slate-50 font-bold">
              إضافة سؤال {showModal === "mcq" ? "خيارات متعددة" : "صح أو خطأ"}
            </div>
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div>
                <label className="block text-sm font-bold mb-1">نص السؤال</label>
                <textarea value={qText} onChange={e=>setQText(e.target.value)} className="w-full border p-2 rounded-lg" rows={3}></textarea>
              </div>
              
              {showModal === "mcq" && (
                <div>
                  <label className="block text-sm font-bold mb-2">الخيارات (اختر الإجابة الصحيحة)</label>
                  {mcqOptions.map((opt, idx) => (
                    <div key={opt.id} className="flex items-center gap-2 mb-2">
                      <input type="radio" name="correctAnswer" checked={opt.isCorrect} onChange={() => setMcqOptions(mcqOptions.map((o, i) => ({ ...o, isCorrect: i === idx })))} className="w-4 h-4 text-primary" />
                      <input type="text" value={opt.text} onChange={e => setMcqOptions(mcqOptions.map((o, i) => i === idx ? { ...o, text: e.target.value } : o))} className={`flex-1 border p-2 rounded-lg text-sm ${opt.isCorrect ? 'border-primary bg-indigo-50' : ''}`} placeholder={`الخيار ${idx+1}`} />
                      {mcqOptions.length > 2 && (
                        <button onClick={() => setMcqOptions(mcqOptions.filter((_, i) => i !== idx))} className="text-danger"><i className="fas fa-trash"></i></button>
                      )}
                    </div>
                  ))}
                  <button onClick={() => setMcqOptions([...mcqOptions, { id: Date.now(), text: "", isCorrect: false }])} className="text-xs font-bold text-primary mt-2">+ إضافة خيار آخر</button>
                </div>
              )}

              {showModal === "tf" && (
                <div>
                  <label className="block text-sm font-bold mb-2">الإجابة الصحيحة هي:</label>
                  <div className="flex gap-4">
                    <button onClick={() => setTfAnswer(true)} className={`flex-1 py-3 rounded-xl font-bold border ${tfAnswer ? 'bg-emerald-500 text-white border-emerald-600' : 'bg-slate-50 text-slate-600'}`}>صح (True)</button>
                    <button onClick={() => setTfAnswer(false)} className={`flex-1 py-3 rounded-xl font-bold border ${!tfAnswer ? 'bg-emerald-500 text-white border-emerald-600' : 'bg-slate-50 text-slate-600'}`}>خطأ (False)</button>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-bold mb-1 mt-4">درجة السؤال</label>
                <input type="number" min="1" value={qPoints} onChange={e=>setQPoints(Number(e.target.value))} className="w-24 border p-2 rounded-lg" />
              </div>
            </div>
            <div className="p-4 border-t flex justify-end gap-2 bg-slate-50">
              <button onClick={() => setShowModal("none")} className="px-5 py-2 bg-slate-200 rounded-xl font-bold">إلغاء</button>
              <button onClick={saveQuestion} className="px-5 py-2 bg-primary text-white rounded-xl font-bold">حفظ السؤال</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
