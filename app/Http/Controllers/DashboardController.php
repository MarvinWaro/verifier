<?php

namespace App\Http\Controllers;

use App\Models\Graduate;
use App\Services\PortalService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
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

        // Count distinct programs from API-sourced data
        $totalPrograms = Graduate::distinct('course_from_excel')
            ->whereNotNull('course_from_excel')
            ->count('course_from_excel');

        // 2. Top Programs by Graduate Count
        $topPrograms = Graduate::select('course_from_excel', DB::raw('COUNT(*) as count'))
            ->whereNotNull('course_from_excel')
            ->groupBy('course_from_excel')
            ->orderByDesc('count')
            ->limit(10)
            ->get()
            ->map(function ($item) {
                return [
                    'program' => $item->course_from_excel,
                    'count' => $item->count,
                ];
            });

        // 3. Render View with Data
        return Inertia::render('dashboard', [
            'stats' => [
                'graduates' => $totalGraduates,
                'institutions' => $totalInstitutions,
                'programs' => $totalPrograms,
            ],
            'chartData' => [
                'topPrograms' => $topPrograms,
            ],
        ]);
    }

    /**
     * Search for graduates (AJAX endpoint for dashboard search)
     */
    public function searchGraduates(Request $request)
    {
        $query = $request->input('q', '');

        if (strlen($query) < 2) {
            return response()->json([]);
        }

        $results = Graduate::with(['institution'])
            ->where(function ($q) use ($query) {
                $q->where('first_name', 'like', "%{$query}%")
                    ->orWhere('last_name', 'like', "%{$query}%")
                    ->orWhere('so_number', 'like', "%{$query}%")
                    ->orWhere('course_from_excel', 'like', "%{$query}%");
            })
            ->limit(10)
            ->get()
            ->map(function ($grad) {
                return [
                    'id' => $grad->id,
                    'name' => $grad->first_name . ' ' . $grad->last_name,
                    'so_number' => $grad->so_number,
                    'program' => $grad->course_from_excel,
                    'institution' => $grad->institution?->name ?? 'N/A',
                    'year_graduated' => $grad->date_graduated,
                ];
            });

        return response()->json($results);
    }
}
