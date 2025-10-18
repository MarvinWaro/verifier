<?php

namespace App\Http\Controllers;

use App\Models\Institution;
use App\Models\Program;
use App\Imports\InstitutionsImport;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;

class InstitutionController extends Controller
{
    public function index()
    {
        // Fetch all data with programs
        $institutions = Institution::with('programs')->get();

        // Transform data for display in table
        $tableData = [];

        foreach ($institutions as $institution) {
            foreach ($institution->programs as $program) {
                $tableData[] = [
                    'id' => $program->id,
                    'name' => $institution->name,
                    'code' => $institution->code,
                    'program' => $program->name,
                    'major' => $program->major,
                    'permitNumber' => $program->permit_number,
                    'yearIssued' => $program->year_issued,
                    'status' => $program->status,
                ];
            }
        }

        return Inertia::render('institution/index', [
            'institutions' => $tableData,
            'stats' => [
                'totalInstitutions' => Institution::count(),
                'totalPrograms' => Program::count(),
                'lastImport' => Institution::latest()->first()?->created_at?->format('M d, Y h:i A'),
            ],
        ]);
    }

    public function import(Request $request)
    {
        \Log::info('=== IMPORT STARTED ===');
        \Log::info('Request received');
        \Log::info('Has file: ' . ($request->hasFile('file') ? 'YES' : 'NO'));

        try {
            $request->validate([
                'file' => 'required|mimes:xlsx,xls,csv|max:10240',
            ]);

            \Log::info('Validation passed');
            \Log::info('Starting Excel import...');

            Excel::import(new InstitutionsImport, $request->file('file'));

            \Log::info('Excel import completed');

            return redirect()->route('institutions.index')
                ->with('success', 'Data imported successfully!');

        } catch (\Exception $e) {
            \Log::error('ERROR: ' . $e->getMessage());
            \Log::error('File: ' . $e->getFile());
            \Log::error('Line: ' . $e->getLine());

            return redirect()->route('institutions.index')
                ->with('error', $e->getMessage());
        }
    }
}
