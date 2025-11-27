<?php

namespace App\Http\Controllers;

use App\Models\ProgramCatalog;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class ProgramCatalogController extends Controller
{
    /**
     * GET /programs/catalog
     * Show paginated unique program catalog with filters.
     */
    public function index(Request $request)
    {
        $q    = (string) $request->query('q', '');
        $type = (string) $request->query('type', '');

        $query = ProgramCatalog::query();

        if ($q !== '') {
            $query->where('program_name', 'like', '%' . $q . '%');
        }

        if ($type !== '') {
            $query->where('program_type', $type);
        }

        $programs = $query
            ->orderBy('program_name')
            ->paginate(50)
            ->withQueryString();

        return Inertia::render('programs/catalog', [
            'programs' => $programs->through(function (ProgramCatalog $p) {
                return [
                    'id'           => $p->id,
                    'program_name' => $p->program_name,
                    'program_type' => $p->program_type ?? 'Unknown',
                    'notes'        => $p->notes,
                ];
            }),
            'filters' => [
                'q'    => $q !== '' ? $q : null,
                'type' => $type !== '' ? $type : null,
            ],
        ]);
    }

    /**
     * PATCH /programs/catalog/{programCatalog}
     * Update board / non-board / unknown flag.
     * This is called via fetch() from the React page (optimistic update).
     */
    public function update(Request $request, ProgramCatalog $programCatalog)
    {
        $validated = $request->validate([
            'program_type' => [
                'required',
                Rule::in(['Board', 'Non-Board', 'Unknown']),
            ],
        ]);

        $programCatalog->update([
            'program_type' => $validated['program_type'],
        ]);

        // If called via our fetch() (Accept: application/json), return JSON.
        if ($request->expectsJson()) {
            return response()->json([
                'data' => [
                    'id'           => $programCatalog->id,
                    'program_type' => $programCatalog->program_type,
                ],
            ], 200);
        }

        // Fallback if someone hits this via a normal form.
        return back()->with('success', 'Program type updated.');
    }
}
