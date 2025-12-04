import { useState } from 'react';
import { encodeText, Quaternion, magnitude } from '@/lib/quaternion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Zap, Hash, RotateCcw } from 'lucide-react';

interface MemoryEncoderProps {
  onEncode: (content: string, quaternion: Quaternion, primeSignature: number[]) => void;
}

export function MemoryEncoder({ onEncode }: MemoryEncoderProps) {
  const [text, setText] = useState('');
  const [preview, setPreview] = useState<{
    quaternion: Quaternion;
    primeSignature: number[];
  } | null>(null);

  const handleTextChange = (value: string) => {
    setText(value);
    if (value.trim()) {
      const result = encodeText(value);
      setPreview(result);
    } else {
      setPreview(null);
    }
  };

  const handleEncode = () => {
    if (text.trim() && preview) {
      onEncode(text, preview.quaternion, preview.primeSignature);
      setText('');
      setPreview(null);
    }
  };

  const handleReset = () => {
    setText('');
    setPreview(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Zap className="w-5 h-5 text-primary" />
        <h3 className="font-semibold text-foreground">Memory Encoder</h3>
      </div>

      <div className="space-y-3">
        <div className="relative">
          <Input
            value={text}
            onChange={(e) => handleTextChange(e.target.value)}
            placeholder="Enter text to encode into QMF..."
            className="bg-background/50 border-border focus:border-primary pr-10"
          />
          {text && (
            <button
              onClick={handleReset}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>

        {preview && (
          <div className="p-4 bg-secondary/30 rounded-lg border border-border space-y-3 animate-in fade-in duration-200">
            <div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
                Quaternion Encoding
              </div>
              <div className="grid grid-cols-4 gap-2 font-mono text-sm">
                <div className="p-2 bg-qmf-coherence/10 rounded border border-qmf-coherence/30">
                  <div className="text-[10px] text-qmf-coherence opacity-80">w (Coherence)</div>
                  <div className="text-qmf-coherence font-semibold">{preview.quaternion.w.toFixed(4)}</div>
                </div>
                <div className="p-2 bg-qmf-security/10 rounded border border-qmf-security/30">
                  <div className="text-[10px] text-qmf-security opacity-80">x (Security)</div>
                  <div className="text-qmf-security font-semibold">{preview.quaternion.x.toFixed(4)}</div>
                </div>
                <div className="p-2 bg-qmf-performance/10 rounded border border-qmf-performance/30">
                  <div className="text-[10px] text-qmf-performance opacity-80">y (Perf)</div>
                  <div className="text-qmf-performance font-semibold">{preview.quaternion.y.toFixed(4)}</div>
                </div>
                <div className="p-2 bg-qmf-usability/10 rounded border border-qmf-usability/30">
                  <div className="text-[10px] text-qmf-usability opacity-80">z (Usability)</div>
                  <div className="text-qmf-usability font-semibold">{preview.quaternion.z.toFixed(4)}</div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>|q| = {magnitude(preview.quaternion).toFixed(6)}</span>
              <span className="text-success">✓ Unit norm</span>
            </div>

            <div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground uppercase tracking-wider mb-2">
                <Hash className="w-3 h-3" />
                <span>Prime Signature ({preview.primeSignature.length} primes)</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {preview.primeSignature.slice(0, 12).map((prime, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 bg-primary/10 text-primary text-xs font-mono rounded"
                  >
                    {prime}
                  </span>
                ))}
                {preview.primeSignature.length > 12 && (
                  <span className="px-2 py-0.5 text-muted-foreground text-xs">
                    +{preview.primeSignature.length - 12} more
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        <Button
          onClick={handleEncode}
          disabled={!text.trim()}
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <Zap className="w-4 h-4 mr-2" />
          Superpose to Field
        </Button>
      </div>
    </div>
  );
}

export default MemoryEncoder;
