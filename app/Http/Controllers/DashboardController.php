<?php

namespace App\Http\Controllers;

use App\Models\Graduate;
use App\Services\PortalService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index(PortalService $portalService)
    {
        // 1. Fetch Key Metrics
        $totalGraduates = Graduate::count();

        // Fetch Institutions from API (Cached by Service)
        $institutions = $portalService->fetchAllHEI();
        $totalInstitutions = count($institutions);

        // Approximate Program count (Distinct courses from Excel imports)
        // Note: Once you provide the Institution/Program module, we can switch this to count real programs.
        $totalPrograms = Graduate::distinct('course_from_excel')->count('course_from_excel');

        // 2. Fetch Recent Graduates for the Activity Feed
        // We eagerly load relations, but fall back to string columns if relations are null
        $recentGraduates = Graduate::with(['institution', 'program'])
            ->latest()
            ->take(5)
            ->get()
            ->map(function ($grad) use ($institutions) {
                // Try to match API name using hei_uii
                $apiHei = collect($institutions)->firstWhere('instCode', $grad->hei_uii);

                return [
                    'id' => $grad->id,
                    'name' => $grad->first_name . ' ' . $grad->last_name,
                    'program' => $grad->program?->program_name ?? $grad->course_from_excel ?? 'N/A',
                    'school' => $apiHei['instName'] ?? $grad->institution?->name ?? 'Unknown HEI',
                    'initials' => substr($grad->first_name, 0, 1) . substr($grad->last_name, 0, 1),
                ];
            });

        // 3. Render View with Data
        return Inertia::render('dashboard', [
            'stats' => [
                'graduates' => $totalGraduates,
                'institutions' => $totalInstitutions,
                'programs' => $totalPrograms,
            ],
            'recentGraduates' => $recentGraduates,
        ]);
    }
}
