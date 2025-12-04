<?php

namespace App\Http\Controllers;

use App\Models\Graduate;
use App\Models\ProgramCatalog;
use App\Models\ActivityLog;
use App\Services\PortalService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class GraduateController extends Controller
{
    /**
     * List graduates (Inertia page).
     * Combines:
     *  - local graduates table
     *  - HEI metadata from CHED portal (via PortalService)
     *  - program type from program_catalogs
     */
    public function index(PortalService $portalService)
    {
        // Get all HEIs from the Portal once (cached)
        $heiFromPortal = collect($portalService->fetchAllHEI())->keyBy('instCode');

        $graduates = Graduate::with(['program.institution', 'institution'])
            ->orderBy('last_name')
            ->paginate(25)                 // 👈 25 per page
            ->through(function (Graduate $graduate) use ($heiFromPortal) {
                $portalHei = $graduate->hei_uii
                    ? $heiFromPortal->get($graduate->hei_uii)
                    : null;

                // Institution display data (prefer Portal)
                $institutionCode = $graduate->program?->institution?->institution_code
                    ?? $graduate->institution?->institution_code
                    ?? $graduate->hei_uii
                    ?? 'N/A';

                $institutionName = $portalHei['instName'] ?? (
                    $graduate->program?->institution?->name
                    ?? $graduate->institution?->name
                    ?? 'Unknown Institution'
                );

                $institutionType = $portalHei['instOwnership'] ?? (
                    $graduate->program?->institution?->type
                    ?? $graduate->institution?->type
                    ?? 'Unknown'
                );

                // Base program fields (from relation if present; otherwise from Excel)
                $programName = $graduate->program?->program_name ?? $graduate->course_from_excel;
                $major       = $graduate->program?->major ?? $graduate->major_from_excel;

                // Look up program type from ProgramCatalog using normalized name
                $programType = 'Unknown';
                if ($programName) {
                    $normalized = ProgramCatalog::normalizeName($programName);
                    $catalog    = ProgramCatalog::where('normalized_name', $normalized)->first();

                    if ($catalog) {
                        $programType = $catalog->program_type ?? 'Unknown';
                    }
                }

                $programData = [
                    'program_name'  => $programName,
                    'major'         => $major,
                    'program_type'  => $programType,
                    'permit_number' => $graduate->program?->permit_number,
                    'institution'   => [
                        'institution_code' => $institutionCode,
                        'name'             => $institutionName,
                        'type'             => $institutionType,
                    ],
                ];

                return [
                    'id'                => $graduate->id,
                    'student_id_number' => $graduate->student_id_number,
                    'date_of_birth'     => $graduate->date_of_birth,
                    'last_name'         => $graduate->last_name,
                    'first_name'        => $graduate->first_name,
                    'middle_name'       => $graduate->middle_name,
                    'extension_name'    => $graduate->extension_name,
                    'sex'               => $graduate->sex,
                    'year_graduated'    => $graduate->date_graduated,
                    'academic_year'     => $graduate->academic_year,
                    'hei_uii'           => $graduate->hei_uii,
                    'program'           => $programData,
                    'so_number'         => $graduate->so_number,
                ];
            });

        return Inertia::render('graduates/index', [
            'graduates' => $graduates,
        ]);
    }

    /**
     * Update a graduate (called by the edit dialog).
     * Returns JSON only.
     */
    public function update(Request $request, Graduate $graduate)
    {
        $validated = $request->validate([
            'last_name'      => 'required|string|max:255',
            'first_name'     => 'required|string|max:255',
            'middle_name'    => 'nullable|string|max:255',
            'extension_name' => 'nullable|string|max:255',
            'sex'            => 'nullable|in:MALE,FEMALE',
            'date_graduated' => 'nullable|string|max:20',
            'academic_year'  => 'nullable|string|max:20',
            'so_number'      => 'nullable|string|max:255',
            'program_name'   => 'required|string|max:500',
            'major'          => 'nullable|string|max:500',
        ]);

        // Snapshot BEFORE for logging
        $before = $graduate->only([
            'last_name',
            'first_name',
            'middle_name',
            'extension_name',
            'sex',
            'date_graduated',
            'academic_year',
            'so_number',
            'course_from_excel',
            'major_from_excel',
        ]);

        // --- Update main fields ---
        $graduate->last_name      = $validated['last_name'];
        $graduate->first_name     = $validated['first_name'];
        $graduate->middle_name    = $validated['middle_name'] ?? null;
        $graduate->extension_name = $validated['extension_name'] ?? null;
        $graduate->sex            = $validated['sex'] ?? null;
        $graduate->date_graduated = $validated['date_graduated'] ?: $graduate->date_graduated;
        $graduate->academic_year  = $validated['academic_year'] ?? null;
        $graduate->so_number      = $validated['so_number'] ?? null;

        // Excel-backed program fields (for reference / ProgramCatalog matching)
        $graduate->course_from_excel = $validated['program_name'];
        $graduate->major_from_excel  = $validated['major'] ?? null;

        $graduate->save();

        // --- Log the edit (this is where the error came from before) ---
        ActivityLog::create([
            'user_id'      => $request->user()?->id,
            'action'       => 'graduate_update',
            'subject_type' => Graduate::class,
            'subject_id'   => $graduate->id,
            'summary'      => sprintf(
                'Updated graduate %s %s (SO: %s)',
                $graduate->first_name,
                $graduate->last_name,
                $graduate->so_number ?? 'N/A'
            ),
            'properties'   => [
                'graduate_id' => $graduate->id,
                'so_number'   => $graduate->so_number,
                'before'      => $before,
                'after'       => [
                    'last_name'         => $graduate->last_name,
                    'first_name'        => $graduate->first_name,
                    'middle_name'       => $graduate->middle_name,
                    'extension_name'    => $graduate->extension_name,
                    'sex'               => $graduate->sex,
                    'date_graduated'    => $graduate->date_graduated,
                    'academic_year'     => $graduate->academic_year,
                    'so_number'         => $graduate->so_number,
                    'course_from_excel' => $graduate->course_from_excel,
                    'major_from_excel'  => $graduate->major_from_excel,
                ],
            ],
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Graduate updated successfully.',
        ]);
    }

    /**
     * Delete a graduate record.
     */
    public function destroy(Request $request, Graduate $graduate)
    {
        $id       = $graduate->id;
        $soNumber = $graduate->so_number;
        $name     = trim($graduate->first_name . ' ' . $graduate->last_name);

        $graduate->delete();

        ActivityLog::create([
            'user_id'      => $request->user()?->id,
            'action'       => 'graduate_delete',
            'subject_type' => Graduate::class,
            'subject_id'   => $id,
            'summary'      => sprintf(
                'Deleted graduate %s (SO: %s)',
                $name !== '' ? $name : "ID {$id}",
                $soNumber ?? 'N/A'
            ),
            'properties'   => [
                'graduate_id' => $id,
                'so_number'   => $soNumber,
            ],
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Graduate removed successfully.',
        ]);
    }
}
