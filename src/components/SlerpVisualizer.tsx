import { useState, useEffect, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Line, Text } from '@react-three/drei';
import * as THREE from 'three';
import { Quaternion, slerp, normalize, stereographicProject, randomQuaternion } from '@/lib/quaternion';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, RotateCcw, Shuffle } from 'lucide-react';

interface SlerpVisualizerProps {
  size?: number;
}

function WireframeSphere() {
  return (
    <mesh>
      <sphereGeometry args={[1, 24, 24]} />
      <meshBasicMaterial color="#38bdf8" wireframe transparent opacity={0.12} />
    </mesh>
  );
}

function InterpolationScene({ q1, q2, t }: { q1: Quaternion; q2: Quaternion; t: number }) {
  const points = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 40; i++) {
      const ti = i / 40;
      const qi = slerp(q1, q2, ti);
      const proj = stereographicProject(qi);
      const maxVal = Math.max(Math.abs(proj.x), Math.abs(proj.y), Math.abs(proj.z), 1);
      const scale = Math.min(1.2, 1 / maxVal);
      pts.push(new THREE.Vector3(proj.x * scale, proj.y * scale, proj.z * scale));
    }
    return pts;
  }, [q1, q2]);

  const currentQ = slerp(q1, q2, t);
  const currentProj = stereographicProject(currentQ);
  const currentMaxVal = Math.max(Math.abs(currentProj.x), Math.abs(currentProj.y), Math.abs(currentProj.z), 1);
  const currentScale = Math.min(1.2, 1 / currentMaxVal);
  const currentPos = new THREE.Vector3(
    currentProj.x * currentScale, 
    currentProj.y * currentScale, 
    currentProj.z * currentScale
  );

  const proj1 = stereographicProject(q1);
  const maxVal1 = Math.max(Math.abs(proj1.x), Math.abs(proj1.y), Math.abs(proj1.z), 1);
  const scale1 = Math.min(1.2, 1 / maxVal1);
  const pos1 = new THREE.Vector3(proj1.x * scale1, proj1.y * scale1, proj1.z * scale1);

  const proj2 = stereographicProject(q2);
  const maxVal2 = Math.max(Math.abs(proj2.x), Math.abs(proj2.y), Math.abs(proj2.z), 1);
  const scale2 = Math.min(1.2, 1 / maxVal2);
  const pos2 = new THREE.Vector3(proj2.x * scale2, proj2.y * scale2, proj2.z * scale2);

  return (
    <>
      <ambientLight intensity={0.6} />
      <pointLight position={[10, 10, 10]} intensity={0.5} />
      
      <WireframeSphere />

      {/* SLERP path */}
      <Line points={points} color="#38bdf8" lineWidth={3} />

      {/* Linear comparison path */}
      <Line points={[pos1, pos2]} color="#64748b" lineWidth={1} />

      {/* Start point q1 */}
      <mesh position={pos1}>
        <sphereGeometry args={[0.07, 16, 16]} />
        <meshBasicMaterial color="#22c55e" />
      </mesh>
      <Text position={[pos1.x, pos1.y + 0.15, pos1.z]} fontSize={0.1} color="#22c55e">
        q₁
      </Text>

      {/* End point q2 */}
      <mesh position={pos2}>
        <sphereGeometry args={[0.07, 16, 16]} />
        <meshBasicMaterial color="#f59e0b" />
      </mesh>
      <Text position={[pos2.x, pos2.y + 0.15, pos2.z]} fontSize={0.1} color="#f59e0b">
        q₂
      </Text>

      {/* Current interpolated point */}
      <mesh position={currentPos}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshBasicMaterial color="#38bdf8" />
      </mesh>
      <mesh position={currentPos}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshBasicMaterial color="#38bdf8" transparent opacity={0.3} />
      </mesh>

      <OrbitControls enablePan={false} minDistance={2} maxDistance={5} />
    </>
  );
}

export function SlerpVisualizer({ size = 350 }: SlerpVisualizerProps) {
  const [q1, setQ1] = useState<Quaternion>({ w: 0.707, x: 0.707, y: 0, z: 0 });
  const [q2, setQ2] = useState<Quaternion>({ w: 0.707, x: 0, y: 0.707, z: 0 });
  const [t, setT] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (!isPlaying) return;
    
    const interval = setInterval(() => {
      setT(prev => {
        const next = prev + 0.01;
        if (next > 1) {
          setIsPlaying(false);
          return 1;
        }
        return next;
      });
    }, 20);

    return () => clearInterval(interval);
  }, [isPlaying]);

  const currentQ = useMemo(() => slerp(q1, q2, t), [q1, q2, t]);

  const randomize = () => {
    setQ1(randomQuaternion());
    setQ2(randomQuaternion());
    setT(0);
  };

  const reset = () => {
    setT(0);
    setIsPlaying(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-5 h-5 rounded-full bg-gradient-to-r from-success to-accent" />
        <h3 className="font-semibold text-foreground">SLERP Interpolation</h3>
      </div>

      <div 
        className="bg-card rounded-lg border border-border overflow-hidden"
        style={{ height: size }}
      >
        <Canvas camera={{ position: [2.5, 2, 2.5], fov: 50 }}>
          <InterpolationScene q1={q1} q2={q2} t={t} />
        </Canvas>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground w-8">t =</span>
          <Slider
            value={[t]}
            onValueChange={([v]) => setT(v)}
            min={0}
            max={1}
            step={0.01}
            className="flex-1"
          />
          <span className="w-12 text-right font-mono text-sm">{t.toFixed(2)}</span>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsPlaying(!isPlaying)}
            className="flex-1"
          >
            {isPlaying ? <Pause className="w-4 h-4 mr-1" /> : <Play className="w-4 h-4 mr-1" />}
            {isPlaying ? 'Pause' : 'Animate'}
          </Button>
          <Button variant="outline" size="sm" onClick={reset}>
            <RotateCcw className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={randomize}>
            <Shuffle className="w-4 h-4" />
          </Button>
        </div>

        <div className="p-3 bg-secondary/30 rounded-lg border border-border">
          <div className="text-xs text-muted-foreground mb-2">Current State: SLERP(q₁, q₂, {t.toFixed(2)})</div>
          <div className="grid grid-cols-4 gap-2 font-mono text-xs">
            <div className="text-center">
              <div className="text-[10px] text-muted-foreground">w</div>
              <div className="text-primary">{currentQ.w.toFixed(3)}</div>
            </div>
            <div className="text-center">
              <div className="text-[10px] text-muted-foreground">x</div>
              <div className="text-qmf-security">{currentQ.x.toFixed(3)}</div>
            </div>
            <div className="text-center">
              <div className="text-[10px] text-muted-foreground">y</div>
              <div className="text-qmf-performance">{currentQ.y.toFixed(3)}</div>
            </div>
            <div className="text-center">
              <div className="text-[10px] text-muted-foreground">z</div>
              <div className="text-qmf-usability">{currentQ.z.toFixed(3)}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SlerpVisualizer;
