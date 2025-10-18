<?php

namespace App\Imports;

use App\Models\Institution;
use App\Models\Program;
use Maatwebsite\Excel\Concerns\ToCollection;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Log;

class SheetImport implements ToCollection
{
    protected $type;
    protected $sector;

    public function __construct(string $type, string $sector)
    {
        $this->type = $type;
        $this->sector = $sector;
    }

    public function collection(Collection $rows)
    {
        Log::info("========== Processing {$this->sector} sheet ==========");

        $currentInstitutionName = null;
        $currentInstitution = null;
        $level = null;
        $processedCount = 0;

        foreach ($rows as $index => $row) {
            // Skip first few header rows
            if ($index < 4) {
                $firstCell = trim($row[0] ?? '');
                if (stripos($firstCell, 'Level') !== false && isset($row[1])) {
                    $level = trim($row[1]);
                }
                continue;
            }

            // Get columns
            $col0 = trim($row[0] ?? '');
            $col1 = trim($row[1] ?? '');
            $col2 = trim($row[2] ?? '');
            $col3 = trim($row[3] ?? '');
            $col4 = trim($row[4] ?? '');

            // Debug: Log the row
            Log::info("Row {$index}: [{$col0}] [{$col1}] [{$col2}] [{$col3}]");

            // Skip completely empty rows
            if (empty($col0) && empty($col1) && empty($col2) && empty($col3)) {
                Log::info("  → Skipping empty row");
                continue;
            }

            // Check for institution name (not empty, not a program name)
            if (!empty($col0) && !$this->isProgramName($col0)) {
                $currentInstitutionName = $col0;
                $currentInstitution = $this->findOrCreateInstitution($currentInstitutionName, $level);
                Log::info("  → Found INSTITUTION: {$currentInstitutionName}");
            }

            // Must have a current institution
            if (!$currentInstitution) {
                Log::info("  → No current institution, skipping");
                continue;
            }

            // Determine if this row has program data
            $programName = null;
            $major = null;
            $permitNumber = null;

            // Check where the program name is
            if (!empty($col1) && $this->isProgramName($col1)) {
                // Program in col1 (merged cell scenario OR institution in same row)
                $programName = $col1;

                // Check if col2 is permit or major
                if ($this->looksLikePermit($col2)) {
                    // col2 = permit, no major
                    $major = null;
                    $permitNumber = $col2;
                } else {
                    // col2 = major (or empty), permit in col3
                    $major = !empty($col2) ? $col2 : null;
                    $permitNumber = $col3;
                }

                Log::info("  → Found PROGRAM in col1: {$programName} | Major: " . ($major ?: 'none') . " | Permit: {$permitNumber}");
            }
            elseif (!empty($col0) && $this->isProgramName($col0)) {
                // Program in col0 (no merged cells)
                $programName = $col0;

                if ($this->looksLikePermit($col1)) {
                    $major = null;
                    $permitNumber = $col1;
                } else {
                    $major = !empty($col1) ? $col1 : null;
                    $permitNumber = $col2;
                }

                Log::info("  → Found PROGRAM in col0: {$programName} | Major: " . ($major ?: 'none') . " | Permit: {$permitNumber}");
            }

            // Create program if we have required data
            if ($programName && $permitNumber) {
                $yearIssued = $col4; // Assuming year is in col4 or after permit
                $status = $row[5] ?? '';

                $created = $this->createProgram($currentInstitution, $programName, $major, $permitNumber, $yearIssued, $status);
                if ($created) {
                    $processedCount++;
                }
            } else {
                Log::warning("  → Missing data - Program: '{$programName}', Permit: '{$permitNumber}'");
            }
        }

        Log::info("========== COMPLETED: {$processedCount} programs for {$this->sector} ==========");
    }

    protected function isProgramName($text): bool
    {
        $text = strtoupper(trim($text));
        $indicators = ['BACHELOR', 'DIPLOMA', 'MASTER', 'DOCTOR', 'ASSOCIATE'];

        foreach ($indicators as $indicator) {
            if (str_starts_with($text, $indicator)) {
                return true;
            }
        }
        return false;
    }

    protected function looksLikePermit($text): bool
    {
        $text = strtoupper(trim($text));
        // Must contain one of these patterns
        return preg_match('/(GR|COPC|BR|RRPA)[\s-]?\d/', $text) > 0;
    }

    protected function findOrCreateInstitution($name, $level): Institution
    {
        $existing = Institution::where('name', $name)->where('sector', $this->sector)->first();

        if ($existing) {
            return $existing;
        }

        $code = 'TEMP-' . str_pad(Institution::count() + 1, 4, '0', STR_PAD_LEFT);

        return Institution::create([
            'code' => $code,
            'name' => $name,
            'type' => $this->type,
            'level' => $level,
            'sector' => $this->sector,
        ]);
    }

    protected function createProgram(Institution $institution, $programName, $major, $permitNumber, $yearIssued, $status): bool
    {
        $permitNumber = trim($permitNumber);
        $programName = trim($programName);

        if (empty($programName) || empty($permitNumber)) {
            return false;
        }

        // Create unique key to check duplicates
        $uniqueKey = $institution->id . '|' . $programName . '|' . ($major ?: 'NOMAJOR') . '|' . $permitNumber;

        // Check if already exists with same program + major + permit combination
        $exists = Program::where('institution_id', $institution->id)
            ->where('name', $programName)
            ->where('major', $major)
            ->where('permit_number', $permitNumber)
            ->first();

        if ($exists) {
            Log::info("      ⏭ Duplicate - already exists");
            return false;
        }

        $permitType = $this->detectPermitType($permitNumber);

        Program::create([
            'institution_id' => $institution->id,
            'name' => $programName,
            'major' => $major,
            'permit_number' => $permitNumber,
            'permit_type' => $permitType,
            'year_issued' => trim($yearIssued),
            'status' => trim($status),
            'is_board_course' => false,
        ]);

        $majorDisplay = $major ? " | Major: {$major}" : " | (no major)";
        Log::info("      ✓ CREATED{$majorDisplay}");
        return true;
    }

    protected function detectPermitType($permitNumber): string
    {
        $upper = strtoupper($permitNumber);

        if (str_contains($upper, 'COPC')) {
            return 'COPC';
        } elseif (str_contains($upper, 'GR')) {
            return 'GR';
        }

        return $this->type === 'public' ? 'COPC' : 'GR';
    }
}
