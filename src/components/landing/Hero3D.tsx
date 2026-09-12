"use client";

import { useRef, useState, useEffect } from "react";
import { Canvas, useFrame, type ThreeElements } from "@react-three/fiber";
import { RoundedBox, Float } from "@react-three/drei";
import * as THREE from "three";

/* Palette (matches the dark clay theme) */
const GOLD = "#e6b566";
const GOLD_DEEP = "#c9964a";
const CORAL = "#d97b6c";
const WOOD = "#c9a77b";
const SLATE = "#8a8f9c";
const GRAPHITE = "#161618";
const PAGE = "#e9e3d6";
const LILAC = "#a99bcf";
const SAGE = "#7fb59d";

/** Scroll progress 0..1 shared into the scene via a ref (no re-renders). */
function useScrollProgress() {
  const ref = useRef(0);
  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      ref.current = max > 0 ? Math.min(1, window.scrollY / max) : 0;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return ref;
}

function Book(props: ThreeElements["group"]) {
  const [hovered, setHovered] = useState(false);
  const ref = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (!ref.current) return;
    const target = hovered ? 1.08 : 1;
    ref.current.scale.lerp(new THREE.Vector3(target, target, target), 1 - Math.pow(0.001, dt));
    ref.current.rotation.y += (hovered ? 0.9 : 0.15) * dt;
  });
  return (
    <group
      {...props}
      ref={ref}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true); }}
      onPointerOut={() => setHovered(false)}
    >
      {/* cover */}
      <RoundedBox args={[2.5, 3.3, 0.55]} radius={0.14} smoothness={4}>
        <meshStandardMaterial color={GOLD_DEEP} roughness={0.55} metalness={0.15} />
      </RoundedBox>
      {/* pages */}
      <RoundedBox args={[2.32, 3.12, 0.52]} radius={0.08} smoothness={3} position={[0.04, 0, 0.03]}>
        <meshStandardMaterial color={PAGE} roughness={0.9} />
      </RoundedBox>
      {/* front cover face (so front reads gold too) */}
      <RoundedBox args={[2.5, 3.3, 0.12]} radius={0.14} smoothness={4} position={[0, 0, 0.28]}>
        <meshStandardMaterial color={GOLD} roughness={0.5} metalness={0.2} />
      </RoundedBox>
      {/* bookmark ribbon */}
      <mesh position={[0.7, -1.9, 0.3]}>
        <boxGeometry args={[0.22, 1.4, 0.03]} />
        <meshStandardMaterial color={CORAL} roughness={0.6} />
      </mesh>
    </group>
  );
}

function Pencil(props: ThreeElements["group"]) {
  const [hovered, setHovered] = useState(false);
  const ref = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (!ref.current) return;
    const target = hovered ? 1.12 : 1;
    ref.current.scale.lerp(new THREE.Vector3(target, target, target), 1 - Math.pow(0.001, dt));
    ref.current.rotation.z += (hovered ? 1.1 : 0.2) * dt;
  });
  return (
    <group
      {...props}
      ref={ref}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true); }}
      onPointerOut={() => setHovered(false)}
    >
      {/* body (hexagonal) */}
      <mesh>
        <cylinderGeometry args={[0.17, 0.17, 2.6, 6]} />
        <meshStandardMaterial color={GOLD} roughness={0.5} metalness={0.1} />
      </mesh>
      {/* wood cone */}
      <mesh position={[0, -1.55, 0]}>
        <coneGeometry args={[0.17, 0.5, 6]} />
        <meshStandardMaterial color={WOOD} roughness={0.8} />
      </mesh>
      {/* graphite tip */}
      <mesh position={[0, -1.85, 0]}>
        <coneGeometry args={[0.06, 0.22, 6]} />
        <meshStandardMaterial color={GRAPHITE} roughness={0.4} metalness={0.3} />
      </mesh>
      {/* ferrule */}
      <mesh position={[0, 1.42, 0]}>
        <cylinderGeometry args={[0.18, 0.18, 0.28, 16]} />
        <meshStandardMaterial color={SLATE} roughness={0.3} metalness={0.6} />
      </mesh>
      {/* eraser */}
      <mesh position={[0, 1.66, 0]}>
        <cylinderGeometry args={[0.17, 0.17, 0.24, 16]} />
        <meshStandardMaterial color={"#b7bcc7"} roughness={0.7} />
      </mesh>
    </group>
  );
}

