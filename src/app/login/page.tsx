"use client";

import React, { useState, useActionState, useEffect } from "react";
import { login } from "@/app/actions/auth";

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(login, undefined);
  const [lang, setLang] = useState<"ar" | "en">("ar");
  const [isFading, setIsFading] = useState(false);

  const toggleLang = () => {
    setIsFading(true);
    setTimeout(() => {
      setLang((prev) => (prev === "ar" ? "en" : "ar"));
      setIsFading(false);
    }, 300);
  };

  useEffect(() => {
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  }, [lang]);

  const t = {
    ar: {
      btnLang: "English",
      welcome: "مرحباً بعودتك!",
      desc: "قم بتسجيل الدخول للوصول إلى منظومة الامتحانات",
      student: "طالب",
      teacher: "معلم",
      idLabel: "الرقم الجامعي / البريد الإلكتروني",
      idPlaceholder: "أدخل رقمك الجامعي أو بريدك",
      passLabel: "كلمة المرور",
      forgot: "نسيت كلمة المرور؟",
      remember: "تذكر بيانات الدخول على هذا الجهاز",
      loginBtn: "تسجيل الدخول",
      loginLoading: "جاري الدخول...",
      problem: "تواجه مشكلة في الدخول؟",
      support: "تواصل مع الدعم الفني",
      badge: "الإصدار الجديد 2026",
      title1: "نظام تقييم",
      title2: "ذكي، سريع، وآمن.",
      visualDesc:
        "منصتك المتكاملة لإدارة وتقديم الامتحانات الجامعية. تجربة مستخدم سلسة مصممة خصيصاً لراحة الطالب وكفاءة المعلم.",
      secTitle: "أمان وموثوقية",
      secDesc: "تشفير كامل للبيانات والنتائج",
      copy: "© 2026 منظومة الامتحانات الجامعية. جميع الحقوق محفوظة.",
    },
    en: {
      btnLang: "عربي",
      welcome: "Welcome Back!",
      desc: "Log in to access the examination system",
      student: "Student",
      teacher: "Teacher",
      idLabel: "University ID / Email",
      idPlaceholder: "Enter your ID or Email",
      passLabel: "Password",
      forgot: "Forgot password?",
      remember: "Remember me on this device",
      loginBtn: "Log In",
      loginLoading: "Logging in...",
      problem: "Having trouble logging in?",
      support: "Contact Support",
      badge: "New Release 2026",
      title1: "Assessment System",
      title2: "Smart, Fast, & Secure.",
      visualDesc:
        "Your integrated platform for managing and delivering university exams. A seamless user experience tailored for student comfort and teacher efficiency.",
      secTitle: "Secure & Reliable",
      secDesc: "End-to-end data encryption for results",
      copy: "© 2026 University Exam System. All rights reserved.",
    },
  };

  const currentT = t[lang];

  return (
    <div className={`antialiased min-h-screen relative overflow-x-hidden bg-white selection:bg-indigo-100 selection:text-indigo-900 ${lang === 'en' ? 'font-en' : 'font-sans'}`}>
      
      {/* Custom Styles */}
      <style dangerouslySetInnerHTML={{__html: `
        .bg-pattern { background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E"); }
        .panel-form { transition: transform 1.2s cubic-bezier(0.83, 0, 0.17, 1); right: 0; }
        .panel-visual { transition: transform 1.2s cubic-bezier(0.83, 0, 0.17, 1), clip-path 1.2s cubic-bezier(0.83, 0, 0.17, 1); left: 0; }
        .visual-content { transition: transform 1.2s cubic-bezier(0.83, 0, 0.17, 1); left: 0; width: 50vw; }
        html[dir="rtl"] .panel-form { transform: translateX(0); }
        html[dir="rtl"] .panel-visual { transform: translateX(0); clip-path: polygon(0 0, 100% 0, 90% 100%, 0 100%); }
        html[dir="rtl"] .visual-content { transform: translateX(0); }
        html[dir="rtl"] .arrow-icon { transform: rotate(0deg); }
        html[dir="ltr"] .panel-form { transform: translateX(-50vw); }
        html[dir="ltr"] .panel-visual { transform: translateX(40vw); clip-path: polygon(10% 0, 100% 0, 100% 100%, 0 100%); }
        html[dir="ltr"] .visual-content { transform: translateX(10vw); }
        html[dir="ltr"] .arrow-icon { transform: rotate(180deg); }
        .role-radio:checked + div { background-color: white; color: #4F46E5; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        .fade-out { opacity: 0; }
        .i18n-text { transition: opacity 0.3s ease; }
      `}} />

      <button onClick={toggleLang} className="fixed top-6 left-6 z-50 px-4 py-2 bg-white/50 backdrop-blur-md border border-gray-200 text-gray-800 rounded-full text-sm font-bold shadow-sm transition-all hover:scale-105 hover:bg-white flex items-center gap-2 ltr:right-6 rtl:left-6">
        <i className="fas fa-globe text-primary"></i>
        <span className={`i18n-text ${isFading ? 'fade-out' : ''}`}>{currentT.btnLang}</span>
      </button>

      {/* Form Panel */}
      <div className="panel-form absolute top-0 w-full lg:w-[50vw] h-screen bg-white z-10 flex flex-col justify-center items-center p-8 sm:p-12 overflow-y-auto">
        <div className="w-full max-w-md mt-10 lg:mt-0">
          
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-50 text-primary mb-4 shadow-sm border border-indigo-100">
              <i className="fas fa-graduation-cap text-3xl"></i>
            </div>
            <h1 className={`text-3xl font-extrabold text-gray-800 mb-2 i18n-text ${isFading ? 'fade-out' : ''}`}>{currentT.welcome}</h1>
            <p className={`text-gray-500 font-medium i18n-text ${isFading ? 'fade-out' : ''}`}>{currentT.desc}</p>
          </div>

          <form action={formAction} className="space-y-6">
            
            <div className="bg-gray-100 p-1 rounded-xl flex items-center mb-6">
              <label className="flex-1 text-center cursor-pointer relative">
                <input type="radio" name="user_role" value="student" className="role-radio sr-only" defaultChecked />
                <div className="py-2.5 rounded-lg text-sm font-bold text-gray-500 transition-all duration-200">
                  <i className="fas fa-user-graduate rtl:ml-1 ltr:mr-1"></i> 
                  <span className={`i18n-text ${isFading ? 'fade-out' : ''}`}>{currentT.student}</span>
                </div>
              </label>
              <label className="flex-1 text-center cursor-pointer relative">
                <input type="radio" name="user_role" value="teacher" className="role-radio sr-only" />
                <div className="py-2.5 rounded-lg text-sm font-bold text-gray-500 transition-all duration-200">
                  <i className="fas fa-chalkboard-teacher rtl:ml-1 ltr:mr-1"></i> 
                  <span className={`i18n-text ${isFading ? 'fade-out' : ''}`}>{currentT.teacher}</span>
                </div>
              </label>
            </div>

            <div>
              <label className={`block text-sm font-bold text-gray-700 mb-2 i18n-text ${isFading ? 'fade-out' : ''}`}>{currentT.idLabel}</label>
              <div className="relative">
                <div className="absolute inset-y-0 rtl:right-0 ltr:left-0 flex items-center rtl:pr-4 ltr:pl-4 pointer-events-none text-gray-400">
                  <i className="fas fa-id-card"></i>
                </div>
                <input 
                  type="text" 
                  name="email" 
                  placeholder={currentT.idPlaceholder} 
                  className={`w-full rtl:pr-11 rtl:pl-4 ltr:pl-11 ltr:pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors shadow-sm i18n-text ${isFading ? 'fade-out' : ''}`}
                  required 
                />
              </div>
              {state?.errors?.email && (
                <p className="text-danger text-xs font-bold mt-2">{state.errors.email[0]}</p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className={`block text-sm font-bold text-gray-700 i18n-text ${isFading ? 'fade-out' : ''}`}>{currentT.passLabel}</label>
                <a href="#" onClick={(e) => { e.preventDefault(); alert('يرجى التواصل مع إدارة الكلية أو الجامعة لإعادة تعيين كلمة المرور الخاصة بك.'); }} className={`text-xs font-bold text-primary hover:text-indigo-700 transition-colors i18n-text ${isFading ? 'fade-out' : ''}`}>{currentT.forgot}</a>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 rtl:right-0 ltr:left-0 flex items-center rtl:pr-4 ltr:pl-4 pointer-events-none text-gray-400">
                  <i className="fas fa-lock"></i>
                </div>
                <input 
                  type="password" 
                  name="password"
                  placeholder="••••••••" 
                  className="w-full rtl:pr-11 rtl:pl-12 ltr:pl-11 ltr:pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors shadow-sm" 
                  required 
                />
                <button type="button" className="absolute inset-y-0 rtl:left-0 ltr:right-0 flex items-center rtl:pl-4 ltr:pr-4 text-gray-400 hover:text-gray-600 transition-colors">
                  <i className="far fa-eye"></i>
                </button>
              </div>
              {state?.errors?.password && (
                <p className="text-danger text-xs font-bold mt-2">{state.errors.password[0]}</p>
              )}
            </div>

            <div className="flex items-center">
              <input type="checkbox" id="remember" className="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary cursor-pointer" />
              <label htmlFor="remember" className={`rtl:mr-2 ltr:ml-2 text-sm text-gray-600 font-medium cursor-pointer i18n-text ${isFading ? 'fade-out' : ''}`}>{currentT.remember}</label>
            </div>

            {state?.message && (
              <div className="p-3 bg-red-50 border border-red-200 text-danger rounded-xl text-sm font-bold text-center">
                {state.message}
              </div>
            )}

            <button type="submit" disabled={isPending} className="w-full bg-primary hover:bg-indigo-700 disabled:opacity-70 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-indigo-200 transition-all duration-200 flex items-center justify-center gap-2 group">
              {isPending ? (
                <>
                  <i className="fas fa-circle-notch fa-spin"></i>
                  <span className={`i18n-text ${isFading ? 'fade-out' : ''}`}>{currentT.loginLoading}</span>
                </>
              ) : (
                <>
                  <span className={`i18n-text ${isFading ? 'fade-out' : ''}`}>{currentT.loginBtn}</span>
                  <i className="fas fa-arrow-left arrow-icon transition-transform transform group-hover:rtl:-translate-x-1 group-hover:ltr:translate-x-1 text-sm"></i>
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className={`text-sm text-gray-500 i18n-text ${isFading ? 'fade-out' : ''}`}>
              <span>{currentT.problem}</span> <a href="#" onClick={(e) => { e.preventDefault(); alert('للتواصل مع الدعم الفني:\nالبريد الإلكتروني: support@proexam.com\nالهاتف: +966-XX-XXX-XXXX'); }} className="text-primary font-bold hover:underline">{currentT.support}</a>
            </p>
          </div>
        </div>
      </div>

      {/* Visual Panel */}
      <div className="panel-visual hidden lg:block lg:w-[60vw] h-screen absolute top-0 bg-dark z-20 pointer-events-none">
        <div className="w-full h-full relative pointer-events-auto">
          
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-dark to-dark opacity-90 z-0"></div>
          <div className="absolute inset-0 bg-pattern z-0 opacity-20"></div>

          <div className="absolute -top-24 ltr:-right-24 rtl:-left-24 w-96 h-96 bg-primary rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
          <div className="absolute -bottom-24 ltr:-left-24 rtl:-right-24 w-96 h-96 bg-secondary rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>

          <div className="visual-content absolute top-0 bottom-0 p-12 flex flex-col justify-center pointer-events-auto">
            <div className="max-w-md mx-auto relative z-10 w-full px-6">
              
              <div className="mb-12">
                <span className="inline-block px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-sm font-bold mb-6 flex items-center gap-2 w-max">
                  <i className="fas fa-sparkles text-yellow-400"></i>
                  <span className={`i18n-text ${isFading ? 'fade-out' : ''}`}>{currentT.badge}</span>
                </span>
                <h2 className="text-4xl lg:text-5xl font-extrabold text-white leading-tight mb-6">
                  <span className={`i18n-text ${isFading ? 'fade-out' : ''}`}>{currentT.title1}</span> <br/>
                  <span className={`text-transparent bg-clip-text bg-gradient-to-l from-indigo-400 to-emerald-400 i18n-text ${isFading ? 'fade-out' : ''}`}>{currentT.title2}</span>
                </h2>
                <p className={`text-gray-300 text-lg leading-relaxed max-w-md font-medium i18n-text ${isFading ? 'fade-out' : ''}`}>
                  {currentT.visualDesc}
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-2xl">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                    <i className="fas fa-shield-alt text-xl"></i>
                  </div>
                  <div>
                    <h3 className={`text-white font-bold i18n-text ${isFading ? 'fade-out' : ''}`}>{currentT.secTitle}</h3>
                    <p className={`text-gray-400 text-sm mt-0.5 i18n-text ${isFading ? 'fade-out' : ''}`}>{currentT.secDesc}</p>
                  </div>
                </div>
                <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden mt-2">
                  <div className="bg-gradient-to-l from-emerald-400 to-emerald-600 w-full h-full rounded-full"></div>
                </div>
              </div>

            </div>

            <div className="absolute bottom-8 rtl:left-12 ltr:right-12 w-full text-center lg:text-start max-w-md mx-auto px-6">
              <p className={`text-gray-500 text-sm font-medium i18n-text ${isFading ? 'fade-out' : ''}`}>
                {currentT.copy}
              </p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
