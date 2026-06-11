"use client";

import React, { useState } from "react";
import Link from "next/link";

export default function TeacherQuestionBankClient({ data }: { data: any }) {
    const [searchQuery, setSearchQuery] = useState("");
    const [filterType, setFilterType] = useState("");
    const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);

    // Filter questions
    const filteredQuestions = data.questions.filter((q: any) => {
        const matchesSearch = q.text.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType = filterType === "" || q.type === filterType;
        const matchesCourse = selectedCourseId === null || q.courseId === selectedCourseId;
        return matchesSearch && matchesType && matchesCourse;
    });

    return (
        <div className="flex-1 flex flex-col h-full overflow-hidden bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0 shadow-sm z-10">
                <div>
                    <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <i className="fas fa-database text-primary"></i> بنك الأسئلة
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">إدارة وتصنيف الأسئلة لاستخدامها في الامتحانات القادمة</p>
                </div>
                
                <div className="flex items-center gap-3">
                    <button onClick={() => alert('سيتم فتح نافذة اختيار الملفات للاستيراد')} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors flex items-center gap-2">
                        <i className="fas fa-file-import text-gray-400"></i>
                        استيراد (Excel/CSV)
                    </button>
                    <button onClick={() => alert('سيتم فتح نافذة إضافة سؤال')} className="px-4 py-2 bg-primary hover:bg-indigo-700 text-white rounded-lg text-sm font-bold shadow-sm transition-colors flex items-center gap-2">
                        <i className="fas fa-plus"></i>
                        سؤال جديد
                    </button>
                </div>
            </header>

            {/* Main Content (Split view) */}
            <main className="flex-1 overflow-hidden p-6">
                <div className="max-w-7xl mx-auto h-full flex flex-col lg:flex-row gap-6">

                    {/* Right Column: Folders */}
                    <aside className="w-full lg:w-72 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col shrink-0 overflow-hidden h-fit lg:h-full">
                        <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                            <h2 className="font-bold text-gray-800 text-sm">المجلدات والمواد</h2>
                            <button onClick={() => alert('إضافة مجلد جديد')} className="text-primary hover:bg-indigo-50 w-8 h-8 rounded flex items-center justify-center transition-colors">
                                <i className="fas fa-folder-plus"></i>
                            </button>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto p-3 space-y-1">
                            <button 
                                onClick={() => setSelectedCourseId(null)}
                                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg font-medium text-sm transition-colors ${selectedCourseId === null ? 'bg-indigo-50 text-primary' : 'text-gray-600 hover:bg-gray-50 hover:text-primary'}`}
                            >
                                <div className="flex items-center gap-2">
                                    <i className={`fas ${selectedCourseId === null ? 'fa-folder-open' : 'fa-folder'} text-primary`}></i>
                                    كل الأسئلة
                                </div>
                                <span className={`${selectedCourseId === null ? 'bg-primary text-white' : 'bg-gray-100 text-gray-500'} text-[10px] px-2 py-0.5 rounded-full`}>{data.totalQuestions}</span>
                            </button>

                            {data.courses.map((course: any) => (
                                <button 
                                    key={course.id}
                                    onClick={() => setSelectedCourseId(course.id)}
                                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg font-medium text-sm transition-colors mt-2 ${selectedCourseId === course.id ? 'bg-indigo-50 text-primary' : 'text-gray-600 hover:bg-gray-50 hover:text-primary'}`}
                                >
                                    <div className="flex items-center gap-2">
                                        <i className={`fas ${selectedCourseId === course.id ? 'fa-folder-open text-primary' : 'fa-folder text-gray-400 group-hover:text-primary'}`}></i>
                                        {course.name} ({course.code})
                                    </div>
                                    <span className={`${selectedCourseId === course.id ? 'bg-primary text-white' : 'bg-gray-100 text-gray-500'} text-[10px] px-2 py-0.5 rounded-full`}>{course.count}</span>
                                </button>
                            ))}
                        </div>

                        {/* Space Stat */}
                        <div className="p-4 border-t border-gray-100 bg-gray-50/50">
                            <div className="flex justify-between items-center text-xs mb-2">
                                <span className="text-gray-500">مجموع الأسئلة الكلي</span>
                                <span className="font-bold text-gray-800">{data.totalQuestions} سؤال</span>
                            </div>
                        </div>
                    </aside>

                    {/* Left Column: Questions List */}
                    <div className="flex-1 flex flex-col bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden h-full">
                        
                        {/* Search and Filter */}
                        <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row items-center gap-4">
                            <div className="relative flex-1 w-full">
                                <i className="fas fa-search absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
                                <input 
                                    type="text" 
                                    placeholder="ابحث في الأسئلة..." 
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-4 pr-10 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-shadow" 
                                />
                            </div>
                            
                            <div className="flex items-center gap-2 w-full sm:w-auto">
                                <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="bg-white border border-gray-200 text-gray-700 text-sm rounded-xl py-2.5 px-4 outline-none focus:ring-2 focus:ring-primary min-w-[120px]">
                                    <option value="">كل الأنواع</option>
                                    <option value="MULTIPLE_CHOICE">اختيار من متعدد</option>
                                    <option value="TRUE_FALSE">صح / خطأ</option>
                                    <option value="ESSAY">مقالي</option>
                                </select>
                            </div>
                        </div>

                        {/* Questions Cards */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-3">
                            {filteredQuestions.length === 0 ? (
                                <div className="text-center py-12 text-gray-500">
                                    <i className="fas fa-inbox text-4xl mb-3 text-gray-300"></i>
                                    <p>لا توجد أسئلة مطابقة للبحث أو الفلتر.</p>
                                </div>
                            ) : filteredQuestions.map((q: any) => (
                                <div key={q.id} className="border border-gray-200 rounded-xl p-4 hover:border-primary transition-colors group relative bg-white">
                                    <div className="flex items-start gap-4">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="bg-gray-100 text-gray-600 text-[10px] font-bold px-2 py-0.5 rounded border border-gray-200">
                                                    {q.type === 'MULTIPLE_CHOICE' ? 'اختيار من متعدد' : q.type === 'TRUE_FALSE' ? 'صح / خطأ' : 'مقالي'}
                                                </span>
                                                <span className="bg-gray-100 text-gray-600 text-[10px] font-bold px-2 py-0.5 rounded border border-gray-200">
                                                    {q.points} درجة
                                                </span>
                                                <span className="text-gray-400 text-xs mr-auto">
                                                    <i className="far fa-clock"></i> {new Intl.DateTimeFormat('ar-EG', { dateStyle: 'short' }).format(new Date(q.createdAt))}
                                                </span>
                                            </div>
                                            <p className="text-gray-800 font-medium text-sm leading-relaxed mb-3">{q.text}</p>
                                            
                                            {/* Options */}
                                            {q.type !== 'ESSAY' && q.choices && q.choices.length > 0 && (
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                                                    {q.choices.map((choice: any, idx: number) => (
                                                        <div key={choice.id} className={`px-2 py-1.5 rounded flex justify-between items-center truncate border ${choice.isCorrect ? 'bg-green-50 border-success/30 text-success font-medium' : 'bg-gray-50 border-gray-100 text-gray-600'}`}>
                                                            <span>{String.fromCharCode(65 + idx)}) {choice.text}</span>
                                                            {choice.isCorrect && <i className="fas fa-check"></i>}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    
                                    {/* Quick Actions */}
                                    <div className="absolute rtl:left-4 ltr:right-4 top-4 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 bg-white/90 backdrop-blur shadow-sm border border-gray-100 rounded-lg p-1">
                                        <button title="تعديل السؤال" className="w-8 h-8 rounded flex items-center justify-center text-gray-500 hover:text-primary hover:bg-indigo-50 transition-colors"><i className="fas fa-pen text-sm"></i></button>
                                        <div className="w-px h-4 bg-gray-200 mx-1"></div>
                                        <button title="حذف" className="w-8 h-8 rounded flex items-center justify-center text-gray-500 hover:text-danger hover:bg-red-50 transition-colors"><i className="fas fa-trash text-sm"></i></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        {/* Pagination */}
                        <div className="p-4 border-t border-gray-100 bg-white flex items-center justify-between text-sm">
                            <span className="text-gray-500">عرض {filteredQuestions.length} سؤال</span>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
