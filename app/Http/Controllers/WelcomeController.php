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
            // 👇 removed graduates count – no longer needed on landing page
            // 'graduates'    => ...
        ];

        return Inertia::render('welcome', [
            'stats' => $stats,
        ]);
    }

    /**
     * POST /api/search-institution
     *
     * ✅ Returns institutions WITHOUT programs initially
     * Programs are loaded lazily when user clicks on an institution
     */
    public function searchInstitution(Request $request, PortalService $portal)
    {
        try {
            $search = trim((string) $request->input('search', ''));

            // Return empty if no search term
            if ($search === '') {
                return response()->json(['institutions' => []]);
            }

            // 1. Get all HEIs from portal (cached for 10 min)
            $hei = $portal->fetchAllHEI();

            // 2. Filter by search term (code or name)
            $q = mb_strtolower($search);
            $collection = collect($hei)->filter(function ($row) use ($q) {
                $code = mb_strtolower((string) ($row['instCode'] ?? ''));
                $name = mb_strtolower((string) ($row['instName'] ?? ''));
                return str_contains($code, $q) || str_contains($name, $q);
            })->values();

            if ($collection->isEmpty()) {
                return response()->json(['institutions' => []]);
            }

            // 3. Map results WITHOUT fetching all programs (faster!)
            $result = $collection->map(function ($row, $index) {
                $instCode = (string) ($row['instCode'] ?? '');
                $instName = (string) ($row['instName'] ?? '');

                if ($instCode === '' || $instName === '') {
                    return null;
                }

                // Determine public/private from CHED ownership
                $sector = strtoupper(trim((string) ($row['ownershipSector'] ?? '')));
                $heiType = strtoupper(trim((string) ($row['ownershipHei_type'] ?? '')));
                $isPublic = $sector === 'PUBLIC'
                    || in_array($heiType, ['SUC', 'LUC', 'STATE', 'PUBLIC'], true);

                return [
                    'id'       => $index + 1,
                    'code'     => $instCode,
                    'name'     => $instName,
                    'type'     => $isPublic ? 'public' : 'private',
                    // ✅ Return empty array - programs loaded lazily via new endpoint
                    'programs' => [],
                ];
            })->filter()->values()->all();

            return response()->json(['institutions' => $result]);

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
     * GET /api/institution/{instCode}/programs
     *
     * ✅ Lazy load programs when user clicks on institution
     * This prevents the heavy queries in searchInstitution()
     */
    public function getInstitutionPrograms(string $instCode, PortalService $portal)
    {
        try {
            // 1. Fetch programs from portal API
            $records = $portal->fetchProgramRecords($instCode);

            // 2. Get local institution data (for graduates count)
            $localInstitution = Institution::with('programs')
                ->where('institution_code', $instCode)
                ->first();

            $localPrograms = $localInstitution ? $localInstitution->programs : collect();

            // 2b. Precompute graduates count per local program (avoid N+1)
            $graduatesCounts = collect();
            if ($localPrograms->isNotEmpty()) {
                $programIds = $localPrograms->pluck('id')->filter()->all();

                if (!empty($programIds)) {
                    $graduatesCounts = Graduate::whereIn('program_id', $programIds)
                        ->selectRaw('program_id, COUNT(*) as aggregate')
                        ->groupBy('program_id')
                        ->pluck('aggregate', 'program_id');
                }
            }

            // 3. Determine if public/private from portal data
            $heiArray = $portal->fetchAllHEI();
            $hei = collect($heiArray)->firstWhere('instCode', $instCode) ?? [];

            $sector = strtoupper(trim((string) ($hei['ownershipSector'] ?? '')));
            $heiType = strtoupper(trim((string) ($hei['ownershipHei_type'] ?? '')));
            $isPublic = $sector === 'PUBLIC'
                || in_array($heiType, ['SUC', 'LUC', 'STATE', 'PUBLIC'], true);

            // 4. Map programs from portal
            $portalPrograms = collect($records)
                ->map(function ($r) {
                    $programName = trim((string) ($r['programName'] ?? ''));
                    $majorName   = trim((string) ($r['majorName'] ?? ''));
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

            // 5. Match with local programs and count graduates
            $programsPayload = [];

            foreach ($portalPrograms as $p) {
                // Try to find a matching local Program (same name + major)
                $matchingLocal = $localPrograms->first(function ($lp) use ($p) {
                    $lpName  = strtoupper(trim((string) $lp->program_name));
                    $lpMajor = strtoupper(trim((string) ($lp->major ?? '')));
                    $pName   = strtoupper(trim((string) $p['program_name']));
                    $pMajor  = strtoupper(trim((string) ($p['major'] ?? '')));

                    return $lpName === $pName && $lpMajor === $pMajor;
                });

                $localId = $matchingLocal?->id;
                $hasPermitNumber = !empty($p['permit_number']);

                $graduatesCount = null;
                if ($matchingLocal && $localId) {
                    // Use precomputed counts; default to 0 if not present
                    $graduatesCount = (int) ($graduatesCounts[$localId] ?? 0);
                }

                $programsPayload[] = [
                    'id'              => $localId,
                    'name'            => $p['program_name'],
                    'major'           => $p['major'],
                    'copNumber'       => ($isPublic && $hasPermitNumber) ? $p['permit_number'] : null,
                    'grNumber'        => (!$isPublic && $hasPermitNumber) ? $p['permit_number'] : null,
                    'graduates_count' => $graduatesCount,
                ];
            }

            return response()->json(['programs' => $programsPayload]);

        } catch (\Throwable $e) {
            Log::error('Get institution programs error', [
                'instCode' => $instCode,
                'message'  => $e->getMessage(),
                'trace'    => $e->getTraceAsString(),
            ]);

            return response()->json([
                'error'   => true,
                'message' => 'Unable to load programs for this institution.',
            ], 500);
        }
    }

    /**
     * GET /api/program/{programId}
     *
     * Get full program details with graduates list
     */
    public function getProgram(Request $request, $programId)
    {
        try {
            $program   = Program::with('institution')->findOrFail($programId);
            $graduates = Graduate::where('program_id', $programId)->get();

            $type = strtolower(trim($program->institution->type ?? ''));

            // Determine if institution is private or public
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
                'programId' => $programId,
                'message'   => $e->getMessage(),
                'trace'     => $e->getTraceAsString(),
            ]);

            return response()->json([
                'error'   => true,
                'message' => 'An unexpected error occurred while loading the program.',
            ], 500);
        }
    }

    /**
     * POST /api/search-student
     *
     * ✅ PLACEHOLDER: Add your student search logic here if needed
     */
    public function searchStudent(Request $request)
    {
        try {
            // Add your student search implementation here
            return response()->json([
                'students' => [],
                'message'  => 'Student search not yet implemented',
            ]);
        } catch (\Throwable $e) {
            Log::error('Search student error', [
                'message' => $e->getMessage(),
                'trace'   => $e->getTraceAsString(),
            ]);

            return response()->json([
                'error'   => true,
                'message' => 'An unexpected error occurred while searching students.',
            ], 500);
        }
    }
}
