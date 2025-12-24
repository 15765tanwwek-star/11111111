
import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { COLORS } from '../constants';

interface Props {
  progress: React.MutableRefObject<number>;
}

const Topper: React.FC<Props> = ({ progress }) => {
  const meshRef = useRef<THREE.Group>(null!);
  const lightRef = useRef<THREE.PointLight>(null!);

  useFrame((state) => {
    if (!meshRef.current) return;
    const lerpVal = THREE.MathUtils.smoothstep(progress.current, 0, 1);
    const time = state.clock.elapsedTime;

    // Movement logic
    const targetY = 8.5;
    const chaosY = 20;
    meshRef.current.position.y = THREE.MathUtils.lerp(chaosY, targetY, lerpVal);
    meshRef.current.rotation.y = time * 0.5;
    meshRef.current.scale.setScalar(THREE.MathUtils.lerp(0, 1.5, lerpVal));

    // Light pulse
    if (lightRef.current) {
      lightRef.current.intensity = (2 + Math.sin(time * 4)) * lerpVal;
    }
  });

  return (
    <group ref={meshRef}>
      <pointLight ref={lightRef} color={COLORS.brightGold} distance={15} />
      
      {/* 5-Pointed Star Mesh */}
      <mesh>
        <octahedronGeometry args={[1, 0]} />
        <meshStandardMaterial 
          color={COLORS.brightGold} 
          emissive={COLORS.gold} 
          emissiveIntensity={2} 
          toneMapped={false}
        />
      </mesh>
      
      {/* Decorative Halo */}
      <mesh rotation-x={Math.PI / 2}>
        <torusGeometry args={[0.8, 0.02, 16, 100]} />
        <meshBasicMaterial color={COLORS.white} transparent opacity={0.3} />
      </mesh>
    </group>
  );
};

export default Topper;
