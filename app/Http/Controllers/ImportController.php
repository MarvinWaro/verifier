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
        return Inertia::render('import-page/index');
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
            DB::beginTransaction();

            $file = $request->file('file');
            $spreadsheet = IOFactory::load($file->getPathname());
            $worksheet = $spreadsheet->getActiveSheet();
            $rows = $worksheet->toArray();

            // Skip header row
            array_shift($rows);

            $importedGraduates = 0;
            $matchedPrograms = 0;
            $unmatchedPrograms = 0;
            $errors = [];

            foreach ($rows as $rowIndex => $row) {
                // Skip empty rows
                if (empty($row[0]) && empty($row[3])) continue;

                // Based on your database screenshot, the correct column mapping is:
                $institutionCode = trim($row[0] ?? ''); // Column A: Institution Code (seems to be empty in your data)
                $studentIdNumber = trim($row[1] ?? ''); // Column B: Student ID Number
                $dateOfBirth = $row[2] ?? null; // Column C: Date of Birth
                $lastName = trim($row[3]); // Column D: Last Name
                $firstName = trim($row[4]); // Column E: First Name
                $middleName = !empty($row[5]) ? trim($row[5]) : null; // Column F: Middle Name
                $extensionName = !empty($row[6]) ? trim($row[6]) : null; // Column G: Extension
                $sex = !empty($row[7]) ? strtoupper(trim($row[7])) : null; // Column H: Sex
                $dateGraduated = $row[8]; // Column I: Date Graduated
                $courseFromExcel = trim($row[9]); // Column J: Course
                $majorFromExcel = !empty($row[10]) ? trim($row[10]) : null; // Column K: Major
                $soNumber = !empty($row[11]) ? trim($row[11]) : null; // Column L: SO Number
                $lrn = !empty($row[12]) ? trim($row[12]) : null; // Column M: LRN
                $philsysId = !empty($row[13]) ? trim($row[13]) : null; // Column N: PhilSys ID

                // Find institution - if institutionCode is empty, try to find by program
                $institution = null;
                $program = null;

                if (!empty($institutionCode)) {
                    $institution = Institution::where('institution_code', $institutionCode)->first();
                }

                // If we have an institution, try to match the program
                if ($institution) {
                    // Try exact match first
                    $program = Program::where('institution_id', $institution->id)
                        ->where('program_name', $courseFromExcel)
                        ->first();

                    // If no exact match, try with major
                    if (!$program && $majorFromExcel) {
                        $program = Program::where('institution_id', $institution->id)
                            ->where('program_name', $courseFromExcel)
                            ->where('major', $majorFromExcel)
                            ->first();
                    }

                    // If still no match, try fuzzy search
                    if (!$program) {
                        $program = Program::where('institution_id', $institution->id)
                            ->where(function($query) use ($courseFromExcel) {
                                $query->where('program_name', 'LIKE', '%' . $courseFromExcel . '%')
                                    ->orWhere('program_name', 'LIKE', $courseFromExcel . '%')
                                    ->orWhereRaw('REPLACE(REPLACE(program_name, " ", ""), "-", "") LIKE ?',
                                        ['%' . str_replace([' ', '-'], '', $courseFromExcel) . '%']);
                            })
                            ->first();
                    }
                } else {
                    // If no institution code, try to find institution by program name
                    $program = Program::whereHas('institution')
                        ->where('program_name', $courseFromExcel)
                        ->first();

                    if ($program) {
                        $institution = $program->institution;
                    }
                }

                if ($program) {
                    $matchedPrograms++;
                } else {
                    $unmatchedPrograms++;
                    $errors[] = "Row " . ($rowIndex + 2) . ": Could not match program '{$courseFromExcel}'" .
                            ($majorFromExcel ? " - Major: {$majorFromExcel}" : "") .
                            " for institution code '{$institutionCode}'";
                }

                // Create graduate record
                \App\Models\Graduate::create([
                    'institution_id' => $institution ? $institution->id : null,
                    'program_id' => $program ? $program->id : null,
                    'student_id_number' => $studentIdNumber,
                    'date_of_birth' => $dateOfBirth,
                    'last_name' => $lastName,
                    'first_name' => $firstName,
                    'middle_name' => $middleName,
                    'extension_name' => $extensionName,
                    'sex' => $sex,
                    'date_graduated' => $dateGraduated,
                    'course_from_excel' => $courseFromExcel,
                    'major_from_excel' => $majorFromExcel,
                    'so_number' => $soNumber,
                    'lrn' => $lrn,
                    'philsys_id' => $philsysId,
                ]);

                $importedGraduates++;
            }

            DB::commit();

            $message = "Import successful! Imported {$importedGraduates} graduates. ";
            $message .= "Matched programs: {$matchedPrograms}. ";
            if ($unmatchedPrograms > 0) {
                $message .= "Unmatched programs: {$unmatchedPrograms}. ";
            }

            return response()->json([
                'success' => true,
                'message' => $message,
                'data' => [
                    'graduates' => $importedGraduates,
                    'matched' => $matchedPrograms,
                    'unmatched' => $unmatchedPrograms,
                    'errors' => array_slice($errors, 0, 10), // Return first 10 errors
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

    public function clearGraduates()
    {
        try {
            DB::beginTransaction();

            \App\Models\Graduate::truncate();

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'All graduates cleared successfully'
            ]);
        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => 'Failed to clear data: ' . $e->getMessage()
            ], 500);
        }
    }
}
