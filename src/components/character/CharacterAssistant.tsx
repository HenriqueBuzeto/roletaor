"use client";

import React, { useRef, useEffect } from "react";
import { useWheelStore } from "@/store/useWheelStore";

interface CharacterAssistantProps {
  className?: string;
}

export const CharacterAssistant: React.FC<CharacterAssistantProps> = ({ className = "" }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const status = useWheelStore((state) => state.status);
  const rotation = useWheelStore((state) => state.settings.orientationRotation || 0);
  const isRotated = rotation === 90 || rotation === 270;

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (status === "spinning") {
      video.currentTime = 0;
      video.play().catch(() => {});
    } else if (status === "celebrating") {
      if (video.currentTime < 8) {
        video.currentTime = 8;
      }
      video.play().catch(() => {});
    } else if (status === "idle") {
      video.pause();
      video.currentTime = 0;
    }
  }, [status]);

  // Suporte a iOS / Safari: remoção de fundo preto através de processamento em Canvas
  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    let animId: number;

    const renderFrame = () => {
      if (!video.paused && !video.ended && video.readyState >= 2) {
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (ctx) {
          if (canvas.width !== video.videoWidth && video.videoWidth > 0) {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
          }

          if (canvas.width > 0 && canvas.height > 0) {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const frame = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = frame.data;
            const len = data.length;

            // Remove fundo preto sólido que o WebM Safari/iOS renderiza
            for (let i = 0; i < len; i += 4) {
              const r = data[i];
              const g = data[i + 1];
              const b = data[i + 2];
              // Se os canais forem pretos ou quase pretos (< 15)
              if (r < 18 && g < 18 && b < 18) {
                data[i + 3] = 0; // Torna transparente
              }
            }
            ctx.putImageData(frame, 0, 0);
          }
        }
      }
      animId = requestAnimationFrame(renderFrame);
    };

    animId = requestAnimationFrame(renderFrame);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, []);

  const sizeClasses = isRotated
    ? "h-[45vw] sm:h-[50vw] md:h-[54vw] max-h-[70vh] min-h-[200px]"
    : "h-[32vh] xs:h-[38vh] sm:h-[50vh] md:h-[60vh] xl:h-[72vh] 2xl:h-[76vh] max-h-[760px] min-h-[190px] xs:min-h-[240px] sm:min-h-[340px] xl:min-h-[460px]";

  return (
    <div
      className={`relative flex items-end justify-center select-none pointer-events-none ${className}`}
    >
      {/* Sombra de chão alaranjada discreta e natural */}
      <div className="absolute bottom-2 w-3/4 h-8 bg-orange-600/25 blur-2xl rounded-full -z-10" />

      {/* Vídeo de origem (invisível na tela, processado pelo canvas) */}
      <video
        ref={videoRef}
        src="/renata.webm"
        playsInline
        muted
        autoPlay
        preload="auto"
        className="hidden"
      />

      {/* Canvas com transparência nativa universal perfeita em Safari, iOS, Chrome e Android */}
      <canvas
        ref={canvasRef}
        className={`w-auto object-contain drop-shadow-none ${sizeClasses}`}
        style={{
          clipPath: "inset(2px 3px 2px 3px)",
        }}
      />
    </div>
  );
};
