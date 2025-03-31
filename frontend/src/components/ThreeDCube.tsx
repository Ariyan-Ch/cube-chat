
import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Edges } from '@react-three/drei';
import * as THREE from 'three';

interface CubeFacesProps {
  isAnimating: boolean;
}

const CubeFaces: React.FC<CubeFacesProps> = ({ isAnimating }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const rotationSpeed = useRef(new THREE.Vector3(
    Math.random() * 0.01 - 0.005,
    Math.random() * 0.01 - 0.005,
    Math.random() * 0.01 - 0.005
  ));

  useFrame(() => {
    if (meshRef.current && isAnimating) {
      meshRef.current.rotation.x += rotationSpeed.current.x;
      meshRef.current.rotation.y += rotationSpeed.current.y;
      meshRef.current.rotation.z += rotationSpeed.current.z;
    }
  });

  return (
    <mesh ref={meshRef}>
      <boxGeometry args={[2.5, 2.5, 2.5]} />
      <meshBasicMaterial transparent opacity={0} />
      <Edges
        threshold={15} // Display all edges
        color="#8A2BE2" // Purple color matching theme
        scale={1}
        lineWidth={1.5}
      />
    </mesh>
  );
};

interface ThreeDCubeProps {
  isDropping: boolean;
}

const ThreeDCube: React.FC<ThreeDCubeProps> = () => {
  return (
    <div className="w-full h-full rounded-lg border border-secondary bg-card shadow-lg overflow-hidden">
      <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
        <pointLight position={[-10, -10, -10]} />
        <CubeFaces isAnimating={false} />
        <OrbitControls 
          enableZoom={true}
          enablePan={false}
          minDistance={3}
          maxDistance={10}
          autoRotate={true}
          autoRotateSpeed={2}
        />
      </Canvas>
    </div>
  );
};

export default ThreeDCube;
