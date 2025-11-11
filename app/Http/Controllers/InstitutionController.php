<?php

namespace App\Http\Controllers;

use App\Services\PortalService;
use Illuminate\Http\JsonResponse;
use Inertia\Inertia;

class InstitutionController extends Controller
{
    public function index(PortalService $portal)
    {
        $hei = $portal->fetchAllHEI();

        $institutions = collect($hei)->values()->map(function ($row, $i) {
            return [
                'id'               => $i + 1,
                'institution_code' => $row['instCode'],
                'name'             => $row['instName'],

                // extra columns you added
                'x_coordinate'     => $row['xCoordinate'] ?? null,
                'y_coordinate'     => $row['yCoordinate'] ?? null,
                'ownership_sector' => $row['ownershipSector'] ?? null,
                'ownership_type'   => $row['ownershipHei_type'] ?? null,

                // no preloaded programs (lazy on click)
                'programs'         => [],
            ];
        });

        return Inertia::render('institution/index', [
            'institutions' => $institutions,
        ]);
    }

    /**
     * GET /institutions/{instCode}/programs
     * Returns the mapped program list for a single institution.
     */
    public function programs(string $instCode, PortalService $portal): JsonResponse
    {
        $instCode = trim($instCode);
        if ($instCode === '') {
            return response()->json(['data' => []]);
        }

        $records = $portal->fetchProgramRecords($instCode);

        $programs = collect($records)
            ->map(function ($r, $i) {
                $programName = trim((string) ($r['programName'] ?? ''));
                $majorName   = trim((string) ($r['majorName'] ?? ''));
                $permit4th   = (string) ($r['permit_4thyr'] ?? '');

                return [
                    'id'            => $i + 1,
                    'program_name'  => $programName,
                    'major'         => $majorName !== '' ? $majorName : null,
                    'program_type'  => '-',        // placeholder (not from API)
                    'permit_number' => $permit4th, // from API
                ];
            })
            ->filter(fn ($p) => $p['program_name'] !== '')
            ->unique(fn ($p) => $p['program_name'] . '|' . ($p['major'] ?? ''))
            ->values()
            ->all();

        return response()->json(['data' => $programs]);
    }
}
