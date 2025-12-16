import { useState, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Search, Loader2 } from 'lucide-react';
import { debounce } from 'lodash';
import { Badge } from '@/components/ui/badge';

interface SearchResult {
    id: number;
    name: string;
    so_number: string | null;
    program: string;
    institution: string;
    year_graduated: string;
}

export default function GraduateSearch() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [showResults, setShowResults] = useState(false);

    // Debounced search function
    const searchGraduates = useCallback(
        debounce(async (searchQuery: string) => {
            if (searchQuery.length < 2) {
                setResults([]);
                setShowResults(false);
                return;
            }

            setLoading(true);
            try {
                const response = await fetch(
                    `/dashboard/search?q=${encodeURIComponent(searchQuery)}`,
                    {
                        headers: { Accept: 'application/json' },
                    }
                );

                if (response.ok) {
                    const data = await response.json();
                    setResults(data);
                    setShowResults(true);
                }
            } catch (error) {
                console.error('Search failed:', error);
            } finally {
                setLoading(false);
            }
        }, 300),
        []
    );

    useEffect(() => {
        searchGraduates(query);
    }, [query, searchGraduates]);

    return (
        <div className="relative">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                <Input
                    type="text"
                    placeholder="Search graduates by name, SO number, or program..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => query.length >= 2 && setShowResults(true)}
                    onBlur={() => setTimeout(() => setShowResults(false), 200)}
                    className="pl-10 h-11"
                />
                {loading && (
                    <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-gray-500" />
                )}
            </div>

            {/* Search Results Dropdown */}
            {showResults && results.length > 0 && (
                <Card className="absolute top-full mt-2 w-full z-50 shadow-lg">
                    <CardContent className="p-2">
                        <div className="max-h-[400px] overflow-y-auto space-y-1">
                            {results.map((result) => (
                                <div
                                    key={result.id}
                                    className="p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md cursor-pointer transition-colors"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <p className="font-medium text-sm">{result.name}</p>
                                            <p className="text-xs text-muted-foreground mt-0.5">
                                                {result.program}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {result.institution}
                                            </p>
                                        </div>
                                        <div className="flex flex-col items-end gap-1">
                                            {result.so_number && (
                                                <Badge variant="outline" className="text-xs">
                                                    {result.so_number}
                                                </Badge>
                                            )}
                                            {result.year_graduated && (
                                                <span className="text-xs text-muted-foreground">
                                                    {result.year_graduated}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {showResults && query.length >= 2 && results.length === 0 && !loading && (
                <Card className="absolute top-full mt-2 w-full z-50 shadow-lg">
                    <CardContent className="p-4 text-center text-sm text-muted-foreground">
                        No graduates found matching "{query}"
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
