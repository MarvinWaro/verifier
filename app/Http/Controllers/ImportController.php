<?php

namespace App\Http\Controllers;

use App\Models\Institution;
use App\Models\Program;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use PhpOffice\PhpSpreadsheet\IOFactory;

class ImportController extends Controller
{
    public function index()
    {
        return Inertia::render('import/index');
    }

    public function importInstitutions(Request $request)
    {
        $request->validate([
            'file' => 'required|mimes:xlsx,xls|max:10240',
        ]);

        try {
            DB::beginTransaction();

            $file = $request->file('file');
            $spreadsheet = IOFactory::load($file->getPathname());
            $worksheet = $spreadsheet->getActiveSheet();
            $rows = $worksheet->toArray();

            // Skip header row
            array_shift($rows);

            $importedInstitutions = 0;
            $importedPrograms = 0;
            $institutionCache = [];

            foreach ($rows as $row) {
                // Skip empty rows
                if (empty($row[0])) continue;

                $institutionCode = $row[0]; // Column A: Institution Code
                $heiName = $row[1]; // Column B: HEI
                $programName = $row[2]; // Column C: Programs
                $programType = !empty($row[3]) ? $row[3] : null; // Column D: Program Type (Board/Non-Board)
                $major = !empty($row[4]) ? $row[4] : null; // Column E: Major
                $permitNumber = $row[5]; // Column F: Permit Number
                $type = $row[6]; // Column G: Type (Private/SUCs/LUCs)

                // Check if institution exists in cache or database
                if (!isset($institutionCache[$institutionCode])) {
                    $institution = Institution::firstOrCreate(
                        ['institution_code' => $institutionCode],
                        [
                            'name' => $heiName,
                            'type' => $type,
                        ]
                    );

                    if ($institution->wasRecentlyCreated) {
                        $importedInstitutions++;
                    }

                    $institutionCache[$institutionCode] = $institution;
                } else {
                    $institution = $institutionCache[$institutionCode];
                }

                // Create program
                Program::create([
                    'institution_id' => $institution->id,
                    'program_name' => trim($programName),
                    'major' => $major ? trim($major) : null,
                    'program_type' => $programType,
                    'permit_number' => trim($permitNumber),
                ]);

                $importedPrograms++;
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => "Import successful! Imported {$importedInstitutions} institutions and {$importedPrograms} programs.",
                'data' => [
                    'institutions' => $importedInstitutions,
                    'programs' => $importedPrograms,
                ]
            ]);

        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => 'Import failed: ' . $e->getMessage()
            ], 500);
        }
    }

    public function clearInstitutions()
    {
        try {
            DB::beginTransaction();

            Program::truncate();
            Institution::truncate();

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'All institutions and programs cleared successfully'
            ]);
        } catch (\Exception $e) {
            DB::rollBack();

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
            // Will implement this on Tuesday
            return response()->json([
                'success' => true,
                'message' => 'Graduate import coming soon!',
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
            // Will implement this on Tuesday
            return response()->json([
                'success' => true,
                'message' => 'Graduate clear coming soon!'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to clear data: ' . $e->getMessage()
            ], 500);
        }
    }
}
