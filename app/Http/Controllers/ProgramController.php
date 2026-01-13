<?php

namespace App\Http\Controllers;

use App\Services\PortalService;
use App\Models\ProgramCatalog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;

class ProgramController extends Controller
{
    public function index(Request $request, PortalService $portal)
    {
        $hei = [];
        $error = null;

        // HEI list for dropdown
        try {
            $hei = $portal->fetchAllHEI();
        } catch (\Throwable $e) {
            report($e);
            $error = 'Unable to load institutions.';
        }

        // selected ?instCode=
        $selectedInstCode = $request->query('instCode');
        if ($selectedInstCode) {
            $v = Validator::make(
                ['instCode' => $selectedInstCode],
                ['instCode' => ['required', 'string', 'max:32', 'regex:/^[A-Za-z0-9\-]+$/']]
            );
            if ($v->fails()) {
                $selectedInstCode = null;
            }
        }
        if (!$selectedInstCode && !empty($hei)) {
            $selectedInstCode = $hei[0]['instCode'];
        }

        // full program rows for selected HEI
        $records = [];
        if ($selectedInstCode) {
            try {
                $records = $portal->fetchProgramRecords($selectedInstCode);
            } catch (\Throwable $e) {
                Log::error('Failed to fetch program records', [
                    'instCode' => $selectedInstCode,
                    'err'      => $e->getMessage(),
                ]);
                $error = $error ?: 'Unable to load program list.';
            }
        }

        // friendly name
        $instName = null;
        if ($selectedInstCode) {
            $hit      = collect($hei)->firstWhere('instCode', $selectedInstCode);
            $instName = $hit['instName'] ?? $selectedInstCode;
        }

        // 🔹 Load catalog classifications
        $catalog = ProgramCatalog::query()
            ->select(['program_name', 'program_type'])
            ->get()
            ->keyBy(function (ProgramCatalog $row) {
                return mb_strtoupper(trim($row->program_name));
            });

        // map -> UI shape
        $programs = collect($records)
            ->map(function ($r, $i) use ($selectedInstCode, $instName, $catalog, $portal) {
                $programName = trim((string) ($r['programName'] ?? ''));
                $majorName   = trim((string) ($r['majorName'] ?? ''));
                $permit4th   = trim((string) ($r['permit_4thyr'] ?? ''));

                // ✅ Get program_status from API
                $programStatus = trim((string) ($r['program_status'] ?? 'Unknown'));

                // ✅ Get the filename for building PDF URL
                $filename = trim((string) ($r['filename'] ?? ''));

                // ✅ Build proper PDF URL using PortalService method
                $permitPdfUrl = null;
                if ($filename !== '') {
                    $permitPdfUrl = $portal->buildPermitUrl($filename);
                }

                // Default classification = Unknown
                $programType = 'Unknown';
                if ($programName !== '') {
                    $key = mb_strtoupper($programName);
                    $catalogRow = $catalog->get($key);
                    if ($catalogRow && $catalogRow->program_type) {
                        $programType = $catalogRow->program_type;
                    }
                }

                // ✅ Add badge_priority for sorting
                // 1 = Green (has permit + has PDF)
                // 2 = Purple (has permit, no PDF)
                // 3 = Red (no permit)
                $hasPermit = $permit4th !== '';
                $hasPdf = $permitPdfUrl !== null;

                $badgePriority = 3; // Default: Red
                if ($hasPermit && $hasPdf) {
                    $badgePriority = 1; // Green
                } elseif ($hasPermit && !$hasPdf) {
                    $badgePriority = 2; // Purple
                }

                return [
                    'id'             => $i + 1,
                    'program_name'   => $programName,
                    'major'          => $majorName !== '' ? $majorName : null,
                    'program_type'   => $programType,
                    'program_status' => $programStatus, // ✅ Added
                    'permit_number'  => $permit4th !== '' ? $permit4th : null,
                    'permit_pdf_url' => $permitPdfUrl,
                    'badge_priority' => $badgePriority,
                    'institution'    => [
                        'institution_code' => $selectedInstCode,
                        'name'             => $instName ?? $selectedInstCode,
                        'type'             => '-',
                    ],
                ];
            })
            ->filter(fn ($p) => $p['program_name'] !== '')
            ->unique(fn ($p) => $p['program_name'] . '|' . ($p['major'] ?? ''))
            // ✅ Sort by badge priority (1=Green, 2=Purple, 3=Red), then by program name
            ->sortBy([
                ['badge_priority', 'asc'],
                ['program_name', 'asc'],
            ])
            ->values();

        return Inertia::render('programs/index', [
            'programs'         => $programs,
            'hei'              => $hei,
            'selectedInstCode' => $selectedInstCode,
            'error'            => $error,
        ]);
    }
}
