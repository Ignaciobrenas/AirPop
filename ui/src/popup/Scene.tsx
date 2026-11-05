import React, { useEffect, useRef, useState } from "react";
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
        mesh.material.forEach((m) => m.dispose());
        disposedCount += mesh.material.length;
      } else {
        mesh.material.dispose();
        disposedCount += 1;
      }
    }
  });
  return disposedCount;
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

const OverEarHeadbandRig: React.FC<SceneProps> = ({
  silhouette = "over-ear-sculpted",
  colorHex,
  accentHex = "#B89A74",
  lowBattery,
  pointerX,
  pointerY,
  reducedMotion,
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
      const targetRotY = pointerX * 0.24 + (reducedMotion ? 0 : Math.sin(t * 1.4) * 0.08);
      const nextRotY = reducedMotion
        ? targetRotY
        : stepSpring(rotYSpring.current, targetRotY, safeDelta, 180, 20);
      rootRef.current.rotation.y = nextRotY;
      rootRef.current.rotation.x = THREE.MathUtils.lerp(
        rootRef.current.rotation.x,
        pointerY * 0.12,
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
      <mesh position={[0, 0.22, 0]} rotation={[0, 0, 0]}>
        <torusGeometry args={[0.88, 0.095, 20, 48, Math.PI]} />
        <meshStandardMaterial
          color={colorHex}
          roughness={0.35}
          metalness={0.08}
        />
      </mesh>

      <mesh position={[-0.86, 0.05, 0]} rotation={[0, 0, 0.08]}>
        <cylinderGeometry args={[0.038, 0.038, 0.42, 16]} />
        <meshStandardMaterial
          color={accentHex}
          roughness={0.18}
          metalness={0.78}
        />
      </mesh>

      <mesh position={[0.86, 0.05, 0]} rotation={[0, 0, -0.08]}>
        <cylinderGeometry args={[0.038, 0.038, 0.42, 16]} />
        <meshStandardMaterial
          color={accentHex}
          roughness={0.18}
          metalness={0.78}
        />
      </mesh>

      <group
        ref={leftCupRef}
        name="bud_left"
        position={[-0.82, -0.34, 0]}
        rotation={[0, 0.18, 0.22]}
      >
        <mesh scale={isOval ? [0.62, 1.15, 0.86] : [0.68, 1.08, 0.82]}>
          <sphereGeometry args={[0.42, 24, 24]} />
          <meshStandardMaterial
            color={colorHex}
            roughness={isOval ? 0.22 : 0.34}
            metalness={isOval ? 0.65 : 0.12}
          />
        </mesh>
        <mesh
          name="ear_cushions"
          position={[0.14, 0, 0]}
          rotation={[0, Math.PI / 2, 0]}
          scale={[0.82, 1.08, 0.9]}
        >
          <torusGeometry args={[0.28, 0.095, 16, 32]} />
          <meshStandardMaterial
            color={accentHex}
            roughness={0.62}
            metalness={0.04}
          />
        </mesh>
        <mesh name="led" position={[-0.24, -0.22, 0.22]}>
          <sphereGeometry args={[0.032, 12, 12]} />
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
        position={[0.82, -0.34, 0]}
        rotation={[0, -0.18, -0.22]}
      >
        <mesh scale={isOval ? [0.62, 1.15, 0.86] : [0.68, 1.08, 0.82]}>
          <sphereGeometry args={[0.42, 24, 24]} />
          <meshStandardMaterial
            color={colorHex}
            roughness={isOval ? 0.22 : 0.34}
            metalness={isOval ? 0.65 : 0.12}
          />
        </mesh>
        <mesh
          position={[-0.14, 0, 0]}
          rotation={[0, Math.PI / 2, 0]}
          scale={[0.82, 1.08, 0.9]}
        >
          <torusGeometry args={[0.28, 0.095, 16, 32]} />
          <meshStandardMaterial
            color={accentHex}
            roughness={0.62}
            metalness={0.04}
          />
        </mesh>
      </group>
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
}) => {
  const rootRef = useRef<THREE.Group>(null);
  const lidRef = useRef<THREE.Group>(null);
  const leftBudRef = useRef<THREE.Group>(null);
  const rightBudRef = useRef<THREE.Group>(null);
  const elapsedRef = useRef(0);
  const lidSpring = useRef<SpringState>({ value: 0, velocity: 0 });
  const leftYSpring = useRef<SpringState>({ value: 0.1, velocity: 0 });
  const rightYSpring = useRef<SpringState>({ value: 0.1, velocity: 0 });

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
      const entryRotY = reducedMotion ? 0 : Math.max(0, 0.44 - t * 1.1);
      const targetRotY = entryRotY + pointerX * 0.18;
      const targetRotX = pointerY * 0.1;
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
      const targetLid = lidOpen && t >= 0.18 ? -1.26 : 0;
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

  const isStemless = silhouette === "bud-in-ear";
  const ledColor = lowBattery ? "#ffd60a" : "#30d158";

  return (
    <group ref={rootRef} position={[0, -0.26, 0]}>
      <mesh
        name="case_body"
        position={[0, -0.22, 0]}
        scale={isStemless ? [1.12, 0.86, 1.08] : [1, 1, 1]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[1.64, 1.06, 0.76]} />
        <meshStandardMaterial
          color={colorHex}
          roughness={isStemless ? 0.36 : 0.2}
          metalness={0.08}
        />
      </mesh>

      <mesh position={[0, 0.28, -0.38]}>
        <boxGeometry args={[0.52, 0.07, 0.04]} />
        <meshStandardMaterial
          color={accentHex}
          roughness={0.18}
          metalness={0.82}
        />
      </mesh>

      <group ref={lidRef} name="case_lid" position={[0, 0.31, -0.38]}>
        <mesh
          position={[0, 0.21, 0.38]}
          scale={isStemless ? [1.12, 0.88, 1.08] : [1, 1, 1]}
          castShadow
        >
          <boxGeometry args={[1.64, 0.44, 0.76]} />
          <meshStandardMaterial
            color={colorHex}
            roughness={isStemless ? 0.34 : 0.18}
            metalness={0.08}
          />
        </mesh>
      </group>

      <group ref={leftBudRef} name="bud_left" position={[-0.44, 0.1, 0]}>
        <mesh scale={isStemless ? [1.15, 0.92, 1.25] : [1, 0.92, 1.15]} castShadow>
          <sphereGeometry args={[0.25, 22, 22]} />
          <meshStandardMaterial
            color={colorHex}
            roughness={0.18}
            metalness={0.1}
          />
        </mesh>
        {isStemless ? (
          <mesh position={[-0.12, 0.08, 0.16]} rotation={[0.4, -0.3, 0]}>
            <cylinderGeometry args={[0.14, 0.14, 0.05, 20]} />
            <meshStandardMaterial
              color={accentHex}
              roughness={0.22}
              metalness={0.76}
            />
          </mesh>
        ) : (
          <mesh position={[-0.05, -0.26, 0.04]} rotation={[0.12, 0, -0.14]}>
            <cylinderGeometry args={[0.072, 0.062, 0.44, 16]} />
            <meshStandardMaterial
              color={colorHex}
              roughness={0.2}
              metalness={0.12}
            />
          </mesh>
        )}
      </group>

      <group ref={rightBudRef} name="bud_right" position={[0.44, 0.1, 0]}>
        <mesh scale={isStemless ? [1.15, 0.92, 1.25] : [1, 0.92, 1.15]} castShadow>
          <sphereGeometry args={[0.25, 22, 22]} />
          <meshStandardMaterial
            color={colorHex}
            roughness={0.18}
            metalness={0.1}
          />
        </mesh>
        {isStemless ? (
          <mesh position={[0.12, 0.08, 0.16]} rotation={[0.4, 0.3, 0]}>
            <cylinderGeometry args={[0.14, 0.14, 0.05, 20]} />
            <meshStandardMaterial
              color={accentHex}
              roughness={0.22}
              metalness={0.76}
            />
          </mesh>
        ) : (
          <mesh position={[0.05, -0.26, 0.04]} rotation={[0.12, 0, 0.14]}>
            <cylinderGeometry args={[0.072, 0.062, 0.44, 16]} />
            <meshStandardMaterial
              color={colorHex}
              roughness={0.2}
              metalness={0.12}
            />
          </mesh>
        )}
      </group>

      <mesh name="led" position={[0, -0.14, 0.39]}>
        <sphereGeometry args={[0.045, 14, 14]} />
        <meshStandardMaterial
          color={ledColor}
          emissive={ledColor}
          emissiveIntensity={2.8}
          roughness={0.1}
        />
      </mesh>
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

  const activeFrameloop = !pageVisible
    ? "never"
    : props.reducedMotion
    ? "demand"
    : "always";

  return (
    <div
      data-testid="popup-3d-scene"
      style={{ width: "100%", height: "196px", position: "relative" }}
    >
      <Canvas
        frameloop={activeFrameloop}
        dpr={[1, 1.5]}
        camera={{ position: [0, 0.55, 3.35], fov: 38 }}
        gl={{
          alpha: true,
          antialias: true,
          powerPreference: "low-power",
          stencil: false,
          depth: true,
        }}
      >
        <GpuResourceLifecycle />
        <ambientLight intensity={0.68} />
        <directionalLight position={[2.6, 3.8, 3.2]} intensity={1.4} />
        <directionalLight
          position={[-2.4, 1.5, -2.0]}
          intensity={0.58}
          color="#38bdf8"
        />
        <pointLight
          position={[0, -0.14, 0.65]}
          intensity={0.6}
          distance={2.5}
          color="#30d158"
        />
        {props.kind === "over-ear" ? (
          <OverEarHeadbandRig {...props} />
        ) : (
          <EarbudsRig {...props} />
        )}
      </Canvas>
    </div>
  );
};
