<?php

namespace App\Http\Controllers;

use App\Services\PortalService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;

class ProgramController extends Controller
{
    public function index(Request $request, PortalService $portal)
    {
        // 1) HEI list for the dropdown
        $hei = [];
        $error = null;

        try {
            $hei = $portal->fetchAllHEI(); // [ ['instCode'=>'...', 'instName'=>'...'], ... ]
        } catch (\Throwable $e) {
            report($e);
            $error = 'Unable to load institutions.';
        }

        // 2) Which institution is selected? (?instCode=...)
        $selectedInstCode = $request->query('instCode');

        if ($selectedInstCode) {
            $v = Validator::make(
                ['instCode' => $selectedInstCode],
                [
                    'instCode' => ['required', 'string', 'max:32', 'regex:/^[A-Za-z0-9\-]+$/'],
                ]
            );
            if ($v->fails()) {
                // if invalid query, ignore it and fall back to first HEI
                $selectedInstCode = null;
            }
        }

        if (!$selectedInstCode && !empty($hei)) {
            $selectedInstCode = $hei[0]['instCode']; // default to first HEI
        }

        // 3) Pull FULL program records so we can read majors + permit_4thyr
        $records = [];
        if ($selectedInstCode) {
            try {
                $records = $portal->fetchProgramRecords($selectedInstCode);
            } catch (\Throwable $e) {
                Log::error('Failed to fetch program records', [
                    'instCode' => $selectedInstCode,
                    'err' => $e->getMessage(),
                ]);
                $error = $error ?: 'Unable to load program list.';
            }
        }

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
            'error'            => $error, // you can toast this on the page if you want
        ]);
    }
}
