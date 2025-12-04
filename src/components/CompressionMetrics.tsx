import { useMemo } from 'react';
import { Memory } from '@/lib/quaternion';
import { Minimize2, Database, Binary, Percent, Layers } from 'lucide-react';

interface CompressionMetricsProps {
  memories: Memory[];
}

interface CompressionData {
  rawBytes: number;
  encodedBytes: number;
  quaternionBytes: number;
  primeSignatureBytes: number;
  compressionRatio: number;
  spaceSavings: number;
  bitsPerChar: number;
  informationDensity: number;
  uniquePrimes: number;
  avgPrimesPerMemory: number;
}

function calculateCompression(memories: Memory[]): CompressionData {
  if (memories.length === 0) {
    return {
      rawBytes: 0,
      encodedBytes: 0,
      quaternionBytes: 0,
      primeSignatureBytes: 0,
      compressionRatio: 1,
      spaceSavings: 0,
      bitsPerChar: 0,
      informationDensity: 0,
      uniquePrimes: 0,
      avgPrimesPerMemory: 0
    };
  }

  // Raw data size: UTF-8 encoding of content
  const rawBytes = memories.reduce((sum, m) => sum + new TextEncoder().encode(m.content).length, 0);
  
  // Quaternion encoding: 4 components × 8 bytes (64-bit float) per memory
  const quaternionBytes = memories.length * 4 * 8;
  
  // Prime signature: variable, but stored as Set of integers
  // Each prime is a 32-bit integer (4 bytes)
  const allPrimes = new Set<number>();
  let totalPrimes = 0;
  memories.forEach(m => {
    m.primeSignature.forEach(p => allPrimes.add(p));
    totalPrimes += m.primeSignature.length;
  });
  
  // In holographic encoding, we only store unique primes once in the field
  // Plus a bitmap/index for each memory's prime subset
  const uniquePrimeBytes = allPrimes.size * 4; // Store each unique prime once
  const bitmapBytes = memories.length * Math.ceil(allPrimes.size / 8); // Bitmap per memory
  const primeSignatureBytes = uniquePrimeBytes + bitmapBytes;
  
  // Total encoded size
  const encodedBytes = quaternionBytes + primeSignatureBytes;
  
  // Compression metrics
  const compressionRatio = rawBytes > 0 ? rawBytes / encodedBytes : 1;
  const spaceSavings = rawBytes > 0 ? ((rawBytes - encodedBytes) / rawBytes) * 100 : 0;
  
  // Information density: bits of quaternion info per character of input
  const totalChars = memories.reduce((sum, m) => sum + m.content.length, 0);
  const quaternionBits = quaternionBytes * 8;
  const bitsPerChar = totalChars > 0 ? quaternionBits / totalChars : 0;
  
  // Holographic density: how much semantic info is packed per byte
  // Measured as unique semantic states (quaternion variations) per encoded byte
  const informationDensity = encodedBytes > 0 ? memories.length / encodedBytes : 0;

  return {
    rawBytes,
    encodedBytes,
    quaternionBytes,
    primeSignatureBytes,
    compressionRatio,
    spaceSavings,
    bitsPerChar,
    informationDensity,
    uniquePrimes: allPrimes.size,
    avgPrimesPerMemory: memories.length > 0 ? totalPrimes / memories.length : 0
  };
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function MetricRow({ label, value, subValue, icon, highlight }: { 
  label: string; 
  value: string; 
  subValue?: string;
  icon: React.ReactNode;
  highlight?: boolean;
}) {
  return (
    <div className={`flex items-center justify-between p-3 rounded-lg ${
      highlight ? 'bg-primary/10 border border-primary/30' : 'bg-secondary/30'
    }`}>
      <div className="flex items-center gap-2">
        <div className="text-muted-foreground">{icon}</div>
        <span className="text-sm text-foreground">{label}</span>
      </div>
      <div className="text-right">
        <div className={`font-mono font-semibold ${highlight ? 'text-primary' : 'text-foreground'}`}>
          {value}
        </div>
        {subValue && (
          <div className="text-xs text-muted-foreground">{subValue}</div>
        )}
      </div>
    </div>
  );
}

export function CompressionMetrics({ memories }: CompressionMetricsProps) {
  const data = useMemo(() => calculateCompression(memories), [memories]);

  const isExpanding = data.compressionRatio < 1;
  const ratioDisplay = data.compressionRatio >= 1 
    ? `${data.compressionRatio.toFixed(2)}:1` 
    : `1:${(1/data.compressionRatio).toFixed(2)}`;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Minimize2 className="w-5 h-5 text-primary" />
        <h3 className="font-semibold text-foreground">Compression Analysis</h3>
      </div>

      {memories.length === 0 ? (
        <div className="text-center py-6 text-muted-foreground text-sm">
          Add memories to analyze compression
        </div>
      ) : (
        <>
          {/* Primary compression ratio */}
          <div className={`p-4 rounded-lg border ${
            isExpanding 
              ? 'bg-accent/10 border-accent/30' 
              : 'bg-primary/10 border-primary/30'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Effective Compression Ratio</span>
              <Percent className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className={`text-3xl font-mono font-bold ${
              isExpanding ? 'text-accent' : 'text-primary'
            }`}>
              {ratioDisplay}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {isExpanding 
                ? `Expansion: Field uses ${Math.abs(data.spaceSavings).toFixed(1)}% more space (semantic enrichment)`
                : `Savings: ${data.spaceSavings.toFixed(1)}% space reduction`
              }
            </div>
            
            {/* Visual bar */}
            <div className="mt-3 h-2 bg-background/50 rounded-full overflow-hidden flex">
              <div 
                className="h-full bg-muted-foreground/30 transition-all"
                style={{ width: `${Math.min((data.rawBytes / Math.max(data.rawBytes, data.encodedBytes)) * 100, 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
              <span>Raw: {formatBytes(data.rawBytes)}</span>
              <span>Encoded: {formatBytes(data.encodedBytes)}</span>
            </div>
          </div>

          {/* Breakdown */}
          <div className="space-y-2">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Size Breakdown
            </div>
            
            <MetricRow
              label="Raw Input Data"
              value={formatBytes(data.rawBytes)}
              subValue={`${memories.reduce((s, m) => s + m.content.length, 0)} chars`}
              icon={<Database className="w-4 h-4" />}
            />
            
            <MetricRow
              label="Quaternion Encoding"
              value={formatBytes(data.quaternionBytes)}
              subValue={`${memories.length} × 32 bytes`}
              icon={<Layers className="w-4 h-4" />}
            />
            
            <MetricRow
              label="Prime Signatures"
              value={formatBytes(data.primeSignatureBytes)}
              subValue={`${data.uniquePrimes} unique primes`}
              icon={<Binary className="w-4 h-4" />}
            />
          </div>

          {/* Information density */}
          <div className="space-y-2">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Information Density
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <div className="p-3 bg-secondary/30 rounded-lg">
                <div className="text-xs text-muted-foreground">Bits per Character</div>
                <div className="font-mono text-lg text-foreground">{data.bitsPerChar.toFixed(2)}</div>
                <div className="text-[10px] text-muted-foreground">Semantic resolution</div>
              </div>
              
              <div className="p-3 bg-secondary/30 rounded-lg">
                <div className="text-xs text-muted-foreground">Avg Primes/Memory</div>
                <div className="font-mono text-lg text-foreground">{data.avgPrimesPerMemory.toFixed(1)}</div>
                <div className="text-[10px] text-muted-foreground">Content addressing depth</div>
              </div>
            </div>
            
            <div className="p-3 bg-secondary/30 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-muted-foreground">Holographic Density</div>
                  <div className="font-mono text-lg text-foreground">
                    {(data.informationDensity * 1000).toFixed(4)} <span className="text-xs text-muted-foreground">memories/KB</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-muted-foreground">Prime Reuse</div>
                  <div className="font-mono text-sm text-primary">
                    {memories.length > 0 && data.uniquePrimes > 0 
                      ? ((1 - data.uniquePrimes / (data.avgPrimesPerMemory * memories.length)) * 100).toFixed(1)
                      : 0
                    }%
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Explanation */}
          <div className="p-3 bg-muted/30 rounded-lg border border-border text-xs text-muted-foreground">
            <p className="mb-2">
              <strong className="text-foreground">Note:</strong> QMF prioritizes semantic richness over raw compression.
            </p>
            <p>
              The quaternion encoding captures 4D semantic orientation (coherence, security, performance, usability) 
              that raw text cannot represent. Prime signatures enable content-addressable retrieval and entanglement detection.
            </p>
          </div>
        </>
      )}
    </div>
  );
}

export default CompressionMetrics;
