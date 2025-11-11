<?php

namespace App\Http\Controllers;

use App\Services\PortalService;
use Inertia\Inertia;

class InstitutionController extends Controller
{
    public function index(PortalService $portal)
    {
        // API returns: [ ['instCode' => 'X', 'instName' => 'Y'], ... ]
        $hei = $portal->fetchAllHEI();

        // Map the API data to your current front-end shape
        $institutions = collect($hei)->values()->map(function ($row, $i) {
            return [
                'id' => $i + 1,                    // synthetic id just for React keys
                'institution_code' => $row['instCode'],
                'name' => $row['instName'],
                'type' => '-',                     // API doesn't provide; placeholder
                'programs_count' => 0,             // not fetching programs here
                'programs' => [],                  // empty list for now
            ];
        });

        return Inertia::render('institution/index', [
            'institutions' => $institutions,
        ]);
    }
}
