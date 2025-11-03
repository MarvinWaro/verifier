<?php

namespace App\Http\Controllers;

use App\Models\Institution;
use Illuminate\Http\Request;
use Inertia\Inertia;

class InstitutionController extends Controller
{
    public function index()
    {
        $institutions = Institution::with('programs')->withCount('programs')->get()->map(function ($institution) {
            return [
                'id' => $institution->id,
                'institution_code' => $institution->institution_code,
                'name' => $institution->name,
                'type' => $institution->type,
                'programs_count' => $institution->programs_count,
                'programs' => $institution->programs->map(function ($program) {
                    return [
                        'id' => $program->id,
                        'program_name' => $program->program_name,
                        'major' => $program->major,
                        'program_type' => $program->program_type,
                        'permit_number' => $program->permit_number,
                    ];
                }),
            ];
        });

        return Inertia::render('institution/index', [
            'institutions' => $institutions,
        ]);
    }
}
