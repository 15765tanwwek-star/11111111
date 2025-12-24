
import React, { useMemo, useRef, Suspense } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useTexture } from '@react-three/drei';
import { POLAROID_COUNT } from '../constants';

interface Props {
  progress: React.MutableRefObject<number>;
  userImages: string[];
}

const PolaroidItem: React.FC<{ 
  index: number; 
  progress: React.MutableRefObject<number>;
  userImage?: string;
}> = ({ index, progress, userImage }) => {
  const meshRef = useRef<THREE.Group>(null!);
  const { camera } = useThree();
  
  // Use user image if available, else fallback to picsum seeds
  const imgUrl = userImage || `https://picsum.photos/seed/holiday${index % 12}/400/500`;
  const texture = useTexture(imgUrl);

  const [chaosPos, targetPos, targetRotation] = useMemo(() => {
    const h = Math.random() * 11;
    const r = (12 - h) * 0.35 + 0.1;
    const a = (index / POLAROID_COUNT) * Math.PI * 2 + Math.random();
    
    // Custom chaos positions - slightly clustered for better visibility when palm is open
    const chaosDist = 12 + Math.random() * 10;
    const chaosAngle = Math.random() * Math.PI * 2;
    
    return [
      [Math.cos(chaosAngle) * chaosDist, (Math.random() - 0.5) * 15, Math.sin(chaosAngle) * chaosDist] as [number, number, number],
      [Math.cos(a) * r, h - 5.5, Math.sin(a) * r] as [number, number, number],
      [0, -a + Math.PI / 2, 0] as [number, number, number]
    ];
  }, [index]);

  useFrame((state) => {
    if (meshRef.current) {
      const lerpVal = THREE.MathUtils.smoothstep(progress.current, 0, 1);
      
      // Interpolate position
      meshRef.current.position.set(
        THREE.MathUtils.lerp(chaosPos[0], targetPos[0], lerpVal),
        THREE.MathUtils.lerp(chaosPos[1], targetPos[1], lerpVal),
        THREE.MathUtils.lerp(chaosPos[2], targetPos[2], lerpVal)
      );

      // Expansion Logic: When Open Palm (lerpVal -> 0), photos expand and face the camera
      if (lerpVal < 0.2) {
        // Face camera during expansion
        meshRef.current.lookAt(camera.position);
        // Dramatic scale up
        const scale = THREE.MathUtils.lerp(4.0, 1.0, lerpVal * 5); 
        meshRef.current.scale.setScalar(scale);
      } else {
        // Normal state: part of the tree
        meshRef.current.rotation.y = THREE.MathUtils.lerp(0, targetRotation[1], (lerpVal - 0.2) / 0.8);
        meshRef.current.scale.setScalar(THREE.MathUtils.lerp(1.0, 0.5, (lerpVal - 0.2) / 0.8));
      }
    }
  });

  return (
    <group ref={meshRef}>
      {/* High-quality Frame */}
      <mesh position={[0, 0, -0.01]} castShadow>
        <planeGeometry args={[1.2, 1.4]} />
        <meshStandardMaterial color="#FFFFFF" roughness={0.2} metalness={0.1} />
      </mesh>
      {/* User / Fallback Image */}
      <mesh position={[0, 0.1, 0.01]}>
        <planeGeometry args={[1.1, 1.1]} />
        <meshStandardMaterial map={texture} roughness={0.5} />
      </mesh>
    </group>
  );
};

const Polaroids: React.FC<Props> = ({ progress, userImages }) => {
  return (
    <group>
      {Array.from({ length: POLAROID_COUNT }).map((_, i) => {
        // Cycle through user images if they exist
        const userImg = userImages.length > 0 ? userImages[i % userImages.length] : undefined;
        return (
          <Suspense key={`${i}-${userImg}`} fallback={null}>
            <PolaroidItem 
              index={i} 
              progress={progress} 
              userImage={userImg} 
            />
          </Suspense>
        );
      })}
    </group>
  );
};

export default Polaroids;
