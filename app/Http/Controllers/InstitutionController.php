<?php

namespace App\Http\Controllers;

use App\Services\PortalService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\Response;

class InstitutionController extends Controller
{
    public function index(PortalService $portal)
    {
        $error = null;
        try {
            $hei = $portal->fetchAllHEI();
        } catch (\Throwable $e) {
            report($e);
            $hei = [];
            $error = 'Unable to fetch institutions right now.';
        }

        $institutions = collect($hei)->values()->map(function ($row, $i) {
            return [
                'id'               => $i + 1,
                'institution_code' => $row['instCode'],
                'name'             => $row['instName'],

                // additional columns
                'x_coordinate'     => $row['xCoordinate']       ?? null,
                'y_coordinate'     => $row['yCoordinate']       ?? null,
                'ownership_sector' => $row['ownershipSector']   ?? null,
                'ownership_type'   => $row['ownershipHei_type'] ?? null,

                // lazy-loaded on expand
                'programs'         => [],
            ];
        });

        return Inertia::render('institution/index', [
            'institutions' => $institutions,
            'error'        => $error, // page can toast this if non-null
        ]);
    }

    /**
     * GET /institutions/{instCode}/programs
     * JSON for the accordion row (program list for a single HEI)
     */
    public function programs(string $instCode, PortalService $portal): JsonResponse
    {
        $v = Validator::make(
            ['instCode' => $instCode],
            ['instCode' => ['required','string','max:32','regex:/^[A-Za-z0-9\-]+$/']],
            ['instCode.regex' => 'The institution code may only contain letters, numbers, and dashes.']
        );

        if ($v->fails()) {
            return response()->json([
                'message' => 'Invalid institution code.',
                'errors'  => $v->errors(),
                'data'    => [],
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        try {
            $records = $portal->fetchProgramRecords($instCode);

            $programs = collect($records)
                ->map(function ($r, $i) {
                    $programName = trim((string) ($r['programName'] ?? ''));
                    $majorName   = trim((string) ($r['majorName']   ?? ''));
                    $permit4th   = trim((string) ($r['permit_4thyr'] ?? ''));

                    return [
                        'id'            => $i + 1,
                        'program_name'  => $programName,
                        'major'         => $majorName !== '' ? $majorName : null,
                        'program_type'  => null,                               // placeholder -> null
                        'permit_number' => $permit4th !== '' ? $permit4th : null,
                    ];
                })
                ->filter(fn ($p) => $p['program_name'] !== '')
                ->unique(fn ($p) => $p['program_name'] . '|' . ($p['major'] ?? ''))
                ->values()
                ->all();

            return response()->json(['data' => $programs], Response::HTTP_OK);
        } catch (\Throwable $e) {
            Log::error('Failed to fetch programs', [
                'instCode' => $instCode,
                'err' => $e->getMessage(),
            ]);

            return response()->json([
                'message' => 'Unable to fetch programs.',
                'data'    => [],
            ], Response::HTTP_SERVICE_UNAVAILABLE);
        }
    }
}
