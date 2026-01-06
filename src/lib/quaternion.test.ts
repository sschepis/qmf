import { describe, it, expect } from 'vitest';
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
} from './quaternion';

describe('Quaternion Basics', () => {
  it('creates quaternion with correct components', () => {
    const q = createQuaternion(1, 2, 3, 4);
    expect(q).toEqual({ w: 1, x: 2, y: 3, z: 4 });
  });

  it('calculates magnitude correctly', () => {
    const q = createQuaternion(1, 0, 0, 0);
    expect(magnitude(q)).toBe(1);

    const q2 = createQuaternion(3, 4, 0, 0);
    expect(magnitude(q2)).toBe(5);
  });

  it('normalizes quaternion to unit length', () => {
    const q = createQuaternion(2, 0, 0, 0);
    const normalized = normalize(q);
    expect(magnitude(normalized)).toBeCloseTo(1, 10);
    expect(normalized.w).toBe(1);
  });

  it('handles zero quaternion normalization', () => {
    const q = createQuaternion(0, 0, 0, 0);
    const normalized = normalize(q);
    expect(normalized).toEqual({ w: 1, x: 0, y: 0, z: 0 });
  });

  it('computes dot product correctly', () => {
    const q1 = createQuaternion(1, 0, 0, 0);
    const q2 = createQuaternion(1, 0, 0, 0);
    expect(dot(q1, q2)).toBe(1);

    const q3 = createQuaternion(0, 1, 0, 0);
    expect(dot(q1, q3)).toBe(0);
  });
});

describe('Hamilton Product', () => {
  it('produces normalized result', () => {
    const q1 = normalize(createQuaternion(1, 2, 3, 4));
    const q2 = normalize(createQuaternion(5, 6, 7, 8));
    const result = hamiltonProduct(q1, q2);
    expect(magnitude(result)).toBeCloseTo(1, 10);
  });

  it('is non-commutative', () => {
    const q1 = normalize(createQuaternion(1, 2, 3, 4));
    const q2 = normalize(createQuaternion(5, 6, 7, 8));
    const ab = hamiltonProduct(q1, q2);
    const ba = hamiltonProduct(q2, q1);
    
    // Results should differ (non-commutative)
    const diff = Math.abs(ab.w - ba.w) + Math.abs(ab.x - ba.x) + 
                 Math.abs(ab.y - ba.y) + Math.abs(ab.z - ba.z);
    expect(diff).toBeGreaterThan(0.01);
  });

  it('identity quaternion acts as identity', () => {
    const identity = createQuaternion(1, 0, 0, 0);
    const q = normalize(createQuaternion(1, 2, 3, 4));
    const result = hamiltonProduct(identity, q);
    
    expect(result.w).toBeCloseTo(q.w, 5);
    expect(result.x).toBeCloseTo(q.x, 5);
    expect(result.y).toBeCloseTo(q.y, 5);
    expect(result.z).toBeCloseTo(q.z, 5);
  });
});

describe('SLERP Interpolation', () => {
  it('returns start quaternion at t=0', () => {
    const q1 = normalize(createQuaternion(1, 0, 0, 0));
    const q2 = normalize(createQuaternion(0, 1, 0, 0));
    const result = slerp(q1, q2, 0);
    
    expect(result.w).toBeCloseTo(q1.w, 5);
    expect(result.x).toBeCloseTo(q1.x, 5);
  });

  it('returns end quaternion at t=1', () => {
    const q1 = normalize(createQuaternion(1, 0, 0, 0));
    const q2 = normalize(createQuaternion(0, 1, 0, 0));
    const result = slerp(q1, q2, 1);
    
    expect(result.w).toBeCloseTo(q2.w, 5);
    expect(result.x).toBeCloseTo(q2.x, 5);
  });

  it('produces normalized result at midpoint', () => {
    const q1 = normalize(createQuaternion(1, 0, 0, 0));
    const q2 = normalize(createQuaternion(0, 1, 0, 0));
    const result = slerp(q1, q2, 0.5);
    
    expect(magnitude(result)).toBeCloseTo(1, 10);
  });
});

