import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, Zap, Target, Clock } from 'lucide-react';
import { Memory, encodeText, resonanceScore, jaccardSimilarity, dot, normalize } from '@/lib/quaternion';

interface MemoryDecoderProps {
  memories: Memory[];
  onSelectMemory?: (memory: Memory) => void;
}

interface SearchResult {
  memory: Memory;
  resonance: number;
  similarity: number;
  quaternionAlignment: number;
}

const MemoryDecoder: React.FC<MemoryDecoderProps> = ({ memories, onSelectMemory }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searchTime, setSearchTime] = useState<number | null>(null);

  const handleSearch = () => {
    if (!query.trim() || memories.length === 0) return;

    const startTime = performance.now();
    
    const queryEncoded = encodeText(query);
    
    const searchResults: SearchResult[] = memories.map(memory => {
      const resonance = resonanceScore(
        queryEncoded,
        { quaternion: memory.quaternion, primeSignature: memory.primeSignature }
      );
      const similarity = jaccardSimilarity(queryEncoded.primeSignature, memory.primeSignature);
      const quaternionAlignment = Math.abs(dot(normalize(queryEncoded.quaternion), normalize(memory.quaternion)));
      
      return {
        memory,
        resonance,
        similarity,
        quaternionAlignment
      };
    });

    searchResults.sort((a, b) => b.resonance - a.resonance);
    
    const endTime = performance.now();
    setSearchTime(endTime - startTime);
    setResults(searchResults.slice(0, 20));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <Card className="bg-card/50 border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Search className="w-5 h-5 text-primary" />
          Memory Decoder
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Enter query to search memory field..."
            className="font-mono text-sm"
          />
          <Button 
            onClick={handleSearch} 
            disabled={!query.trim() || memories.length === 0}
            className="shrink-0"
          >
            <Search className="w-4 h-4 mr-1" />
            Query
          </Button>
        </div>

        {searchTime !== null && (
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {searchTime.toFixed(2)}ms
            </span>
            <span>
              {results.length} results from {memories.length.toLocaleString()} memories
            </span>
          </div>
        )}

        {results.length > 0 ? (
          <ScrollArea className="h-[300px]">
            <div className="space-y-2 pr-4">
              {results.map((result, index) => (
                <div
                  key={result.memory.id}
                  onClick={() => onSelectMemory?.(result.memory)}
                  className="p-3 rounded-lg bg-background/50 border border-border/30 hover:border-primary/50 cursor-pointer transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono text-muted-foreground">#{index + 1}</span>
                        <span className="text-sm font-medium truncate">{result.memory.content}</span>
                      </div>
                      <div className="flex flex-wrap gap-3 text-xs">
                        <span className="flex items-center gap-1 text-primary">
                          <Zap className="w-3 h-3" />
                          Resonance: {(result.resonance * 100).toFixed(1)}%
                        </span>
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <Target className="w-3 h-3" />
                          Similarity: {(result.similarity * 100).toFixed(1)}%
                        </span>
                        <span className="text-muted-foreground">
                          Q-Align: {(result.quaternionAlignment * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        ) : memories.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">
            No memories in field. Encode some memories first.
          </div>
        ) : query && searchTime !== null ? (
          <div className="text-center py-8 text-muted-foreground text-sm">
            No results found for "{query}"
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground text-sm">
            Enter a query to search the memory field
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MemoryDecoder;
