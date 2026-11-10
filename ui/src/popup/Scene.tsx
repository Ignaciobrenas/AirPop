import React, { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { ModelSilhouette } from "../shared/store";

export interface SceneProps {
  modelId: string;
  kind: "earbuds" | "over-ear";
  silhouette?: ModelSilhouette;
  colorHex: string;
  accentHex?: string;
  lidOpen: boolean;
  lowBattery: boolean;
  pointerX: number;
  pointerY: number;
  reducedMotion: boolean;
  dragRotX?: number;
  dragRotY?: number;
  interactiveHint?: string;
}

interface SpringState {
  value: number;
  velocity: number;
}

function stepSpring(
  state: SpringState,
  target: number,
  delta: number,
  stiffness = 210,
  damping = 21
): number {
  const dt = Math.min(delta, 0.05);
  const force = (target - state.value) * stiffness;
  const damper = -state.velocity * damping;
  state.velocity += (force + damper) * dt;
  state.value += state.velocity * dt;
  return state.value;
}

export function disposeObject3D(root: THREE.Object3D): number {
  let disposedCount = 0;
  root.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    if (mesh.geometry) {
      mesh.geometry.dispose();
      disposedCount += 1;
    }
    if (mesh.material) {
      if (Array.isArray(mesh.material)) {
        mesh.material.forEach((m) => {
          const map = (m as THREE.MeshStandardMaterial).map;
          if (map) map.dispose();
          m.dispose();
        });
        disposedCount += mesh.material.length;
      } else {
        const map = (mesh.material as THREE.MeshStandardMaterial).map;
        if (map) map.dispose();
        mesh.material.dispose();
        disposedCount += 1;
      }
    }
  });
  return disposedCount;
}

function createRoundedBoxGeometry(
  width: number,
  height: number,
  radius: number,
  depth: number,
  bevel: number
): THREE.ExtrudeGeometry {
  const shape = new THREE.Shape();
  const x = -width / 2;
  const y = -height / 2;
  const w = width;
  const h = height;
  const r = Math.min(radius, w / 2, h / 2);
  shape.moveTo(x + r, y);
  shape.lineTo(x + w - r, y);
  shape.quadraticCurveTo(x + w, y, x + w, y + r);
  shape.lineTo(x + w, y + h - r);
  shape.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  shape.lineTo(x + r, y + h);
  shape.quadraticCurveTo(x, y + h, x, y + h - r);
  shape.lineTo(x, y + r);
  shape.quadraticCurveTo(x, y, x + r, y);

  const geom = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: bevel > 0,
    bevelSegments: 5,
    steps: 1,
    bevelSize: bevel,
    bevelThickness: bevel,
  });
  geom.center();
  return geom;
}

const GpuResourceLifecycle: React.FC = () => {
  const { gl, scene } = useThree();

  useEffect(() => {
    return () => {
      disposeObject3D(scene);
      gl.renderLists.dispose();
    };
  }, [gl, scene]);

  return null;
};

const ContactShadow: React.FC<{
  width?: number;
  height?: number;
  opacity?: number;
  y?: number;
}> = ({ width = 2.4, height = 1.4, opacity = 0.32, y = -0.74 }) => {
  const texture = useMemo(() => {
    if (typeof document === "undefined") return null;
    const canvas = document.createElement("canvas");
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    gradient.addColorStop(0, "rgba(0, 0, 0, 0.7)");
    gradient.addColorStop(0.35, "rgba(0, 0, 0, 0.36)");
    gradient.addColorStop(0.75, "rgba(0, 0, 0, 0.1)");
    gradient.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 128, 128);
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.ClampToEdgeWrapping;
    tex.wrapT = THREE.ClampToEdgeWrapping;
    return tex;
  }, []);

  useEffect(() => {
    return () => {
      if (texture) texture.dispose();
    };
  }, [texture]);

  if (!texture) return null;

  return (
    <mesh position={[0, y, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[width, height]} />
      <meshBasicMaterial
        map={texture}
        transparent
        opacity={opacity}
        depthWrite={false}
      />
    </mesh>
  );
};

