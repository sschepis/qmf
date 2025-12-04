// Quaternion Mathematics Library for QMF

export interface Quaternion {
  w: number; // Coherence
  x: number; // Security
  y: number; // Performance
  z: number; // Usability
}

export interface Memory {
  id: string;
  primeSignature: number[];
  quaternion: Quaternion;
  content: string;
  timestamp: number;
}

// First 100 primes for encoding
const PRIMES = [
  2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71,
  73, 79, 83, 89, 97, 101, 103, 107, 109, 113, 127, 131, 137, 139, 149, 151,
  157, 163, 167, 173, 179, 181, 191, 193, 197, 199, 211, 223, 227, 229, 233,
  239, 241, 251, 257, 263, 269, 271, 277, 281, 283, 293, 307, 311, 313, 317,
  331, 337, 347, 349, 353, 359, 367, 373, 379, 383, 389, 397, 401, 409, 419,
  421, 431, 433, 439, 443, 449, 457, 461, 463, 467, 479, 487, 491, 499, 503,
  509, 521, 523, 541
];

// Create a quaternion from components
export function createQuaternion(w: number, x: number, y: number, z: number): Quaternion {
  return { w, x, y, z };
}

// Get magnitude of quaternion
export function magnitude(q: Quaternion): number {
  return Math.sqrt(q.w * q.w + q.x * q.x + q.y * q.y + q.z * q.z);
}

// Normalize quaternion to unit length
export function normalize(q: Quaternion): Quaternion {
  const mag = magnitude(q);
  if (mag === 0) return { w: 1, x: 0, y: 0, z: 0 };
  return {
    w: q.w / mag,
    x: q.x / mag,
    y: q.y / mag,
    z: q.z / mag
  };
}

// Hamilton Product (non-commutative multiplication)
export function hamiltonProduct(q1: Quaternion, q2: Quaternion): Quaternion {
  return normalize({
    w: q1.w * q2.w - q1.x * q2.x - q1.y * q2.y - q1.z * q2.z,
    x: q1.w * q2.x + q1.x * q2.w + q1.y * q2.z - q1.z * q2.y,
    y: q1.w * q2.y - q1.x * q2.z + q1.y * q2.w + q1.z * q2.x,
    z: q1.w * q2.z + q1.x * q2.y - q1.y * q2.x + q1.z * q2.w
  });
}

// Commutator [q1, q2] = q1*q2 - q2*q1
export function commutator(q1: Quaternion, q2: Quaternion): Quaternion {
  const q1q2 = hamiltonProduct(q1, q2);
  const q2q1 = hamiltonProduct(q2, q1);
  return {
    w: q1q2.w - q2q1.w,
    x: q1q2.x - q2q1.x,
    y: q1q2.y - q2q1.y,
    z: q1q2.z - q2q1.z
  };
}

// Dot product of two quaternions
export function dot(q1: Quaternion, q2: Quaternion): number {
  return q1.w * q2.w + q1.x * q2.x + q1.y * q2.y + q1.z * q2.z;
}

// SLERP - Spherical Linear Interpolation
export function slerp(q1: Quaternion, q2: Quaternion, t: number): Quaternion {
  let d = dot(q1, q2);
  
  // If dot is negative, negate one quaternion to take shorter path
  let q2Adj = { ...q2 };
  if (d < 0) {
    d = -d;
    q2Adj = { w: -q2.w, x: -q2.x, y: -q2.y, z: -q2.z };
  }

  // If quaternions are very close, use linear interpolation
  if (d > 0.9995) {
    return normalize({
      w: q1.w + t * (q2Adj.w - q1.w),
      x: q1.x + t * (q2Adj.x - q1.x),
      y: q1.y + t * (q2Adj.y - q1.y),
      z: q1.z + t * (q2Adj.z - q1.z)
    });
  }

  const theta0 = Math.acos(d);
  const theta = theta0 * t;
  const sinTheta = Math.sin(theta);
  const sinTheta0 = Math.sin(theta0);

  const s0 = Math.cos(theta) - d * sinTheta / sinTheta0;
  const s1 = sinTheta / sinTheta0;

  return normalize({
    w: s0 * q1.w + s1 * q2Adj.w,
    x: s0 * q1.x + s1 * q2Adj.x,
    y: s0 * q1.y + s1 * q2Adj.y,
    z: s0 * q1.z + s1 * q2Adj.z
  });
}

// Encode text into a quaternion using prime harmonics
export function encodeText(text: string): { quaternion: Quaternion; primeSignature: number[] } {
  const chars = text.toLowerCase().split('');
  const primeSignature: number[] = [];
  
  // Map characters to prime indices
  chars.forEach((char, i) => {
    const code = char.charCodeAt(0);
    const primeIndex = (code + i) % PRIMES.length;
    primeSignature.push(PRIMES[primeIndex]);
  });

  // Calculate quaternion components using harmonics
  let w = 0, x = 0, y = 0, z = 0;
  const n = primeSignature.length || 1;

  primeSignature.forEach((prime, i) => {
    const phase = (prime * (i + 1)) / 1000;
    w += Math.cos(phase);
    x += Math.sin(phase) * Math.cos(phase * 2);
    y += Math.sin(phase * 2) * Math.cos(phase);
    z += Math.sin(phase) * Math.sin(phase * 2);
  });

  const quaternion = normalize({
    w: w / n,
    x: x / n,
    y: y / n,
    z: z / n
  });

  return { quaternion, primeSignature: [...new Set(primeSignature)] };
}

