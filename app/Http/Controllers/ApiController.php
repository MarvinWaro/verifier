<?php

namespace App\Http\Controllers;

use App\Services\PortalService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ApiController extends Controller
{
    /**
     * GET /api/hei
     * Returns all HEIs (instCode + instName)
     */
    public function hei(PortalService $portal): JsonResponse
    {
        $data = $portal->fetchAllHEI();

        return response()->json([
            'data' => $data, // [{ instCode, instName }]
        ]);
    }

    /**
     * GET /api/hei/{instCode}/programs
     * Returns unique program names for the institution
     */
    public function programs(string $instCode, PortalService $portal): JsonResponse
    {
        $instCode = trim($instCode);
        if ($instCode === '') {
            return response()->json(['message' => 'instCode is required'], 422);
        }

        $programs = $portal->fetchPrograms($instCode);

        return response()->json([
            'instCode' => $instCode,
            'data' => $programs, // [ "BSIT", "BSBA", ... ]
        ]);
    }

    /**
     * GET /api/hei/{instCode}/majors?program=BSIT
     * Returns majors for a specific program in the institution
     */
    public function majors(string $instCode, Request $request, PortalService $portal): JsonResponse
    {
        $validated = $request->validate([
            'program' => 'required|string',
        ]);

        $instCode = trim($instCode);
        $programName = trim($validated['program']);

        $majors = $portal->fetchMajors($instCode, $programName);

        return response()->json([
            'instCode' => $instCode,
            'program' => $programName,
            'data' => $majors, // [ "Network Tech", "Data Science", ... ]
        ]);
    }
}
