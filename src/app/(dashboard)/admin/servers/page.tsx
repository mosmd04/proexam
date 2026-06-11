"use client";

import React, { useState, useEffect } from "react";

import { getServerStats } from "@/app/actions/serverStats";

export default function ServersPage() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [stats, setStats] = useState({
    servers: [] as any[],
    overallCpu: 0,
    overallMemory: 0
  });

  const loadStats = async () => {
    setIsRefreshing(true);
    try {
      const data = await getServerStats();
      setStats(data);
    } catch(e) {}
    setIsRefreshing(false);
  };

  useEffect(() => {
    loadStats();
    const interval = setInterval(loadStats, 5000); // refresh every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const handleManualRefresh = () => {
    loadStats();
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case "online": return "bg-emerald-500";
      case "warning": return "bg-amber-500 animate-pulse";
      case "offline": return "bg-red-500";
      default: return "bg-slate-500";
    }
  };

  const getProgressColor = (value: number) => {
    if (value >= 90) return "bg-red-500";
    if (value >= 75) return "bg-amber-500";
    return "bg-primary";
  };

  return (
    <main className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header & Actions */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">
              <i className="fas fa-server text-primary"></i>
              حالة الخوادم والأداء
            </h1>
            <p className="text-slate-500 mt-1 text-sm">مراقبة حية لاستهلاك الموارد وحالة العقد (Nodes) في النظام</p>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <button 
              onClick={handleManualRefresh}
              disabled={isRefreshing}
              className="flex-1 md:flex-none px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold text-sm hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-70"
            >
              <i className={`fas fa-sync-alt ${isRefreshing ? 'fa-spin text-primary' : ''}`}></i>
              تحديث البيانات
            </button>
            <button className="flex-1 md:flex-none px-4 py-2.5 bg-slate-800 text-white rounded-xl font-bold text-sm hover:bg-slate-900 transition-all flex items-center justify-center gap-2 shadow-md">
              <i className="fas fa-terminal"></i>
              Console
            </button>
          </div>
        </div>

        {/* Global Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <p className="text-slate-500 font-bold text-xs uppercase tracking-wider">الاستهلاك الكلي للمعالج</p>
              <i className="fas fa-microchip text-slate-400"></i>
            </div>
            <p className="text-3xl font-black text-slate-800" dir="ltr">{stats.overallCpu}%</p>
            <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
              <div className="bg-primary h-full rounded-full transition-all duration-1000" style={{ width: `${stats.overallCpu}%` }}></div>
            </div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <p className="text-slate-500 font-bold text-xs uppercase tracking-wider">الاستهلاك الكلي للذاكرة</p>
              <i className="fas fa-memory text-slate-400"></i>
            </div>
            <p className="text-3xl font-black text-slate-800" dir="ltr">{stats.overallMemory}%</p>
            <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
              <div className="bg-amber-500 h-full rounded-full transition-all duration-1000" style={{ width: `${stats.overallMemory}%` }}></div>
            </div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <p className="text-slate-500 font-bold text-xs uppercase tracking-wider">سعة التخزين المستخدمة</p>
              <i className="fas fa-hdd text-slate-400"></i>
            </div>
            <p className="text-3xl font-black text-slate-800" dir="ltr">50%</p>
            <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
              <div className="bg-emerald-500 h-full rounded-full transition-all duration-1000" style={{ width: '50%' }}></div>
            </div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <p className="text-slate-500 font-bold text-xs uppercase tracking-wider">الخوادم النشطة</p>
              <i className="fas fa-network-wired text-slate-400"></i>
            </div>
            <p className="text-3xl font-black text-slate-800" dir="ltr">{stats.servers.filter(s => s.status === 'online').length} / {stats.servers.length}</p>
            {stats.servers.some(s => s.status !== 'online') ? (
              <p className="text-xs font-medium text-danger mt-3">يوجد خوادم خارج الخدمة</p>
            ) : (
              <p className="text-xs font-medium text-emerald-500 mt-3">جميع الخوادم تعمل بكفاءة</p>
            )}
          </div>
        </div>

        {/* Server Nodes List */}
        <div className="space-y-4">
          <h2 className="font-bold text-lg text-slate-800 mb-2">تفاصيل العقد (Nodes)</h2>
          
          <div className="grid grid-cols-1 gap-4">
            {stats.servers.map((server) => (
              <div key={server.id} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-col lg:flex-row items-center gap-6 transition-all hover:shadow-md">
                
                {/* Info Section */}
                <div className="flex items-center gap-4 w-full lg:w-1/3">
                  <div className="relative shrink-0">
                    <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-600 text-xl">
                      <i className="fas fa-server"></i>
                    </div>
                    <span className={`absolute -top-1 -right-1 w-3.5 h-3.5 border-2 border-white rounded-full ${getStatusColor(server.status)}`}></span>
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800">{server.name}</h3>
                    <p className="text-xs text-slate-500 font-medium" dir="ltr">{server.id} • {server.uptime}</p>
                  </div>
                </div>

                {/* Metrics Section */}
                <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-3 gap-6">
                  {/* CPU */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-bold text-slate-500">CPU</span>
                      <span className="text-xs font-bold text-slate-700" dir="ltr">{server.cpu}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all duration-1000 ${getProgressColor(server.cpu)}`} style={{ width: `${server.cpu}%` }}></div>
                    </div>
                  </div>
                  
                  {/* RAM */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-bold text-slate-500">RAM</span>
                      <span className="text-xs font-bold text-slate-700" dir="ltr">{server.memory}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all duration-1000 ${getProgressColor(server.memory)}`} style={{ width: `${server.memory}%` }}></div>
                    </div>
                  </div>
                  
                  {/* Disk */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-bold text-slate-500">Disk</span>
                      <span className="text-xs font-bold text-slate-700" dir="ltr">{server.disk}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all duration-1000 ${getProgressColor(server.disk)}`} style={{ width: `${server.disk}%` }}></div>
                    </div>
                  </div>
                </div>

                {/* Actions Section */}
                <div className="flex items-center gap-2 w-full lg:w-auto shrink-0 justify-end">
                  <button className="w-10 h-10 rounded-xl bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors flex items-center justify-center" title="إعدادات الخادم">
                    <i className="fas fa-cog"></i>
                  </button>
                  {server.status === 'offline' ? (
                    <button className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors flex items-center justify-center" title="تشغيل">
                      <i className="fas fa-play"></i>
                    </button>
                  ) : (
                    <button className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 hover:bg-amber-100 transition-colors flex items-center justify-center" title="إعادة تشغيل">
                      <i className="fas fa-redo-alt"></i>
                    </button>
                  )}
                </div>

              </div>
            ))}
          </div>
        </div>

      </div>
    </main>
  );
}
