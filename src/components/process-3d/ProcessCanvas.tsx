"use client";

import { memo } from "react";
import { Canvas } from "@react-three/fiber";
import { ProcessScene } from "./Scene";
import type { PlaybackClock } from "./timeline";

/** The WebGL canvas. Rendering stops entirely while the section is off-screen. */
export const ProcessCanvas = memo(function ProcessCanvas({
  clock,
  active,
  onStep,
}: {
  clock: React.RefObject<PlaybackClock>;
  active: boolean;
  onStep: (index: number) => void;
}) {
  return (
    <Canvas
      shadows
      dpr={[1, 1.75]}
      frameloop={active ? "always" : "never"}
      camera={{ position: [2.6, 2.6, 6.6], fov: 45, near: 0.1, far: 120 }}
      gl={{ antialias: true }}
    >
      <ProcessScene clock={clock} onStep={onStep} />
    </Canvas>
  );
});
