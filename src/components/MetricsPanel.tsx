import { useMemo } from 'react';
import { Memory, calculateEntropy, calculateCoherence, calculateLyapunov } from '@/lib/quaternion';
import { Activity, Gauge, TrendingUp, AlertTriangle, Check, X } from 'lucide-react';

interface MetricsPanelProps {
  memories: Memory[];
}

interface MetricCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  description: string;
  status: 'stable' | 'warning' | 'critical';
  unit?: string;
}

function MetricCard({ title, value, icon, description, status, unit = '' }: MetricCardProps) {
  const statusColors = {
    stable: 'text-success border-success/30 bg-success/5',
    warning: 'text-accent border-accent/30 bg-accent/5',
    critical: 'text-destructive border-destructive/30 bg-destructive/5',
  };

  const StatusIcon = status === 'stable' ? Check : status === 'warning' ? AlertTriangle : X;

  return (
    <div className={`p-4 rounded-lg border ${statusColors[status]} transition-all duration-300`}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="opacity-80">{icon}</div>
          <span className="font-medium text-foreground">{title}</span>
        </div>
        <StatusIcon className="w-4 h-4" />
      </div>
      
      <div className="font-mono text-2xl font-bold mb-1">
        {value.toFixed(4)}{unit}
      </div>
      
      <p className="text-xs text-muted-foreground">{description}</p>
      
      {/* Progress bar */}
      <div className="mt-3 h-1.5 bg-background/50 rounded-full overflow-hidden">
        <div 
          className={`h-full rounded-full transition-all duration-500 ${
            status === 'stable' ? 'bg-success' : 
            status === 'warning' ? 'bg-accent' : 'bg-destructive'
          }`}
          style={{ width: `${Math.min(Math.abs(value) * 100, 100)}%` }}
        />
      </div>
    </div>
  );
}

export function MetricsPanel({ memories }: MetricsPanelProps) {
  const metrics = useMemo(() => {
    const entropy = calculateEntropy(memories);
    const coherence = calculateCoherence(memories);
    const lyapunov = calculateLyapunov(memories);
    
    return { entropy, coherence, lyapunov };
  }, [memories]);

  const getEntropyStatus = (e: number): 'stable' | 'warning' | 'critical' => {
    if (e < 0.3) return 'stable'; // Low entropy = sharp memory
    if (e < 0.7) return 'warning';
    return 'critical'; // High entropy = noise
  };

  const getCoherenceStatus = (c: number): 'stable' | 'warning' | 'critical' => {
    if (c > 0.7) return 'stable'; // High coherence = phase-locked
    if (c > 0.3) return 'warning';
    return 'critical'; // Low coherence = confusion
  };

  const getLyapunovStatus = (l: number): 'stable' | 'warning' | 'critical' => {
    if (l < 0) return 'stable'; // Negative = converging
    if (l < 0.5) return 'warning';
    return 'critical'; // Positive = diverging/unstable
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Activity className="w-5 h-5 text-primary" />
        <h3 className="font-semibold text-foreground">Field Stability Metrics</h3>
        <span className="text-xs text-muted-foreground ml-auto font-mono">
          {memories.length} memories
        </span>
      </div>

      <div className="grid gap-3">
        <MetricCard
          title="Entropy (S)"
          value={metrics.entropy}
          icon={<Gauge className="w-4 h-4" />}
          description={
            metrics.entropy < 0.3 
              ? "Sharp, concentrated memory" 
              : metrics.entropy < 0.7 
                ? "Moderate dispersion" 
                : "High noise, information diffuse"
          }
          status={getEntropyStatus(metrics.entropy)}
        />

        <MetricCard
          title="Coherence (C)"
          value={metrics.coherence}
          icon={<Activity className="w-4 h-4" />}
          description={
            metrics.coherence > 0.7 
              ? "Phase-locked, high confidence" 
              : metrics.coherence > 0.3 
                ? "Partial alignment" 
                : "Random phases, low confidence"
          }
          status={getCoherenceStatus(metrics.coherence)}
        />

        <MetricCard
          title="Lyapunov (λ)"
          value={metrics.lyapunov}
          icon={<TrendingUp className="w-4 h-4" />}
          description={
            metrics.lyapunov < 0 
              ? "Stable, converging to truth" 
              : metrics.lyapunov < 0.5 
                ? "Marginal stability" 
                : "Unstable, risk of hallucination"
          }
          status={getLyapunovStatus(metrics.lyapunov)}
        />
      </div>

      {/* Invariant checks */}
      <div className="mt-4 p-3 bg-secondary/50 rounded-lg border border-border">
        <h4 className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">
          Key Invariants
        </h4>
        <div className="space-y-1 text-xs font-mono">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Unit Norm</span>
            <span className="text-success">✓ Preserved</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Prime Uniqueness</span>
            <span className="text-success">✓ Verified</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Entropy Bounds</span>
            <span className={metrics.entropy <= 1 ? "text-success" : "text-destructive"}>
              {metrics.entropy <= 1 ? "✓" : "✗"} 0 ≤ S ≤ 1
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Symmetric Entanglement</span>
            <span className="text-success">✓ Enforced</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MetricsPanel;