const OverEarHeadbandRig: React.FC<SceneProps> = ({
  silhouette = "over-ear-sculpted",
  colorHex,
  accentHex = "#B89A74",
  lowBattery,
  pointerX,
  pointerY,
  reducedMotion,
  dragRotX = 0,
  dragRotY = 0,
}) => {
  const rootRef = useRef<THREE.Group>(null);
  const leftCupRef = useRef<THREE.Group>(null);
  const rightCupRef = useRef<THREE.Group>(null);
  const elapsedRef = useRef(0);
  const rotYSpring = useRef<SpringState>({ value: 0.55, velocity: 0 });
  const cupSwivelSpring = useRef<SpringState>({ value: 1.15, velocity: 0 });

  useEffect(() => {
    const group = rootRef.current;
    return () => {
      if (group) {
        disposeObject3D(group);
      }
    };
  }, []);

  useFrame((_, delta) => {
    const safeDelta = Math.min(delta, 0.1);
    elapsedRef.current += safeDelta;
    const t = elapsedRef.current;

    if (rootRef.current) {
      const targetRotY =
        pointerX * 0.24 +
        (reducedMotion ? 0 : Math.sin(t * 1.4) * 0.08) +
        (reducedMotion ? 0 : dragRotY);
      const nextRotY = reducedMotion
        ? targetRotY
        : stepSpring(rotYSpring.current, targetRotY, safeDelta, 180, 20);
      rootRef.current.rotation.y = nextRotY;
      rootRef.current.rotation.x = THREE.MathUtils.lerp(
        rootRef.current.rotation.x,
        pointerY * 0.12 + (reducedMotion ? 0 : dragRotX),
        0.12
      );
      rootRef.current.position.y = reducedMotion
        ? -0.05
        : -0.05 + Math.sin(t * 2.0) * 0.035;
    }

    if (leftCupRef.current && rightCupRef.current) {
      const unfoldTarget = t >= 0.15 ? 0.18 : 1.15;
      const swivel = reducedMotion
        ? 0.18
        : stepSpring(cupSwivelSpring.current, unfoldTarget, safeDelta, 195, 19);
      leftCupRef.current.rotation.y = swivel;
      rightCupRef.current.rotation.y = -swivel;
    }
  });

  const isOval = silhouette === "over-ear-oval";
  const ledColor = lowBattery ? "#ffd60a" : "#30d158";

  return (
    <group ref={rootRef} name="case_body" position={[0, -0.05, 0]}>
      <mesh position={[0, 0.25, 0]} rotation={[0, 0, 0]}>
        <torusGeometry args={[0.92, 0.052, 20, 64, Math.PI]} />
        <meshStandardMaterial
          color={accentHex}
          roughness={0.2}
          metalness={0.84}
        />
      </mesh>

      <mesh position={[0, 0.23, 0]} rotation={[0, 0, 0]}>
        <torusGeometry args={[0.87, 0.072, 18, 48, Math.PI * 0.74]} />
        <meshStandardMaterial
          color={colorHex}
          roughness={0.74}
          metalness={0.04}
        />
      </mesh>

      <mesh position={[-0.88, 0.04, 0]} rotation={[0, 0, 0.08]}>
        <cylinderGeometry args={[0.038, 0.038, 0.44, 20]} />
        <meshStandardMaterial
          color={accentHex}
          roughness={0.16}
          metalness={0.85}
        />
      </mesh>

      <mesh position={[-0.89, 0.22, 0]}>
        <cylinderGeometry args={[0.052, 0.052, 0.06, 20]} />
        <meshStandardMaterial
          color={accentHex}
          roughness={0.14}
          metalness={0.9}
        />
      </mesh>

      <mesh position={[0.88, 0.04, 0]} rotation={[0, 0, -0.08]}>
        <cylinderGeometry args={[0.038, 0.038, 0.44, 20]} />
        <meshStandardMaterial
          color={accentHex}
          roughness={0.16}
          metalness={0.85}
        />
      </mesh>

      <mesh position={[0.89, 0.22, 0]}>
        <cylinderGeometry args={[0.052, 0.052, 0.06, 20]} />
        <meshStandardMaterial
          color={accentHex}
          roughness={0.14}
          metalness={0.9}
        />
      </mesh>

      <group
        ref={leftCupRef}
        name="bud_left"
        position={[-0.84, -0.34, 0]}
        rotation={[0, 0.18, 0.22]}
      >
        <mesh scale={isOval ? [0.64, 1.18, 0.88] : [0.7, 1.1, 0.84]}>
          <sphereGeometry args={[0.42, 28, 28]} />
          <meshStandardMaterial
            color={colorHex}
            roughness={isOval ? 0.22 : 0.3}
            metalness={isOval ? 0.65 : 0.12}
          />
        </mesh>
        <mesh
          position={[0.08, 0, 0]}
          rotation={[0, Math.PI / 2, 0]}
          scale={[0.84, 1.1, 0.9]}
        >
          <torusGeometry args={[0.34, 0.02, 16, 40]} />
          <meshStandardMaterial
            color={accentHex}
            roughness={0.15}
            metalness={0.85}
          />
        </mesh>
        <mesh
          name="ear_cushions"
          position={[0.16, 0, 0]}
          rotation={[0, Math.PI / 2, 0]}
          scale={[0.82, 1.08, 0.9]}
        >
          <torusGeometry args={[0.28, 0.098, 20, 36]} />
          <meshStandardMaterial
            color={accentHex}
            roughness={0.68}
            metalness={0.03}
          />
        </mesh>
        <mesh
          position={[0.18, 0, 0]}
          rotation={[0, Math.PI / 2, 0]}
          scale={[0.78, 1.02, 0.85]}
        >
          <circleGeometry args={[0.22, 24]} />
          <meshStandardMaterial
            color="#1c1e24"
            roughness={0.5}
            metalness={0.4}
          />
        </mesh>
        <mesh name="led" position={[-0.24, -0.22, 0.22]}>
          <sphereGeometry args={[0.032, 14, 14]} />
          <meshStandardMaterial
            color={ledColor}
            emissive={ledColor}
            emissiveIntensity={2.8}
          />
        </mesh>
      </group>

      <group
        ref={rightCupRef}
        name="bud_right"
        position={[0.84, -0.34, 0]}
        rotation={[0, -0.18, -0.22]}
      >
        <mesh scale={isOval ? [0.64, 1.18, 0.88] : [0.7, 1.1, 0.84]}>
          <sphereGeometry args={[0.42, 28, 28]} />
          <meshStandardMaterial
            color={colorHex}
            roughness={isOval ? 0.22 : 0.3}
            metalness={isOval ? 0.65 : 0.12}
          />
        </mesh>
        <mesh
          position={[-0.08, 0, 0]}
          rotation={[0, Math.PI / 2, 0]}
          scale={[0.84, 1.1, 0.9]}
        >
          <torusGeometry args={[0.34, 0.02, 16, 40]} />
          <meshStandardMaterial
            color={accentHex}
            roughness={0.15}
            metalness={0.85}
          />
        </mesh>
        <mesh
          position={[-0.16, 0, 0]}
          rotation={[0, Math.PI / 2, 0]}
          scale={[0.82, 1.08, 0.9]}
        >
          <torusGeometry args={[0.28, 0.098, 20, 36]} />
          <meshStandardMaterial
            color={accentHex}
            roughness={0.68}
            metalness={0.03}
          />
        </mesh>
        <mesh
          position={[-0.18, 0, 0]}
          rotation={[0, Math.PI / 2, 0]}
          scale={[0.78, 1.02, 0.85]}
        >
          <circleGeometry args={[0.22, 24]} />
          <meshStandardMaterial
            color="#1c1e24"
            roughness={0.5}
            metalness={0.4}
          />
        </mesh>
      </group>

      <ContactShadow width={2.5} height={1.5} opacity={0.3} y={-0.78} />
    </group>
  );
};

