import { OrbitControls, Grid, PerspectiveCamera, Environment, Stars, Float, Text } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { Suspense, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { handStore } from "../state/handStore";
import * as THREE from "three";
import { HandSkeleton3D } from "./HandSkeleton3D";

export const Experience = () => {
  const cubeRef = useRef<THREE.Group>(null);
  const partsRef = useRef<THREE.Mesh[]>([]);

  const prevDistRef = useRef<number>(0);
  const prevAngleRef = useRef<number>(0);
  const initialScaleRef = useRef<THREE.Vector3>(new THREE.Vector3(1, 1, 1));
  const initialRotationRef = useRef<THREE.Euler>(new THREE.Euler());

  useFrame(() => {
    const { hands, pinchPosition, isPinching, isExploded, isTwoHandMode, handDistance, handCenter } = handStore.getData();
    
    if (cubeRef.current) {
      if (isTwoHandMode && handDistance > 0) {
        // Handle Scaling
        if (prevDistRef.current === 0) {
          prevDistRef.current = handDistance;
          initialScaleRef.current.copy(cubeRef.current.scale);
        } else {
          const scaleDelta = handDistance / prevDistRef.current;
          const targetScale = initialScaleRef.current.clone().multiplyScalar(scaleDelta);
          cubeRef.current.scale.lerp(targetScale, 0.1);
        }

        // Handle Rotation
        if (hands.length >= 2) {
          const p1 = hands[0].keypoints.find((k: any) => k.name === 'index_finger_tip');
          const p2 = hands[1].keypoints.find((k: any) => k.name === 'index_finger_tip');
          if (p1 && p2) {
            const currentAngle = Math.atan2(p2.y - p1.y, p2.x - p1.x);
            if (prevAngleRef.current === 0) {
              prevAngleRef.current = currentAngle;
              initialRotationRef.current.copy(cubeRef.current.rotation);
            } else {
              const angleDelta = currentAngle - prevAngleRef.current;
              cubeRef.current.rotation.y = initialRotationRef.current.y + angleDelta;
            }
          }
        }

        // Handle Movement with two hands (center focus)
        if (handCenter) {
          const nx = (handCenter.x / 640) * 2 - 1;
          const ny = -(handCenter.y / 480) * 2 + 1;
          const targetPos = new THREE.Vector3(nx * 5, ny * 3 + 1, 0);
          cubeRef.current.position.lerp(targetPos, 0.1);
        }
      } else if (pinchPosition) {
        // Reset scale tracking when not in two-hand mode
        prevDistRef.current = 0;
        prevAngleRef.current = 0;

        // Normalized: x: [-1, 1], y: [1, -1]
        const nx = (pinchPosition.x / 640) * 2 - 1;
        const ny = -(pinchPosition.y / 480) * 2 + 1;
        
        // We use a broader mapping for the scene
        const targetPos = new THREE.Vector3(nx * 5, ny * 3 + 1, 0);
        
        if (isPinching) {
          cubeRef.current.position.lerp(targetPos, 0.1);
          cubeRef.current.scale.lerp(new THREE.Vector3(1.2, 1.2, 1.2), 0.1);
        } else {
          cubeRef.current.scale.lerp(new THREE.Vector3(1, 1, 1), 0.05);
        }
      } else {
        prevDistRef.current = 0;
        prevAngleRef.current = 0;
      }
    }

    // Explode Animation
    partsRef.current.forEach((part, i) => {
      if (!part) return;
      const offset = new THREE.Vector3(
        (i % 2 === 0 ? 0.7 : -0.7) * (isExploded ? 2 : 0),
        (Math.floor(i / 2) === 0 ? 0.7 : -0.7) * (isExploded ? 2 : 0),
        0
      );
      part.position.lerp(offset, 0.1);
    });
  });

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 2, 5]} />
      <OrbitControls makeDefault minPolarAngle={0} maxPolarAngle={Math.PI / 1.75} />

      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} color="#00f2ff" />
      <spotLight position={[-10, 10, 10]} angle={0.15} penumbra={1} intensity={2} color="#00f2ff" />

      {/* Post Processing */}
      <EffectComposer>
        <Bloom luminanceThreshold={1} mipmapBlur intensity={1.5} radius={0.4} />
      </EffectComposer>

      {/* Environment */}
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      <Environment preset="night" />
      
      <Suspense fallback={null}>
        <group>
          {/* Main Grid Floor */}
          <Grid
            infiniteGrid
            cellSize={0.5}
            sectionSize={2.5}
            fadeDistance={30}
            cellColor="#00f2ff"
            sectionColor="#00f2ff"
            cellThickness={1}
            sectionThickness={1.5}
          />

          {/* Hologram Placeholder */}
          <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
            <group ref={cubeRef}>
              <Text
                position={[0, 1.2, 0]}
                fontSize={0.2}
                color={handStore.getData().isPinching ? "#ffea00" : "#00f2ff"}
                anchorX="center"
                anchorY="middle"
              >
                {handStore.getData().isTwoHandMode 
                  ? "MULTI-HAND CONTROL" 
                  : handStore.getData().isPinching 
                    ? "OBJECT LINKED" 
                    : "OBJECT MODULE v1"}
              </Text>
              {/* Part 1 */}
              <mesh ref={el => partsRef.current[0] = el!} position={[0, 1, 0]}>
                <boxGeometry args={[0.5, 0.5, 0.5]} />
                <meshStandardMaterial 
                  color={handStore.getData().isPinching ? "#ffea00" : "#00f2ff"} 
                  wireframe 
                  transparent 
                  opacity={0.3} 
                  emissive={handStore.getData().isPinching ? "#ffea00" : "#00f2ff"} 
                  emissiveIntensity={handStore.getData().isPinching ? 4 : 2} 
                />
              </mesh>
              {/* Part 2 */}
              <mesh ref={el => partsRef.current[1] = el!} position={[0, 1, 0]}>
                <boxGeometry args={[0.5, 0.5, 0.5]} />
                <meshStandardMaterial 
                  color={handStore.getData().isPinching ? "#ffea00" : "#00f2ff"} 
                  wireframe 
                  transparent 
                  opacity={0.3} 
                  emissive={handStore.getData().isPinching ? "#ffea00" : "#00f2ff"} 
                  emissiveIntensity={handStore.getData().isPinching ? 4 : 2} 
                />
              </mesh>
              {/* Part 3 */}
              <mesh ref={el => partsRef.current[2] = el!} position={[0, 1, 0]}>
                <boxGeometry args={[0.5, 0.5, 0.5]} />
                <meshStandardMaterial 
                  color={handStore.getData().isPinching ? "#ffea00" : "#00f2ff"} 
                  wireframe 
                  transparent 
                  opacity={0.3} 
                  emissive={handStore.getData().isPinching ? "#ffea00" : "#00f2ff"} 
                  emissiveIntensity={handStore.getData().isPinching ? 4 : 2} 
                />
              </mesh>
              {/* Part 4 */}
              <mesh ref={el => partsRef.current[3] = el!} position={[0, 1, 0]}>
                <boxGeometry args={[0.5, 0.5, 0.5]} />
                <meshStandardMaterial 
                  color={handStore.getData().isPinching ? "#ffea00" : "#00f2ff"} 
                  wireframe 
                  transparent 
                  opacity={0.3} 
                  emissive={handStore.getData().isPinching ? "#ffea00" : "#00f2ff"} 
                  emissiveIntensity={handStore.getData().isPinching ? 4 : 2} 
                />
              </mesh>
            </group>
          </Float>

          {/* 3D Hand Skeleton & Pointer */}
          <HandSkeleton3D />
        </group>
      </Suspense>
    </>
  );
};
