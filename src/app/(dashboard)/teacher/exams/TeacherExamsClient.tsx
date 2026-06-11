"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function TeacherExamsClient({ data }: { data: any }) {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState("");
    const [filterStatus, setFilterStatus] = useState("ALL");
    const [filterCourse, setFilterCourse] = useState("ALL");

    // Unique courses from exams
    const courses = Array.from(new Set(data.exams.map((e: any) => e.courseCode)));

    const filteredExams = data.exams.filter((exam: any) => {
        const matchesSearch = exam.title.toLowerCase().includes(searchQuery.toLowerCase()) || exam.courseCode.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = filterStatus === "ALL" || exam.status === filterStatus;
        const matchesCourse = filterCourse === "ALL" || exam.courseCode === filterCourse;
        return matchesSearch && matchesStatus && matchesCourse;
    });

    return (
        <div className="flex-1 flex flex-col h-full overflow-hidden bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 px-6 py-4 flex flex-col sm:flex-row items-center justify-between shrink-0 shadow-sm z-10 gap-4">
                <div>
                    <h1 className="text-xl font-bold text-gray-800">إدارة الامتحانات</h1>
                    <p className="text-sm text-gray-500 mt-1">عرض وإدارة جميع الامتحانات الخاصة بمقرراتك</p>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <Link href="/teacher/exams/create" className="px-4 py-2 bg-primary hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-md shadow-indigo-200 transition-colors flex items-center gap-2 whitespace-nowrap">
                        <i className="fas fa-plus-circle"></i>
                        إنشاء امتحان جديد
                    </Link>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto p-6">
                <div className="max-w-7xl mx-auto space-y-6">

                    {/* Stats */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 shrink-0">
                        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-gray-50 text-gray-500 flex items-center justify-center text-xl shrink-0"><i className="fas fa-layer-group"></i></div>
                            <div>
                                <p className="text-gray-500 text-xs font-bold mb-1">إجمالي الامتحانات</p>
                                <p className="text-2xl font-black text-gray-800">{data.stats.total}</p>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl p-4 border border-red-100 shadow-sm shadow-red-50 flex items-center gap-4 relative overflow-hidden group">
                            <div className="absolute inset-0 bg-red-50/50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <div className="w-12 h-12 rounded-xl bg-red-50 border border-red-100 text-danger flex items-center justify-center text-xl shrink-0 relative z-10">
                                <i className="fas fa-satellite-dish animate-pulse"></i>
                            </div>
                            <div className="relative z-10">
                                <p className="text-danger text-xs font-bold mb-1">يجرى الآن</p>
                                <p className="text-2xl font-black text-danger">{data.stats.active}</p>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-blue-50 text-info flex items-center justify-center text-xl shrink-0"><i className="fas fa-calendar-alt"></i></div>
                            <div>
                                <p className="text-gray-500 text-xs font-bold mb-1">مجدولة (قادمة)</p>
                                <p className="text-2xl font-black text-gray-800">{data.stats.scheduled}</p>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-green-50 text-success flex items-center justify-center text-xl shrink-0"><i className="fas fa-check-double"></i></div>
                            <div>
                                <p className="text-gray-500 text-xs font-bold mb-1">امتحانات مكتملة</p>
                                <p className="text-2xl font-black text-gray-800">{data.stats.completed}</p>
                            </div>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200 flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="relative w-full md:w-96">
                            <i className="fas fa-search absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
                            <input 
                                type="text" 
                                placeholder="ابحث باسم الامتحان، الرمز، أو المقرر..." 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-4 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all" 
                            />
                        </div>

                        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                            <select value={filterCourse} onChange={(e) => setFilterCourse(e.target.value)} className="bg-white border border-gray-200 text-gray-700 text-sm rounded-xl focus:ring-primary focus:border-primary block px-4 py-2.5 outline-none font-medium min-w-[140px]">
                                <option value="ALL">جميع المقررات</option>
                                {courses.map((c: any) => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>

                            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="bg-white border border-gray-200 text-gray-700 text-sm rounded-xl focus:ring-primary focus:border-primary block px-4 py-2.5 outline-none font-medium min-w-[140px]">
                                <option value="ALL">جميع الحالات</option>
                                <option value="DRAFT">مسودة</option>
                                <option value="PUBLISHED">مجدول</option>
                                <option value="ACTIVE">جاري الآن</option>
                                <option value="COMPLETED">مكتمل</option>
                            </select>
                        </div>
                    </div>

                    {/* Exams List */}
                    <div className="space-y-4">
                        {filteredExams.length === 0 ? (
                            <div className="text-center py-12 text-gray-500 bg-white rounded-2xl border border-gray-100">
                                <i className="fas fa-inbox text-4xl mb-3 text-gray-300"></i>
                                <p>لا توجد امتحانات مطابقة للبحث أو الفلتر.</p>
                            </div>
                        ) : filteredExams.map((exam: any) => (
                            <div key={exam.id} className={`bg-white border ${exam.status === 'ACTIVE' ? 'border-red-200 shadow-red-50' : 'border-gray-200'} rounded-2xl p-5 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative overflow-hidden transition-all hover:-translate-y-0.5 hover:shadow-md`}>
                                <div className={`absolute inset-y-0 right-0 w-1.5 ${exam.status === 'ACTIVE' ? 'bg-danger' : exam.status === 'COMPLETED' ? 'bg-success' : exam.status === 'PUBLISHED' ? 'bg-info' : 'bg-gray-400'}`}></div>

                                <div className="flex items-start gap-4 flex-1">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0 border ${exam.status === 'ACTIVE' ? 'bg-red-50 text-danger border-red-100' : exam.status === 'COMPLETED' ? 'bg-green-50 text-success border-green-100' : exam.status === 'PUBLISHED' ? 'bg-blue-50 text-info border-blue-100' : 'bg-white text-gray-400 border-gray-200'}`}>
                                        {exam.status === 'ACTIVE' && <i className="fas fa-satellite-dish animate-pulse"></i>}
                                        {exam.status === 'COMPLETED' && <i className="fas fa-check-double"></i>}
                                        {exam.status === 'PUBLISHED' && <i className="far fa-calendar-check"></i>}
                                        {exam.status === 'DRAFT' && <i className="fas fa-pencil-ruler"></i>}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-3 mb-1.5">
                                            <h3 className="font-bold text-gray-800 text-lg">{exam.title}</h3>
                                            <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider border ${exam.status === 'ACTIVE' ? 'bg-red-100 text-danger border-red-200' : exam.status === 'COMPLETED' ? 'bg-green-50 text-success border-green-100' : exam.status === 'PUBLISHED' ? 'bg-blue-50 text-info border-blue-100' : 'bg-gray-200 text-gray-600 border-gray-300'}`}>
                                                {exam.status === 'ACTIVE' ? 'جاري الآن' : exam.status === 'COMPLETED' ? 'مكتمل' : exam.status === 'PUBLISHED' ? 'مجدول' : 'مسودة'}
                                            </span>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-gray-500">
                                            <span className="flex items-center gap-1.5"><i className="fas fa-book text-gray-400"></i> {exam.courseCode} - {exam.courseName}</span>
                                            {exam.scheduledStart && (
                                                <span className="flex items-center gap-1.5"><i className="far fa-calendar-alt text-gray-400"></i> {new Intl.DateTimeFormat('ar-EG', { dateStyle: 'long', timeStyle: 'short' }).format(new Date(exam.scheduledStart))}</span>
                                            )}
                                            <span className="flex items-center gap-1.5"><i className="far fa-hourglass text-gray-400"></i> {exam.durationMinutes} دقيقة</span>
                                            {exam.status === 'DRAFT' && <span className="flex items-center gap-1.5"><i className="fas fa-question-circle text-gray-400"></i> {exam.questionsCount} أسئلة</span>}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 w-full lg:w-auto border-t lg:border-t-0 pt-4 lg:pt-0 border-gray-100">
                                    {exam.status === 'ACTIVE' && (
                                        <>
                                        <Link href={`/teacher/proctoring/${exam.id}`} className="flex-1 lg:flex-none px-4 py-2 bg-red-50 hover:bg-danger hover:text-white text-danger border border-red-200 rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2 shadow-sm">
                                            <i className="fas fa-video"></i> غرفة المراقبة
                                        </Link>
                                        <Link href={`/teacher/grading/${exam.id}`} className="flex-1 lg:flex-none px-4 py-2 bg-indigo-50 border border-indigo-200 text-primary hover:text-white hover:border-primary hover:bg-primary rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2 shadow-sm">
                                            <i className="fas fa-check-double"></i> اعتماد النتائج
                                        </Link>
                                        </>
                                    )}
                                    {exam.status === 'COMPLETED' && (
                                        <>
                                        <Link href={`/teacher/grading/${exam.id}`} className="flex-1 lg:flex-none px-4 py-2 bg-indigo-50 border border-indigo-200 text-primary hover:text-white hover:border-primary hover:bg-primary rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2 shadow-sm">
                                            <i className="fas fa-check-double"></i> اعتماد النتائج
                                        </Link>
                                        <Link href={`/teacher/analytics/${exam.id}`} className="flex-1 lg:flex-none px-4 py-2 bg-white border border-gray-200 text-gray-600 hover:text-success hover:border-green-200 hover:bg-green-50 rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2 shadow-sm">
                                            <i className="fas fa-chart-pie"></i> التقارير
                                        </Link>
                                        </>
                                    )}
                                    {(exam.status === 'DRAFT' || exam.status === 'PUBLISHED') && (
                                        <Link href={`/teacher/exams/create`} className="flex-1 lg:flex-none px-4 py-2 bg-white border border-gray-200 text-gray-600 hover:text-primary hover:border-indigo-200 hover:bg-indigo-50 rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2 shadow-sm">
                                            <i className="fas fa-pen"></i> {exam.status === 'DRAFT' ? 'إكمال الامتحان' : 'تعديل'}
                                        </Link>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}
