import { useState, useCallback } from 'react';
import { Memory, Quaternion, encodeText } from '@/lib/quaternion';
import { QuaternionVisualizer } from '@/components/QuaternionVisualizer';
import { MetricsPanel } from '@/components/MetricsPanel';
import { CompressionMetrics } from '@/components/CompressionMetrics';
import { MemoryEncoder } from '@/components/MemoryEncoder';
import MemoryDecoder from '@/components/MemoryDecoder';
import { HamiltonCalculator } from '@/components/HamiltonCalculator';
import { SlerpVisualizer } from '@/components/SlerpVisualizer';
import { StressTest } from '@/components/StressTest';
import { MemoryList } from '@/components/MemoryList';
import TestRunner from '@/components/TestRunner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Atom, FlaskConical, Gauge, Zap, GitBranch, RotateCcw, Minimize2, Search, TestTube } from 'lucide-react';

const Index = () => {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null);
  const [activeQuaternion, setActiveQuaternion] = useState<Quaternion>({ w: 1, x: 0, y: 0, z: 0 });

  const handleEncode = useCallback((content: string, quaternion: Quaternion, primeSignature: number[]) => {
    const newMemory: Memory = {
      id: crypto.randomUUID(),
      content,
      quaternion,
      primeSignature,
      timestamp: Date.now()
    };
    setMemories(prev => [newMemory, ...prev]);
    setActiveQuaternion(quaternion);
    setSelectedMemory(newMemory);
  }, []);

  const handleSelectMemory = useCallback((memory: Memory) => {
    setSelectedMemory(memory);
    setActiveQuaternion(memory.quaternion);
  }, []);

  const handleDeleteMemory = useCallback((id: string) => {
    setMemories(prev => prev.filter(m => m.id !== id));
    if (selectedMemory?.id === id) {
      setSelectedMemory(null);
      setActiveQuaternion({ w: 1, x: 0, y: 0, z: 0 });
    }
  }, [selectedMemory]);

  const handleClearMemories = useCallback(() => {
    setMemories([]);
    setSelectedMemory(null);
    setActiveQuaternion({ w: 1, x: 0, y: 0, z: 0 });
  }, []);

  const handleMemoriesGenerated = useCallback((newMemories: Memory[]) => {
    setMemories(newMemories);
    if (newMemories.length > 0) {
      setSelectedMemory(newMemories[0]);
      setActiveQuaternion(newMemories[0].quaternion);
    }
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-qmf-performance flex items-center justify-center">
                <Atom className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Quaternionic Memory Field</h1>
                <p className="text-xs text-muted-foreground">Demonstration, Visualization & Benchmarking Lab</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                <span>Field Active</span>
              </div>
              <div className="font-mono">{memories.length} memories</div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Panel - Visualization */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-card rounded-xl border border-border p-4">
              <div className="flex items-center gap-2 mb-4">
                <Atom className="w-5 h-5 text-primary" />
                <h2 className="font-semibold">4D Quaternion Space</h2>
                <span className="text-xs text-muted-foreground ml-auto">Stereographic Projection</span>
              </div>
              <div className="flex justify-center">
                <QuaternionVisualizer quaternion={activeQuaternion} size={380} animate={true} />
              </div>
              
              {/* Quaternion readout */}
              <div className="mt-4 grid grid-cols-4 gap-2 text-center">
                <div className="p-2 rounded bg-qmf-coherence/10 border border-qmf-coherence/30">
                  <div className="text-[10px] text-qmf-coherence opacity-80">w (Coherence)</div>
                  <div className="font-mono text-sm text-qmf-coherence">{activeQuaternion.w.toFixed(4)}</div>
                </div>
                <div className="p-2 rounded bg-qmf-security/10 border border-qmf-security/30">
                  <div className="text-[10px] text-qmf-security opacity-80">x (Security)</div>
                  <div className="font-mono text-sm text-qmf-security">{activeQuaternion.x.toFixed(4)}</div>
                </div>
                <div className="p-2 rounded bg-qmf-performance/10 border border-qmf-performance/30">
                  <div className="text-[10px] text-qmf-performance opacity-80">y (Performance)</div>
                  <div className="font-mono text-sm text-qmf-performance">{activeQuaternion.y.toFixed(4)}</div>
                </div>
                <div className="p-2 rounded bg-qmf-usability/10 border border-qmf-usability/30">
                  <div className="text-[10px] text-qmf-usability opacity-80">z (Usability)</div>
                  <div className="font-mono text-sm text-qmf-usability">{activeQuaternion.z.toFixed(4)}</div>
                </div>
              </div>
            </div>

            {/* Memory List */}
            <div className="bg-card rounded-xl border border-border p-4">
              <MemoryList
                memories={memories}
                selectedId={selectedMemory?.id}
                onSelect={handleSelectMemory}
                onDelete={handleDeleteMemory}
                onClear={handleClearMemories}
              />
            </div>
          </div>

          {/* Right Panel - Tools & Metrics */}
          <div className="lg:col-span-7 space-y-6">
            <Tabs defaultValue="encode" className="w-full">
              <TabsList className="grid w-full grid-cols-8 bg-secondary/50">
                <TabsTrigger value="encode" className="flex items-center gap-1 text-xs">
                  <Zap className="w-3 h-3" />
                  Encode
                </TabsTrigger>
                <TabsTrigger value="decode" className="flex items-center gap-1 text-xs">
                  <Search className="w-3 h-3" />
                  Decode
                </TabsTrigger>
                <TabsTrigger value="hamilton" className="flex items-center gap-1 text-xs">
                  <RotateCcw className="w-3 h-3" />
                  Hamilton
                </TabsTrigger>
                <TabsTrigger value="slerp" className="flex items-center gap-1 text-xs">
                  <GitBranch className="w-3 h-3" />
                  SLERP
                </TabsTrigger>
                <TabsTrigger value="stress" className="flex items-center gap-1 text-xs">
                  <FlaskConical className="w-3 h-3" />
                  Stress
                </TabsTrigger>
                <TabsTrigger value="tests" className="flex items-center gap-1 text-xs">
                  <TestTube className="w-3 h-3" />
                  Tests
                </TabsTrigger>
                <TabsTrigger value="metrics" className="flex items-center gap-1 text-xs">
                  <Gauge className="w-3 h-3" />
                  Metrics
                </TabsTrigger>
                <TabsTrigger value="compression" className="flex items-center gap-1 text-xs">
                  <Minimize2 className="w-3 h-3" />
                  Compress
                </TabsTrigger>
              </TabsList>

              <TabsContent value="encode" className="mt-4">
                <div className="bg-card rounded-xl border border-border p-4">
                  <MemoryEncoder onEncode={handleEncode} />
                </div>
              </TabsContent>

              <TabsContent value="decode" className="mt-4">
                <div className="bg-card rounded-xl border border-border p-4">
                  <MemoryDecoder memories={memories} onSelectMemory={handleSelectMemory} />
                </div>
              </TabsContent>

              <TabsContent value="hamilton" className="mt-4">
                <div className="bg-card rounded-xl border border-border p-4">
                  <HamiltonCalculator />
                </div>
              </TabsContent>

              <TabsContent value="slerp" className="mt-4">
                <div className="bg-card rounded-xl border border-border p-4">
                  <SlerpVisualizer />
                </div>
              </TabsContent>

              <TabsContent value="stress" className="mt-4">
                <div className="bg-card rounded-xl border border-border p-4">
                  <StressTest onMemoriesGenerated={handleMemoriesGenerated} />
                </div>
              </TabsContent>

              <TabsContent value="tests" className="mt-4">
                <div className="bg-card rounded-xl border border-border p-4">
                  <TestRunner />
                </div>
              </TabsContent>

              <TabsContent value="metrics" className="mt-4">
                <div className="bg-card rounded-xl border border-border p-4">
                  <MetricsPanel memories={memories} />
                </div>
              </TabsContent>

              <TabsContent value="compression" className="mt-4">
                <div className="bg-card rounded-xl border border-border p-4">
                  <CompressionMetrics memories={memories} />
                </div>
              </TabsContent>
            </Tabs>

            {/* Quick Info Panel */}
            <div className="bg-card rounded-xl border border-border p-4">
              <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <FlaskConical className="w-4 h-4 text-primary" />
                QMF Theory Reference
              </h3>
              
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="space-y-2">
                  <div className="font-medium text-muted-foreground">Quaternion Formula</div>
                  <div className="font-mono text-foreground bg-secondary/50 p-2 rounded">
                    q = w + xi + yj + zk
                  </div>
                  <div className="text-muted-foreground">
                    Hamilton relations: i² = j² = k² = ijk = −1
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="font-medium text-muted-foreground">Hamilton Product</div>
                  <div className="font-mono text-foreground bg-secondary/50 p-2 rounded">
                    q₁ × q₂ ≠ q₂ × q₁
                  </div>
                  <div className="text-muted-foreground">
                    Non-commutative: order matters for semantics
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="font-medium text-muted-foreground">Resonance Score</div>
                  <div className="font-mono text-foreground bg-secondary/50 p-2 rounded">
                    R = α·Jaccard + β·|q₁·q₂|
                  </div>
                  <div className="text-muted-foreground">
                    Prime similarity + semantic alignment
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="font-medium text-muted-foreground">Entanglement</div>
                  <div className="font-mono text-foreground bg-secondary/50 p-2 rounded">
                    E ≥ 0.3 → linked
                  </div>
                  <div className="text-muted-foreground">
                    Non-local associations between memories
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-8 py-4">
        <div className="container mx-auto px-4 text-center text-xs text-muted-foreground">
          QMF Lab — Quaternionic Memory Field Visualization & Benchmarking
        </div>
      </footer>
    </div>
  );
};

export default Index;
