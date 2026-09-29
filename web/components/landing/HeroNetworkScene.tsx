"use client";

import React, { useRef, useMemo, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";

interface NodeData {
  id: string;
  name: string;
  sub: string;
  pos: [number, number, number];
  color: string;
}

const NODES: NodeData[] = [
  { id: "auth", name: "Auth", sub: "Virtual-Key", pos: [-2.4, 1.4, 0], color: "#7C5CFF" },
  { id: "budget", name: "Budget", sub: "Atomic UPDATE", pos: [-0.6, 2.1, 0.4], color: "#22D3EE" },
  { id: "executor", name: "Executor", sub: "Task Pipeline", pos: [0, 0.3, 0.5], color: "#7C5CFF" },
  { id: "groq", name: "Groq", sub: "Primary (Llama-3.3)", pos: [2.2, 1.3, 0.2], color: "#5EEAD4" },
  { id: "gemini", name: "Gemini", sub: "Fallback (Flash)", pos: [2.3, -0.6, -0.2], color: "#FBBF24" },
  { id: "validator", name: "Validator", sub: "JSON 1-Repair", pos: [-0.8, -1.5, 0.3], color: "#22D3EE" },
  { id: "trace", name: "Trace", sub: "PostgreSQL", pos: [1.3, -1.8, 0], color: "#5EEAD4" },
];

interface EdgeData {
  from: string;
  to: string;
  isFallback?: boolean;
}

const EDGES: EdgeData[] = [
  { from: "auth", to: "budget" },
  { from: "budget", to: "executor" },
  { from: "executor", to: "groq" },
  { from: "executor", to: "gemini", isFallback: true },
  { from: "groq", to: "validator" },
  { from: "gemini", to: "validator", isFallback: true },
  { from: "validator", to: "trace" },
];

function GlassSphere({ node }: { node: NodeData }) {
  const meshRef = useRef<THREE.Mesh>(null);

  return (
    <group position={node.pos}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[0.38, 32, 32]} />
        <meshPhysicalMaterial
          roughness={0.15}
          metalness={0.1}
          transmission={0.85}
          ior={1.45}
          thickness={0.6}
          color="#16161D"
          transparent
          opacity={0.88}
        />
      </mesh>

      <mesh>
        <sphereGeometry args={[0.18, 16, 16]} />
        <meshBasicMaterial color={node.color} opacity={0.85} transparent />
      </mesh>

      <Html
        center
        distanceFactor={6.8}
        style={{ pointerEvents: "none", userSelect: "none" }}
      >
        <div className="flex flex-col items-center justify-center text-center whitespace-nowrap px-2 py-1 rounded-8 bg-black/60 backdrop-blur-md border border-white/10 shadow-lg">
          <span className="font-heading font-bold text-xs text-text leading-none">
            {node.name}
          </span>
          <span
            className="font-mono text-[9px] mt-0.5"
            style={{ color: node.color }}
          >
            {node.sub}
          </span>
        </div>
      </Html>
    </group>
  );
}

