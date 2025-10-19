<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class ProgramController extends Controller
{
    public function index()
    {
        // For now, return dummy data
        // Later we'll replace this with: Program::with('institution')->get()
        $programs = [
            [
                'id' => 1,
                'program_name' => 'BACHELOR OF SCIENCE IN BUSINESS ADMINISTRATION',
                'major' => 'HUMAN RESOURCE DEVELOPMENT MANAGEMENT',
                'program_type' => 'Non-Board',
                'permit_number' => 'GR035-2012',
                'institution' => [
                    'institution_code' => '12120',
                    'name' => 'ACLC COLLEGE OF MARBEL',
                    'type' => 'Private',
                ],
            ],
            [
                'id' => 2,
                'program_name' => 'BACHELOR OF SCIENCE IN COMPUTER SCIENCE',
                'major' => null,
                'program_type' => 'Non-Board',
                'permit_number' => 'GR048-2011',
                'institution' => [
                    'institution_code' => '12120',
                    'name' => 'ACLC COLLEGE OF MARBEL',
                    'type' => 'Private',
                ],
            ],
            [
                'id' => 3,
                'program_name' => 'BACHELOR OF SCIENCE IN INFORMATION SYSTEMS',
                'major' => null,
                'program_type' => 'Non-Board',
                'permit_number' => 'GR050-2011',
                'institution' => [
                    'institution_code' => '12120',
                    'name' => 'ACLC COLLEGE OF MARBEL',
                    'type' => 'Private',
                ],
            ],
            [
                'id' => 4,
                'program_name' => 'BACHELOR OF SCIENCE IN NURSING',
                'major' => null,
                'program_type' => 'Board',
                'permit_number' => 'COP045-2010',
                'institution' => [
                    'institution_code' => '12150',
                    'name' => 'NOTRE DAME OF MARBEL UNIVERSITY',
                    'type' => 'Private',
                ],
            ],
            [
                'id' => 5,
                'program_name' => 'BACHELOR OF SCIENCE IN INFORMATION SYSTEMS',
                'major' => null,
                'program_type' => 'Non-Board',
                'permit_number' => 'RRPA No. 004, Series of 2025',
                'institution' => [
                    'institution_code' => '12169',
                    'name' => 'MALAPATAN COLLEGE OF SCIENCE AND TECHNOLOGY',
                    'type' => 'LUCs',
                ],
            ],
        ];

        return Inertia::render('programs/index', [
            'programs' => $programs,
        ]);
    }
}
