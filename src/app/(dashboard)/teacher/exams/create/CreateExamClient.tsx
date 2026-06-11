"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { saveExam } from "@/app/actions/teacherExam";

interface Course {
  id: string;
  name: string;
}

interface Question {
  id: number;
  type: "mcq" | "tf" | "essay";
  text: string;
  points: number;
  options: any;
}

export default function CreateExamClient({ courses }: { courses: Course[] }) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"IDLE" | "SAVING_DRAFT" | "PUBLISHING">("IDLE");

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
  const [questions, setQuestions] = useState<Question[]>([]);
  const [showModal, setShowModal] = useState<"none" | "mcq" | "tf" | "essay">("none");
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);

  // Question Form Temp State
  const [qText, setQText] = useState("");
  const [qPoints, setQPoints] = useState(1);
  const [mcqOptions, setMcqOptions] = useState([
    { id: 1, text: "", isCorrect: true },
    { id: 2, text: "", isCorrect: false },
    { id: 3, text: "", isCorrect: false },
    { id: 4, text: "", isCorrect: false }
  ]);
  const [tfAnswer, setTfAnswer] = useState(true);

  // Form handling
  const handleNext = () => {
    if (currentStep === 1) {
      if (!title.trim() || !courseId || !scheduledStart || !scheduledEnd || !durationMinutes) {
        alert("يرجى ملء جميع الحقول الإلزامية المطلوبة (العنوان، المقرر، توقيت البدء والنهاية، والمدة).");
        return;
      }
      const start = new Date(scheduledStart);
      const end = new Date(scheduledEnd);
      if (end <= start) {
        alert("يجب أن يكون تاريخ انتهاء الامتحان بعد تاريخ بدئه.");
        return;
      }
      if (durationMinutes <= 0) {
        alert("يجب أن تكون مدة الامتحان أكبر من صفر.");
        return;
      }
    }
    if (currentStep === 2 && questions.length === 0) {
      alert("يرجى إضافة سؤال واحد على الأقل للمتابعة.");
      return;
    }
    if (currentStep < 3) setCurrentStep(prev => (prev + 1) as 1 | 2 | 3);
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(prev => (prev - 1) as 1 | 2 | 3);
  };

  const handlePublish = async (status: "PUBLISHED" | "DRAFT") => {
    try {
      setIsSubmitting(true);
      setSubmitStatus(status === "PUBLISHED" ? "PUBLISHING" : "SAVING_DRAFT");
      await saveExam({
        title,
        courseId,
        description,
        scheduledStart,
        scheduledEnd,
        durationMinutes,
        shuffleQuestions,
        enableProctoring,
        questions,
        status
      });
      alert(status === "PUBLISHED" ? "تم نشر الامتحان واعتماده بنجاح!" : "تم حفظ الامتحان كمسودة بنجاح!");
      router.push("/teacher/exams");
    } catch (e) {
      console.error(e);
      alert("حدث خطأ غير متوقع أثناء حفظ الامتحان. يرجى المحاولة مرة أخرى.");
    } finally {
      setIsSubmitting(false);
      setSubmitStatus("IDLE");
    }
  };

  // Question Actions
  const resetQuestionForm = () => {
    setQText("");
    setQPoints(1);
    setMcqOptions([
      { id: 1, text: "", isCorrect: true },
      { id: 2, text: "", isCorrect: false },
      { id: 3, text: "", isCorrect: false },
      { id: 4, text: "", isCorrect: false }
    ]);
    setTfAnswer(true);
    setEditingQuestion(null);
  };

  const openAddQuestion = (type: "mcq" | "tf" | "essay") => {
    resetQuestionForm();
    setShowModal(type);
  };

  const startEditQuestion = (q: Question) => {
    setEditingQuestion(q);
    setQText(q.text);
    setQPoints(q.points);
    if (q.type === "mcq") {
      setMcqOptions(q.options.options.map((opt: any, idx: number) => ({
        id: idx + 1,
        text: opt.text,
        isCorrect: opt.isCorrect
      })));
    } else if (q.type === "tf") {
      setTfAnswer(q.options.correctAnswer);
    }
    setShowModal(q.type);
  };

  const saveQuestion = () => {
    if (!qText.trim()) {
      alert("الرجاء كتابة نص السؤال");
      return;
    }

    let formattedQuestion: Question = {
      id: editingQuestion ? editingQuestion.id : Date.now(),
      type: showModal as "mcq" | "tf" | "essay",
      text: qText.trim(),
      points: qPoints,
      options: null
    };

    if (showModal === "mcq") {
      const validOptions = mcqOptions.filter(o => o.text.trim() !== "");
      if (validOptions.length < 2) {
        alert("يجب إضافة خيارين على الأقل للسؤال الاختياري.");
        return;
      }
      if (!validOptions.some(o => o.isCorrect)) {
        alert("يرجى اختيار إجابة صحيحة واحدة على الأقل.");
        return;
      }
      formattedQuestion.options = {
        options: validOptions.map(o => ({ text: o.text.trim(), isCorrect: o.isCorrect }))
      };
    } else if (showModal === "tf") {
      formattedQuestion.options = { correctAnswer: tfAnswer };
    } else if (showModal === "essay") {
      formattedQuestion.options = null;
    }

    if (editingQuestion) {
      setQuestions(questions.map(q => q.id === editingQuestion.id ? formattedQuestion : q));
    } else {
      setQuestions([...questions, formattedQuestion]);
    }

    setShowModal("none");
    resetQuestionForm();
  };

  const deleteQuestion = (id: number) => {
    if (confirm("هل أنت متأكد من رغبتك في حذف هذا السؤال؟")) {
      setQuestions(questions.filter(q => q.id !== id));
    }
  };

  const selectedCourseName = courses.find(c => c.id === courseId)?.name || "غير محدد";

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50 relative font-sans">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shrink-0 shadow-sm z-20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <i className="fas fa-file-signature text-lg"></i>
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900">إنشاء امتحان جديد</h1>
            <p className="text-xs text-slate-500 mt-0.5">صمم ونظم امتحاناتك بأدوات حديثة واحترافية</p>
          </div>
        </div>
        <button
          onClick={() => router.push("/teacher/exams")}
          className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl font-bold text-sm transition-colors flex items-center gap-2"
        >
          <i className="fas fa-arrow-right text-xs"></i> العودة لقائمة الامتحانات
        </button>
      </header>

      {/* Modern Stepper */}
      <div className="bg-white border-b border-slate-100 px-6 py-4 shrink-0 shadow-sm z-10">
        <div className="max-w-3xl mx-auto relative flex items-center justify-between">
          {/* Progress Connecting Line */}
          <div className="absolute left-0 right-0 h-1 bg-slate-100 top-1/2 -translate-y-1/2 -z-10 rounded-full">
            <div 
              className="h-full bg-primary transition-all duration-300 rounded-full" 
              style={{ width: currentStep === 1 ? "0%" : currentStep === 2 ? "50%" : "100%" }}
            />
          </div>

          {/* Step 1 */}
          <button 
            onClick={() => currentStep > 1 && setCurrentStep(1)}
            className="flex flex-col items-center gap-2 focus:outline-none group"
            disabled={currentStep === 1}
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 border-2 ${
              currentStep === 1 
                ? "bg-primary text-white border-primary shadow-lg shadow-primary/20 scale-110" 
                : currentStep > 1 
                ? "bg-emerald-500 text-white border-emerald-500" 
                : "bg-white text-slate-400 border-slate-200"
            }`}>
              {currentStep > 1 ? <i className="fas fa-check"></i> : "1"}
            </div>
            <span className={`text-xs font-bold transition-colors ${currentStep >= 1 ? "text-slate-800" : "text-slate-400"}`}>إعدادات الامتحان</span>
          </button>

          {/* Step 2 */}
          <button 
            onClick={() => currentStep > 2 && setCurrentStep(2)}
            className="flex flex-col items-center gap-2 focus:outline-none group"
            disabled={currentStep <= 2}
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 border-2 ${
              currentStep === 2 
                ? "bg-primary text-white border-primary shadow-lg shadow-primary/20 scale-110" 
                : currentStep > 2 
                ? "bg-emerald-500 text-white border-emerald-500" 
                : "bg-white text-slate-400 border-slate-200"
            }`}>
              {currentStep > 2 ? <i className="fas fa-check"></i> : "2"}
            </div>
            <span className={`text-xs font-bold transition-colors ${currentStep >= 2 ? "text-slate-800" : "text-slate-400"}`}>بناء الأسئلة</span>
          </button>

          {/* Step 3 */}
          <div className="flex flex-col items-center gap-2">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 border-2 ${
              currentStep === 3 
                ? "bg-primary text-white border-primary shadow-lg shadow-primary/20 scale-110" 
                : "bg-white text-slate-400 border-slate-200"
            }`}>
              "3"
            </div>
            <span className={`text-xs font-bold transition-colors ${currentStep === 3 ? "text-slate-800" : "text-slate-400"}`}>المراجعة والنشر</span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-6 pb-28">
        
        {/* STEP 1: Exam Settings */}
        {currentStep === 1 && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-6">
              
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-lg font-extrabold text-slate-850 flex items-center gap-2">
                  <i className="fas fa-info-circle text-primary"></i> المعلومات الأساسية للمقرر والامتحان
                </h2>
                <p className="text-xs text-slate-500 mt-1">يرجى ملء البيانات العامة التي ستظهر للطالب قبل بدء الامتحان</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5 col-span-1 md:col-span-2">
                  <label className="block text-sm font-bold text-slate-700">عنوان الامتحان <span className="text-danger">*</span></label>
                  <input 
                    type="text" 
                    value={title} 
                    onChange={e => setTitle(e.target.value)} 
                    className="w-full border border-slate-200 bg-slate-50/50 p-3 rounded-xl focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all font-bold text-slate-800" 
                    placeholder="مثال: اختبار الفلسفة السياسية النصفي" 
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-bold text-slate-700">المقرر الدراسي <span className="text-danger">*</span></label>
                  <div className="relative">
                    <select 
                      value={courseId} 
                      onChange={e => setCourseId(e.target.value)} 
                      className="w-full border border-slate-200 bg-slate-50/50 p-3 pr-10 rounded-xl focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all font-bold text-slate-800 appearance-none"
                    >
                      <option value="">اختر المقرر الدراسي...</option>
                      {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                      <i className="fas fa-chevron-down text-sm"></i>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-bold text-slate-700">مدة الامتحان بالدقائق <span className="text-danger">*</span></label>
                  <div className="relative">
                    <input 
                      type="number" 
                      min="5" 
                      value={durationMinutes} 
                      onChange={e => setDurationMinutes(Math.max(1, Number(e.target.value)))} 
                      className="w-full border border-slate-200 bg-slate-50/50 p-3 pr-12 rounded-xl focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all font-bold text-slate-800" 
                    />
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">
                      دقيقة
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5 col-span-1 md:col-span-2">
                  <label className="block text-sm font-bold text-slate-700">تعليمات ووصف الامتحان للطلاب</label>
                  <textarea 
                    value={description} 
                    onChange={e => setDescription(e.target.value)} 
                    className="w-full border border-slate-200 bg-slate-50/50 p-3 rounded-xl focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all text-slate-800" 
                    rows={3}
                    placeholder="مثال: يحتوي الامتحان على أسئلة اختيار من متعدد، وصح وخطأ، وسؤال مقالي. الرجاء عدم إغلاق المتصفح أو التنقل بين التبويبات تجنباً للحرمان..."
                  ></textarea>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-lg font-extrabold text-slate-850 flex items-center gap-2">
                  <i className="fas fa-clock text-primary"></i> جدولة فتح الامتحان وإغلاقه
                </h2>
                <p className="text-xs text-slate-500 mt-1">حدد النطاق الزمني الكلي المتاح للطلاب لدخول وتأدية الامتحان</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="block text-sm font-bold text-slate-700">تاريخ ووقت البدء <span className="text-danger">*</span></label>
                  <input 
                    type="datetime-local" 
                    value={scheduledStart} 
                    onChange={e => setScheduledStart(e.target.value)} 
                    className="w-full border border-slate-200 bg-slate-50/50 p-3 rounded-xl focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all font-bold text-slate-800" 
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-sm font-bold text-slate-700">تاريخ ووقت الإغلاق النهائي <span className="text-danger">*</span></label>
                  <input 
                    type="datetime-local" 
                    value={scheduledEnd} 
                    onChange={e => setScheduledEnd(e.target.value)} 
                    className="w-full border border-slate-200 bg-slate-50/50 p-3 rounded-xl focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all font-bold text-slate-800" 
                  />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-lg font-extrabold text-slate-850 flex items-center gap-2">
                  <i className="fas fa-shield-halved text-primary"></i> التحكم والأمان الذكي
                </h2>
                <p className="text-xs text-slate-500 mt-1">تفعيل ميزات منع الغش والتحكم في آلية تقديم الأسئلة</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                
                {/* Shuffle Questions Interactive Toggle Card */}
                <div 
                  onClick={() => setShuffleQuestions(!shuffleQuestions)}
                  className={`p-5 rounded-2xl border-2 transition-all cursor-pointer flex gap-4 ${
                    shuffleQuestions 
                      ? "border-primary bg-indigo-50/40 shadow-sm" 
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <div className={`w-12 h-12 rounded-xl shrink-0 flex items-center justify-center transition-colors ${
                    shuffleQuestions ? "bg-primary text-white" : "bg-slate-100 text-slate-400"
                  }`}>
                    <i className="fas fa-random text-lg"></i>
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-extrabold text-sm text-slate-900">عشوائية ترتيب الأسئلة</h3>
                      <div className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-255 ${shuffleQuestions ? "bg-primary" : "bg-slate-200"}`}>
                        <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-255 ${shuffleQuestions ? "-translate-x-4" : "translate-x-0"}`}></div>
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">يتم خلط وترتيب الأسئلة بشكل عشوائي ومختلف تماماً لكل طالب للحد من محاولات الغش الجماعي.</p>
                  </div>
                </div>

                {/* AI Proctoring Interactive Toggle Card */}
                <div 
                  onClick={() => setEnableProctoring(!enableProctoring)}
                  className={`p-5 rounded-2xl border-2 transition-all cursor-pointer flex gap-4 ${
                    enableProctoring 
                      ? "border-primary bg-indigo-50/40 shadow-sm" 
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <div className={`w-12 h-12 rounded-xl shrink-0 flex items-center justify-center transition-colors ${
                    enableProctoring ? "bg-primary text-white" : "bg-slate-100 text-slate-400"
                  }`}>
                    <i className="fas fa-shield-alt text-lg"></i>
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-extrabold text-sm text-slate-900">المراقبة الذكية بالذكاء الاصطناعي</h3>
                      <div className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-255 ${enableProctoring ? "bg-primary" : "bg-slate-200"}`}>
                        <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-255 ${enableProctoring ? "-translate-x-4" : "translate-x-0"}`}></div>
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">تنبيه الطالب وتسجيل مخالفات فورية في حال تبديل التبويب، أو الخروج من وضع ملء الشاشة، مع تشغيل الكاميرا للمراقبة.</p>
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Questions Builder */}
        {currentStep === 2 && (
          <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-6 items-start">
            
            {/* Sidebar Tools */}
            <aside className="w-full lg:w-72 shrink-0 space-y-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                    <i className="fas fa-tools text-primary"></i> أدوات إضافة الأسئلة
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">اختر نوع السؤال لإضافته للامتحان</p>
                </div>

                <div className="space-y-3">
                  <button 
                    onClick={() => openAddQuestion("mcq")} 
                    className="w-full p-4 text-right bg-indigo-50/50 hover:bg-indigo-50 border border-indigo-100 rounded-xl font-bold text-primary transition-all shadow-sm flex items-center gap-3 group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center group-hover:scale-110 transition-transform">
                      <i className="fas fa-list-ul text-xs"></i>
                    </div>
                    <div>
                      <div className="text-sm font-extrabold">اختيار من متعدد</div>
                      <div className="text-[10px] text-primary/70 font-normal">سؤال متعدد الخيارات بإجابة واحدة</div>
                    </div>
                  </button>

                  <button 
                    onClick={() => openAddQuestion("tf")} 
                    className="w-full p-4 text-right bg-emerald-50/50 hover:bg-emerald-50 border border-emerald-100 rounded-xl font-bold text-emerald-600 transition-all shadow-sm flex items-center gap-3 group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-emerald-500 text-white flex items-center justify-center group-hover:scale-110 transition-transform">
                      <i className="fas fa-check-double text-xs"></i>
                    </div>
                    <div>
                      <div className="text-sm font-extrabold">صح أو خطأ</div>
                      <div className="text-[10px] text-emerald-600/70 font-normal">إقرار بحقائق محددة ومباشرة</div>
                    </div>
                  </button>

                  <button 
                    onClick={() => openAddQuestion("essay")} 
                    className="w-full p-4 text-right bg-amber-50/50 hover:bg-amber-50 border border-amber-100 rounded-xl font-bold text-amber-600 transition-all shadow-sm flex items-center gap-3 group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center group-hover:scale-110 transition-transform">
                      <i className="fas fa-align-right text-xs"></i>
                    </div>
                    <div>
                      <div className="text-sm font-extrabold">سؤال مقالي</div>
                      <div className="text-[10px] text-amber-600/70 font-normal">سؤال نصي مفتوح يُصحح يدوياً لاحقاً</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Quick stats on sidebar */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">ملخص الهيكل الحالي</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-50 p-3 rounded-xl text-center">
                    <span className="block text-2xl font-black text-slate-800">{questions.length}</span>
                    <span className="text-[10px] font-bold text-slate-500">الأسئلة</span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl text-center">
                    <span className="block text-2xl font-black text-slate-800">
                      {questions.reduce((sum, q) => sum + q.points, 0)}
                    </span>
                    <span className="text-[10px] font-bold text-slate-500">إجمالي الدرجات</span>
                  </div>
                </div>
              </div>
            </aside>

            {/* Questions List Workspace */}
            <div className="flex-1 w-full bg-white rounded-2xl border border-slate-200 p-6 shadow-sm min-h-[450px] flex flex-col">
              <div className="border-b border-slate-100 pb-4 mb-5 flex justify-between items-center">
                <div>
                  <h3 className="font-extrabold text-lg text-slate-850">قائمة الأسئلة المُضافة</h3>
                  <p className="text-xs text-slate-500 mt-1">تظهر هنا الأسئلة المضافة للامتحان، يمكنك تعديلها أو حذفها بأي وقت</p>
                </div>
                <span className="bg-slate-100 text-slate-700 text-xs px-3 py-1.5 rounded-full font-bold">
                  توزيع الأسئلة: {questions.filter(q=>q.type==='mcq').length} اختيار متعدد | {questions.filter(q=>q.type==='tf').length} صح وخطأ | {questions.filter(q=>q.type==='essay').length} مقالي
                </span>
              </div>

              <div className="space-y-4 flex-1">
                {questions.map((q, i) => (
                  <div 
                    key={q.id} 
                    className="border border-slate-200 rounded-xl bg-slate-50/50 hover:bg-slate-50 hover:border-slate-350 transition-all p-5 flex items-start gap-4 shadow-sm hover:shadow"
                  >
                    {/* Index badge */}
                    <div className="w-8 h-8 rounded-lg bg-slate-200 text-slate-700 flex items-center justify-center font-black text-sm shrink-0">
                      {i + 1}
                    </div>

                    <div className="flex-1 space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                          q.type === 'mcq' ? 'bg-indigo-100 text-primary' : q.type === 'tf' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {q.type === 'mcq' ? 'اختيار من متعدد' : q.type === 'tf' ? 'صح أو خطأ' : 'سؤال مقالي'}
                        </span>
                        <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                          <i className="fas fa-star text-[10px] text-amber-400"></i> {q.points} درجات
                        </span>
                      </div>

                      <p className="font-extrabold text-slate-800 text-sm leading-relaxed">{q.text}</p>

                      {/* Display MCQ Options */}
                      {q.type === "mcq" && q.options?.options && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-100">
                          {q.options.options.map((opt: any, oIdx: number) => (
                            <div key={oIdx} className={`text-xs px-3 py-2 rounded-lg flex items-center gap-2 border ${
                              opt.isCorrect 
                                ? "bg-emerald-50 text-emerald-800 border-emerald-200 font-bold" 
                                : "bg-white text-slate-600 border-slate-100"
                            }`}>
                              <i className={`fas ${opt.isCorrect ? "fa-check-circle text-emerald-600" : "fa-circle text-slate-300"} text-[10px]`}></i>
                              <span>{opt.text}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Display True/False correct option */}
                      {q.type === "tf" && (
                        <div className="mt-2 pt-2 border-t border-slate-100 flex items-center gap-2 text-xs">
                          <span className="text-slate-500 font-bold">الإجابة الصحيحة هي:</span>
                          <span className={`px-3 py-1 rounded-full font-extrabold ${q.options.correctAnswer ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"}`}>
                            {q.options.correctAnswer ? "صح" : "خطأ"}
                          </span>
                        </div>
                      )}

                      {/* Display Essay info */}
                      {q.type === "essay" && (
                        <div className="mt-2 pt-2 border-t border-slate-100 flex items-center gap-1.5 text-xs text-slate-500 italic">
                          <i className="fas fa-edit text-[10px]"></i> يتطلب تصحيحاً يدوياً من الأستاذ بعد انتهاء الامتحان.
                        </div>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="flex flex-col gap-2">
                      <button 
                        onClick={() => startEditQuestion(q)}
                        className="w-8 h-8 rounded-lg border border-slate-200 hover:border-primary hover:bg-indigo-50/30 text-slate-500 hover:text-primary flex items-center justify-center transition-all"
                        title="تعديل السؤال"
                      >
                        <i className="fas fa-edit text-xs"></i>
                      </button>
                      <button 
                        onClick={() => deleteQuestion(q.id)}
                        className="w-8 h-8 rounded-lg border border-slate-200 hover:border-danger hover:bg-rose-50 text-slate-500 hover:text-danger flex items-center justify-center transition-all"
                        title="حذف السؤال"
                      >
                        <i className="fas fa-trash-alt text-xs"></i>
                      </button>
                    </div>
                  </div>
                ))}

                {questions.length === 0 && (
                  <div className="flex-1 flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/30 min-h-[300px]">
                    <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-4 animate-pulse">
                      <i className="fas fa-file-signature text-2xl"></i>
                    </div>
                    <h4 className="font-extrabold text-slate-700 text-sm">لم تقم بإضافة أي أسئلة بعد</h4>
                    <p className="text-xs text-slate-400 text-center max-w-sm mt-1.5 leading-relaxed">
                      الرجاء استخدام بطاقات أدوات الإضافة الجانبية (اختيار من متعدد، صح أو خطأ، سؤال مقالي) لتصميم وبناء هيكل الامتحان.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Review and Publish */}
        {currentStep === 3 && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 text-center space-y-6">
              
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto text-2xl shadow-inner">
                <i className="fas fa-check-double"></i>
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl font-black text-slate-900">مراجعة الامتحان النهائية</h2>
                <p className="text-sm text-slate-500 max-w-md mx-auto">تأكد من إعدادات الامتحان والأسئلة المضافة بعناية قبل اعتماده وبدء نشره للطلاب.</p>
              </div>

              {/* Statistics Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
                <div className="bg-slate-50/50 border border-slate-100 p-4 rounded-2xl text-center space-y-1">
                  <span className="text-xs font-bold text-slate-500 block">المقرر الدراسي</span>
                  <span className="text-sm font-extrabold text-slate-800 truncate block">{selectedCourseName}</span>
                </div>
                <div className="bg-slate-50/50 border border-slate-100 p-4 rounded-2xl text-center space-y-1">
                  <span className="text-xs font-bold text-slate-500 block">المدة الزمنية</span>
                  <span className="text-sm font-extrabold text-slate-800 block">{durationMinutes} دقيقة</span>
                </div>
                <div className="bg-slate-50/50 border border-slate-100 p-4 rounded-2xl text-center space-y-1">
                  <span className="text-xs font-bold text-slate-500 block">عدد الأسئلة</span>
                  <span className="text-sm font-extrabold text-slate-800 block">{questions.length} سؤال</span>
                </div>
                <div className="bg-slate-50/50 border border-slate-100 p-4 rounded-2xl text-center space-y-1">
                  <span className="text-xs font-bold text-slate-500 block">مجموع الدرجات</span>
                  <span className="text-sm font-extrabold text-slate-800 block">{questions.reduce((a,c)=>a+c.points,0)} درجات</span>
                </div>
              </div>

              {/* Detailed specs */}
              <div className="border border-slate-150 rounded-2xl p-5 space-y-3.5 text-right text-sm bg-slate-50/30">
                <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                  <span className="font-bold text-slate-600">اسم الامتحان:</span>
                  <span className="font-extrabold text-slate-800">{title}</span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                  <span className="font-bold text-slate-600">تاريخ ووقت بدء إمكانية الدخول:</span>
                  <span className="font-extrabold text-slate-800 flex items-center gap-1.5">
                    <i className="fas fa-calendar-alt text-slate-400 text-xs"></i> {new Date(scheduledStart).toLocaleString('ar-EG')}
                  </span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                  <span className="font-bold text-slate-600">تاريخ ووقت الإغلاق التلقائي:</span>
                  <span className="font-extrabold text-slate-800 flex items-center gap-1.5">
                    <i className="fas fa-calendar-alt text-slate-400 text-xs"></i> {new Date(scheduledEnd).toLocaleString('ar-EG')}
                  </span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                  <span className="font-bold text-slate-600">عشوائية ترتيب الأسئلة للطلبة:</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold ${shuffleQuestions ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-600"}`}>
                    {shuffleQuestions ? "مفعلة" : "معطلة"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-600">المراقبة الذكية بالذكاء الاصطناعي والكاميرا:</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold ${enableProctoring ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"}`}>
                    {enableProctoring ? "مفعلة ونشطة" : "معطلة"}
                  </span>
                </div>
              </div>
            </div>

            {/* Questions Preview for Final confirmation */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
              <h3 className="font-extrabold text-md text-slate-850 flex items-center gap-2">
                <i className="fas fa-eye text-primary"></i> مراجعة سريعة للأسئلة
              </h3>
              
              <div className="divide-y divide-slate-100">
                {questions.map((q, idx) => (
                  <div key={q.id} className="py-3 flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-400">سؤال {idx + 1}</span>
                        <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md font-bold">
                          {q.type === 'mcq' ? 'اختيار متعدد' : q.type === 'tf' ? 'صح/خطأ' : 'مقالي'}
                        </span>
                      </div>
                      <p className="text-sm font-bold text-slate-700 leading-normal">{q.text}</p>
                    </div>
                    <span className="text-xs font-extrabold text-slate-500 shrink-0 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">{q.points} د</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}
      </div>

      {/* Persistent Action Bar Footer */}
      <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-6 py-4 flex justify-between shadow-lg z-30">
        <div>
          {currentStep > 1 && (
            <button 
              onClick={handleBack} 
              className="px-6 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl font-extrabold text-sm transition-all flex items-center gap-2"
            >
              <i className="fas fa-chevron-right text-xs"></i> السابق
            </button>
          )}
        </div>
        
        <div className="flex gap-3">
          {currentStep === 3 && (
            <button 
              disabled={isSubmitting} 
              onClick={() => handlePublish("DRAFT")} 
              className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-extrabold text-sm transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {isSubmitting && submitStatus === "SAVING_DRAFT" ? (
                <>
                  <i className="fas fa-spinner animate-spin text-xs"></i> جاري الحفظ كمسودة...
                </>
              ) : (
                <>
                  <i className="fas fa-file-alt text-xs"></i> حفظ كمسودة
                </>
              )}
            </button>
          )}

          {currentStep < 3 ? (
            <button 
              onClick={handleNext} 
              className="px-8 py-2.5 bg-primary hover:bg-indigo-700 text-white rounded-xl font-extrabold text-sm transition-all shadow-md shadow-primary/10 flex items-center gap-2"
            >
              التالي <i className="fas fa-chevron-left text-xs"></i>
            </button>
          ) : (
            <button 
              disabled={isSubmitting} 
              onClick={() => handlePublish("PUBLISHED")} 
              className="px-8 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-extrabold text-sm transition-all shadow-md shadow-emerald-500/10 flex items-center gap-2 disabled:opacity-50"
            >
              {isSubmitting && submitStatus === "PUBLISHING" ? (
                <>
                  <i className="fas fa-spinner animate-spin text-xs"></i> جاري النشر...
                </>
              ) : (
                <>
                  <i className="fas fa-paper-plane text-xs"></i> اعتماد ونشر الامتحان
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Unified Add/Edit Question Modal Overlay */}
      {showModal !== "none" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl border border-slate-200 flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white ${
                  showModal === "mcq" ? "bg-primary" : showModal === "tf" ? "bg-emerald-500" : "bg-amber-500"
                }`}>
                  <i className={`fas ${
                    showModal === "mcq" ? "fa-list-ul" : showModal === "tf" ? "fa-check-double" : "fa-align-right"
                  } text-xs`}></i>
                </div>
                <span className="font-extrabold text-slate-800">
                  {editingQuestion ? "تعديل سؤال" : "إضافة سؤال"} {
                    showModal === "mcq" ? "اختيار من متعدد" : showModal === "tf" ? "صح أو خطأ" : "مقالي"
                  }
                </span>
              </div>
              <button 
                onClick={() => { setShowModal("none"); resetQuestionForm(); }} 
                className="w-8 h-8 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 overflow-y-auto flex-1 text-right">
              {/* Question Textarea */}
              <div className="space-y-1.5">
                <label className="block text-sm font-bold text-slate-700">نص السؤال <span className="text-danger">*</span></label>
                <textarea 
                  value={qText} 
                  onChange={e => setQText(e.target.value)} 
                  className="w-full border border-slate-200 bg-slate-50/50 p-3 rounded-xl focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all font-semibold text-slate-800 text-sm" 
                  rows={3}
                  placeholder="اكتب صيغة السؤال هنا..."
                ></textarea>
              </div>
              
              {/* MCQ Options Config */}
              {showModal === "mcq" && (
                <div className="space-y-3">
                  <label className="block text-sm font-bold text-slate-700 flex justify-between items-center">
                    <span>خيارات الإجابة <span className="text-danger">*</span></span>
                    <span className="text-[10px] text-slate-400 font-normal">حدد الزر الدائري للإجابة الصحيحة</span>
                  </label>
                  
                  <div className="space-y-2.5">
                    {mcqOptions.map((opt, idx) => (
                      <div key={opt.id} className="flex items-center gap-2">
                        {/* Correct Selector */}
                        <div className="relative flex items-center justify-center">
                          <input 
                            type="radio" 
                            name="correctAnswer" 
                            checked={opt.isCorrect} 
                            onChange={() => setMcqOptions(mcqOptions.map((o, i) => ({ ...o, isCorrect: i === idx })))} 
                            className="w-5 h-5 text-primary border-slate-300 focus:ring-primary focus:ring-2 cursor-pointer appearance-none checked:bg-primary checked:border-transparent rounded-full border" 
                          />
                          {opt.isCorrect && (
                            <i className="fas fa-check text-[10px] text-white absolute pointer-events-none"></i>
                          )}
                        </div>
                        
                        {/* Option text input */}
                        <input 
                          type="text" 
                          value={opt.text} 
                          onChange={e => setMcqOptions(mcqOptions.map((o, i) => i === idx ? { ...o, text: e.target.value } : o))} 
                          className={`flex-1 border p-2.5 rounded-xl text-sm transition-all focus:ring-2 ${
                            opt.isCorrect 
                              ? "border-primary bg-indigo-50/40 text-primary-dark font-bold focus:ring-primary/20" 
                              : "border-slate-200 bg-slate-50/30 text-slate-700 focus:border-primary focus:ring-primary/10"
                          }`} 
                          placeholder={`خيار الإجابة رقم ${idx + 1}`} 
                        />
                        
                        {/* Delete option */}
                        {mcqOptions.length > 2 && (
                          <button 
                            onClick={() => setMcqOptions(mcqOptions.filter((_, i) => i !== idx))} 
                            className="w-8 h-8 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-danger flex items-center justify-center transition-colors shrink-0"
                            title="حذف هذا الخيار"
                          >
                            <i className="fas fa-trash-alt text-xs"></i>
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  <button 
                    onClick={() => setMcqOptions([...mcqOptions, { id: Date.now(), text: "", isCorrect: false }])} 
                    className="text-xs font-bold text-primary hover:text-indigo-700 mt-2 flex items-center gap-1 transition-colors"
                  >
                    <i className="fas fa-plus text-[10px]"></i> إضافة خيار إجابة آخر
                  </button>
                </div>
              )}

              {/* True/False Config */}
              {showModal === "tf" && (
                <div className="space-y-2.5">
                  <label className="block text-sm font-bold text-slate-700">تحديد الإجابة الصحيحة <span className="text-danger">*</span></label>
                  <div className="flex gap-4">
                    <button 
                      type="button"
                      onClick={() => setTfAnswer(true)} 
                      className={`flex-1 py-4 rounded-xl font-extrabold border-2 transition-all flex items-center justify-center gap-2 shadow-sm ${
                        tfAnswer 
                          ? "bg-emerald-500 text-white border-emerald-600 shadow-emerald-500/10" 
                          : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      <i className="fas fa-check-circle"></i> صح (True)
                    </button>
                    <button 
                      type="button"
                      onClick={() => setTfAnswer(false)} 
                      className={`flex-1 py-4 rounded-xl font-extrabold border-2 transition-all flex items-center justify-center gap-2 shadow-sm ${
                        !tfAnswer 
                          ? "bg-rose-500 text-white border-rose-600 shadow-rose-500/10" 
                          : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      <i className="fas fa-times-circle"></i> خطأ (False)
                    </button>
                  </div>
                </div>
              )}

              {/* Essay Config description */}
              {showModal === "essay" && (
                <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl text-xs text-slate-500 flex items-start gap-2.5 leading-relaxed">
                  <i className="fas fa-info-circle text-amber-500 text-sm mt-0.5"></i>
                  <div>
                    <span className="font-bold text-slate-700 block mb-0.5">حول الأسئلة المقالية:</span>
                    الأسئلة المقالية تمنح الطالب مساحة لكتابة إجابته بنص حر. لن يصحح النظام هذا السؤال تلقائياً، وإنما سيقوم الأستاذ بقراءته ووضع الدرجة له يدوياً من شاشة "التصحيح واعتماد النتيجة".
                  </div>
                </div>
              )}

              {/* Question Points Input */}
              <div className="space-y-1.5 pt-2 border-t border-slate-100">
                <label className="block text-sm font-bold text-slate-700">الدرجة المخصصة للسؤال <span className="text-danger">*</span></label>
                <div className="relative w-32">
                  <input 
                    type="number" 
                    min="1" 
                    value={qPoints} 
                    onChange={e => setQPoints(Math.max(1, Number(e.target.value)))} 
                    className="w-full border border-slate-200 bg-slate-50/50 p-2.5 pr-10 rounded-xl focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all font-bold text-slate-800 text-center" 
                  />
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs pointer-events-none">
                    درجات
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 flex justify-end gap-2 bg-slate-50">
              <button 
                onClick={() => { setShowModal("none"); resetQuestionForm(); }} 
                className="px-5 py-2.5 border border-slate-200 hover:bg-slate-150 rounded-xl font-bold text-sm text-slate-650 transition-colors"
              >
                إلغاء
              </button>
              <button 
                onClick={saveQuestion} 
                className="px-6 py-2.5 bg-primary hover:bg-indigo-700 text-white rounded-xl font-bold text-sm transition-all shadow-md shadow-primary/10"
              >
                {editingQuestion ? "تحديث السؤال" : "إضافة السؤال للامتحان"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
