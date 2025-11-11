<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;

class PortalService
{
    /** Base endpoints */
    protected string $baseUrl     = 'https://portal.chedro12.com/api';
    protected string $programsPath = '/fetch-programs';
    protected string $allHeiPath   = '/fetch-all-hei';

    /** Config */
    protected int $timeout  = 30;   // seconds
    protected int $retries  = 3;    // attempts
    protected int $backoff  = 500;  // ms between retries
    protected int $cacheTtl = 600;  // seconds

    /** Secret (env) */
    protected string $apiKey = '';  // default prevents null-type crash

    public function __construct()
    {
        // Read from .env (no config file needed)
        $this->apiKey = (string) env('PORTAL_API', '');

        // Optional: log if missing (helps debugging)
        if ($this->apiKey === '') {
            logger()->error('PORTAL_API is missing in .env');
        }
    }

    /**
     * Get unique program names for an institution.
     * Returns: [ "BSIT", "BSBA", ... ]
     */
    public function fetchPrograms(string $instCode): array
    {
        $instCode = trim($instCode);
        if ($instCode === '') {
            return [];
        }

        $cacheKey = "chedro12_programs_{$instCode}";

        return Cache::remember($cacheKey, $this->cacheTtl, function () use ($instCode) {
            $data = $this->postToCHED($instCode);

            return collect($data ?? [])
                ->pluck('programName')
                ->filter(fn ($v) => filled($v))
                ->map(fn ($v) => trim($v))
                ->unique()
                ->values()
                ->all();
        });
    }

    /**
     * Get majors for a specific program in an institution.
     * Returns: [ "Network Tech", "Data Science", ... ]
     */
    public function fetchMajors(string $instCode, string $programName): array
    {
        $instCode    = trim($instCode);
        $programName = trim($programName);
        if ($instCode === '' || $programName === '') {
            return [];
        }

        $cacheKey = "chedro12_program_majors_{$instCode}_{$programName}";

        return Cache::remember($cacheKey, $this->cacheTtl, function () use ($instCode, $programName) {
            $data = $this->postToCHED($instCode);

            return collect($data ?? [])
                ->filter(fn ($item) => trim((string)($item['programName'] ?? '')) === $programName)
                ->pluck('majorName')
                ->filter(fn ($name) => filled($name))
                ->map(fn ($v) => trim($v))
                ->unique()
                ->values()
                ->all();
        });
    }

    /**
     * NEW: Get the full program records for an institution (raw API rows).
     * Each row contains fields like:
     *  instCode, instName, programCode, programName, majorName, permit_4thyr, programLevel, ...
     *
     * Returns: [ { ...full record... }, ... ]
     */
    public function fetchProgramRecords(string $instCode): array
    {
        $instCode = trim($instCode);
        if ($instCode === '') {
            return [];
        }

        $cacheKey = "chedro12_program_records_{$instCode}";

        return Cache::remember($cacheKey, $this->cacheTtl, function () use ($instCode) {
            return $this->postToCHED($instCode) ?? [];
        });
    }

    /**
     * Get list of all HEIs.
     * Returns: [ ['instCode' => 'X', 'instName' => 'Y'], ... ]
     */
    public function fetchAllHEI(): array
    {
        $cacheKey = 'chedro12_allhei';

        return Cache::remember($cacheKey, $this->cacheTtl, function () {
            if ($this->apiKey === '') {
                // Fail soft if key missing
                return [];
            }

            try {
                $response = Http::withHeaders([
                        'PORTAL-API' => $this->apiKey,
                        'Accept'     => 'application/json',
                    ])
                    ->timeout($this->timeout)
                    ->retry($this->retries, $this->backoff)
                    ->get($this->baseUrl . $this->allHeiPath);

                if (!$response->ok()) {
                    return [];
                }

                $data = $this->normalize($response->json());

                return collect($data ?? [])
                    ->map(fn ($item) => [
                        'instCode' => $item['instCode'] ?? null,
                        'instName' => $item['instName'] ?? null,
                    ])
                    ->filter(fn ($r) => filled($r['instCode']) && filled($r['instName']))
                    ->sortBy('instName', SORT_NATURAL | SORT_FLAG_CASE)
                    ->values()
                    ->all();
            } catch (\Throwable $e) {
                report($e);
                return [];
            }
        });
    }

    /**
     * Internal: POST to fetch programs/majors for an institution.
     */
    protected function postToCHED(string $instCode): ?array
    {
        if ($this->apiKey === '') {
            // Fail soft if key missing
            return null;
        }

        try {
            $response = Http::withHeaders([
                    'PORTAL-API'   => $this->apiKey,
                    'Accept'       => 'application/json',
                    'Content-Type' => 'application/x-www-form-urlencoded',
                ])
                ->asForm()
                ->timeout($this->timeout)
                ->retry($this->retries, $this->backoff)
                ->post($this->baseUrl . $this->programsPath, [
                    'instCode' => $instCode,
                ]);

            if (!$response->ok()) {
                return null;
            }

            return $this->normalize($response->json());
        } catch (\Throwable $e) {
            report($e);
            return null;
        }
    }

    /**
     * Some endpoints sometimes return a string like "Array[ ...json... ]".
     * Normalize to a PHP array or return null.
     */
    protected function normalize($data): ?array
    {
        if (is_string($data) && str_starts_with($data, 'Array[')) {
            $data = substr($data, 5);
            $data = json_decode($data, true);
        }

        return is_array($data) ? $data : null;
    }
}
