<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Graduate extends Model
{
    protected $fillable = [
        'institution_id',
        'program_id',

        'hei_uii',
        'so_number',

        'student_id_number',
        'date_of_birth',

        'last_name',
        'first_name',
        'middle_name',
        'extension_name',
        'sex',

        'date_graduated',
        'academic_year',

        'course_from_excel',
        'major_from_excel',
        'psced_code',
    ];

    public function institution(): BelongsTo
    {
        return $this->belongsTo(Institution::class);
    }

    public function program(): BelongsTo
    {
        return $this->belongsTo(Program::class);
    }
}
