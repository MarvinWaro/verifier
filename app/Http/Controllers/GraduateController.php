<?php

namespace App\Http\Controllers;

use App\Models\Graduate;
use App\Services\PortalService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class GraduateController extends Controller
{
    public function index(PortalService $portalService)
    {
        // Get all HEIs from the Portal once (cached)
        $heiFromPortal = collect($portalService->fetchAllHEI())->keyBy('instCode');

        $graduates = Graduate::with(['program.institution', 'institution'])
            ->get()
            ->map(function ($graduate) use ($heiFromPortal) {
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

                if ($graduate->program) {
                    $programData = [
                        'program_name' => $graduate->program->program_name,
                        'major'        => $graduate->program->major,
                        'program_type' => $graduate->program->program_type ?? 'Unknown',
                        'permit_number'=> $graduate->program->permit_number,
                        'institution'  => [
                            'institution_code' => $institutionCode,
                            'name'             => $institutionName,
                            'type'             => $institutionType,
                        ],
                    ];
                } else {
                    // Fallback: use Excel program info
                    $programData = [
                        'program_name' => $graduate->course_from_excel,
                        'major'        => $graduate->major_from_excel,
                        'program_type' => 'Unknown',
                        'permit_number'=> 'N/A',
                        'institution'  => [
                            'institution_code' => $institutionCode,
                            'name'             => $institutionName,
                            'type'             => $institutionType,
                        ],
                    ];
                }

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

        $graduate->last_name      = $validated['last_name'];
        $graduate->first_name     = $validated['first_name'];
        $graduate->middle_name    = $validated['middle_name'] ?? null;
        $graduate->extension_name = $validated['extension_name'] ?? null;
        $graduate->sex            = $validated['sex'] ?? null;
        $graduate->date_graduated = $validated['date_graduated'] ?: $graduate->date_graduated;
        $graduate->academic_year  = $validated['academic_year'] ?? null;
        $graduate->so_number      = $validated['so_number'] ?? null;

        // Update the Excel-backed program fields
        $graduate->course_from_excel = $validated['program_name'];
        $graduate->major_from_excel  = $validated['major'] ?? null;

        $graduate->save();

        return response()->json([
            'success' => true,
            'message' => 'Graduate updated successfully.',
        ]);
    }

    public function destroy(Graduate $graduate)
    {
        $graduate->delete();

        return response()->json([
            'success' => true,
            'message' => 'Graduate removed successfully.',
        ]);
    }
}