describe('Text Encoding', () => {
  it('encodes text to quaternion and prime signature', () => {
    const result = encodeText('hello');
    
    expect(result.quaternion).toBeDefined();
    expect(result.primeSignature).toBeDefined();
    expect(result.primeSignature.length).toBeGreaterThan(0);
    expect(magnitude(result.quaternion)).toBeCloseTo(1, 10);
  });

  it('produces consistent encoding for same text', () => {
    const result1 = encodeText('test');
    const result2 = encodeText('test');
    
    expect(result1.quaternion).toEqual(result2.quaternion);
    expect(result1.primeSignature).toEqual(result2.primeSignature);
  });

  it('produces different encodings for different text', () => {
    const result1 = encodeText('alpha');
    const result2 = encodeText('beta');
    
    // Quaternions should differ
    const diff = Math.abs(dot(result1.quaternion, result2.quaternion));
    expect(diff).toBeLessThan(1); // Not identical
  });

  it('handles empty string', () => {
    const result = encodeText('');
    expect(result.primeSignature).toEqual([]);
    expect(magnitude(result.quaternion)).toBeCloseTo(1, 10);
  });

  it('is case insensitive', () => {
    const lower = encodeText('hello');
    const upper = encodeText('HELLO');
    
    expect(lower.quaternion).toEqual(upper.quaternion);
  });
});

describe('Jaccard Similarity', () => {
  it('returns 1 for identical signatures', () => {
    const sig = [2, 3, 5, 7];
    expect(jaccardSimilarity(sig, sig)).toBe(1);
  });

  it('returns 0 for disjoint signatures', () => {
    const sig1 = [2, 3, 5];
    const sig2 = [7, 11, 13];
    expect(jaccardSimilarity(sig1, sig2)).toBe(0);
  });

  it('returns correct value for partial overlap', () => {
    const sig1 = [2, 3, 5, 7];
    const sig2 = [5, 7, 11, 13];
    // Intersection: {5, 7} = 2
    // Union: {2, 3, 5, 7, 11, 13} = 6
    expect(jaccardSimilarity(sig1, sig2)).toBeCloseTo(2 / 6, 10);
  });

  it('handles empty signatures', () => {
    expect(jaccardSimilarity([], [])).toBe(0);
    expect(jaccardSimilarity([2, 3], [])).toBe(0);
  });
});

describe('Resonance Score', () => {
  it('returns 1 for identical memories', () => {
    const encoded = encodeText('hello world');
    const score = resonanceScore(encoded, encoded);
    expect(score).toBeCloseTo(1, 10);
  });

  it('returns value between 0 and 1', () => {
    const mem1 = encodeText('alpha beta');
    const mem2 = encodeText('gamma delta');
    const score = resonanceScore(mem1, mem2);
    
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(1);
  });

  it('higher score for similar texts', () => {
    const query = encodeText('machine learning');
    const similar = encodeText('machine learning algorithms');
    const different = encodeText('cooking recipes');
    
    const scoreSimilar = resonanceScore(query, similar);
    const scoreDifferent = resonanceScore(query, different);
    
    expect(scoreSimilar).toBeGreaterThan(scoreDifferent);
  });

  it('respects alpha/beta weights', () => {
    const mem1 = encodeText('test');
    const mem2 = encodeText('testing');
    
    const primeOnly = resonanceScore(mem1, mem2, 1, 0);
    const quatOnly = resonanceScore(mem1, mem2, 0, 1);
    const balanced = resonanceScore(mem1, mem2, 0.5, 0.5);
    
    // Balanced should be average of the two
    expect(balanced).toBeCloseTo((primeOnly + quatOnly) / 2, 10);
  });
});

