<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class ImportController extends Controller
{
    public function index()
    {
        // Show the import page
        return Inertia::render('import/index');
    }

    public function importInstitutions(Request $request)
    {
        $request->validate([
            'file' => 'required|mimes:xlsx,xls|max:10240', // Max 10MB
        ]);

        try {
            // For now, just return success
            // Later we'll add the actual import logic with PhpSpreadsheet

            return response()->json([
                'success' => true,
                'message' => 'Import successful! This is a test response.',
                'data' => [
                    'institutions' => 8,
                    'programs' => 74,
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Import failed: ' . $e->getMessage()
            ], 500);
        }
    }

    public function clearInstitutions()
    {
        try {
            // For now, just return success
            // Later we'll add: Program::truncate(); Institution::truncate();

            return response()->json([
                'success' => true,
                'message' => 'All institutions and programs cleared successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to clear data: ' . $e->getMessage()
            ], 500);
        }
    }

    public function importGraduates(Request $request)
    {
        $request->validate([
            'file' => 'required|mimes:xlsx,xls|max:10240',
        ]);

        try {
            // For now, just return success
            // Later we'll add the actual import logic

            return response()->json([
                'success' => true,
                'message' => 'Graduates imported successfully! This is a test response.',
                'data' => [
                    'graduates' => 150,
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Import failed: ' . $e->getMessage()
            ], 500);
        }
    }

    public function clearGraduates()
    {
        try {
            // For now, just return success
            // Later we'll add: Graduate::truncate();

            return response()->json([
                'success' => true,
                'message' => 'All graduates cleared successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to clear data: ' . $e->getMessage()
            ], 500);
        }
    }
}