function Bubble({ position, scale, color }: { position: [number, number, number]; scale: number; color: string }) {
  const [hovered, setHovered] = useState(false);
  const ref = useRef<THREE.Mesh>(null);
  useFrame((_, dt) => {
    if (!ref.current) return;
    const t = hovered ? scale * 1.25 : scale;
    ref.current.scale.lerp(new THREE.Vector3(t, t, t), 1 - Math.pow(0.002, dt));
  });
  return (
    <mesh
      ref={ref}
      position={position}
      scale={scale}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true); }}
      onPointerOut={() => setHovered(false)}
    >
      <sphereGeometry args={[1, 32, 32]} />
      <meshStandardMaterial
        color={color}
        roughness={0.15}
        metalness={0.1}
        transparent
        opacity={0.55}
        emissive={color}
        emissiveIntensity={0.15}
      />
    </mesh>
  );
}

/** The whole arrangement — parallaxes toward the pointer and on scroll. */
function Scene() {
  const group = useRef<THREE.Group>(null);
  const scroll = useScrollProgress();

  useFrame((state, dt) => {
    if (!group.current) return;
    const px = state.pointer.x;
    const py = state.pointer.y;
    const targetY = px * 0.45 + scroll.current * 0.6;
    const targetX = -py * 0.28 + scroll.current * 0.15;
    const k = 1 - Math.pow(0.005, dt);
    group.current.rotation.y += (targetY - group.current.rotation.y) * k;
    group.current.rotation.x += (targetX - group.current.rotation.x) * k;
    // gentle drift away as you scroll down
    group.current.position.y = scroll.current * 0.8;
  });

  return (
    <group ref={group}>
      <Float speed={1.4} rotationIntensity={0.25} floatIntensity={0.7}>
        <Book position={[-1.1, 0, 0]} rotation={[0.15, -0.5, 0.05]} />
      </Float>
      <Float speed={1.8} rotationIntensity={0.3} floatIntensity={0.9}>
        <Pencil position={[1.9, 0.4, 0.6]} rotation={[0, 0, -0.5]} />
      </Float>
      <Float speed={1.2} rotationIntensity={0.4} floatIntensity={1.2}>
        <Bubble position={[1.4, -1.6, 0.5]} scale={0.55} color={LILAC} />
      </Float>
      <Float speed={1.5} rotationIntensity={0.4} floatIntensity={1.3}>
        <Bubble position={[-2.1, 1.5, -0.5]} scale={0.4} color={SAGE} />
      </Float>
      <Float speed={1.7} rotationIntensity={0.4} floatIntensity={1.1}>
        <Bubble position={[-1.9, -1.3, 0.8]} scale={0.28} color={GOLD} />
      </Float>
    </group>
  );
}

export default function Hero3D() {
  return (
    <Canvas
      camera={{ position: [0, 0, 8.5], fov: 42 }}
      gl={{ alpha: true, antialias: true }}
      dpr={[1, 2]}
      style={{ width: "100%", height: "100%", background: "transparent" }}
    >
      {/* Soft, warm lighting to match the gold glow */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[3, 4, 5]} intensity={2.2} color={GOLD} />
      <pointLight position={[-4, -2, 3]} intensity={1.2} color={LILAC} />
      <pointLight position={[0, 3, -4]} intensity={0.8} color={SAGE} />
      <Scene />
    </Canvas>
  );
}
