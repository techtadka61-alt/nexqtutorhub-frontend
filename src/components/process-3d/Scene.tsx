"use client";

import { memo, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import { Color, Vector3, type Group, type Mesh, type MeshBasicMaterial } from "three";
import { House, Person, Tree, type PersonState } from "./models";
import { advanceClock, ramp, stepAt, type PlaybackClock, type StepKey } from "./timeline";

type V2 = [number, number];

/** World layout. The student's home is the centre of the 10 km radius (1 unit ≈ 1 km). */
const RADIUS = 10;
const STUDENT_HOME: V2 = [0, 1.4];
const DEMO_STUDENT: V2 = [1.0, 1.7];
const DEMO_TUTOR: V2 = [2.5, 1.3];
const TUTORS = [
  { name: "Anjali", house: [-7, -1.6] as V2, stand: [-7, 0.6] as V2, shirt: "#16806b", pants: "#2c3e50", longHair: true },
  { name: "Rahul", house: [6, -4.6] as V2, stand: [6, -2.4] as V2, shirt: "#3186a8", pants: "#3b3b3b" },
  { name: "Priya", house: [-2.8, -8.2] as V2, stand: [-2.8, -6] as V2, shirt: "#d99a24", pants: "#4a3b6b", longHair: true },
];
const FAR_TUTOR = { house: [13, -8.8] as V2, stand: [13, -6.6] as V2 };
/** Anjali's walk to the student's home for the demo: down her lane, along the road, up to the door. */
const WALK: V2[] = [TUTORS[0].stand, [-7, 3.5], [1.5, 3.5], DEMO_TUTOR];

const dist = ([x, z]: V2) => Math.hypot(x, z);
const STEP_ORDER: StepKey[] = ["post", "notify", "apply", "call", "demo", "decide", "close"];
const atOrAfter = (key: StepKey, ref: StepKey) => STEP_ORDER.indexOf(key) >= STEP_ORDER.indexOf(ref);

/** Point along a polyline at 0–1, plus the heading of that segment. */
function alongPath(path: V2[], p: number): { pos: V2; heading: number } {
  const lengths = path.slice(1).map((pt, i) => Math.hypot(pt[0] - path[i][0], pt[1] - path[i][1]));
  const total = lengths.reduce((a, b) => a + b, 0);
  let d = Math.min(1, Math.max(0, p)) * total;
  for (let i = 0; i < lengths.length; i++) {
    if (d <= lengths[i] || i === lengths.length - 1) {
      const k = lengths[i] ? Math.min(1, d / lengths[i]) : 0;
      const [ax, az] = path[i];
      const [bx, bz] = path[i + 1];
      return { pos: [ax + (bx - ax) * k, az + (bz - az) * k], heading: Math.atan2(bx - ax, bz - az) };
    }
    d -= lengths[i];
  }
  return { pos: path[path.length - 1], heading: 0 };
}

const face = (from: V2, to: V2) => Math.atan2(to[0] - from[0], to[1] - from[1]);

// ------------------------------------------------------------------ people scripts

function studentScript(t: number): PersonState {
  const { key, p } = stepAt(t);
  if (key === "post") return { x: STUDENT_HOME[0], z: STUDENT_HOME[1], rotY: 0, phone: "hand" };
  if (key === "notify" || key === "apply") return { x: STUDENT_HOME[0], z: STUDENT_HOME[1], rotY: 0, phone: p > 0.3 && key === "apply" ? "hand" : "none" };
  if (key === "call") return { x: STUDENT_HOME[0], z: STUDENT_HOME[1], rotY: face(STUDENT_HOME, TUTORS[0].stand), phone: "ear" };
  if (key === "demo") {
    const k = ramp(p, 0.35, 0.6);
    const x = STUDENT_HOME[0] + (DEMO_STUDENT[0] - STUDENT_HOME[0]) * k;
    const z = STUDENT_HOME[1] + (DEMO_STUDENT[1] - STUDENT_HOME[1]) * k;
    return { x, z, rotY: p > 0.6 ? Math.PI * 0.85 : face(STUDENT_HOME, DEMO_TUTOR), walking: k > 0 && k < 1 };
  }
  if (key === "decide") return { x: DEMO_STUDENT[0], z: DEMO_STUDENT[1], rotY: 0, raiseArm: p > 0.45 };
  return { x: DEMO_STUDENT[0], z: DEMO_STUDENT[1], rotY: 0, phone: "hand" };
}

function tutorScript(index: number) {
  const tutor = TUTORS[index];
  const notifiedAt = dist(tutor.stand) / RADIUS; // when the expanding ring reaches them
  return (t: number): PersonState => {
    const { key, p } = stepAt(t);
    const home = { x: tutor.stand[0], z: tutor.stand[1], rotY: 0 };
    if (key === "post") return home;
    if (key === "notify") return { ...home, phone: ramp(p, 0, 0.6) >= notifiedAt ? "hand" : "none" };
    if (key === "apply") return { ...home, phone: "hand" };
    if (index !== 0) return { ...home, rotY: face(tutor.stand, [0, 0]) };
    // Anjali — the tutor the student picks.
    if (key === "call") return { ...home, rotY: face(tutor.stand, STUDENT_HOME), phone: "ear" };
    if (key === "demo") {
      const walk = ramp(p, 0, 0.55);
      const { pos, heading } = alongPath(WALK, walk);
      const arrived = walk >= 1;
      return { x: pos[0], z: pos[1], rotY: arrived ? -Math.PI * 0.75 : heading, walking: !arrived, raiseArm: p > 0.68 };
    }
    return { x: DEMO_TUTOR[0], z: DEMO_TUTOR[1], rotY: face(DEMO_TUTOR, DEMO_STUDENT) };
  };
}

const farTutorScript = (): PersonState => ({ x: FAR_TUTOR.stand[0], z: FAR_TUTOR.stand[1], rotY: 0, dim: 1 });

// ------------------------------------------------------------------ camera

// Close-ups look a little above the characters' heads so their speech/label cards stay in frame below the caption.
const CAMERA: Record<StepKey, { pos: [number, number, number]; look: [number, number, number] }> = {
  post: { pos: [3.4, 3.6, 9], look: [0, 2.1, 1.2] },
  notify: { pos: [0, 21, 18], look: [0, 0, -1] },
  apply: { pos: [3, 17, 16], look: [0, 1, -0.5] },
  call: { pos: [-3.5, 7, 13], look: [-3.5, 2.2, 0.5] },
  demo: { pos: [6, 6, 11.5], look: [0, 1.8, 1.2] },
  decide: { pos: [3.6, 3.4, 9.2], look: [1.4, 2.2, 1.4] },
  close: { pos: [3.4, 3.4, 9], look: [1.2, 2.3, 1.5] },
};

function CameraRig({ clock }: { clock: React.RefObject<PlaybackClock> }) {
  const { camera } = useThree();
  const look = useRef(new Vector3(0, 1, 0));
  const targetPos = useMemo(() => new Vector3(), []);
  const targetLook = useMemo(() => new Vector3(), []);
  useFrame((_, dt) => {
    const { key } = stepAt(clock.current.t);
    const shot = CAMERA[key];
    targetPos.set(...shot.pos);
    targetLook.set(...shot.look);
    const k = 1 - Math.exp(-dt * 1.8);
    camera.position.lerp(targetPos, k);
    look.current.lerp(targetLook, k);
    camera.lookAt(look.current);
  });
  return null;
}

// ------------------------------------------------------------------ effects

/** Shows/hides an <Html> overlay by step without re-rendering React. */
function Label({
  clock,
  position,
  visible,
  children,
  className = "",
}: {
  clock: React.RefObject<PlaybackClock>;
  position: [number, number, number];
  visible: (key: StepKey, p: number) => boolean;
  children: React.ReactNode;
  className?: string;
}) {
  const el = useRef<HTMLDivElement>(null);
  useFrame(() => {
    const { key, p } = stepAt(clock.current.t);
    const show = visible(key, p);
    if (el.current) {
      el.current.style.opacity = show ? "1" : "0";
      el.current.style.transform = show ? "translateY(0) scale(1)" : "translateY(6px) scale(0.92)";
    }
  });
  return (
    <Html position={position} center zIndexRange={[20, 0]} style={{ pointerEvents: "none" }}>
      <div
        ref={el}
        className={`whitespace-nowrap rounded-xl border border-black/5 bg-white px-3 py-1.5 text-xs font-semibold text-[#17211f] shadow-lg transition-all duration-300 ${className}`}
        style={{ opacity: 0 }}
      >
        {children}
      </div>
    </Html>
  );
}

function RadiusRing({ clock }: { clock: React.RefObject<PlaybackClock> }) {
  const pulse = useRef<Mesh>(null);
  const pulseMat = useRef<MeshBasicMaterial>(null);
  const edgeMat = useRef<MeshBasicMaterial>(null);
  useFrame(() => {
    const { key, p } = stepAt(clock.current.t);
    const grow = key === "notify" ? ramp(p, 0, 0.6) : atOrAfter(key, "notify") ? 1 : 0;
    pulse.current!.scale.setScalar(Math.max(0.001, grow));
    pulseMat.current!.opacity = key === "notify" ? 0.22 - 0.12 * ramp(p, 0.6, 1) : key === "apply" ? 0.1 : 0;
    edgeMat.current!.opacity = key === "notify" || key === "apply" ? 0.9 : 0.25;
  });
  return (
    <group position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <mesh ref={pulse}>
        <circleGeometry args={[RADIUS, 96]} />
        <meshBasicMaterial ref={pulseMat} color="#16806b" transparent opacity={0} depthWrite={false} />
      </mesh>
      <mesh>
        <ringGeometry args={[RADIUS - 0.12, RADIUS, 128]} />
        <meshBasicMaterial ref={edgeMat} color="#16806b" transparent opacity={0.25} depthWrite={false} />
      </mesh>
    </group>
  );
}

/** Applications fly from each tutor to the student's home. */
function Applications({ clock }: { clock: React.RefObject<PlaybackClock> }) {
  const group = useRef<Group>(null);
  const target = new Vector3(STUDENT_HOME[0], 2.4, STUDENT_HOME[1]);
  useFrame(() => {
    const { key, p } = stepAt(clock.current.t);
    TUTORS.forEach((tutor, i) => {
      const mesh = group.current!.children[i];
      const k = ramp(p, 0.1 + i * 0.18, 0.45 + i * 0.18);
      mesh.visible = key === "apply" && k > 0 && k < 1;
      const from = new Vector3(tutor.stand[0], 2.2, tutor.stand[1]);
      mesh.position.lerpVectors(from, target, k);
      mesh.position.y += Math.sin(k * Math.PI) * 3;
    });
  });
  return (
    <group ref={group}>
      {TUTORS.map((tutor) => (
        <mesh key={tutor.name}>
          <sphereGeometry args={[0.26, 16, 16]} />
          <meshStandardMaterial color={tutor.shirt} emissive={tutor.shirt} emissiveIntensity={1.4} />
        </mesh>
      ))}
    </group>
  );
}

/** Dots travelling between the two phones during the call. */
function CallSignal({ clock }: { clock: React.RefObject<PlaybackClock> }) {
  const group = useRef<Group>(null);
  const a = new Vector3(STUDENT_HOME[0], 1.9, STUDENT_HOME[1]);
  const b = new Vector3(TUTORS[0].stand[0], 1.9, TUTORS[0].stand[1]);
  useFrame(() => {
    const { key } = stepAt(clock.current.t);
    const t = clock.current.t;
    const dots = group.current!.children;
    group.current!.visible = key === "call";
    dots.forEach((mesh, i) => {
      const k = (t * 0.45 + i / dots.length) % 1;
      // even dots go student → tutor, odd ones come back
      const kk = i % 2 ? 1 - k : k;
      mesh.position.lerpVectors(a, b, kk);
      mesh.position.y += Math.sin(kk * Math.PI) * 2.2;
    });
  });
  return (
    <group ref={group}>
      {Array.from({ length: 7 }, (_, i) => (
        <mesh key={i}>
          <sphereGeometry args={[0.11, 12, 12]} />
          <meshStandardMaterial color={i % 2 ? "#3186a8" : "#16806b"} emissive={i % 2 ? "#3186a8" : "#16806b"} emissiveIntensity={1.4} />
        </mesh>
      ))}
    </group>
  );
}

function DemoSet({ clock }: { clock: React.RefObject<PlaybackClock> }) {
  const group = useRef<Group>(null);
  useFrame(() => {
    const { key, p } = stepAt(clock.current.t);
    const s = key === "demo" ? ramp(p, 0.35, 0.6) : atOrAfter(key, "decide") ? 1 : 0;
    group.current!.scale.setScalar(Math.max(0.001, s));
    group.current!.visible = s > 0.001;
  });
  return (
    <group ref={group} position={[1.75, 0, 0.35]}>
      {/* whiteboard */}
      <mesh position={[0, 1.45, 0]} castShadow>
        <boxGeometry args={[1.7, 1, 0.06]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      <mesh position={[0, 1.45, -0.04]}>
        <boxGeometry args={[1.8, 1.1, 0.04]} />
        <meshStandardMaterial color="#16806b" />
      </mesh>
      {[-0.7, 0.7].map((x) => (
        <mesh key={x} position={[x, 0.5, 0]}>
          <cylinderGeometry args={[0.03, 0.03, 1, 6]} />
          <meshStandardMaterial color="#5c6b67" />
        </mesh>
      ))}
      <Html position={[0, 1.45, 0.05]} transform distanceFactor={1.6} style={{ pointerEvents: "none" }}>
        <div className="w-[300px] text-center font-semibold text-[#0b3d32]">
          <div className="text-[22px]">Demo class · Day 1</div>
          <div className="mt-1 text-[18px] text-[#16806b]">x² + 5x + 6 = 0</div>
          <div className="text-[18px] text-[#16806b]">(x + 2)(x + 3) = 0 ✓</div>
        </div>
      </Html>
    </group>
  );
}

/** Deterministic 0–1 noise, so confetti looks random but renders the same every time. */
function rand(i: number, salt: number) {
  const x = Math.sin(i * 12.9898 + salt * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

function Confetti({ clock }: { clock: React.RefObject<PlaybackClock> }) {
  const pieces = useMemo(
    () =>
      Array.from({ length: 70 }, (_, i) => ({
        x: DEMO_STUDENT[0] + (rand(i, 1) - 0.5) * 5,
        z: DEMO_STUDENT[1] + (rand(i, 2) - 0.5) * 3,
        speed: 0.8 + rand(i, 3) * 0.9,
        spin: rand(i, 4) * 6,
        color: new Color(["#16806b", "#d99a24", "#3186a8", "#d9534f", "#8fd8c5"][i % 5]),
      })),
    [],
  );
  const group = useRef<Group>(null);
  useFrame(() => {
    const { key, p } = stepAt(clock.current.t);
    const k = key === "close" ? ramp(p, 0.5, 1) : 0;
    group.current!.visible = k > 0;
    group.current!.children.forEach((child, i) => {
      const piece = pieces[i];
      child.position.set(piece.x, 4.2 - k * 4 * piece.speed, piece.z);
      child.rotation.set(k * piece.spin * 4, k * piece.spin * 3, 0);
    });
  });
  return (
    <group ref={group}>
      {pieces.map((piece, i) => (
        <mesh key={i}>
          <planeGeometry args={[0.08, 0.14]} />
          <meshBasicMaterial color={piece.color} side={2} />
        </mesh>
      ))}
    </group>
  );
}

/** Advances the shared clock and reports step changes to the overlay. */
function ClockDriver({ clock, onStep }: { clock: React.RefObject<PlaybackClock>; onStep: (index: number) => void }) {
  const last = useRef(-1);
  useFrame((_, dt) => {
    advanceClock(clock.current, dt);
    const { index } = stepAt(clock.current.t);
    if (index !== last.current) {
      last.current = index;
      onStep(index);
    }
  });
  return null;
}

// ------------------------------------------------------------------ scene

export const ProcessScene = memo(function ProcessScene({ clock, onStep }: { clock: React.RefObject<PlaybackClock>; onStep: (index: number) => void }) {
  const trees = useMemo<[number, number, number][]>(
    () => [
      [-5.2, 0, -4.4], [3.2, 0, -3.5], [-10, 0, -5], [9, 0, 1], [-11, 0, 7], [11, 0, 8], [-5, 0, 11], [8, 0, -10],
      [-2, 0, 7], [15, 0, -2], [-14, 0, -1], [1, 0, -9], [-8, 0, -9], [16, 0, 12], [-16, 0, 12],
    ],
    [],
  );

  return (
    <>
      <color attach="background" args={["#e7f3ef"]} />
      <fog attach="fog" args={["#e7f3ef", 26, 48]} />
      <ambientLight intensity={0.55} />
      <hemisphereLight args={["#ffffff", "#9fd3b8", 0.6]} />
      <directionalLight
        position={[8, 16, 9]}
        intensity={1.6}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-22}
        shadow-camera-right={22}
        shadow-camera-top={22}
        shadow-camera-bottom={-22}
      />

      <ClockDriver clock={clock} onStep={onStep} />
      <CameraRig clock={clock} />

      {/* ground + roads */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[80, 80]} />
        <meshStandardMaterial color="#cfe8d6" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 3.5]} receiveShadow>
        <planeGeometry args={[60, 1.8]} />
        <meshStandardMaterial color="#5f6b68" />
      </mesh>
      {Array.from({ length: 24 }, (_, i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[-29 + i * 2.5, 0.015, 3.5]}>
          <planeGeometry args={[1, 0.1]} />
          <meshBasicMaterial color="#f4f1e8" />
        </mesh>
      ))}
      {/* lanes to each house */}
      {[...TUTORS.map((tt) => tt.stand), STUDENT_HOME, FAR_TUTOR.stand].map(([x, z], i) => {
        const len = Math.abs(3.5 - z);
        return (
          <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[x, 0.012, (z + 3.5) / 2]} receiveShadow>
            <planeGeometry args={[0.8, len]} />
            <meshStandardMaterial color="#e6dcc8" />
          </mesh>
        );
      })}

      <RadiusRing clock={clock} />

      {/* homes */}
      <House position={[0, 0, -1]} highlight />
      {TUTORS.map((tt, i) => (
        <House key={tt.name} position={[tt.house[0], 0, tt.house[1]]} roof={["#c96f53", "#6f7fc9", "#b07a3e"][i]} scale={0.85} />
      ))}
      <House position={[FAR_TUTOR.house[0], 0, FAR_TUTOR.house[1]]} dim scale={0.85} />
      {trees.map((pos, i) => (
        <Tree key={i} position={pos} size={0.8 + (i % 3) * 0.2} />
      ))}

      {/* people */}
      <Person clock={clock} script={studentScript} shirt="#f2f2f2" pants="#16806b" hair="#3a2618" />
      {TUTORS.map((tt, i) => (
        <Person key={tt.name} clock={clock} script={tutorScript(i)} shirt={tt.shirt} pants={tt.pants} longHair={tt.longHair} />
      ))}
      <Person clock={clock} script={farTutorScript} shirt="#9aa5a2" pants="#7d8784" />

      <Applications clock={clock} />
      <CallSignal clock={clock} />
      <DemoSet clock={clock} />
      <Confetti clock={clock} />

      {/* labels */}
      <Label clock={clock} position={[0, 2.55, STUDENT_HOME[1]]} visible={(k, p) => k === "post" && p > 0.15}>
        📝 Class 10 · Maths, Physics · Home tuition · ₹3,000/mo
      </Label>
      {TUTORS.map((tt, i) => (
        <Label
          key={tt.name}
          clock={clock}
          position={[tt.stand[0], 2.6, tt.stand[1]]}
          visible={(k, p) => (k === "notify" && ramp(p, 0, 0.6) >= dist(tt.stand) / RADIUS) || (k === "apply" && p < 0.1 + i * 0.18)}
        >
          🔔 {tt.name} · New request · {dist(tt.stand).toFixed(1)} km
        </Label>
      ))}
      {TUTORS.map((tt, i) => (
        <Label key={`${tt.name}-applied`} clock={clock} position={[tt.stand[0], 2.6, tt.stand[1]]} visible={(k, p) => k === "apply" && p >= 0.1 + i * 0.18}>
          ✅ {tt.name} applied
        </Label>
      ))}
      <Label
        clock={clock}
        position={[FAR_TUTOR.stand[0], 2.5, FAR_TUTOR.stand[1]]}
        visible={(k) => k === "notify" || k === "apply"}
        className="!bg-gray-100 !text-gray-500"
      >
        {dist(FAR_TUTOR.stand).toFixed(1)} km · Out of range
      </Label>
      <Label clock={clock} position={[RADIUS * 0.72, 0.6, -RADIUS * 0.72]} visible={(k) => k === "notify"} className="!bg-[#0b3d32] !text-white">
        10 km radius
      </Label>
      <Label clock={clock} position={[0, 3.6, STUDENT_HOME[1]]} visible={(k, p) => k === "apply" && p > 0.85}>
        📥 3 tutors applied — student accepts Anjali
      </Label>
      <Label clock={clock} position={[-3.5, 3.9, 1]} visible={(k, p) => k === "call" && p > 0.1}>
        📞 Talking about timing, fees &amp; a demo class
      </Label>
      <Label clock={clock} position={[1.7, 3.3, 1.2]} visible={(k, p) => k === "demo" && p > 0.62}>
        👩‍🏫 1-day demo class at home
      </Label>
      <Label clock={clock} position={[DEMO_STUDENT[0] - 0.2, 2.7, DEMO_STUDENT[1]]} visible={(k, p) => k === "decide" && p > 0.2}>
        💭 Great teaching — I&apos;ll continue with Anjali! 👍
      </Label>
      <Label clock={clock} position={[DEMO_STUDENT[0] - 0.3, 2.85, DEMO_STUDENT[1]]} visible={(k, p) => k === "close" && p < 0.5}>
        <span className="block text-[11px] font-normal text-gray-500">Close requirement · Reason</span>
        🔘 Found a tutor — demo went well
      </Label>
      <Label
        clock={clock}
        position={[DEMO_STUDENT[0] - 0.3, 2.85, DEMO_STUDENT[1]]}
        visible={(k, p) => k === "close" && p >= 0.5}
        className="!bg-[#24966f] !text-white"
      >
        ✅ Request closed · Happy learning!
      </Label>
    </>
  );
});
