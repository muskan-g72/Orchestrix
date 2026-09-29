"use client";

import React, { useEffect, useRef } from "react";

export function AuroraBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // Respect prefers-reduced-motion
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mediaQuery.matches) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize);

    // Max 150 subtle particles as specified
    const PARTICLE_COUNT = Math.min(120, Math.floor(window.innerWidth / 15));
    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      alpha: number;
      color: string;
    }> = [];

    const colors = [
      "rgba(124, 92, 255, ", // violet
      "rgba(34, 211, 238, ",  // cyan
      "rgba(94, 234, 212, ",  // mint
      "rgba(255, 255, 255, ", // white
    ];

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        radius: Math.random() * 1.5 + 0.5,
        alpha: Math.random() * 0.35 + 0.1,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }

    let isVisible = true;
    const observer = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting;
    });
    observer.observe(canvas);

    const render = () => {
      if (!isVisible) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }

      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = width;
        else if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        else if (p.y > height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color}${p.alpha})`;
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
      observer.disconnect();
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
      {/* Aurora blurred drifting blobs */}
      <div
        className="absolute -top-[20%] -left-[10%] w-[60vw] h-[60vw] rounded-full blur-[140px] opacity-25 animate-aurora-1"
        style={{
          background: "radial-gradient(circle, #7C5CFF 0%, rgba(124, 92, 255, 0.1) 70%, transparent 100%)",
        }}
      />
      <div
        className="absolute top-[20%] -right-[15%] w-[55vw] h-[55vw] rounded-full blur-[150px] opacity-20 animate-aurora-2"
        style={{
          background: "radial-gradient(circle, #22D3EE 0%, rgba(34, 211, 238, 0.1) 70%, transparent 100%)",
        }}
      />
      <div
        className="absolute top-[55%] left-[20%] w-[45vw] h-[45vw] rounded-full blur-[130px] opacity-15 animate-aurora-3"
        style={{
          background: "radial-gradient(circle, #5EEAD4 0%, rgba(94, 234, 212, 0.08) 60%, transparent 100%)",
        }}
      />

      {/* Subtle particle canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-60" />
    </div>
  );
}
