<?php

namespace App\Http\Controllers;

use App\Models\Institution;
use App\Models\Program;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use PhpOffice\PhpSpreadsheet\IOFactory;

use PhpOffice\PhpSpreadsheet\Shared\Date as ExcelDate;

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

            // SOAIS structure:
            // Row 1: title
            // Row 2: main headers
            // Row 3: sub-headers (semester, academic year, date grad...)
            array_shift($rows); // remove row 1
            array_shift($rows); // remove row 2
            array_shift($rows); // remove row 3

            $importedGraduates = 0;
            $skippedRows = 0;

            foreach ($rows as $rowIndex => $row) {
                // Skip rows with no HEI UII and no Last Name
                if (empty($row[3]) && empty($row[5])) {
                    $skippedRows++;
                    continue;
                }

                $heiUii        = trim((string)($row[3] ?? ''));  // HEI UII
                $soNumber      = trim((string)($row[4] ?? ''));  // Special Order Number
                $lastName      = trim((string)($row[5] ?? ''));  // Last Name
                $firstName     = trim((string)($row[6] ?? ''));  // First Name
                $middleName    = trim((string)($row[7] ?? ''));  // Middle Name
                $extensionName = trim((string)($row[8] ?? ''));  // Extension Name
                $sexRaw        = strtoupper(trim((string)($row[9] ?? ''))); // Sex

                $programName   = trim((string)($row[10] ?? '')); // Program
                $pscedCode     = trim((string)($row[11] ?? '')); // PSCED Code
                $majorName     = trim((string)($row[12] ?? '')); // Major

                // Date of Graduation
                $dateGraduatedValue = $row[15] ?? null;
                $dateGraduated = null;

                if ($dateGraduatedValue instanceof \DateTimeInterface) {
                    $dateGraduated = $dateGraduatedValue->format('Y-m-d');
                } elseif (is_numeric($dateGraduatedValue)) {
                    // Excel numeric date
                    $dateGraduated = ExcelDate::excelToDateTimeObject($dateGraduatedValue)->format('Y-m-d');
                } elseif (!empty($dateGraduatedValue)) {
                    $dateGraduated = date('Y-m-d', strtotime($dateGraduatedValue));
                }

                // Academic Year – prefer "graduation" AY on col 17, fallback to col 14
                $academicYear = trim((string)($row[17] ?? ''));
                if ($academicYear === '' && !empty($row[14])) {
                    $academicYear = trim((string)$row[14]);
                }

                // Normalize sex to MALE/FEMALE
                $sex = null;
                if ($sexRaw === 'MALE' || $sexRaw === 'FEMALE') {
                    $sex = $sexRaw;
                } elseif ($sexRaw === 'M') {
                    $sex = 'MALE';
                } elseif ($sexRaw === 'F') {
                    $sex = 'FEMALE';
                }

                \App\Models\Graduate::create([
                    'institution_id'    => null,  // Institutions/programs now coming from Portal API
                    'program_id'        => null,

                    'hei_uii'           => $heiUii,
                    'so_number'         => $soNumber,

                    'student_id_number' => null,  // not in this SOAIS template
                    'date_of_birth'     => null,  // not in this SOAIS template

                    'last_name'         => $lastName,
                    'first_name'        => $firstName,
                    'middle_name'       => $middleName ?: null,
                    'extension_name'    => $extensionName ?: null,
                    'sex'               => $sex,

                    'date_graduated'    => $dateGraduated,
                    'academic_year'     => $academicYear ?: null,

                    'course_from_excel' => $programName,
                    'major_from_excel'  => $majorName ?: null,
                    'psced_code'        => $pscedCode ?: null,
                ]);

                $importedGraduates++;
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => "Import successful! Imported {$importedGraduates} graduates. Skipped {$skippedRows} blank rows.",
                'data' => [
                    'graduates' => $importedGraduates,
                    'skipped'   => $skippedRows,
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

    public function clearGraduates()
    {
        try {
            DB::beginTransaction();

            \App\Models\Graduate::truncate();

            DB::commit();

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
