"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";

export function ComingSoonButton({
  children,
  className,
  as = "button",
  featureName = "هذه الخاصية",
  title,
}: {
  children: React.ReactNode;
  className?: string;
  as?: "button" | "a";
  featureName?: string;
  title?: string;
}) {
  const [showToast, setShowToast] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const Toast = () => {
    if (!showToast) return null;
    
    // Using portal to ensure it stays on top of everything without overflow issues
    return createPortal(
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-bottom-5 fade-in duration-300 w-[90%] max-w-sm">
        <div className="bg-slate-900/95 backdrop-blur-md text-white p-4 rounded-2xl shadow-2xl flex items-center gap-4 border border-slate-700">
          <div className="w-10 h-10 bg-primary/20 text-indigo-400 rounded-full flex items-center justify-center shrink-0">
            <i className="fas fa-tools"></i>
          </div>
          <div className="flex-1">
            <p className="font-bold text-sm text-white">{featureName} قيد التطوير</p>
            <p className="text-xs text-slate-400 mt-0.5 leading-tight">
              نعمل على إضافة هذه الميزة قريباً لتقديم تجربة أفضل لك.
            </p>
          </div>
        </div>
      </div>,
      document.body
    );
  };

  if (as === "a") {
    return (
      <>
        <a href="#" onClick={handleClick} className={className} title={title}>
          {children}
        </a>
        <Toast />
      </>
    );
  }

  return (
    <>
      <button onClick={handleClick} className={className} title={title}>
        {children}
      </button>
      <Toast />
    </>
  );
}
