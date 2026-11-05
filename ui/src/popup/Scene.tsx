import React, { useEffect, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

export interface SceneProps {
  modelId: string;
  kind: "earbuds" | "over-ear";
  colorHex: string;
  lidOpen: boolean;
  lowBattery: boolean;
  pointerX: number;
  pointerY: number;
  reducedMotion: boolean;
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

interface EarbudsRigProps {
  kind: "earbuds" | "over-ear";
  colorHex: string;
  lidOpen: boolean;
  lowBattery: boolean;
  pointerX: number;
  pointerY: number;
  reducedMotion: boolean;
}

const EarbudsRig: React.FC<EarbudsRigProps> = ({
  kind,
  colorHex,
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
      const targetRotY = entryRotY + pointerX * 0.16;
      const targetRotX = pointerY * 0.1;
      rootRef.current.rotation.y = THREE.MathUtils.lerp(
        rootRef.current.rotation.y,
        targetRotY,
        0.1
      );
      rootRef.current.rotation.x = THREE.MathUtils.lerp(
        rootRef.current.rotation.x,
        targetRotX,
        0.1
      );
    }

    if (lidRef.current) {
      const shouldOpen = lidOpen && t >= 0.2;
      const targetLidAngle = shouldOpen ? -1.22 : 0;
      lidRef.current.rotation.x = THREE.MathUtils.lerp(
        lidRef.current.rotation.x,
        targetLidAngle,
        reducedMotion ? 1 : 0.12
      );
    }

    if (leftBudRef.current && rightBudRef.current) {
      const leftReady = lidOpen && t >= 0.5;
      const rightReady = lidOpen && t >= 0.62;
      const floatWave = reducedMotion ? 0 : Math.sin(t * 2.2) * 0.05;

      const leftTargetY = leftReady ? 0.58 + floatWave : 0.12;
      const rightTargetY = rightReady ? 0.58 - floatWave : 0.12;

      leftBudRef.current.position.y = THREE.MathUtils.lerp(
        leftBudRef.current.position.y,
        leftTargetY,
        0.09
      );
      rightBudRef.current.position.y = THREE.MathUtils.lerp(
        rightBudRef.current.position.y,
        rightTargetY,
        0.09
      );

      if (!reducedMotion && leftReady) {
        leftBudRef.current.rotation.y += safeDelta * 0.45;
        rightBudRef.current.rotation.y -= safeDelta * 0.45;
      }
    }
  });

  const ledColor = lowBattery ? "#ffd60a" : "#30d158";

  return (
    <group ref={rootRef} position={[0, -0.25, 0]}>
      <mesh name="case_body" position={[0, -0.22, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.65, 1.08, 0.76]} />
        <meshStandardMaterial
          color={colorHex}
          roughness={0.22}
          metalness={0.06}
        />
      </mesh>

      <group ref={lidRef} name="case_lid" position={[0, 0.32, -0.38]}>
        <mesh position={[0, 0.22, 0.38]} castShadow>
          <boxGeometry args={[1.65, 0.46, 0.76]} />
          <meshStandardMaterial
            color={colorHex}
            roughness={0.2}
            metalness={0.06}
          />
        </mesh>
      </group>

      <group ref={leftBudRef} name="bud_left" position={[-0.44, 0.12, 0]}>
        <mesh castShadow>
          <sphereGeometry args={[0.26, 20, 20]} />
          <meshStandardMaterial
            color={colorHex}
            roughness={0.18}
            metalness={0.08}
          />
        </mesh>
        <mesh position={[0, -0.28, 0]}>
          <cylinderGeometry args={[0.075, 0.065, 0.44, 14]} />
          <meshStandardMaterial
            color={colorHex}
            roughness={0.2}
            metalness={0.1}
          />
        </mesh>
      </group>

      <group ref={rightBudRef} name="bud_right" position={[0.44, 0.12, 0]}>
        <mesh castShadow>
          <sphereGeometry args={[0.26, 20, 20]} />
          <meshStandardMaterial
            color={colorHex}
            roughness={0.18}
            metalness={0.08}
          />
        </mesh>
        <mesh position={[0, -0.28, 0]}>
          <cylinderGeometry args={[0.075, 0.065, 0.44, 14]} />
          <meshStandardMaterial
            color={colorHex}
            roughness={0.2}
            metalness={0.1}
          />
        </mesh>
      </group>

      {kind === "over-ear" && (
        <mesh name="ear_cushions" position={[0, 0.55, 0]}>
          <torusGeometry args={[0.72, 0.12, 14, 32]} />
          <meshStandardMaterial
            color={colorHex}
            roughness={0.32}
            metalness={0.24}
          />
        </mesh>
      )}

      <mesh name="led" position={[0, -0.14, 0.39]}>
        <sphereGeometry args={[0.045, 12, 12]} />
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
          height: "190px",
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
      style={{ width: "100%", height: "190px", position: "relative" }}
    >
      <Canvas
        frameloop={activeFrameloop}
        dpr={[1, 1.5]}
        camera={{ position: [0, 0.65, 3.3], fov: 38 }}
        gl={{
          alpha: true,
          antialias: true,
          powerPreference: "low-power",
          stencil: false,
          depth: true,
        }}
      >
        <GpuResourceLifecycle />
        <ambientLight intensity={0.65} />
        <directionalLight position={[2.6, 3.8, 3.2]} intensity={1.35} />
        <directionalLight
          position={[-2.4, 1.5, -2.0]}
          intensity={0.55}
          color="#38bdf8"
        />
        <pointLight
          position={[0, -0.14, 0.6]}
          intensity={0.6}
          distance={2.5}
          color="#30d158"
        />
        <EarbudsRig {...props} />
      </Canvas>
    </div>
  );
};
