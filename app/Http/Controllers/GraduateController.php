<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Illuminate\Http\Request;

class GraduateController extends Controller
{
    public function index(Request $request)
    {
        // Placeholder view: graduates module is not yet active.
        // We send an empty array for now; the React page just shows the "coming soon" image.
        return Inertia::render('graduates/index', [
            'graduates' => [],
        ]);
    }
}