function CurvedEdge({
  edge,
  nodesMap,
  reducedMotion,
}: {
  edge: EdgeData;
  nodesMap: Map<string, NodeData>;
  reducedMotion: boolean;
}) {
  const fromNode = nodesMap.get(edge.from);
  const toNode = nodesMap.get(edge.to);
  const pulseRef = useRef<THREE.Mesh>(null);

  const curve = useMemo(() => {
    if (!fromNode || !toNode) return null;
    const start = new THREE.Vector3(...fromNode.pos);
    const end = new THREE.Vector3(...toNode.pos);
    const mid = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
    const offset = new THREE.Vector3(0, 0, 0.4);
    if (edge.isFallback) offset.set(0.3, -0.2, -0.3);
    const ctrl = mid.add(offset);
    return new THREE.QuadraticBezierCurve3(start, ctrl, end);
  }, [fromNode, toNode, edge.isFallback]);

  const { points, lineGeometry } = useMemo(() => {
    if (!curve) return { points: [], lineGeometry: new THREE.BufferGeometry() };
    const pts = curve.getPoints(40);
    const geom = new THREE.BufferGeometry().setFromPoints(pts);
    return { points: pts, lineGeometry: geom };
  }, [curve]);

  useFrame((state) => {
    if (reducedMotion || !pulseRef.current || !curve) return;
    const time = state.clock.getElapsedTime();
    const speed = edge.isFallback ? 0.35 : 0.55;
    const offset = edge.isFallback ? 0.4 : 0.1;
    const t = (time * speed + offset) % 1;
    const pos = curve.getPoint(t);
    pulseRef.current.position.copy(pos);
  });

  if (!curve) return null;

  return (
    <group>
      {edge.isFallback ? (
        <line>
          <primitive object={lineGeometry} attach="geometry" />
          <lineDashedMaterial
            color="#FBBF24"
            dashSize={0.16}
            gapSize={0.12}
            opacity={0.65}
            transparent
            linewidth={1}
            onUpdate={(line: any) => {
              if (line) line.computeLineDistances?.();
            }}
          />
        </line>
      ) : (
        <line>
          <primitive object={lineGeometry} attach="geometry" />
          <lineBasicMaterial
            color="rgba(124, 92, 255, 0.4)"
            opacity={0.45}
            transparent
            linewidth={1}
          />
        </line>
      )}

      {!reducedMotion && (
        <mesh ref={pulseRef}>
          <sphereGeometry args={[0.075, 12, 12]} />
          <meshBasicMaterial
            color={edge.isFallback ? "#FBBF24" : "#22D3EE"}
            transparent
            opacity={0.9}
          />
        </mesh>
      )}
    </group>
  );
}

function NetworkGroup({
  reducedMotion,
  mouse,
}: {
  reducedMotion: boolean;
  mouse: { x: number; y: number };
}) {
  const groupRef = useRef<THREE.Group>(null);
  const nodesMap = useMemo(() => {
    const map = new Map<string, NodeData>();
    NODES.forEach((n) => map.set(n.id, n));
    return map;
  }, []);

  useFrame((state) => {
    if (!groupRef.current) return;
    const time = state.clock.getElapsedTime();

    const idleY = reducedMotion ? 0 : Math.sin(time * 0.6) * 0.06;
    const idleX = reducedMotion ? 0 : Math.cos(time * 0.45) * 0.04;
    groupRef.current.position.y = idleY;
    groupRef.current.position.x = idleX;

    const MAX_PARALLAX_RAD = (6 * Math.PI) / 180;
    const targetRotY = mouse.x * MAX_PARALLAX_RAD;
    const targetRotX = -mouse.y * MAX_PARALLAX_RAD;

    groupRef.current.rotation.y = THREE.MathUtils.lerp(
      groupRef.current.rotation.y,
      targetRotY,
      0.05
    );
    groupRef.current.rotation.x = THREE.MathUtils.lerp(
      groupRef.current.rotation.x,
      targetRotX,
      0.05
    );
  });

  return (
    <group ref={groupRef}>
      {EDGES.map((edge, i) => (
        <CurvedEdge
          key={`${edge.from}-${edge.to}-${i}`}
          edge={edge}
          nodesMap={nodesMap}
          reducedMotion={reducedMotion}
        />
      ))}

      {NODES.map((node) => (
        <GlassSphere key={node.id} node={node} />
      ))}
    </group>
  );
}

