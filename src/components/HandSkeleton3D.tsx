import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { handStore } from "../state/handStore";
import * as THREE from "three";
import { Sphere, Line } from "@react-three/drei";

export const HandSkeleton3D = () => {
  const pointsRef = useRef<THREE.Group>(null);
  const connectionsRef = useRef<THREE.Group>(null);
  const pointerRef = useRef<THREE.Group>(null);

  const connections = [
    [0, 1], [1, 2], [2, 3], [3, 4], // thumb
    [0, 5], [5, 6], [6, 7], [7, 8], // index
    [0, 9], [9, 10], [10, 11], [11, 12], // middle
    [0, 13], [13, 14], [14, 15], [15, 16], // ring
    [0, 17], [17, 18], [18, 19], [19, 20], // pinky
    [0, 5], [5, 9], [9, 13], [13, 17], [17, 0] // palm
  ];

  useFrame(() => {
    const { rawKeypoints } = handStore.getData();
    if (!rawKeypoints || rawKeypoints.length === 0) {
      if (pointsRef.current) pointsRef.current.visible = false;
      if (connectionsRef.current) connectionsRef.current.visible = false;
      if (pointerRef.current) pointerRef.current.visible = false;
      return;
    }

    if (pointsRef.current) pointsRef.current.visible = true;
    if (connectionsRef.current) connectionsRef.current.visible = true;
    if (pointerRef.current) pointerRef.current.visible = true;

    const landmarks = rawKeypoints[0]; // Primary hand
    if (!landmarks) return;

    // Map landmarks to 3D space
    // Detection can return normalized [0-1] or pixel [0-640] coords depending on runtime
    const mapTo3D = (pt: any) => {
      let nx = pt.x;
      let ny = pt.y;
      
      // If values are > 1, assume pixel space and normalize
      if (nx > 1) nx = nx / 640;
      if (ny > 1) ny = ny / 480;
      
      // Map to NDC [-1, 1]
      const finalX = nx * 2 - 1;
      const finalY = -(ny * 2 - 1);
      
      return new THREE.Vector3(finalX * 5, finalY * 3 + 1, -0.5);
    };

    // Update Joints
    if (pointsRef.current) {
      pointsRef.current.children.forEach((child, i) => {
        if (landmarks[i]) {
          child.position.copy(mapTo3D(landmarks[i]));
        }
      });
    }

    // Update Bones
    if (connectionsRef.current) {
      connectionsRef.current.children.forEach((line: any, i) => {
        const [a, b] = connections[i];
        if (landmarks[a] && landmarks[b]) {
          const start = mapTo3D(landmarks[a]);
          const end = mapTo3D(landmarks[b]);
          line.setPoints([start, end]);
        }
      });
    }

    // Update Pointer (Index Finger Tip)
    if (pointerRef.current && landmarks[8]) {
      pointerRef.current.position.copy(mapTo3D(landmarks[8]));
    }
  });

  return (
    <group>
      {/* Joints */}
      <group ref={pointsRef}>
        {Array.from({ length: 21 }).map((_, i) => (
          <Sphere key={i} args={[0.03, 8, 8]}>
            <meshStandardMaterial color="#00f2ff" emissive="#00f2ff" emissiveIntensity={2} transparent opacity={0.6} />
          </Sphere>
        ))}
      </group>

      {/* Bones */}
      <group ref={connectionsRef}>
        {connections.map((_, i) => (
          <Line
            key={i}
            points={[new THREE.Vector3(), new THREE.Vector3()]}
            color="#00f2ff"
            lineWidth={1}
            transparent
            opacity={0.4}
          />
        ))}
      </group>

      {/* Primary Pointer */}
      <group ref={pointerRef}>
        <Sphere args={[0.06, 16, 16]}>
          <meshStandardMaterial color="#ffea00" emissive="#ffea00" emissiveIntensity={5} />
        </Sphere>
        {/* Pointer Glow Ring */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.1, 0.12, 32]} />
          <meshStandardMaterial color="#ffea00" emissive="#ffea00" emissiveIntensity={10} side={THREE.DoubleSide} />
        </mesh>
      </group>
    </group>
  );
};
