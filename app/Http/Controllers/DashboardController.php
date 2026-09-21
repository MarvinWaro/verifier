<?php

namespace App\Http\Controllers;

use App\Models\Graduate;
use App\Services\PortalService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index(Request $request, PortalService $portalService, \App\Services\DashboardAnalytics $analytics)
    {
        $filters = $request->validate([
            'year' => ['nullable', 'integer', 'between:1000,9999'],
            'institution' => ['nullable', 'string', 'max:100', \Illuminate\Validation\Rule::exists('graduates', 'hei_uii')],
        ]);
        $year = isset($filters['year']) ? (int) $filters['year'] : null;
        $institution = $filters['institution'] ?? null;
        $snapshot = $portalService->schoolSnapshot();

        return Inertia::render('dashboard', $analytics->summarize($year, $institution, $snapshot['data']) + [
            'filters' => ['year' => $year, 'institution' => $institution],
            'portal' => [
                'count' => $snapshot['last_fetched_at'] ? count($snapshot['data']) : null,
                'stale' => $snapshot['stale'],
                'lastFetchedAt' => $snapshot['last_fetched_at'],
            ],
        ]);
    }

    /**
     * Search for graduates (AJAX endpoint for dashboard search)
     */
    public function searchGraduates(Request $request, PortalService $portalService)
    {
        $query = $request->input('q', '');

        if (strlen($query) < 2) {
            return response()->json([]);
        }

        // Get all institutions from Portal API for name lookup
        $institutions = collect($portalService->fetchAllHEI())
            ->keyBy('instCode');

        $results = Graduate::query()
            ->where(function ($q) use ($query) {
                $q->where('first_name', 'like', "%{$query}%")
                    ->orWhere('last_name', 'like', "%{$query}%")
                    ->orWhere('so_number', 'like', "%{$query}%")
                    ->orWhere('course_from_excel', 'like', "%{$query}%");
            })
            ->limit(10)
            ->get()
            ->map(function ($grad) use ($institutions) {
                $institutionData = $institutions->get($grad->hei_uii);

                return [
                    'id' => $grad->id,
                    'name' => $grad->first_name.' '.$grad->last_name,
                    'so_number' => $grad->so_number,
                    'program' => $grad->course_from_excel,
                    'institution' => $institutionData['instName'] ?? 'Unknown Institution',
                    'year_graduated' => $grad->date_graduated,
                ];
            });

        return response()->json($results);
    }

    /**
     * Get full graduate details (AJAX endpoint)
     */
    public function getGraduateDetails(Request $request, $id, PortalService $portalService)
    {
        $graduate = Graduate::with(['program'])
            ->findOrFail($id);

        // Get all institutions from Portal API for name lookup
        $institutions = collect($portalService->fetchAllHEI())
            ->keyBy('instCode');

        $institutionData = $institutions->get($graduate->hei_uii);

        return response()->json([
            'id' => $graduate->id,
            'first_name' => $graduate->first_name,
            'last_name' => $graduate->last_name,
            'middle_name' => $graduate->middle_name,
            'extension_name' => $graduate->extension_name,
            'full_name' => trim($graduate->first_name.' '.
                               ($graduate->middle_name ? $graduate->middle_name.' ' : '').
                               $graduate->last_name.
                               ($graduate->extension_name ? ' '.$graduate->extension_name : '')),
            'sex' => $graduate->sex,
            'date_of_birth' => $graduate->date_of_birth,
            'so_number' => $graduate->so_number,
            'student_id_number' => $graduate->student_id_number,
            'hei_uii' => $graduate->hei_uii,
            'institution_name' => $institutionData['instName'] ?? 'Unknown Institution',
            'institution_code' => $graduate->hei_uii,
            'institution_sector' => $institutionData['ownershipSector'] ?? null,
            'institution_type' => $institutionData['ownershipHei_type'] ?? null,
            'program_name' => $graduate->program?->program_name ?? $graduate->course_from_excel ?? 'N/A',
            'program_type' => $graduate->program?->program_type,
            'major' => $graduate->major_from_excel ?? $graduate->program?->major,
            'date_graduated' => $graduate->date_graduated,
            'academic_year' => $graduate->academic_year,
            'created_at' => $graduate->created_at?->format('Y-m-d H:i:s'),
            'updated_at' => $graduate->updated_at?->format('Y-m-d H:i:s'),
        ]);
    }
}
