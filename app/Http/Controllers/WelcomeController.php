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
            'graduates' => Graduate::count(),
        ];

        return Inertia::render('welcome', [
            'stats' => $stats,
        ]);
    }

    public function searchInstitution(Request $request)
    {
        try {
            $search = $request->input('search', '');

            $institutions = Institution::query()
                ->where('institution_code', 'LIKE', "%{$search}%")
                ->orWhere('name', 'LIKE', "%{$search}%")
                ->with('programs')
                ->get();

            $result = [];
            foreach ($institutions as $institution) {
                $type = strtolower(trim($institution->type));

                // Determine institution type
                // Private = Private
                // SUCs/LUCs = Public
                $isPrivate = ($type === 'private');

                $programs = [];
                foreach ($institution->programs as $program) {
                    $graduatesCount = Graduate::where('program_id', $program->id)->count();

                    // Check if program has a permit number
                    $hasPermitNumber = !empty($program->permit_number);

                    // For PUBLIC institutions (SUCs/LUCs): show as COP
                    // For PRIVATE institutions: show as GR
                    $programs[] = [
                        'id' => $program->id,
                        'name' => $program->program_name,
                        'major' => $program->major,
                        'copNumber' => (!$isPrivate && $hasPermitNumber) ? $program->permit_number : null,
                        'grNumber' => ($isPrivate && $hasPermitNumber) ? $program->permit_number : null,
                        'graduates_count' => $graduatesCount,
                    ];
                }

                $result[] = [
                    'id' => $institution->id,
                    'code' => $institution->institution_code,
                    'name' => $institution->name,
                    'type' => $isPrivate ? 'private' : 'public',
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
            $isPrivate = ($type === 'private');
            $hasPermitNumber = !empty($program->permit_number);

            $graduatesList = [];
            foreach ($graduates as $graduate) {
                $graduatesList[] = [
                    'id' => $graduate->id,
                    'name' => trim("{$graduate->first_name} {$graduate->middle_name} {$graduate->last_name} {$graduate->extension_name}"),
                    'yearGraduated' => $graduate->date_graduated,
                    'studentId' => $graduate->student_id_number ?? 'N/A',
                    'eligibility' => 'Eligible',
                    'firstName' => $graduate->first_name,
                    'lastName' => $graduate->last_name,
                    'middleName' => $graduate->middle_name,
                    'extensionName' => $graduate->extension_name,
                    'dateOfBirth' => $graduate->date_of_birth,
                    'sex' => $graduate->sex,
                    'soNumber' => $graduate->so_number,
                    'lrn' => $graduate->lrn,
                    'philsysId' => $graduate->philsys_id,
                ];
            }

            return response()->json([
                'program' => [
                    'id' => $program->id,
                    'name' => $program->program_name,
                    'major' => $program->major,
                    'copNumber' => (!$isPrivate && $hasPermitNumber) ? $program->permit_number : null,
                    'grNumber' => ($isPrivate && $hasPermitNumber) ? $program->permit_number : null,
                    'institution' => [
                        'code' => $program->institution->institution_code,
                        'name' => $program->institution->name,
                        'type' => $isPrivate ? 'private' : 'public',
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

    public function searchStudent(Request $request)
    {
        try {
            $filters = $request->only([
                'lastName',
                'firstName',
                'middleName',
                'extensionName',
                'birthdate',
                'yearGraduated'
            ]);

            $query = Graduate::query();

            if (!empty($filters['lastName'])) {
                $query->where('last_name', 'LIKE', "%{$filters['lastName']}%");
            }

            if (!empty($filters['firstName'])) {
                $query->where('first_name', 'LIKE', "%{$filters['firstName']}%");
            }

            if (!empty($filters['middleName'])) {
                $query->where('middle_name', 'LIKE', "%{$filters['middleName']}%");
            }

            if (!empty($filters['extensionName'])) {
                $query->where('extension_name', 'LIKE', "%{$filters['extensionName']}%");
            }

            if (!empty($filters['birthdate'])) {
                $query->where('date_of_birth', $filters['birthdate']);
            }

            if (!empty($filters['yearGraduated'])) {
                $query->where('date_graduated', 'LIKE', "%{$filters['yearGraduated']}%");
            }

            $graduates = $query->get();

            $result = [];
            foreach ($graduates as $graduate) {
                $program = $graduate->program;
                $institution = $program ? $program->institution : $graduate->institution;

                $institutionType = 'private';
                if ($institution) {
                    $type = strtolower(trim($institution->type));
                    $institutionType = in_array($type, ['sucs', 'lucs', 'suc', 'luc', 'state', 'public']) ? 'public' : 'private';
                }

                $result[] = [
                    'id' => $graduate->id,
                    'name' => trim("{$graduate->first_name} {$graduate->middle_name} {$graduate->last_name} {$graduate->extension_name}"),
                    'firstName' => $graduate->first_name,
                    'lastName' => $graduate->last_name,
                    'middleName' => $graduate->middle_name,
                    'extensionName' => $graduate->extension_name,
                    'studentId' => $graduate->student_id_number ?? 'N/A',
                    'yearGraduated' => $graduate->date_graduated,
                    'dateOfBirth' => $graduate->date_of_birth,
                    'sex' => $graduate->sex,
                    'eligibility' => $graduate->program_id ? 'Eligible' : 'Pending Verification',
                    'soNumber' => $graduate->so_number,
                    'lrn' => $graduate->lrn,
                    'philsysId' => $graduate->philsys_id,
                    'program' => $program ? [
                        'id' => $program->id,
                        'name' => $program->program_name,
                        'major' => $program->major,
                        'copNumber' => ($institutionType === 'public' && $program->program_type === 'Board') ? $program->permit_number : null,
                        'grNumber' => ($institutionType === 'private' && $program->program_type === 'Board') ? $program->permit_number : null,
                    ] : [
                        'name' => $graduate->course_from_excel ?? 'N/A',
                        'major' => $graduate->major_from_excel,
                    ],
                    'institution' => $institution ? [
                        'code' => $institution->institution_code,
                        'name' => $institution->name,
                        'type' => $institutionType,
                    ] : null,
                ];
            }

            return response()->json([
                'graduates' => $result
            ]);

        } catch (\Exception $e) {
            \Log::error('Search student error: ' . $e->getMessage());

            return response()->json([
                'error' => true,
                'message' => $e->getMessage()
            ], 500);
        }
    }
}
