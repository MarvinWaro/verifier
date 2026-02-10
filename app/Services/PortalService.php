<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;

class PortalService
{
    /** Base endpoints */
    protected string $baseUrl      = 'https://portal.chedro12.com/api';
    protected string $programsPath = '/fetch-programs';
    protected string $allHeiPath   = '/fetch-all-hei';

    /** Permit viewer base URL (for PDF links) */
    protected string $permitBaseUrl = '';

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

        // Base URL to view permit PDFs (e.g. GR-2012-041)
        $this->permitBaseUrl = (string) env(
            'PORTAL_PERMIT_BASE_URL',
            'https://portal.chedro12.com/govt_auth/view_file'
        );

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
     * Get the full program records for an institution (raw API rows).
     * Each row: instCode, instName, programCode, programName, majorName, permit_4thyr, programLevel, ...
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
     * Get list of all HEIs with extra fields you need.
     * Each item returns:
     *  instCode, instName, instOwnership, province, municipalityCity, status,
     *  xCoordinate, yCoordinate, ownershipSector, ownershipHei_type
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
                    ->map(function ($item) {
                        return [
                            'instCode'          => $item['instCode']          ?? null,
                            'instName'          => $item['instName']          ?? null,
                            'instOwnership'     => $item['instOwnership']     ?? null,
                            'province'          => $item['province']          ?? null,
                            'municipalityCity'  => $item['municipalityCity']  ?? null,
                            'status'            => $item['status']            ?? null,
                            'xCoordinate'       => $item['xCoordinate']       ?? null,
                            'yCoordinate'       => $item['yCoordinate']       ?? null,
                            'ownershipSector'   => $item['ownershipSector']   ?? null,
                            'ownershipHei_type' => $item['ownershipHei_type'] ?? null,
                        ];
                    })
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
     * Build full URL for a permit PDF based on filename from the portal API.
     *
     * IMPORTANT: Do NOT use urlencode() here. The portal stores filenames with
     * literal characters like parentheses and commas (e.g. "file_compressed_(1).pdf").
     * URL-encoding them produces "%281%29" which the portal does NOT recognise,
     * returning a 1-byte empty response or 404.
     *
     * We only encode the bare minimum (spaces → %20) so the URL is valid without
     * breaking the portal's path matching.
     */
    public function buildPermitUrl(?string $filename): ?string
    {
        $filename = trim((string) $filename);

        if ($filename === '') {
            return null;
        }

        $base = rtrim($this->permitBaseUrl, '/');

        // Only encode spaces; leave parentheses, commas, etc. as-is
        $safeName = str_replace(' ', '%20', $filename);

        return $base . '/' . $safeName;
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
