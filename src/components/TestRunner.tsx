import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Play, CheckCircle, XCircle, Clock, TestTube } from 'lucide-react';
import {
  createQuaternion,
  magnitude,
  normalize,
  hamiltonProduct,
  dot,
  slerp,
  encodeText,
  jaccardSimilarity,
  resonanceScore,
  entanglementStrength,
  generateRandomMemory,
  Memory,
} from '@/lib/quaternion';

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
  duration: number;
}

interface TestSuite {
  name: string;
  results: TestResult[];
}

type TestFn = () => void;

const TestRunner = () => {
  const [suites, setSuites] = useState<TestSuite[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [totalTime, setTotalTime] = useState<number | null>(null);

  const runTest = (name: string, fn: TestFn): TestResult => {
    const start = performance.now();
    try {
      fn();
      return { name, passed: true, duration: performance.now() - start };
    } catch (e) {
      return { name, passed: false, error: (e as Error).message, duration: performance.now() - start };
    }
  };

  const expect = (value: unknown) => ({
    toBe: (expected: unknown) => {
      if (value !== expected) throw new Error(`Expected ${expected}, got ${value}`);
    },
    toBeCloseTo: (expected: number, precision = 5) => {
      if (Math.abs((value as number) - expected) > Math.pow(10, -precision)) {
        throw new Error(`Expected ${expected} ±${Math.pow(10, -precision)}, got ${value}`);
      }
    },
    toBeGreaterThan: (expected: number) => {
      if ((value as number) <= expected) throw new Error(`Expected > ${expected}, got ${value}`);
    },
    toBeGreaterThanOrEqual: (expected: number) => {
      if ((value as number) < expected) throw new Error(`Expected >= ${expected}, got ${value}`);
    },
    toBeLessThan: (expected: number) => {
      if ((value as number) >= expected) throw new Error(`Expected < ${expected}, got ${value}`);
    },
    toBeLessThanOrEqual: (expected: number) => {
      if ((value as number) > expected) throw new Error(`Expected <= ${expected}, got ${value}`);
    },
    toBeDefined: () => {
      if (value === undefined) throw new Error('Expected value to be defined');
    },
    toEqual: (expected: unknown) => {
      if (JSON.stringify(value) !== JSON.stringify(expected)) {
        throw new Error(`Expected ${JSON.stringify(expected)}, got ${JSON.stringify(value)}`);
      }
    },
    toMatch: (pattern: RegExp) => {
      if (!pattern.test(value as string)) throw new Error(`Expected to match ${pattern}`);
    },
  });

  const runAllTests = useCallback(async () => {
    setIsRunning(true);
    setProgress(0);
    setSuites([]);
    const allSuites: TestSuite[] = [];
    const overallStart = performance.now();

    // Quaternion Basics
    const basicResults: TestResult[] = [];
    basicResults.push(runTest('creates quaternion with correct components', () => {
      const q = createQuaternion(1, 2, 3, 4);
      expect(q.w).toBe(1);
      expect(q.x).toBe(2);
      expect(q.y).toBe(3);
      expect(q.z).toBe(4);
    }));
    basicResults.push(runTest('calculates magnitude correctly', () => {
      const q = createQuaternion(1, 0, 0, 0);
      expect(magnitude(q)).toBe(1);
      const q2 = createQuaternion(3, 4, 0, 0);
      expect(magnitude(q2)).toBe(5);
    }));
    basicResults.push(runTest('normalizes to unit length', () => {
      const q = createQuaternion(2, 0, 0, 0);
      const normalized = normalize(q);
      expect(magnitude(normalized)).toBeCloseTo(1, 10);
    }));
    basicResults.push(runTest('handles zero quaternion', () => {
      const q = createQuaternion(0, 0, 0, 0);
      const normalized = normalize(q);
      expect(normalized.w).toBe(1);
    }));
    basicResults.push(runTest('computes dot product', () => {
      const q1 = createQuaternion(1, 0, 0, 0);
      const q2 = createQuaternion(1, 0, 0, 0);
      expect(dot(q1, q2)).toBe(1);
    }));
    allSuites.push({ name: 'Quaternion Basics', results: basicResults });
    setProgress(15);
    await new Promise(r => setTimeout(r, 0));

    // Hamilton Product
    const hamiltonResults: TestResult[] = [];
    hamiltonResults.push(runTest('produces normalized result', () => {
      const q1 = normalize(createQuaternion(1, 2, 3, 4));
      const q2 = normalize(createQuaternion(5, 6, 7, 8));
      const result = hamiltonProduct(q1, q2);
      expect(magnitude(result)).toBeCloseTo(1, 10);
    }));
    hamiltonResults.push(runTest('is non-commutative', () => {
      const q1 = normalize(createQuaternion(1, 2, 3, 4));
      const q2 = normalize(createQuaternion(5, 6, 7, 8));
      const ab = hamiltonProduct(q1, q2);
      const ba = hamiltonProduct(q2, q1);
      const diff = Math.abs(ab.w - ba.w) + Math.abs(ab.x - ba.x);
      expect(diff).toBeGreaterThan(0.01);
    }));
    hamiltonResults.push(runTest('identity acts as identity', () => {
      const identity = createQuaternion(1, 0, 0, 0);
      const q = normalize(createQuaternion(1, 2, 3, 4));
      const result = hamiltonProduct(identity, q);
      expect(result.w).toBeCloseTo(q.w, 5);
    }));
    allSuites.push({ name: 'Hamilton Product', results: hamiltonResults });
    setProgress(30);
    await new Promise(r => setTimeout(r, 0));

    // SLERP
    const slerpResults: TestResult[] = [];
    slerpResults.push(runTest('returns start at t=0', () => {
      const q1 = normalize(createQuaternion(1, 0, 0, 0));
      const q2 = normalize(createQuaternion(0, 1, 0, 0));
      const result = slerp(q1, q2, 0);
      expect(result.w).toBeCloseTo(q1.w, 5);
    }));
    slerpResults.push(runTest('returns end at t=1', () => {
      const q1 = normalize(createQuaternion(1, 0, 0, 0));
      const q2 = normalize(createQuaternion(0, 1, 0, 0));
      const result = slerp(q1, q2, 1);
      expect(result.x).toBeCloseTo(q2.x, 5);
    }));
    slerpResults.push(runTest('normalized at midpoint', () => {
      const q1 = normalize(createQuaternion(1, 0, 0, 0));
      const q2 = normalize(createQuaternion(0, 1, 0, 0));
      const result = slerp(q1, q2, 0.5);
      expect(magnitude(result)).toBeCloseTo(1, 10);
    }));
    allSuites.push({ name: 'SLERP Interpolation', results: slerpResults });
    setProgress(45);
    await new Promise(r => setTimeout(r, 0));

    // Text Encoding
    const encodeResults: TestResult[] = [];
    encodeResults.push(runTest('encodes text to quaternion', () => {
      const result = encodeText('hello');
      expect(result.quaternion).toBeDefined();
      expect(result.primeSignature.length).toBeGreaterThan(0);
    }));
    encodeResults.push(runTest('consistent encoding', () => {
      const r1 = encodeText('test');
      const r2 = encodeText('test');
      expect(r1.quaternion.w).toBe(r2.quaternion.w);
    }));
    encodeResults.push(runTest('different texts differ', () => {
      const r1 = encodeText('alpha');
      const r2 = encodeText('beta');
      const d = Math.abs(dot(r1.quaternion, r2.quaternion));
      expect(d).toBeLessThan(1);
    }));
    encodeResults.push(runTest('case insensitive', () => {
      const lower = encodeText('hello');
      const upper = encodeText('HELLO');
      expect(lower.quaternion.w).toBe(upper.quaternion.w);
    }));
    allSuites.push({ name: 'Text Encoding', results: encodeResults });
    setProgress(60);
    await new Promise(r => setTimeout(r, 0));

    // Similarity Functions
    const simResults: TestResult[] = [];
    simResults.push(runTest('jaccard identical = 1', () => {
      const sig = [2, 3, 5, 7];
      expect(jaccardSimilarity(sig, sig)).toBe(1);
    }));
    simResults.push(runTest('jaccard disjoint = 0', () => {
      expect(jaccardSimilarity([2, 3], [7, 11])).toBe(0);
    }));
    simResults.push(runTest('resonance identical = 1', () => {
      const enc = encodeText('hello world');
      const score = resonanceScore(enc, enc);
      expect(score).toBeCloseTo(1, 10);
    }));
    simResults.push(runTest('resonance in [0,1]', () => {
      const m1 = encodeText('alpha');
      const m2 = encodeText('omega');
      const score = resonanceScore(m1, m2);
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(1);
    }));
    allSuites.push({ name: 'Similarity Functions', results: simResults });
    setProgress(75);
    await new Promise(r => setTimeout(r, 0));

    // Entanglement
    const entResults: TestResult[] = [];
    entResults.push(runTest('identical = 1', () => {
      const mem = encodeText('quantum');
      expect(entanglementStrength(mem, mem)).toBeCloseTo(1, 10);
    }));
    entResults.push(runTest('is symmetric', () => {
      const m1 = encodeText('first');
      const m2 = encodeText('second');
      const s1 = entanglementStrength(m1, m2);
      const s2 = entanglementStrength(m2, m1);
      expect(s1).toBeCloseTo(s2, 10);
    }));
    entResults.push(runTest('similar > different', () => {
      const base = encodeText('neural network');
      const similar = encodeText('neural networks');
      const different = encodeText('banana');
      expect(entanglementStrength(base, similar)).toBeGreaterThan(entanglementStrength(base, different));
    }));
    allSuites.push({ name: 'Entanglement', results: entResults });
    setProgress(90);
    await new Promise(r => setTimeout(r, 0));

    // Integration
    const intResults: TestResult[] = [];
    intResults.push(runTest('search ranks by resonance', () => {
      const memories: Memory[] = [
        { ...encodeText('quantum physics'), id: '1', content: 'quantum physics', timestamp: Date.now() },
        { ...encodeText('cooking'), id: '2', content: 'cooking', timestamp: Date.now() },
        { ...encodeText('quantum computing'), id: '3', content: 'quantum computing', timestamp: Date.now() },
      ];
      const query = encodeText('quantum');
      const ranked = memories
        .map(m => ({ m, score: resonanceScore(query, m) }))
        .sort((a, b) => b.score - a.score);
      expect(ranked[0].m.content).toMatch(/quantum/);
    }));
    intResults.push(runTest('random memory valid', () => {
      const mem = generateRandomMemory();
      expect(mem.id).toBeDefined();
      expect(magnitude(mem.quaternion)).toBeCloseTo(1, 10);
    }));
    intResults.push(runTest('large field performance', () => {
      const memories = Array.from({ length: 100 }, () => generateRandomMemory());
      const query = encodeText('alpha beta');
      const start = performance.now();
      memories.map(m => resonanceScore(query, m)).sort((a, b) => b - a).slice(0, 10);
      expect(performance.now() - start).toBeLessThan(100);
    }));
    allSuites.push({ name: 'Integration', results: intResults });
    setProgress(100);

    setTotalTime(performance.now() - overallStart);
    setSuites(allSuites);
    setIsRunning(false);
  }, []);

  const totalTests = suites.reduce((sum, s) => sum + s.results.length, 0);
  const passedTests = suites.reduce((sum, s) => sum + s.results.filter(r => r.passed).length, 0);
  const failedTests = totalTests - passedTests;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <TestTube className="w-5 h-5 text-primary" />
        <h3 className="font-semibold text-foreground">QMF Test Suite</h3>
      </div>

      <Button onClick={runAllTests} disabled={isRunning} className="w-full">
        <Play className="w-4 h-4 mr-2" />
        {isRunning ? 'Running Tests...' : 'Run All Tests'}
      </Button>

      {(isRunning || progress > 0) && (
        <div className="space-y-1">
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{isRunning ? 'Running...' : 'Complete'}</span>
            <span>{progress.toFixed(0)}%</span>
          </div>
        </div>
      )}

      {suites.length > 0 && (
        <>
          <div className="flex items-center gap-4 p-3 bg-secondary/30 rounded-lg border border-border">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-success" />
              <span className="text-sm font-medium text-success">{passedTests} passed</span>
            </div>
            {failedTests > 0 && (
              <div className="flex items-center gap-2">
                <XCircle className="w-4 h-4 text-destructive" />
                <span className="text-sm font-medium text-destructive">{failedTests} failed</span>
              </div>
            )}
            {totalTime !== null && (
              <div className="flex items-center gap-1 ml-auto text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                {totalTime.toFixed(2)}ms
              </div>
            )}
          </div>

          <ScrollArea className="h-[350px]">
            <div className="space-y-3 pr-4">
              {suites.map((suite, si) => (
                <div key={si} className="space-y-1">
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {suite.name}
                  </div>
                  {suite.results.map((result, ri) => (
                    <div
                      key={ri}
                      className={`p-2 rounded-lg border text-sm flex items-start gap-2 ${
                        result.passed
                          ? 'bg-success/10 border-success/30'
                          : 'bg-destructive/10 border-destructive/30'
                      }`}
                    >
                      {result.passed ? (
                        <CheckCircle className="w-4 h-4 text-success shrink-0 mt-0.5" />
                      ) : (
                        <XCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className={result.passed ? 'text-success' : 'text-destructive'}>
                          {result.name}
                        </div>
                        {result.error && (
                          <div className="text-xs text-destructive/80 mt-1 font-mono truncate">
                            {result.error}
                          </div>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground font-mono shrink-0">
                        {result.duration.toFixed(2)}ms
                      </span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </ScrollArea>
        </>
      )}

      {suites.length === 0 && !isRunning && (
        <div className="text-center py-8 text-muted-foreground text-sm">
          Click "Run All Tests" to execute the QMF test suite
        </div>
      )}
    </div>
  );
};

export default TestRunner;
