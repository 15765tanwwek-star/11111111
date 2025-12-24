
import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { PARTICLE_COUNT, COLORS } from '../constants';

interface Props {
  progress: React.MutableRefObject<number>;
}

const Foliage: React.FC<Props> = ({ progress }) => {
  const meshRef = useRef<THREE.Points>(null!);
  
  const [positions, chaosPositions, sizes, offsets] = useMemo(() => {
    const pos = new Float32Array(PARTICLE_COUNT * 3);
    const chaos = new Float32Array(PARTICLE_COUNT * 3);
    const sz = new Float32Array(PARTICLE_COUNT);
    const off = new Float32Array(PARTICLE_COUNT);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const h = Math.random() * 15;
      // Narrower, more compact cone
      const rBase = (15 - h) * 0.38;
      // Using a squared random distribution to pack the core much more densely
      const rDist = Math.pow(Math.random(), 1.5) * rBase; 
      const a = Math.random() * Math.PI * 2;
      
      pos[i * 3] = Math.cos(a) * rDist;
      pos[i * 3 + 1] = h - 7;
      pos[i * 3 + 2] = Math.sin(a) * rDist;

      // Chaos distribution remains a wide sphere
      const dist = 20 + Math.random() * 25;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos((Math.random() * 2) - 1);
      chaos[i * 3] = dist * Math.sin(phi) * Math.cos(theta);
      chaos[i * 3 + 1] = dist * Math.sin(phi) * Math.sin(theta);
      chaos[i * 3 + 2] = dist * Math.cos(phi);

      // Slightly larger particles for a "fuller" look
      sz[i] = Math.random() * 0.09 + 0.03;
      off[i] = Math.random() * 200;
    }
    return [pos, chaos, sz, off];
  }, []);

  const uniforms = useMemo(() => ({
    uProgress: { value: 0 },
    uTime: { value: 0 },
    uColor: { value: new THREE.Color(COLORS.emerald) },
    uGold: { value: new THREE.Color(COLORS.gold) }
  }), []);

  useFrame((state) => {
    uniforms.uProgress.value = progress.current;
    uniforms.uTime.value = state.clock.elapsedTime;
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={PARTICLE_COUNT} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-chaosPosition" count={PARTICLE_COUNT} array={chaosPositions} itemSize={3} />
        <bufferAttribute attach="attributes-size" count={PARTICLE_COUNT} array={sizes} itemSize={1} />
        <bufferAttribute attach="attributes-offset" count={PARTICLE_COUNT} array={offsets} itemSize={1} />
      </bufferGeometry>
      <shaderMaterial
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        uniforms={uniforms}
        vertexShader={`
          uniform float uProgress;
          uniform float uTime;
          attribute vec3 chaosPosition;
          attribute float size;
          attribute float offset;
          varying float vDist;
          varying float vAlpha;
          varying float vSparkle;
          void main() {
            vec3 pos = mix(chaosPosition, position, uProgress);
            float sway = sin(uTime * 0.4 + pos.y + offset) * 0.1;
            pos.x += sway * (1.1 - uProgress);
            pos.z += sway * (1.1 - uProgress);
            vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
            gl_PointSize = size * (600.0 / -mvPosition.z);
            gl_Position = projectionMatrix * mvPosition;
            vDist = length(pos);
            vAlpha = 0.5 + 0.5 * sin(uTime * 1.5 + offset);
            vSparkle = step(0.98, sin(uTime * 5.0 + offset));
          }
        `}
        fragmentShader={`
          uniform vec3 uColor;
          uniform vec3 uGold;
          varying float vDist;
          varying float vAlpha;
          varying float vSparkle;
          void main() {
            float r = length(gl_PointCoord - vec2(0.5));
            if (r > 0.5) discard;
            vec3 color = mix(uColor, uGold, vSparkle);
            gl_FragColor = vec4(color, (1.0 - r * 2.0) * vAlpha * 0.8);
          }
        `}
      />
    </points>
  );
};

export default Foliage;
