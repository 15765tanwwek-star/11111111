
import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { OrnamentData } from '../types';

interface Props {
  data: OrnamentData[];
  progress: React.MutableRefObject<number>;
}

const Ornaments: React.FC<Props> = ({ data, progress }) => {
  const ballRef = useRef<THREE.InstancedMesh>(null!);
  const boxRef = useRef<THREE.InstancedMesh>(null!);
  const lightRef = useRef<THREE.InstancedMesh>(null!);
  
  const balls = useMemo(() => data.filter(d => d.type === 'ball'), [data]);
  const boxes = useMemo(() => data.filter(d => d.type === 'box'), [data]);
  const lights = useMemo(() => data.filter(d => d.type === 'light'), [data]);

  const tempObj = new THREE.Object3D();

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    const lerpFactor = THREE.MathUtils.smoothstep(progress.current, 0, 1);

    // Update balls
    balls.forEach((d, i) => {
      const px = THREE.MathUtils.lerp(d.chaosPosition[0], d.targetPosition[0], lerpFactor);
      const py = THREE.MathUtils.lerp(d.chaosPosition[1], d.targetPosition[1], lerpFactor);
      const pz = THREE.MathUtils.lerp(d.chaosPosition[2], d.targetPosition[2], lerpFactor);
      
      tempObj.position.set(px, py, pz);
      tempObj.scale.setScalar(d.scale);
      tempObj.updateMatrix();
      ballRef.current.setMatrixAt(i, tempObj.matrix);
      ballRef.current.setColorAt(i, new THREE.Color(d.color));
    });
    ballRef.current.instanceMatrix.needsUpdate = true;
    if (ballRef.current.instanceColor) ballRef.current.instanceColor.needsUpdate = true;

    // Update boxes
    boxes.forEach((d, i) => {
      const px = THREE.MathUtils.lerp(d.chaosPosition[0], d.targetPosition[0], lerpFactor);
      const py = THREE.MathUtils.lerp(d.chaosPosition[1], d.targetPosition[1], lerpFactor);
      const pz = THREE.MathUtils.lerp(d.chaosPosition[2], d.targetPosition[2], lerpFactor);
      
      tempObj.position.set(px, py, pz);
      tempObj.scale.setScalar(d.scale);
      tempObj.rotation.set(px, py + time * 0.2, pz);
      tempObj.updateMatrix();
      boxRef.current.setMatrixAt(i, tempObj.matrix);
      boxRef.current.setColorAt(i, new THREE.Color(d.color));
    });
    boxRef.current.instanceMatrix.needsUpdate = true;
    if (boxRef.current.instanceColor) boxRef.current.instanceColor.needsUpdate = true;

    // Update tiny glow lights
    lights.forEach((d, i) => {
      const px = THREE.MathUtils.lerp(d.chaosPosition[0], d.targetPosition[0], lerpFactor);
      const py = THREE.MathUtils.lerp(d.chaosPosition[1], d.targetPosition[1], lerpFactor);
      const pz = THREE.MathUtils.lerp(d.chaosPosition[2], d.targetPosition[2], lerpFactor);
      
      tempObj.position.set(px, py, pz);
      // Pulsing scale for lights
      const pulse = 0.8 + 0.4 * Math.sin(time * 3 + i);
      tempObj.scale.setScalar(d.scale * pulse);
      tempObj.updateMatrix();
      lightRef.current.setMatrixAt(i, tempObj.matrix);
      lightRef.current.setColorAt(i, new THREE.Color(d.color));
    });
    lightRef.current.instanceMatrix.needsUpdate = true;
    if (lightRef.current.instanceColor) lightRef.current.instanceColor.needsUpdate = true;
  });

  return (
    <>
      <instancedMesh ref={ballRef} args={[undefined, undefined, balls.length]}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshStandardMaterial metalness={0.9} roughness={0.1} />
      </instancedMesh>
      <instancedMesh ref={boxRef} args={[undefined, undefined, boxes.length]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial metalness={0.9} roughness={0.1} />
      </instancedMesh>
      <instancedMesh ref={lightRef} args={[undefined, undefined, lights.length]}>
        <sphereGeometry args={[0.5, 8, 8]} />
        <meshBasicMaterial toneMapped={false} color="#FFFFFF" />
      </instancedMesh>
    </>
  );
};

export default Ornaments;
