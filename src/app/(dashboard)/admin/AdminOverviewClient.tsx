"use client";

import React, { useState } from "react";
import Link from "next/link";

export default function AdminOverviewClient({ 
  totalUsers, 
  activeExamsCount, 
  recentUsers, 
  cpuUsage 
}: { 
  totalUsers: number, 
  activeExamsCount: number, 
  recentUsers: any[], 
  cpuUsage: number 
}) {
  const [activeModal, setActiveModal] = useState<"none" | "users" | "editUser" | "banUser" | "audit">("none");
  const [selectedUser, setSelectedUser] = useState<string | null>(null);

  const openModal = (modal: "users" | "editUser" | "banUser" | "audit", user?: string) => {
    setActiveModal(modal);
    if (user) setSelectedUser(user);
  };

  const closeModal = () => {
    setActiveModal("none");
    setSelectedUser(null);
  };

  const executeAction = (actionName: string) => {
    closeModal();
    alert(`تم تنفيذ إجراء: ${actionName} بنجاح.`);
  };

  return (
    <main className="flex-1 overflow-y-auto p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* System KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* KPI 1: Users */}
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center gap-4 group hover:border-indigo-100 transition-colors">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-primary flex items-center justify-center text-2xl shrink-0 group-hover:scale-110 transition-transform">
              <i className="fas fa-users"></i>
            </div>
            <div>
              <p className="text-slate-500 text-xs font-bold mb-1">إجمالي المستخدمين النشطين</p>
              <div className="flex items-baseline gap-2">
                <p className="text-2xl font-black text-slate-800" dir="ltr">
                  {totalUsers}
                </p>
              </div>
            </div>
          </div>

          {/* KPI 2: Active Exams */}
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center gap-4 group hover:border-emerald-100 transition-colors">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-secondary flex items-center justify-center text-2xl shrink-0 relative group-hover:scale-110 transition-transform">
              <i className="fas fa-satellite-dish"></i>
              {activeExamsCount > 0 && <span className="absolute top-0 right-0 w-3 h-3 bg-secondary rounded-full border-2 border-white animate-pulse"></span>}
            </div>
            <div>
              <p className="text-slate-500 text-xs font-bold mb-1">امتحانات تجرى الآن</p>
              <div className="flex items-baseline gap-2">
                <p className="text-2xl font-black text-slate-800" dir="ltr">
                  {activeExamsCount}
                </p>
              </div>
            </div>
          </div>

          {/* KPI 3: Server Health */}
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center gap-4 group hover:border-blue-100 transition-colors">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-info flex items-center justify-center text-2xl shrink-0 group-hover:scale-110 transition-transform">
              <i className="fas fa-server"></i>
            </div>
            <div className="w-full">
              <div className="flex justify-between items-end mb-1.5">
                <p className="text-slate-500 text-xs font-bold">استهلاك الموارد (CPU)</p>
                <p className="text-sm font-black text-slate-800" dir="ltr">
                  {cpuUsage}%
                </p>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-info h-full rounded-full" style={{ width: `${cpuUsage}%` }}></div>
              </div>
            </div>
          </div>

          {/* KPI 4: Security Alerts */}
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center gap-4 group hover:border-amber-100 transition-colors relative overflow-hidden">
            <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-amber-50 rounded-full opacity-50 pointer-events-none"></div>
            <div className="w-14 h-14 rounded-2xl bg-amber-50 text-warning flex items-center justify-center text-2xl shrink-0 group-hover:scale-110 transition-transform z-10">
              <i className="fas fa-shield-alt"></i>
            </div>
            <div className="z-10">
              <p className="text-slate-500 text-xs font-bold mb-1">تنبيهات أمنية / غش</p>
              <div className="flex items-baseline gap-2">
                <p className="text-2xl font-black text-slate-800" dir="ltr">
                  0
                </p>
                <span className="text-xs font-medium text-slate-400">لا توجد</span>
              </div>
            </div>
          </div>
        </div>

        {/* Dash Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Left/Main Area: User Management Table */}
          <div className="xl:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
            <div className="px-6 py-5 border-b border-slate-100 bg-white flex items-center justify-between">
              <h2 className="font-bold text-lg text-slate-800">أحدث المستخدمين المسجلين</h2>
              <Link
                href="/admin/users"
                className="text-sm font-bold text-primary hover:underline flex items-center gap-1"
              >
                إدارة الجميع <i className="fas fa-arrow-left text-xs mr-1"></i>
              </Link>
            </div>

            <div className="overflow-x-auto flex-1">
              <table className="w-full text-right">
                <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 text-xs uppercase font-bold tracking-wider">
                  <tr>
                    <th className="p-4">المستخدم</th>
                    <th className="p-4">الدور</th>
                    <th className="p-4">القسم</th>
                    <th className="p-4">الحالة</th>
                    <th className="p-4 text-center">إجراء</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm font-medium text-slate-700">
                  {recentUsers.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-400">
                        لا يوجد مستخدمين مسجلين بعد.
                      </td>
                    </tr>
                  )}
                  {recentUsers.map((user) => {
                    const primaryRole = user.userRoles[0]?.role?.name || "STUDENT";
                    const isTeacher = primaryRole === "TEACHER";
                    const departmentName = user.courseEnrollments[0]?.course?.department?.name || "غير محدد";
                    const facultyName = user.courseEnrollments[0]?.course?.department?.faculty?.name || "غير محدد";

                    return (
                      <tr key={user.id} className="table-row-hover bg-white">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm ${isTeacher ? 'bg-indigo-100 text-primary' : 'bg-emerald-100 text-emerald-700'}`}>
                                {user.name[0]}
                              </div>
                              <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 border-2 border-white rounded-full ${user.isActive ? 'bg-secondary' : 'bg-slate-300'}`}></span>
                            </div>
                            <div>
                              <p className="font-bold text-slate-800">{user.name}</p>
                              <p className="text-xs text-slate-500 font-normal">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          {isTeacher ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-indigo-50 text-primary text-xs font-bold border border-indigo-100">
                              <i className="fas fa-chalkboard-teacher ml-1"></i> أستاذ
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-100">
                              <i className="fas fa-user-graduate ml-1"></i> طالب
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-slate-600 text-xs">
                          {facultyName}
                          <br />
                          <span className="text-slate-400">{departmentName}</span>
                        </td>
                        <td className="p-4">
                          {user.isActive ? (
                            <span className="inline-flex items-center gap-1 text-secondary text-xs font-bold">
                              <i className="fas fa-circle text-[8px] ml-1"></i> نشط
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-slate-400 text-xs font-bold">
                              <i className="fas fa-circle text-[8px] ml-1"></i> غير نشط
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => openModal("editUser", user.name)}
                              className="w-8 h-8 rounded-lg text-slate-400 hover:text-primary hover:bg-indigo-50 transition-colors flex items-center justify-center"
                            >
                              <i className="fas fa-pen"></i>
                            </button>
                            <button
                              onClick={() => openModal("banUser", user.name)}
                              className="w-8 h-8 rounded-lg text-slate-400 hover:text-danger hover:bg-red-50 transition-colors flex items-center justify-center"
                            >
                              <i className="fas fa-ban"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right Area: System Audit Log (Empty for now) */}
          <aside className="bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col overflow-hidden h-[400px] xl:h-auto">
            <div className="p-5 border-b border-slate-100 bg-white flex items-center justify-between z-10 shrink-0">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <i className="fas fa-history text-slate-400 ml-1"></i>
                سجل نشاط النظام
              </h3>
            </div>

            <div className="flex-1 overflow-y-auto p-5 flex items-center justify-center text-slate-400 text-sm">
              لم يتم تسجيل أي أحداث مؤخراً.
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 shrink-0">
              <Link
                href="/admin/audit"
                className="w-full text-center block text-sm font-bold text-primary hover:underline"
              >
                عرض السجل الكامل
              </Link>
            </div>
          </aside>
        </div>
      </div>

      {/* Admin Action Modals */}
      {activeModal === "editUser" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h2 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                <i className="fas fa-user-edit text-primary"></i> تعديل بيانات المستخدم
              </h2>
              <button onClick={closeModal} className="text-slate-400 hover:text-danger p-1 transition-colors">
                <i className="fas fa-times text-lg"></i>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="font-bold text-slate-700 mb-4">تعديل بيانات: {selectedUser}</p>
              <input type="text" defaultValue={selectedUser || ""} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary outline-none" />
              <div className="flex justify-end gap-3 mt-6">
                <button onClick={closeModal} className="px-5 py-2.5 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200">إلغاء</button>
                <button onClick={() => executeAction("حفظ التعديلات")} className="px-5 py-2.5 rounded-xl font-bold text-white bg-primary hover:bg-indigo-700">حفظ البيانات</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeModal === "banUser" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 text-center">
              <div className="w-16 h-16 rounded-full bg-red-100 text-danger flex items-center justify-center text-3xl mx-auto mb-4">
                <i className="fas fa-exclamation-triangle"></i>
              </div>
              <h2 className="font-black text-xl text-slate-800 mb-2">تأكيد حظر المستخدم</h2>
              <p className="text-slate-500 mb-6">هل أنت متأكد من رغبتك في حظر المستخدم <strong>{selectedUser}</strong>؟ لن يتمكن من الدخول للمنظومة.</p>
              <div className="flex justify-center gap-3">
                <button onClick={closeModal} className="px-5 py-2.5 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200">إلغاء</button>
                <button onClick={() => executeAction("حظر المستخدم")} className="px-5 py-2.5 rounded-xl font-bold text-white bg-danger hover:bg-red-600">نعم، تأكيد الحظر</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
