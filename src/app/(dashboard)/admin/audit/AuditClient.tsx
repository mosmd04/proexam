"use client";

import React, { useState } from "react";

export default function AuditClient({ logs }: { logs: any[] }) {
  const [filterType, setFilterType] = useState<"all" | "security" | "system" | "data">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const getLogDetails = (action: string) => {
    if (action.includes("create") || action.includes("add")) {
      return { type: "data", icon: "fa-plus-circle", color: "emerald", label: "إضافة بيانات" };
    }
    if (action.includes("update") || action.includes("edit")) {
      return { type: "data", icon: "fa-edit", color: "indigo", label: "تعديل بيانات" };
    }
    if (action.includes("delete") || action.includes("remove")) {
      return { type: "data", icon: "fa-trash", color: "red", label: "حذف بيانات" };
    }
    if (action.includes("login") || action.includes("auth") || action.includes("violation")) {
      return { type: "security", icon: "fa-shield-alt", color: "red", label: "حدث أمني" };
    }
    return { type: "system", icon: "fa-cogs", color: "slate", label: "حدث نظام" };
  };

  const formatTimeAgo = (date: Date) => {
    const diff = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (diff < 60) return "الآن";
    if (diff < 3600) return `منذ ${Math.floor(diff / 60)} دقيقة`;
    if (diff < 86400) return `منذ ${Math.floor(diff / 3600)} ساعة`;
    return `منذ ${Math.floor(diff / 86400)} يوم`;
  };

  const filteredLogs = logs.filter(log => {
    const details = getLogDetails(log.action);
    const matchesFilter = filterType === "all" || details.type === filterType;
    const searchString = `${log.action} ${log.entityType} ${log.actorName}`.toLowerCase();
    const matchesSearch = searchString.includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <main className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">
              <i className="fas fa-history text-primary"></i>
              سجل العمليات (Audit Log)
            </h1>
            <p className="text-slate-500 mt-1 text-sm">تتبع جميع التغييرات والأنشطة التي حدثت داخل المنظومة بشكل حي وحقيقي</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0">
            <button onClick={() => setFilterType("all")} className={`px-4 py-2 rounded-lg text-sm font-bold shrink-0 transition-colors ${filterType === "all" ? "bg-primary text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
              الجميع
            </button>
            <button onClick={() => setFilterType("security")} className={`px-4 py-2 rounded-lg text-sm font-bold shrink-0 transition-colors ${filterType === "security" ? "bg-red-500 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
              <i className="fas fa-shield-alt ml-1"></i> أمنية
            </button>
            <button onClick={() => setFilterType("system")} className={`px-4 py-2 rounded-lg text-sm font-bold shrink-0 transition-colors ${filterType === "system" ? "bg-indigo-500 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
              <i className="fas fa-cogs ml-1"></i> نظام
            </button>
            <button onClick={() => setFilterType("data")} className={`px-4 py-2 rounded-lg text-sm font-bold shrink-0 transition-colors ${filterType === "data" ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
              <i className="fas fa-database ml-1"></i> بيانات
            </button>
          </div>

          <div className="relative w-full sm:w-72">
            <input 
              type="text" 
              placeholder="ابحث في السجل..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
            <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
          </div>
        </div>

        {/* Timeline Log */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 relative min-h-[400px]">
          <div className="absolute right-[43px] top-6 bottom-6 w-0.5 bg-slate-100 hidden sm:block"></div>
          
          <div className="space-y-8 relative z-10">
            {filteredLogs.map((log) => {
              const details = getLogDetails(log.action);
              const timeAgo = formatTimeAgo(new Date(log.createdAt));

              return (
                <div key={log.id} className="flex gap-4 sm:gap-6 relative z-10 group">
                  <div className={`w-12 h-12 rounded-full border-4 border-white flex items-center justify-center text-lg shrink-0 shadow-sm transition-transform group-hover:scale-110
                    ${details.color === 'emerald' ? 'bg-emerald-50 text-emerald-500' : ''}
                    ${details.color === 'indigo' ? 'bg-indigo-50 text-indigo-500' : ''}
                    ${details.color === 'red' ? 'bg-red-50 text-red-500' : ''}
                    ${details.color === 'slate' ? 'bg-slate-100 text-slate-500' : ''}
                  `}>
                    <i className={`fas ${details.icon}`}></i>
                  </div>
                  
                  <div className="flex-1 bg-slate-50 rounded-xl p-4 border border-slate-100 group-hover:border-primary/20 transition-colors">
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-2 mb-2">
                      <h3 className="font-bold text-slate-800 text-base">{details.label} - {log.entityType}</h3>
                      <span className="text-xs font-bold text-slate-400 bg-white px-2 py-1 rounded border border-slate-100" dir="ltr">{timeAgo}</span>
                    </div>
                    <p className="text-sm text-slate-600 mb-3">
                      Action: {log.action} <br />
                      ID: {log.entityId}
                    </p>
                    <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                      <i className="fas fa-user-circle text-slate-400"></i>
                      <span>بواسطة: {log.actorName}</span>
                    </div>
                  </div>
                </div>
              );
            })}

            {filteredLogs.length === 0 && (
              <div className="text-center py-12 text-slate-500 relative z-10 bg-white">
                <i className="fas fa-inbox text-4xl mb-3 text-slate-300"></i>
                <p>لا توجد سجلات مطابقة للفلتر الحالي</p>
                <p className="text-xs text-slate-400 mt-2">السجل يعرض العمليات الحقيقية من قاعدة البيانات فقط.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </main>
  );
}
