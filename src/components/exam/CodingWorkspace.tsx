"use client";

import React, { useState, useEffect, useRef } from "react";

interface CodingWorkspaceProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
}

export default function CodingWorkspace({ 
  value, 
  onChange, 
  placeholder = "اكتب الكود البرمجي هنا (اكتب دالتك أو استعلامك)..." 
}: CodingWorkspaceProps) {
  const [language, setLanguage] = useState("javascript");
  const [fontSize, setFontSize] = useState(14);
  const [lineCount, setLineCount] = useState(1);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);

  // Sync scroll position between textarea and line numbers sidebar
  const handleScroll = () => {
    if (textareaRef.current && lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  // Keep track of total lines
  useEffect(() => {
    const lines = value.split("\n").length;
    setLineCount(Math.max(1, lines));
  }, [value]);

  // Support Tab key indentation inside textarea
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;

      // Insert 4 spaces
      const newValue = value.substring(0, start) + "    " + value.substring(end);
      onChange(newValue);

      // Reset selection cursor
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 4;
      }, 0);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden flex flex-col h-80 text-left font-mono" dir="ltr">
      {/* IDE Header Bar */}
      <div className="bg-slate-950 px-4 py-2.5 flex items-center justify-between border-b border-slate-850 select-none">
        
        {/* Editor controls */}
        <div className="flex items-center gap-3">
          {/* OS Window control mock dots */}
          <div className="flex gap-1.5">
            <span className="w-3 h-3 rounded-full bg-rose-500/80 block"></span>
            <span className="w-3 h-3 rounded-full bg-amber-500/80 block"></span>
            <span className="w-3 h-3 rounded-full bg-emerald-500/80 block"></span>
          </div>
          
          <div className="h-4 w-px bg-slate-800 mx-1"></div>
          
          {/* Language indicator selector */}
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="bg-slate-900 border border-slate-800 text-slate-300 text-xs font-bold rounded-lg px-2.5 py-1 outline-none focus:ring-1 focus:ring-primary cursor-pointer hover:bg-slate-850"
          >
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
            <option value="cpp">C++</option>
            <option value="java">Java</option>
            <option value="html">HTML / CSS</option>
            <option value="sql">SQL Query</option>
          </select>
        </div>

        {/* Font size adjusting */}
        <div className="flex items-center gap-2 text-slate-400">
          <button
            type="button"
            onClick={() => setFontSize(prev => Math.max(10, prev - 1))}
            className="w-7 h-7 hover:bg-slate-850 hover:text-white rounded-lg flex items-center justify-center text-sm transition-colors"
            title="تصغير الخط"
          >
            <i className="fas fa-minus text-xs"></i>
          </button>
          <span className="text-xs font-bold text-slate-400 px-1">{fontSize}px</span>
          <button
            type="button"
            onClick={() => setFontSize(prev => Math.min(24, prev + 1))}
            className="w-7 h-7 hover:bg-slate-850 hover:text-white rounded-lg flex items-center justify-center text-sm transition-colors"
            title="تكبير الخط"
          >
            <i className="fas fa-plus text-xs"></i>
          </button>
        </div>
      </div>

      {/* Editor Body */}
      <div className="flex-1 flex overflow-hidden relative bg-[#1E1E1E]">
        {/* Line numbers bar */}
        <div
          ref={lineNumbersRef}
          className="w-12 bg-slate-900/60 text-slate-500 text-right pr-3 pl-1 py-4 select-none overflow-hidden text-xs leading-6 border-r border-slate-800/60 font-mono"
        >
          {Array.from({ length: lineCount }).map((_, idx) => (
            <div key={idx}>{idx + 1}</div>
          ))}
        </div>

        {/* Code Input Textarea */}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onScroll={handleScroll}
          placeholder={placeholder}
          className="flex-1 bg-transparent text-slate-100 p-4 outline-none resize-none font-mono text-xs leading-6 overflow-y-auto w-full h-full text-left"
          style={{
            fontSize: `${fontSize}px`,
            tabSize: 4,
            MozTabSize: 4,
            caretColor: "white"
          }}
          spellCheck={false}
          dir="ltr"
        />
      </div>
    </div>
  );
}
