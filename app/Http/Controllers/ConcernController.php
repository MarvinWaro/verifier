<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Concern;

class ConcernController extends Controller
{
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
