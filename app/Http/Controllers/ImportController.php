<?php

namespace App\Http\Controllers;

use App\Models\Graduate;
use App\Models\Institution;
use App\Models\Program;
use App\Models\ActivityLog;
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

    /**
     * Import institutions & programs (old module)
     */
    public function importInstitutions(Request $request)
    {
        $request->validate([
            'file' => 'required|mimes:xlsx,xls|max:10240',
        ]);

        try {
            DB::beginTransaction();

            $file        = $request->file('file');
            $spreadsheet = IOFactory::load($file->getPathname());
            $worksheet   = $spreadsheet->getActiveSheet();
            $rows        = $worksheet->toArray();

            // Skip header row
            array_shift($rows);

            $importedInstitutions = 0;
            $importedPrograms     = 0;
            $institutionCache     = [];

            foreach ($rows as $row) {
                // Skip empty rows
                if (empty($row[0])) {
                    continue;
                }

                $institutionCode = $row[0]; // Column A: Institution Code
                $heiName         = $row[1]; // Column B: HEI
                $programName     = $row[2]; // Column C: Programs
                $programType     = !empty($row[3]) ? $row[3] : null; // Column D: Program Type
                $major           = !empty($row[4]) ? $row[4] : null; // Column E: Major
                $permitNumber    = $row[5]; // Column F: Permit Number
                $type            = $row[6]; // Column G: Type (Private/SUCs/LUCs)

                // Cache per institution code
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
                    /** @var \App\Models\Institution $institution */
                    $institution = $institutionCache[$institutionCode];
                }

                Program::create([
                    'institution_id' => $institution->id,
                    'program_name'   => trim($programName),
                    'major'          => $major ? trim($major) : null,
                    'program_type'   => $programType,
                    'permit_number'  => trim($permitNumber),
                ]);

                $importedPrograms++;
            }

            DB::commit();

            // Log who imported
            ActivityLog::create([
                'user_id'      => $request->user()?->id,
                'action'       => 'institutions_import',
                'subject_type' => Institution::class,
                'subject_id'   => null,
                'summary'      => "Imported {$importedInstitutions} institutions and {$importedPrograms} programs from {$file->getClientOriginalName()}",
                'properties'   => [
                    'file'         => $file->getClientOriginalName(),
                    'institutions' => $importedInstitutions,
                    'programs'     => $importedPrograms,
                ],
            ]);

            return response()->json([
                'success' => true,
                'message' => "Import successful! Imported {$importedInstitutions} institutions and {$importedPrograms} programs.",
                'data'    => [
                    'institutions' => $importedInstitutions,
                    'programs'     => $importedPrograms,
                ],
            ]);
        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => 'Import failed: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function clearInstitutions(Request $request)
    {
        try {
            DB::beginTransaction();

            Program::truncate();
            Institution::truncate();

            DB::commit();

            ActivityLog::create([
                'user_id'      => $request->user()?->id,
                'action'       => 'institutions_clear',
                'subject_type' => Institution::class,
                'subject_id'   => null,
                'summary'      => 'Cleared all institutions and programs',
                'properties'   => [],
            ]);

            return response()->json([
                'success' => true,
                'message' => 'All institutions and programs cleared successfully',
            ]);
        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => 'Failed to clear data: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Import graduates from the SO masterlist Excel
     *
     * Upsert rule (SO-based):
     *  - Unique key: (hei_uii + so_number)
     *  - If NOT found => create
     *  - If found and data changed => update
     *  - If found and data exactly the same => unchanged (no duplicate)
     */
    public function importGraduates(Request $request)
    {
        $request->validate([
            'file' => 'required|mimes:xlsx,xls|max:10240',
        ]);

        try {
            DB::beginTransaction();

            $file        = $request->file('file');
            $spreadsheet = IOFactory::load($file->getPathname());
            $worksheet   = $spreadsheet->getActiveSheet();
            $rows        = $worksheet->toArray();

            // row 0: title, row 1: headers, row 2: subheaders => data starts at row index 3
            if (count($rows) <= 3) {
                return response()->json([
                    'success' => false,
                    'message' => 'Import failed: Excel file has no data rows.',
                ], 422);
            }

            // Drop first 3 header rows
            array_shift($rows);
            array_shift($rows);
            array_shift($rows);

            $createdGraduates  = 0;
            $updatedGraduates  = 0;
            $unchangedGraduates = 0;
            $blankRows         = 0;
            $invalidRows       = 0;

            $matchedPrograms   = 0;
            $unmatchedPrograms = 0;
            $errors            = [];

            foreach ($rows as $index => $row) {
                // Skip completely empty rows
                $isEmpty = true;
                foreach ($row as $value) {
                    if ($value !== null && trim((string) $value) !== '') {
                        $isEmpty = false;
                        break;
                    }
                }
                if ($isEmpty) {
                    $blankRows++;
                    continue;
                }

                // Excel row number (for error messages)
                $excelRow = $index + 4; // because we removed 3 header rows

                // Mapping based on sample file
                $heiUii       = trim((string) ($row[3] ?? ''));  // HEI UII
                $soNumber     = trim((string) ($row[4] ?? ''));  // SO Number
                $lastName     = trim((string) ($row[5] ?? ''));  // Last Name
                $firstName    = trim((string) ($row[6] ?? ''));  // First Name
                $middleName   = isset($row[7]) ? trim((string) $row[7]) : null;
                $extension    = isset($row[8]) ? trim((string) $row[8]) : null;
                $sexRaw       = isset($row[9]) ? trim((string) $row[9]) : null;
                $courseExcel  = trim((string) ($row[10] ?? '')); // Program
                $pscedCode    = isset($row[11]) ? trim((string) $row[11]) : null; // currently unused
                $majorExcel   = isset($row[12]) ? trim((string) $row[12]) : null;

                // Ended -> Date of Graduation (col 15 index)
                $gradDateCell = $row[15] ?? null;
                if ($gradDateCell instanceof \DateTimeInterface) {
                    $dateGraduated = $gradDateCell->format('Y-m-d');
                } else {
                    $dateGraduated = $gradDateCell ? trim((string) $gradDateCell) : null;
                }

                // Ended -> Academic Year (col 17 index)
                $academicYearCell = $row[17] ?? null;
                $academicYear     = $academicYearCell ? trim((string) $academicYearCell) : null;

                // Normalise sex to MALE / FEMALE or null
                $sex = null;
                if ($sexRaw !== null && $sexRaw !== '') {
                    $firstLetter = strtoupper(substr($sexRaw, 0, 1));
                    if ($firstLetter === 'M') {
                        $sex = 'MALE';
                    } elseif ($firstLetter === 'F') {
                        $sex = 'FEMALE';
                    }
                }

                // Minimal required fields
                if (
                    $heiUii === '' ||
                    $soNumber === '' ||
                    $lastName === '' ||
                    $firstName === '' ||
                    $courseExcel === ''
                ) {
                    $invalidRows++;
                    $errors[] = "Row {$excelRow}: Missing required fields (HEI UII / SO Number / Name / Program).";
                    continue;
                }

                // Try to find institution by UII (institution_code)
                $institution = Institution::where('institution_code', $heiUii)->first();

                // Try to find a matching program record (if institutions/programs are imported)
                $program = null;
                if ($institution) {
                    $programQuery = Program::where('institution_id', $institution->id)
                        ->where(function ($q) use ($courseExcel) {
                            $q->where('program_name', $courseExcel)
                                ->orWhere('program_name', 'LIKE', $courseExcel . '%')
                                ->orWhere('program_name', 'LIKE', '%' . $courseExcel . '%');
                        });

                    if ($majorExcel) {
                        $programQuery->orWhere('major', $majorExcel);
                    }

                    $program = $programQuery->first();
                }

                if ($program) {
                    $matchedPrograms++;
                } else {
                    $unmatchedPrograms++;
                    $errors[] = "Row {$excelRow}: Could not match program '{$courseExcel}'"
                        . ($majorExcel ? " (Major: {$majorExcel})" : '')
                        . " for HEI UII '{$heiUii}'.";
                }

                // Unique key for upsert: (hei_uii + so_number)
                $uniqueKeys = [
                    'hei_uii'   => $heiUii,
                    'so_number' => $soNumber,
                ];

                // Attributes to be stored/updated
                $attributes = [
                    'institution_id'    => $institution ? $institution->id : null,
                    'program_id'        => $program ? $program->id : null,
                    'student_id_number' => null, // not present in this template
                    'date_of_birth'     => null, // not present in this template
                    'last_name'         => $lastName,
                    'first_name'        => $firstName,
                    'middle_name'       => $middleName ?: null,
                    'extension_name'    => $extension ?: null,
                    'sex'               => $sex,
                    'date_graduated'    => $dateGraduated ?: '',
                    'course_from_excel' => $courseExcel,
                    'major_from_excel'  => $majorExcel ?: null,
                    'academic_year'     => $academicYear ?: null,
                ];

                // Eloquent upsert
                $graduate = Graduate::updateOrCreate($uniqueKeys, $attributes);

                if ($graduate->wasRecentlyCreated) {
                    $createdGraduates++;
                } elseif ($graduate->wasChanged()) {
                    $updatedGraduates++;
                } else {
                    // Record existed and all fields were already the same
                    $unchangedGraduates++;
                }
            }

            DB::commit();

            // Log who imported graduates (matches logs UI: graduates_import)
            ActivityLog::create([
                'user_id'      => $request->user()?->id,
                'action'       => 'graduates_import',
                'subject_type' => Graduate::class,
                'subject_id'   => null,
                'summary'      => "Imported graduates from {$file->getClientOriginalName()} "
                    . "(created: {$createdGraduates}, updated: {$updatedGraduates}, "
                    . "unchanged: {$unchangedGraduates}, matched programs: {$matchedPrograms}, "
                    . "unmatched programs: {$unmatchedPrograms})",
                'properties'   => [
                    'file'               => $file->getClientOriginalName(),
                    'created'            => $createdGraduates,
                    'updated'            => $updatedGraduates,
                    'unchanged'          => $unchangedGraduates,
                    'blank_rows'         => $blankRows,
                    'invalid_rows'       => $invalidRows,
                    'matched_programs'   => $matchedPrograms,
                    'unmatched_programs' => $unmatchedPrograms,
                    'errors'             => array_slice($errors, 0, 10),
                ],
            ]);

            $message = "Import completed. "
                . "Created: {$createdGraduates}, "
                . "Updated: {$updatedGraduates}, "
                . "Unchanged: {$unchangedGraduates}. "
                . "Matched programs: {$matchedPrograms}, "
                . "Unmatched programs: {$unmatchedPrograms}. "
                . "Blank rows skipped: {$blankRows}.";

            return response()->json([
                'success' => true,
                'message' => $message,
                'data'    => [
                    'created'            => $createdGraduates,
                    'updated'            => $updatedGraduates,
                    'unchanged'          => $unchangedGraduates,
                    'blank_rows'         => $blankRows,
                    'invalid_rows'       => $invalidRows,
                    'matched'            => $matchedPrograms,
                    'unmatched'          => $unmatchedPrograms,
                    'errors'             => array_slice($errors, 0, 10),
                ],
            ]);
        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => 'Import failed: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function clearGraduates(Request $request)
    {
        try {
            DB::beginTransaction();

            Graduate::truncate();

            DB::commit();

            ActivityLog::create([
                'user_id'      => $request->user()?->id,
                'action'       => 'graduates_clear',
                'subject_type' => Graduate::class,
                'subject_id'   => null,
                'summary'      => 'Cleared all graduates',
                'properties'   => [],
            ]);

            return response()->json([
                'success' => true,
                'message' => 'All graduates cleared successfully',
            ]);
        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => 'Failed to clear data: ' . $e->getMessage(),
            ], 500);
        }
    }
}
