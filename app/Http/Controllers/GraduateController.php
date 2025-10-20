<?php

namespace App\Http\Controllers;

use App\Models\Graduate;
use Illuminate\Http\Request;
use Inertia\Inertia;

class GraduateController extends Controller
{
    public function index()
    {
        $graduates = Graduate::with(['program.institution', 'institution'])
            ->get()
            ->map(function ($graduate) {
                if ($graduate->program) {
                    return [
                        'id' => $graduate->id,
                        'student_id_number' => $graduate->student_id_number,
                        'date_of_birth' => $graduate->date_of_birth,
                        'last_name' => $graduate->last_name,
                        'first_name' => $graduate->first_name,
                        'middle_name' => $graduate->middle_name,
                        'extension_name' => $graduate->extension_name,
                        'sex' => $graduate->sex,
                        'year_graduated' => $graduate->date_graduated,
                        'program' => [
                            'program_name' => $graduate->program->program_name,
                            'major' => $graduate->program->major,
                            'program_type' => $graduate->program->program_type,
                            'permit_number' => $graduate->program->permit_number,
                            'institution' => [
                                'institution_code' => $graduate->program->institution->institution_code,
                                'name' => $graduate->program->institution->name,
                                'type' => $graduate->program->institution->type,
                            ],
                        ],
                        'so_number' => $graduate->so_number,
                        'lrn' => $graduate->lrn,
                        'philsys_id' => $graduate->philsys_id,
                    ];
                } else {
                    return [
                        'id' => $graduate->id,
                        'student_id_number' => $graduate->student_id_number,
                        'date_of_birth' => $graduate->date_of_birth,
                        'last_name' => $graduate->last_name,
                        'first_name' => $graduate->first_name,
                        'middle_name' => $graduate->middle_name,
                        'extension_name' => $graduate->extension_name,
                        'sex' => $graduate->sex,
                        'year_graduated' => $graduate->date_graduated,
                        'program' => [
                            'program_name' => $graduate->course_from_excel,
                            'major' => $graduate->major_from_excel,
                            'program_type' => 'Unknown',
                            'permit_number' => 'N/A',
                            'institution' => [
                                'institution_code' => $graduate->institution ? $graduate->institution->institution_code : 'N/A',
                                'name' => $graduate->institution ? $graduate->institution->name : 'Unknown Institution',
                                'type' => $graduate->institution ? $graduate->institution->type : 'Unknown',
                            ],
                        ],
                        'so_number' => $graduate->so_number,
                        'lrn' => $graduate->lrn,
                        'philsys_id' => $graduate->philsys_id,
                    ];
                }
            });

        return Inertia::render('graduates/index', [
            'graduates' => $graduates,
        ]);
    }
}
