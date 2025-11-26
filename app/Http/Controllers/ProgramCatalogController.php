<?php

namespace App\Http\Controllers;

use App\Models\ProgramCatalog;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProgramCatalogController extends Controller
{
    public function index(Request $request)
    {
        $search     = $request->query('q');
        $typeFilter = $request->query('type');

        $query = ProgramCatalog::query();

        if ($search) {
            $q = trim($search);
            $query->where('program_name', 'LIKE', "%{$q}%");
        }

        if ($typeFilter && in_array($typeFilter, ['Board', 'Non-Board', 'Unknown'], true)) {
            $query->where('program_type', $typeFilter);
        }

        $programs = $query
            ->orderBy('program_name')
            ->paginate(50)
            ->withQueryString();

        return Inertia::render('programs/catalog', [
            'programs' => $programs,
            'filters'  => [
                'q'    => $search ?? '',
                'type' => $typeFilter ?? '',
            ],
        ]);
    }

    public function update(ProgramCatalog $catalog, Request $request)
    {
        $data = $request->validate([
            'program_type' => ['required', 'in:Board,Non-Board,Unknown'],
        ]);

        $catalog->update($data);

        if ($request->wantsJson()) {
            return response()->json(['success' => true]);
        }

        return back();
    }
}
