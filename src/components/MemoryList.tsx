import { Memory, entanglementStrength } from '@/lib/quaternion';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Database, Link2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MemoryListProps {
  memories: Memory[];
  selectedId?: string;
  onSelect: (memory: Memory) => void;
  onDelete: (id: string) => void;
  onClear: () => void;
}

export function MemoryList({ memories, selectedId, onSelect, onDelete, onClear }: MemoryListProps) {
  // Find entangled pairs for display
  const getEntanglementCount = (memory: Memory) => {
    let count = 0;
    memories.forEach(other => {
      if (other.id !== memory.id) {
        const strength = entanglementStrength(memory, other);
        if (strength >= 0.3) count++;
      }
    });
    return count;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Database className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground">Memory Field</h3>
          <span className="text-xs text-muted-foreground font-mono">
            ({memories.length})
          </span>
        </div>
        {memories.length > 0 && (
          <Button variant="ghost" size="sm" onClick={onClear} className="text-destructive hover:text-destructive">
            <Trash2 className="w-3 h-3 mr-1" />
            Clear
          </Button>
        )}
      </div>

      {memories.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <Database className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No memories in field</p>
          <p className="text-xs mt-1">Encode text or run stress test</p>
        </div>
      ) : (
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-2">
            {memories.map((memory) => {
              const entanglements = getEntanglementCount(memory);
              const isSelected = memory.id === selectedId;
              
              return (
                <div
                  key={memory.id}
                  onClick={() => onSelect(memory)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    isSelected 
                      ? 'border-primary bg-primary/10' 
                      : 'border-border hover:border-primary/50 bg-secondary/30'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {memory.content}
                      </p>
                      
                      <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                        <span className="font-mono">
                          w: {memory.quaternion.w.toFixed(3)}
                        </span>
                        <span className="font-mono">
                          #{memory.primeSignature.length} primes
                        </span>
                        {entanglements > 0 && (
                          <span className="flex items-center gap-1 text-primary">
                            <Link2 className="w-3 h-3" />
                            {entanglements}
                          </span>
                        )}
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(memory.id);
                      }}
                      className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>

                  {/* Quaternion mini-bar */}
                  <div className="flex gap-0.5 mt-2">
                    <div 
                      className="h-1 rounded-full bg-qmf-coherence"
                      style={{ width: `${Math.abs(memory.quaternion.w) * 100}%` }}
                    />
                    <div 
                      className="h-1 rounded-full bg-qmf-security"
                      style={{ width: `${Math.abs(memory.quaternion.x) * 100}%` }}
                    />
                    <div 
                      className="h-1 rounded-full bg-qmf-performance"
                      style={{ width: `${Math.abs(memory.quaternion.y) * 100}%` }}
                    />
                    <div 
                      className="h-1 rounded-full bg-qmf-usability"
                      style={{ width: `${Math.abs(memory.quaternion.z) * 100}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}

export default MemoryList;
