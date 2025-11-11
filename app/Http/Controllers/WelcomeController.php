<?php

namespace App\Http\Controllers;

use App\Models\Institution;
use App\Models\Program;
use App\Models\Graduate;
use Illuminate\Http\Request;
use Inertia\Inertia;

class WelcomeController extends Controller
{
    public function index()
    {
        $stats = [
            'institutions' => Institution::count(),
            'programs' => Program::count(),
            // Only count graduates with Board programs as eligible
            'graduates' => Graduate::whereHas('program', function($query) {
                $query->where('program_type', 'Board');
            })->count(),
        ];

        return Inertia::render('welcome', [
            'stats' => $stats,
        ]);
    }

    public function searchInstitution(Request $request)
    {
        try {
            $search = $request->input('search', '');

            // If search is empty, return all institutions
            if (empty($search)) {
                $institutions = Institution::with('programs')->get();
            } else {
                // Use a closure to group OR conditions properly
                $institutions = Institution::query()
                    ->where(function($query) use ($search) {
                        $query->where('institution_code', 'LIKE', "%{$search}%")
                            ->orWhere('name', 'LIKE', "%{$search}%");
                    })
                    ->with('programs')
                    ->get();
            }

            $result = [];
            foreach ($institutions as $institution) {
                $type = strtolower(trim($institution->type));

                // Determine if institution is private or public
                // Public institutions include: SUCs, LUCs, State, Public
                $isPublic = in_array($type, ['sucs', 'lucs', 'suc', 'luc', 'state', 'public']);

                $programs = [];
                foreach ($institution->programs as $program) {
                    $graduatesCount = Graduate::where('program_id', $program->id)->count();
                    $hasPermitNumber = !empty($program->permit_number);

                    // For display: if public show as copNumber, if private show as grNumber
                    $programs[] = [
                        'id' => $program->id,
                        'name' => $program->program_name,
                        'major' => $program->major,
                        'copNumber' => ($isPublic && $hasPermitNumber) ? $program->permit_number : null,
                        'grNumber' => (!$isPublic && $hasPermitNumber) ? $program->permit_number : null,
                        'graduates_count' => $graduatesCount,
                        'program_type' => $program->program_type,
                    ];
                }

                $result[] = [
                    'id' => $institution->id,
                    'code' => $institution->institution_code,
                    'name' => $institution->name,
                    'type' => $isPublic ? 'public' : 'private',
                    'programs' => $programs,
                ];
            }

            return response()->json([
                'institutions' => $result
            ]);

        } catch (\Exception $e) {
            \Log::error('Institution search error: ' . $e->getMessage());

            return response()->json([
                'error' => true,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function getProgram(Request $request, $programId)
    {
        try {
            $program = Program::with('institution')->findOrFail($programId);
            $graduates = Graduate::where('program_id', $programId)->get();

            $type = strtolower(trim($program->institution->type));

            // Determine if institution is private or public
            $isPublic = in_array($type, ['sucs', 'lucs', 'suc', 'luc', 'state', 'public']);

            $hasPermitNumber = !empty($program->permit_number);
            $isBoard = ($program->program_type === 'Board');

            $graduatesList = [];
            foreach ($graduates as $graduate) {
                // Determine eligibility: only Board programs are eligible
                $eligibility = $isBoard ? 'Eligible' : 'Not Eligible - Non-Board Program';

                $graduatesList[] = [
                    'id' => $graduate->id,
                    'name' => trim("{$graduate->first_name} {$graduate->middle_name} {$graduate->last_name} {$graduate->extension_name}"),
                    'yearGraduated' => $graduate->date_graduated,
                    'studentId' => $graduate->student_id_number ?? 'N/A',
                    'eligibility' => $eligibility,
                    'firstName' => $graduate->first_name,
                    'lastName' => $graduate->last_name,
                    'middleName' => $graduate->middle_name,
                    'extensionName' => $graduate->extension_name,
                    'dateOfBirth' => $graduate->date_of_birth,
                    'sex' => $graduate->sex,
                    'soNumber' => $graduate->so_number,
                    'lrn' => $graduate->lrn,
                    'philsysId' => $graduate->philsys_id,
                    // IMPORTANT: Include program and institution data for each graduate
                    'program' => [
                        'id' => $program->id,
                        'name' => $program->program_name,
                        'major' => $program->major,
                        'copNumber' => ($isPublic && $hasPermitNumber) ? $program->permit_number : null,
                        'grNumber' => (!$isPublic && $hasPermitNumber) ? $program->permit_number : null,
                    ],
                    'institution' => [
                        'code' => $program->institution->institution_code,
                        'name' => $program->institution->name,
                        'type' => $isPublic ? 'public' : 'private',
                    ],
                ];
            }

            return response()->json([
                'program' => [
                    'id' => $program->id,
                    'name' => $program->program_name,
                    'major' => $program->major,
                    'copNumber' => ($isPublic && $hasPermitNumber) ? $program->permit_number : null,
                    'grNumber' => (!$isPublic && $hasPermitNumber) ? $program->permit_number : null,
                    'program_type' => $program->program_type,
                    'institution' => [
                        'code' => $program->institution->institution_code,
                        'name' => $program->institution->name,
                        'type' => $isPublic ? 'public' : 'private',
                    ],
                    'graduates' => $graduatesList,
                ]
            ]);

        } catch (\Exception $e) {
            \Log::error('Get program error: ' . $e->getMessage());

            return response()->json([
                'error' => true,
                'message' => $e->getMessage()
            ], 500);
        }
    }
}