const EarbudsRig: React.FC<SceneProps> = ({
  silhouette = "stem-earbuds",
  colorHex,
  accentHex = "#B89A74",
  lidOpen,
  lowBattery,
  pointerX,
  pointerY,
  reducedMotion,
  dragRotX = 0,
  dragRotY = 0,
}) => {
  const rootRef = useRef<THREE.Group>(null);
  const lidRef = useRef<THREE.Group>(null);
  const leftBudRef = useRef<THREE.Group>(null);
  const rightBudRef = useRef<THREE.Group>(null);
  const elapsedRef = useRef(0);
  const lidSpring = useRef<SpringState>({ value: 0, velocity: 0 });
  const leftYSpring = useRef<SpringState>({ value: 0.1, velocity: 0 });
  const rightYSpring = useRef<SpringState>({ value: 0.1, velocity: 0 });

  const isStemless = silhouette === "bud-in-ear";
  const ledColor = lowBattery ? "#ffd60a" : "#30d158";

  const caseBodyGeom = useMemo(() => {
    return isStemless
      ? createRoundedBoxGeometry(1.48, 0.72, 0.36, 0.54, 0.12)
      : createRoundedBoxGeometry(1.36, 0.82, 0.36, 0.42, 0.12);
  }, [isStemless]);

  const caseLidGeom = useMemo(() => {
    return isStemless
      ? createRoundedBoxGeometry(1.48, 0.28, 0.36, 0.54, 0.12)
      : createRoundedBoxGeometry(1.36, 0.32, 0.36, 0.42, 0.12);
  }, [isStemless]);

  useEffect(() => {
    const group = rootRef.current;
    return () => {
      if (group) {
        disposeObject3D(group);
      }
      caseBodyGeom.dispose();
      caseLidGeom.dispose();
    };
  }, [caseBodyGeom, caseLidGeom]);

  useFrame((_, delta) => {
    const safeDelta = Math.min(delta, 0.1);
    elapsedRef.current += safeDelta;
    const t = elapsedRef.current;

    if (rootRef.current) {
      const entryRotY = reducedMotion ? 0 : Math.max(0, 0.44 - t * 1.1);
      const targetRotY =
        entryRotY + pointerX * 0.18 + (reducedMotion ? 0 : dragRotY);
      const targetRotX = pointerY * 0.1 + (reducedMotion ? 0 : dragRotX);
      rootRef.current.rotation.y = THREE.MathUtils.lerp(
        rootRef.current.rotation.y,
        targetRotY,
        0.12
      );
      rootRef.current.rotation.x = THREE.MathUtils.lerp(
        rootRef.current.rotation.x,
        targetRotX,
        0.12
      );
    }

    if (lidRef.current) {
      const targetLid = lidOpen && t >= 0.18 ? -1.28 : 0;
      lidRef.current.rotation.x = reducedMotion
        ? targetLid
        : stepSpring(lidSpring.current, targetLid, safeDelta, 220, 20);
    }

    if (leftBudRef.current && rightBudRef.current) {
      const floatWave = reducedMotion ? 0 : Math.sin(t * 2.4) * 0.045;
      const leftTarget = lidOpen && t >= 0.45 ? 0.62 + floatWave : 0.1;
      const rightTarget = lidOpen && t >= 0.58 ? 0.62 - floatWave : 0.1;

      leftBudRef.current.position.y = reducedMotion
        ? leftTarget
        : stepSpring(leftYSpring.current, leftTarget, safeDelta, 180, 19);
      rightBudRef.current.position.y = reducedMotion
        ? rightTarget
        : stepSpring(rightYSpring.current, rightTarget, safeDelta, 180, 19);

      if (!reducedMotion && lidOpen && t >= 0.45) {
        leftBudRef.current.rotation.y += safeDelta * 0.48;
        rightBudRef.current.rotation.y -= safeDelta * 0.48;
      }
    }
  });

  const hingeZ = isStemless ? -0.38 : -0.32;
  const hingeY = isStemless ? 0.24 : 0.28;

  return (
    <group ref={rootRef} position={[0, -0.24, 0]}>
      <mesh
        name="case_body"
        position={[0, -0.22, 0]}
        geometry={caseBodyGeom}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial
          color={colorHex}
          roughness={isStemless ? 0.32 : 0.18}
          metalness={0.08}
        />
      </mesh>

      <mesh position={[-0.42, 0.28, 0]}>
        <cylinderGeometry args={[0.22, 0.19, 0.14, 24]} />
        <meshStandardMaterial
          color="#16181f"
          roughness={0.7}
          metalness={0.25}
        />
      </mesh>
      <mesh position={[-0.45, 0.24, 0]}>
        <cylinderGeometry args={[0.016, 0.016, 0.05, 8]} />
        <meshStandardMaterial
          color="#e5a93b"
          roughness={0.2}
          metalness={0.92}
        />
      </mesh>
      <mesh position={[-0.39, 0.24, 0]}>
        <cylinderGeometry args={[0.016, 0.016, 0.05, 8]} />
        <meshStandardMaterial
          color="#e5a93b"
          roughness={0.2}
          metalness={0.92}
        />
      </mesh>

      <mesh position={[0.42, 0.28, 0]}>
        <cylinderGeometry args={[0.22, 0.19, 0.14, 24]} />
        <meshStandardMaterial
          color="#16181f"
          roughness={0.7}
          metalness={0.25}
        />
      </mesh>
      <mesh position={[0.39, 0.24, 0]}>
        <cylinderGeometry args={[0.016, 0.016, 0.05, 8]} />
        <meshStandardMaterial
          color="#e5a93b"
          roughness={0.2}
          metalness={0.92}
        />
      </mesh>
      <mesh position={[0.45, 0.24, 0]}>
        <cylinderGeometry args={[0.016, 0.016, 0.05, 8]} />
        <meshStandardMaterial
          color="#e5a93b"
          roughness={0.2}
          metalness={0.92}
        />
      </mesh>

      <mesh
        position={[0, hingeY, hingeZ]}
        rotation={[0, 0, Math.PI / 2]}
      >
        <cylinderGeometry args={[0.042, 0.042, 0.54, 24]} />
        <meshStandardMaterial
          color={accentHex}
          roughness={0.16}
          metalness={0.88}
        />
      </mesh>

      <group ref={lidRef} name="case_lid" position={[0, hingeY, hingeZ]}>
        <mesh
          position={[0, 0.2, -hingeZ]}
          geometry={caseLidGeom}
          castShadow
        >
          <meshStandardMaterial
            color={colorHex}
            roughness={isStemless ? 0.3 : 0.16}
            metalness={0.08}
          />
        </mesh>
      </group>

      <group ref={leftBudRef} name="bud_left" position={[-0.44, 0.1, 0]}>
        <mesh
          scale={isStemless ? [1.12, 0.94, 1.22] : [1.02, 0.94, 1.12]}
          castShadow
        >
          <sphereGeometry args={[0.24, 26, 26]} />
          <meshStandardMaterial
            color={colorHex}
            roughness={0.16}
            metalness={0.08}
          />
        </mesh>

        <mesh
          position={[0.13, 0.04, 0.13]}
          rotation={[0.25, 0.35, 0]}
        >
          <cylinderGeometry args={[0.1, 0.16, 0.13, 24]} />
          <meshStandardMaterial
            color={colorHex}
            roughness={0.65}
            metalness={0.02}
          />
        </mesh>
        <mesh
          position={[0.18, 0.07, 0.21]}
          rotation={[0.25, 0.35, 0]}
        >
          <circleGeometry args={[0.075, 16]} />
          <meshStandardMaterial
            color="#1e2026"
            roughness={0.4}
            metalness={0.7}
          />
        </mesh>

        {isStemless ? (
          <group
            position={[-0.12, 0.08, 0.16]}
            rotation={[0.4, -0.3, 0]}
          >
            <mesh>
              <cylinderGeometry args={[0.14, 0.14, 0.05, 24]} />
              <meshStandardMaterial
                color={accentHex}
                roughness={0.2}
                metalness={0.78}
              />
            </mesh>
            <mesh position={[0, 0.026, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[0.135, 0.016, 16, 24]} />
              <meshStandardMaterial
                color="#e0e1e6"
                roughness={0.14}
                metalness={0.92}
              />
            </mesh>
          </group>
        ) : (
          <group
            position={[-0.05, -0.26, 0.04]}
            rotation={[0.12, 0, -0.14]}
          >
            <mesh>
              <cylinderGeometry args={[0.062, 0.052, 0.44, 20]} />
              <meshStandardMaterial
                color={colorHex}
                roughness={0.18}
                metalness={0.1}
              />
            </mesh>
            <mesh position={[0, -0.21, 0]}>
              <cylinderGeometry args={[0.054, 0.054, 0.045, 20]} />
              <meshStandardMaterial
                color="#dcdfe6"
                roughness={0.12}
                metalness={0.95}
              />
            </mesh>
            <mesh position={[-0.056, 0.02, 0]}>
              <boxGeometry args={[0.015, 0.07, 0.02]} />
              <meshStandardMaterial
                color="#22242a"
                roughness={0.5}
                metalness={0.6}
              />
            </mesh>
          </group>
        )}
      </group>

      <group ref={rightBudRef} name="bud_right" position={[0.44, 0.1, 0]}>
        <mesh
          scale={isStemless ? [1.12, 0.94, 1.22] : [1.02, 0.94, 1.12]}
          castShadow
        >
          <sphereGeometry args={[0.24, 26, 26]} />
          <meshStandardMaterial
            color={colorHex}
            roughness={0.16}
            metalness={0.08}
          />
        </mesh>

        <mesh
          position={[-0.13, 0.04, 0.13]}
          rotation={[0.25, -0.35, 0]}
        >
          <cylinderGeometry args={[0.1, 0.16, 0.13, 24]} />
          <meshStandardMaterial
            color={colorHex}
            roughness={0.65}
            metalness={0.02}
          />
        </mesh>
        <mesh
          position={[-0.18, 0.07, 0.21]}
          rotation={[0.25, -0.35, 0]}
        >
          <circleGeometry args={[0.075, 16]} />
          <meshStandardMaterial
            color="#1e2026"
            roughness={0.4}
            metalness={0.7}
          />
        </mesh>

        {isStemless ? (
          <group
            position={[0.12, 0.08, 0.16]}
            rotation={[0.4, 0.3, 0]}
          >
            <mesh>
              <cylinderGeometry args={[0.14, 0.14, 0.05, 24]} />
              <meshStandardMaterial
                color={accentHex}
                roughness={0.2}
                metalness={0.78}
              />
            </mesh>
            <mesh position={[0, 0.026, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[0.135, 0.016, 16, 24]} />
              <meshStandardMaterial
                color="#e0e1e6"
                roughness={0.14}
                metalness={0.92}
              />
            </mesh>
          </group>
        ) : (
          <group
            position={[0.05, -0.26, 0.04]}
            rotation={[0.12, 0, 0.14]}
          >
            <mesh>
              <cylinderGeometry args={[0.062, 0.052, 0.44, 20]} />
              <meshStandardMaterial
                color={colorHex}
                roughness={0.18}
                metalness={0.1}
              />
            </mesh>
            <mesh position={[0, -0.21, 0]}>
              <cylinderGeometry args={[0.054, 0.054, 0.045, 20]} />
              <meshStandardMaterial
                color="#dcdfe6"
                roughness={0.12}
                metalness={0.95}
              />
            </mesh>
            <mesh position={[0.056, 0.02, 0]}>
              <boxGeometry args={[0.015, 0.07, 0.02]} />
              <meshStandardMaterial
                color="#22242a"
                roughness={0.5}
                metalness={0.6}
              />
            </mesh>
          </group>
        )}
      </group>

      <mesh name="led" position={[0, -0.12, isStemless ? 0.44 : 0.38]}>
        <sphereGeometry args={[0.04, 16, 16]} />
        <meshStandardMaterial
          color={ledColor}
          emissive={ledColor}
          emissiveIntensity={2.8}
          roughness={0.1}
        />
      </mesh>

      <ContactShadow width={2.2} height={1.3} opacity={0.34} y={-0.74} />
    </group>
  );
};

export const Scene: React.FC<SceneProps> = (props) => {
  const [pageVisible, setPageVisible] = useState<boolean>(() =>
    typeof document !== "undefined" ? !document.hidden : true
  );

  useEffect(() => {
    const onVisibilityChange = () => {
      setPageVisible(!document.hidden);
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", onVisibilityChange);
  }, []);

  if (typeof window !== "undefined" && !("WebGLRenderingContext" in window)) {
    return (
      <div
        data-testid="scene-fallback"
        style={{
          width: "100%",
          height: "196px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      />
    );
  }

  const [dragAngle, setDragAngle] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const activeFrameloop = !pageVisible
    ? "never"
    : props.reducedMotion
    ? "demand"
    : "always";

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (props.reducedMotion) return;
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {}
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging || props.reducedMotion) return;
    const dx = (e.clientX - dragStartRef.current.x) * 0.015;
    const dy = (e.clientY - dragStartRef.current.y) * 0.015;
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    setDragAngle((prev) => ({
      x: Math.max(-0.65, Math.min(0.65, prev.x + dy)),
      y: prev.y + dx,
    }));
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsDragging(false);
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {}
  };

  const handleDoubleClick = () => {
    setDragAngle({ x: 0, y: 0 });
  };

  return (
    <div
      data-testid="popup-3d-scene"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onDoubleClick={handleDoubleClick}
      title={props.interactiveHint ?? "Arrastra para rotar • Doble clic para centrar"}
      style={{
        width: "100%",
        height: "196px",
        position: "relative",
        cursor: isDragging ? "grabbing" : "grab",
      }}
    >
      <Canvas
        frameloop={activeFrameloop}
        dpr={[1, 1.5]}
        camera={{ position: [0, 0.48, 3.3], fov: 36 }}
        gl={{
          alpha: true,
          antialias: true,
          powerPreference: "low-power",
          stencil: false,
          depth: true,
        }}
      >
        <GpuResourceLifecycle />
        <ambientLight intensity={0.72} />
        <directionalLight position={[2.8, 4.0, 3.4]} intensity={1.6} />
        <directionalLight
          position={[-2.8, 2.0, -2.4]}
          intensity={0.85}
          color="#a5c8ff"
        />
        <directionalLight
          position={[0, 3.2, -3.0]}
          intensity={0.9}
          color="#ffffff"
        />
        <pointLight
          position={[0, -0.14, 0.65]}
          intensity={0.65}
          distance={2.5}
          color="#30d158"
        />
        {props.kind === "over-ear" ? (
          <OverEarHeadbandRig
            {...props}
            dragRotX={dragAngle.x}
            dragRotY={dragAngle.y}
          />
        ) : (
          <EarbudsRig
            {...props}
            dragRotX={dragAngle.x}
            dragRotY={dragAngle.y}
          />
        )}
      </Canvas>
    </div>
  );
};