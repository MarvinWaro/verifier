<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class GraduateController extends Controller
{
    public function index()
    {
        // For now, return dummy data
        // Later we'll replace this with: Graduate::with('program.institution')->get()
        $graduates = [
            [
                'id' => 1,
                'last_name' => 'DELA CRUZ',
                'first_name' => 'JUAN',
                'middle_name' => 'SANTOS',
                'extension_name' => null,
                'year_graduated' => '2023',
                'program' => [
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
                'so_number' => 'SO-2023-001',
                'lrn' => null,
                'philsys_id' => null,
            ],
            [
                'id' => 2,
                'last_name' => 'SANTOS',
                'first_name' => 'MARIA',
                'middle_name' => 'REYES',
                'extension_name' => null,
                'year_graduated' => '2024',
                'program' => [
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
                'so_number' => 'SO-2024-045',
                'lrn' => null,
                'philsys_id' => null,
            ],
            [
                'id' => 3,
                'last_name' => 'REYES',
                'first_name' => 'PEDRO',
                'middle_name' => 'GARCIA',
                'extension_name' => 'JR.',
                'year_graduated' => '2023',
                'program' => [
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
                'so_number' => 'SO-2023-089',
                'lrn' => null,
                'philsys_id' => null,
            ],
            [
                'id' => 4,
                'last_name' => 'GARCIA',
                'first_name' => 'ANA',
                'middle_name' => 'CRUZ',
                'extension_name' => null,
                'year_graduated' => '2024',
                'program' => [
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
                'so_number' => null,  // LUCs - no SO number
                'lrn' => null,
                'philsys_id' => null,
            ],
            [
                'id' => 5,
                'last_name' => 'RIVERA',
                'first_name' => 'JOSE',
                'middle_name' => 'MARTINEZ',
                'extension_name' => null,
                'year_graduated' => '2022',
                'program' => [
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
                'so_number' => 'SO-2022-156',
                'lrn' => null,
                'philsys_id' => null,
            ],
        ];

        return Inertia::render('graduates/index', [
            'graduates' => $graduates,
        ]);
    }
}
