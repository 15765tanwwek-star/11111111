
import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { AMBIENT_DUST_COUNT, COLORS } from '../constants';

const AmbientDust: React.FC = () => {
  const pointsRef = useRef<THREE.Points>(null!);
  
  const [positions, speeds] = useMemo(() => {
    const pos = new Float32Array(AMBIENT_DUST_COUNT * 3);
    const spd = new Float32Array(AMBIENT_DUST_COUNT);
    for (let i = 0; i < AMBIENT_DUST_COUNT; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 40;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 40;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 40;
      spd[i] = Math.random() * 0.5 + 0.1;
    }
    return [pos, spd];
  }, []);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    const array = pointsRef.current.geometry.attributes.position.array as Float32Array;
    
    for (let i = 0; i < AMBIENT_DUST_COUNT; i++) {
      // Gentle floating motion
      array[i * 3 + 1] += Math.sin(time * speeds[i]) * 0.01;
      array[i * 3] += Math.cos(time * speeds[i] * 0.5) * 0.005;
    }
    pointsRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={AMBIENT_DUST_COUNT}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.08}
        color={COLORS.gold}
        transparent
        opacity={0.4}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
};

export default AmbientDust;