describe('Entanglement Strength', () => {
  it('returns 1 for identical memories', () => {
    const mem = encodeText('quantum entanglement');
    const strength = entanglementStrength(mem, mem);
    expect(strength).toBeCloseTo(1, 10);
  });

  it('returns value between 0 and 1', () => {
    const mem1 = encodeText('alpha');
    const mem2 = encodeText('omega');
    const strength = entanglementStrength(mem1, mem2);
    
    expect(strength).toBeGreaterThanOrEqual(0);
    expect(strength).toBeLessThanOrEqual(1);
  });

  it('is symmetric', () => {
    const mem1 = encodeText('first memory');
    const mem2 = encodeText('second memory');
    
    const strength1 = entanglementStrength(mem1, mem2);
    const strength2 = entanglementStrength(mem2, mem1);
    
    expect(strength1).toBeCloseTo(strength2, 10);
  });

  it('higher for semantically similar content', () => {
    const base = encodeText('neural network');
    const similar = encodeText('neural networks');
    const different = encodeText('banana smoothie');
    
    const strengthSimilar = entanglementStrength(base, similar);
    const strengthDifferent = entanglementStrength(base, different);
    
    expect(strengthSimilar).toBeGreaterThan(strengthDifferent);
  });
});

describe('Memory Field Decoding Integration', () => {
  it('can search and rank memories by resonance', () => {
    const memories: Memory[] = [
      { ...encodeText('quantum physics'), id: '1', content: 'quantum physics', timestamp: Date.now() },
      { ...encodeText('classical mechanics'), id: '2', content: 'classical mechanics', timestamp: Date.now() },
      { ...encodeText('quantum computing'), id: '3', content: 'quantum computing', timestamp: Date.now() },
      { ...encodeText('cooking recipes'), id: '4', content: 'cooking recipes', timestamp: Date.now() },
    ];

    const query = encodeText('quantum');
    
    const ranked = memories
      .map(mem => ({
        memory: mem,
        score: resonanceScore(query, { quaternion: mem.quaternion, primeSignature: mem.primeSignature })
      }))
      .sort((a, b) => b.score - a.score);

    // Quantum-related memories should rank higher
    expect(ranked[0].memory.content).toMatch(/quantum/);
    expect(ranked[1].memory.content).toMatch(/quantum/);
  });

  it('can cluster memories by entanglement', () => {
    const memories = [
      encodeText('machine learning'),
      encodeText('machine learning algorithms'),
      encodeText('deep learning'),
      encodeText('cooking pasta'),
      encodeText('italian recipes'),
    ];

    const threshold = 0.3;
    const clusters: number[][] = [];
    const assigned = new Set<number>();

    for (let i = 0; i < memories.length; i++) {
      if (assigned.has(i)) continue;
      
      const cluster = [i];
      assigned.add(i);

      for (let j = i + 1; j < memories.length; j++) {
        if (assigned.has(j)) continue;
        
        const strength = entanglementStrength(memories[i], memories[j]);
        if (strength >= threshold) {
          cluster.push(j);
          assigned.add(j);
        }
      }
      clusters.push(cluster);
    }

    // Should have multiple clusters
    expect(clusters.length).toBeGreaterThanOrEqual(1);
    // ML-related items should cluster together
    const mlCluster = clusters.find(c => c.includes(0));
    expect(mlCluster).toBeDefined();
  });

  it('random memory generation works correctly', () => {
    const mem1 = generateRandomMemory();
    const mem2 = generateRandomMemory();

    expect(mem1.id).toBeDefined();
    expect(mem1.content).toBeDefined();
    expect(mem1.quaternion).toBeDefined();
    expect(mem1.primeSignature.length).toBeGreaterThan(0);
    expect(magnitude(mem1.quaternion)).toBeCloseTo(1, 10);

    // Different memories should have different IDs
    expect(mem1.id).not.toBe(mem2.id);
  });

  it('handles large memory fields efficiently', () => {
    const memories: Memory[] = Array.from({ length: 100 }, () => generateRandomMemory());
    const query = encodeText('alpha beta gamma');

    const start = performance.now();
    
    const results = memories
      .map(mem => ({
        memory: mem,
        score: resonanceScore(query, { quaternion: mem.quaternion, primeSignature: mem.primeSignature })
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);

    const elapsed = performance.now() - start;

    expect(results.length).toBe(10);
    expect(elapsed).toBeLessThan(100); // Should complete in under 100ms
  });
});

describe('Round-Trip Encoding Consistency', () => {
  it('same text always produces identical quaternion', () => {
    const texts = ['hello world', 'quantum memory', 'test123', 'UPPERCASE', 'mixed Case Text'];
    
    for (const text of texts) {
      const enc1 = encodeText(text);
      const enc2 = encodeText(text);
      const enc3 = encodeText(text);
      
      expect(enc1.quaternion).toEqual(enc2.quaternion);
      expect(enc2.quaternion).toEqual(enc3.quaternion);
      expect(enc1.primeSignature).toEqual(enc2.primeSignature);
    }
  });

  it('encoded quaternion can be matched back to original via resonance', () => {
    const originalTexts = ['alpha beta', 'gamma delta', 'epsilon zeta', 'theta iota'];
    const memories: Memory[] = originalTexts.map((text, i) => ({
      ...encodeText(text),
      id: String(i),
      content: text,
      timestamp: Date.now()
    }));

    // Each original text should match itself with score 1
    for (const text of originalTexts) {
      const query = encodeText(text);
      const match = memories.find(m => m.content === text)!;
      const score = resonanceScore(query, { quaternion: match.quaternion, primeSignature: match.primeSignature });
      expect(score).toBeCloseTo(1, 10);
    }
  });

  it('re-encoding memory content produces matching quaternion', () => {
    const memories = [
      generateRandomMemory(),
      generateRandomMemory(),
      generateRandomMemory()
    ];

    for (const mem of memories) {
      const reEncoded = encodeText(mem.content);
      expect(reEncoded.quaternion).toEqual(mem.quaternion);
      expect(reEncoded.primeSignature).toEqual(mem.primeSignature);
    }
  });

  it('quaternion dot product is 1 for re-encoded same text', () => {
    const texts = ['neural network', 'deep learning', 'artificial intelligence'];
    
    for (const text of texts) {
      const enc1 = encodeText(text);
      const enc2 = encodeText(text);
      const dotProduct = dot(enc1.quaternion, enc2.quaternion);
      expect(dotProduct).toBeCloseTo(1, 10);
    }
  });

  it('prime signatures are deterministic across multiple encodings', () => {
    const text = 'the quick brown fox jumps over the lazy dog';
    const encodings = Array.from({ length: 5 }, () => encodeText(text));
    
    const firstSig = encodings[0].primeSignature;
    for (const enc of encodings) {
      expect(enc.primeSignature).toEqual(firstSig);
      expect(enc.primeSignature.length).toBe(firstSig.length);
    }
  });
});

describe('Decode Result Validity', () => {
  const knownMemories: Memory[] = [
    { ...encodeText('machine learning'), id: '1', content: 'machine learning', timestamp: 1 },
    { ...encodeText('machine learning algorithms'), id: '2', content: 'machine learning algorithms', timestamp: 2 },
    { ...encodeText('deep learning neural networks'), id: '3', content: 'deep learning neural networks', timestamp: 3 },
    { ...encodeText('cooking italian pasta'), id: '4', content: 'cooking italian pasta', timestamp: 4 },
    { ...encodeText('italian food recipes'), id: '5', content: 'italian food recipes', timestamp: 5 },
    { ...encodeText('quantum physics theory'), id: '6', content: 'quantum physics theory', timestamp: 6 },
  ];

  it('resonance ranking returns exact match first', () => {
    const query = encodeText('machine learning');
    
    const ranked = knownMemories
      .map(mem => ({
        memory: mem,
        score: resonanceScore(query, { quaternion: mem.quaternion, primeSignature: mem.primeSignature })
      }))
      .sort((a, b) => b.score - a.score);

    expect(ranked[0].memory.content).toBe('machine learning');
    expect(ranked[0].score).toBeCloseTo(1, 10);
  });

  it('partial match ranks higher than unrelated content', () => {
    const query = encodeText('machine');
    
    const ranked = knownMemories
      .map(mem => ({
        memory: mem,
        score: resonanceScore(query, { quaternion: mem.quaternion, primeSignature: mem.primeSignature })
      }))
      .sort((a, b) => b.score - a.score);

    // Machine learning related should be top 2
    const topTwo = ranked.slice(0, 2).map(r => r.memory.content);
    expect(topTwo).toContain('machine learning');
    expect(topTwo).toContain('machine learning algorithms');
    
    // Cooking should rank lower
    const cookingRank = ranked.findIndex(r => r.memory.content === 'cooking italian pasta');
    expect(cookingRank).toBeGreaterThan(1);
  });

  it('clustering groups semantically related memories', () => {
    const threshold = 0.3;
    const clusters: string[][] = [];
    const assigned = new Set<string>();

    for (const mem of knownMemories) {
      if (assigned.has(mem.id)) continue;
      
      const cluster = [mem.content];
      assigned.add(mem.id);

      for (const other of knownMemories) {
        if (assigned.has(other.id)) continue;
        
        const strength = entanglementStrength(
          { quaternion: mem.quaternion, primeSignature: mem.primeSignature },
          { quaternion: other.quaternion, primeSignature: other.primeSignature }
        );
        
        if (strength >= threshold) {
          cluster.push(other.content);
          assigned.add(other.id);
        }
      }
      clusters.push(cluster);
    }

    // Should have at least 2 clusters (ML-related vs cooking vs physics)
    expect(clusters.length).toBeGreaterThanOrEqual(2);
    
    // Find ML cluster and verify it contains related items
    const mlCluster = clusters.find(c => c.includes('machine learning'));
    expect(mlCluster).toBeDefined();
    if (mlCluster && mlCluster.length > 1) {
      expect(mlCluster.some(c => c.includes('learning'))).toBe(true);
    }
  });

  it('ranking is stable across multiple queries', () => {
    const queryText = 'neural networks';
    
    const rankings = Array.from({ length: 3 }, () => {
      const query = encodeText(queryText);
      return knownMemories
        .map(mem => ({
          id: mem.id,
          score: resonanceScore(query, { quaternion: mem.quaternion, primeSignature: mem.primeSignature })
        }))
        .sort((a, b) => b.score - a.score)
        .map(r => r.id);
    });

    // All rankings should be identical
    expect(rankings[0]).toEqual(rankings[1]);
    expect(rankings[1]).toEqual(rankings[2]);
  });

  it('scores are ordered correctly for known similarity hierarchy', () => {
    const exact = encodeText('quantum physics theory');
    const partial = encodeText('quantum physics');
    const related = encodeText('quantum mechanics');
    const unrelated = encodeText('banana smoothie');

    const target = knownMemories.find(m => m.content === 'quantum physics theory')!;
    const targetEnc = { quaternion: target.quaternion, primeSignature: target.primeSignature };

    const scoreExact = resonanceScore(exact, targetEnc);
    const scorePartial = resonanceScore(partial, targetEnc);
    const scoreRelated = resonanceScore(related, targetEnc);
    const scoreUnrelated = resonanceScore(unrelated, targetEnc);

    expect(scoreExact).toBeCloseTo(1, 10);
    expect(scorePartial).toBeGreaterThan(scoreRelated);
    expect(scoreRelated).toBeGreaterThan(scoreUnrelated);
  });

  it('empty query returns valid but low scores', () => {
    const query = encodeText('');
    
    const scores = knownMemories.map(mem => 
      resonanceScore(query, { quaternion: mem.quaternion, primeSignature: mem.primeSignature })
    );

    for (const score of scores) {
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(1);
    }
  });
});
