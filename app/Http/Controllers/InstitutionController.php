<?php

namespace App\Http\Controllers;

use App\Models\Institution;
use Illuminate\Http\Request;
use Inertia\Inertia;

class InstitutionController extends Controller
{
    public function index()
    {
        $institutions = Institution::withCount('programs')->get()->map(function ($institution) {
            return [
                'id' => $institution->id,
                'institution_code' => $institution->institution_code,
                'name' => $institution->name,
                'type' => $institution->type,
                'programs_count' => $institution->programs_count,
            ];
        });

        return Inertia::render('institution/index', [
            'institutions' => $institutions,
        ]);
    }
}
