<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Program extends Model
{
    protected $fillable = [
        'institution_id',
        'name',
        'major',
        'permit_number',
        'permit_type',
        'year_issued',
        'status',
        'is_board_course',
    ];

    protected $casts = [
        'is_board_course' => 'boolean',
    ];

    public function institution(): BelongsTo
    {
        return $this->belongsTo(Institution::class);
    }
}
