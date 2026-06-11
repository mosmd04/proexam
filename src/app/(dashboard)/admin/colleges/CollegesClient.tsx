"use client";

import React, { useState } from "react";
import { createCollege, createDepartment, createCourse } from "@/app/actions/admin";

export default function CollegesClient({ faculties }: { faculties: any[] }) {
  const [showAddCollege, setShowAddCollege] = useState(false);
  const [showAddDept, setShowAddDept] = useState<string | null>(null);
  const [showAddCourse, setShowAddCourse] = useState<string | null>(null);
  
  const [name, setName] = useState("");
  const [code, setCode] = useState("");

  const handleAddCollege = async () => {
    if (!name || !code) return;
    await createCollege(name, code);
    setShowAddCollege(false);
    setName(""); setCode("");
  };

  const handleAddDept = async (facultyId: string) => {
    if (!name || !code) return;
    await createDepartment(name, code, facultyId);
    setShowAddDept(null);
    setName(""); setCode("");
  };

  const handleAddCourse = async (departmentId: string) => {
    if (!name || !code) return;
    await createCourse(name, code, departmentId);
    setShowAddCourse(null);
    setName(""); setCode("");
  };

  return (
    <main className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">
              <i className="fas fa-university text-primary"></i> الكليات والأقسام
            </h1>
            <p className="text-slate-500 mt-1 text-sm">إدارة الهيكل الأكاديمي للمنظومة</p>
          </div>
          <button 
            onClick={() => setShowAddCollege(true)}
            className="px-4 py-2 bg-primary text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-md flex items-center gap-2"
          >
            <i className="fas fa-plus"></i> إضافة كلية
          </button>
        </div>

        {showAddCollege && (
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-xs font-bold text-slate-500 mb-1">اسم الكلية</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full border rounded-lg p-2" placeholder="مثال: كلية الهندسة" />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-bold text-slate-500 mb-1">رمز الكلية</label>
              <input type="text" value={code} onChange={e => setCode(e.target.value)} className="w-full border rounded-lg p-2" placeholder="ENG" />
            </div>
            <button onClick={handleAddCollege} className="px-6 py-2 bg-emerald-500 text-white font-bold rounded-lg hover:bg-emerald-600">حفظ</button>
            <button onClick={() => setShowAddCollege(false)} className="px-4 py-2 bg-slate-100 text-slate-600 font-bold rounded-lg hover:bg-slate-200">إلغاء</button>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6">
          {faculties.map((faculty) => (
            <div key={faculty.id} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-black text-slate-800">{faculty.name} ({faculty.code})</h2>
                <button onClick={() => setShowAddDept(faculty.id)} className="text-sm font-bold text-primary hover:underline">
                  + إضافة قسم
                </button>
              </div>

              {showAddDept === faculty.id && (
                <div className="bg-slate-50 p-4 rounded-xl mb-4 flex gap-3 items-end">
                  <div className="flex-1">
                    <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full border rounded-lg p-2 text-sm" placeholder="اسم القسم" />
                  </div>
                  <div className="flex-1">
                    <input type="text" value={code} onChange={e => setCode(e.target.value)} className="w-full border rounded-lg p-2 text-sm" placeholder="رمز القسم" />
                  </div>
                  <button onClick={() => handleAddDept(faculty.id)} className="px-4 py-2 bg-primary text-white text-sm font-bold rounded-lg">حفظ</button>
                  <button onClick={() => setShowAddDept(null)} className="px-4 py-2 bg-slate-200 text-slate-700 text-sm font-bold rounded-lg">إلغاء</button>
                </div>
              )}

              <div className="space-y-4">
                {faculty.departments.map((dept: any) => (
                  <div key={dept.id} className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="font-bold text-slate-700">{dept.name} ({dept.code})</h3>
                      <button onClick={() => setShowAddCourse(dept.id)} className="text-xs font-bold bg-white border px-3 py-1 rounded-lg text-primary hover:bg-slate-50">
                        + إضافة مقرر
                      </button>
                    </div>

                    {showAddCourse === dept.id && (
                      <div className="bg-white p-3 rounded-lg mb-3 flex gap-2 items-end shadow-sm">
                        <input type="text" value={name} onChange={e => setName(e.target.value)} className="flex-1 border rounded p-1.5 text-xs" placeholder="اسم المقرر (مثال: برمجة 1)" />
                        <input type="text" value={code} onChange={e => setCode(e.target.value)} className="flex-1 border rounded p-1.5 text-xs" placeholder="الرمز (CS101)" />
                        <button onClick={() => handleAddCourse(dept.id)} className="px-3 py-1.5 bg-emerald-500 text-white text-xs font-bold rounded">حفظ</button>
                        <button onClick={() => setShowAddCourse(null)} className="px-3 py-1.5 bg-slate-100 text-slate-600 text-xs font-bold rounded">إلغاء</button>
                      </div>
                    )}

                    {dept.courses.length > 0 ? (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                        {dept.courses.map((course: any) => (
                          <div key={course.id} className="bg-white border rounded-lg p-2 text-center text-sm font-medium shadow-sm">
                            {course.name} <br/><span className="text-xs text-slate-400">{course.code}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400">لا توجد مقررات في هذا القسم</p>
                    )}
                  </div>
                ))}
                {faculty.departments.length === 0 && (
                  <p className="text-sm text-slate-400 text-center py-4">لا توجد أقسام في هذه الكلية</p>
                )}
              </div>
            </div>
          ))}
          {faculties.length === 0 && (
            <div className="text-center py-20 text-slate-400">
              <i className="fas fa-university text-5xl mb-4 opacity-50"></i>
              <p className="font-bold">لا توجد كليات حالياً</p>
              <p className="text-sm">ابدأ بإضافة كليتك الأولى</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
