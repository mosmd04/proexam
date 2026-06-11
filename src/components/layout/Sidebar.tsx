"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSidebar } from "./SidebarContext";
import { logout } from "@/app/actions/auth";
import type { AuthUser } from "@/types/auth";

interface SidebarProps {
  user: AuthUser;
}

export default function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const { isOpen, close } = useSidebar();

  const isSuperAdmin = user.role === "SUPER_ADMIN";
  const isTeacher = user.role === "TEACHER" || user.role === "UNIVERSITY_ADMIN";
  const isStudent = user.role === "STUDENT";

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .slice(0, 2)
      .map((n) => n[0])
      .join(".");
  };

  const getRoleLabel = (role: string) => {
    if (role === "SUPER_ADMIN") return "مدير النظام (Super Admin)";
    if (role === "TEACHER" || role === "UNIVERSITY_ADMIN") return "أستاذ (Teacher)";
    if (role === "STUDENT") return "طالب (Student)";
    return role;
  };

  const handleLogout = async () => {
    await logout();
  };

  const [showToast, setShowToast] = useState(false);

  const handleComingSoon = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-30 md:hidden transition-opacity duration-300"
          onClick={close}
        />
      )}

      {/* Sidebar aside */}
      <aside
        className={`
          fixed inset-y-0 right-0 w-64 bg-[#0F172A] text-white shadow-xl z-40 flex flex-col h-full transition-transform duration-300 ease-in-out shrink-0 overflow-hidden
          md:translate-x-0 md:static md:flex
          ${isOpen ? "translate-x-0" : "translate-x-full md:translate-x-0"}
        `}
      >
        {isSuperAdmin && (
          // ==========================================
          // ADMIN SIDEBAR
          // ==========================================
          <>
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary rounded-full mix-blend-multiply filter blur-2xl opacity-20 -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

            <div className="h-16 flex items-center justify-center border-b border-slate-800 relative z-10 shrink-0">
              <div className="text-xl font-bold text-white flex items-center gap-2">
                <i className="fas fa-shield-alt text-primary"></i>
                <span>الإدارة العليا</span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto py-6 relative z-10">
              <nav className="space-y-1 px-4">
                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-3 px-2">
                  إدارة النظام
                </p>

                <Link
                  href="/admin"
                  onClick={close}
                  className={`group flex items-center px-3 py-2.5 text-sm rounded-xl transition-colors ${
                    pathname === "/admin"
                      ? "bg-primary/10 border border-primary/20 text-indigo-400 font-bold shadow-sm"
                      : "text-slate-400 hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  <i className="fas fa-chart-line text-lg w-6 text-center ml-2"></i>
                  نظرة عامة
                </Link>

                <Link
                  href="/admin/users"
                  onClick={close}
                  className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-colors mt-1 ${
                    pathname.includes("/admin/users")
                      ? "bg-primary/10 border border-primary/20 text-indigo-400 font-bold shadow-sm"
                      : "text-slate-400 hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  <i className="fas fa-users-cog text-lg w-6 text-center ml-2 text-slate-500 group-hover:text-primary transition-colors"></i>
                  المستخدمين والصلاحيات
                </Link>

                <Link
                  href="/admin/colleges"
                  onClick={close}
                  className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-colors mt-1 ${
                    pathname.includes("/admin/colleges")
                      ? "bg-primary/10 border border-primary/20 text-indigo-400 font-bold shadow-sm"
                      : "text-slate-400 hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  <i className="fas fa-university text-lg w-6 text-center ml-2 text-slate-500 group-hover:text-primary transition-colors"></i>
                  الكليات والأقسام
                </Link>

                <Link
                  href="/admin/servers"
                  onClick={close}
                  className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-colors mt-1 ${
                    pathname.includes("/admin/servers")
                      ? "bg-primary/10 border border-primary/20 text-indigo-400 font-bold shadow-sm"
                      : "text-slate-400 hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  <i className="fas fa-server text-lg w-6 text-center ml-2 text-slate-500 group-hover:text-primary transition-colors"></i>
                  حالة الخوادم
                </Link>

                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-3 mt-6 px-2">
                  الإعدادات
                </p>

                <Link
                  href="/admin/settings"
                  onClick={close}
                  className={`group flex items-center px-3 py-2.5 text-sm rounded-xl transition-colors mt-1 ${
                    pathname.includes("/admin/settings")
                      ? "bg-primary/10 border border-primary/20 text-indigo-400 font-bold shadow-sm"
                      : "text-slate-400 hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  <i className="fas fa-cog text-lg w-6 text-center ml-2 text-slate-500 group-hover:text-primary transition-colors"></i>
                  إعدادات المنظومة
                </Link>
                <Link
                  href="/admin/audit"
                  onClick={close}
                  className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-colors mt-1 ${
                    pathname.includes("/admin/audit")
                      ? "bg-primary/10 border border-primary/20 text-indigo-400 font-bold shadow-sm"
                      : "text-slate-400 hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  <i className="fas fa-history text-lg w-6 text-center ml-2 text-slate-500 group-hover:text-primary transition-colors"></i>
                  سجل العمليات (Audit)
                </Link>
              </nav>
            </div>
          </>
        )}

        {isTeacher && (
          // ==========================================
          // TEACHER SIDEBAR
          // ==========================================
          <>
            <div className="h-16 flex items-center justify-center border-b border-gray-800 relative overflow-hidden shrink-0">
              <div className="absolute inset-0 bg-primary opacity-10"></div>
              <div className="text-xl font-bold text-white flex items-center gap-2 relative z-10">
                <i className="fas fa-graduation-cap text-primary"></i>
                <span>بوابة المعلم</span>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto py-6">
              <nav className="space-y-2 px-4">
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-2 px-2">القائمة الرئيسية</p>
                
                <Link
                  href="/teacher"
                  onClick={close}
                  className={`group flex items-center px-3 py-2.5 text-sm rounded-lg transition-colors ${
                    pathname === "/teacher"
                      ? "bg-primary text-white font-medium shadow-md shadow-indigo-900/50"
                      : "text-gray-300 hover:bg-gray-800 hover:text-white"
                  }`}
                >
                  <i className="fas fa-home text-lg w-6 text-center ml-2"></i>
                  اللوحة الرئيسية
                </Link>
                
                <Link
                  href="/teacher/exams"
                  onClick={close}
                  className={`group flex items-center px-3 py-2.5 text-sm rounded-lg transition-colors ${
                    pathname.includes("/teacher/exams")
                      ? "bg-primary text-white font-medium shadow-md shadow-indigo-900/50"
                      : "text-gray-300 hover:bg-gray-800 hover:text-white"
                  }`}
                >
                  <i className="fas fa-edit text-lg w-6 text-center ml-2 text-gray-400 group-hover:text-primary transition-colors"></i>
                  إدارة الامتحانات
                </Link>

                <Link
                  href="/teacher/question-bank"
                  onClick={close}
                  className={`group flex items-center px-3 py-2.5 text-sm rounded-lg transition-colors ${
                    pathname.includes("/teacher/question-bank")
                      ? "bg-primary text-white font-medium shadow-md shadow-indigo-900/50"
                      : "text-gray-300 hover:bg-gray-800 hover:text-white"
                  }`}
                >
                  <i className="fas fa-database text-lg w-6 text-center ml-2 text-gray-400 group-hover:text-primary transition-colors"></i>
                  بنك الأسئلة
                </Link>

                <Link
                  href="/teacher/proctoring"
                  onClick={close}
                  className={`group flex items-center px-3 py-2.5 text-sm rounded-lg transition-colors ${
                    pathname.includes("/teacher/proctoring")
                      ? "bg-red-500 text-white font-medium shadow-md shadow-red-900/50"
                      : "text-gray-300 hover:bg-gray-800 hover:text-white"
                  }`}
                >
                  <i className={`fas fa-video text-lg w-6 text-center ml-2 ${pathname.includes('/teacher/proctoring') ? 'text-white' : 'text-gray-400 group-hover:text-danger animate-pulse'} transition-colors`}></i>
                  المراقبة الحية
                </Link>
                
                <Link
                  href="/teacher/students"
                  onClick={close}
                  className={`group flex items-center px-3 py-2.5 text-sm rounded-lg transition-colors ${
                    pathname.includes("/teacher/students")
                      ? "bg-primary text-white font-medium shadow-md shadow-indigo-900/50"
                      : "text-gray-300 hover:bg-gray-800 hover:text-white"
                  }`}
                >
                  <i className="fas fa-users text-lg w-6 text-center ml-2 text-gray-400 group-hover:text-primary transition-colors"></i>
                  الطلاب والنتائج
                </Link>
                
                <Link
                  href="/teacher/analytics"
                  onClick={close}
                  className={`group flex items-center px-3 py-2.5 text-sm rounded-lg transition-colors ${
                    pathname.includes("/teacher/analytics")
                      ? "bg-primary text-white font-medium shadow-md shadow-indigo-900/50"
                      : "text-gray-300 hover:bg-gray-800 hover:text-white"
                  }`}
                >
                  <i className="fas fa-chart-pie text-lg w-6 text-center ml-2 text-gray-400 group-hover:text-primary transition-colors"></i>
                  التقارير والإحصائيات
                </Link>
              </nav>
            </div>
          </>
        )}

        {isStudent && (
          // ==========================================
          // STUDENT SIDEBAR
          // ==========================================
          <>
            <div className="h-16 flex items-center justify-center border-b border-gray-800 shrink-0">
              <div className="text-xl font-black text-white flex items-center gap-2">
                <i className="fas fa-user-graduate text-primary"></i>
                <span>بوابة الطالب</span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto py-6">
              <nav className="space-y-1.5 px-4">
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-3 px-2">
                  القائمة الرئيسية
                </p>

                <Link
                  href="/student"
                  onClick={close}
                  className={`group flex items-center px-3 py-2.5 text-sm rounded-lg transition-colors ${
                    pathname === "/student"
                      ? "bg-primary text-white font-medium shadow-md shadow-indigo-900/50"
                      : "text-gray-300 hover:bg-gray-800 hover:text-white"
                  }`}
                >
                  <i className="fas fa-home text-lg w-6 text-center ml-2"></i>
                  اللوحة الرئيسية
                </Link>

                <Link
                  href="/student/exams"
                  onClick={close}
                  className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                    pathname.includes("/student/exams")
                      ? "bg-primary/10 border border-primary/20 text-indigo-400 font-bold shadow-sm"
                      : "text-gray-300 hover:bg-gray-800 hover:text-white"
                  }`}
                >
                  <div className="flex items-center">
                    <i className="fas fa-laptop-code text-lg w-6 text-center ml-2 text-gray-400 group-hover:text-primary transition-colors"></i>
                    الامتحانات المتاحة
                  </div>
                </Link>

                <Link
                  href="/student/calendar"
                  onClick={close}
                  className={`group flex items-center px-3 py-2.5 text-sm rounded-lg transition-colors ${
                    pathname.includes("/student/calendar")
                      ? "bg-primary/10 border border-primary/20 text-indigo-400 font-bold shadow-sm"
                      : "text-gray-300 hover:bg-gray-800 hover:text-white"
                  }`}
                >
                  <i className="far fa-calendar-alt text-lg w-6 text-center ml-2 text-gray-400 group-hover:text-primary transition-colors"></i>
                  جدول الامتحانات
                </Link>

                <Link
                  href="/student/records"
                  onClick={close}
                  className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                    pathname.includes("/student/records")
                      ? "bg-primary/10 border border-primary/20 text-indigo-400 font-bold shadow-sm"
                      : "text-gray-300 hover:bg-gray-800 hover:text-white"
                  }`}
                >
                  <i className="fas fa-chart-line text-lg w-6 text-center ml-2 text-gray-400 group-hover:text-primary transition-colors"></i>
                  السجل الأكاديمي
                </Link>
              </nav>
            </div>
          </>
        )}

        {/* Global Footer Profile Area for all roles */}
        <div className="p-4 border-t border-slate-800 flex items-center justify-between gap-3 relative z-10 bg-[#0F172A] shrink-0 hover:bg-slate-800/50 transition-colors">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center text-white font-bold shrink-0">
              {getInitials(user.name)}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-white truncate">{user.name}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-secondary shadow-[0_0_5px_#10B981]"></span>
                <p className="text-[10px] text-slate-400 truncate">{getRoleLabel(user.role)}</p>
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="text-slate-500 hover:text-red-400 transition-colors mr-2 shrink-0"
            title="تسجيل الخروج"
          >
            <i className="fas fa-sign-out-alt text-sm"></i>
          </button>
        </div>
      </aside>

      {/* Sidebar Coming Soon Toast */}
      {showToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-bottom-5 fade-in duration-300 w-[90%] max-w-sm">
          <div className="bg-slate-900/95 backdrop-blur-md text-white p-4 rounded-2xl shadow-2xl flex items-center gap-4 border border-slate-700">
            <div className="w-10 h-10 bg-primary/20 text-indigo-400 rounded-full flex items-center justify-center shrink-0">
              <i className="fas fa-tools"></i>
            </div>
            <div className="flex-1">
              <p className="font-bold text-sm text-white">هذه الخاصية قيد التطوير</p>
              <p className="text-xs text-slate-400 mt-0.5 leading-tight">
                نعمل على إضافة هذه الميزة قريباً لتقديم تجربة أفضل لك.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
