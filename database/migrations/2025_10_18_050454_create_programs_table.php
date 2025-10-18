<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('programs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('institution_id')->constrained()->cascadeOnDelete();
            $table->string('name'); // Program name (e.g., "BACHELOR OF SCIENCE IN COMPUTER SCIENCE")
            $table->string('major')->nullable(); // Major/Specialization
            $table->string('permit_number'); // COPC-2025-075 or GR048-2011
            $table->enum('permit_type', ['COPC', 'GR']); // Auto-detected from permit_number
            $table->string('year_issued')->nullable(); // Year the permit was issued
            $table->string('status')->nullable(); // Status column from Excel
            $table->boolean('is_board_course')->default(false); // Board course or not
            $table->timestamps();

            $table->index('permit_number');
            $table->index('permit_type');
            $table->index('name');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('programs');
    }
};
