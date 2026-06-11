"use client";

import React, { useState } from "react";

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState<string>("general");

  // Tab definitions
  const tabs = [
    { id: "general", label: "إعدادات عامة", icon: "fas fa-sliders-h" },
    { id: "security", label: "الأمان والخصوصية", icon: "fas fa-shield-alt" },
    { id: "exams", label: "سياسات الامتحانات", icon: "fas fa-gavel" },
    { id: "notifications", label: "البريد والإشعارات", icon: "fas fa-envelope-open-text" },
    { id: "appearance", label: "المظهر والهوية", icon: "fas fa-paint-roller" },
    { id: "api", label: "الربط البرمجي (API)", icon: "fas fa-plug" },
  ];

  // ==========================================
  // Form State Configuration
  // ==========================================

  // Tab 1: General
  const [systemName, setSystemName] = useState("منصة ProExam");
  const [systemEmail, setSystemEmail] = useState("admin@proexam.edu");
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  // Tab 3: Exam Policies states
  const [kioskMode, setKioskMode] = useState<boolean>(true);
  const [clipboardRestriction, setClipboardRestriction] = useState<boolean>(true);
  const [faceTracking, setFaceTracking] = useState<boolean>(true);
  const [audioMonitoring, setAudioMonitoring] = useState<boolean>(false);
  const [autoPublish, setAutoPublish] = useState<boolean>(true);
  const [reviewPolicy, setReviewPolicy] = useState<string>("after_approval");

  // Tab 2: Security & Privacy states
  const [twoFactor, setTwoFactor] = useState<boolean>(true);
  const [passwordStrength, setPasswordStrength] = useState<boolean>(true);
  const [maxAttempts, setMaxAttempts] = useState<string>("5");
  const [preventConcurrent, setPreventConcurrent] = useState<boolean>(true);
  const [idleTimeout, setIdleTimeout] = useState<string>("30");
  const [ipWhitelisting, setIpWhitelisting] = useState<boolean>(false);
  const [ipWhitelistText, setIpWhitelistText] = useState<string>("");

  // Tab 4: Notifications
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);

  // Tab 5: Appearance
  const [primaryColor, setPrimaryColor] = useState("#4f46e5");
  const [darkModeDefault, setDarkModeDefault] = useState(false);

  // Tab 6: API
  const [apiEnabled, setApiEnabled] = useState(true);

  const [saveToast, setSaveToast] = useState(false);

  // Handler for saving settings (simulated)
  const handleSave = () => {
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 3000);
  };

  // Handler for resetting settings (simulated)
  const handleReset = () => {
    if (confirm("هل أنت متأكد من استعادة الإعدادات الافتراضية؟")) {
      if (activeTab === "general") {
        setSystemName("منصة ProExam");
        setSystemEmail("admin@proexam.edu");
        setMaintenanceMode(false);
      } else if (activeTab === "exams") {
        setKioskMode(true);
        setClipboardRestriction(true);
        setFaceTracking(true);
        setAudioMonitoring(false);
        setAutoPublish(true);
        setReviewPolicy("after_approval");
      } else if (activeTab === "security") {
        setTwoFactor(true);
        setPasswordStrength(true);
        setMaxAttempts("5");
        setPreventConcurrent(true);
        setIdleTimeout("30");
        setIpWhitelisting(false);
        setIpWhitelistText("");
      } else if (activeTab === "notifications") {
        setEmailNotifications(true);
        setSmsNotifications(false);
      } else if (activeTab === "appearance") {
        setPrimaryColor("#4f46e5");
        setDarkModeDefault(false);
      } else if (activeTab === "api") {
        setApiEnabled(true);
      }
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50/50">
      {/* Sub Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shrink-0 shadow-sm z-10">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            إعدادات المنظومة
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            التحكم في القواعد العامة، الأمان، وسياسات النظام
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-white border border-slate-300 text-slate-600 hover:text-danger hover:border-red-200 hover:bg-red-50 rounded-xl text-sm font-bold transition-colors flex items-center gap-2"
          >
            <i className="fas fa-undo-alt"></i> استعادة الافتراضي
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 overflow-hidden p-6">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row h-full gap-6">
          
          {/* Settings Sidebar Menu (Aside) */}
          <aside className="w-full lg:w-72 bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col shrink-0 overflow-hidden h-fit">
            <div className="p-4 border-b border-slate-100 bg-slate-50/50 shrink-0">
              <h3 className="font-bold text-slate-800">أقسام الإعدادات</h3>
            </div>

            <div className="py-2 flex flex-col">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 px-5 py-3.5 text-sm transition-colors text-right border-r-3 ${
                    activeTab === tab.id
                      ? "settings-tab-active border-primary font-bold bg-indigo-50/50 text-primary"
                      : "text-slate-600 hover:bg-slate-50 border-transparent font-medium"
                  }`}
                >
                  <i className={`${tab.icon} text-lg w-5 text-center ${activeTab === tab.id ? "text-primary" : "text-slate-400"}`}></i>
                  {tab.label}
                </button>
              ))}
            </div>
          </aside>

          {/* Settings Content Panel (Section) */}
          <section className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col h-full overflow-hidden relative">
            
            {activeTab === "general" && (
              <>
                <div className="p-6 border-b border-slate-100 bg-white shrink-0">
                  <h2 className="text-xl font-bold text-slate-800">إعدادات عامة</h2>
                  <p className="text-sm text-slate-500 mt-1">
                    الإعدادات الأساسية للمنظومة مثل الاسم، البريد، وحالة الصيانة.
                  </p>
                </div>
                <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-slate-50/30">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 mb-4 uppercase tracking-wider flex items-center gap-2">
                      <i className="fas fa-info-circle text-primary"></i> معلومات النظام
                    </h3>
                    <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm space-y-4">
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">اسم المنظومة</label>
                        <input type="text" value={systemName} onChange={e => setSystemName(e.target.value)} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary" />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">البريد الإلكتروني للرد الآلي</label>
                        <input type="email" value={systemEmail} onChange={e => setSystemEmail(e.target.value)} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary text-left" dir="ltr" />
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 mb-4 uppercase tracking-wider flex items-center gap-2">
                      <i className="fas fa-tools text-primary"></i> الصيانة والتوقف
                    </h3>
                    <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-slate-800 text-sm">تفعيل وضع الصيانة</h4>
                        <p className="text-xs text-slate-500 mt-1">عند التفعيل لن يتمكن أحد سوى المدراء من الدخول للنظام.</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer shrink-0">
                        <input type="checkbox" className="sr-only peer" checked={maintenanceMode} onChange={e => setMaintenanceMode(e.target.checked)} />
                        <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-danger"></div>
                      </label>
                    </div>
                  </div>
                </div>
              </>
            )}

            {activeTab === "exams" && (
              <>
                <div className="p-6 border-b border-slate-100 bg-white shrink-0">
                  <h2 className="text-xl font-bold text-slate-800">سياسات الامتحانات</h2>
                  <p className="text-sm text-slate-500 mt-1">
                    إعداد القواعد العامة للمراقبة، أمان المتصفحات، وضوابط عرض النتائج للطلاب.
                  </p>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-slate-50/30">
                  {/* Secure Browser */}
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 mb-4 uppercase tracking-wider flex items-center gap-2">
                      <i className="fas fa-laptop-code text-primary"></i> بيئة الامتحان الآمنة (Secure Browser)
                    </h3>

                    <div className="bg-white rounded-xl border border-slate-100 shadow-sm divide-y divide-slate-100">
                      <div className="p-5 flex items-center justify-between hover:bg-slate-50 transition-colors">
                        <div>
                          <h4 className="font-bold text-slate-800 text-sm">الوضع الآمن الإجباري للنافذة (Kiosk Mode)</h4>
                          <p className="text-xs text-slate-500 mt-1">
                            يمنع الطالب من تصغير نافذة الامتحان أو فتح تبويبات جديدة أثناء الحل.
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer shrink-0">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={kioskMode}
                            onChange={(e) => setKioskMode(e.target.checked)}
                          />
                          <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                        </label>
                      </div>

                      <div className="p-5 flex items-center justify-between hover:bg-slate-50 transition-colors">
                        <div>
                          <h4 className="font-bold text-slate-800 text-sm">تعطيل النسخ واللصق (Clipboard Restriction)</h4>
                          <p className="text-xs text-slate-500 mt-1">
                            يمنع استخدام اختصارات الكيبورد (Ctrl+C / Ctrl+V) داخل واجهة الامتحان.
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer shrink-0">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={clipboardRestriction}
                            onChange={(e) => setClipboardRestriction(e.target.checked)}
                          />
                          <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* AI Proctoring */}
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 mb-4 uppercase tracking-wider flex items-center gap-2">
                      <i className="fas fa-video text-primary"></i> المراقبة الذكية بالذكاء الاصطناعي (AI Proctoring)
                    </h3>

                    <div className="bg-white rounded-xl border border-slate-100 shadow-sm divide-y divide-slate-100">
                      <div className="p-5 flex items-center justify-between hover:bg-slate-50 transition-colors">
                        <div>
                          <h4 className="font-bold text-slate-800 text-sm">تتبع حركة العين والوجه (Face Tracking)</h4>
                          <p className="text-xs text-slate-500 mt-1">
                            يقوم النظام بإصدار تنبيه إذا نظر الطالب بعيداً عن الشاشة لفترة طويلة أو ظهر شخص آخر.
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer shrink-0">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={faceTracking}
                            onChange={(e) => setFaceTracking(e.target.checked)}
                          />
                          <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-danger"></div>
                        </label>
                      </div>

                      <div className="p-5 flex items-center justify-between hover:bg-slate-50 transition-colors">
                        <div>
                          <h4 className="font-bold text-slate-800 text-sm">تحليل الصوت (Audio Monitoring)</h4>
                          <p className="text-xs text-slate-500 mt-1">
                            تسجيل أصوات الخلفية وتنبيه المراقب عند رصد أصوات كلام أو همس.
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer shrink-0">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={audioMonitoring}
                            onChange={(e) => setAudioMonitoring(e.target.checked)}
                          />
                          <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-danger"></div>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Results & Grading policies */}
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 mb-4 uppercase tracking-wider flex items-center gap-2">
                      <i className="fas fa-clipboard-check text-primary"></i> سياسات التقييم والنتائج
                    </h3>

                    <div className="bg-white rounded-xl border border-slate-100 shadow-sm divide-y divide-slate-100">
                      <div className="p-5 flex items-center justify-between hover:bg-slate-50 transition-colors">
                        <div>
                          <h4 className="font-bold text-slate-800 text-sm">النشر التلقائي للنتائج (للأسئلة الموضوعية)</h4>
                          <p className="text-xs text-slate-500 mt-1">
                            عرض درجة الامتحان فور تسليم الطالب للإجابات (أسئلة الخيارات المتعددة والصح/الخطأ فقط).
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer shrink-0">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={autoPublish}
                            onChange={(e) => setAutoPublish(e.target.checked)}
                          />
                          <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary"></div>
                        </label>
                      </div>

                      <div className="p-5 flex items-center justify-between hover:bg-slate-50 transition-colors bg-white">
                        <div>
                          <h4 className="font-bold text-slate-800 text-sm">السماح للطلاب بمراجعة أوراقهم</h4>
                          <p className="text-xs text-slate-500 mt-1">السماح بظهور الإجابات الصحيحة والخاطئة للطالب.</p>
                        </div>
                        <div className="shrink-0">
                          <select
                            value={reviewPolicy}
                            onChange={(e) => setReviewPolicy(e.target.value)}
                            className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary outline-none font-bold text-slate-700 cursor-pointer"
                          >
                            <option value="never">عدم السماح مطلقاً</option>
                            <option value="after_exam">بعد انتهاء وقت الامتحان للجميع</option>
                            <option value="after_approval">بعد اعتماد النتيجة من الأستاذ</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {activeTab === "security" && (
              <>
                <div className="p-6 border-b border-slate-100 bg-white shrink-0">
                  <h2 className="text-xl font-bold text-slate-800">الأمان والخصوصية</h2>
                  <p className="text-sm text-slate-500 mt-1">
                    تكوين سياسات تسجيل الدخول، الجلسات النشطة، وقواعد الوصول لضمان حماية بيانات المنظومة.
                  </p>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-slate-50/30">
                  {/* Password & login policies */}
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 mb-4 uppercase tracking-wider flex items-center gap-2">
                      <i className="fas fa-key text-primary"></i> سياسات الدخول وكلمات المرور
                    </h3>

                    <div className="bg-white rounded-xl border border-slate-100 shadow-sm divide-y divide-slate-100">
                      <div className="p-5 flex items-center justify-between hover:bg-slate-50 transition-colors">
                        <div>
                          <h4 className="font-bold text-slate-800 text-sm">المصادقة الثنائية (2FA) للإدارة</h4>
                          <p className="text-xs text-slate-500 mt-1">
                            فرض استخدام تطبيق Google Authenticator على جميع المدراء والمشرفين عند تسجيل الدخول.
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer shrink-0">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={twoFactor}
                            onChange={(e) => setTwoFactor(e.target.checked)}
                          />
                          <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                        </label>
                      </div>

                      <div className="p-5 flex items-center justify-between hover:bg-slate-50 transition-colors">
                        <div>
                          <h4 className="font-bold text-slate-800 text-sm">قوة كلمة المرور (لجميع المستخدمين)</h4>
                          <p className="text-xs text-slate-500 mt-1">
                            يجب أن تحتوي على حروف كبيرة، صغيرة، أرقام ورموز خاصة.
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer shrink-0">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={passwordStrength}
                            onChange={(e) => setPasswordStrength(e.target.checked)}
                          />
                          <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                        </label>
                      </div>

                      <div className="p-5 flex items-center justify-between hover:bg-slate-50 transition-colors bg-white">
                        <div>
                          <h4 className="font-bold text-slate-800 text-sm">الحد الأقصى لمحاولات الدخول الخاطئة</h4>
                          <p className="text-xs text-slate-500 mt-1">
                            يتم قفل الحساب مؤقتاً بعد تخطي هذا العدد من المحاولات الفاشلة.
                          </p>
                        </div>
                        <div className="shrink-0">
                          <select
                            value={maxAttempts}
                            onChange={(e) => setMaxAttempts(e.target.value)}
                            className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary outline-none font-bold text-slate-700 cursor-pointer"
                          >
                            <option value="3">3 محاولات</option>
                            <option value="5">5 محاولات</option>
                            <option value="10">10 محاولات</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Active Sessions */}
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 mb-4 uppercase tracking-wider flex items-center gap-2">
                      <i className="fas fa-clock text-primary"></i> إدارة الجلسات النشطة
                    </h3>

                    <div className="bg-white rounded-xl border border-slate-100 shadow-sm divide-y divide-slate-100">
                      <div className="p-5 flex items-center justify-between hover:bg-slate-50 transition-colors">
                        <div>
                          <h4 className="font-bold text-slate-800 text-sm">منع الدخول المزدوج (Concurrent Logins)</h4>
                          <p className="text-xs text-slate-500 mt-1">
                            يمنع الطالب من تسجيل الدخول من متصفحين أو جهازين مختلفين في نفس الوقت.
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer shrink-0">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={preventConcurrent}
                            onChange={(e) => setPreventConcurrent(e.target.checked)}
                          />
                          <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary"></div>
                        </label>
                      </div>

                      <div className="p-5 flex items-center justify-between hover:bg-slate-50 transition-colors bg-white">
                        <div>
                          <h4 className="font-bold text-slate-800 text-sm">مهلة الجلسة الخاملة (Idle Timeout)</h4>
                          <p className="text-xs text-slate-500 mt-1">
                            يتم تسجيل الخروج تلقائياً إذا لم يقم المستخدم بأي إجراء لفترة محددة.
                          </p>
                        </div>
                        <div className="shrink-0">
                          <select
                            value={idleTimeout}
                            onChange={(e) => setIdleTimeout(e.target.value)}
                            className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary outline-none font-bold text-slate-700 cursor-pointer"
                          >
                            <option value="15">15 دقيقة</option>
                            <option value="30">30 دقيقة</option>
                            <option value="60">ساعة واحدة</option>
                            <option value="never">تعطيل</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Network whitelisting */}
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 mb-4 uppercase tracking-wider flex items-center gap-2">
                      <i className="fas fa-network-wired text-primary"></i> شبكة الاتصال والوصول
                    </h3>

                    <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-bold text-slate-800 text-sm">
                            تقييد دخول الإدارة بعناوين IP محددة (IP Whitelisting)
                          </h4>
                          <label className="relative inline-flex items-center cursor-pointer shrink-0">
                            <input
                              type="checkbox"
                              className="sr-only peer"
                              checked={ipWhitelisting}
                              onChange={(e) => setIpWhitelisting(e.target.checked)}
                            />
                            <div className="w-9 h-5 bg-slate-200 rounded-full peer peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-danger"></div>
                          </label>
                        </div>
                        <p className="text-xs text-slate-500 mb-3">
                          إذا تم تفعيله، لن تتمكن حسابات الـ Super Admin من الدخول إلا من خلال العناوين المدرجة
                          أدناه.
                        </p>

                        <textarea
                          rows={3}
                          value={ipWhitelistText}
                          onChange={(e) => setIpWhitelistText(e.target.value)}
                          disabled={!ipWhitelisting}
                          placeholder="أدخل عناوين IP مفصولة بفاصلة (مثال: 192.168.1.1, 10.0.0.5)"
                          className={`w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all text-slate-800 font-mono ${
                            !ipWhitelisting ? "bg-gray-100 cursor-not-allowed text-gray-400" : "bg-slate-50"
                          }`}
                          dir="ltr"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {activeTab === "notifications" && (
              <>
                <div className="p-6 border-b border-slate-100 bg-white shrink-0">
                  <h2 className="text-xl font-bold text-slate-800">البريد والإشعارات</h2>
                  <p className="text-sm text-slate-500 mt-1">تكوين إعدادات البريد الإلكتروني والرسائل النصية.</p>
                </div>
                <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-slate-50/30">
                  <div className="bg-white rounded-xl border border-slate-100 shadow-sm divide-y divide-slate-100">
                    <div className="p-5 flex items-center justify-between hover:bg-slate-50 transition-colors">
                      <div>
                        <h4 className="font-bold text-slate-800 text-sm">تفعيل إشعارات البريد</h4>
                        <p className="text-xs text-slate-500 mt-1">إرسال التنبيهات والتقارير عبر البريد الإلكتروني.</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer shrink-0">
                        <input type="checkbox" className="sr-only peer" checked={emailNotifications} onChange={e => setEmailNotifications(e.target.checked)} />
                        <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                      </label>
                    </div>
                    <div className="p-5 flex items-center justify-between hover:bg-slate-50 transition-colors">
                      <div>
                        <h4 className="font-bold text-slate-800 text-sm">تفعيل رسائل SMS</h4>
                        <p className="text-xs text-slate-500 mt-1">إرسال رسائل نصية قصيرة للتنبيهات العاجلة.</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer shrink-0">
                        <input type="checkbox" className="sr-only peer" checked={smsNotifications} onChange={e => setSmsNotifications(e.target.checked)} />
                        <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                      </label>
                    </div>
                  </div>
                </div>
              </>
            )}

            {activeTab === "appearance" && (
              <>
                <div className="p-6 border-b border-slate-100 bg-white shrink-0">
                  <h2 className="text-xl font-bold text-slate-800">المظهر والهوية</h2>
                  <p className="text-sm text-slate-500 mt-1">تخصيص ألوان وشعارات المنظومة.</p>
                </div>
                <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-slate-50/30">
                  <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm space-y-4">
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm mb-2">اللون الرئيسي (Primary Color)</h4>
                      <input type="color" value={primaryColor} onChange={e => setPrimaryColor(e.target.value)} className="w-12 h-12 p-1 bg-white border border-slate-200 rounded cursor-pointer" />
                    </div>
                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-slate-800 text-sm">الوضع الليلي الافتراضي</h4>
                        <p className="text-xs text-slate-500 mt-1">تفعيل الوضع المظلم كخيار افتراضي للجميع.</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer shrink-0">
                        <input type="checkbox" className="sr-only peer" checked={darkModeDefault} onChange={e => setDarkModeDefault(e.target.checked)} />
                        <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-slate-800"></div>
                      </label>
                    </div>
                  </div>
                </div>
              </>
            )}

            {activeTab === "api" && (
              <>
                <div className="p-6 border-b border-slate-100 bg-white shrink-0">
                  <h2 className="text-xl font-bold text-slate-800">الربط البرمجي (API)</h2>
                  <p className="text-sm text-slate-500 mt-1">إدارة مفاتيح الربط البرمجي والخدمات الخارجية.</p>
                </div>
                <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-slate-50/30">
                  <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm">تفعيل الربط البرمجي (API Access)</h4>
                      <p className="text-xs text-slate-500 mt-1">السماح للتطبيقات الخارجية بالوصول للبيانات عبر الـ API.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer shrink-0">
                      <input type="checkbox" className="sr-only peer" checked={apiEnabled} onChange={e => setApiEnabled(e.target.checked)} />
                      <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                    </label>
                  </div>
                </div>
              </>
            )}

            {/* Bottom floating save bar */}
            <div className="p-4 border-t border-slate-200 bg-white shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] flex items-center justify-between z-10 shrink-0">
              <p className="text-xs text-slate-500 font-medium">
                آخر تعديل: اليوم، 11:45 صباحاً بواسطة <span className="font-bold text-slate-700">عمر مصطفى</span>
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleReset}
                  className="px-5 py-2.5 bg-white border border-slate-300 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-50 transition-colors"
                >
                  إلغاء التغييرات
                </button>
                <button
                  onClick={handleSave}
                  className="px-6 py-2.5 bg-primary hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-md shadow-indigo-200 transition-colors flex items-center gap-2"
                >
                  <i className="fas fa-save"></i> حفظ الإعدادات
                </button>
              </div>
            </div>
          </section>

        </div>
      </main>
      
      {/* Save Toast Notification */}
      {saveToast && (
        <div className="fixed bottom-6 left-6 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
          <div className="bg-slate-800 text-white px-6 py-3 rounded-2xl shadow-xl flex items-center gap-3">
            <div className="w-8 h-8 bg-success/20 text-success rounded-full flex items-center justify-center">
              <i className="fas fa-check"></i>
            </div>
            <div>
              <p className="font-bold text-sm">تم الحفظ بنجاح</p>
              <p className="text-xs text-slate-300">تم تحديث تفضيلات النظام بشكل آمن.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
