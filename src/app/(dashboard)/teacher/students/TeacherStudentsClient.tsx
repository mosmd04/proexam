"use client";

import React, { useState } from "react";

export default function TeacherStudentsClient({ data }: { data: any }) {
    const [searchQuery, setSearchQuery] = useState("");
    const [filterCourse, setFilterCourse] = useState("ALL");

    const filteredStudents = data.students.filter((student: any) => {
        const matchesSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase()) || student.email.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCourse = filterCourse === "ALL" || student.enrollments.includes(filterCourse);
        return matchesSearch && matchesCourse;
    });

    return (
        <div className="flex-1 flex flex-col h-full overflow-hidden bg-gray-50/50">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 px-6 py-4 flex flex-col sm:flex-row items-center justify-between shrink-0 shadow-sm z-10 gap-4">
                <div>
                    <h1 className="text-xl font-bold text-gray-800">إدارة الطلاب والنتائج</h1>
                    <p className="text-sm text-gray-500 mt-0.5 flex items-center gap-2">
                        المقررات: <span className="font-bold text-primary">{data.courses.length > 0 ? data.courses.map((c: any) => c.code).join(", ") : "لا يوجد"}</span>
                    </p>
                </div>
                
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <button onClick={() => alert('تحميل الملف...')} className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-xl text-sm font-bold hover:bg-gray-50 transition-colors shadow-sm flex items-center gap-2">
                        <i className="fas fa-file-export text-gray-400"></i> تصدير الكشف (Excel)
                    </button>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto p-6">
                <div className="max-w-7xl mx-auto space-y-6">

                    {/* Class Health KPIs */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 shrink-0">
                        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-primary flex items-center justify-center text-xl shrink-0"><i className="fas fa-users"></i></div>
                            <div>
                                <p className="text-gray-500 text-xs font-bold mb-1">إجمالي مسجلي المقرر</p>
                                <p className="text-2xl font-black text-gray-800">{data.totalStudents} <span className="text-xs text-gray-400 font-medium">طالب</span></p>
                            </div>
                        </div>
                        
                        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-green-50 text-secondary flex items-center justify-center text-xl shrink-0"><i className="fas fa-chart-line"></i></div>
                            <div>
                                <p className="text-gray-500 text-xs font-bold mb-1">متوسط درجات الفصل</p>
                                <div className="flex items-baseline gap-2">
                                    <p className="text-2xl font-black text-gray-800" dir="ltr">{data.classAverage}%</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl p-5 border border-red-100 shadow-sm bg-red-50/20 flex items-center gap-4 group hover:bg-red-50/50 transition-colors">
                            <div className="w-12 h-12 rounded-xl bg-red-100 text-danger flex items-center justify-center text-xl shrink-0">
                                <i className="fas fa-exclamation-triangle"></i>
                            </div>
                            <div>
                                <p className="text-danger text-xs font-bold mb-1">طلاب بحاجة لمتابعة</p>
                                <div className="flex items-baseline gap-2">
                                    <p className="text-2xl font-black text-danger">{data.atRiskCount}</p>
                                    <span className="text-[10px] text-danger font-bold bg-white border border-red-200 px-1.5 py-0.5 rounded">متعثرون</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Data Section */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
                        
                        {/* Tabs & Filters */}
                        <div className="border-b border-gray-100 bg-white">
                            <div className="flex flex-col md:flex-row md:items-center justify-between px-6 py-2 gap-4">
                                
                                {/* Tabs */}
                                <nav className="flex gap-6">
                                    <a href="#" className="py-3 text-sm font-bold text-primary border-b-2 border-primary relative z-10 flex items-center gap-2">
                                        <i className="fas fa-list-ul"></i> قائمة الطلاب
                                    </a>
                                </nav>

                                {/* Filters */}
                                <div className="flex items-center gap-3 pb-2 md:pb-0">
                                    <div className="relative w-48">
                                        <i className="fas fa-search absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs"></i>
                                        <input 
                                            type="text" 
                                            placeholder="ابحث عن طالب..." 
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="w-full pl-3 pr-8 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all" 
                                        />
                                    </div>
                                    <select value={filterCourse} onChange={(e) => setFilterCourse(e.target.value)} className="bg-white border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-1 focus:ring-primary outline-none py-1.5 px-3">
                                        <option value="ALL">جميع المقررات</option>
                                        {data.courses.map((c: any) => (
                                            <option key={c.id} value={c.code}>{c.name} ({c.code})</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Students Table */}
                        <div className="overflow-x-auto">
                            <table className="w-full text-right whitespace-nowrap">
                                <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 text-xs uppercase font-bold tracking-wider">
                                    <tr>
                                        <th className="p-4">الطالب</th>
                                        <th className="p-4">البريد الإلكتروني</th>
                                        <th className="p-4">إجمالي الدرجات</th>
                                        <th className="p-4">الامتحانات المُنجزة</th>
                                        <th className="p-4">المقررات</th>
                                        <th className="p-4 text-center">الحالة</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50 text-sm font-medium text-gray-700">
                                    {filteredStudents.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="text-center py-8 text-gray-500">لا يوجد طلاب مطابقون للبحث</td>
                                        </tr>
                                    ) : filteredStudents.map((student: any) => (
                                        <tr key={student.id} className={`hover:bg-gray-50 transition-colors ${student.atRisk ? 'bg-red-50/20' : 'bg-white'}`}>
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-full bg-indigo-50 text-primary flex items-center justify-center font-bold text-sm border border-indigo-100">
                                                        {student.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-gray-900">{student.name}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4 text-gray-500 font-bold" dir="ltr">{student.email}</td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-2">
                                                    <span className={`font-black text-base ${student.atRisk ? 'text-danger' : 'text-gray-800'}`} dir="ltr">{student.avgScore}%</span>
                                                </div>
                                            </td>
                                            <td className="p-4 text-gray-500">{student.completedExams}</td>
                                            <td className="p-4 text-gray-500">{student.enrollments.join(', ')}</td>
                                            <td className="p-4 text-center">
                                                {student.atRisk ? (
                                                    <span className="inline-flex items-center gap-1.5 bg-red-50 text-danger px-2.5 py-1 rounded border border-red-100 text-xs font-bold">
                                                        <i className="fas fa-exclamation-triangle"></i> متعثر
                                                    </span>
                                                ) : student.completedExams > 0 && parseFloat(student.avgScore) >= 85 ? (
                                                    <span className="inline-flex items-center gap-1.5 bg-green-50 text-secondary px-2.5 py-1 rounded border border-green-100 text-xs font-bold">
                                                        <i className="fas fa-star text-yellow-400"></i> متميز
                                                    </span>
                                                ) : student.completedExams > 0 ? (
                                                    <span className="inline-flex items-center gap-1.5 text-gray-500 text-xs font-bold">
                                                        <span className="w-2 h-2 rounded-full bg-blue-400"></span> جيد
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-400 text-xs">-</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
