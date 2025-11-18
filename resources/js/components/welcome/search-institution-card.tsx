import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Building2, Search, Loader2 } from 'lucide-react';

interface SearchInstitutionCardProps {
    searchTerm: string;
    onSearchTermChange: (value: string) => void;
    isSearching: boolean;
    onSearch: () => void;
    searchMessage: string | null;
    searchMessageType: 'warning' | 'error' | null;
    institutionsCount: number;
    onClear: () => void;
}

export default function SearchInstitutionCard({
    searchTerm,
    onSearchTermChange,
    isSearching,
    onSearch,
    searchMessage,
    searchMessageType,
    institutionsCount,
    onClear,
}: SearchInstitutionCardProps) {
    return (
        <Card className="border-0 bg-white/95 shadow-2xl backdrop-blur-md transition-all hover:shadow-3xl dark:bg-gray-800/90">
            <CardContent className="p-6 sm:p-8">
                <div className="mb-6 flex items-center gap-3">
                    <div className="rounded-lg bg-blue-50 p-3 dark:bg-blue-900/30">
                        <Building2 className="h-7 w-7 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Search by Institution
                        </h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Find schools and programs offered by educational institutions
                        </p>
                    </div>
                </div>

                <div className="flex flex-col items-stretch gap-3">
                    <div className="relative flex-1">
                        <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
                            <div className="grid h-10 w-10 place-items-center rounded-full bg-gray-100 dark:bg-gray-700/60">
                                <Search className="h-5 w-5 text-gray-500 dark:text-gray-300" />
                            </div>
                        </div>

                        <Input
                            type="text"
                            placeholder="Enter institution code or name..."
                            value={searchTerm}
                            onChange={(e) => onSearchTermChange(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') onSearch();
                            }}
                            className="h-14 rounded-full border border-gray-200 bg-white pl-16 pr-4 text-base shadow-sm transition-all placeholder:text-gray-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-300 dark:border-gray-700 dark:bg-gray-800/90 dark:text-white dark:placeholder:text-gray-500 dark:focus:border-blue-500"
                            disabled={isSearching}
                        />
                    </div>

                    <Button
                        onClick={onSearch}
                        className="h-14 rounded-full bg-blue-600 px-8 text-base font-semibold shadow-md transition-all hover:bg-blue-700 hover:shadow-lg disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-600"
                        disabled={isSearching}
                    >
                        {isSearching ? (
                            <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                Searching...
                            </>
                        ) : (
                            'Search'
                        )}
                    </Button>

                    {searchMessage && (
                        <div
                            className={`mt-1 rounded-lg border px-4 py-3 text-sm ${
                                searchMessageType === 'error'
                                    ? 'border-red-200 bg-red-50 text-red-700 dark:border-red-800/60 dark:bg-red-900/30 dark:text-red-200'
                                    : 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800/60 dark:bg-amber-900/30 dark:text-amber-200'
                            }`}
                        >
                            {searchMessage}
                        </div>
                    )}
                </div>

                {institutionsCount > 0 && (
                    <div className="mt-5 flex items-center justify-between rounded-lg border border-blue-100 bg-blue-50 p-4 transition-all dark:border-blue-700 dark:bg-blue-900/30">
                        <div className="flex items-center gap-2">
                            <div className="rounded-full bg-blue-600 p-1 dark:bg-blue-500">
                                <svg
                                    className="h-4 w-4 text-white"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M5 13l4 4L19 7"
                                    />
                                </svg>
                            </div>
                            <span className="text-sm font-semibold text-blue-900 dark:text-blue-200">
                                Found {institutionsCount} institution
                                {institutionsCount !== 1 ? 's' : ''}
                            </span>
                        </div>
                        <Button
                            onClick={onClear}
                            variant="ghost"
                            size="sm"
                            className="text-blue-700 hover:bg-blue-100 dark:text-blue-300 dark:hover:bg-blue-800"
                        >
                            Clear
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
