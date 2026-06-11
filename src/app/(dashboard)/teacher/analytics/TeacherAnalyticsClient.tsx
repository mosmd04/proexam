"use client";

import React from "react";
import Link from "next/link";

export default function TeacherAnalyticsClient({ data }: { data: any }) {
    return (
        <div className="flex-1 flex flex-col h-full overflow-hidden bg-gray-50/50">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 px-6 py-4 flex flex-col sm:flex-row items-center justify-between shrink-0 shadow-sm z-10 gap-4">
                <div>
                    <h1 className="text-xl font-bold text-gray-800">التحليل والإحصائيات الشاملة</h1>
                    <p className="text-sm text-gray-500 mt-0.5">نظرة عامة على الأداء الأكاديمي للطلاب في مقرراتك</p>
                </div>
                
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <button onClick={() => alert('الطباعة قريبا')} className="px-4 py-2 bg-gray-800 hover:bg-gray-900 text-white rounded-xl text-sm font-bold shadow-md transition-colors flex items-center gap-2 whitespace-nowrap">
                        <i className="fas fa-print"></i> طباعة التقرير
                    </button>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto p-6">
                <div className="max-w-7xl mx-auto space-y-6">

                    {/* Overall KPIs */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 shrink-0">
                        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col justify-between h-32 hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start">
                                <p className="text-gray-500 text-sm font-bold">المتوسط العام</p>
                                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-primary flex items-center justify-center"><i className="fas fa-chart-line"></i></div>
                            </div>
                            <div className="flex items-baseline gap-2">
                                <p className="text-3xl font-black text-gray-800" dir="ltr">{data.overallAverage}%</p>
                            </div>
                        </div>
                        
                        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col justify-between h-32 hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start">
                                <p className="text-gray-500 text-sm font-bold">إجمالي الطلاب المقيمين</p>
                                <div className="w-8 h-8 rounded-lg bg-blue-50 text-info flex items-center justify-center"><i className="fas fa-users"></i></div>
                            </div>
                            <div className="flex items-baseline gap-2">
                                <p className="text-3xl font-black text-gray-800">{data.totalStudents}</p>
                                <span className="text-xs font-medium text-gray-400">طالب تم تقييمهم</span>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col justify-between h-32 hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start">
                                <p className="text-gray-500 text-sm font-bold">نسبة النجاح العامة</p>
                                <div className="w-8 h-8 rounded-lg bg-green-50 text-secondary flex items-center justify-center"><i className="fas fa-check-double"></i></div>
                            </div>
                            <div className="w-full">
                                <div className="flex items-baseline justify-between mb-1">
                                    <p className="text-3xl font-black text-gray-800" dir="ltr">{data.overallPassRate}%</p>
                                </div>
                                <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                                    <div className="bg-secondary h-full rounded-full" style={{width: `${data.overallPassRate}%`}}></div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col justify-between h-32 hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start">
                                <p className="text-gray-500 text-sm font-bold">امتحانات أُنجزت</p>
                                <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-500 flex items-center justify-center"><i className="fas fa-file-alt"></i></div>
                            </div>
                            <div className="flex items-baseline gap-2">
                                <p className="text-3xl font-black text-gray-800">{data.completedExamsCount}</p>
                            </div>
                        </div>
                    </div>

                    {/* Recent Exams Comparison */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                            <h3 className="font-bold text-gray-800">أداء الامتحانات</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-right whitespace-nowrap">
                                <thead className="bg-white border-b border-gray-100 text-gray-500 text-xs uppercase font-bold tracking-wider">
                                    <tr>
                                        <th className="p-4">اسم الامتحان / المقرر</th>
                                        <th className="p-4 text-center">عدد المحاولات</th>
                                        <th className="p-4 text-center">أعلى درجة</th>
                                        <th className="p-4 text-center">أدنى درجة</th>
                                        <th className="p-4 text-center">المتوسط</th>
                                        <th className="p-4 text-center">نسبة النجاح</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50 text-sm font-medium text-gray-700">
                                    {data.recentExams.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="text-center py-8 text-gray-500">لا توجد سجلات أداء متاحة حالياً</td>
                                        </tr>
                                    ) : data.recentExams.map((exam: any) => (
                                        <tr key={exam.id} className="hover:bg-gray-50 transition-colors bg-white">
                                            <td className="p-4">
                                                <p className="font-bold text-gray-800">{exam.title}</p>
                                                <p className="text-xs text-gray-500">{exam.courseName} ({exam.courseCode})</p>
                                            </td>
                                            <td className="p-4 text-center text-gray-600">{exam.attempts}</td>
                                            <td className="p-4 text-center text-success font-bold" dir="ltr">{exam.maxScore}%</td>
                                            <td className="p-4 text-center text-danger font-bold" dir="ltr">{exam.minScore === 100 && exam.attempts === 0 ? 0 : exam.minScore}%</td>
                                            <td className="p-4 text-center">
                                                <span className="bg-gray-100 px-2 py-1 rounded text-gray-800 font-bold" dir="ltr">{exam.average}%</span>
                                            </td>
                                            <td className="p-4 text-center">
                                                <span className={`inline-flex items-center gap-1.5 text-xs font-bold ${exam.passRate >= 50 ? 'text-secondary' : 'text-danger'}`}>
                                                    <span className={`w-2 h-2 rounded-full ${exam.passRate >= 50 ? 'bg-secondary' : 'bg-danger'}`}></span> {exam.passRate}%
                                                </span>
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
