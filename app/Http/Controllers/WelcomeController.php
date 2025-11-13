<?php

namespace App\Http\Controllers;

use App\Models\Institution;
use App\Models\Program;
use App\Models\Graduate;
use App\Services\PortalService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class WelcomeController extends Controller
{
    /**
     * Landing page
     */
    public function index(PortalService $portal)
    {
        $institutionsCount = 0;

        try {
            $hei = $portal->fetchAllHEI();
            $institutionsCount = is_array($hei) ? count($hei) : 0;
        } catch (\Throwable $e) {
            report($e);
        }

        $stats = [
            'institutions' => $institutionsCount,
            'programs'     => Program::count(),
            // Only count graduates with Board programs as eligible
            'graduates'    => Graduate::whereHas('program', function ($query) {
                $query->where('program_type', 'Board');
            })->count(),
        ];

        return Inertia::render('welcome', [
            'stats' => $stats,
        ]);
    }

    /**
     * POST /api/search-institution
     *
     * Uses CHED Portal (fetchAllHEI) as the source for institutions,
     * and joins with local DB (Institution + Program + Graduate)
     * to keep the same JSON structure your React expects.
     */
    public function searchInstitution(Request $request, PortalService $portal)
    {
        try {
            $search = trim((string) $request->input('search', ''));

            // 1. Get all HEIs from portal
            $hei = $portal->fetchAllHEI();
            $collection = collect($hei);

            // 2. Filter by search term (code or name)
            if ($search !== '') {
                $q = mb_strtolower($search);

                $collection = $collection->filter(function ($row) use ($q) {
                    $code = mb_strtolower((string) ($row['instCode'] ?? ''));
                    $name = mb_strtolower((string) ($row['instName'] ?? ''));

                    return str_contains($code, $q) || str_contains($name, $q);
                });
            }

            $collection = $collection->values();

            if ($collection->isEmpty()) {
                return response()->json([
                    'institutions' => [],
                ]);
            }

            // 3. Collect instCodes for any local matches
            $instCodes = $collection
                ->pluck('instCode')
                ->filter()
                ->unique()
                ->values()
                ->all();

            $localInstitutions = Institution::with('programs')
                ->whereIn('institution_code', $instCodes)
                ->get()
                ->keyBy('institution_code');

            $result = [];

            foreach ($collection as $index => $row) {
                $instCode = (string) ($row['instCode'] ?? '');
                $instName = (string) ($row['instName'] ?? '');

                if ($instCode === '' || $instName === '') {
                    continue;
                }

                // PUBLIC / PRIVATE from CHED ownership
                $sector  = strtoupper(trim((string) ($row['ownershipSector']   ?? '')));
                $heiType = strtoupper(trim((string) ($row['ownershipHei_type'] ?? '')));

                $isPublic = $sector === 'PUBLIC'
                    || in_array($heiType, ['SUC', 'LUC', 'STATE', 'PUBLIC'], true);

                $localInstitution = $localInstitutions->get($instCode);
                $localPrograms    = $localInstitution ? $localInstitution->programs : collect();

                // 4. Fetch programs for this HEI from portal
                $records = $portal->fetchProgramRecords($instCode);

                $portalPrograms = collect($records)
                    ->map(function ($r) {
                        $programName = trim((string) ($r['programName'] ?? ''));
                        $majorName   = trim((string) ($r['majorName']   ?? ''));
                        $permit4th   = trim((string) ($r['permit_4thyr'] ?? ''));

                        return [
                            'program_name'  => $programName,
                            'major'         => $majorName !== '' ? $majorName : null,
                            'permit_number' => $permit4th !== '' ? $permit4th : null,
                        ];
                    })
                    ->filter(fn ($p) => $p['program_name'] !== '')
                    ->unique(fn ($p) => $p['program_name'] . '|' . ($p['major'] ?? ''))
                    ->values();

                $programsPayload = [];

                foreach ($portalPrograms as $p) {
                    // Try to find a matching local Program (same name + major)
                    $matchingLocal = $localPrograms->first(function ($lp) use ($p) {
                        $lpName  = strtoupper(trim((string) $lp->program_name));
                        $lpMajor = strtoupper(trim((string) ($lp->major ?? '')));

                        $pName  = strtoupper(trim((string) $p['program_name']));
                        $pMajor = strtoupper(trim((string) ($p['major'] ?? '')));

                        return $lpName === $pName && $lpMajor === $pMajor;
                    });

                    $localId         = $matchingLocal?->id;
                    $graduatesCount  = $matchingLocal
                        ? Graduate::where('program_id', $localId)->count()
                        : null;
                    $hasPermitNumber = !empty($p['permit_number']);

                    $programsPayload[] = [
                        // null if we only have it from the portal (no local row)
                        'id'              => $localId,
                        'name'            => $p['program_name'],
                        'major'           => $p['major'],
                        'copNumber'       => ($isPublic && $hasPermitNumber) ? $p['permit_number'] : null,
                        'grNumber'        => (!$isPublic && $hasPermitNumber) ? $p['permit_number'] : null,
                        'graduates_count' => $graduatesCount,
                    ];
                }

                $result[] = [
                    // use local id if we have it, else just a fallback index
                    'id'       => $localInstitution?->id ?? ($index + 1),
                    'code'     => $instCode,
                    'name'     => $instName,
                    'type'     => $isPublic ? 'public' : 'private',
                    'programs' => $programsPayload,
                ];
            }

            return response()->json([
                'institutions' => $result,
            ]);
        } catch (\Throwable $e) {
            Log::error('Institution search error', [
                'message' => $e->getMessage(),
                'trace'   => $e->getTraceAsString(),
            ]);

            return response()->json([
                'error'   => true,
                'message' => 'An unexpected error occurred while searching institutions.',
            ], 500);
        }
    }


    /**
     * GET /api/program/{programId}
     */
    public function getProgram(Request $request, $programId)
    {
        try {
            $program   = Program::with('institution')->findOrFail($programId);
            $graduates = Graduate::where('program_id', $programId)->get();

            $type = strtolower(trim($program->institution->type ?? ''));

            // Determine if institution is private or public (as before)
            $isPublic = in_array($type, ['sucs', 'lucs', 'suc', 'luc', 'state', 'public']);

            $hasPermitNumber = !empty($program->permit_number);
            $isBoard         = ($program->program_type === 'Board');

            $graduatesList = [];

            foreach ($graduates as $graduate) {
                // Determine eligibility: only Board programs are eligible
                $eligibility = $isBoard
                    ? 'Eligible'
                    : 'Not Eligible - Non-Board Program';

                $graduatesList[] = [
                    'id'            => $graduate->id,
                    'name'          => trim("{$graduate->first_name} {$graduate->middle_name} {$graduate->last_name} {$graduate->extension_name}"),
                    'yearGraduated' => $graduate->date_graduated,
                    'studentId'     => $graduate->student_id_number ?? 'N/A',
                    'eligibility'   => $eligibility,
                    'firstName'     => $graduate->first_name,
                    'lastName'      => $graduate->last_name,
                    'middleName'    => $graduate->middle_name,
                    'extensionName' => $graduate->extension_name,
                    'dateOfBirth'   => $graduate->date_of_birth,
                    'sex'           => $graduate->sex,
                    'soNumber'      => $graduate->so_number,
                    'lrn'           => $graduate->lrn,
                    'philsysId'     => $graduate->philsys_id,
                    // Include program and institution data for each graduate
                    'program'       => [
                        'id'        => $program->id,
                        'name'      => $program->program_name,
                        'major'     => $program->major,
                        'copNumber' => ($isPublic && $hasPermitNumber) ? $program->permit_number : null,
                        'grNumber'  => (!$isPublic && $hasPermitNumber) ? $program->permit_number : null,
                    ],
                    'institution'   => [
                        'code' => $program->institution->institution_code,
                        'name' => $program->institution->name,
                        'type' => $isPublic ? 'public' : 'private',
                    ],
                ];
            }

            return response()->json([
                'program' => [
                    'id'           => $program->id,
                    'name'         => $program->program_name,
                    'major'        => $program->major,
                    'copNumber'    => ($isPublic && $hasPermitNumber) ? $program->permit_number : null,
                    'grNumber'     => (!$isPublic && $hasPermitNumber) ? $program->permit_number : null,
                    'program_type' => $program->program_type,
                    'institution'  => [
                        'code' => $program->institution->institution_code,
                        'name' => $program->institution->name,
                        'type' => $isPublic ? 'public' : 'private',
                    ],
                    'graduates'    => $graduatesList,
                ],
            ]);
        } catch (\Throwable $e) {
            Log::error('Get program error', [
                'message' => $e->getMessage(),
                'trace'   => $e->getTraceAsString(),
            ]);

            return response()->json([
                'error'   => true,
                'message' => 'An unexpected error occurred while loading the program.',
            ], 500);
        }
    }
}
