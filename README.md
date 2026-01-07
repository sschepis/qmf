# Quaternionic Memory Field (QMF)

A visualization and demonstration lab for quaternion-based memory encoding, exploring 4D mathematical representations for semantic memory storage and retrieval.

![QMF Lab](https://img.shields.io/badge/QMF-Lab-8B5CF6?style=for-the-badge)
![React](https://img.shields.io/badge/React-18.3-61DAFB?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=flat-square&logo=typescript)
![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?style=flat-square&logo=vite)
![Vitest](https://img.shields.io/badge/Vitest-4.0-6E9F18?style=flat-square&logo=vitest)

## Overview

QMF explores the use of **quaternion mathematics** for encoding and manipulating semantic memory. Quaternions (4-dimensional hypercomplex numbers) provide a rich mathematical structure for representing multi-dimensional concepts in a continuous, interpolatable space.

### Quaternion Representation

Each memory is encoded as a unit quaternion:

```
q = w + xi + yj + zk
```

Where the components map to semantic dimensions:
- **w (Coherence)**: Overall semantic coherence
- **x (Security)**: Information integrity
- **y (Performance)**: Retrieval efficiency
- **z (Usability)**: Accessibility score

### Hamilton Relations

The imaginary units follow Hamilton's relations:
```
i² = j² = k² = ijk = −1
```

This gives quaternions their unique **non-commutative** multiplication property:
```
q₁ × q₂ ≠ q₂ × q₁
```

## Features

### 🔮 Memory Encoder
Encode text into quaternion space using prime harmonic encoding:
- Text → Prime signature (using first 100 primes)
- Prime harmonics → Quaternion components
- Automatic normalization to unit sphere

### 🔍 Memory Decoder
Search and retrieve memories using resonance-based ranking:
- **Resonance Score**: `R = α·Jaccard + β·|q₁·q₂|`
- Configurable weights for prime similarity vs quaternion alignment
- Automatic clustering based on entanglement strength
- Sub-millisecond query performance

### 🧮 Hamilton Calculator
Interactive demonstration of quaternion multiplication:
- Non-commutative product visualization
- Commutator calculation: `[q₁, q₂] = q₁q₂ - q₂q₁`
- Real-time component breakdown

### 🌀 SLERP Visualizer
Spherical Linear Interpolation between quaternions:
- Smooth rotation paths on the 4D hypersphere
- Interactive parameter control
- Animation support

### 📊 3D Quaternion Visualizer
Stereographic projection from 4D to 3D space:
- WebGL rendering via Three.js
- Interactive rotation and zoom
- Color-coded component display

### 📈 Metrics Panel
Real-time field stability metrics:

| Metric | Description | Interpretation |
|--------|-------------|----------------|
| **Entropy (S)** | Prime frequency distribution | Low = sharp memory, High = noise |
| **Coherence (C)** | Phase alignment across memories | High = phase-locked, Low = confusion |
| **Lyapunov (λ)** | Trajectory divergence rate | Negative = stable, Positive = hallucination risk |

### 🧪 Stress Testing
Performance benchmarking with configurable load:
- Batch memory generation (100-10,000 memories)
- Encoding/decoding throughput measurement
- Memory field statistics

### ✅ Test Runner
Integrated Vitest test suite with 50+ unit tests covering:
- Quaternion basics (creation, magnitude, normalization)
- Hamilton product properties
- SLERP interpolation
- Text encoding consistency
- Resonance and entanglement calculations
- Round-trip encoding verification

## Getting Started

### Prerequisites

- Node.js 18+ (recommended: use [nvm](https://github.com/nvm-sh/nvm))
- npm or bun

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd qmf

# Install dependencies
npm install
# or
bun install
```

### Development

```bash
# Start development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Testing

```bash
# Run tests in watch mode
npx vitest

# Run tests with UI
npx vitest --ui

# Single test run
npx vitest run
```

### Building

```bash
# Production build
npm run build

# Development build (with source maps)
npm run build:dev

# Preview production build
npm run preview
```

### Linting

```bash
npm run lint
```

## Project Structure

```
qmf/
├── src/
│   ├── lib/
│   │   ├── quaternion.ts      # Core quaternion mathematics
│   │   ├── quaternion.test.ts # Comprehensive test suite
│   │   └── utils.ts           # Utility functions
│   ├── components/
│   │   ├── MemoryEncoder.tsx      # Text → Quaternion encoding UI
│   │   ├── MemoryDecoder.tsx      # Search & retrieval interface
│   │   ├── QuaternionVisualizer.tsx # 3D visualization
│   │   ├── HamiltonCalculator.tsx # Quaternion multiplication demo
│   │   ├── SlerpVisualizer.tsx    # SLERP animation
│   │   ├── MetricsPanel.tsx       # Field stability metrics
│   │   ├── StressTest.tsx         # Performance benchmarks
│   │   ├── TestRunner.tsx         # Integrated test runner
│   │   └── ui/                    # shadcn/ui components
│   ├── pages/
│   │   └── Index.tsx          # Main application page
│   ├── App.tsx                # Root component
│   └── main.tsx               # Entry point
├── public/
├── package.json
└── vite.config.ts
```

## Core API

### Quaternion Operations

```typescript
import {
  createQuaternion,
  normalize,
  magnitude,
  hamiltonProduct,
  dot,
  slerp,
  commutator
} from '@/lib/quaternion';

// Create and normalize
const q = normalize(createQuaternion(1, 2, 3, 4));

// Hamilton product (non-commutative)
const product = hamiltonProduct(q1, q2);

// Spherical interpolation
const interpolated = slerp(q1, q2, 0.5);
```

### Memory Encoding

```typescript
import { encodeText, Memory } from '@/lib/quaternion';

// Encode text to quaternion
const { quaternion, primeSignature } = encodeText("hello world");

// Create memory object
const memory: Memory = {
  id: crypto.randomUUID(),
  content: "hello world",
  quaternion,
  primeSignature,
  timestamp: Date.now()
};
```

### Search & Retrieval

```typescript
import { resonanceScore, entanglementStrength } from '@/lib/quaternion';

// Search by resonance
const query = encodeText("search term");
const results = memories
  .map(mem => ({
    memory: mem,
    score: resonanceScore(query, mem)
  }))
  .sort((a, b) => b.score - a.score);

// Cluster by entanglement
const strength = entanglementStrength(mem1, mem2);
if (strength >= 0.3) {
  // Memories are entangled
}
```

### Field Metrics

```typescript
import {
  calculateEntropy,
  calculateCoherence,
  calculateLyapunov
} from '@/lib/quaternion';

const entropy = calculateEntropy(memories);     // 0 to 1
const coherence = calculateCoherence(memories); // 0 to 1
const lyapunov = calculateLyapunov(memories);   // Negative = stable
```

## Tech Stack

| Technology | Purpose |
|------------|---------|
| [React 18](https://react.dev) | UI framework |
| [TypeScript](https://www.typescriptlang.org) | Type safety |
| [Vite](https://vitejs.dev) | Build tool & dev server |
| [Three.js](https://threejs.org) | 3D rendering |
| [@react-three/fiber](https://docs.pmnd.rs/react-three-fiber) | React Three.js bindings |
| [@react-three/drei](https://github.com/pmndrs/drei) | Three.js helpers |
| [shadcn/ui](https://ui.shadcn.com) | UI components |
| [Tailwind CSS](https://tailwindcss.com) | Styling |
| [Vitest](https://vitest.dev) | Testing framework |
| [TanStack Query](https://tanstack.com/query) | Server state management |
| [React Router](https://reactrouter.com) | Routing |
| [Recharts](https://recharts.org) | Charts & graphs |

## Mathematical Background

### Prime Signature Encoding

Text is encoded using the first 100 prime numbers:
```typescript
const primes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, ...]
```

Each character maps to a prime index based on:
```
primeIndex = (charCode + position) % 100
```

### Quaternion Generation

The quaternion components are derived from prime harmonics:
```typescript
w += cos(phase)
x += sin(phase) * cos(phase * 2)
y += sin(phase * 2) * cos(phase)
z += sin(phase) * sin(phase * 2)
```

Where `phase = (prime × position) / 1000`

### Resonance Score

The resonance score combines:
1. **Jaccard Similarity** of prime signatures
2. **Quaternion Dot Product** for semantic alignment

```
R(q, p) = α · J(σ_q, σ_p) + β · |q · p|
```

Default weights: α = 0.5, β = 0.5

### Entanglement Strength

Measures non-local association between memories:
```
E(A, B) = 0.5 × (primeOverlap + |q_A · q_B|)
```

Threshold: E ≥ 0.3 indicates linked memories

## License

This project is for educational and research purposes.

## Acknowledgments

- William Rowan Hamilton for quaternion algebra (1843)
- The React and Three.js communities
- shadcn for the excellent UI components
