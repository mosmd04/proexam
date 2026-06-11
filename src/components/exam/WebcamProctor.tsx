"use client";

import React, { useEffect, useRef, useState } from 'react';

interface WebcamProctorProps {
  attemptId: string;
}

export default function WebcamProctor({ attemptId }: WebcamProctorProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  useEffect(() => {
    let stream: MediaStream | null = null;

    const startWebcam = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setHasPermission(true);
      } catch (err) {
        console.error("Webcam permission denied or error:", err);
        setHasPermission(false);
        // Fire telemetry for missing/denied camera
        await fetch('/api/proctoring/log', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            attemptId,
            violationType: 'WEBCAM_FACE_NOT_DETECTED',
            severity: 'HIGH',
            details: { reason: "Camera access denied or device not found" }
          })
        });
      }
    };

    startWebcam();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [attemptId]);

  return (
    <div className="fixed bottom-4 left-4 w-32 h-24 bg-black rounded-lg overflow-hidden border-2 border-slate-700 shadow-xl opacity-50 hover:opacity-100 transition-opacity z-50">
      <video 
        ref={videoRef} 
        autoPlay 
        playsInline 
        muted 
        className="w-full h-full object-cover"
      />
      {hasPermission === false && (
        <div className="absolute inset-0 flex items-center justify-center text-xs text-red-500 font-bold bg-black/80 text-center p-1 leading-snug">
          الكاميرا<br/>معطلة
        </div>
      )}
    </div>
  );
}
