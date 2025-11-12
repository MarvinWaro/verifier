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
                ['instCode' => ['required','string','max:32','regex:/^[A-Za-z0-9\-]+$/']]
            );
            if ($v->fails()) {
                $selectedInstCode = null; // ignore bad query & fall back to first
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
                    'err' => $e->getMessage(),
                ]);
                $error = $error ?: 'Unable to load program list.';
            }
        }

        // friendly name
        $instName = null;
        if ($selectedInstCode) {
            $hit = collect($hei)->firstWhere('instCode', $selectedInstCode);
            $instName = $hit['instName'] ?? $selectedInstCode;
        }

        // map -> UI shape (dedupe by program+major)
        $programs = collect($records)
            ->map(function ($r, $i) use ($selectedInstCode, $instName) {
                $programName = trim((string) ($r['programName'] ?? ''));
                $majorName   = trim((string) ($r['majorName']   ?? ''));
                $permit4th   = trim((string) ($r['permit_4thyr'] ?? ''));

                return [
                    'id'            => $i + 1,
                    'program_name'  => $programName,
                    'major'         => $majorName !== '' ? $majorName : null,
                    'program_type'  => null,                               // placeholder -> null
                    'permit_number' => $permit4th !== '' ? $permit4th : null,
                    'institution'   => [
                        'institution_code' => $selectedInstCode,
                        'name'             => $instName ?? $selectedInstCode,
                        'type'             => '-', // kept for compatibility (UI may ignore)
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
            'error'            => $error, // optional toast on page load
        ]);
    }
}
