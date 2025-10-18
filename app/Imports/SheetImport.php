<?php

namespace App\Imports;

use App\Models\Institution;
use App\Models\Program;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;

class SheetImport implements ToCollection, WithHeadingRow
{
    protected $type; // 'public' or 'private'
    protected $sector; // 'PRIVATE', 'SUC', or 'LUC'

    public function __construct(string $type, string $sector)
    {
        $this->type = $type;
        $this->sector = $sector;
    }

    public function collection(Collection $rows)
    {
        $currentInstitution = null;
        $currentInstitutionName = null;
        $level = null;

        foreach ($rows as $index => $row) {
            // Skip header rows and empty rows
            if ($this->isHeaderRow($row) || $this->isEmptyRow($row)) {
                // Check if this is a level indicator row
                if (isset($row['level']) && !empty($row['level'])) {
                    $level = $row['level'];
                }
                continue;
            }

            // Get institution name (handle merged cells - institution name repeats or is in column A)
            $institutionName = $this->getInstitutionName($row, $currentInstitutionName);

            if ($institutionName && $institutionName !== $currentInstitutionName) {
                // New institution found
                $currentInstitutionName = $institutionName;
                $currentInstitution = $this->findOrCreateInstitution($institutionName, $level);
            }

            // Skip if no valid institution
            if (!$currentInstitution) {
                continue;
            }

            // Create program
            $this->createProgram($currentInstitution, $row);
        }
    }

    protected function isHeaderRow($row): bool
    {
        $firstCell = strtolower(trim($row[array_key_first($row->toArray())] ?? ''));
        return in_array($firstCell, ['row labels', 'institution', 'level', 'sector']);
    }

    protected function isEmptyRow($row): bool
    {
        return $row->filter(fn($cell) => !empty($cell))->isEmpty();
    }

    protected function getInstitutionName($row, $currentName): ?string
    {
        // Try to get institution name from different possible column names
        $possibleKeys = ['row_labels', 'institution', 'institution_name', 0];

        foreach ($possibleKeys as $key) {
            if (isset($row[$key]) && !empty(trim($row[$key]))) {
                $name = trim($row[$key]);
                // Skip if it's a program name (usually starts with "BACHELOR" or "DIPLOMA")
                if (!$this->isProgramName($name)) {
                    return $name;
                }
            }
        }

        // If no institution name found, use the current one (merged cell scenario)
        return $currentName;
    }

    protected function isProgramName($text): bool
    {
        $text = strtoupper($text);
        $programIndicators = ['BACHELOR', 'DIPLOMA', 'MASTER', 'DOCTOR', 'ASSOCIATE'];

        foreach ($programIndicators as $indicator) {
            if (str_starts_with($text, $indicator)) {
                return true;
            }
        }

        return false;
    }

    protected function findOrCreateInstitution($name, $level): Institution
    {
        // Generate a simple code if not exists
        $code = $this->generateInstitutionCode($name);

        return Institution::firstOrCreate(
            ['name' => $name, 'sector' => $this->sector],
            [
                'code' => $code,
                'type' => $this->type,
                'level' => $level,
            ]
        );
    }

    protected function generateInstitutionCode($name): string
    {
        // Create a simple code from the institution name
        $words = explode(' ', $name);
        $code = '';

        foreach (array_slice($words, 0, 3) as $word) {
            $code .= substr($word, 0, 1);
        }

        // Add random number to ensure uniqueness
        return strtoupper($code) . '-' . str_pad(random_int(1, 9999), 4, '0', STR_PAD_LEFT);
    }

    protected function createProgram(Institution $institution, $row)
    {
        // Get program name (column B or 'major')
        $programName = trim($row['major'] ?? $row[1] ?? '');

        if (empty($programName) || $this->isProgramName($programName) === false) {
            // If programName is empty, it might be in the first column
            $programName = trim($row[0] ?? '');
        }

        // Get major/specialization
        $major = trim($row[1] ?? $row['specialization'] ?? '');

        // Get permit number
        $permitNumber = trim($row['permit_number'] ?? $row[2] ?? '');

        // Get year issued
        $yearIssued = trim($row['year_issued'] ?? $row[3] ?? '');

        // Get status
        $status = trim($row['status'] ?? $row[4] ?? '');

        // Skip if no program name or permit number
        if (empty($programName) || empty($permitNumber)) {
            return;
        }

        // Determine permit type (COPC or GR)
        $permitType = $this->detectPermitType($permitNumber);

        // Check if program already exists
        $existingProgram = Program::where('institution_id', $institution->id)
            ->where('permit_number', $permitNumber)
            ->first();

        if ($existingProgram) {
            return; // Skip duplicates
        }

        // Create the program
        Program::create([
            'institution_id' => $institution->id,
            'name' => $programName,
            'major' => !empty($major) ? $major : null,
            'permit_number' => $permitNumber,
            'permit_type' => $permitType,
            'year_issued' => $yearIssued,
            'status' => $status,
            'is_board_course' => false, // Default, can be updated later
        ]);
    }

    protected function detectPermitType($permitNumber): string
    {
        $upper = strtoupper($permitNumber);

        if (str_contains($upper, 'COPC')) {
            return 'COPC';
        } elseif (str_contains($upper, 'GR')) {
            return 'GR';
        }

        // Default based on sector
        return $this->type === 'public' ? 'COPC' : 'GR';
    }

    public function headingRow(): int
    {
        return 5; // Adjust based on your Excel structure
    }
}
