"use client";

import React, { useState } from "react";
import { useSidebar } from "./SidebarContext";
import type { AuthUser } from "@/types/auth";

interface HeaderProps {
  user: AuthUser;
}

export default function Header({ user }: HeaderProps) {
  const { toggle } = useSidebar();
  const isAdmin = user.role === "SUPER_ADMIN" || user.role === "UNIVERSITY_ADMIN";
  const isTeacher = user.role === "TEACHER";

  const [activeModal, setActiveModal] = useState<"none" | "import" | "newUser" | "notifications">("none");
  const [isUploading, setIsUploading] = useState(false);

  const handleClose = () => setActiveModal("none");

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);
    setTimeout(() => {
      setIsUploading(false);
      handleClose();
      alert("تم استيراد البيانات بنجاح!");
    }, 2000);
  };

  const handleUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleClose();
    alert("تم إضافة المستخدم بنجاح وإرسال بيانات الدخول لبريده الإلكتروني.");
  };

  return (
    <>
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex flex-col md:flex-row md:items-center md:justify-between shrink-0 shadow-sm z-10 gap-4 relative">
        {/* Mobile navigation toggle and role titles */}
        <div className="flex items-center justify-between w-full md:w-auto">
          <div className="flex items-center gap-3">
            <button
              onClick={toggle}
              className="md:hidden text-slate-500 hover:text-primary p-1"
              aria-label="Toggle Navigation"
            >
              <i className="fas fa-bars text-xl"></i>
            </button>

            {isAdmin && (
              <div>
                <h1 className="text-xl font-bold text-slate-800">لوحة التحكم المركزية</h1>
                <p className="text-sm text-slate-500 mt-0.5">مراقبة أداء النظام وإدارة المستخدمين</p>
              </div>
            )}
            {isTeacher && (
              <div>
                <h1 className="text-xl font-bold text-slate-800">بوابة المعلم</h1>
                <p className="text-sm text-slate-500 mt-0.5">مرحباً بك في منصة إدارة الامتحانات</p>
              </div>
            )}
            {!isAdmin && !isTeacher && (
              <div>
                <h1 className="text-xl font-bold text-slate-800">بوابة الطالب</h1>
                <p className="text-sm text-slate-500 mt-0.5">مرحباً بك في منظومة الامتحانات الآمنة</p>
              </div>
            )}
          </div>
        </div>

        {/* Header Actions and Search */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          {isAdmin ? (
            // Admin search & buttons
            <>
              <div className="relative hidden lg:block">
                <i className="fas fa-search absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
                <input
                  type="text"
                  placeholder="ابحث عن طالب، معلم، أو مادة..."
                  className="w-64 pl-4 pr-10 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all bg-slate-50"
                />
              </div>

              <button
                onClick={() => setActiveModal("import")}
                className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-50 transition-colors shadow-sm flex items-center gap-2 whitespace-nowrap"
              >
                <i className="fas fa-file-import text-primary"></i>
                استيراد Excel
              </button>
              <button
                onClick={() => setActiveModal("newUser")}
                className="px-4 py-2 bg-primary hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-md shadow-indigo-200 transition-colors flex items-center gap-2 whitespace-nowrap"
              >
                <i className="fas fa-user-plus"></i>
                مستخدم جديد
              </button>
            </>
          ) : (
            // Student search & notification bell
            <>
              <div className="relative">
                <i className="fas fa-search absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
                <input
                  type="text"
                  placeholder="ابحث عن مادة..."
                  className="hidden sm:block pl-4 pr-10 py-2 bg-gray-50 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-colors w-64"
                />
              </div>
              <button
                onClick={() => setActiveModal("notifications")}
                className="relative w-10 h-10 rounded-full bg-gray-50 border border-gray-200 text-gray-500 hover:text-primary hover:bg-indigo-50 transition-colors flex items-center justify-center shrink-0"
              >
                <i className="far fa-bell text-lg"></i>
                <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-danger border-2 border-white rounded-full"></span>
              </button>

              {/* Notifications Dropdown (Student) */}
              {activeModal === "notifications" && (
                <div className="absolute top-full right-6 mt-2 w-80 bg-white border border-gray-200 rounded-2xl shadow-xl z-50 overflow-hidden transform origin-top-right transition-all">
                  <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                    <h3 className="font-bold text-gray-800">الإشعارات</h3>
                    <button onClick={handleClose} className="text-primary text-xs hover:underline font-bold">
                      تحديد الكل كمقروء
                    </button>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    <div className="p-4 border-b border-gray-50 hover:bg-indigo-50/30 transition-colors cursor-pointer opacity-100">
                      <p className="text-sm font-bold text-gray-800">تم نشر نتيجة مادة "هياكل البيانات"</p>
                      <p className="text-xs text-gray-500 mt-1">يمكنك الآن استعراض درجتك التفصيلية.</p>
                      <p className="text-[10px] text-primary mt-2">منذ ساعتين</p>
                    </div>
                    <div className="p-4 hover:bg-indigo-50/30 transition-colors cursor-pointer opacity-70">
                      <p className="text-sm font-bold text-gray-800">تذكير: امتحان "الذكاء الاصطناعي"</p>
                      <p className="text-xs text-gray-500 mt-1">يبدأ غداً في تمام الساعة 10:00 صباحاً.</p>
                      <p className="text-[10px] text-gray-400 mt-2">منذ يومين</p>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </header>

      {/* Global Modals for Admin Actions */}
      {isAdmin && activeModal === "import" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h2 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                <i className="fas fa-file-excel text-success"></i> استيراد من Excel
              </h2>
              <button onClick={handleClose} className="text-slate-400 hover:text-danger p-1 transition-colors">
                <i className="fas fa-times text-lg"></i>
              </button>
            </div>
            <form onSubmit={handleUploadSubmit} className="p-6">
              <div className="border-2 border-dashed border-indigo-200 bg-indigo-50/50 rounded-2xl p-8 text-center hover:bg-indigo-50 transition-colors cursor-pointer group mb-6">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-primary text-2xl mx-auto shadow-sm mb-4 group-hover:scale-110 transition-transform">
                  <i className="fas fa-cloud-upload-alt"></i>
                </div>
                <h3 className="font-bold text-slate-800 mb-1">اسحب وأفلت ملف الإكسيل هنا</h3>
                <p className="text-sm text-slate-500">أو اضغط لاختيار ملف من جهازك (يدعم .xlsx, .csv)</p>
              </div>

              {isUploading && (
                <div className="mb-6">
                  <div className="flex justify-between text-xs font-bold text-slate-600 mb-2">
                    <span>جاري الرفع والمعالجة...</span>
                    <span>75%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-primary animate-pulse" style={{ width: "75%" }}></div>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-5 py-2.5 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="px-5 py-2.5 rounded-xl font-bold text-white bg-primary hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 disabled:opacity-50"
                >
                  {isUploading ? "جاري الرفع..." : "استيراد البيانات"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isAdmin && activeModal === "newUser" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h2 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-indigo-100 text-primary flex items-center justify-center">
                  <i className="fas fa-user-plus text-sm"></i>
                </div>
                إضافة مستخدم جديد
              </h2>
              <button onClick={handleClose} className="text-slate-400 hover:text-danger p-1 transition-colors">
                <i className="fas fa-times text-lg"></i>
              </button>
            </div>
            <form onSubmit={handleUserSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">الاسم الأول</label>
                  <input type="text" required className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">اسم العائلة</label>
                  <input type="text" required className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all" />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">البريد الإلكتروني الجامعي</label>
                <div className="relative">
                  <i className="fas fa-envelope absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
                  <input type="email" required className="w-full pr-10 pl-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all text-left dir-ltr" placeholder="user@university.edu" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">الدور والصلاحية</label>
                <select className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all appearance-none cursor-pointer">
                  <option value="STUDENT">طالب (Student)</option>
                  <option value="TEACHER">عضو هيئة تدريس (Teacher)</option>
                  <option value="ADMIN">مدير نظام (Admin)</option>
                </select>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 mt-6">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-5 py-2.5 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl font-bold text-white bg-primary hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 flex items-center gap-2"
                >
                  إضافة وإرسال دعوة <i className="fas fa-paper-plane text-sm"></i>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
