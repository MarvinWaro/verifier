<?php

namespace App\Http\Controllers;

use App\Services\PortalService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProgramController extends Controller
{
    public function index(Request $request, PortalService $portal)
    {
        // 1) Get all HEIs for the dropdown
        $hei = $portal->fetchAllHEI(); // [ ['instCode'=>'123','instName'=>'ABC'], ... ]

        // 2) Determine selected institution (?instCode=...)
        $selectedInstCode = $request->query('instCode');
        if (!$selectedInstCode && !empty($hei)) {
            $selectedInstCode = $hei[0]['instCode']; // default to first
        }

        // 3) Fetch programs for selected institution
        $programNames = $selectedInstCode ? $portal->fetchPrograms($selectedInstCode) : [];

        // 4) Find selected institution name (for display)
        $instName = null;
        if ($selectedInstCode) {
            $hit = collect($hei)->firstWhere('instCode', $selectedInstCode);
            $instName = $hit['instName'] ?? $selectedInstCode;
        }

        // 5) Map to your frontend shape (placeholders for unknown fields)
        $programs = collect($programNames)->values()->map(function ($name, $i) use ($selectedInstCode, $instName) {
            return [
                'id'            => $i + 1,
                'program_name'  => $name,
                'major'         => null,
                'program_type'  => '-',  // not provided by API (for now)
                'permit_number' => '',   // not provided by API (for now)
                'institution'   => [
                    'institution_code' => $selectedInstCode,
                    'name'             => $instName ?? $selectedInstCode,
                    'type'             => '-', // not provided by API
                ],
            ];
        });

        return Inertia::render('programs/index', [
            'programs'         => $programs,
            'hei'              => $hei,
            'selectedInstCode' => $selectedInstCode,
        ]);
    }
}
