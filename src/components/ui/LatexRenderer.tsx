"use client";

import React, { useEffect, useState } from "react";

interface LatexRendererProps {
  text: string;
  className?: string;
}

export default function LatexRenderer({ text, className = "" }: LatexRendererProps) {
  const [isKatexLoaded, setIsKatexLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    const checkKatex = () => {
      if (!active) return;
      if ((window as any).katex) {
        setIsKatexLoaded(true);
      } else {
        setTimeout(checkKatex, 150); // retry
      }
    };
    checkKatex();
    return () => {
      active = false;
    };
  }, []);

  if (!text) return null;

  // Fallback to plain text if KaTeX is not loaded yet
  if (!isKatexLoaded) {
    return <span className={className}>{text}</span>;
  }

  const katex = (window as any).katex;

  // Split by block math $$
  const blockParts = text.split("$$");

  return (
    <span className={className}>
      {blockParts.map((blockPart, bIdx) => {
        // Odd indices are block math: $$equation$$
        if (bIdx % 2 !== 0) {
          try {
            const html = katex.renderToString(blockPart, {
              displayMode: true,
              throwOnError: false,
            });
            return (
              <span
                key={`block-${bIdx}`}
                className="block my-3 overflow-x-auto text-center"
                dangerouslySetInnerHTML={{ __html: html }}
              />
            );
          } catch (e) {
            console.error("KaTeX block error:", e);
            return <code key={`block-err-${bIdx}`} className="bg-red-50 text-danger p-1 rounded font-mono">$${blockPart}$$</code>;
          }
        }

        // Even indices are standard text, potentially containing inline math: $equation$
        const inlineParts = blockPart.split("$");
        return (
          <span key={`inline-container-${bIdx}`}>
            {inlineParts.map((inlinePart, iIdx) => {
              // Odd indices are inline math: $equation$
              if (iIdx % 2 !== 0) {
                try {
                  const html = katex.renderToString(inlinePart, {
                    displayMode: false,
                    throwOnError: false,
                  });
                  return (
                    <span
                      key={`inline-${iIdx}`}
                      className="inline-block px-1"
                      dangerouslySetInnerHTML={{ __html: html }}
                    />
                  );
                } catch (e) {
                  console.error("KaTeX inline error:", e);
                  return <code key={`inline-err-${iIdx}`} className="bg-red-50 text-danger px-1 rounded font-mono">${inlinePart}$</code>;
                }
              }

              // Even indices are normal plain text
              return <span key={`text-${iIdx}`}>{inlinePart}</span>;
            })}
          </span>
        );
      })}
    </span>
  );
}
