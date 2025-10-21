<?php

namespace App\Http\Controllers;

use App\Models\Program;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProgramController extends Controller
{
    public function index()
    {
        $programs = Program::with('institution')->get()->map(function ($program) {
            return [
                'id' => $program->id,
                'program_name' => $program->program_name,
                'major' => $program->major,
                'program_type' => $program->program_type,
                'permit_number' => $program->permit_number,
                'institution' => [
                    'institution_code' => $program->institution->institution_code,
                    'name' => $program->institution->name,
                    'type' => $program->institution->type,
                ],
            ];
        });

        return Inertia::render('programs/index', [
            'programs' => $programs,
        ]);
    }
}
