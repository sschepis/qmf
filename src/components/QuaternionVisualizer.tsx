import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Line, Text } from '@react-three/drei';
import * as THREE from 'three';
import { Quaternion, stereographicProject } from '@/lib/quaternion';

interface QuaternionVisualizerProps {
  quaternion: Quaternion;
  showAxes?: boolean;
  animate?: boolean;
  size?: number;
}

function CoordinateAxes() {
  const axisLength = 1.5;
  
  return (
    <group>
      {/* X axis - Security (purple) */}
      <Line
        points={[[-axisLength, 0, 0], [axisLength, 0, 0]]}
        color="#a855f7"
        lineWidth={2}
      />
      <Text position={[axisLength + 0.3, 0, 0]} fontSize={0.12} color="#a855f7">
        x
      </Text>
      
      {/* Y axis - Performance (orange) */}
      <Line
        points={[[0, -axisLength, 0], [0, axisLength, 0]]}
        color="#f59e0b"
        lineWidth={2}
      />
      <Text position={[0, axisLength + 0.2, 0]} fontSize={0.12} color="#f59e0b">
        y
      </Text>
      
      {/* Z axis - Usability (green) */}
      <Line
        points={[[0, 0, -axisLength], [0, 0, axisLength]]}
        color="#22c55e"
        lineWidth={2}
      />
      <Text position={[0, 0, axisLength + 0.3]} fontSize={0.12} color="#22c55e">
        z
      </Text>
    </group>
  );
}

function WireframeSphere() {
  return (
    <mesh>
      <sphereGeometry args={[1, 24, 24]} />
      <meshBasicMaterial color="#38bdf8" wireframe opacity={0.15} transparent />
    </mesh>
  );
}

function QuaternionPoint({ quaternion, animate }: { quaternion: Quaternion; animate?: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  
  const position = useMemo(() => {
    const proj = stereographicProject(quaternion);
    const maxVal = Math.max(Math.abs(proj.x), Math.abs(proj.y), Math.abs(proj.z), 1);
    const scale = Math.min(1.2, 1 / maxVal);
    return new THREE.Vector3(proj.x * scale, proj.y * scale, proj.z * scale);
  }, [quaternion]);

  useFrame((state) => {
    if (animate && meshRef.current) {
      const scale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.15;
      meshRef.current.scale.setScalar(scale);
    }
    if (glowRef.current) {
      const scale = 1.8 + Math.sin(state.clock.elapsedTime * 3) * 0.3;
      glowRef.current.scale.setScalar(scale);
    }
  });

  const hue = 185 + quaternion.w * 30;

  return (
    <group position={position}>
      {/* Glow */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshBasicMaterial color={`hsl(${hue}, 80%, 55%)`} transparent opacity={0.25} />
      </mesh>
      
      {/* Core point */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshBasicMaterial color={`hsl(${hue}, 80%, 60%)`} />
      </mesh>
      
      {/* Line to origin */}
      <Line
        points={[[0, 0, 0], [-position.x, -position.y, -position.z]]}
        color={`hsl(${hue}, 80%, 55%)`}
        lineWidth={2}
      />
    </group>
  );
}

function ScalarBar({ w }: { w: number }) {
  const height = Math.abs(w) * 1.2;
  const color = w >= 0 ? '#38bdf8' : '#ef4444';
  const yPos = w >= 0 ? height / 2 : -height / 2;
  
  return (
    <group position={[-1.6, 0, 0]}>
      {/* Background */}
      <mesh>
        <boxGeometry args={[0.08, 2.4, 0.08]} />
        <meshBasicMaterial color="#1e293b" transparent opacity={0.4} />
      </mesh>
      
      {/* Value indicator */}
      <mesh position={[0, yPos, 0.01]}>
        <boxGeometry args={[0.1, Math.max(0.02, height), 0.1]} />
        <meshBasicMaterial color={color} />
      </mesh>
      
      <Text position={[0, -1.45, 0]} fontSize={0.08} color="#38bdf8">
        w: {w.toFixed(3)}
      </Text>
    </group>
  );
}

function Scene({ quaternion, showAxes, animate }: { quaternion: Quaternion; showAxes?: boolean; animate?: boolean }) {
  return (
    <>
      <ambientLight intensity={0.6} />
      <pointLight position={[10, 10, 10]} intensity={0.5} />
      
      {showAxes && <CoordinateAxes />}
      <WireframeSphere />
      <QuaternionPoint quaternion={quaternion} animate={animate} />
      <ScalarBar w={quaternion.w} />
      
      <OrbitControls
        enablePan={false}
        enableZoom={true}
        minDistance={2}
        maxDistance={5}
        autoRotate={animate}
        autoRotateSpeed={0.4}
      />
    </>
  );
}

export function QuaternionVisualizer({ 
  quaternion, 
  showAxes = true, 
  animate = true,
  size = 400 
}: QuaternionVisualizerProps) {
  return (
    <div 
      className="bg-card rounded-lg border border-border overflow-hidden"
      style={{ width: size, height: size }}
    >
      <Canvas camera={{ position: [2.5, 2, 2.5], fov: 50 }}>
        <Scene quaternion={quaternion} showAxes={showAxes} animate={animate} />
      </Canvas>
    </div>
  );
}

export default QuaternionVisualizer;
