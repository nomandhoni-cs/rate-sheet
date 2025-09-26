// components/Background.tsx
import React from "react";

export function Background() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      {/* Base radial gradient (light mode) */}
      <div
        className="absolute inset-0 block dark:hidden"
        style={{
          background: `
            radial-gradient(ellipse 80% 50% at 50% -20%, rgba(120, 119, 198, 0.3), transparent),
            radial-gradient(ellipse 100% 80% at 80% 20%, rgba(255, 255, 255, 0.9), transparent),
            radial-gradient(125% 125% at 50% 90%, #ffffff 30%, #7c3aed 100%)
          `,
        }}
      />

      {/* Base radial gradient (dark mode) */}
      <div
        className="absolute inset-0 hidden dark:block"
        style={{
          background: `
            radial-gradient(ellipse 80% 50% at 50% -20%, rgba(139, 92, 246, 0.15), transparent),
            radial-gradient(ellipse 100% 80% at 20% 80%, rgba(59, 130, 246, 0.1), transparent),
            radial-gradient(125% 125% at 50% 90%, #0f172a 30%, #4c1d95 100%)
          `,
        }}
      />

      {/* Animated floating orbs (light mode) */}
      <div className="absolute inset-0 block dark:hidden">
        <div
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-20 animate-pulse"
          style={{
            background: "radial-gradient(circle, #8b5cf6 0%, transparent 70%)",
            filter: "blur(40px)",
            animation: "float 6s ease-in-out infinite",
          }}
        />
        <div
          className="absolute top-3/4 right-1/4 w-80 h-80 rounded-full opacity-15 animate-pulse"
          style={{
            background: "radial-gradient(circle, #06b6d4 0%, transparent 70%)",
            filter: "blur(50px)",
            animation: "float 8s ease-in-out infinite reverse",
          }}
        />
      </div>

      {/* Animated floating orbs (dark mode) */}
      <div className="absolute inset-0 hidden dark:block">
        <div
          className="absolute top-1/3 right-1/3 w-96 h-96 rounded-full opacity-10 animate-pulse"
          style={{
            background: "radial-gradient(circle, #8b5cf6 0%, transparent 70%)",
            filter: "blur(60px)",
            animation: "float 7s ease-in-out infinite",
          }}
        />
        <div
          className="absolute bottom-1/4 left-1/3 w-72 h-72 rounded-full opacity-8"
          style={{
            background: "radial-gradient(circle, #3b82f6 0%, transparent 70%)",
            filter: "blur(45px)",
            animation: "float 9s ease-in-out infinite reverse",
          }}
        />
      </div>

      {/* Enhanced grid pattern (light mode) */}
      <div
        className="absolute inset-0 block dark:hidden opacity-60"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(148, 163, 184, 0.8) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(148, 163, 184, 0.8) 1px, transparent 1px),
            linear-gradient(to right, rgba(203, 213, 225, 0.4) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(203, 213, 225, 0.4) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px, 60px 60px, 20px 20px, 20px 20px",
          WebkitMaskImage:
            "radial-gradient(ellipse 80% 70% at 50% 0%, #000 50%, transparent 100%)",
          maskImage:
            "radial-gradient(ellipse 80% 70% at 50% 0%, #000 50%, transparent 100%)",
        }}
      />

      {/* Enhanced grid pattern (dark mode) */}
      <div
        className="absolute inset-0 hidden dark:block opacity-40"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(71, 85, 105, 0.8) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(71, 85, 105, 0.8) 1px, transparent 1px),
            linear-gradient(to right, rgba(100, 116, 139, 0.3) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(100, 116, 139, 0.3) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px, 60px 60px, 20px 20px, 20px 20px",
          WebkitMaskImage:
            "radial-gradient(ellipse 80% 70% at 50% 0%, #000 50%, transparent 100%)",
          maskImage:
            "radial-gradient(ellipse 80% 70% at 50% 0%, #000 50%, transparent 100%)",
        }}
      />

      {/* Subtle noise texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.015] dark:opacity-[0.02]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Content readability overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/20 to-transparent" />

      {/* Bottom fade for better content separation */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </div>
  );
}
