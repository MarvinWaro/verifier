<?php

namespace App\Http\Controllers;

use App\Services\PortalService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProgramController extends Controller
{
    public function index(Request $request, PortalService $portal)
    {
        // 1) HEI list for the dropdown
        $hei = $portal->fetchAllHEI(); // [ ['instCode'=>'...', 'instName'=>'...'], ... ]

        // 2) Which institution is selected? (?instCode=...)
        $selectedInstCode = $request->query('instCode');
        if (!$selectedInstCode && !empty($hei)) {
            $selectedInstCode = $hei[0]['instCode']; // default to first HEI
        }

        // 3) Pull FULL program records so we can read majors + permit_4thyr
        $records = $selectedInstCode ? $portal->fetchProgramRecords($selectedInstCode) : [];

        // 4) Find selected institution name for display
        $instName = null;
        if ($selectedInstCode) {
            $hit = collect($hei)->firstWhere('instCode', $selectedInstCode);
            $instName = $hit['instName'] ?? $selectedInstCode;
        }

        // 5) Map records -> frontend shape (dedupe by program+major)
        $programs = collect($records)
            ->map(function ($r, $i) use ($selectedInstCode, $instName) {
                $programName = (string) ($r['programName'] ?? '');
                $majorName   = trim((string) ($r['majorName'] ?? ''));
                $permit4th   = (string) ($r['permit_4thyr'] ?? '');

                return [
                    'id'            => $i + 1,
                    'program_name'  => $programName,
                    'major'         => $majorName !== '' ? $majorName : null,
                    'program_type'  => '-',       // placeholder (not from API)
                    'permit_number' => $permit4th,
                    'institution'   => [
                        'institution_code' => $selectedInstCode,
                        'name'             => $instName ?? $selectedInstCode,
                        'type'             => '-', // placeholder
                    ],
                ];
            })
            ->filter(fn ($p) => $p['program_name'] !== '')
            ->unique(fn ($p) => $p['program_name'] . '|' . ($p['major'] ?? ''))
            ->values();

        return Inertia::render('programs/index', [
            'programs'         => $programs,
            'hei'              => $hei,
            'selectedInstCode' => $selectedInstCode,
        ]);
    }
}
