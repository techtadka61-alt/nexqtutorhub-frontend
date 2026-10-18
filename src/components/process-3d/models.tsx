"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group, Mesh, MeshStandardMaterial } from "three";
import type { PlaybackClock } from "./timeline";

export type PhonePose = "none" | "hand" | "ear";

export interface PersonState {
  x: number;
  z: number;
  /** Facing angle in radians (0 = facing +z, towards the camera's default side). */
  rotY: number;
  walking?: boolean;
  phone?: PhonePose;
  /** Right arm raised (thumbs-up / pointing at the board). */
  raiseArm?: boolean;
  /** 0–1: fades the person towards grey (used for the out-of-range tutor). */
  dim?: number;
}

interface PersonProps {
  clock: React.RefObject<PlaybackClock>;
  script: (t: number) => PersonState;
  shirt: string;
  pants: string;
  skin?: string;
  hair?: string;
  longHair?: boolean;
}

/** Stylised low-poly person built from primitives; pose and position come from `script(time)` every frame. */
export function Person({ clock, script, shirt, pants, skin = "#e8b48f", hair = "#2b1d14", longHair }: PersonProps) {
  const root = useRef<Group>(null);
  const legL = useRef<Group>(null);
  const legR = useRef<Group>(null);
  const armL = useRef<Group>(null);
  const armR = useRef<Group>(null);
  const phone = useRef<Group>(null);
  const shirtMat = useRef<MeshStandardMaterial>(null);

  useFrame(() => {
    const t = clock.current.t;
    const s = script(t);
    if (!root.current) return;
    root.current.position.set(s.x, 0, s.z);
    // Smoothly turn instead of snapping when the script changes direction.
    const current = root.current.rotation.y;
    let delta = s.rotY - current;
    delta = Math.atan2(Math.sin(delta), Math.cos(delta));
    root.current.rotation.y = current + delta * 0.18;

    const swing = s.walking ? Math.sin(t * 9) * 0.6 : 0;
    const bob = s.walking ? Math.abs(Math.sin(t * 9)) * 0.04 : Math.sin(t * 2) * 0.01;
    root.current.position.y = bob;
    legL.current!.rotation.x = swing;
    legR.current!.rotation.x = -swing;
    armL.current!.rotation.x = -swing * 0.8;

    let armX = swing * 0.8;
    let armZ = 0;
    if (s.phone === "hand") armX = -1.15;
    if (s.phone === "ear") {
      armX = -2.5;
      armZ = 0.45;
    }
    if (s.raiseArm) {
      armX = -2.9;
      armZ = -0.1;
    }
    armR.current!.rotation.x += (armX - armR.current!.rotation.x) * 0.2;
    armR.current!.rotation.z += (armZ - armR.current!.rotation.z) * 0.2;
    phone.current!.visible = !!s.phone && s.phone !== "none";
    if (shirtMat.current) shirtMat.current.color.set(s.dim ? "#9aa5a2" : shirt);
  });

  return (
    <group ref={root}>
      {/* legs */}
      <group ref={legL} position={[-0.12, 0.82, 0]}>
        <Leg color={pants} />
      </group>
      <group ref={legR} position={[0.12, 0.82, 0]}>
        <Leg color={pants} />
      </group>
      {/* torso */}
      <mesh position={[0, 1.12, 0]} castShadow>
        <capsuleGeometry args={[0.25, 0.42, 6, 14]} />
        <meshStandardMaterial ref={shirtMat} color={shirt} />
      </mesh>
      {/* arms (pivot at the shoulder) */}
      <group ref={armL} position={[-0.33, 1.38, 0]}>
        <mesh position={[0, -0.27, 0]} castShadow>
          <capsuleGeometry args={[0.075, 0.42, 4, 10]} />
          <meshStandardMaterial color={shirt} />
        </mesh>
        <mesh position={[0, -0.55, 0]}>
          <sphereGeometry args={[0.075, 12, 12]} />
          <meshStandardMaterial color={skin} />
        </mesh>
      </group>
      <group ref={armR} position={[0.33, 1.38, 0]}>
        <mesh position={[0, -0.27, 0]} castShadow>
          <capsuleGeometry args={[0.075, 0.42, 4, 10]} />
          <meshStandardMaterial color={shirt} />
        </mesh>
        <mesh position={[0, -0.55, 0]}>
          <sphereGeometry args={[0.075, 12, 12]} />
          <meshStandardMaterial color={skin} />
        </mesh>
        <group ref={phone} position={[0, -0.6, 0.06]} rotation={[0, 0, 0]}>
          <Phone />
        </group>
      </group>
      {/* head */}
      <mesh position={[0, 1.68, 0]} castShadow>
        <sphereGeometry args={[0.22, 20, 20]} />
        <meshStandardMaterial color={skin} />
      </mesh>
      <mesh position={[0, 1.76, -0.02]} scale={[1.05, 0.75, 1.05]}>
        <sphereGeometry args={[0.23, 20, 20, 0, Math.PI * 2, 0, Math.PI / 1.7]} />
        <meshStandardMaterial color={hair} />
      </mesh>
      {longHair && (
        <mesh position={[0, 1.55, -0.14]} castShadow>
          <boxGeometry args={[0.42, 0.42, 0.12]} />
          <meshStandardMaterial color={hair} />
        </mesh>
      )}
      {[-0.08, 0.08].map((x) => (
        <mesh key={x} position={[x, 1.7, 0.2]}>
          <sphereGeometry args={[0.028, 8, 8]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
      ))}
      <mesh position={[0, 1.6, 0.205]} rotation={[0, 0, Math.PI]}>
        <torusGeometry args={[0.05, 0.012, 6, 12, Math.PI]} />
        <meshStandardMaterial color="#8a3b2e" />
      </mesh>
    </group>
  );
}

function Leg({ color }: { color: string }) {
  return (
    <>
      <mesh position={[0, -0.38, 0]} castShadow>
        <capsuleGeometry args={[0.1, 0.55, 4, 10]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[0, -0.78, 0.06]} castShadow>
        <boxGeometry args={[0.18, 0.09, 0.3]} />
        <meshStandardMaterial color="#f4f4f2" />
      </mesh>
    </>
  );
}

/** Smartphone with a glowing screen. */
export function Phone({ scale = 1 }: { scale?: number }) {
  return (
    <group scale={scale} rotation={[-0.3, 0, 0]}>
      <mesh>
        <boxGeometry args={[0.09, 0.17, 0.018]} />
        <meshStandardMaterial color="#1d2422" />
      </mesh>
      <mesh position={[0, 0, 0.01]}>
        <planeGeometry args={[0.078, 0.15]} />
        <meshStandardMaterial color="#8fd8c5" emissive="#3fd1ac" emissiveIntensity={1.2} />
      </mesh>
    </group>
  );
}

export function House({
  position,
  wall = "#f3ede2",
  roof = "#c96f53",
  highlight,
  dim,
  scale = 1,
}: {
  position: [number, number, number];
  wall?: string;
  roof?: string;
  highlight?: boolean;
  dim?: boolean;
  scale?: number;
}) {
  const roofColor = dim ? "#a7b0ad" : highlight ? "#16806b" : roof;
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.9, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.2, 1.8, 2]} />
        <meshStandardMaterial color={dim ? "#d9dddc" : wall} />
      </mesh>
      <mesh position={[0, 2.3, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
        <coneGeometry args={[1.85, 1.1, 4]} />
        <meshStandardMaterial color={roofColor} />
      </mesh>
      {/* door */}
      <mesh position={[0, 0.5, 1.01]}>
        <boxGeometry args={[0.5, 1, 0.04]} />
        <meshStandardMaterial color={highlight ? "#0b3d32" : "#7a5236"} />
      </mesh>
      {/* windows */}
      {[-0.65, 0.65].map((x) => (
        <mesh key={x} position={[x, 1.15, 1.01]}>
          <boxGeometry args={[0.42, 0.42, 0.04]} />
          <meshStandardMaterial color="#bfe6f0" emissive={highlight ? "#ffe9a8" : "#000000"} emissiveIntensity={0.35} />
        </mesh>
      ))}
      {/* chimney */}
      <mesh position={[0.55, 2.55, -0.3]} castShadow>
        <boxGeometry args={[0.25, 0.6, 0.25]} />
        <meshStandardMaterial color={dim ? "#b9c0be" : "#8d5a44"} />
      </mesh>
    </group>
  );
}

export function Tree({ position, size = 1 }: { position: [number, number, number]; size?: number }) {
  return (
    <group position={position} scale={size}>
      <mesh position={[0, 0.45, 0]} castShadow>
        <cylinderGeometry args={[0.1, 0.14, 0.9, 8]} />
        <meshStandardMaterial color="#7a5236" />
      </mesh>
      <mesh position={[0, 1.25, 0]} castShadow>
        <icosahedronGeometry args={[0.65, 0]} />
        <meshStandardMaterial color="#3e9b6f" flatShading />
      </mesh>
      <mesh position={[0.2, 1.7, 0.1]} castShadow>
        <icosahedronGeometry args={[0.42, 0]} />
        <meshStandardMaterial color="#4fb07f" flatShading />
      </mesh>
    </group>
  );
}

/** Small glowing sphere, used for applications flying to the student and call "signal" dots. */
export function Glow({ refObj, color = "#16806b", size = 0.18 }: { refObj: React.RefObject<Mesh | null>; color?: string; size?: number }) {
  return (
    <mesh ref={refObj}>
      <sphereGeometry args={[size, 16, 16]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.4} />
    </mesh>
  );
}
