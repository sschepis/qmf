import { useState, useMemo } from 'react';
import { Quaternion, hamiltonProduct, commutator, magnitude, dot, normalize } from '@/lib/quaternion';
import { ArrowRight, ArrowLeftRight, Shuffle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';

interface QuaternionInputProps {
  quaternion: Quaternion;
  onChange: (q: Quaternion) => void;
  label: string;
  color: string;
}

function QuaternionInput({ quaternion, onChange, label, color }: QuaternionInputProps) {
  const updateComponent = (component: keyof Quaternion, value: number) => {
    const newQ = { ...quaternion, [component]: value };
    onChange(normalize(newQ));
  };

  return (
    <div className={`p-3 rounded-lg border ${color} bg-secondary/30`}>
      <div className="text-xs font-semibold mb-3 text-foreground">{label}</div>
      <div className="space-y-2">
        {(['w', 'x', 'y', 'z'] as const).map((comp) => (
          <div key={comp} className="flex items-center gap-2">
            <span className="w-6 text-xs font-mono text-muted-foreground">{comp}:</span>
            <Slider
              value={[quaternion[comp]]}
              onValueChange={([v]) => updateComponent(comp, v)}
              min={-1}
              max={1}
              step={0.01}
              className="flex-1"
            />
            <span className="w-14 text-xs font-mono text-right">
              {quaternion[comp].toFixed(3)}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-2 text-[10px] text-muted-foreground font-mono">
        |q| = {magnitude(quaternion).toFixed(4)}
      </div>
    </div>
  );
}

function ResultDisplay({ q, label }: { q: Quaternion; label: string }) {
  return (
    <div className="p-3 bg-secondary/50 rounded-lg border border-primary/30">
      <div className="text-xs text-muted-foreground mb-2">{label}</div>
      <div className="grid grid-cols-4 gap-1 font-mono text-xs">
        <div className="text-center">
          <div className="text-[10px] text-muted-foreground">w</div>
          <div className="text-primary">{q.w.toFixed(4)}</div>
        </div>
        <div className="text-center">
          <div className="text-[10px] text-muted-foreground">x</div>
          <div className="text-qmf-security">{q.x.toFixed(4)}</div>
        </div>
        <div className="text-center">
          <div className="text-[10px] text-muted-foreground">y</div>
          <div className="text-qmf-performance">{q.y.toFixed(4)}</div>
        </div>
        <div className="text-center">
          <div className="text-[10px] text-muted-foreground">z</div>
          <div className="text-qmf-usability">{q.z.toFixed(4)}</div>
        </div>
      </div>
    </div>
  );
}

export function HamiltonCalculator() {
  const [q1, setQ1] = useState<Quaternion>({ w: 0.707, x: 0.707, y: 0, z: 0 });
  const [q2, setQ2] = useState<Quaternion>({ w: 0.707, x: 0, y: 0.707, z: 0 });

  const results = useMemo(() => {
    const q1q2 = hamiltonProduct(q1, q2);
    const q2q1 = hamiltonProduct(q2, q1);
    const comm = commutator(q1, q2);
    const commMag = magnitude(comm);
    const dotProduct = dot(q1, q2);
    
    return { q1q2, q2q1, comm, commMag, dotProduct };
  }, [q1, q2]);

  const randomize = () => {
    const randomQ = () => normalize({
      w: Math.random() * 2 - 1,
      x: Math.random() * 2 - 1,
      y: Math.random() * 2 - 1,
      z: Math.random() * 2 - 1
    });
    setQ1(randomQ());
    setQ2(randomQ());
  };

  const isCommutative = results.commMag < 0.01;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <ArrowLeftRight className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground">Hamilton Product</h3>
        </div>
        <Button variant="outline" size="sm" onClick={randomize}>
          <Shuffle className="w-3 h-3 mr-1" />
          Random
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <QuaternionInput
          quaternion={q1}
          onChange={setQ1}
          label="q₁"
          color="border-primary/30"
        />
        <QuaternionInput
          quaternion={q2}
          onChange={setQ2}
          label="q₂"
          color="border-accent/30"
        />
      </div>

      <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
        <span>q₁ · q₂ = {results.dotProduct.toFixed(4)}</span>
        <span className="text-border">|</span>
        <span>θ = {(Math.acos(Math.min(1, Math.abs(results.dotProduct))) * 180 / Math.PI).toFixed(1)}°</span>
      </div>

      <div className="space-y-2">
        <ResultDisplay q={results.q1q2} label="q₁ × q₂" />
        <ResultDisplay q={results.q2q1} label="q₂ × q₁" />
      </div>

      <div className={`p-3 rounded-lg border ${
        isCommutative 
          ? 'border-success/30 bg-success/5' 
          : 'border-accent/30 bg-accent/5'
      }`}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold">Commutator [q₁, q₂]</span>
          <span className={`text-xs font-mono ${isCommutative ? 'text-success' : 'text-accent'}`}>
            ‖[q₁, q₂]‖ = {results.commMag.toFixed(4)}
          </span>
        </div>
        
        <div className="grid grid-cols-4 gap-1 font-mono text-xs mb-2">
          {(['w', 'x', 'y', 'z'] as const).map((comp) => (
            <div key={comp} className="text-center text-muted-foreground">
              {results.comm[comp].toFixed(4)}
            </div>
          ))}
        </div>

        <p className="text-xs text-muted-foreground">
          {isCommutative 
            ? "Operations are order-independent (abelian)"
            : "Order matters! Semantic sequence is preserved (non-abelian)"}
        </p>
      </div>
    </div>
  );
}

export default HamiltonCalculator;
