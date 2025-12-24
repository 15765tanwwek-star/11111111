
import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { TreeState, OrnamentData } from '../types';
import { ORNAMENT_COUNT, COLORS, PRESENT_COUNT } from '../constants';
import Foliage from './Foliage';
import Ornaments from './Ornaments';
import Polaroids from './Polaroids';
import Topper from './Topper';
import AmbientDust from './AmbientDust';

interface Props {
  treeState: TreeState;
  handOffset: { x: number; y: number };
  userImages: string[];
}

const LuxuryTree: React.FC<Props> = ({ treeState, handOffset, userImages }) => {
  const groupRef = useRef<THREE.Group>(null!);
  const progress = useRef(1); // 1 = Formed, 0 = Chaos

  useFrame((state, delta) => {
    const targetProgress = treeState === TreeState.FORMED ? 1 : 0;
    progress.current = THREE.MathUtils.lerp(progress.current, targetProgress, delta * 1.5);

    if (groupRef.current) {
      const rotY = handOffset.x * 0.25;
      const rotX = handOffset.y * 0.18;
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, rotY, delta * 3);
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, rotX, delta * 3);
    }
  });

  const ornamentData = useMemo(() => {
    const items: OrnamentData[] = [];
    const colors = [COLORS.gold, COLORS.brightGold, COLORS.red, COLORS.white, "#C0C0C0"];
    
    for (let i = 0; i < ORNAMENT_COUNT; i++) {
      const rand = Math.random();
      const type = rand > 0.7 ? 'light' : (rand > 0.4 ? 'box' : 'ball');
      const height = Math.random() * 15;
      const shellRadius = (15 - height) * 0.35;
      const radius = shellRadius * (0.6 + Math.random() * 0.4) + (Math.random() * 0.2);
      const angle = Math.random() * Math.PI * 2;

      items.push({
        chaosPosition: [(Math.random() - 0.5) * 60, (Math.random() - 0.5) * 60, (Math.random() - 0.5) * 60],
        targetPosition: [Math.cos(angle) * radius, height - 7, Math.sin(angle) * radius],
        color: type === 'light' ? COLORS.brightGold : colors[Math.floor(Math.random() * colors.length)],
        weight: type === 'box' ? 0.6 : 1.0,
        scale: type === 'light' ? 0.04 : (type === 'box' ? 0.15 : 0.2),
        type: type as any
      });
    }

    for (let i = 0; i < PRESENT_COUNT; i++) {
      const angle = (i / PRESENT_COUNT) * Math.PI * 2;
      const r = 2.5 + Math.random() * 2.5;
      items.push({
        chaosPosition: [(Math.random() - 0.5) * 60, (Math.random() - 0.5) * 60, (Math.random() - 0.5) * 60],
        targetPosition: [Math.cos(angle) * r, -7.5, Math.sin(angle) * r],
        color: i % 2 === 0 ? COLORS.gold : COLORS.red,
        weight: 0.4,
        scale: 0.8 + Math.random() * 0.6,
        type: 'box'
      });
    }

    return items;
  }, []);

  return (
    <group ref={groupRef}>
      <Foliage progress={progress} />
      <Ornaments progress={progress} data={ornamentData} />
      <Polaroids progress={progress} userImages={userImages} />
      <Topper progress={progress} />
      <AmbientDust />
      
      <mesh rotation-x={-Math.PI / 2} position-y={-8} receiveShadow>
        <circleGeometry args={[20, 64]} />
        <meshStandardMaterial 
          color="#021a12" 
          roughness={0.05} 
          metalness={0.8} 
        />
      </mesh>
    </group>
  );
};

export default LuxuryTree;
