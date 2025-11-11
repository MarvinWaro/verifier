<?php

namespace App\Http\Controllers;

use App\Services\PortalService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\Response;

class InstitutionController extends Controller
{
    /**
     * Institutions page (Inertia).
     */
    public function index(PortalService $portal)
    {
        try {
            $hei = $portal->fetchAllHEI();
        } catch (\Throwable $e) {
            Log::error('Failed to fetch HEI list', ['err' => $e->getMessage()]);
            // Render page with empty list and an error prop the UI can toast
            return Inertia::render('institution/index', [
                'institutions' => collect(),
                'error'        => 'Unable to load institutions right now. Please try again shortly.',
            ]);
        }

        $institutions = collect($hei)->values()->map(function ($row, $i) {
            return [
                'id'               => $i + 1,
                'institution_code' => $row['instCode'],
                'name'             => $row['instName'],

                // extra columns
                'x_coordinate'     => $row['xCoordinate'] ?? null,
                'y_coordinate'     => $row['yCoordinate'] ?? null,
                'ownership_sector' => $row['ownershipSector'] ?? null,
                'ownership_type'   => $row['ownershipHei_type'] ?? null,

                // lazy-loaded on expand (kept for TS types)
                'programs'         => [],
            ];
        });

        return Inertia::render('institution/index', [
            'institutions' => $institutions,
        ]);
    }

    /**
     * GET /institutions/{instCode}/programs
     * JSON helper used by the accordion to fetch a school's programs.
     *
     * Response shape (kept stable for the frontend):
     *   200: { data: Program[] }
     *   422: { message: "...", errors: { instCode: [...] } }
     *   503: { message: "Upstream service unavailable" }
     */
    public function programs(string $instCode, PortalService $portal): JsonResponse
    {
        // Validate path param (defense-in-depth in addition to route->where())
        $v = Validator::make(
            ['instCode' => $instCode],
            [
                'instCode' => ['required', 'string', 'max:32', 'regex:/^[A-Za-z0-9\-]+$/'],
            ],
            [
                'instCode.regex' => 'The institution code may only contain letters, numbers, and dashes.',
            ]
        );

        if ($v->fails()) {
            return response()->json([
                'message' => 'Invalid institution code.',
                'errors'  => $v->errors(),
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        try {
            $records = $portal->fetchProgramRecords($instCode);
        } catch (\Throwable $e) {
            Log::error('Failed to fetch program records', [
                'instCode' => $instCode,
                'err'      => $e->getMessage(),
            ]);

            return response()->json([
                'message' => 'Upstream service is unavailable. Please try again later.',
                'data'    => [],
            ], Response::HTTP_SERVICE_UNAVAILABLE);
        }

        // Map API rows -> UI rows
        $programs = collect($records)
            ->map(function ($r, $i) {
                $programName = trim((string)($r['programName'] ?? ''));
                $majorName   = trim((string)($r['majorName'] ?? ''));
                $permit4th   = (string)($r['permit_4thyr'] ?? '');

                return [
                    'id'            => $i + 1,
                    'program_name'  => $programName,
                    'major'         => $majorName !== '' ? $majorName : null,
                    'program_type'  => '-',        // placeholder (not provided by API)
                    'permit_number' => $permit4th, // from API
                ];
            })
            ->filter(fn ($p) => $p['program_name'] !== '')
            ->unique(fn ($p) => $p['program_name'] . '|' . ($p['major'] ?? ''))
            ->values()
            ->all();

        return response()->json(['data' => $programs], Response::HTTP_OK);
    }
}