/** Static SVG Fallback for mobile and performance */
export function MobileFallbackSvg() {
  return (
    <div className="w-full h-full flex items-center justify-center p-4">
      <svg
        viewBox="0 0 460 320"
        className="w-full h-auto max-w-[420px]"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <filter id="glowV" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        <path d="M70 70 Q 150 40 220 50" stroke="#7C5CFF" strokeWidth="2" strokeOpacity="0.4" />
        <path d="M220 50 Q 230 110 230 150" stroke="#22D3EE" strokeWidth="2" strokeOpacity="0.4" />
        <path d="M230 150 Q 310 110 380 90" stroke="#5EEAD4" strokeWidth="2" strokeOpacity="0.5" />
        <path
          d="M230 150 Q 320 180 380 190"
          stroke="#FBBF24"
          strokeWidth="2"
          strokeDasharray="5 5"
          strokeOpacity="0.6"
        />
        <path d="M380 90 Q 260 210 150 250" stroke="#5EEAD4" strokeWidth="2" strokeOpacity="0.3" />
        <path
          d="M380 190 Q 250 240 150 250"
          stroke="#FBBF24"
          strokeWidth="2"
          strokeDasharray="5 5"
          strokeOpacity="0.4"
        />
        <path d="M150 250 Q 230 270 320 280" stroke="#5EEAD4" strokeWidth="2" strokeOpacity="0.5" />

        <g transform="translate(70, 70)">
          <circle r="18" fill="#14141B" stroke="#7C5CFF" strokeWidth="1.5" />
          <circle r="6" fill="#7C5CFF" filter="url(#glowV)" />
          <text y="28" textAnchor="middle" fill="#F4F4F5" fontSize="10" fontFamily="sans-serif" fontWeight="bold">Auth</text>
        </g>
        <g transform="translate(220, 50)">
          <circle r="18" fill="#14141B" stroke="#22D3EE" strokeWidth="1.5" />
          <circle r="6" fill="#22D3EE" />
          <text y="28" textAnchor="middle" fill="#F4F4F5" fontSize="10" fontFamily="sans-serif" fontWeight="bold">Budget</text>
        </g>
        <g transform="translate(230, 150)">
          <circle r="22" fill="#161622" stroke="#7C5CFF" strokeWidth="2" />
          <circle r="7" fill="#7C5CFF" />
          <text y="32" textAnchor="middle" fill="#F4F4F5" fontSize="11" fontFamily="sans-serif" fontWeight="bold">Executor</text>
        </g>
        <g transform="translate(380, 90)">
          <circle r="18" fill="#14141B" stroke="#5EEAD4" strokeWidth="1.5" />
          <circle r="6" fill="#5EEAD4" />
          <text y="28" textAnchor="middle" fill="#5EEAD4" fontSize="10" fontFamily="sans-serif" fontWeight="bold">Groq Primary</text>
        </g>
        <g transform="translate(380, 190)">
          <circle r="18" fill="#14141B" stroke="#FBBF24" strokeWidth="1.5" strokeDasharray="4 3" />
          <circle r="6" fill="#FBBF24" />
          <text y="28" textAnchor="middle" fill="#FBBF24" fontSize="10" fontFamily="sans-serif" fontWeight="bold">Gemini Fallback</text>
        </g>
        <g transform="translate(150, 250)">
          <circle r="18" fill="#14141B" stroke="#22D3EE" strokeWidth="1.5" />
          <circle r="6" fill="#22D3EE" />
          <text y="28" textAnchor="middle" fill="#F4F4F5" fontSize="10" fontFamily="sans-serif" fontWeight="bold">Validator</text>
        </g>
        <g transform="translate(320, 280)">
          <circle r="18" fill="#14141B" stroke="#5EEAD4" strokeWidth="1.5" />
          <circle r="6" fill="#5EEAD4" />
          <text y="28" textAnchor="middle" fill="#5EEAD4" fontSize="10" fontFamily="sans-serif" fontWeight="bold">Trace</text>
        </g>
      </svg>
    </div>
  );
}

export function HeroNetworkScene() {
  const [reducedMotion, setReducedMotion] = useState(false);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(motionQuery.matches);
    const onMotionChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    motionQuery.addEventListener("change", onMotionChange);
    return () => motionQuery.removeEventListener("change", onMotionChange);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const ny = ((e.clientY - rect.top) / rect.height) * 2 - 1;
    setMouse({ x: nx, y: ny });
  };

  const handleMouseLeave = () => {
    setMouse({ x: 0, y: 0 });
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative w-full h-[460px] lg:h-[560px] select-none"
    >
      {/* Mobile (< 768px): CSS static SVG fallback */}
      <div className="block md:hidden w-full h-full">
        <MobileFallbackSvg />
      </div>

      {/* Desktop (>= 768px): R3F Canvas */}
      <div className="hidden md:block w-full h-full cursor-grab active:cursor-grabbing">
        <Canvas
          camera={{ position: [0, 0, 7.2], fov: 45 }}
          dpr={[1, 1.5]}
          gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
        >
          <ambientLight intensity={0.8} />
          <directionalLight position={[5, 6, 5]} intensity={1.2} />
          <pointLight position={[-4, -3, 3]} intensity={0.6} color="#7C5CFF" />
          <pointLight position={[4, 3, 2]} intensity={0.6} color="#22D3EE" />

          <NetworkGroup reducedMotion={reducedMotion} mouse={mouse} />
        </Canvas>
      </div>
    </div>
  );
}
