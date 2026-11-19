"use client";

import React, { useRef, useEffect } from "react";
import { useWheelStore } from "@/store/useWheelStore";

interface CharacterAssistantProps {
  className?: string;
}

export const CharacterAssistant: React.FC<CharacterAssistantProps> = ({ className = "" }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
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

  return (
    <div
      className={`relative flex items-end justify-center select-none pointer-events-none ${className}`}
    >
      {/* Sombra de chão alaranjada discreta e natural */}
      <div className="absolute bottom-2 w-3/4 h-8 bg-orange-600/25 blur-2xl rounded-full -z-10" />

      {/* Vídeo da personagem Renata: direto, rápido e com mix-blend-mode para mesclar bordas */}
      <video
        ref={videoRef}
        src="/renata.webm"
        playsInline
        muted
        autoPlay
        preload="auto"
        className={`w-auto object-contain drop-shadow-none ${
          isRotated
            ? "h-[min(68vw,74vh,700px)] min-h-[280px]"
            : "h-[min(48vh,420px)] sm:h-[min(60vh,540px)] md:h-[min(65vh,600px)] xl:h-[min(72vh,700px)] 2xl:h-[min(78vh,780px)] min-h-[260px]"
        }`}
        style={{
          clipPath: "inset(2px 3px 2px 3px)",
        }}
      />
    </div>
  );
};
