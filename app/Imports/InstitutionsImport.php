<?php

namespace App\Imports;

use App\Models\Institution;
use App\Models\Program;
use Maatwebsite\Excel\Concerns\WithMultipleSheets;

class InstitutionsImport implements WithMultipleSheets
{
    public function sheets(): array
    {
        return [
            'PHEIs' => new SheetImport('private', 'PRIVATE'),
            'SUCs' => new SheetImport('public', 'SUC'),
            'LUCs' => new SheetImport('public', 'LUC'),
        ];
    }
}
