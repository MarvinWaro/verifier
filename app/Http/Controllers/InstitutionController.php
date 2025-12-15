<?php

namespace App\Http\Controllers;

use App\Models\Graduate; // <--- IMPORTANT: This was missing
use App\Services\PortalService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
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
                'id' => $i + 1,
                'institution_code' => $row['instCode'],
                'name' => $row['instName'],
                'x_coordinate' => $row['xCoordinate'] ?? null,
                'y_coordinate' => $row['yCoordinate'] ?? null,
                'ownership_sector' => $row['ownershipSector'] ?? null,
                'ownership_type' => $row['ownershipHei_type'] ?? null,
                'programs' => [],
            ];
        });

        // FIXED: Changed 'institutions/index' to 'institution/index' to match your folder name
        return Inertia::render('institution/index', [
            'institutions' => $institutions,
            'error' => $error,
        ]);
    }

    public function programs(string $instCode, PortalService $portal): JsonResponse
    {
        $v = Validator::make(
            ['instCode' => $instCode],
            ['instCode' => ['required', 'string', 'max:32', 'regex:/^[A-Za-z0-9\-]+$/']]
        );

        if ($v->fails()) {
            return response()->json(['data' => []], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        try {
            $records = $portal->fetchProgramRecords($instCode);

            $programs = collect($records)
                ->map(function ($r, $i) {
                    return [
                        'id' => $i + 1,
                        'program_name' => trim((string) ($r['programName'] ?? '')),
                        'major' => trim((string) ($r['majorName'] ?? '')) ?: null,
                        'program_type' => null,
                        'permit_number' => trim((string) ($r['permit_4thyr'] ?? '')) ?: null,
                    ];
                })
                ->filter(fn ($p) => $p['program_name'] !== '')
                ->unique(fn ($p) => $p['program_name'].'|'.($p['major'] ?? ''))
                ->values()
                ->all();

            return response()->json(['data' => $programs], Response::HTTP_OK);
        } catch (\Throwable $e) {
            Log::error('Failed to fetch programs: '.$e->getMessage());

            return response()->json(['data' => []], Response::HTTP_SERVICE_UNAVAILABLE);
        }
    }

    /**
     * Fetch graduates for a specific program modal
     */
    public function programGraduates(Request $request, string $instCode): JsonResponse
    {
        $programName = trim($request->query('program_name', ''));

        if (! $programName) {
            return response()->json([]);
        }

        try {
            // Normalize the search term for better matching
            $normalizedSearch = strtolower(preg_replace('/\s+/', '', $programName));

            $graduates = Graduate::query()
                ->where('hei_uii', $instCode)
                ->where(function ($q) use ($programName, $normalizedSearch) {
                    // Try exact match first
                    $q->where('course_from_excel', $programName)
                      // Then try case-insensitive exact match
                        ->orWhereRaw('LOWER(course_from_excel) = ?', [strtolower($programName)])
                      // Then try normalized match (removes spaces)
                        ->orWhereRaw('LOWER(REPLACE(course_from_excel, " ", "")) = ?', [$normalizedSearch])
                      // Finally, try partial match
                        ->orWhere('course_from_excel', 'LIKE', "%{$programName}%")
                      // Also check through program relation if exists
                        ->orWhereHas('program', function ($p) use ($programName, $normalizedSearch) {
                            $p->where('program_name', $programName)
                                ->orWhereRaw('LOWER(program_name) = ?', [strtolower($programName)])
                                ->orWhereRaw('LOWER(REPLACE(program_name, " ", "")) = ?', [$normalizedSearch])
                                ->orWhere('program_name', 'LIKE', "%{$programName}%");
                        });
                })
                ->orderBy('last_name')
                ->orderBy('first_name')
                ->select(['id', 'first_name', 'last_name', 'middle_name', 'so_number', 'date_graduated'])
                ->get()
                ->map(function ($grad) {
                    return [
                        'id' => $grad->id,
                        'first_name' => $grad->first_name,
                        'last_name' => $grad->last_name,
                        'middle_name' => $grad->middle_name,
                        'so_number' => $grad->so_number,
                        'year_graduated' => $grad->date_graduated,
                    ];
                });

            // Log for debugging
            \Log::info("Graduate search for '{$programName}' at {$instCode}: found ".$graduates->count());

            return response()->json($graduates);

        } catch (\Exception $e) {
            \Log::error("Error fetching graduates for HEI $instCode, program '{$programName}': ".$e->getMessage());

            return response()->json(['error' => 'Server Error'], 500);
        }
    }
}
