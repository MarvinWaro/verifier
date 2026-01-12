<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Concern;
use Inertia\Inertia;

class ConcernController extends Controller
{
    /**
     * Display a listing of the concerns (Admin).
     */
    public function index(Request $request)
    {
        $query = Concern::latest();

        // Handle Search
        if ($search = $request->input('q')) {
            $query->where(function ($q) use ($search) {
                $q->where('school', 'like', "%{$search}%")
                  ->orWhere('program', 'like', "%{$search}%")
                  ->orWhere('concern', 'like', "%{$search}%");
            });
        }

        // Paginate & Map
        $concerns = $query->paginate(10)
            ->through(fn ($concern) => [
                'id'         => $concern->id,
                'school'     => $concern->school,
                'program'    => $concern->program,
                'concern'    => $concern->concern,
                'created_at' => $concern->created_at->format('M d, Y h:i A'),
            ])
            ->withQueryString();

        return Inertia::render('concerns/index', [
            'concerns' => $concerns,
            'filters'  => $request->only(['q']),
        ]);
    }

    /**
     * Store a new concern (Public API).
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'school'  => 'required|string|max:255',
            'program' => 'required|string|max:255',
            'concern' => 'required|string',
        ]);

        Concern::create($validated);

        return response()->json(['message' => 'Concern logged successfully']);
    }
}
