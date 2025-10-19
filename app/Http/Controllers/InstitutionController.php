<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class InstitutionController extends Controller
{
    public function index()
    {
        // For now, return dummy data
        // Later we'll replace this with: Institution::with('programs')->get()
        $institutions = [
            [
                'id' => 1,
                'institution_code' => '12120',
                'name' => 'ACLC COLLEGE OF MARBEL',
                'type' => 'Private',
                'programs_count' => 5,
            ],
            [
                'id' => 2,
                'institution_code' => '12150',
                'name' => 'NOTRE DAME OF MARBEL UNIVERSITY',
                'type' => 'Private',
                'programs_count' => 12,
            ],
            [
                'id' => 3,
                'institution_code' => '12169',
                'name' => 'MALAPATAN COLLEGE OF SCIENCE AND TECHNOLOGY',
                'type' => 'LUCs',
                'programs_count' => 8,
            ],
        ];

        return Inertia::render('institution/index', [
            'institutions' => $institutions,
        ]);
    }
}
