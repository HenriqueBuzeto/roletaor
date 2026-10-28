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
            ? "h-[45vw] sm:h-[50vw] md:h-[54vw] max-h-[70vh] min-h-[200px]"
            : "h-[34vh] xs:h-[40vh] sm:h-[52vh] md:h-[62vh] xl:h-[72vh] 2xl:h-[76vh] max-h-[760px] min-h-[220px] xs:min-h-[260px] sm:min-h-[360px] xl:min-h-[460px]"
        }`}
        style={{
          clipPath: "inset(2px 3px 2px 3px)",
        }}
      />
    </div>
  );
};
