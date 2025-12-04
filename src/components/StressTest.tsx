import { useState, useCallback, useRef } from 'react';
import { Memory, generateRandomMemory, hamiltonProduct, resonanceScore, entanglementStrength } from '@/lib/quaternion';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { Zap, Play, Square, Gauge, Clock, Database, Activity } from 'lucide-react';

interface StressTestProps {
  onMemoriesGenerated: (memories: Memory[]) => void;
}

interface BenchmarkResult {
  operation: string;
  count: number;
  totalTime: number;
  avgTime: number;
  opsPerSecond: number;
}

export function StressTest({ onMemoriesGenerated }: StressTestProps) {
  const [memoryCount, setMemoryCount] = useState(1000);
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<BenchmarkResult[]>([]);
  const abortRef = useRef(false);

  const runBenchmark = useCallback(async () => {
    setIsRunning(true);
    setProgress(0);
    setResults([]);
    abortRef.current = false;

    const benchmarks: BenchmarkResult[] = [];

    // Generate memories
    const genStart = performance.now();
    const memories: Memory[] = [];
    
    for (let i = 0; i < memoryCount; i++) {
      if (abortRef.current) break;
      memories.push(generateRandomMemory());
      if (i % Math.ceil(memoryCount / 20) === 0) {
        setProgress((i / memoryCount) * 25);
        await new Promise(r => setTimeout(r, 0)); // Yield to UI
      }
    }
    
    const genTime = performance.now() - genStart;
    benchmarks.push({
      operation: 'Memory Generation',
      count: memories.length,
      totalTime: genTime,
      avgTime: genTime / memories.length,
      opsPerSecond: (memories.length / genTime) * 1000
    });

    if (abortRef.current) {
      setIsRunning(false);
      return;
    }

    // Hamilton products
    const hamiltonCount = Math.min(memories.length * 10, 10000);
    const hamiltonStart = performance.now();
    
    for (let i = 0; i < hamiltonCount; i++) {
      if (abortRef.current) break;
      const a = memories[Math.floor(Math.random() * memories.length)];
      const b = memories[Math.floor(Math.random() * memories.length)];
      hamiltonProduct(a.quaternion, b.quaternion);
      
      if (i % Math.ceil(hamiltonCount / 20) === 0) {
        setProgress(25 + (i / hamiltonCount) * 25);
        await new Promise(r => setTimeout(r, 0));
      }
    }
    
    const hamiltonTime = performance.now() - hamiltonStart;
    benchmarks.push({
      operation: 'Hamilton Products',
      count: hamiltonCount,
      totalTime: hamiltonTime,
      avgTime: hamiltonTime / hamiltonCount,
      opsPerSecond: (hamiltonCount / hamiltonTime) * 1000
    });

    if (abortRef.current) {
      setIsRunning(false);
      return;
    }

    // Resonance calculations
    const resonanceCount = Math.min(memories.length * 5, 5000);
    const resonanceStart = performance.now();
    
    for (let i = 0; i < resonanceCount; i++) {
      if (abortRef.current) break;
      const a = memories[Math.floor(Math.random() * memories.length)];
      const b = memories[Math.floor(Math.random() * memories.length)];
      resonanceScore(a, b);
      
      if (i % Math.ceil(resonanceCount / 20) === 0) {
        setProgress(50 + (i / resonanceCount) * 25);
        await new Promise(r => setTimeout(r, 0));
      }
    }
    
    const resonanceTime = performance.now() - resonanceStart;
    benchmarks.push({
      operation: 'Resonance Scores',
      count: resonanceCount,
      totalTime: resonanceTime,
      avgTime: resonanceTime / resonanceCount,
      opsPerSecond: (resonanceCount / resonanceTime) * 1000
    });

    if (abortRef.current) {
      setIsRunning(false);
      return;
    }

    // Entanglement detection
    const entanglementCount = Math.min(memories.length * 3, 3000);
    const entanglementStart = performance.now();
    let entangledPairs = 0;
    
    for (let i = 0; i < entanglementCount; i++) {
      if (abortRef.current) break;
      const a = memories[Math.floor(Math.random() * memories.length)];
      const b = memories[Math.floor(Math.random() * memories.length)];
      const strength = entanglementStrength(a, b);
      if (strength >= 0.3) entangledPairs++;
      
      if (i % Math.ceil(entanglementCount / 20) === 0) {
        setProgress(75 + (i / entanglementCount) * 25);
        await new Promise(r => setTimeout(r, 0));
      }
    }
    
    const entanglementTime = performance.now() - entanglementStart;
    benchmarks.push({
      operation: 'Entanglement Detection',
      count: entanglementCount,
      totalTime: entanglementTime,
      avgTime: entanglementTime / entanglementCount,
      opsPerSecond: (entanglementCount / entanglementTime) * 1000
    });

    setProgress(100);
    setResults(benchmarks);
    setIsRunning(false);
    
    onMemoriesGenerated(memories);
  }, [memoryCount, onMemoriesGenerated]);

  const stopBenchmark = () => {
    abortRef.current = true;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Gauge className="w-5 h-5 text-primary" />
        <h3 className="font-semibold text-foreground">Stress Test & Benchmarks</h3>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <Database className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Memory Count:</span>
          <Slider
            value={[memoryCount]}
            onValueChange={([v]) => setMemoryCount(v)}
            min={100}
            max={1000000}
            step={100}
            disabled={isRunning}
            className="flex-1"
          />
          <span className="w-20 text-right font-mono text-sm">
            {memoryCount >= 1000000 ? '1M' : memoryCount >= 1000 ? `${(memoryCount/1000).toFixed(0)}K` : memoryCount}
          </span>
        </div>

        <div className="flex gap-2">
          {!isRunning ? (
            <Button onClick={runBenchmark} className="flex-1">
              <Play className="w-4 h-4 mr-2" />
              Run Stress Test
            </Button>
          ) : (
            <Button onClick={stopBenchmark} variant="destructive" className="flex-1">
              <Square className="w-4 h-4 mr-2" />
              Stop
            </Button>
          )}
        </div>

        {(isRunning || progress > 0) && (
          <div className="space-y-1">
            <Progress value={progress} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{isRunning ? 'Running...' : 'Complete'}</span>
              <span>{progress.toFixed(0)}%</span>
            </div>
          </div>
        )}
      </div>

      {results.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-border">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Benchmark Results
          </div>
          
          {results.map((result, i) => (
            <div 
              key={i} 
              className="p-3 bg-secondary/30 rounded-lg border border-border space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">{result.operation}</span>
                <span className="text-xs font-mono text-primary">
                  {result.count.toLocaleString()} ops
                </span>
              </div>
              
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-muted-foreground" />
                  <span className="text-muted-foreground">Total:</span>
                  <span className="font-mono">{result.totalTime.toFixed(2)}ms</span>
                </div>
                <div className="flex items-center gap-1">
                  <Activity className="w-3 h-3 text-muted-foreground" />
                  <span className="text-muted-foreground">Avg:</span>
                  <span className="font-mono">{result.avgTime.toFixed(4)}ms</span>
                </div>
                <div className="flex items-center gap-1">
                  <Zap className="w-3 h-3 text-accent" />
                  <span className="font-mono text-accent">
                    {result.opsPerSecond >= 1000 
                      ? `${(result.opsPerSecond / 1000).toFixed(1)}K/s`
                      : `${result.opsPerSecond.toFixed(0)}/s`
                    }
                  </span>
                </div>
              </div>
            </div>
          ))}

          <div className="p-3 bg-primary/10 rounded-lg border border-primary/30 mt-3">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-foreground">Total Operations</span>
            </div>
            <div className="mt-2 font-mono text-lg text-primary">
              {results.reduce((sum, r) => sum + r.count, 0).toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground">
              in {results.reduce((sum, r) => sum + r.totalTime, 0).toFixed(2)}ms
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default StressTest;
