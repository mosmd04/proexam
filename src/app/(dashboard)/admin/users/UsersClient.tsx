"use client";

import React, { useState } from "react";
import { createUserWithCourse } from "@/app/actions/admin";

export default function UsersClient({ users, courses }: { users: any[], courses: any[] }) {
  const [showAddUser, setShowAddUser] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [roleName, setRoleName] = useState<"TEACHER" | "STUDENT">("TEACHER");
  const [courseId, setCourseId] = useState("");

  const handleAddUser = async () => {
    if (!name || !email || !courseId) return;
    await createUserWithCourse(name, email, roleName, courseId);
    setShowAddUser(false);
    setName(""); setEmail(""); setCourseId("");
  };

  return (
    <main className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">
              <i className="fas fa-users-cog text-primary"></i> إدارة المستخدمين
            </h1>
            <p className="text-slate-500 mt-1 text-sm">إنشاء حسابات الأساتذة والطلاب وربطهم بالمقررات</p>
          </div>
          <button 
            onClick={() => setShowAddUser(true)}
            className="px-4 py-2 bg-primary text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-md flex items-center gap-2"
          >
            <i className="fas fa-plus"></i> مستخدم جديد
          </button>
        </div>

        {showAddUser && (
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-4">
            <h3 className="font-bold text-slate-800 border-b pb-2">إضافة مستخدم وربطه بمقرر</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">الاسم الكامل</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full border rounded-lg p-2 text-sm" placeholder="الاسم" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">البريد الإلكتروني (تسجيل الدخول)</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full border rounded-lg p-2 text-sm" placeholder="email@example.com" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">الدور (الصلاحية)</label>
                <select value={roleName} onChange={e => setRoleName(e.target.value as any)} className="w-full border rounded-lg p-2 text-sm">
                  <option value="TEACHER">أستاذ (Teacher)</option>
                  <option value="STUDENT">طالب (Student)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">المقرر الدراسي</label>
                <select value={courseId} onChange={e => setCourseId(e.target.value)} className="w-full border rounded-lg p-2 text-sm">
                  <option value="">-- اختر المقرر --</option>
                  {courses.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.department?.name})</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-2 justify-end mt-2">
              <button onClick={() => setShowAddUser(false)} className="px-5 py-2 bg-slate-100 text-slate-600 font-bold rounded-lg text-sm">إلغاء</button>
              <button onClick={handleAddUser} className="px-5 py-2 bg-emerald-500 text-white font-bold rounded-lg text-sm">إنشاء وحفظ كلمة المرور كـ (password123)</button>
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <table className="w-full text-right">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 text-xs uppercase font-bold">
              <tr>
                <th className="p-4">الاسم والبريد</th>
                <th className="p-4">الأدوار</th>
                <th className="p-4">المقررات المرتبطة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {users.map(user => (
                <tr key={user.id} className="hover:bg-slate-50">
                  <td className="p-4">
                    <p className="font-bold text-slate-800">{user.name}</p>
                    <p className="text-xs text-slate-500">{user.email}</p>
                  </td>
                  <td className="p-4">
                    {user.userRoles.map((ur: any) => (
                      <span key={ur.role.id} className="inline-block bg-indigo-50 text-indigo-600 text-xs px-2 py-1 rounded border border-indigo-100 ml-1">
                        {ur.role.name}
                      </span>
                    ))}
                  </td>
                  <td className="p-4">
                    {user.courseEnrollments.map((enr: any) => (
                      <div key={enr.id} className="text-xs bg-slate-100 p-1 rounded inline-block ml-1 border">
                        {enr.course.name} <span className="font-bold">({enr.role})</span>
                      </div>
                    ))}
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr><td colSpan={3} className="p-8 text-center text-slate-400">لا يوجد مستخدمين. قم بإضافة أستاذ أو طالب.</td></tr>
              )}
            </tbody>
          </table>
        </div>

      </div>
    </main>
  );
}