// Calculate Jaccard similarity between prime signatures
export function jaccardSimilarity(sig1: number[], sig2: number[]): number {
  const set1 = new Set(sig1);
  const set2 = new Set(sig2);
  const intersection = new Set([...set1].filter(x => set2.has(x)));
  const union = new Set([...set1, ...set2]);
  return union.size === 0 ? 0 : intersection.size / union.size;
}

// Calculate resonance score between query and pattern
export function resonanceScore(
  query: { quaternion: Quaternion; primeSignature: number[] },
  pattern: { quaternion: Quaternion; primeSignature: number[] },
  alpha = 0.5,
  beta = 0.5
): number {
  const jaccard = jaccardSimilarity(query.primeSignature, pattern.primeSignature);
  const semanticAlignment = Math.abs(dot(query.quaternion, pattern.quaternion));
  return alpha * jaccard + beta * semanticAlignment;
}

// Calculate entanglement strength
export function entanglementStrength(
  memA: { quaternion: Quaternion; primeSignature: number[] },
  memB: { quaternion: Quaternion; primeSignature: number[] }
): number {
  const sigA = new Set(memA.primeSignature);
  const sigB = new Set(memB.primeSignature);
  const intersection = new Set([...sigA].filter(x => sigB.has(x)));
  const maxSize = Math.max(sigA.size, sigB.size);
  
  const primeOverlap = maxSize === 0 ? 0 : intersection.size / maxSize;
  const quatDot = Math.abs(dot(memA.quaternion, memB.quaternion));
  
  return 0.5 * (primeOverlap + quatDot);
}

// Field stability metrics
export function calculateEntropy(memories: Memory[]): number {
  if (memories.length === 0) return 0;
  
  // Count prime frequencies
  const primeFreq = new Map<number, number>();
  let total = 0;
  
  memories.forEach(mem => {
    mem.primeSignature.forEach(prime => {
      primeFreq.set(prime, (primeFreq.get(prime) || 0) + 1);
      total++;
    });
  });
  
  if (total === 0) return 0;
  
  // Calculate entropy
  let entropy = 0;
  primeFreq.forEach(count => {
    const p = count / total;
    if (p > 0) entropy -= p * Math.log2(p);
  });
  
  // Normalize by max entropy
  const maxEntropy = Math.log2(primeFreq.size || 1);
  return maxEntropy === 0 ? 0 : entropy / maxEntropy;
}

export function calculateCoherence(memories: Memory[]): number {
  if (memories.length === 0) return 1;
  
  // Calculate average quaternion alignment
  let sumCos = 0;
  let sumSin = 0;
  
  memories.forEach(mem => {
    // Use w component as phase proxy
    const phase = Math.acos(Math.max(-1, Math.min(1, mem.quaternion.w)));
    sumCos += Math.cos(phase);
    sumSin += Math.sin(phase);
  });
  
  return Math.sqrt(sumCos * sumCos + sumSin * sumSin) / memories.length;
}

export function calculateLyapunov(memories: Memory[]): number {
  if (memories.length < 2) return 0;
  
  // Calculate divergence between consecutive memories
  let divergenceSum = 0;
  
  for (let i = 1; i < memories.length; i++) {
    const d1 = magnitude({
      w: memories[i].quaternion.w - memories[i-1].quaternion.w,
      x: memories[i].quaternion.x - memories[i-1].quaternion.x,
      y: memories[i].quaternion.y - memories[i-1].quaternion.y,
      z: memories[i].quaternion.z - memories[i-1].quaternion.z
    });
    
    if (d1 > 0.001) {
      divergenceSum += Math.log(d1);
    }
  }
  
  return divergenceSum / (memories.length - 1);
}

// Stereographic projection from 4D to 3D
export function stereographicProject(q: Quaternion): { x: number; y: number; z: number } {
  const denom = 1 - q.w;
  if (Math.abs(denom) < 0.001) {
    return { x: q.x * 10, y: q.y * 10, z: q.z * 10 };
  }
  return {
    x: q.x / denom,
    y: q.y / denom,
    z: q.z / denom
  };
}

// Random unit quaternion for testing
export function randomQuaternion(): Quaternion {
  const u1 = Math.random();
  const u2 = Math.random();
  const u3 = Math.random();
  
  return normalize({
    w: Math.sqrt(1 - u1) * Math.sin(2 * Math.PI * u2),
    x: Math.sqrt(1 - u1) * Math.cos(2 * Math.PI * u2),
    y: Math.sqrt(u1) * Math.sin(2 * Math.PI * u3),
    z: Math.sqrt(u1) * Math.cos(2 * Math.PI * u3)
  });
}

// Generate random memory for stress testing
export function generateRandomMemory(): Memory {
  const words = ['alpha', 'beta', 'gamma', 'delta', 'epsilon', 'zeta', 'eta', 'theta', 'iota', 'kappa'];
  const content = Array(3 + Math.floor(Math.random() * 5))
    .fill(0)
    .map(() => words[Math.floor(Math.random() * words.length)])
    .join(' ');
  
  const { quaternion, primeSignature } = encodeText(content);
  
  return {
    id: crypto.randomUUID(),
    primeSignature,
    quaternion,
    content,
    timestamp: Date.now()
  };
}
