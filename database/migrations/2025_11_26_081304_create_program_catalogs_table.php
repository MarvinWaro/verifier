<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('program_catalogs', function (Blueprint $table) {
            $table->id();

            // Original name from CHED portal (what you show to users)
            $table->string('program_name');

            // Normalized for uniqueness (e.g. uppercase, trimmed)
            $table->string('normalized_name')->unique();

            // Board / Non-Board / Unknown (default Unknown until admin decides)
            $table->enum('program_type', ['Board', 'Non-Board', 'Unknown'])
                ->default('Unknown');

            // Optional notes/remarks for admin
            $table->string('notes')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('program_catalogs');
    }
};
