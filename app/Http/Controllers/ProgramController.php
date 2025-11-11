<?php

namespace App\Http\Controllers;

use App\Services\PortalService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProgramController extends Controller
{
    public function index(Request $request, PortalService $portal)
    {
        // 1) Get HEI list for the dropdown
        $hei = [];
        try {
            $hei = $portal->fetchAllHEI(); // [ ['instCode'=>'...', 'instName'=>'...'], ... ]
        } catch (\Throwable $e) {
            report($e);
            $hei = [];
        }

        // 2) Resolve selected instCode from query (?instCode=...)
        $instCode = $request->query('instCode');
        $instCode = is_string($instCode) ? trim($instCode) : '';

        // allow only letters, numbers, and hyphen to avoid weird inputs
        if ($instCode !== '' && !preg_match('/^[A-Za-z0-9\-]+$/', $instCode)) {
            $instCode = '';
        }

        // If not provided or invalid, default to first HEI (if any)
        if ($instCode === '' && !empty($hei)) {
            $instCode = $hei[0]['instCode'];
        }

        // 3) Fetch full program records for selected HEI
        $records = [];
        if ($instCode !== '') {
            try {
                $records = $portal->fetchProgramRecords($instCode);
            } catch (\Throwable $e) {
                report($e);
                $records = [];
            }
        }

        // 4) Find selected HEI name for display
        $instName = null;
        if ($instCode !== '') {
            $hit = collect($hei)->firstWhere('instCode', $instCode);
            $instName = $hit['instName'] ?? $instCode;
        }

        // 5) Map API rows -> front-end shape (dedupe by program+major)
        $programs = collect($records)
            ->map(function ($r, $i) use ($instCode, $instName) {
                $programName = trim((string) ($r['programName'] ?? ''));
                $majorName   = trim((string) ($r['majorName'] ?? ''));
                $permit4th   = (string) ($r['permit_4thyr'] ?? '');

                return [
                    'id'            => $i + 1,
                    'program_name'  => $programName,
                    'major'         => $majorName !== '' ? $majorName : null,
                    // Not provided by API. Keep consistent type for the UI badge.
                    'program_type'  => 'Non-Board',
                    'permit_number' => $permit4th,
                    'institution'   => [
                        'institution_code' => $instCode,
                        'name'             => $instName ?? $instCode,
                        // Not available on this endpoint; keep for TSX compatibility.
                        'type'             => '-',
                    ],
                ];
            })
            ->filter(fn ($p) => $p['program_name'] !== '')
            ->unique(fn ($p) => $p['program_name'] . '|' . ($p['major'] ?? ''))
            ->values();

        return Inertia::render('programs/index', [
            'hei'              => $hei,
            'selectedInstCode' => $instCode !== '' ? $instCode : null,
            'programs'         => $programs,
        ]);
    }
}
