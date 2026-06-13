"use client";

import React, { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { importQuestionsAction, generateQuestionsAIAction } from "@/app/actions/questionActions";
import LatexRenderer from "@/components/ui/LatexRenderer";

export default function TeacherQuestionBankClient({ data }: { data: any }) {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState("");
    const [filterType, setFilterType] = useState("");
    const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);

    // Modals
    const [showImportModal, setShowImportModal] = useState(false);
    const [showAIModal, setShowAIModal] = useState(false);

    // Import states
    const [selectedImportCourseId, setSelectedImportCourseId] = useState(data.allCourses[0]?.id || "");
    const [csvText, setCsvText] = useState("");
    const [importPreview, setImportPreview] = useState<any[]>([]);
    const [isImporting, setIsImporting] = useState(false);

    // AI Generation states
    const [selectedAICourseId, setSelectedAICourseId] = useState(data.allCourses[0]?.id || "");
    const [aiTopic, setAiTopic] = useState("");
    const [aiType, setAiType] = useState<"MCQ" | "TRUE_FALSE" | "ESSAY" | "MIXED">("MIXED");
    const [aiCount, setAiCount] = useState(5);
    const [aiDifficulty, setAiDifficulty] = useState<"EASY" | "MEDIUM" | "HARD">("MEDIUM");
    const [isGenerating, setIsGenerating] = useState(false);
    const [generationStep, setGenerationStep] = useState("");
    const [aiGeneratedQuestions, setAiGeneratedQuestions] = useState<any[]>([]);
    const [selectedAIPicks, setSelectedAIPicks] = useState<Record<number, boolean>>({});
    const [isSavingAI, setIsSavingAI] = useState(false);

    // Filter questions
    const filteredQuestions = data.questions.filter((q: any) => {
        const matchesSearch = q.text.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType = filterType === "" || q.type === filterType;
        const matchesCourse = selectedCourseId === null || q.courseId === selectedCourseId;
        return matchesSearch && matchesType && matchesCourse;
    });

    // Parse pasted CSV/TSV text or CSV file
    const parseQuestions = (text: string) => {
        const lines = text.split(/\r?\n/);
        const parsed: any[] = [];

        lines.forEach((line) => {
            if (!line.trim()) return;
            
            // Split by pipe | or Tab \t (Excel default copy-paste format)
            const cols = line.split(/[|\t]/).map(c => c.trim());
            if (cols.length < 2) return;

            const qText = cols[0];
            let rawType = cols[1]?.toUpperCase() || "";
            let qType: "MCQ" | "TRUE_FALSE" | "ESSAY" = "MCQ";
            
            if (rawType.includes("TRUE") || rawType.includes("TF") || rawType.includes("صح") || rawType.includes("FALSE")) {
                qType = "TRUE_FALSE";
            } else if (rawType.includes("ESSAY") || rawType.includes("مقالي") || rawType.includes("WRITE")) {
                qType = "ESSAY";
            }

            const choicesStr = cols[2] || "";
            const diff = parseInt(cols[3] || "3") || 3;
            const points = parseFloat(cols[4] || "1.0") || 1.0;

            let choicesPayload: any = null;
            const errors: string[] = [];

            if (!qText) errors.push("نص السؤال فارغ");

            if (qType === "MCQ") {
                // Split choices by comma , or semicolon ; or slash / or | if not used for columns
                const opts = choicesStr.split(/[,;/]/).map(o => o.trim()).filter(Boolean);
                if (opts.length < 2) {
                    errors.push("يجب توفير خيارين على الأقل لأسئلة الاختيار من متعدد");
                }
                
                let hasCorrect = false;
                const optionsList = opts.map(o => {
                    const isCorrect = o.startsWith("*") || o.endsWith("*") || o.includes("*");
                    const cleanedText = o.replace(/\*/g, "").trim();
                    if (isCorrect) hasCorrect = true;
                    return { text: cleanedText, isCorrect };
                });

                if (!hasCorrect && opts.length > 0) {
                    errors.push("لم يتم تحديد الإجابة الصحيحة (ضع علامة * قبل الإجابة الصحيحة مثل: *القاهرة)");
                }

                choicesPayload = { options: optionsList };
            } else if (qType === "TRUE_FALSE") {
                const isTrue = choicesStr.toUpperCase().includes("TRUE") || choicesStr.includes("صح") || choicesStr.toUpperCase() === "T" || choicesStr.includes("1") || choicesStr.includes("*");
                choicesPayload = { correctAnswer: isTrue };
            } else {
                choicesPayload = { rubric: choicesStr || "تقييم مقالي عام" };
            }

            parsed.push({
                text: qText,
                questionType: qType,
                difficulty: diff,
                defaultPoints: points,
                choicesPayload,
                errors,
                isValid: errors.length === 0,
                rawChoices: choicesStr
            });
        });

        setImportPreview(parsed);
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const text = event.target?.result as string;
            setCsvText(text);
            parseQuestions(text);
        };
        reader.readAsText(file, "UTF-8");
    };

    const handleImportSubmit = async () => {
        const validQuestions = importPreview.filter(q => q.isValid);
        if (validQuestions.length === 0) {
            alert("لا توجد أسئلة صالحة للاستيراد");
            return;
        }

        try {
            setIsImporting(true);
            const res = await importQuestionsAction(
                selectedImportCourseId,
                validQuestions.map(q => ({
                    text: q.text,
                    questionType: q.questionType,
                    difficulty: q.difficulty,
                    defaultPoints: q.defaultPoints,
                    choicesPayload: q.choicesPayload
                }))
            );
            alert(`تم استيراد ${res.count} سؤال بنجاح إلى بنك الأسئلة!`);
            setShowImportModal(false);
            setCsvText("");
            setImportPreview([]);
            router.refresh();
        } catch (err: any) {
            console.error(err);
            alert(err.message || "حدث خطأ أثناء الاستيراد");
        } finally {
            setIsImporting(false);
        }
    };

    // AI Generation process
    const handleAIGenerate = async () => {
        if (!aiTopic.trim()) {
            alert("الرجاء كتابة موضوع التوليد");
            return;
        }

        try {
            setIsGenerating(true);
            setGenerationStep("جاري الكشف عن معطيات المقرر الدراسي...");
            await new Promise(r => setTimeout(r, 1000));
            setGenerationStep("جاري الاتصال بنظام الذكاء الاصطناعي وصياغة الأسئلة...");
            await new Promise(r => setTimeout(r, 1200));
            setGenerationStep("جاري فحص جودة الأسئلة والتحقق من صحة الخيارات...");
            await new Promise(r => setTimeout(r, 900));

            const questions = await generateQuestionsAIAction(
                selectedAICourseId,
                aiTopic,
                aiType,
                aiCount,
                aiDifficulty
            );

            setAiGeneratedQuestions(questions);
            
            // Auto check all generated questions initially
            const picks: Record<number, boolean> = {};
            questions.forEach((_, idx) => {
                picks[idx] = true;
            });
            setSelectedAIPicks(picks);
            setToastAI("تم توليد الأسئلة المقترحة بنجاح! راجعها أدناه قبل الحفظ.");
        } catch (err: any) {
            console.error(err);
            alert(err.message || "حدث خطأ أثناء التوليد");
        } finally {
            setIsGenerating(false);
            setGenerationStep("");
        }
    };

    const [toastAI, setToastAI] = useState("");

    const handleAISave = async () => {
        const questionsToSave = aiGeneratedQuestions.filter((_, idx) => selectedAIPicks[idx]);
        if (questionsToSave.length === 0) {
            alert("الرجاء اختيار سؤال واحد على الأقل لحفظه.");
            return;
        }

        try {
            setIsSavingAI(true);
            const res = await importQuestionsAction(
                selectedAICourseId,
                questionsToSave.map(q => ({
                    text: q.text,
                    questionType: q.questionType,
                    difficulty: q.difficulty,
                    defaultPoints: q.defaultPoints,
                    choicesPayload: q.choicesPayload
                }))
            );
            alert(`تم حفظ ${res.count} سؤال بنجاح في بنك الأسئلة!`);
            setShowAIModal(false);
            setAiTopic("");
            setAiGeneratedQuestions([]);
            router.refresh();
        } catch (err: any) {
            console.error(err);
            alert(err.message || "حدث خطأ أثناء الحفظ");
        } finally {
            setIsSavingAI(false);
        }
    };

    return (
        <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50/50 text-right font-sans" dir="rtl">
            {/* Header */}
            <header className="bg-white border-b border-slate-200 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0 shadow-sm z-10">
                <div>
                    <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <i className="fas fa-database text-primary"></i> بنك الأسئلة
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">إدارة وتصنيف وتوليد الأسئلة للامتحانات الذكية والمستمرة</p>
                </div>
                
                <div className="flex items-center gap-3 flex-wrap">
                    <button 
                        onClick={() => setShowAIModal(true)} 
                        className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-500/10 transition-all flex items-center gap-2"
                    >
                        <i className="fas fa-magic"></i>
                        توليد بالذكاء الاصطناعي
                    </button>
                    <button 
                        onClick={() => {
                            setImportPreview([]);
                            setCsvText("");
                            setShowImportModal(true);
                        }} 
                        className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-50 transition-colors flex items-center gap-2 shadow-sm"
                    >
                        <i className="fas fa-file-import text-slate-400"></i>
                        استيراد (Excel/CSV)
                    </button>
                    <button onClick={() => alert('لإضافة سؤال جديد، يُنصح بالإنشاء مباشرة من محرر الامتحان الفوري لربطه بالخطوات')} className="px-4 py-2 bg-primary hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-primary/10 transition-colors flex items-center gap-2">
                        <i className="fas fa-plus"></i>
                        سؤال يدوي جديد
                    </button>
                </div>
            </header>

            {/* Main Content (Split view) */}
            <main className="flex-1 overflow-hidden p-6">
                <div className="max-w-7xl mx-auto h-full flex flex-col lg:flex-row gap-6">

                    {/* Right Column: Folders */}
                    <aside className="w-full lg:w-72 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col shrink-0 overflow-hidden h-fit lg:h-full">
                        <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                            <h2 className="font-bold text-slate-800 text-sm">المجلدات والمقررات</h2>
                            <span className="text-xs font-bold text-slate-400">({data.courses.length})</span>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto p-3 space-y-1 max-h-60 lg:max-h-none">
                            <button 
                                onClick={() => setSelectedCourseId(null)}
                                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-bold text-xs transition-all ${selectedCourseId === null ? 'bg-indigo-50 text-primary border border-indigo-100/50 shadow-sm' : 'text-slate-600 hover:bg-slate-50 hover:text-primary'}`}
                            >
                                <div className="flex items-center gap-2">
                                    <i className={`fas ${selectedCourseId === null ? 'fa-folder-open text-primary' : 'fa-folder text-slate-400'}`}></i>
                                    كل الأسئلة
                                </div>
                                <span className={`${selectedCourseId === null ? 'bg-primary text-white' : 'bg-slate-100 text-slate-500'} text-[10px] px-2 py-0.5 rounded-full font-bold`}>{data.totalQuestions}</span>
                            </button>

                            {data.courses.map((course: any) => (
                                <button 
                                    key={course.id}
                                    onClick={() => setSelectedCourseId(course.id)}
                                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-bold text-xs transition-all mt-1 ${selectedCourseId === course.id ? 'bg-indigo-50 text-primary border border-indigo-100/50 shadow-sm' : 'text-slate-600 hover:bg-slate-50 hover:text-primary'}`}
                                >
                                    <div className="flex items-center gap-2 truncate">
                                        <i className={`fas ${selectedCourseId === course.id ? 'fa-folder-open text-primary' : 'fa-folder text-slate-400'}`}></i>
                                        <span className="truncate">{course.name} ({course.code})</span>
                                    </div>
                                    <span className={`${selectedCourseId === course.id ? 'bg-primary text-white' : 'bg-slate-100 text-slate-500'} text-[10px] px-2 py-0.5 rounded-full font-bold`}>{course.count}</span>
                                </button>
                            ))}
                        </div>

                        {/* Space Stat */}
                        <div className="p-4 border-t border-slate-100 bg-slate-50">
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-slate-500 font-semibold">مجموع الأسئلة المخزنة</span>
                                <span className="font-extrabold text-slate-800">{data.totalQuestions} سؤال</span>
                            </div>
                        </div>
                    </aside>

                    {/* Left Column: Questions List */}
                    <div className="flex-1 flex flex-col bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden h-full">
                        
                        {/* Search and Filter */}
                        <div className="p-4 border-b border-slate-100 bg-slate-50 flex flex-col sm:flex-row items-center gap-4">
                            <div className="relative flex-1 w-full">
                                <i className="fas fa-search absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
                                <input 
                                    type="text" 
                                    placeholder="ابحث في نص الأسئلة..." 
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-4 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-shadow text-slate-700" 
                                />
                            </div>
                            
                            <div className="flex items-center gap-2 w-full sm:w-auto">
                                <select 
                                    value={filterType} 
                                    onChange={(e) => setFilterType(e.target.value)} 
                                    className="bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-xl py-2.5 px-4 outline-none focus:ring-2 focus:ring-primary min-w-[140px]"
                                >
                                    <option value="">كل أنواع الأسئلة</option>
                                    <option value="MCQ">اختيار من متعدد</option>
                                    <option value="TRUE_FALSE">صح / خطأ</option>
                                    <option value="ESSAY">مقالي</option>
                                </select>
                            </div>
                        </div>

                        {/* Questions Cards */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/30">
                            {filteredQuestions.length === 0 ? (
                                <div className="text-center py-16 text-slate-400">
                                    <i className="fas fa-inbox text-4xl mb-3 opacity-30"></i>
                                    <p className="text-sm font-semibold">لا توجد أسئلة مطابقة للبحث أو المجلد المحدد.</p>
                                </div>
                            ) : filteredQuestions.map((q: any) => (
                                <div key={q.id} className="border border-slate-200 rounded-2xl p-5 hover:border-primary transition-all group relative bg-white shadow-sm">
                                    <div className="flex items-start gap-4">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-3">
                                                <span className="bg-slate-50 text-slate-600 text-[10px] font-bold px-2.5 py-1 rounded-lg border border-slate-150">
                                                    {q.type === 'MCQ' ? 'اختيار من متعدد' : q.type === 'TRUE_FALSE' ? 'صح / خطأ' : 'مقالي'}
                                                </span>
                                                <span className="bg-slate-50 text-slate-600 text-[10px] font-bold px-2.5 py-1 rounded-lg border border-slate-150">
                                                    {q.points} درجة
                                                </span>
                                                <span className="bg-indigo-50 text-primary text-[10px] font-bold px-2.5 py-1 rounded-lg border border-indigo-100/30">
                                                    صعوبة: {q.difficulty}
                                                </span>
                                                <span className="text-slate-400 text-xs mr-auto font-semibold">
                                                    <i className="far fa-clock ml-1"></i> {new Intl.DateTimeFormat('ar-EG', { dateStyle: 'short' }).format(new Date(q.createdAt))}
                                                </span>
                                            </div>
                                            <div className="text-slate-800 font-extrabold text-sm leading-relaxed mb-4">
                                                <LatexRenderer text={q.text} />
                                            </div>
                                            
                                            {/* Options */}
                                            {q.type === 'MCQ' && q.choices && q.choices.length > 0 && (
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                                                    {q.choices.map((choice: any, idx: number) => (
                                                        <div key={idx} className={`px-3 py-2 rounded-xl flex justify-between items-center truncate border ${choice.isCorrect ? 'bg-emerald-50 border-emerald-200 text-emerald-800 font-bold' : 'bg-slate-50 border-slate-100 text-slate-600'}`}>
                                                            <span className="truncate flex items-center gap-1">
                                                                ({String.fromCharCode(65 + idx)}) 
                                                                <LatexRenderer text={choice.text} />
                                                            </span>
                                                            {choice.isCorrect && <i className="fas fa-check-circle text-emerald-600 text-sm"></i>}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {q.type === 'TRUE_FALSE' && (
                                                <div className="flex gap-4 text-xs">
                                                    <span className={`px-4 py-1.5 rounded-xl border font-bold ${q.choices && q.choices.correctAnswer === true ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>صح</span>
                                                    <span className={`px-4 py-1.5 rounded-xl border font-bold ${q.choices && q.choices.correctAnswer === false ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>خطأ</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    
                                    {/* Quick Actions */}
                                    <div className="absolute left-4 top-4 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 bg-white/95 backdrop-blur shadow-md border border-slate-200 rounded-xl p-1">
                                        <button onClick={() => alert("للتعديل يرجى تعديل كود المصدر")} title="تعديل السؤال" className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-primary hover:bg-slate-50 transition-colors"><i className="fas fa-pen text-xs"></i></button>
                                        <div className="w-px h-4 bg-slate-200 mx-1"></div>
                                        <button onClick={() => alert("الحذف متاح للمسؤولين فقط")} title="حذف" className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-danger hover:bg-red-50 transition-colors"><i className="fas fa-trash text-xs"></i></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        {/* Summary Footer */}
                        <div className="p-4 border-t border-slate-100 bg-white flex items-center justify-between text-xs font-bold text-slate-500">
                            <span>عرض {filteredQuestions.length} سؤال حالياً</span>
                        </div>
                    </div>
                </div>
            </main>

            {/* CSV/EXCEL IMPORT MODAL */}
            {showImportModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl w-full max-w-4xl overflow-hidden shadow-2xl border border-slate-200 flex flex-col max-h-[90vh]">
                        
                        {/* Header */}
                        <div className="p-5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                            <h3 className="font-extrabold text-slate-800 text-md flex items-center gap-2">
                                <i className="fas fa-file-import text-primary"></i> استيراد أسئلة من ملف Excel أو CSV
                            </h3>
                            <button 
                                onClick={() => setShowImportModal(false)} 
                                className="w-8 h-8 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors"
                            >
                                <i className="fas fa-times"></i>
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-6 flex-1 overflow-y-auto space-y-5">
                            
                            {/* Course selection */}
                            <div className="space-y-1.5">
                                <label className="block text-xs font-bold text-slate-750">المقرر الدراسي المراد الاستيراد له:</label>
                                <select 
                                    value={selectedImportCourseId} 
                                    onChange={(e) => setSelectedImportCourseId(e.target.value)} 
                                    className="bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-primary w-full max-w-md"
                                >
                                    {data.allCourses.map((c: any) => (
                                        <option key={c.id} value={c.id}>{c.name} ({c.code})</option>
                                    ))}
                                </select>
                            </div>

                            {/* Info instructions */}
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/60 text-xs leading-relaxed text-slate-600">
                                <p className="font-bold mb-1 text-slate-800 flex items-center gap-1"><i className="fas fa-info-circle text-primary"></i> طريقة الاستيراد السريعة:</p>
                                <p>1. يمكنك نسخ صفوف جدول الأسئلة من برنامج **Excel** مباشرة ولصقها في مربع النص بالأسفل.</p>
                                <p>2. تنسيق الأعمدة بالترتيب: **نص السؤال** | **نوع السؤال** (MCQ أو TRUE_FALSE أو ESSAY) | **الخيارات** (مفصولة بفاصلة `,` وضع علامة `*` قبل الخيار الصحيح) | **الصعوبة** (من 1 إلى 5) | **الدرجة** (مثلاً: 2.0).</p>
                                <p className="mt-1 font-bold text-slate-800">أمثلة سريعة (يمكنك نسخها للتجربة):</p>
                                <code className="block bg-slate-100 border border-slate-200 p-2.5 rounded-lg text-[10px] font-mono mt-1 text-left select-all leading-normal" dir="ltr">
                                  ما عاصمة مصر؟ | MCQ | القاهرة*, الإسكندرية, الجيزة | 3 | 1.0{"\n"}
                                  يعمل بروتوكول IP في طبقة الشبكة | TRUE_FALSE | صح | 3 | 1.5{"\n"}
                                  اكتب مقالاً توضح فيه مبادئ البرمجة كائنية التوجه | ESSAY | | 3 | 3.0
                                </code>
                            </div>

                            {/* Inputs */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5 flex flex-col">
                                    <label className="block text-xs font-bold text-slate-755">إدخال البيانات باللصق المباشر:</label>
                                    <textarea 
                                        rows={6}
                                        value={csvText}
                                        onChange={(e) => {
                                            setCsvText(e.target.value);
                                            parseQuestions(e.target.value);
                                        }}
                                        placeholder="الصق صفوف جدول الأسئلة هنا..."
                                        className="w-full border border-slate-200 bg-slate-50/50 p-3 rounded-xl focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all font-mono text-xs leading-normal text-left"
                                        dir="ltr"
                                    ></textarea>
                                </div>
                                <div className="space-y-1.5 flex flex-col justify-center border-2 border-dashed border-slate-200 rounded-2xl p-6 bg-slate-50/50 items-center text-center">
                                    <i className="fas fa-cloud-upload-alt text-3xl text-slate-400 mb-2"></i>
                                    <p className="text-xs font-bold text-slate-600">أو قم برفع ملف CSV مباشرة</p>
                                    <p className="text-[10px] text-slate-400 mt-1">تأكد أن ترميز الملف هو UTF-8 لتجنب مشاكل اللغة العربية</p>
                                    <input 
                                        type="file" 
                                        accept=".csv,.txt" 
                                        onChange={handleFileUpload}
                                        className="hidden" 
                                        id="csv-file-uploader" 
                                    />
                                    <label 
                                        htmlFor="csv-file-uploader" 
                                        className="mt-3 px-4 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold cursor-pointer transition-colors shadow-sm"
                                    >
                                        اختر الملف من جهازك
                                    </label>
                                </div>
                            </div>

                            {/* Preview Grid */}
                            {importPreview.length > 0 && (
                                <div className="space-y-2 pt-2">
                                    <p className="text-xs font-extrabold text-slate-750">معاينة الأسئلة التي تم الكشف عنها ({importPreview.length} سؤال):</p>
                                    <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                                        <table className="w-full text-right border-collapse">
                                            <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase">
                                                <tr>
                                                    <th className="p-3 w-10 text-center">الحالة</th>
                                                    <th className="p-3">نص السؤال</th>
                                                    <th className="p-3 w-28">النوع</th>
                                                    <th className="p-3 w-16 text-center">الدرجة</th>
                                                    <th className="p-3">الأخطاء والملاحظات</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-50 font-semibold text-slate-700">
                                                {importPreview.map((q, idx) => (
                                                    <tr key={idx} className={q.isValid ? "hover:bg-slate-50/50" : "bg-red-50/30 hover:bg-red-50/50"}>
                                                        <td className="p-3 text-center">
                                                            {q.isValid ? (
                                                                <i className="fas fa-check-circle text-emerald-600 text-sm"></i>
                                                            ) : (
                                                                <i className="fas fa-exclamation-circle text-rose-500 text-sm"></i>
                                                            )}
                                                        </td>
                                                        <td className="p-3 max-w-sm truncate" title={q.text}>{q.text}</td>
                                                        <td className="p-3">
                                                            <span className="bg-slate-100 border px-2 py-0.5 rounded text-[10px] text-slate-500 font-bold">
                                                                {q.questionType === "MCQ" ? "اختيار متعدد" : q.questionType === "TRUE_FALSE" ? "صح / خطأ" : "مقالي"}
                                                            </span>
                                                        </td>
                                                        <td className="p-3 text-center">{q.defaultPoints} د</td>
                                                        <td className="p-3 text-xs">
                                                            {q.isValid ? (
                                                                <span className="text-emerald-700">سؤال سليم جاهز للاستيراد</span>
                                                            ) : (
                                                                <span className="text-rose-600 font-extrabold">{q.errors.join(", ")}</span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                        </div>

                        {/* Footer */}
                        <div className="p-4 border-t border-slate-100 flex justify-between items-center bg-slate-50">
                            <span className="text-[10px] text-slate-500 font-bold">
                                {importPreview.length > 0 && `جاهز للاستيراد: ${importPreview.filter(q=>q.isValid).length} من ${importPreview.length}`}
                            </span>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setShowImportModal(false)}
                                    className="px-4 py-2 border border-slate-200 hover:bg-slate-150 rounded-xl font-bold text-xs text-slate-655 transition-colors"
                                >
                                    إلغاء
                                </button>
                                <button
                                    onClick={handleImportSubmit}
                                    disabled={isImporting || importPreview.filter(q => q.isValid).length === 0}
                                    className="px-5 py-2 bg-primary hover:bg-indigo-700 text-white rounded-xl font-bold text-xs transition-all shadow-md shadow-primary/10 disabled:opacity-50"
                                >
                                    {isImporting ? "جاري الحفظ..." : "حفظ الأسئلة الصالحة"}
                                </button>
                            </div>
                        </div>

                    </div>
                </div>
            )}

            {/* AI GENERATOR CO-PILOT MODAL */}
            {showAIModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl w-full max-w-4xl overflow-hidden shadow-2xl border border-slate-200 flex flex-col max-h-[90vh]">
                        
                        {/* Header */}
                        <div className="p-5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                            <h3 className="font-extrabold text-slate-850 text-md flex items-center gap-2">
                                <i className="fas fa-magic text-purple-600"></i> معالج التوليد التلقائي بالذكاء الاصطناعي (AI Copilot)
                            </h3>
                            <button 
                                onClick={() => {
                                    setShowAIModal(false);
                                    setAiGeneratedQuestions([]);
                                }} 
                                className="w-8 h-8 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors"
                            >
                                <i className="fas fa-times"></i>
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-6 flex-1 overflow-y-auto space-y-5 text-right">
                            
                            {/* Inputs form */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-b border-slate-100 pb-4">
                                <div className="space-y-1.5">
                                    <label className="block text-xs font-bold text-slate-700">المقرر الدراسي المستهدف:</label>
                                    <select 
                                        value={selectedAICourseId} 
                                        onChange={(e) => setSelectedAICourseId(e.target.value)} 
                                        className="bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-primary w-full"
                                    >
                                        {data.allCourses.map((c: any) => (
                                            <option key={c.id} value={c.id}>{c.name} ({c.code})</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="block text-xs font-bold text-slate-700">نوع الأسئلة المطلوبة:</label>
                                    <select 
                                        value={aiType} 
                                        onChange={(e) => setAiType(e.target.value as any)} 
                                        className="bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-primary w-full"
                                    >
                                        <option value="MIXED">مزيج من الأنواع (Mixed)</option>
                                        <option value="MCQ">اختيار من متعدد فقط</option>
                                        <option value="TRUE_FALSE">صح / خطأ فقط</option>
                                        <option value="ESSAY">مقالي فقط</option>
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="block text-xs font-bold text-slate-700">مستوى الصعوبة المتوقع:</label>
                                    <select 
                                        value={aiDifficulty} 
                                        onChange={(e) => setAiDifficulty(e.target.value as any)} 
                                        className="bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-primary w-full"
                                    >
                                        <option value="EASY">سهل (Easy)</option>
                                        <option value="MEDIUM">متوسط (Medium)</option>
                                        <option value="HARD">صعب (Hard)</option>
                                    </select>
                                </div>
                                <div className="space-y-1.5 md:col-span-2">
                                    <label className="block text-xs font-bold text-slate-700">الموضوع التعليمي أو الكلمات المفتاحية:</label>
                                    <input 
                                        type="text"
                                        value={aiTopic}
                                        onChange={(e) => setAiTopic(e.target.value)}
                                        placeholder="مثال: بروتوكولات النقل، لغة الاستعلام SQL، هياكل البيانات LIFO..."
                                        className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="block text-xs font-bold text-slate-700">عدد الأسئلة المراد توليدها:</label>
                                    <input 
                                        type="number"
                                        min={1}
                                        max={10}
                                        value={aiCount}
                                        onChange={(e) => setAiCount(Math.min(10, Math.max(1, Number(e.target.value))))}
                                        className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-primary text-center"
                                    />
                                </div>
                            </div>

                            {/* Generation Loading State */}
                            {isGenerating && (
                                <div className="flex flex-col items-center justify-center py-10 space-y-3">
                                    <div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
                                    <p className="text-xs font-bold text-purple-700 animate-pulse">{generationStep}</p>
                                </div>
                            )}

                            {/* Toast Notification message */}
                            {toastAI && (
                                <div className="bg-emerald-50 border border-emerald-250 p-3 rounded-xl text-emerald-800 text-xs font-bold flex items-center justify-between">
                                    <span>{toastAI}</span>
                                    <button onClick={() => setToastAI("")} className="text-emerald-500 hover:text-emerald-800"><i className="fas fa-times"></i></button>
                                </div>
                            )}

                            {/* Preview generated checklist */}
                            {!isGenerating && aiGeneratedQuestions.length > 0 && (
                                <div className="space-y-3 pt-1">
                                    <p className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                                        <i className="fas fa-list-ul text-primary"></i> مراجعة واعتماد الأسئلة المولّدة بالذكاء الاصطناعي:
                                    </p>
                                    
                                    <div className="space-y-3">
                                        {aiGeneratedQuestions.map((q, idx) => (
                                            <div key={idx} className="border border-slate-200 p-4 rounded-xl relative hover:border-purple-300 transition-all bg-slate-50/20">
                                                <div className="flex items-start gap-3">
                                                    <input 
                                                        type="checkbox" 
                                                        checked={!!selectedAIPicks[idx]} 
                                                        onChange={(e) => setSelectedAIPicks(prev => ({ ...prev, [idx]: e.target.checked }))}
                                                        className="mt-1 w-4 h-4 rounded text-purple-600 focus:ring-purple-500 border-slate-300"
                                                    />
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <span className="bg-slate-100 border text-slate-550 text-[9px] font-bold px-2 py-0.5 rounded">
                                                                {q.questionType === "MCQ" ? "اختيار متعدد" : q.questionType === "TRUE_FALSE" ? "صح / خطأ" : "مقالي"}
                                                            </span>
                                                            <span className="bg-purple-50 border border-purple-100 text-purple-700 text-[9px] font-bold px-2 py-0.5 rounded">
                                                                درجة مقترحة: {q.defaultPoints} د
                                                            </span>
                                                        </div>
                                                        <input 
                                                            type="text" 
                                                            value={q.text} 
                                                            onChange={(e) => {
                                                                const updated = [...aiGeneratedQuestions];
                                                                updated[idx].text = e.target.value;
                                                                setAiGeneratedQuestions(updated);
                                                            }}
                                                            className="w-full text-xs font-bold text-slate-800 border-b border-transparent hover:border-slate-300 focus:border-purple-500 outline-none bg-transparent py-0.5 transition-colors"
                                                        />

                                                        {/* Choice preview */}
                                                        {q.questionType === "MCQ" && q.choicesPayload?.options && (
                                                            <div className="grid grid-cols-2 gap-2 mt-3 text-[11px] font-semibold">
                                                                {q.choicesPayload.options.map((opt: any, oIdx: number) => (
                                                                    <div key={oIdx} className={`px-2.5 py-1 rounded-lg border flex items-center justify-between ${opt.isCorrect ? 'bg-emerald-50 text-emerald-800 border-emerald-100' : 'bg-white text-slate-655 border-slate-150'}`}>
                                                                        <span>{opt.text}</span>
                                                                        {opt.isCorrect && <i className="fas fa-check text-[9px] text-emerald-600"></i>}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}

                                                        {q.questionType === "TRUE_FALSE" && (
                                                            <div className="text-[10px] text-slate-500 font-bold mt-2.5">
                                                                الإجابة الصحيحة المقترحة: <span className="text-emerald-700 font-extrabold">{q.choicesPayload.correctAnswer ? "صح" : "خطأ"}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                        </div>

                        {/* Footer */}
                        <div className="p-4 border-t border-slate-100 flex justify-between items-center bg-slate-50">
                            <span className="text-[10px] text-slate-500 font-bold">
                                {aiGeneratedQuestions.length > 0 && `محدد للحفظ: ${aiGeneratedQuestions.filter((_, idx)=>selectedAIPicks[idx]).length} سؤال`}
                            </span>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => {
                                        setShowAIModal(false);
                                        setAiGeneratedQuestions([]);
                                    }}
                                    className="px-4 py-2 border border-slate-200 hover:bg-slate-150 rounded-xl font-bold text-xs text-slate-655 transition-colors"
                                >
                                    إلغاء
                                </button>
                                {aiGeneratedQuestions.length === 0 ? (
                                    <button
                                        onClick={handleAIGenerate}
                                        disabled={isGenerating}
                                        className="px-5 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white rounded-xl font-bold text-xs transition-all shadow-md shadow-purple-500/10 disabled:opacity-50"
                                    >
                                        {isGenerating ? "جاري التوليد..." : "البدء في توليد الأسئلة"}
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleAISave}
                                        disabled={isSavingAI || aiGeneratedQuestions.filter((_, idx)=>selectedAIPicks[idx]).length === 0}
                                        className="px-5 py-2 bg-primary hover:bg-indigo-750 text-white rounded-xl font-bold text-xs transition-all shadow-md shadow-primary/10 disabled:opacity-50"
                                    >
                                        {isSavingAI ? "جاري الحفظ..." : "حفظ الأسئلة المعتمدة"}
                                    </button>
                                )}
                            </div>
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
}
