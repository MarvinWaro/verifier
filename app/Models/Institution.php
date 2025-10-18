<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Institution extends Model
{
    protected $fillable = [
        'code',
        'name',
        'type',
        'level',
        'sector',
    ];

    public function programs(): HasMany
    {
        return $this->hasMany(Program::class);
    }
}
